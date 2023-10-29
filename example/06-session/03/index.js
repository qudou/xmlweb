let xmlweb = require("./storage");

xmlweb("xp", function (xp, $_) {
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
                    d.res.setHeader("Content-Type", "text/html");
                    d.res.end(`you viewed this site ${d.session.count} times`);
                });
            }
        }
    });
}).startup("//xp/Index");