let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Router url='/:id.html'/>\
                    <Middle id='middle'/>\
                    <Hello id='hello'/>\
                  </i:HTTP>"
        },
        Middle: {
            xml: "<i:Falls xmlns:i='//xmlweb'>\
                    <Alice id='alice'/>\
                    <Bob id='bob'/>\
                  </i:Falls>"
        },
        Alice: {
            fun: function (sys, items, opts) {
                this.on("enter", (e, d) => {
					console.log("alice");
					e.stopPropagation()
					this.trigger("continue", d);
				});
            }
        },
        Bob: {
            fun: function (sys, items, opts) {
                this.on("enter", (e, d) => {
					console.log("bob");
				});
            }
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