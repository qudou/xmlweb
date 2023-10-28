let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Router url='/:id.html'/>\
                    <Jump id='jump'/>\
                    <Response id='page1' text='hello'/>\
                    <Response id='page2' text='world'/>\
                  </i:HTTP>"
        },
        Jump: {
            fun: function (sys, items, opts) {
                this.on("enter", (e, d) => {
                    if (d.args.id == "index") {
						e.stopPropagation();
						this.trigger("goto", [d, "page2"]);
					}
                });
            }
        },
        Response: {
            fun: function (sys, items, opts) {
                this.on("enter", (e, d) => {
					e.stopPropagation();
                    d.res.setHeader("Content-Type", "text/html");
                    d.res.end(opts.text);
                });
            }
        }
    });
}).startup("//xp/Index");