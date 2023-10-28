# [xmlweb](https://github.com/qudou/xmlweb) &middot; <a href="https://www.npmjs.com/package/xmlweb"><img src="https://img.shields.io/npm/dt/xmlweb.svg" alt="Downloads"></a> <a href="https://www.npmjs.com/package/xmlweb"><img src="https://img.shields.io/npm/v/xmlweb.svg" alt="Version"></a> <a href="https://www.npmjs.com/package/xmlweb"><img src="https://img.shields.io/npm/l/xmlweb.svg" alt="License"></a>

Xmlweb is a web server designed based on the state machine theory. Before you learn to use the framework, make sure you are familiar with the [xmlplus](http://xmlplus.cn) framework.

## Installation

If having installed the NPM client, you can install xmlweb with NPM.

```bash
$ npm install xmlweb
```

Note, xmlweb requires node v7.0.0 or higher for ES2015 and async function support.

## Hello, world

You can test the example with `http://localhost`.

```js
let xmlweb = require("xmlweb");
xmlweb("xp", function (xp, $_) {
    $_().imports({
        Index: {
            xml: "<i:HTTP xmlns:i='//xmlweb'>\
                    <Hello id='hello'/>\
                  </i:HTTP>"
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
```

Visit [https://xmlplus.cn/xmlweb](https://xmlplus.cn/xmlweb) for more information.