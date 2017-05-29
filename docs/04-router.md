# ·��

·����� Router �� xmlweb ���õ�����Ҫ�����֮һ�����ɸ������������� URL ģʽ������״̬����������������ͨ����Ϊ״̬���ڵ�ĵ�һ���ӽڵ�ʹ�á�

## ��������

·����� Router ��һ��̬���� `mothod` ����ָ�����ܵ��� GET ������ POST �������У�Ĭ�ϵ�����ʽ�� GET���������ʾ����ʾ���� web ���������·��Ϊ `/index.html` �� GET ����

```xml
<!-- 04-01 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/index.html'/>
    <i:Static id='static'/>
</i:HTTP>
```

�� web ������ڲ�����Ҫ�������ᵼ�·��񷵻����õ� 404 ҳ�档���뿴�����һ�� POST ����ʾ����

```xml
<!-- 04-02 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/*' method='POST'/>
    <Response id='response'/>
</i:HTTP>
```

�� web ��������κ�·���� POST ���󣬵��������κε� POST ����ͬ��һ�����յ�������Ҫ�������ᵼ�·��񷵻����õ� 404 ҳ�档��������� Response �ĺ����

```js
// 04-02
function (sys, items, opts) {
    this.on("enter", (e, d) => {
        d.res.setHeader("Content-Type", "application/json;");
        d.res.end(JSON.stringify({data: "hello, world"}));
    });
}
```

Ϊ�˱������ڿ������������������⣬�����ʹ�����µ� `curl` ��������� POST ����Ĳ��ԣ�

```bash
curl -X POST http://localhost:8080
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

���磬����� web ����Ӧ�ÿ��Խ���·��Ϊ `/` �����κ��� `/` ��ͷ�� GET ����

```xml
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/:key?'/>
    <i:Static id='static'/>
</i:HTTP>
```

���磬����� web ����Ӧ�ÿ��Խ���·��Ϊ `/helo` ���� `/hello` �� GET ����

```xml
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/he?lo'/>
    <i:Static id='static'/>
</i:HTTP>
```

## ��������ֵ�Ļ�ȡ

�����̬���� url �а�����������������ô�������� Router ����ڵ�ʱ��������������Ӧ��ֵ���ᱻ����������Ϊһ�� JSON ����ֵ�����������Ӳ��� `args`���뿴�����һ��ʾ����

```xml
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/:foo/:bar'/>
    <i:Static id='static'/>
</i:HTTP>
```

��ʾ���� Index ����ĺ�����ľ����������£�

```js
function (sys, items, opts) {
    this.on("enter", (e, d) => console.log(d.args));
}
```

�������ʾ������������ url �� `http://localhost:81/alice/bob`����ô���ڿ���̨���ῴ�����µ������

```json
{ "foo": "alice", "bar": "bob" }
```

## GET �������ݵĻ�ȡ

����������ֵ�Ļ�ȡ���ƣ�GET �������ݵĻ�ȡҲ�������������Ӳ��� `args` �����õ��ġ����������Ƕ������ʾ�������޸ģ�

```xml
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/:foo?bar=bob'/>
    <Index id='index'/>
</i:HTTP>
```

��ʾ���� Index ����ĺ��������ǰ���һ�¡��������ʾ������������ url �� `http://localhost:81/alice?bar=bob`����ô���ڿ���̨���ῴ����ǰһ��ʾ��һ���������

```json
{ "foo": "alice", "bar": "bob" }
```

## POST �������ݵĻ�ȡ

�� GET ����ͬ������� POST ������õ������������������ݣ���Ҫ���� Router �������� `usebody` ����Ϊ��ֵ���С�Ҳ����˵��Ĭ������£����ȡ���� POST ���ݡ�POST ���ݱ�����������ֵ�����������Ӳ��� `body`����� POST �����ݷ��� JSON ��ʽ�����ᱻԤ����Ϊһ�� JSON ���󣬷�����Ϊ�ַ�����ֵ���뿴�����ʾ����

```xml
<i:HTTP xmlns:i='//xmlweb'>
    <i:Router url='/' method='POST'/>
    <Index id='index'/>
</i:HTTP>
```

��ʾ���� Index ����ĺ�����ľ����������£�

```js
function (sys, items, opts) {
    this.on("enter", (e, d) => console.log(d.body));
}
```

�ڿͻ��ˣ������ POST ����������Ϊ `{'key': '0'}`����ô���� Index ����ڵ��н��õ�һ�� JSON ���󣻷�֮������� POST ����������Ϊ `hello, world`����ô���� Index ����ڵ��н��õ�һ���ַ�����