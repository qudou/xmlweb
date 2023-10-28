let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                      <i:Session id='session'/>\
                      <Response id='response'/>\
                  </i:HTTP>"
        },
        Response: {
            fun: function(sys, items, opts) {
                this.on("enter", (e, d) => {
                    d.session.count = d.session.count || 0;
                    d.session.count++;
                    d.res.setHeader("Content-Type", "text/html");
                    d.res.end(`you viewed this site ${d.session.count} times`);
                });
            }
        }
    });
}).startup("//xp/Index");