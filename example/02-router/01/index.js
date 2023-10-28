let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Router id='router'/>\
                    <Response id='response'/>\
                  </i:HTTP>"
        },
        Response: {
            fun: function (sys, items, opts) {
                this.on("enter", (e, d) => {
                    d.res.setHeader("Content-Type", "application/json;");
                    d.res.end("hello, world");
                });
            }
        }
    });
}).startup("//xp/Index");