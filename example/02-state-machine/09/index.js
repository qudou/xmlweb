let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <Hello id='hello'/>\
                  </i:HTTP>"
        },
        Hello: {
            fun: function (sys, items, opts) {
                this.on("enter", (e, d) => this.trigger("reject", d));
            }
        }
    });
}).startup("//xp/Index");