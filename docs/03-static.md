# 静态服务器

为了方便使用，xmlweb 内置了一个简单的静态服务器的节点组件 Static。当然，在搭建 web 应用时，你可以不使用它或者使用自定义的静态服务器的节点组件。

## 静态接口

为了弄清楚该组件是如何使用的，我们从一个最简单的示例开始：

```xml
<!-- 03-01 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Static id='static'/>
</i:HTTP>
```

该静态 web 服务器侦听 80 端口，并以代码所在的文件目录为工作目录。当然，你最好给它设置一个独立的工作目录。该示例尽管简单，但它可以正常工作，下面是一些可以提供的静态接口属性：

- `url`: `String` 描述了允许接受的请求路径集，默认为 `/*`
- `root`：`String` 工作目录，默认为代码所在的文件目录

## 内部结构

为了更好的使用该组件，对 Static 组件的内部做些了解是很有必要的。组件 Static 实质上是一个状态机组件，下面是此组件的视图项：

```xml
<Flow xmlns:s='static'>
    <Router id='router' err='reply'/>
    <s:Status id='status'/>
    <s:Cache id='catch'/>
    <s:Ranges id='ranges'/>
    <s:Compress id='compress'/>
    <s:Output id='output'/>
    <s:Reply id='reply'/>
</Flow>
```

从此视图项可以看出，该状态机组件包含若干个子节点组件，下面是各子节点组件的基本用途：

- Router：过滤掉所有的非 GET 请求
- Status：获取目录文件的状态属性
- Catch：文件缓存处理
- Ranges: 部分资源的范围请求的处理
- Compress：文件压缩处理
- Output：响应请求
- Reply: 错误处理

## 自定义错误处理

Static 组件节点对不合要求的请求会返回简单的错误页面，我们如果想返回自定义的内容，则需要覆盖掉默认的 Reply 组件。如下面的示例所示：

```js
// 03-02
xmlweb("xmlweb", function (xp, $_) {
    $_("static").imports({
        Reply: {
            xml: "<h1>This is not the page you are looking for.</h1>",
            fun: function (sys, items, opts) {
                this.watch("next", (e, d) => {
                    d.res.statusCode = 404;
                    d.res.setHeader("Content-Type", "text/html");
                    d.res.end(this.serialize());
                });
            }
        }
    });
});
```

这里我们定义了一个新的组件来覆盖默认的 Reply 组件。当然，这个自定义组件返回的页面还是非常简陋的，你可以进一步修改成你想要的样子。