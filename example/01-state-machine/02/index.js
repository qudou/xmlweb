let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <Machine id='machine'/>\
                  </i:HTTP>"
        },
        Machine: {
            xml: "<i:Falls xmlns:i='//xmlweb'>\
                    <i:Router url='/index.html'/>\
                    <Hello id='hello'/>\
                 </i:Falls>"
        },
        Hello: {
            fun: function (sys, items, opts) {
                this.on("enter", (e, d) => {
                    d.res.setHeader("Content-Type", "text/html");
                    d.res.end("hello, world");
                });
            }
        }
    });
}).startup("//xp/Index");