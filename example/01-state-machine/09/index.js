let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Router url='/:id.html'/>\
                    <Machine id='machine'/>\
                    <Hello id='holder'/>\
                    <Hello id='dynamic' text='dynamic'/>\
                  </i:HTTP>"
        },
        Machine: {
            xml: "<i:Flow xmlns:i='//xmlweb'>\
                    <Next id='next'/>\
                    <Hello id='hello' text='hello, alice'/>\
                  </i:Flow>"
        },
        Next: {
            fun: function (sys, items, opts) {
                this.on("enter", (e, d) => this.trigger("reject", [d, "dynamic"]));
            }
        },
        Hello: {
            fun: function (sys, items, opts) {
                this.on("enter", (e, d) => {
                    d.res.setHeader("Content-Type", "text/html");
                    d.res.end(opts.text || "hello, world");
                });
            }
        }
    });
}).startup("//xp/Index");