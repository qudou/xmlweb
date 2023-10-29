let xmlweb = require("xmlweb");

xmlweb("xmlweb", function (xp, $_) {
    $_("static").imports({
        Reply: {
            xml: "<h1>This is not the page you are looking for.</h1>",
            fun: function (sys, items, opts) {
                this.watch("next", (e, d) => {
                    d.res.statusCode = 404;
                    d.res.setHeader("Content-Type", "text/html");
                    d.res.end(this.serialize());
                });
            }
        }
    });
});

xmlweb("xp", function (xp, $_) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Static id='static' root='static'/>\
                  </i:HTTP>"
        }
    });
}).startup("//xp/Index");