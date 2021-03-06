let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <Rewrite id='rewrite'/>\
                    <Response id='response'/>\
                  </i:HTTP>"
        },
        Rewrite: {
            xml: "<i:Rewrite xmlns:i='//xmlweb/rewrite'>\
                     <i:Roule from='/' to='/index'/>\
                     <i:Roule from='/:id' to='/:id.html'/>\
                  </i:Rewrite>"
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