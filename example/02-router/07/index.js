let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Router url='/index.html' err='notfound'/>\
                    <Response id='response'/>\
                    <NotFound id='notfound'/>\
                  </i:HTTP>"
        },
        Response: {
            fun: function (sys, items, opts) {
                this.watch("next", (e, d) => {
                    d.res.setHeader("Content-Type", "text/html");
                    d.res.end("hello,world");
                });
            }
        },
        NotFound: {
            fun: function (sys, items, opts) {
                this.watch("next", (e, d) => {
                    d.res.setHeader("Content-Type", "text/html");
                    d.res.end("input error!");
                });
            }
        }
    });
}).startup("//xp/Index");