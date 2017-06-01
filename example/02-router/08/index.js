let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Router url='/' usecookie='true'/>\
                    <Response id='response'/>\
                  </i:HTTP>"
        },
        Response: {
            xml: "<h1>hello, world</h1>",
            fun: function (sys, items, opts) {
                this.on("enter", (e, d) => {
                    d.res.setHeader("Content-Type", "text/html");
                    d.res.setHeader("Set-Cookie", "Path=/");
                    d.res.end(JSON.stringify(d.cookies));
                });
            }
        }
    });
}).startup("//xp/Index");