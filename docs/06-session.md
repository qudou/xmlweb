# 会话

HTTP 协议是一种无状态的协议，为了弥补这种缺陷，需要引入 session 技术。下面从会话的创建、存储以及移除三个方面来讲述。

## 会话的创建

xmlweb 内置了一个 Session 组件，你可以像下面这样创建一个 Session 组件节点：

```xml
<!-- 06-01 -->
<i:HTTP xmlns:i='//xmlweb'>
    <i:Session id='session'/>
    <Response id='response'/>
</i:HTTP>
```

组件 Session 包含了如下的几个静态参数，你可以按需对默认值进行覆盖：

- `maxAge`：`Integer` Cookie 与 Session 的存活时间，默认为 `24 * 3600 * 1000ms`
- `secure`: 是否仅在 HTTPS 安全连接时才可以发送 Cookie，默认为 `false`
- `httpOnly`: `Boolean` 是否禁止 JavaScript 脚本访问 Cookie，默认为 `true`

在上面示例中，一旦数据流经过 Session 组件节点，你就可以在数据流上获取到一个名为 session 的对象。当然，数据流上还会附带一个 cookies 对象，下面是此示例的 Response 组件的具体内容：

```js
// 06-01
Response: {
    fun: function(sys, items, opts) {
        this.on("enter", (e, d) => {
            d.session.count = d.session.count || 0;
            d.session.count++;
            d.res.setHeader("Content-Type", "text/html");
            d.res.end(`you viewed this site ${d.session.count} times`);
        });
    }
}
```

此示例记录了用户访问站点的次数，每访问一次，`session` 中 `count` 属性值便增加 `1`。数据流中的 `session` 对象在创建之初包含了两个内容：`ssid` 和 `createtime`，前者是维系会话的标识符，后者是 session 对象的创建时间。

## 会话的存储

默认情况下，session 并不进行持久化存储，所以当你重启上述示例，原有的计数器会从 `0` 开始。如果你想对 session 进行持久化存储，可以在必要的时候发送一个 `save-session` 的消息，请看下面的示例：

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

该组件修改自上一节的 Response 组件，每当计数器发生更改的时候，则发送一次 `save-session` 消息以保存更改后的数据。

xmlweb 内置了一个 session 的存储驱动组件 Storage，它位于命名空间 `//xmlweb/session` 中，它包含了如下的三个接口：

- `load()`: 加载存储的所有的 session 对象，加载完毕需派发 `session-loaded` 事件，改事件携带一个 `session` 数组
- `save(ssid, session)`: 保存或者覆盖一个 `session` 对象，如果已存在则覆盖，否则新添加一个
- `remove(ssid)`: 移除一个 `session` 对象

组件 Storage 将数据以文本形式存放。你可以使用一个实现了上述接口的同名组件来覆盖默认的内置组件，如下面的示例所示：

```js
// 06-03
Storage: {
    xml: "<Sqlite id='db'/>",
    fun: function(sys, items, opts) {
        function load() {
            items.db.all("SELECT * FROM sessions", (err, rows) => {
                if ( err ) { throw err; }
                let result = [];
                rows.forEach(item => result.push(JSON.parse(item.data)));
                sys.db.trigger("session-loaded", [result], false);
            });
        }
        function save(ssid, session) {
            let stmt = items.db.prepare("INSERT INTO sessions(ssid, data) VALUES(?,?)");
            stmt.run(JSON.stringify(session), err => {if (err) throw err});
        }
        function remove(ssid) {
            let stmt = items.db.prepare("DELETE FROM sessions WHERE ssid=?");
            stmt.run(ssid, err => {if ( err ) throw err});
        }
        return { load: load, save: save, remove: remove };
    }
}
```

该 Storage 组件简单地实现了将 session 数据保存在 sqlite 数据库中。此数据库仅包含两个列：`ssid` 和 `data`，其中列 `ssid` 是一个 session 标识符，列 `data` 用于存放 `session` 对象集。

## 会话的移除

有时候我们需要移除已存在的 `session`，比如用户的登出操作。要移除 `session`，只要发送一个 `destroy-session` 的消息即可，请看下面的示例：

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
            d.res.end(`you viewed this site ${d.session.count} times`);
        });
    }
}
```

该组件内部判断计数器的计数情况，当计数器计数大于 `5` 时，随即派发一个移除 `session` 的操作，这样下次计数又得从 `0` 开始了。