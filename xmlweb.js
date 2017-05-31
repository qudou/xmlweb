/*!
 * xmlweb.js v1.0.5
 * https://github.com/qudou/xmlweb
 * (c) 2009-2017 qudou
 * Released under the MIT license
 */
let xmlplus = require("xmlplus");

xmlplus("xmlweb", (xp, $_, t) => {

$_().imports({
    HTTP: {
        map: { format: { "int": "listen" } },
        fun: function (sys, items, opts) {
            let first = this.first(),
                table = this.find("./*[@id]").hash();
            this.on("next", (e, d, next) => {
                d.ptr[0] = table[next] || d.ptr[0].next();
                d.ptr[0] ? d.ptr[0].trigger("enter", d, false) : this.trigger("reject", d);
            });
            this.on("reject", (e, d) => {
				d.res.statusCode = 404;
				d.res.setHeader("Content-Type", "text/html");
                d.res.end("Not Found");
            });
            require("http").createServer((req, res) => {
                res.setHeader("Server", "Apache/2.2.22 (Ubuntu)");
                first.trigger("enter", {url: req.url, req:req, res:res, ptr:[first]}, false);
            }).listen(opts.listen || 8080);
        }
    },
    Flow: {
        xml: "<main id='flow'/>",
        fun: function (sys, items, opts) {
            let first = this.first(),
                table = this.find("./*[@id]").hash();
            this.on("enter", (e, d, next) => {
                d.ptr.unshift(first);
                first.trigger("enter", d, false);
            });
            this.on("next", (e, d, next) => {
                if ( e.target == sys.flow ) return;
                e.stopPropagation();
                if ( next == null ) {
                    d.ptr[0] = d.ptr[0].next();
                    d.ptr[0] ? d.ptr[0].trigger("enter", d, false) : this.trigger("reject", [d, next]);
                } else if ( table[next] ) {
                    (d.ptr[0] = table[next]).trigger("enter", d, false);
                } else {
                    this.trigger("reject", [d, next]);
                }
            });
            this.on("reject", (e, d, next) => {
                d.ptr.shift();
                e.stopPropagation();
                sys.flow.trigger("next", [d, next]);
            });
        }
    },
    Static: {
        cfg: { router: {method: "GET", usebody: false} },
        xml: "<Flow xmlns:r='router' xmlns:s='static'>\
                <r:Router id='router'/>\
                <s:Status id='status'/>\
                <s:Cache id='catch'/>\
                <s:Compress id='compress'/>\
                <s:Output id='output'/>\
                <s:Err500 id='err500'/>\
              </Flow>",
        opt: { root: ".", url: "/*" }, 
        map: { attrs: { status: "root", router: "url" }, cfgs: { output: "mime" } }
    },
    AddHeader: {
        map: { "extend": {"from": "header/AddHeader"} }
    },
    Router: {
        xml: "<main id='router' xmlns:i='/router'>\
                <i:ParseURL id='url'/>\
                <i:ParseBody id='body'/>\
              </main>",
        opt: { url: "/", method: "GET", usebody: true },
        map: { attrs: {"url": "url"}, format: {"bool": "usebody"} },
        fun: function (sys, items, opts) {
            this.on("enter", async (e, d) => {
                if ( d.req.method != opts.method )
                    return this.trigger("reject", d);
                d.args = items.url(d.req.url);
                if ( d.args == false )
                    return this.trigger("reject", d);
                if ( d.req.method == "POST" && opts.usebody )
                    d.body = await items.body(d.req);
                this.trigger("next", d);
            });
        }
    },
    Rewrite: {
        map: { "extend": {"from": "rewrite/Rewrite"} }
    },
    Redirect: {
        fun: function (sys, items, opts) {
            let table = {
                "301": "Moved Permanently",
                "302": "Found",
                "303": "See Other",
                "307": "Temporary Redirect"
            };
            let statusCode = table[opts.statusCode] ? opts.statusCode : "302";
            this.on("enter", (e, d) => {
                d.res.statusCode = statusCode;
                d.res.setHeader("Location", opts["to"]);
                d.res.end(table[statusCode]);
            });
        }
    }
});

$_("header").imports({
    Header: {
        xml: "<span id='span'/>",
        map: { attrs: { span: "key value" } },
        fun: function (sys, items, opts) {
            return opts;
        }
    },
    AddHeader: {
        fun: function (sys, items, opts) {
            this.on("enter", (e, d) => {
                opts.key && d.res.setHeader(opts.key, opts.value);
                this.children().forEach(item => {
                    let o = item.value();
                    d.res.setHeader(o.key, o.value);
                });
                this.trigger("next", d);
            });
        }
    }
});

$_("rewrite").imports({
    Roule: {
        xml: "<span id='span'/>",
        map: { attrs: { span: "from to" } },
        fun: function (sys, items, opts) {
            return opts;
        }
    },
    Rewrite: {
        fun: function (sys, items, opts) {
            let table = [],
                regexp = /\$(\d+)|(?::(\w+))/g,
                toRegexp = require("path-to-regexp");
            this.on("enter", (e, d) => {
                for (item of table) {
                    let m = item["from"].exec(d.req.url);
                    if ( !m ) continue;
                    d.url = item["to"].replace(regexp, (_, n, name) => {return m[item.map[name].index + 1]});
                    break;
                }
                this.trigger("next", d);
            });
            function toMap(params) {
                var map = {};
                params.forEach((param, i) => {
                    param.index = i;
                    map[param.name] = param;
                });
                return map;
            }
            function prepare(item) {
                let keys = [];
                table.push({"from": toRegexp(item["from"], keys), "to": item["to"]});
                table[table.length-1].map = toMap(keys);
            }
            opts["from"] && prepare(opts);
            this.children().values().forEach(prepare);
        }
    }
});

$_("router").imports({
    ParseURL: {
        fun: function (sys, items, opts) {
            let pathRegexp = require("path-to-regexp"),
                regexp = pathRegexp(opts.url || "/", opts.keys = [], {});
            function decode(val) {
                if ( typeof val !== "string" || val.length === 0 ) return val;
                try {
                    val = decodeURIComponent(val);
                } catch(e) {}
                return val;
            }
            return path => {
                let res = regexp.exec(path);
                if (!res) return false;
                let params = {};
                for (let i = 1; i < res.length; i++) {
                    let key = opts.keys[i - 1], val = decode(res[i]);
                    if (val !== undefined || !(hasOwnProperty.call(params, key.name)))
                        params[key.name] = val;
                }
                return params;
            };
        }
    },
    ParseBody: {
        fun: function (sys, items, opts) {
            function parse(data, resolve) {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            }
            return function (req) {
                let data = '', resolve;
                req.setEncoding('utf8');
                req.on("data", chunk => data += chunk);
                req.on("end", () => {
                    req.headers["content-type"] == "application/json" ? parse(data, resolve) : resolve(data);
                });
                return new Promise(resolve_ => resolve = resolve_);
            };
        }
    }
});

$_("session").imports({
    Cookie: {
        opt: { httpOnly: true, path: "/", maxAge: 24 * 3600 * 1000 },
        fun: function (sys, items, opts) {
            function decode( str ) {
                try {
                    return decodeURIComponent(str);
                } catch (e) { return str };
            }
            function parse( str ) {
                let o, obj = {}, pair = /(.*?)=(.*?)(;|$)/g;
                while ( (o = pair.exec(str)) )
                    obj[o[1].trim()] = decode(o[2].trim());
                return obj;
            }
            function expires( maxAge ) {
                let date = new Date;
                date.setTime(Date.now() + maxAge);
                return date.toUTCString();
            }
            function serialize( name, val, opt ) {
                let pairs = [name + '=' + encodeURIComponent(val)];
                opt = xp.extend({}, opts, opt);
                if ( opt.maxAge ) pairs.push('Expires=' + expires(opt.maxAge));
                if ( opt.path ) pairs.push('Path=' + opt.path);
                if ( opt.domain ) pairs.push('Domain=' + opt.domain);
                if ( opt.httpOnly ) pairs.push('HttpOnly');
                if ( opt.secure ) pairs.push('Secure');
                return pairs.join('; ');
            }
            return { parse: parse, serialize: serialize };
        }
    },
    Session: {
        xml: "<Storage id='storage'/>",
        map: { format: { "int": "interval timeToLive" } },
        opt: { interval: 60 * 1000, timeToLive: 24 * 3600 * 1000 },
        fun: function (sys, items, opts) {
            let table = {}, crypto = require("crypto-js");
            function has( val ) {
                return table[val];
            }
            function generate( data ) {
                let ssid = crypto.lib.WordArray.random(48).toString();
                table[ssid] = { data: data, createtime: Date.now() };
                items.storage.save(ssid, table[ssid].createtime, data);
                return ssid;
            } 
            function destroy( val ) {
                if ( !table[val] ) return;
                delete table[val];
                items.storage.remove(val);
            }
            setInterval(() => {
                let key, keyMap = [], now = Date.now();
                for ( key in table )
                    if (now - table[key].createtime > opts.timeToLive )
                        keyMap.push(key);
                keyMap.forEach(destroy);
            }, opts.interval);
            items.storage.load();
            this.on("session-loaded", (e, data) => table = data);
            return { has: has, generate: generate, destroy: destroy };
        }
    },
    Storage: {
        xml: "<main id='storage'/>",
        fun: function (sys, items, opts) {
            let table = {}, fs = require("fs");
            function load() {
                fs.stat("session", onload);
            }
            function save( val, createtime, data ) {
                write(table[val] = { data: data, createtime: createtime });
            }
            function remove( val ) {
                delete table[val]; write();
            }
            function onload( err, stat ) {
                if ( err == null )
                    table = JSON.parse(fs.readFileSync("session"));
                else if (err.code != "ENOENT")
                    throw err;
                sys.storage.trigger("session-loaded", table, false);
            }
            function write() {
                fs.writeFile("session", JSON.stringify(table), err => {
                    if ( err ) throw err;
                });
            }
            return { load: load, save: save, remove: remove };
        }
    }
});

$_("static").imports({
    Status: {
        fun: function (sys, items, opts) {
            let fs = require("fs"), url = require("url"), path = require("path");
            this.on("enter", async (e, d) => {
                d.path = path.join(opts.root, url.parse(d.url).pathname);
                d.ext = (path.extname(d.path) || ".txt").slice(1);
                let s = await status(d.path);
                if ( s.err == null ) {
                    s.stat.isFile() ? this.trigger("next", (d.stat = s.stat, d)) : this.trigger("reject", d);
                } else if (s.err.code == "ENOENT") {
                    this.trigger("reject", d);
                } else {
                    d.err = s.err, this.trigger("next", [d,"err500"]);
                }
            });
            function status(path) {
                return new Promise(resolve => fs.stat(path, (err, stat) => resolve({err: err, stat: stat})));
            }
        }
    },
    Cache: {
        opt: { file: /^(gif|png|jpg|js|css)$/ig, maxAge: 24 * 3600 * 365 },
        fun: function (sys, items, opts) {
            this.on("enter", (e, d) => {
                if ( d.ext.match(opts.file) ) {
                    let expires = new Date;
                    expires.setTime(Date.now() + opts.maxAge * 1000);
                    d.res.setHeader("Expires", expires.toUTCString());
                    d.res.setHeader("Cache-Control", "max-age=" + opts.maxAge);
                }
                let lastModified = d.stat.mtime.toUTCString();
                d.res.setHeader("Last-Modified", lastModified);
                if ( d.req.headers["if-modified-since"] && lastModified == d.req.headers["if-modified-since"] ) {
                    d.res.statusCode = 304;
                    d.res.setHeader("Content-Type", "text/html");
                    return d.res.end();
                }
                this.trigger("next", d);
            });
        }
    },
    Compress: {
        fun: function (sys, items, opts) {
            let types = new Set(['css','js','html']),
                fs = require("fs"), zlib = require("zlib");
            this.on("enter", (e, d) => {
                let encoding = d.req.headers['accept-encoding'] || "";
                d.raw = fs.createReadStream(d.path);
                if ( !types.has(d.ext) )
                    return this.trigger("next", d);
                if ( encoding.match(/\bgzip\b/) ) {
                    d.compress = zlib.createGzip();
                    d.res.setHeader("Content-Encoding", "gzip");
                } else if ( encoding.match(/\bdeflate\b/) ) {
                    d.compress = zlib.createDeflate();
                    d.res.setHeader("Content-Encoding", "deflate");
                }
                this.trigger("next", d);
            });
        }
    }, 
    Output: {
        fun: function (sys, items, opts) {
            let mime = { css: "text/css", gif: "image/gif", htm: "text/html", html: "text/html", ico: "image/x-icon", jpeg: "image/jpeg", jpg: "image/jpeg", js: "text/javascript", json: "application/json", pdf: "application/pdf", png: "image/png", svg: "image/svg+xml", tiff: "image/tiff", txt: "text/plain", wav: "audio/x-wav", xml: "text/xml", zip: "application/zip" };
            for ( let k in opts.mime )
                mime[k] || (mime[k] = opts.mime[k]);
            this.on("enter", (e, d) => {
                d.res.setHeader("Content-Type", mime[d.ext] || "unknow"); 
                d.compress ? d.raw.pipe(d.compress).pipe(d.res) : d.raw.pipe(d.res);
            });
        }
    },
    Err500: {
        fun: function (sys, items, opts) {
            let util = require("util");
            this.on("enter", (e, d) => {
                d.res.statusCode = 500;
                d.res.setHeader("Content-Type", "text/html");
                d.res.end(util.inspect(d.err));
            });
        }
    }
});

});

module.exports = xmlplus;