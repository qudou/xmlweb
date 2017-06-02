# ����

xmlweb ��һ������״̬��������Ƶ� web ��������ʹ����������Ƴ��߿ɶ��ԡ��߿�ά���Ե� web ����Ӧ�á����⣬xmlweb ���� xmlplus ʵ�֣���������ɵ�ʹ�� xmlplus ��������Ч����ɿ������񡣵�Ȼ�����Ķ����ĵ�֮ǰ����ȷ�����Ѿ�����ʹ�� [xmlplus](http://xmlplus.cn) ��ܡ�

## ��װ

ͨ�� npm������Էǳ�����ʹ���������װ xmlweb��

```bash
$ npm install xmlweb
```

��������Ŀ�Ļ�����֯�ṹ��

```
xmlplus/
������ xmlweb.js
������ docs/
������ example/
```

�ڸ�Ŀ¼ `xmlplus/` �£�`xmlweb.js` ��Դ�ļ���Ŀ¼ `docs/` ��Ŀ¼ `example/` ����ͬ�����Ӽ�Ŀ¼��Ŀ¼ `docs/` ������ܵ��ĵ��ļ���`example/` �������ĵ���ص�����ʾ�����롣

## һ���򵥵� web ������

ͨ����������Ĵ��룬���Դһ���ǳ��򵥵ľ�̬ web ��������

```js
// 00-01
let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Static id='static' root='static'/>\
                  </i:HTTP>",
            fun: function (sys, items, opts) {
                console.log("service is ready");
            }
        }
    });
}).startup("//xp/Index");
```

ע�⵽ʾ����ͷ��һ��ע�� `00-01`����ô����Ը��ݴ�ע�Ͷ�λ��Ŀ¼ `/example/00-overview/01`��ע���е� `00` ���½���`01` ����ʾ������Ŀ¼�����ơ�

�ڲ��Դ�ʾ��֮ǰ������Ҫ�ڴ����ļ����ڵĵ�ǰĿ¼����һ����Ϊ `static` ����Ŀ¼��Ϊ��̬ web �������ĸ�Ŀ¼�������ڸ�Ŀ¼�´���һ���򵥵� HTML �ļ���������ļ�������Ϊ `index.html`����ô�����������������������µ� URL �����ʸղŴ������ļ���

```
http://localhost:8080/index.html
```

���������ַ�⣬�κε����������붼�᷵��һ�����õļ򵥵� `404` ҳ�档