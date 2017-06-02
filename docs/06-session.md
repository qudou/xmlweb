# Session

HTTP Э����һ����״̬��Э�飬Ϊ���ֲ�����ȱ�ݣ���Ҫ���� session ������

## Session �Ĵ���

xmlweb ������һ�� Session ������������������������һ�� Session ����ڵ㣺

```xml
<!-- 06-01 -->
Index: {
    xml: "<i:HTTP xmlns:i='//xmlweb'>\
              <i:Session id='session'/>\
              <Response id='response'/>\
          </i:HTTP>"
}
```

��� Session ���������µļ�����̬����������԰����Ĭ��ֵ���и��ǣ�

- `maxAge`��`Integer` Cookie �� Session �Ĵ��ʱ�䣬Ĭ��Ϊ `24 * 3600 * 1000ms`
- `secure`: �Ƿ���� HTTPS ��ȫ����ʱ�ſ��Է��� Cookie��Ĭ��Ϊ `false`
- `httpOnly`: `Boolean` �Ƿ��ֹ JavaScript �ű����� Cookie��Ĭ��Ϊ `true`

������ʾ���У�һ������������ Session ����ڵ㣬��Ϳ������������ϻ�ȡ��һ����Ϊ session �Ķ��󡣵�Ȼ���������ϻ��ḽ��һ�� cookies ���������Ǵ�ʾ���� Response ����ľ������ݣ�

```js
// 06-01
Response: {
    fun: function(sys, items, opts) {
        this.on("enter", (e, d) => {
            d.session.count = d.session.count || 0;
            d.session.count++;
            d.res.setHeader("Content-Type", "text/html");
            d.res.end("you viewed this site ${d.session.count} times");
        });
    }
}
```

��ʾ����¼���û�����վ��Ĵ�����ÿ����һ�� `session` �� `count` ����ֵ������ `1`���������е� `session` �����ڴ���֮���������������ݣ�`ssid` �� `createtime`��ǰ������άϵ�Ự�ı�ʶ���������� session ����Ĵ���ʱ�䡣

## Session �Ĵ洢

Ĭ������£�session �������г־û��洢�����Ե�����������ʾ����ԭ�еļ�������� `0` ��ʼ���������� session ���г־û��洢�������ڱ�Ҫ��ʱ����һ�� `save-session` ����Ϣ���뿴�����ʾ����

```js
// 06-02
Response: {
    fun: function(sys, items, opts) {
        this.on("enter", (e, d) => {
            d.session.count = d.session.count || 0;
            d.session.count++;
            this.notify("save-session", d.session);
            d.res.setHeader("Content-Type", "text/html");
            d.res.end("you viewed this site ${d.session.count} times");
        });
    }
}
```

������޸�����һ�ڵ� Response �����ÿ���������������ĵ�ʱ������һ�� `save-session` ��Ϣ�Ա�����ĺ�����ݡ�

xmlweb ������һ�� session �Ĵ洢������� Storage����λ�������ռ� `//xmlweb/session` �У������������µ������ӿڣ�

```js
load()
```

���ڼ��ش洢�����е� session ���󣬼��������Ҫ�ɷ�һ�� `session-loaded` �¼���Я������Ϊһ�� `session` ���顣

```js
save(ssid, session)
```

- `ssid`: `String` `session` ��ʶ��
- `session` `PlainObject` һ�� `session` ����

���ڱ�����߸���һ�� `session` ��������Ѵ����򸲸ǣ������´洢һ����

```js
remove(ssid)
```

- `ssid`: `String` `session` ��ʶ��

�����Ƴ�һ�� `session` ����

��� Storage ���������ı���ʽ��š������ʹ��һ��ʵ���������ӿڵ�ͬ�����������Ĭ�ϵ�����������������ʾ����ʾ��

```js
// 06-03
Storage: {
    xml: "<main id='storage'/>",
    fun: function(sys, items, opts) {
        let sqlite = require("sqlite3").verbose(),
            db = new sqlite.Database("data.db");
        function load() {
            db.all("SELECT * FROM sessions", (err, rows) => {
                if ( err ) { throw err; }
                let result = [];
                rows.forEach(item => result.push(JSON.parse(item.data)));
                sys.storage.trigger("session-loaded", result, false);
            });
        }
        function save(ssid, session) {
            let stmt = db.prepare("INSERT INTO sessions(ssid, data) VALUES(?,?)");
            stmt.run(JSON.stringify(session), err => {if (err) throw err});
        }
        function remove(ssid) {
            let stmt = db.prepare("DELETE FROM sessions WHERE ssid=?");
            stmt.run(ssid, err => {if ( err ) throw err});
        }
        return { load: load, save: save, remove: remove };
    }
}
```

�� Storage ����򵥵�ʵ���˽� session ���ݱ����� sqlite ���ݿ��С������ݿ�����������У�`ssid` �� `data`�������� `data` ���ڴ�� `session` ���󼯡�

## Session ���Ƴ�

��ʱ��������Ҫ�Ƴ��Ѵ��ڵ� `session`�������û��ĵǳ�������Ҫ�Ƴ� `sessio`n��ֻҪ����һ�� `destroy-session` ����Ϣ���ɣ��뿴�����ʾ����

```js
// 06-04
Response: {
    fun: function(sys, items, opts) {
        this.on("enter", (e, d) => {
            d.session.count = d.session.count || 0;
            d.session.count++;
            if ( d.session.count > 5 )
                this.notify("destroy-session", d.session);
            d.res.setHeader("Content-Type", "text/html");
            d.res.end("you viewed this site ${d.session.count} times");
        });
    }
}
```

������ڲ��жϼ������ļ������������������������ `5` ʱ���漴�ɷ�һ���Ƴ� session �Ĳ����������´μ����ֵô� `0` ��ʼ�ˡ