# 状态机

由于 xmlweb 是一个类似状态机的 web 服务器框架，所以在这一章需要讲清楚 xmlweb 中状态机节点与数据流的概念。在此后的几章内容都是围绕这两个概念进行阐述。

## 状态机节点

状态机节点可以是任何侦听了 `next` 消息的组件对象。可以实例化为状态机节点的组件称为状态机的节点组件，简称节点组件。如下面的组件 Hello 是一个状态机的节点组件：

```js
// 01-01
Hello: {
    fun: function (sys, items, opts) {
        this.watch("next", (e, d) => {
            d.res.setHeader("Content-Type", "text/html");
            d.res.end("hello, world");
        });
    }
}
```

另外，像 xmlweb 中内置的 Router、Rewrite 以及 Redirect 等组件都包含有 `next` 消息的侦听器，它们都可以实例化为状态机节点使用。下面是一个 Router 节点组件的使用示例：

```xml
<!-- 01-01 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/index.html'/>
    <Hello id='hello'/>
</i:HTTP>
```

你可以输入地址 `http://localhost/index.html` 来测试此示例，该请求的返回值是一个值为 `hello, world` 的字符串。

状态机节点组件还可以是由组件 Falls 定义的组件，组件 Falls 内部也包含 `next` 消息的侦听器，所以它也是一个节点组件。不过它比较特殊，它可以与子节点组件组合成一个状态机。如下面使用 Falls 组件定义了一个状态机：

```xml
<!-- 01-02 -->
Machine: {
	map: { msgFilter: /next/ },
	xml: "<i:Falls xmlns:i='//xmlweb'>\
			<i:Router url='/index.html'/>\
			<Hello id='hello'/>\
		 </i:Falls>"
}
```

当使用组件 Falls 定义子状态机时，需要一个消息过滤器 `/next/`，这基于框架实现的需要。

该状态机可以作为由 HTTP 组件定义的状态机的子状态机使用，如下面给的示例所示：

```xml
<!-- 01-02 -->
<i:HTTP xmlns:i='//xmlweb'>
    <Machine id='machine'/>
</i:HTTP>
```

此示例组件 Machine 即上面的由组件 Falls 定义的子状态机。你同样可以输入地址 `http://localhost/index.html` 来测试此示例。

与组件 Falls 类似，组件 HTTP 也是节点组件并且它可以与子节点组件组合成一个状态机。在一个 web 服务应用中，HTTP 节点只能有一个，且只作为的顶层节点使用。

组件 HTTP 包含一个静态参数 `listen`，此参数用于指明 web 应用服务的端口号，参数 `listen` 的默认值是 `80`。例如，下面是一个使用 `8080` 端口号的 web 服务应用：

```xml
<!-- 01-03 -->
<i:HTTP listen='8080' xmlns:i='//xmlweb'>
    <i:Router url='/index.html'/>
    <Hello id='hello'/>
</i:HTTP>
```

该示例的组件 Hello 与前面给出的一致。你可以输入地址 `http://localhost/index.html` 来测试此示例。

另外，还有使用 443 端口的组件 HTTPS，其使用方式类似于 HTTP。但使用时需要提供私钥以及证书文件路径。

```xml
<!-- 01-04 -->
<i:HTTPS key='./privatekey.pem' cert='./certificate.pem' xmlns:i='//xmlweb'>
    <i:Router url='/index.html'/>
    <Hello id='hello'/>
</i:HTTPS>
```

## 数据流

数据流是一个普通对象，所谓普通对象指的是使用 `{}` 或 `new Object` 创建的对象。数据流由 HTTP 组件对象在接收到用户的请求时生成。在初始状态，它主要包含了如下的内容：

- req：请求对象(request)
- res：响应对象(response)
- url：与 req.url 一致

在数据流经过的各个节点，你不应该对前两个对象做任何的改动。

默认情况下，状态机的数据流由上往下流动。如下面的示例所示：

```xml
<!-- 01-05 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/:id.html'/>
    <Middle id='middle'/>
    <i:Static id='static' root='static'/>
</i:HTTP>
```

