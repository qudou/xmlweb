# URL �ض���

xmlweb ���õ� Redirect ���֧�������������͵��ض���

- 301: Moved Permanently
- 302: Found
- 303: See Other
- 307: Temporary Redirect

���У���Ӧ��Ϊ 301 ���ض���Ϊ�����ض�����Ӧ��Ϊ 302 �� 303 ���ض���Ϊ��ʱ�ض������ǵĲ�����ں�����ȷ��ʾ�ͻ���Ӧ���� GET ��ȡ��Դ����Ӧ��Ϊ 307 ���ض���� 302 ���ƣ���������������������Ӧ 302 Ӧ������ض��򣬼���ԭ���� POST ��Ϊ GET ���󣬵� 307 ���ᡣ

Redirect �����Ĭ�ϵĲ��õ�״̬���� `302`���������ʾ����ʾ��

```xml
<!-- 06-01 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Redirect to='http://xmlplus.cn'/>
</i:HTTP>
```

��ʾ�������κε����󶼻��ض����µ�ַ `http://xmlplus.cn`��

�����ͨ����̬���� `statusCode` ����ָ���ض�������ͣ��������ʾ��ָ����һ�����õ��ض���

<!-- 06-02 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Redirect statusCode='301' to='http://xmlplus.cn'/>
</i:HTTP>