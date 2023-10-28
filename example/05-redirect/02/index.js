let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <i:Redirect statusCode='301' to='http://xmlplus.cn'/>\
                  </i:HTTP>"
        }
    });
}).startup("//xp/Index");