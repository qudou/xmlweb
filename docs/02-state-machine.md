# 状态机

由于 xmlweb 是一个基于状态机理论设计的 web 服务器框架，所以在这一章需要讲清楚 xmlweb 中与状态机相关的节点与数据流的概念。在此后的几章内容都是围绕这两个概念进行阐述的。

## 状态机节点

状态机节点可以是任何侦听了 `enter` 事件的组件对象，可以实例化为状态机节点的组件称为状态机的节点组件，简称节点组件。如下面的组件 Node 是一个状态机的节点组件：

```js
Node: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => console.log("hello, world"));
    }
}
```

另外，像 xmlweb 中内置的组件 Router、Rewrite 以及 AddHeaders 等都包含有事件 `enter` 的侦听器，它们都可以实例化为状态机的节点使用。此外，状态机节点组件还可以是由组件 Flow 定义的组件，组件 Flow 内部也包含事件 `enter` 的侦听器，所以它也是一个节点组件。不过它比较特殊，它可以与子节点组件组合成一个状态机。请看下面的示例：

```xml
<i:Flow xmlns:i='//xmlweb'>
    <i:Router url='/index.html'/>
    <i:Static id='static'/>
</i:Flow>
```

与组件 Flow 类似，组件 HTTP 也是节点组件并且它可以与子节点组件组合成一个状态机。在一个 web 服务应用中，Http 节点只能只能有一个，且只能作为的顶层节点使用。如下面的示例所示：

```xml
<i:HTTP listen="80" xmlns:i='//xmlweb'>
    <i:Router url='/index.html'/>
    <i:Static id='static'/>
</i:HTTP>
```

组件 HTTP 与组件 Flow 均位于命名空间 `//xmlweb` 中，组件 HTTP 包含一个静态参数 `listen`，此参数用于指明 web 应用服务的端口号，参数 `listen` 的默认值是 `8080`。

状态机节点可分为两类，一类是不再跳转至其它节点的节点，此类节点对应状态机理论中的接受状态集；另一类是可跳转至其它节点的节点，此类节点会派发事件 `next` 或者事件 `reject`。

## 数据流

数据流是一个普通对象，所谓普通对象指的是使用 `{}` 或 `new Object` 创建的对象。数据流由 HTTP 组件对象在接收到用户的请求时生成。在初始状态，它主要包含了如下的内容：

- req：请求对象(request)
- res：响应对象(response)
- ptr：状态机内部使用的指针数组
- url：与 req.url 一致

在数据流经的各个节点，你不应该对前三个对象做任何的改动。

默认情况下，状态机的数据流由事件 `next` 驱动并从上往下流动，这是将状态机组件取名为 Flow 的直接原因。如下面的示例所示：

```xml
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router id='router' url='/:id.html'/>
    <Index id='index'/>
    <i:Static id='static'/>
</i:HTTP>
```

此 web 服务接收所有的具有 URL 模式 `/:id.html` 的 GET 请求。当有匹配的请求时，数据流先进入组件对象 router。在组件对象 router 完成 URL 解码后会派发事件 `next`，然后数据流进入组件对象 index。组件对象 index 完成数据的相关处理后派发事件 `next`，于是数据流最终达到组件对象 static。为了更清楚地认识这个过程，我们来看看组件 Index 的具体构造。

```js
Index: {
    xml: "<h1 id='index'></h1>",
    fun: function (sys, items, opts) {
        let fs = require("fs");
        this.on("enter", (e, d) => {
            sys.index.text("hello, $(d.args.id)");
            let path = "static" + d.req.url;
            fs.writeFileSync(path, this.serialize(), "utf8");
            this.trigger("next", d));
        });
    }
}
```

组件 Index 的函数项部分主要根据传输来的数据生成响应页面并将页面内容写入目录 `static`，然后交给静态服务器做最后的处理。注意，当输入与模式串 `/:id.html` 不匹配的 URL 时，你将得到 xmlweb 内置的 404 页面。

## 数据流的跳转

相对于默认的垂直数据流单向流动，状态机允许在任一时刻跳转到任意的已命名的组件节点，下面我们通过一个示例来说明：

```xml
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/:id.html'/>
    <Filter id='filter'/>
    <Index id='index'/>
    <i:Static id='static'/>
</i:HTTP>
```

