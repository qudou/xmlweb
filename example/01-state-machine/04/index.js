let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_) {
    $_().imports({
        Index: {
            xml: "<i:HTTPS key='./privatekey.pem' cert='./certificate.pem' xmlns:i='//xmlweb'>\
                    <i:Router url='/index.html'/>\
                    <Hello id='hello'/>\
                  </i:HTTPS>"
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