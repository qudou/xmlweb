let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Router url='/index.html'/>\
                    <i:Static id='static'/>\
                  </i:HTTP>"
        }
    });
}).startup("//xp/Index");