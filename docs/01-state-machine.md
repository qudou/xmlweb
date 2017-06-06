# 状态机

由于 xmlweb 是一个基于状态机理论设计的 web 服务器框架，所以在这一章需要讲清楚 xmlweb 中与状态机相关的节点与数据流的概念。在此后的几章内容都是围绕这两个概念进行阐述。

## 状态机节点

状态机节点可以是任何侦听了 `enter` 事件的组件对象。可以实例化为状态机节点的组件称为状态机的节点组件，简称节点组件。如下面的组件 Hello 是一个状态机的节点组件：

```js
// 01-01
Hello: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => {
            d.res.setHeader("Content-Type", "text/html");
            d.res.end("hello, world");
        });
    }
}
```

另外，像 xmlweb 中内置的 Router、Rewrite 以及 Redirect 等组件都包含有事件 `enter` 的侦听器，它们都可以实例化为状态机节点使用。下面是一个 Router 节点组件的使用示例：

```xml
<!-- 01-01 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/index.html'/>
    <Hello id='hello'/>
</i:HTTP>
```

你可以输入地址 `http://localhost:8080/index.html` 来测试此示例，该请求的返回值是一个值为 `hello, world` 的字符串。

状态机节点组件还可以是由组件 Flow 定义的组件，组件 Flow 内部也包含事件 `enter` 的侦听器，所以它也是一个节点组件。不过它比较特殊，它可以与子节点组件组合成一个状态机。如下面使用 Flow 组件定义了一个状态机：

```xml
<!-- 01-02 -->
<i:Flow xmlns:i='//xmlweb'>
    <i:Router url='/index.html'/>
    <Hello id='hello'/>
</i:Flow>
```

该状态机可以作为由 HTTP 组件定义的状态机的子状态机使用，如下面给的示例所示：

```xml
<!-- 01-02 -->
<i:HTTP xmlns:i='//xmlweb'>
    <Machine id='machine'/>
</i:HTTP>
```

此示例组件 Machine 即上面的由组件 Flow 定义的子状态机。你同样可以输入地址 `http://localhost:8080/index.html` 来测试此示例。

与组件 Flow 类似，组件 HTTP 也是节点组件并且它可以与子节点组件组合成一个状态机。在一个 web 服务应用中，HTTP 节点只能有一个，且只作为的顶层节点使用。

组件 HTTP 包含一个静态参数 `listen`，此参数用于指明 web 应用服务的端口号，参数 `listen` 的默认值是 `8080`。例如，下面是一个使用 `80` 端口号的 web 服务应用：

```xml
<!-- 01-03 -->
<i:HTTP listen='80' xmlns:i='//xmlweb'>
    <i:Router url='/index.html'/>
    <Hello id='hello'/>
</i:HTTP>
```

该示例的组件 Hello 与前面给出的一致。你可以输入地址 `http://localhost/index.html` 来测试此示例。

## 数据流

数据流是一个普通对象，所谓普通对象指的是使用 `{}` 或 `new Object` 创建的对象。数据流由 HTTP 组件对象在接收到用户的请求时生成。在初始状态，它主要包含了如下的内容：

- req：请求对象(request)
- res：响应对象(response)
- ptr：状态机内部使用的指针数组
- url：与 req.url 一致

在数据流经过的各个节点，你不应该对前三个对象做任何的改动。

默认情况下，状态机的数据流由事件 `next` 驱动并从上往下流动，这是将状态机组件取名为 Flow 的直接原因。如下面的示例所示：

```xml
<!-- 01-04 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/:id.html'/>
    <Creater id='creater'/>
    <i:Static id='static' root='static'/>
</i:HTTP>
```

此 web 服务接收所有的具有 URL 模式 `/:id.html` 的 GET 请求。当有匹配的请求时，数据流先进入 Router 组件节点。在 Router 组件节点完成 URL 解码后会派发事件 `next`，然后数据流进入 Creater 组件节点。在 Creater 组件节点完成数据的相关处理后派发事件 `next`，于是数据流最终达到 Static 组件节点。为了清楚地认识这个过程，我们来看看组件 Creater 的具体构造。

```js
// 01-04
Creater: {
    xml: "<h1 id='creater'/>",
    fun: function (sys, items, opts) {
        let fs = require("fs");
        this.on("enter", (e, d) => {
            sys.creater.text("hello " + d.args.id);
            fs.writeFileSync("static" + d.req.url, this.serialize(), "utf8");
            this.trigger("next", d);
        });
    }
}
```

组件 Creater 的函数项部分主要根据传输来的数据生成响应页面并将页面内容写入目录 `static`，然后交给静态服务器做最后的处理。注意，当输入与模式串 `/:id.html` 不匹配的 URL 时，你将得到 xmlweb 内置的 404 页面。

## 数据流的跳转

相对于默认的垂直数据流的单向流动，状态机允许在任一时刻跳转到任意的已命名的组件节点，下面我们通过一个示例来说明：

