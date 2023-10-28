// $ curl -H "Content-type: application/json" -X POST -d '{"key":"2017"}' http://localhost:8080

let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Router url='/' method='POST'/>\
                    <Response id='response'/>\
                  </i:HTTP>"
        },
        Response: {
            xml: "<h1>hello, world</h1>",
            fun: function (sys, items, opts) {
                this.on("enter", (e, d) => {
                    d.res.setHeader("Content-Type", "text/html");
                    d.res.end(JSON.stringify(d.body));
                });
            }
        }
    });
}).startup("//xp/Index");