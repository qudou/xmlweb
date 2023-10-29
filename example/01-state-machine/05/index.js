let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Router id='router' url='/:id.html'/>\
                    <Middle id='middle'/>\
                    <i:Static id='static' root='static'/>\
                  </i:HTTP>"
        },
        Middle: {
            xml: "<h1 id='middle'/>",
            fun: function (sys, items, opts) {
                let fs = require("fs");
                this.watch("next", (e, d) => {
                    sys.middle.text("hello, " + d.args.id);
                    fs.writeFileSync("static" + d.req.url, this.serialize(), "utf8");
                    this.trigger("next", d);
                });
            }
        }
    });
}).startup("//xp/Index");