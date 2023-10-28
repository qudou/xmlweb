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
            xml: "<main id='middle'>\
			         <h1 id='label'/>\
				  </main>",
            fun: function (sys, items, opts) {
                let fs = require("fs");
                this.on("enter", (e, d) => {
                    sys.label.text("hello, " + d.args.id);
                    fs.writeFileSync("static" + d.req.url, sys.label.serialize(), "utf8");
                });
            }
        }
    });
}).startup("//xp/Index");