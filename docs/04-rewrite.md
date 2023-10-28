# URL 重写

URL 重写是将一个进入的 URL 重新写成另一个 URL 的过程。

## 不改变原始值的重写

在 [状态机](/state-machine) 中说过。数据流由 HTTP 组件对象在接收到用户的请求时生成。在初始状态，它主要包含了如下的内容：

- req：请求对象(request)
- res：响应对象(response)
- ptr：状态机内部使用的指针数组
- url：与 req.url 一致

URL 的重写并不改变请求对象 req 中的 url 原始值，它改变的是数据流中的 `url` 参数。请看下面的示例：

```xml
<!-- 04-01 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Rewrite from='/' to='/index.html'/>
    <Response id='response'/>
</i:HTTP>
```

此示例的 Response 组件内容如下：

```js
// 04-01
Response: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => {
            d.res.setHeader("Content-Type", "text/html");
            d.res.end(`original URL: ${d.req.url}; rewrited URL: ${d.url}` );
        });
    }
}
```

在浏览器中输入 `http://localhost:8080`，那么你将看到原始的 `url` 以及经过 Response 组件节点重写后的 `url`。

## 重写规则

URL 的重写规则允许使用 [路由](/router) 中介绍过的路径匹配规则，请看下面的示例：

```xml
<!-- 04-02 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Rewrite from='/:id' to='/:id.html'/>
    <Response id='response'/>
</i:HTTP>
```

此示例的 Response 组件与上一个示例相同。此示例会将任何的具有模式 `/:id` 的 URL 重写为具有模式 `/:id.html` 的 URL 输出，其中的 `id` 值保持一致。

有一点需要提醒，Router 组件中对路径的匹配使用的是原始的 `url`，而不使用数据流中 `url` 参数，所以不要试图使用 Router 组件节点过滤使用 Rewrite 组件节点重写后的 `url` 值。

## 指定多个重写项

上面给出的 Rewrite 组件节点只提供一个 URL 的重写规则。如果需要提供多个 URL 重写规则，你可以像下面这样定义一组重写规则：

```xml
// 04-03
Rewrite: {
    xml: "<i:Rewrite xmlns:i='//xmlweb/rewrite'>\
             <i:Roule from='/' to='/index'/>\
             <i:Roule from='/:id' to='/id.html'/>\
          </i:Rewrite>
}
```

组件 Roule 可以作为 Rewrite 的子组件使用来定义一条重写规则。下面是使用新定义的 Rewrite 组件的示例：

```xml
<!-- 04-03 -->
<i:HTTP xmlns:i='//xmlweb'>
    <Rewrite id='rewrite'/>
    <Response id='response'/>
</i:HTTP>
```

此示例的组件 Response 与前面给出的一致。你可以在浏览器中输入地址 `http://localhost/` 与地址 `http://localhost/index` 分别测试两种不同的情况。