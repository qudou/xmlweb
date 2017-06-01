# Session

HTTP 协议是一种无状态的协议，为了弥补这种缺陷，需要引入 session 技术。

## Session 的创建

xmlweb 内置了一个 Session 组件，你可以像下面这样创建一个 Session 组件节点：

```xml
<!-- 06-01 -->
Index: {
    xml: "<i:HTTP xmlns:i='//xmlweb'>\
              <i:Session id='session'/>\
              <Response id='response'/>\
          </i:HTTP>"
}
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
            d.res.end("you viewed this site ${d.session.count} times");
        });
    }
}
```

此示例记录了用户访问站点的次数，每访问一次 `session` 中 `count` 属性值便增加 `1`。数据流中的 session 对象在创建之初包含了两个内容：`ssid` 和 `createtime`，前进者是维系会话的标识符，后都是 session 对象的创建时间。

## Session 的存储

默认情况下，session 并不进行持久化存储，所以当你重启上述示例，原有的计数器会从 `0` 开始。如果你想对 session 进行持久化存储，可以在必要的时候发送一个 `save-session` 的消息，请看下面的示例：

```js
// 06-02
Response: {
    fun: function(sys, items, opts) {
        this.on("enter", (e, d) => {
            d.session.count = d.session.count || 0;
            d.session.count++;
            this.notify("save-session", d.session.ssid);
            d.res.setHeader("Content-Type", "text/html");
            d.res.end("you viewed this site ${d.session.count} times");
        });
    }
}
```

该组件修改自上一节的 Response 组件，每当计数器发生更改的时候，则发送一次 `save-session` 消息以保存更改后的数据。

xmlweb 内置了一个 session 的存储驱动组件 Storage，它位于命名空间 `//xmlweb/session` 中，它包含了如下的接口：

```js
load()
```

用于加载存储的所有的 session 对象，加载完毕需要派发一个 `session-loaded` 事件，携带参数为一个 session 数组

```js
save(ssid, session)
```

- `ssid`: `String` session 标识符
- `session` `PlainObject` 一个 session 对象

用于保存或者覆盖一个 session 对象，如果已存在则覆盖，否则新存储一个

```js
remove(ssid)
```

- `ssid`: `String` session 标识符

用于移除一个 session 对象。

组件 Strong 将数据以文本形式存放。你可以使用一个实现了上述接口的组件来覆盖默认的内置组件 Storage，如下面的示例所示：

```js
// 06-03
Storage: {
    xml: "<Sqlite id='sqlite'/>",
    fun: function(sys, items, opts) {
        function load() {
            var stmt = "SELECT * FROM sessions";
            items.sqlite.all(stmt, (err, rows) => {
                if ( err ) { throw err; }
                let result = [];
                rows.forEach(item => result.push(JSON.parse(item.data)));
                sys.sqlite.trigger("session-loaded", result, false);
            });
        }
        function save(ssid, session) {
            let insert = "INSERT INTO sessions(ssid, data) VALUES(?,?)",
                stmt = items.sqlite.prepare(insert);
                stmt.run(JSON.stringify(session), err => {
                    if ( err ) throw err;
                });
            });
        }
        function remove(ssid) {
            let remove = "DELETE FROM sessions WHERE ssid=?";
            let stmt = items.sqlite.prepare(remove);
            stmt.run(ssid, err => {
                if ( err ) throw err;
            });
        }
        return { load: load, save: save, remove: remove };
    }
}
```

该 Storage 组件简单地实现了将 session 数据保存在 sqlite 数据库中。此数据库仅包含两个列：`ssid` 和 `data`，其中列 `data` 用于存放 session 对象集。

## Session 的移除

有时候我们需要移除已存在的 session，比如用户的登出操作。要移除 session，只要发送一个 `destroy-session` 的消息即可，请看下面的示例：

```js
// 06-04
Response: {
    fun: function(sys, items, opts) {
        this.on("enter", (e, d) => {
            d.session.count = d.session.count || 0;
            d.session.count++;
            if ( d.session.count > 5 )
                this.notify("destroy-session", d.session.ssid);
            d.res.setHeader("Content-Type", "text/html");
            d.res.end("you viewed this site ${d.session.count} times");
        });
    }
}
```

该组件内部判断计数器的计数情况，当计数器计数大于 `5` 时，随即派发一个移除 session 的操作，这样下次计数又得从 `0` 开始了。