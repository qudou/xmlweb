let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_, t) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Redirect to='http://xmlplus.cn'/>\
                  </i:HTTP>"
        }
    });
}).startup("//xp/Index");