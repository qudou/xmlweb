let xmlweb = require("xmlweb");

xmlweb("xmlweb", function (xp, $_, t) {
    $_().imports({
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
                    stmt.run(ssid, err => {if (err) throw err});
                }
                return { load: load, save: save, remove: remove };
            }
        }
    });
});

module.exports = xmlweb;