该状态机比前面多了一个 Filter 节点，此节点用于过滤 `id` 值为 `index` 的请求，也就是 url 为 `/index.html` 的请求。对于这种请求，数据流将不再进入节点 `index`，而是直接进入节点 `static`。下面给出组件 Filter 的具体实现：

```js
Filter: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => {
            let bool = d.args.id == "index";
            this.trigger("next", [d, bool ? null: "static"]);
        });
    }
}
```

正如组件 Filter 的函数项内容所指出的，要完成数据流的跳转，需要在派发 `next` 事件时，在系统函数 `trigger` 的参数部分提供一个目的状态机节点名。

最后需要强调的是，数据流只能跳转至下一兄弟节点或者跳转到已命名的组件节点，而无法直接跳转到未命名的其它类型的节点。上述的数据流跳转是往前的跳转，然而数据流还可以往后跳转，或者直接跳转到组件自身，但一定要注意给定合适的终止条件以避免陷入死循环。

## 状态机停机

### 由事件 `next` 导致的停机

在 xmlweb 中，状态机的停机指的是结束当前的状态机数据的流动，返回到上一层状态机。状态机的停机有两种情况，一种是由事件 `next` 导致的停机，请看下面的一个示例：

```xml
<i:HTTP id='http' xmlns:i='//xmlweb'>
    <i:Router url='/:id.html'/>
    <Index id='index'/>
    <i:Static id='static'/>
</i:HTTP>
```

该示例中，组件 Index 是一个由组件 Flow 定义的子状态机组件，下面是它的视图项部分：

```xml
<i:Flow xmlns:i='//xmlweb'>
    <SubIndex id='subindex'/>
</i:Flow>
```

其中的 SubIndex 组件的具体内容如下所示：

```js
SubIndex: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => this.trigger("next", d));
    }
}
```

组件 SubIndex 的 `enter` 事件的侦听器直接返回了 `next` 事件。然而节点 `subindex` 不存在后继节点，所以该事件的派发将导致该状态机停机，也就是直接返回到上一层级的 http 组件节点。当数据流到达 http 组件节点后，数据流会向 index 组件节点的后继节点流动。也就是说，数据流最终会进入 static 组件节点。

### 由事件 `reject` 导致的停机

另一种停机由事件 `reject` 触发，该事件的派发将直接导致状态机停机，现修改组件 SubIndex 如下：

```js
SubIndex: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => this.trigger("reject", d));
    }
}
```

在示例中，该组件与上述的由事件 `next` 导致的停机效果是一样的，但如果子状态机是下面这样子：

```xml
<i:Flow xmlns:i='//xmlweb'>
    <SubIndex id='subindex'/>
    <i:Static id='static'/>
</i:Flow>
```

那么，组件对象 subindex 的 `next` 事件的派发将不会导致停机，因为组件对象 subindex 有一个后继组件节点 `static`，数据流最终会进入组件节点 `static`。而事件 `reject` 的派发则不同，无论组件对象 subindex 是否拥有后继节点，都会导致当前状态机的停机发生。

### 停机后的数据流

如前所述，当前状态机停机后，数据流将返回上一层级的状态机。如果不给派发事件的系统函数 `trigger` 提供目的节点名，那么数据流将试图跳转到当前状态机节点的后继节点。否则，数据流会试图跳转到上层状态机的同名节点。请看下面的示例：

```js
SubIndex: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => this.trigger("reject", [d, "dynamic"]));
    }
}
```

该组件内部的侦听器在派发 `reject` 事件时，还携带目的节点名 `dynamic`。但当前状态机的上一层状态机并不包含名为 `dynamic` 的节点，所以最终数据流还是会进入 `static` 节点。

最后需要说明的是，一个状态机停机事件发生并且数据流到达上一层状态机后，只要条件满足，上一层状态机还是会停机，这样就形成了停机事件的冒泡现象。

### HTTP 组件节点的停机

前面说过，组件 HTTP 是一个比较特殊的状态机节点组件，它只能作为的顶层节点组件使用。如果在 HTTP 节点捕获到停机事件，那么 HTTP 节点将返回 xmlweb 返回内置的 404 页面。下面的一个简单的示例演示了这一点：

```xml
<i:HTTP listen='8080' xmlns:i='//xmlweb'>
    <i:Static id='static'/>
</i:HTTP>
```

注意，此示例中的停机事件由静态服务器 static 接收到不存在的文件请求时派发，并由 HTTP 组件节点捕获。