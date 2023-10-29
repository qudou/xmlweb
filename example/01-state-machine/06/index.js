let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
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
                this.watch("next", (e, d) => {
                    let bool = d.args.id == "index";
                    this.trigger("next", [d, bool ? null: "page2"]);
                });
            }
        },
        Response: {
            fun: function (sys, items, opts) {
                this.watch("next", (e, d) => {
                    d.res.setHeader("Content-Type", "text/html");
                    d.res.end(opts.text);
                });
            }
        }
    });
}).startup("//xp/Index");