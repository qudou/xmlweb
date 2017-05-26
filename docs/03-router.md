# 路由

路由组件是 xmlweb 内置的最重要的组件之一，它通常作为状态机节点的第一个子节点使用。

## 请求类型

组件 Router 有一静态参数 `mothod` 用于指明接受的是 GET 请求还是 POST 请求。其中，POST 是默认的接受请求方式。如下面的示例所示，该 web 服务仅接收路径为 `/` 的 POST 请求。

```xml
<Http listen='81'>
    <Router url='/'/>
    <Index id='index'/>
</Http>
```

注意，此 web 服务对于不符合的请求会导致服务返回内置的 404 页面。再看下面的一个示例：

```xml
<Http listen='81'>
    <Router url='/*' method='GET'/>
    <Static id='static'/>
</Http>
```

该 web 服务接受任何路径的 GET 请求，但不接收任何的 POST 请求。同样一旦接收到不符合的请求会导致服务返回内置的 404 页面。

## 路径匹配

组件 Router 包含的静态参数 url 用于指明所接受的路径集合，参数表达式的写法类似正则表达式，其内部由模块 `path-to-regexp` 实现。下面是一些常用的表达模式：

- 命名参数：由 `:` 加上参数名来定义，如 `/:key`
- 可选后缀：由符号 `?` 紧跟参数定义，表示参数为可选，如 `/:key?`
- 零至多个：由符号 `*` 紧跟参数定义，表示允许参数为零个或多个，如 `/:key*`
- 一至多个：由符号 `+` 紧跟参数定义，表示允许参数为一个或多个，如 `/:key+
- 自定义参数：可以是任何的合法的正则表达式的字符串表示，如 `/:key(\\w+)`
- 星号：星号 `*` 用于匹配一切子路径，如 `/:key/*`

例如，下面的 web 服务应用可以接受路径为 `/` 或者 `/foo` 的路径请求：

```xml
<Http listen='81'>
    <Router url='/:key?' method='GET'/>
    <Static id='static'/>
</Http>
```

再如，下面的 web 服务应用可以接受路径为 `/helo` 或者 `/hello` 的路径请求：

```xml
<Http listen='81'>
    <Router url='/he?lo' method='GET'/>
    <Static id='static'/>
</Http>
```

## 命名参数的获取

如果静态参数 url 中包含有命名参数，那么数据流经组件 Router 时，各命名参数相应的值将会被解析出来作为一个 JSON 对象赋值给数据流的参数 `args`。请看下面的一个示例：

```xml
<Http listen='81'>
    <Router url='/:foo/:bar' method='GET'/>
    <Index id='index'/>
</Http>
```

该示例的 Index 组件的函数项的具体内容如下：

```js
function (sys, items, opts) {
    this.on("enter", (e, d) => console.log(d.args));
}
```

运行这个示例，如果输入的 url 是 `http://localhost:81/alice/bob`，那么你在控制台将会看到如下的输出：

```
{ foo: "alice", bar: "bob" }
```

## URL 参数的获取

与命名参数的获取类似，URL 参数的获取也是由 `args` 参数得到的。现在我们对上面的示例做点修改：


```xml
<Http listen='81'>
    <Router url='/:foo?bar=bob' method='GET'/>
    <Index id='index'/>
</Http>
```

该示例的 Index 组件的函数项的与前面的一致。运行这个示例，如果输入的 url 是 `http://localhost:81/alice?bar=bob`，那么你在控制台将会看到与前一个示例一样的输出：

```
{ foo: "alice", bar: "bob" }
```

## POST 请求数据的获取

与 GET 请求不同，如果是 POST 请求，想得到 POST 上来的数据，需要设置组件 Router 的 `usebody` 属性为真值才行。也就是说，默认情况下，你获取不到 POST 数据。

POST 数据被解析出来后赋值给数据流的参数 `body`。如果 POST 的数据是 JSON 格式的，将会被预解析，否则将被作为字符串赋值给参数 `body`。请看下面的示例：

```xml
<Http listen='81'>
    <Router url='/'/>
    <Index id='index'/>
</Http>
```

该示例的 Index 组件的函数项的具体内容如下：

```js
function (sys, items, opts) {
    this.on("enter", (e, d) => console.log(d.body));
}
```

在客户端，如果你 POST 上来的数据为 `{'key': '0'}`，那么你在组件 Index 中将得到一个 JSON 对象；反之，如果你 POST 上来的数据为 `hello, world`，那么你在组件 Index 中将得到一个字符串。