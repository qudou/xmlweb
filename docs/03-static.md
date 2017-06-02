# ��̬������

Ϊ�˷���ʹ�ã�xmlweb ������һ���򵥵ľ�̬�������Ľڵ���� Static����Ȼ���ڴ web Ӧ��ʱ������Բ�ʹ��������ʹ���Զ���ľ�̬�������Ľڵ������

## ��̬�ӿ�

Ϊ���˽��������������ʹ�õģ����Ǵ�һ����򵥵�ʾ����ʼ��

```xml
<!-- 03-01 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Static id='static'/>
</i:HTTP>
```

�þ�̬ web ���������� 8080 �˿ڣ����Դ������ڵ��ļ�Ŀ¼Ϊ����Ŀ¼����Ȼ������ø�������һ�������Ĺ���Ŀ¼����ʾ�����ܼ򵥣�������������������������һЩ�����ṩ�ľ�̬�ӿ����ԣ�

- `url`: `String` ������������ܵ�����·������Ĭ��Ϊ `/*`
- `root`��`String` ����Ŀ¼��Ĭ��Ϊ�������ڵ��ļ�Ŀ¼
- `mime`��`PlainObject` ����� MIME ����

������ mime ������Ҫ���ʾ��˵���£�

```js
// 03-02
Index: {
    xml: "<i:HTTP xmlns:i='//xmlweb'>\
            <i:Static id='static'/>\
          </i:HTTP>",
    cfg: { "static": {mime: {mp3: "audio/mpeg"}} }
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

�������ڲ�������������ĳ�� MIME ���ͣ���ô����ڵ�᷵��һ��ֵ `unknow` �� `Content-Type` ��Ӧͷ��

## �ڲ��ṹ

Ϊ�˸��õ�ʹ�ø�������� Static ������ڲ���Щ�˽��Ǻ��б�Ҫ�ġ���� Static ʵ������һ��״̬������������Ǵ��������ͼ�

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

�Ӵ���ͼ����Կ�������״̬������������ɸ��ӽڵ�����������Ǹ��ӽڵ�����Ļ�����;��

- Router�����˵����еķ� GET ����
- Status����ȡĿ¼�ļ���״̬���ԣ�����ļ���������ʣ��ᵼ��״̬��ͣ��
- Catch���ļ����洦��
- Compress���ļ�ѹ������
- Output����Ӧ����
- Err500����Ӧ�ڲ��������ǰ���ĳЩ����Ĵ�����̷����쳣������������ת���˽ڵ�

## �Զ��� 404 ҳ��

Static ����ڵ�Բ����ڵ� URL ����ᵼ��ͣ�����Ӷ������������� HTTP ����ڵ㣬�� HTTP ����ڵ�Ĵ���ʽ�Ƿ���һ���򵥵� 404 ҳ�档��������뷵�ز�һ���� 404 ҳ�棬��ô�����Լ�����һ������ڵ㲢������Ϊ Static ����ڵ�ĺ�̡��������ʾ����ʾ��

```xml
<!-- 03-03 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Static id='static'/>
    <NotFound id='notfound'/>
</i:HTTP>
```

��ʾ���У����е� 404 ��Ӧ������ NotFound ����ڵ���ɡ�������ľ��嶨�����£�

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

��Ȼ������Զ���������ص� 404 ҳ�滹�Ƿǳ���ª�ģ�����Խ�һ���޸ĳ�����Ҫ�����ӡ