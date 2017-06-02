let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Router id='router' url='/:id.html'/>\
                    <Creater id='creater'/>\
                    <i:Static id='static' root='static'/>\
                  </i:HTTP>"
        },
        Creater: {
            xml: "<h1 id='creater'/>",
            fun: function (sys, items, opts) {
                let fs = require("fs");
                this.on("enter", (e, d) => {
                    sys.creater.text("hello, " + d.args.id);
                    fs.writeFileSync("static" + d.req.url, this.serialize(), "utf8");
                    this.trigger("next", d);
                });
            }
        }
    });
}).startup("//xp/Index");