# URL ��д

URL ��д�ǽ�һ������� URL ����д����һ�� URL �Ĺ��̡�

## ���ı�ԭʼֵ����д

�� [״̬��](/state-machine) ��˵������������ HTTP ��������ڽ��յ��û�������ʱ���ɡ��ڳ�ʼ״̬������Ҫ���������µ����ݣ�

- req���������(request)
- res����Ӧ����(response)
- ptr��״̬���ڲ�ʹ�õ�ָ������
- url���� req.url һ��

URL ����д�����ı�������� req �е� url ԭʼֵ�����ı�����������е� url �������뿴�����ʾ����

```xml
<!-- 05-01 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Rewrite from='/' to='/index.html'/>
    <Response id='response'/>
</i:HTTP>
```

��ʾ���� Response ����������£�

```js
// 05-01
Response: {
    fun: function (sys, items, opts) {
        this.on("enter", (e, d) => {
            d.res.setHeader("Content-Type", "text/html");
            d.res.end(`original URL: ${d.req.url}; rewrited URL: ${d.url}` );
        });
    }
}
```

������������� `http://localhost:8080`����ô�㽫����ԭʼ URL �Լ����� Response ����ڵ���д��� URL��

## ��д����

URL ����д��������ʹ�� [·��](/router) �н��ܹ���·��ƥ������뿴�����ʾ����

```xml
<!-- 05-02 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Rewrite from='/:id' to='/:id.html'/>
    <Response id='response'/>
</i:HTTP>
```

��ʾ���� Response �������һ��ʾ����ͬ����ʾ���Ὣ�κεľ���ģʽ `/:id` �� URL ��дΪ����ģʽ `/:id.html` �� URL ��������е� `id` ֵ����һ�¡�

��һ����Ҫ���ѣ�Router ����ж�·����ƥ��ʹ�õ���ԭʼ URL������ʹ���������� url ���������Բ�Ҫ��ͼʹ�� Router ����ڵ����ʹ�� Rewrite ����ڵ���д��� url ֵ��

## ָ�������д��

��������� Rewrite ����ڵ�ֻ�ṩһ�� URL ����д���������Ҫ�ṩ��� URL ��д�����������������������һ����д����

```xml
// 05-03
Rewrite: {
    xml: "<i:Rewrite xmlns:i='//xmlweb/rewrite'>\
             <i:Roule from='/' to='/index'/>\
             <i:Roule from='/:id' to='/id.html'/>\
          </i:Rewrite>
}
```

��� Roule ������Ϊ Rewrite �������ʹ��������һ����д����������ʹ�ø��¶���� Rewrite �����ʾ����

```xml
<!-- 05-03 -->
<i:HTTP xmlns:i='//xmlweb'>
    <Rewrite id='rewrite'/>
    <Response id='response'/>
</i:HTTP>
```

��ʾ������� Response ��ǰ�������һ�¡�����������ַ `http://localhost:8080` ���ַ `http://localhost:8080` �ֱ�������ֲ�ͬ�������