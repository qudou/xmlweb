# 状态机

由于 xmlweb 是一个类似状态机运行机理的 web 服务器框架，所以在这一章需要讲清楚 xmlweb 中的节点与数据流的概念。在此后的几章内容都是围绕这两个概念进行阐述。

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

你可以输入地址 `http://localhost/index.html` 来测试此示例，该请求的返回值是一个字符串。

状态机节点组件还可以是由组件 Falls 定义的组件，组件 Falls 内部也包含事件 `enter` 的侦听器，所以它也是一个节点组件。不过它比较特殊，它可以与子节点组件组合成一个状态机。如下面使用 Falls 组件定义了一个状态机：

```xml
<!-- 01-02 -->
<i:Falls xmlns:i='//xmlweb'>
    <i:Router url='/index.html'/>
    <Hello id='hello'/>
</i:Falls>
```

该状态机可以作为由 HTTP 组件定义的状态机的子状态机使用，如下面给的示例所示：

```xml
<!-- 01-02 -->
<i:HTTP xmlns:i='//xmlweb'>
    <Machine id='machine'/>
</i:HTTP>
```

此示例组件 Machine 即上面的由组件 Falls 定义的子状态机。你同样可以输入地址 `http://localhost/index.html` 来测试此示例。

与组件 Falls 类似，组件 HTTP 也是节点组件并且它可以与子节点组件组合成一个状态机。在一个 web 服务应用中，HTTP 节点只能有一个，且只作为的顶层节点使用。

组件 HTTP 包含一个静态参数 `listen`，此参数用于指明 web 应用服务的端口号，其默认值是 `80`。例如，下面是一个使用 `8080` 端口号的 web 服务应用：

```xml
<!-- 01-03 -->
<i:HTTP listen='8080' xmlns:i='//xmlweb'>
    <i:Router url='/index.html'/>
    <Hello id='hello'/>
</i:HTTP>
```

该示例的组件 Hello 与前面给出的一致。你可以输入地址 `http://localhost:8080/index.html` 来测试此示例。

另外，还有组件 HTTPS，它的默认端口号是 `443`，它的使用方式类似于 HTTP。但使用时需要提供私钥以及证书。

```xml
<!-- 01-04 -->
<i:HTTPS key='./privatekey.pem' cert='./certificate.pem' xmlns:i='//xmlweb'>
    <i:Router url='/index.html'/>
    <Hello id='hello'/>
</i:HTTPS>
```

## 数据流

数据流是一个普通对象，所谓普通对象指的是使用 `{}` 或 `new Object` 创建的对象。数据流由 HTTP 或者 HTTPS 组件对象在接收到用户的请求时生成。在初始状态，它主要包含了如下的内容：

- req：请求对象(request)
- res：响应对象(response)
- url：与 req.url 一致

在数据流经过的各个节点，你不应该对前二个对象做任何的改动。

默认情况下，状态机的数据流由事件 `enter` 驱动并从上往下流动，这是将状态机组件取名为 Falls 的直接原因。如下面的示例所示：

```xml
<!-- 01-05 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/:id.html'/>
    <Middle id='middle'/>
    <i:Static id='static' root='static'/>
</i:HTTP>
```

此 web 服务接收所有的具有 URL 模式 `/:id.html` 的 GET 请求。当有匹配的请求时，数据流先进入 Router 组件节点。在 Router 组件节点完成 URL 解码后，数据流会进入 Middle 组件节点。在 Middle 组件节点完成数据的相关处理后，数据流最终达到 Static 组件节点。为了清楚地认识这个过程，我们来看看组件 Middle 的具体构造。

```js
// 01-05
Middle: {
    xml: "<main id='middle'>\
	        <h1 id='label'/>\
		  </main>",
    fun: function (sys, items, opts) {
        let fs = require("fs");
        this.on("enter", (e, d) => {
            sys.label.text("hello " + d.args.id);
            fs.writeFileSync("static" + d.req.url, sys.label.serialize(), "utf8");
        });
    }
}
```

组件 Middle 的函数项部分主要根据传输来的数据生成响应页面并将页面内容写入目录 `static`，然后交给静态服务器做最后的处理。注意，当输入与模式串 `/:id.html` 不匹配的 URL 时，你将得到 xmlweb 内置的 404 页面。

在这个示例中，我们对 `label` 组件节点进行了修改，而不对作为顶层的 `middle` 节点作修改。这是因为顶层节点在框架内部被用作通信节点，为了避免出现不可预知的错误，对于顶层节点，程序中应该尽量不对其做改动。

