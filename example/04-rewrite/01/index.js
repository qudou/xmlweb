let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Rewrite from='/' to='/index.html'/>\
                    <Response id='response'/>\
                  </i:HTTP>"
        },
        Response: {
            fun: function (sys, items, opts) {
                this.on("enter", (e, d) => {
                    d.res.setHeader("Content-Type", "text/html");
                    d.res.end(`original URL: ${d.req.url}; rewrited URL: ${d.url}`);
                });
            }
        }
    });
}).startup("//xp/Index");