# ��̬������

Ϊ�˷���ʹ�ã�xmlweb ������һ����̬�������Ľڵ���� Static����Ȼ���ڴ web Ӧ��ʱ����Ҳ���Բ�ʹ��������ʹ���Զ���ľ�̬�������Ľڵ������

## ��̬�ӿ�

Ϊ���˽��������������ʹ�õģ����ǴӸ����Ӧ�õ�һ����򵥵�ʾ����ʼ��

```xml
<i:Http xmlns:i='//xmlweb'>
    <i:Static id='static'/>
</i:Http>
```

��ʾ�����ܼ򵥣�������������������������һЩ�����ṩ�ľ�̬�ӿ����ԣ�

- url��������ܵ�����·����Ĭ��Ϊ '/*'
- root������Ŀ¼��Ĭ��Ϊ�������ڵĵ�ǰĿ¼
- mime������� MIME ����

������ mime ������Ҫ���ʾ��˵���£�

```js
Index: {
    xml: "<i:Http xmlns:i='//xmlweb'>\
            <i:Static id='static'/>\
          </i:Http>",
    cfg: { static: {mime: {mp3: "audio/mpeg"}} },
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => console.log("hello, world"));
    }
}
```

��ʾ��ͨ������������������һ�� xmlweb �в����ڵ� MIME ���͡�xmlweb Ĭ��֧�ֵ� MIME �������£�

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

## �ڲ��ṹ

Ϊ�˸��õ�ʹ�ø�������� Static ������ڲ���Щ�˽��Ǻ��б�Ҫ�ġ���� Static ʵ������һ��״̬������������Ǵ��������ͼ�

```xml
<Flow xmlns:r='router' xmlns:s='static'>
    <r:Router id='router'/>
    <s:Status id='status'/>
    <s:Cache id='catch'/>
    <s:Compress id='compress'/>
    <s:Output id='output'/>
    <s:Err500 id='err500'/>
</Flow>
```

�Ӵ���ͼ����Կ�������״̬������������ɸ��ӽڵ����������������ӽڵ�����Ļ������ã�

- Router�����˵����еķ� GET ����
- Status����ȡĿ¼�ļ���״̬���ԣ�����ļ���������ʣ��ᵼ��״̬��ͣ��
- Catch���ļ����洦��
- Compress���ļ�ѹ������
- Output����Ӧ����
- Err500����Ӧ�ڲ��������ǰ���ĳЩ����Ĵ�����̷����쳣������������ת���˽ڵ�

## �Զ��� 404 ҳ��

Static ����ڵ�Բ����ڵ� URL ����ᵼ��ͣ�����Ӷ������������� Http ����ڵ㣬�� Http ����ڵ�Ĵ���ʽ�Ƿ���һ���򵥵� 404 ҳ�档��������뷵�ز�һ���� 404 ҳ�棬��ô�����Լ�����һ������ڵ㲢������Ϊ Static ����ڵ�ĺ�̡��������ʾ����ʾ��

```xml
<i:Http xmlns:i='//xmlweb'>
    <i:Static id='static'/>
    <NotFound id='notfound'/>
</i:Http>
```

��ʾ���� NotFound ����Ķ������£�

```js
NotFound: {
    xml: "<h1>This is not the page you are looking for.</h1>"
    fun: function (sys, items, opts) {
        this.on("enter", (e, r) => {
            r.res.statusCode = 404;
            r.res.setHeader("Content-Type", "text/html");
            r.res.end(this.serialize());
        });
    }
}
```

��Ȼ������Զ���������ص� 404 ҳ��ǳ��򵥣�����Խ�һ���޸ĳ�����Ҫ�����ӡ