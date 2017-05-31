# URL 重定向

xmlweb 内置的 Redirect 组件支持下面四种类型的重定向：

- 301: Moved Permanently
- 302: Found
- 303: See Other
- 307: Temporary Redirect

其中，响应码为 301 的重定向为永久重定向；响应码为 302 和 303 的重定向为临时重定向，它们的差别在于后者明确表示客户端应采用 GET 获取资源；响应码为 307 的重定向和 302 类似，由于许多浏览器会错误地响应 302 应答进行重定向，即将原来的 POST 改为 GET 请求，但 307 不会。

Redirect 组件的默认的采用的状态码是 `302`，如下面的示例所示：

```xml
<!-- 06-01 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Redirect to='http://xmlplus.cn'/>
</i:HTTP>
```

该示例对于任何的请求都会重定向到新地址 `http://xmlplus.cn`。

你可以通过静态参数 `statusCode` 重新指定重定向的类型，如下面的示例指定了一个永久的重定向：

<!-- 06-02 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Redirect statusCode='301' to='http://xmlplus.cn'/>
</i:HTTP>