```xml
<!-- 01-05 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/:id.html'/>
    <Jump id='jump'/>
    <Response id='page1' text='hello'/>
    <Response id='page2' text='world'/>
</i:HTTP>
```

该状态机包含一个 Jump 节点组件，此节点用于过滤 `id` 值为 `index` 的请求，也就是 url 为 `/index.html` 的请求。对于这种请求，数据流将不再进入组件节点 `page1`，而是直接进入组件节点 `page2`。下面给出组件 Jump 的具体实现：

```js
// 01-05
Jump: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => {
            let isIndex = d.args.id == "index";
            this.trigger("next", [d, isIndex ? null: "static"]);
        });
    }
}
```

正如组件 Jump 的函数项内容所指出的，要完成数据流的跳转，需要在派发 `next` 事件时，在系统函数 `trigger` 的参数部分提供一个目的状态机节点名。

需要强调的是，数据流只能跳转至当前所在节点的后继节点或者跳转到已命名的组件节点，而无法直接跳转到未命名的其它类型的节点。注意，在数据流跳转时，一定要给定合适的终止条件以避免陷入死循环。

## 状态机的停机

### 由事件 next 导致的停机

在 xmlweb 中，状态机的停机指的是结束当前的状态机数据的流动，返回到上一层状态机。状态机的停机有两种情况，一种是由事件 `next` 导致的停机，请看下面的一个示例：

```xml
<!-- 01-06 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/:id.html'/>
    <Machine id='machine'/>
    <Hello id='hello'/>
</i:HTTP>
```

该示例中，组件 Machine 是一个由组件 Flow 定义的子状态机组件，下面是它的视图项部分：

```xml
<!-- 01-06 -->
<i:Flow xmlns:i='//xmlweb'>
    <Next id='next'/>
</i:Flow>
```

其中的 Next 组件的具体内容如下所示：

```js
// 01-06
Next: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => this.trigger("next", d));
    }
}
```

组件 Next 的 `enter` 事件的侦听器直接派发了 `next` 事件。然而 Next 组件节点不存在后继节点，所以该事件的派发将导致当前状态机停机，也就是直接返回到上一层级的状态机。当数据流到达上一层级状态机后，数据流会向 Machine 组件节点的后继节点流动。也就是说，数据流最终会进入 Hello 组件节点。

### 由事件 reject 导致的停机

另一种停机由事件 `reject` 触发，该事件的派发将直接导致状态机停机，现修改上面的组件 Next 如下：

```js
// 01-07
Next: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => this.trigger("reject", d));
    }
}
```

在示例中，该组件与上述的由事件 `next` 导致的停机效果是一样的，但如果子状态机是下面这样子：

```xml
<!-- 01-08 -->
<i:Flow xmlns:i='//xmlweb'>
    <Next id='next'/>
    <Hello id='hello' text='hello, alice'/>
</i:Flow>
```

那么，Next 组件节点的 `next` 事件的派发将不会导致停机，因为 Next 组件节点有一个后继的 Hello 组件节点，数据流最终会进入 Hello 组件节点。而事件 `reject` 的派发则不同，无论 Hello 组件节点是否拥有后继节点，都会导致当前状态机的停机发生。

### 停机后的数据流

如前所述，当前状态机停机后，数据流将返回上一层级的状态机。如果不给派发事件的系统函数 `trigger` 提供目的节点名，那么数据流将试图跳转到当前状态机节点的后继节点。否则，数据流会试图跳转到上层状态机的同名节点。请看下面的示例：

```js
// 01-09
Next: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => this.trigger("reject", [d, "dynamic"]));
    }
}
```

该组件内部的侦听器在派发 `reject` 事件时，还携带目的节点名 `dynamic`。如果当前状态机的上一层状态机包一个含名为 `dynamic` 的节点，那么最终数据流会跳转到上一层状态机的名为 `dynamic` 的节点。

最后需要说明的是，一个状态机停机事件发生并且数据流到达上一层状态机后，只要条件满足，上一层状态机还是会停机，这样就形成了停机事件的冒泡现象。

### HTTP 组件节点的停机

前面说过，组件 HTTP 是一个比较特殊的状态机节点组件，它只能作为的顶层节点组件使用。如果在 HTTP 节点捕获到停机事件，那么 HTTP 节点将返回 xmlweb 返回内置的 404 页面。下面的一个简单的示例演示了这一点：

```xml
<!-- 01-10 -->
<i:HTTP xmlns:i='//xmlweb'>
    <Hello id='hello'/>
</i:HTTP>
```

组件 Hello 的定义如下：

```js
// 01-10
Hello: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => this.trigger("reject", d));
    }
}
```

该组件的函数项中只是简单地直接派发 `reject` 事件，此事件最终只能由 HTTP 组件节点捕获处理。并且无论你发送什么 URL 请求，都将得到一个 404 页面作为回应。