# 状态机

由于 xmlweb 是一个基于状态机理论设计的 web 服务器框架，所以在这一章需要讲清楚 xmlweb 中与状态机相关的节点与数据流的概念。在此后的几章内容都是围绕这两个概念进行阐述的。

## 节点

状态机节点可以是任何侦听了 `enter` 事件的组件对象，如下面的组件对象可以看作状态机的一个节点：

```js
Home: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => console.log("hello, world"));
    }
}
```

另外，像 xmlweb 中内置的组件 Router、Rewrite 以及 AddHeaders 等都包含有侦听 `enter` 事件的代码，它们都可以实例化为状态机的节点使用。此外，状态机节点还可以是由组件 Flow 定义的组件对象，请看下面的组件示例：

```xml
<i:Flow xmlns:i='//xmlweb'>
    <i:Router url='/index.html'/>
    <i:Static id='static'/>
</i:Flow>
```

此外，由组件 Http 定义的组件是状态机的一个节点，该节点是状态机的顶层节点。在一个应用中，由组件 Http 定义的节点组件只能有一个，它描述了HTTP 服务器的各项参数，如下面的示例所示：

```xml
<i:Http listen="80" xmlns:i='//xmlweb'>
    <Router url='/index.html' xmlns='//xmlweb/router'/>
    <i:Static id='static'/>
</i:Http>
```

## 垂直数据流

数据流的数据是一个普通的 JSON 对象，它由 Http 组件对象生成，在初始状态它主要包含了一个请求对象的引用 `req`，以及一个响应对象的引用 `res`。在各个节点，你不应该对这两个对象做任何的改动。

默认情况下，状态机的数据流由事件 `next` 驱动并从上往下进行，这是将状态机组件取名为 Flow 的直接原因。如下面的示例所示：

```xml
<i:Http xmlns:i='//xmlweb' xmlns:r="//xmlweb/router">
    <r:Router id='router' url='/:id.html'/>
    <Home id='home'/>
    <i:Static id='static'/>
</i:Http>
```

当此状态机接收具有模式 `/:id.html` 的 URL 请求时，数据流先进入组件对象 router。当 router 完成 URL 解码后派发事件 `next` 后，数据流进入组件对象 home。组件对象 home 完成数据的相关处理后派发事件 `next`，于是数据流最终达到组件对象 static。为了更清楚地认识这个过程，我们来看看组件 Home 的具体构造。

```js
Home: {
    xml: "<html id='home'>\
            <body id='body'/>\
          </html>",
    fun: function (sys, items, opts) {
        let fs = require("fs");
        this.on("enter", (e, d) => {
            sys.body.text("hello, $(d.args.id)");
            let path = "static" + d.req.url;
            fs.writeFileSync(path, this.serialize(), "utf8");
            this.trigger("next", d));
        });
    }
}
```

组件 Home 的函数项部分主要根据传输来的数据生成 html 页面并将页面内容写入目录 `static`，然后交给静态服务器做最后的处理。注意，此示例仅用于展示垂直的数据流，并不包含完善的路由处理。故当你输入与模式串 `/:id.html` 不匹配的 URL 时，你将得不到任何你想要的反馈。

## 数据流的跳转

相对于默认的垂直的数据流，状态机允许在任一时刻跳转到任意的节点。我们通过一个示例来说明：

```xml
<i:Http xmlns:i='//xmlweb' xmlns:r='//xmlweb/router'>
    <r:Router url='/:id.html'/>
    <Filter id='filter'/>
    <Home id='home'/>
    <i:Static id='static'/>
</i:Http>
```

该状态机比前面多了一个 Filter 节点，此节点用于过滤 id 值为 index 的请求，如果 id 值为 index，那么数据流将不再进入节点 Home，而是直接进入节点 Static。下面是组件 Filter 的具体实现：

```js
Filter: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => {
            d.args.id == "index" ? this.trigger("next", [d, "static"]) : this.trigger("next", d);
        });
    }
}
```

正如组件 Filter 的函数项的内容所指出的，要完成数据流的跳转，需要在派发 `next` 事件时，在函数 `trigger` 的参数部分提供一个目的节点名。

上述的数据流跳转是往前的跳转，然而数据流还可以往后跳转，或者直接跳转到组件自身，但一定要注意给定合适的终止条件以避免陷入死循环。

使用事件 `next` 只能在本状态机的节点之间完成跳转，如果想跳出本状态机，则需要使用事件 `reject`。对于 `reject`，你可以理解为停机或者结束本状态机的运作。请看下面的示例：

```js
Filter: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => {
            d.args.id == "index" ? this.trigger("reject", [d, "static"]) : this.trigger("next", d);
        });
    }
}
```

该组件只是简单地将前面的 Filter 组件的 `next` 修改为 `reject`，此时数据流将不再跳转到本状态机的 `static` 节点，而跳转到上一级的 `static` 节点。不过需要注意，如果当前状态机是 Http 状态机，那么派发 `reject` 将会抛出一个错误。由于 Http 状态机已经是顶层节点了，如果再派发 `reject`，不可能会再有上层节点来处理该事件。