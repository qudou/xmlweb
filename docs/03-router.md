# ·��

·����� Router �� xmlweb ���õ�����Ҫ�����֮һ�����ɸ������������� URL ģʽ������״̬����������������ͨ����Ϊ״̬���ڵ�ĵ�һ���ӽڵ�ʹ�á�

## ��������

·����� Router ��һ��̬���� `mothod` ����ָ�����ܵ��� GET ������ POST �������У�Ĭ�ϵ�����ʽ�� GET���������ʾ����ʾ���� web ���������·��Ϊ `/index.html` �� GET ����

```xml
<!-- 03-01 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/index.html'/>
    <i:Static id='static'/>
</i:HTTP>
```

�� web ������ڲ�����Ҫ�������ᵼ�·��񷵻����õ� 404 ҳ�档���뿴�����һ�� POST ����ʾ����

```xml
<!-- 03-02 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/*' method='POST'/>
    <Response id='response'/>
</i:HTTP>
```

�� web ��������κ�·���� POST ���󣬵��������κε� POST ����ͬ��һ�����յ�������Ҫ�������ᵼ�·��񷵻����õ� 404 ҳ�档��������� Response �ĺ����

```js
// 03-02
function (sys, items, opts) {
    this.on("enter", (e, d) => {
        d.res.setHeader("Content-Type", "application/json;");
        d.res.end(JSON.stringify({data: "hello, world"}));
    });
}
```

Ϊ�˱������ڿ������������������⣬�����ʹ�����µ� `curl` ��������� POST ����Ĳ��ԣ�

```bash
$ curl -X POST http://localhost:8080
```

��Ȼ��Ҫ���� GET ���������صĽ����ֻ��Ҫ�����������е� POST ��Ϊ GET ���ɡ�

## ·��ƥ��

·����� Router �����ľ�̬���� `url` ����ָ�������ܵ�·�����ϣ��ò������ʽ��д��������������ʽ��������ڲ��ɿ�Դģ�� `path-to-regexp` �������˲�����������һЩ���õı��ģʽ��

- �����������ɷ��� ':' �Ӳ����������壬�� '/:key'
- ��ѡ��׺���ɷ��� '?' �����������壬��ʾ����Ϊ��ѡ���� '/:key?'
- ����������ɷ��� '*' �����������壬��ʾ�������Ϊ����������� '/:key*'
- һ��������ɷ��� '+' �����������壬��ʾ�������Ϊһ���������� '/:key+'
- �Զ���������������κεĺϷ���������ʽ���ַ�����ʾ���� '/:key(\\w+)'
- �Ǻţ��Ǻ� '*' ����ƥ��һ���Ӽ�·������ '/:key/*'

���磬����� web ����Ӧ�ÿ��Խ���·��Ϊ `/o` �����κ��� `/o` ��ͷ�� GET ����

```xml
<!-- 03-03 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/o:key?'/>
    <Response id='response'/>\
</i:HTTP>
```

���磬����� web ����Ӧ�ÿ��Խ���·��Ϊ `/helo` ���� `/hello` �� GET ����

```xml
<!-- 03-04 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/he(l?)lo'/>
    <Response id='response'/>\
</i:HTTP>
```

ע�⣬�����ģʽ������д�� `/hel?lo`�������ʺŻᱻ�����ַ�����

## ��������ֵ�Ļ�ȡ

�����̬���� url �а�����������������ô�������� Router ����ڵ�ʱ��������������Ӧ��ֵ���ᱻ����������Ϊһ�� JSON ����ֵ�����������Ӳ��� `args`���뿴�����һ��ʾ����

```xml
<!-- 03-05 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/:foo/:bar'/>
    <Response id='response'/>\
</i:HTTP>
```

��ʾ���� Index ����ĺ�����ľ����������£�

```js
// 03-05
function (sys, items, opts) {
    this.on("enter", (e, d) => {
        d.res.setHeader("Content-Type", "text/html");
        d.res.end(JSON.stringify(d.args));
    });
}
```

�������ʾ������������ url �� `http://localhost:81/alice/bob`����ô�㽫�ῴ�����µ������

```json
{ "foo": "alice", "bar": "bob" }
```

## GET �������ݵĻ�ȡ

����������ֵ�Ļ�ȡ���ƣ�GET �������ݵĻ�ȡҲ�������������Ӳ��� `args` �����õ��ġ����������Ƕ������ʾ�������޸ģ�

```xml
<!-- 03-06 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/:foo\\?bar=:bar'/>
    <Response id='response'/>\
</i:HTTP>
```

��ʾ���� Response ����ĺ��������ǰ���һ�¡��������ʾ������������ url �� `http://localhost:81/alice?bar=bob`����ô�㽫�ῴ����ǰһ��ʾ��һ���������

```json
{ "foo": "alice", "bar": "bob" }
```

����Ҫע�⣬ʾ���е�ģʽ�����ʺű����˫б�ˣ�������ʺŽ���ǰ��� `foo` �����á�

## POST �������ݵĻ�ȡ

�� GET ����ͬ������� POST �����㲻�����Ի�ȡ���������������ݣ������Եõ������ĵ�������Ϣ������Ϣ������������ḳֵ�����������Ӳ��� `body`���뿴�����ʾ����

```xml
<!-- 03-07 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/' method='POST'/>
    <Response id='response'/>\
</i:HTTP>
```

��ʾ���� Response ����ĺ�����ľ����������£�

```js
// 03-07
function (sys, items, opts) {
    this.on("enter", (e, d) => {
        d.res.setHeader("Content-Type", "text/html");
        d.res.end(JSON.stringify(d.body));
    });
}
```

Ϊ�˱������ڿ������������������⣬�����ʹ�����µ� `curl` ��������� POST ����Ĳ��ԣ�

```bash
$ curl -H "Content-type: application/json" -X POST -d '{"key":"2017"}' http://localhost:8080
```

��ʱ����Ҫ�Լ����������ĵ�������Ϣ����ô��������� Router ����ľ�̬���� `usebody` Ϊ `false` ����ֹ��������Ϣ�Ľ�����