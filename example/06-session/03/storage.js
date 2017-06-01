let xmlweb = require("xmlweb");

xmlweb("xmlweb", function (xp, $_, t) {
    $_().imports({
        Storage: {
            xml: "<main id='storage'/>",
            fun: function(sys, items, opts) {
                var sqlite = require("sqlite3").verbose(),
                return new sqlite.Database("data.db");
                function load() {
                    var stmt = "SELECT * FROM sessions";
                    sqlite.all(stmt, (err, rows) => {
                        if ( err ) { throw err; }
                        let result = [];
                        rows.forEach(item => result.push(JSON.parse(item.data)));
                        sys.storage.trigger("session-loaded", result, false);
                    });
                }
                function save(ssid, session) {
                    let insert = "INSERT INTO sessions(ssid, data) VALUES(?,?)",
                        stmt = sqlite.prepare(insert);
                    stmt.run(JSON.stringify(session), err => {if (err) throw err});
                }
                function remove(ssid) {
                    let remove = "DELETE FROM sessions WHERE ssid=?",
                        stmt = sqlite.prepare(remove);
                    stmt.run(ssid, err => {if (err) throw err});
                }
                return { load: load, save: save, remove: remove };
            }
        }
    });
});

module.exports = xmlweb;