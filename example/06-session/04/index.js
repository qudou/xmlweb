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
                this.watch("next", (e, d) => {
                    d.session.count = d.session.count || 0;
                    d.session.count++;
                    if ( d.session.count == 5 )
                        this.notify("destroy-session", d.session);
                    d.res.setHeader("Content-Type", "text/html");
                    d.res.end(`you viewed this site ${d.session.count} times`);
                });
            }
        }
    });
}).startup("//xp/Index");