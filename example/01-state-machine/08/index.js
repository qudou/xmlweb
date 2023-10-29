let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Router url='/:id.html'/>\
                    <Machine id='machine'/>\
                    <Hello id='hello'/>\
                  </i:HTTP>",
			fun: function (sys, items, opts) {
				this.on("jump", (e, d) => {
                    sys.hello.notify("next", d);
                });
			}
        },
        Machine: {
			map: { msgFilter: /next/ },
            xml: "<i:Falls xmlns:i='//xmlweb'>\
                    <Alice id='alice'/>\
                  </i:Falls>"
        },
        Alice: {
            fun: function (sys, items, opts) {
                this.watch("next", (e, d) => this.trigger("jump", d));
            }
        },
        Hello: {
            fun: function (sys, items, opts) {
                this.watch("next", (e, d) => {
                    d.res.setHeader("Content-Type", "text/html");
                    d.res.end("hello, world");
                });
            }
        }
    });
}).startup("//xp/Index");