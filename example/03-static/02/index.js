let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Static id='static'/>\
                    <NotFound id='notfound'/>\
                  </i:HTTP>",
            cfg: { "static": {mime: {mp3: "audio/mpeg"}} }
        },
        NotFound: {
            xml: "<h1>This is not the page you are looking for.</h1>",
            fun: function (sys, items, opts) {
                this.on("enter", (e, r) => {
                    r.res.statusCode = 404;
                    r.res.setHeader("Content-Type", "text/html");
                    r.res.end(this.serialize());
                });
            }
        }
    });
}).startup("//xp/Index");