## 数据流的跳转

相对于默认的数据流的垂直单向流动，状态机允许刻跳转到任意的已命名的组件节点。数据流的跳转分两种情况。

### 由 `goto` 事件导致的跳转

```xml
<!-- 01-06 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/:id.html'/>
    <Jump id='jump'/>
    <Response id='page1' text='hello'/>
    <Response id='page2' text='world'/>
</i:HTTP>
```

该状态机包含一个 Jump 节点组件，此节点用于过滤 `id` 值为 `index` 的请求，也就是 url 为 `/index.html` 的请求。对于这种请求，数据流将不再进入组件节点 `page1`，而是直接进入组件节点 `page2`。下面给出组件 Jump 的具体实现：

```js
// 01-06
Jump: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => {
            if (d.args.id == "index") {
				e.stopPropagation();
				this.trigger("goto", [d, "page2"]);
			}
        });
    }
}
```

正如组件 Jump 的函数项内容所指出的，使用语句 `e.stopPropagation()` 可以阻止默认数据流的流动。而要完成数据流的跳转，需要在派发 `goto` 事件时，在系统函数 `trigger` 的参数部分提供一个目的状态机节点名。

需要强调的是，数据流只能在当前状态机内跳转，并且数据流只能跳转至已命名的组件节点，而无法直接跳转到未命名的节点。

最后请注意，在数据流跳转时，一定要给定合适的终止条件以避免陷入死循环。

### 由 `continue` 事件导致的跳转

我们将通过下面的示例来讲述该跳转的明细。此事例顶部包含 Router、Middle 以及 Hello 三个子组件。

```xml
<!-- 01-07 -->
<i:HTTP xmlns:i='//xmlweb'>\
    <i:Router url='/:id.html'/>\
    <Middle id='middle'/>\
    <Hello id='hello'/>\
</i:HTTP>
```

Middle 是一个子状态机，包含 Alice 和 Bob 两个子组件。

```xml
<!-- 01-07 -->
<i:Falls xmlns:i='//xmlweb'>\
	<Alice id='alice'/>\
	<Bob id='bob'/>\
</i:Falls>
```

Hello 是一个独立的节点组件。它对于来到的请求，会返回一个字符串。

```js
// 01-07
Hello: {
	fun: function (sys, items, opts) {
		this.on("enter", (e, d) => {
			d.res.setHeader("Content-Type", "text/html");
			d.res.end("hello, world");
		});
	}
}
```

下面是 Alice 和 Bob 的组件明细。其中 Alice 组件的 enter 事件处理器中，终止了数据流，这导致 Bob 组件对象成为一个多余的组件。
```js
// 01-07
Alice: {
	fun: function (sys, items, opts) {
		this.on("enter", (e, d) => {
			console.log("alice");
			e.stopPropagation();
			this.trigger("continue", d);
		});
	}
},
Bob: {
	fun: function (sys, items, opts) {
		this.on("enter", (e, d) => {
			console.log("bob");
		});
	}
}
```

注意，在 Alice 组件中，e.stopPropagation() 语句的执行，终止了数据流，如果没有后续语句，数据流就至此为止了。`continue` 事件由 Falls 组件对象捕获，之后 Falls 组件对象会派发一个 enter 事件，这致使数据流重新导向 Hello 组件节点。

## 状态机的停机

当一个请求到来时，就会生成一个数据流，数据流停止流动，意味着本次服务的结束。我们可以把服务的结束比作状态机的停机。

状态机的停机有两种情况，一种是自然停机；另一种是由事件 `reject` 导致的强制停机。

### 自然停机

自然停机是指一个满足条件的请求到来，web 服务器完成服务后的停机，如下面示例。

```xml
<!-- 01-07 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/:id.html'/>
    <Hello id='hello'/>
</i:HTTP>
```

当用户在浏览器中输入网址 `http://localhost/index.html` 后，Router 组件对象接受请求，数据流到达 Hello 组件对象， Hello 组件对象回复请求。数据流至此就结束了，这就是所谓的自然停机。

### 强制停机

现在还拿上面的示例来说明。如果用户在浏览器中输入网址 `http://localhost`，那么 Router 组件对象必然拒绝接受请求。

当 Router 组件对象拒绝接受请求时，它会调用函数 `e.stopPropagation()` 强自终止数据流动并发送一个 reject 事件。

reject 事件由 HTTP 或者 HTTPS 组件对象捕获并处理。处理程序会根据数据流提供的状态码返回相应的信息。如果数据流未提供状态码，则使用默认的 501 状态码。