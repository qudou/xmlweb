let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
    $_().imports({
        Index: {
            xml: "<i:Http listen='81' xmlns:i='//xmlweb'>\
                    <i:Static id='static' root='static'/>\
                    <i:NotFound id='notfound'/>\
                  </i:Http>",
            fun: function (sys, items, opts) {
                console.log("service is ready");
            }
        }
    });
}).startup("//xp/Index");