此 web 服务接收所有的具有 `/:id.html` 模式的 GET 请求。当有匹配的请求时，数据流先进入 Router 组件节点。在 Router 组件节点完成 URL 解码后，数据流进入 Middle 组件节点。在 Middle 组件节点完成数据的相关处理后，数据流最终达到 Static 组件节点。为了清楚地认识这个过程，我们来看看组件 Middle 的具体构造。

```js
// 01-05
Middle: {
    xml: "<h1 id='middle'/>",
    fun: function (sys, items, opts) {
        let fs = require("fs");
        this.watch("next", (e, d) => {
            sys.middle.text("hello " + d.args.id);
            fs.writeFileSync("static" + d.req.url, this.serialize(), "utf8");
            this.trigger("next", d);
        });
    }
}
```

组件 Middle 的函数项部分主要根据传输来的数据生成响应页面并将页面内容写入目录 `static`，然后交给静态服务器做最后的处理。注意，当输入与模式串 `/:id.html` 不匹配的 URL 时，你将得到 xmlweb 内置的 404 页面。

## 数据流的跳转

相对于默认的垂直数据流的单向流动，状态机允许在任一时刻跳转到任意的已命名的组件节点，下面我们通过一个示例来说明：

```xml
<!-- 01-06 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/:id.html'/>
    <Jump id='jump'/>
    <Response id='page1' text='hello'/>
    <Response id='page2' text='world'/>
</i:HTTP>
```

该状态机包含一个 Jump 节点组件，此节点根据 `id` 值来决定数据流的流向，如果 id 为 index，则数据流进入组件节点 page1，否则，数据流进入组件节点 page2。

```js
// 01-06
Jump: {
    fun: function (sys, items, opts) {
        this.watch("next", (e, d) => {
            let isIndex = d.args.id == "index";
            this.trigger("next", [d, isIndex ? null: "static"]);
        });
    }
}
```

正如组件 Jump 的函数项内容所指出的，要完成数据流的跳转，需要在派发 `next` 事件时，在系统函数 `trigger` 的参数部分提供一个目的状态机节点名。

需要强调的是，数据流只能跳转至当前所在节点的后继节点或者跳转到已命名的组件节点，而无法直接跳转到未命名的其它类型的节点。注意，在数据流跳转时，一定要给定合适的终止条件以避免陷入死循环。

## 状态机的停机

在 xmlweb 中，状态机的停机指的是结束当前的状态机数据的流动，请看下面的一个示例：

```xml
<!-- 01-07 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/:id.html'/>
    <Machine id='machine'/>
    <Hello id='hello'/>
</i:HTTP>
```

该示例中，组件 Machine 是一个由组件 Falls 定义的子状态机组件，下面是它的视图项部分：

```xml
<!-- 01-07 -->
<i:Falls xmlns:i='//xmlweb'>
    <Alice id='alice'/>
</i:Falls>
```

其中的 Alice 组件的具体内容如下所示：

```js
// 01-07
Alice: {
    fun: function (sys, items, opts) {
        this.watch("next", (e, d) => this.trigger("next", d));
    }
}
```

组件 Alice 的 `next` 消息侦听器直接派发了 `next` 事件。然而 Alice 组件节点不存在后继节点，所以该事件的派发将导致当前状态机停机，注意，此时数据流并不返回到上一层级的状态机。也就是说，数据流最终不会进入 Hello 组件节点。

当需要在某个时机跳出当前状态机返回至父级别或者其之上级别的状态机，我们可以通过自定义事件来实现。请看下面的示例：

```js
// 01-08
Middle: {
    xml: "<i:HTTP xmlns:i='//xmlweb'>\
			<i:Router url='/:id.html'/>\
			<Machine id='machine'/>\
			<Hello id='hello'/>\
		  </i:HTTP>",
    fun: function (sys, items, opts) {
        this.on("jump", (e, d) => {
            sys.hello.notify("next", d);
        });
    }
}
```

```js
// 01-08
Alice: {
    fun: function (sys, items, opts) {
        this.watch("next", (e, d) => this.trigger("jump", d));
    }
}
```

该示例与前一个示例不同的地方在于，组件 Alice 中，跳转指令不使用默认的 next，而使用自定义的 jump。同时在上一层状态机中侦听了该事件并在侦听器中对该事件做了转发。