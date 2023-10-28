// get test: curl -X GET http://localhost:8080
// post test: curl -X POST http://localhost:8080

let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Router method='*'/>\
                    <Response id='response'/>\
                  </i:HTTP>"
        },
        Response: {
            fun: function (sys, items, opts) {
                this.on("enter", (e, d) => {
                    d.res.setHeader("Content-Type", "application/json;");
                    d.res.end(JSON.stringify({data: "hello, world"}));
                });
            }
        }
    });
}).startup("//xp/Index");