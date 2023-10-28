let xmlweb = require("xmlweb");

xmlweb("xmlweb", function (xp, $_, t) {
    $_("session").imports({
        Storage: {
            xml: "<Sqlite id='db'/>",
            fun: function(sys, items, opts) {
                function load() {
                    items.db.all("SELECT * FROM sessions", (err, rows) => {
                        if ( err ) { throw err; }
                        let result = {};
                        rows.forEach(item => result[item.ssid] = JSON.parse(item.data));
                        sys.db.trigger("session-loaded", result, false);
                    });
                }
                function save(ssid, session) {
                    let stmt = items.db.prepare("REPLACE INTO sessions(ssid, data) VALUES(?,?)");
                    stmt.run(ssid, JSON.stringify(session), err => {if (err) throw err});
                }
                function remove(ssid) {
                    let stmt = items.db.prepare("DELETE FROM sessions WHERE ssid=?");
                    stmt.run(ssid, err => {if (err) throw err});
                }
                return { load: load, save: save, remove: remove };
            }
        },
        Sqlite: {
            fun: function(sys, items, opts) {
                let sqlite = require("sqlite3").verbose();
                return new sqlite.Database("data.db");
            }
        }
    });
});

module.exports = xmlweb;