# 静态服务器

为了方便使用，xmlweb 内置了一个简单的静态服务器的节点组件 Static。当然，在搭建 web 应用时，你可以不使用它或者使用自定义的静态服务器的节点组件。

## 静态接口

为了了解清楚该组件是如何使用的，我们从一个最简单的示例开始：

```xml
<!-- 03-01 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Static id='static'/>
</i:HTTP>
```

该静态 web 服务器侦听 8080 端口，并以代码所在的文件目录为工作目录。当然，你最好给它设置一个独立的工作目录。该示例尽管简单，但它可以正常工作，下面是一些可以提供的静态接口属性：

- `url`: `String` 描述了允许接受的请求路径集，默认为 `/*`
- `root`：`String` 工作目录，默认为代码所在的文件目录
- `mime`：`PlainObject` 额外的 MIME 类型

上述的 mime 属性需要结合示例说明下：

```js
// 03-02
Index: {
    xml: "<i:HTTP xmlns:i='//xmlweb'>\
            <i:Static id='static'/>\
          </i:HTTP>",
    cfg: { "static": {mime: {mp3: "audio/mpeg"}} }
}
```

此示例通过组件的配置项添加了一个 xmlweb 中不存在的 MIME 类型。xmlweb 默认支持的 MIME 类型如下：

- css: text/css
- gif: image/gif
- htm: text/html
- html: text/html
- ico: image/x-icon
- jpeg: image/jpeg
- jpg: image/jpeg
- js: text/javascript
- json: "application/json
- pdf: application/pdf
- png: image/png
- svg: image/svg+xml
- tiff: image/tiff
- txt: text/plain
- wav: audio/x-wav
- xml: text/xml
- zip: application/zip

如果组件内部并不包含请求某种 MIME 类型，那么组件节点会返回一个值 `unknow` 的 `Content-Type` 响应头。

## 内部结构

为了更好的使用该组件，对 Static 组件的内部做些了解是很有必要的。组件 Static 实质上是一个状态机组件，下面是此组件的视图项：

```xml
<Flow xmlns:s='static'>
    <Router id='router'/>
    <s:Status id='status'/>
    <s:Cache id='catch'/>
    <s:Compress id='compress'/>
    <s:Output id='output'/>
    <s:Err500 id='err500'/>
</Flow>
```

从此视图项可以看出，该状态机组件包含若干个子节点组件，下面是各子节点组件的基本用途：

- Router：过滤掉所有的非 GET 请求
- Status：获取目录文件的状态属性，如果文件不允许访问，会导致状态机停机
- Catch：文件缓存处理
- Compress：文件压缩处理
- Output：响应请求
- Err500：响应内部错误，如果前面的某些步骤的处理过程发生异常，数据流将跳转至此节点

## 自定义 404 页面

Static 组件节点对不存在的 URL 请求会导致停机，从而将后续处理交给 HTTP 组件节点，而 HTTP 组件节点的处理方式是返回一个简单的 404 页面。我们如果想返回不一样的 404 页面，那么可以自己定义一个组件节点并将其作为 Static 组件节点的后继。如下面的示例所示：

```xml
<!-- 03-03 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Static id='static'/>
    <NotFound id='notfound'/>
</i:HTTP>
```

此示例中，所有的 404 响应都会由 NotFound 组件节点完成。该组件的具体定义如下：

```js
// 03-03
NotFound: {
    xml: "<h1>This is not the page you are looking for.</h1>",
    fun: function (sys, items, opts) {
        this.on("enter", (e, r) => {
            r.res.statusCode = 404;
            r.res.setHeader("Content-Type", "text/html");
            r.res.end(this.serialize());
        });
    }
}
```

当然，这个自定义组件返回的 404 页面还是非常简陋的，你可以进一步修改成你想要的样子。