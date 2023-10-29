let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
    $_().imports({
        Index: {
            xml: "<i:HTTP listen='8080' xmlns:i='//xmlweb'>\
                    <i:Router url='/index.html'/>\
                    <Hello id='hello'/>\
                  </i:HTTP>"
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