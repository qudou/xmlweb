/*!
 * xmlweb.js v1.0.1
 * https://github.com/qudou/xmlweb
 * (c) 2009-2017 qudou
 * Released under the MIT license
 */
let xmlplus = require("xmlplus");

xmlplus("xmlweb", (xp, $_, t) => {

$_().imports({
    Http: {
        map: { format: { "int": "listen" } },
        fun: function (sys, items, opts) {
            let first = this.first(),
                table = this.find("./*[@id]").hash();
            this.on("reply", (e, r, code) => {
                r.res.setHeader("Content-Type", "application/json; charset=utf-8");
                r.data = r.data || {};
                code !== undefined && (r.data.code = code);
                r.res.end(JSON.stringify(r.data));
            });
            this.on("reject", (e, r) => this.trigger("reply", r, false));
            this.on("next", (e, r, next) => {
                r.ptr[0] = table[next] || r.ptr[0].next();
                r.ptr[0] ? r.ptr[0].trigger("enter", r, false) : this.trigger("reply", r, false);
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
            let first = this.first(), table = this.find("./*[@id]").hash();
            this.on("enter", (e, r, next) => {
                r.ptr.unshift(first);
                first.trigger("enter", r, false);
            });
            this.on("next", (e, r, next) => {
                if ( e.target == sys.flow ) return;
                e.stopPropagation();
                if ( next == null ) {
                    r.ptr[0] = r.ptr[0].next();
                    r.ptr[0] ? r.ptr[0].trigger("enter", r, false) : this.trigger("reject", [r, next]);
                } else if ( table[next] ) {
                    (r.ptr[0] = table[next]).trigger("enter", r, false);
                } else {
                    this.trigger("reject", [r, next]);
                }
            });
            this.on("reject", (e, r, next) => {
                r.ptr.shift();
                e.stopPropagation();
                sys.flow.trigger("next", [r, next]);
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
        opt: { root: __dirname, url: "/*" }, 
        map: { attrs: { status: "root", router: "url" } }
    },
    Err404: {
        fun: function (sys, items, opts) {
            let text = "Not Found", fs = require("fs");
            try {
                let page = require("path").join(opts.root, "/404.html");
                fs.statSync(page).isFile() && (text = fs.readFileSync(page, "utf8"));
            } catch ( err ) {}
            this.on("enter", (e, r) => {
                r.res.statusCode = 404;
                r.res.setHeader("Content-Type", "text/html");
                r.res.end(text);
            });
        }
    }
});

$_("header").imports({
    Header: {
        fun: function (sys, items, opts) {
            return opts;
        }
    },
    AddHeaders: {
        fun: function (sys, items, opts) {
            this.on("enter", (e, obj) => {
                this.children().forEach(item => {
                    let o = item.value();
                    obj.res.setHeader(o.key, o.value);
                });
                this.trigger("next", obj);
            });
        }
    }
});

$_("rewrite").imports({
    Roule: {
        map: { extend: { "from": "/header/Header" } }
    },
    Rewrite: {
        fun: function (sys, items, opts) {
            let table = [],
                regexp = /\$(\d+)|(?::(\w+))/g,
                toRegexp = require("path-to-regexp");
            this.on("enter", (e, obj) => {
                table.forEach(item => {
                    let m = item["from"].exec(obj.req.url);
                    m && (obj.url = item["to"].replace(regexp, (_, n, name) => {return m[item.map[name].index + 1]}));
                });
                console.log("hello", obj.url);
                this.trigger("next", obj);
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
    Router: {
        xml: "<main id='router' xmlns:i='parser'>\
                <i:ParseURL id='url'/>\
                <i:ParseBody id='body'/>\
              </main>",
        opt: { url: "/", method: "POST", usebody: true },
        map: { attrs: {"url": "url"}, format: {"bool": "usebody"} },
        fun: function (sys, items, opts) {
            this.on("enter", async (e, r) => {
                if ( r.req.method != opts.method )
                    return this.trigger("reject", r);
                r.args = items.url(r.req.url);
                if ( r.args == false )
                    return this.trigger("reject", r);
                if ( r.req.method == "POST" && opts.usebody )
                    r.body = await items.body(r.req);
                this.trigger("next", r);
            });
        }
    },
    Session: {
        xml: "<main xmlns:i='/session'>\
                <i:Cookie id='cookie'/>\
                <i:Session id='session'/>\
              </main>",
        fun: function (sys, items, opts) {
            this.on("enter", (e, r) => {
                let data = items.cookie.parse(r.req.headers.cookie || ""),
                    obj = items.session.has(data.ssid);
                obj ? (r.user = obj.data, this.trigger("next", r)) : this.trigger("reply", [r, -2]); 
            });
        }
    },
    Location: {
        xml: "<x:Flow xmlns:x='/' xmlns:l='location'>\
                 <Router id='router' method='GET'/>\
                 <l:Validate id='validate'/>\
                 <l:Redirect id='redirect'/>\
              </x:Flow>",
        map: { attrs: {router: "from->url", redirect: "to"} }
    }
});

$_("router/parser").imports({
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
            return req => {
                let data = '', resolve;
                req.setEncoding('utf8');
                req.on("data", chunk => data += chunk);
                req.on("end", () => parse(data, resolve));
                return new Promise(resolve_ => resolve = resolve_);
            };
        }
    }
});

$_("router/location").imports({
    Validate: {
        xml: "<main xmlns:i='/session'>\
                <i:Cookie id='cookie'/>\
                <i:Session id='session'/>\
              </main>",
        fun: function (sys, items, opts) {
            this.on("enter", (e, r) => {
                let data = items.cookie.parse(r.req.headers.cookie || ""),
                    obj = items.session.has(data.ssid);
                obj ? (r.user = obj.data, this.trigger("next", r)) : this.trigger("reject", r);
            });
        }
    },
    Redirect: {
        fun: function (sys, items, opts) {
            this.on("enter", (e, r) => {
                r.res.statusCode = 302;
                r.res.setHeader("Location", opts["to"]);
                this.trigger("reply", r);
            });
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
            this.on("enter", async (e, r) => {
                r.path = path.join(opts.root, url.parse(r.url).pathname);
                r.ext = (path.extname(r.path) || ".txt").slice(1);
                let s = await status(r.path);
                if ( s.err == null ) {
                    s.stat.isFile() ? this.trigger("next", (r.stat = s.stat, r)) : this.trigger("reject", r);
                } else if (s.err.code == "ENOENT") {
                    this.trigger("reject", r);
                } else {
                    r.err = s.err, this.trigger("next", [r,"err500"]);
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
            this.on("enter", (e, r) => {
                if ( r.ext.match(opts.file) ) {
                    let expires = new Date;
                    expires.setTime(Date.now() + opts.maxAge * 1000);
                    r.res.setHeader("Expires", expires.toUTCString());
                    r.res.setHeader("Cache-Control", "max-age=" + opts.maxAge);
                }
                let lastModified = r.stat.mtime.toUTCString();
                r.res.setHeader("Last-Modified", lastModified);
                if ( r.req.headers["if-modified-since"] && lastModified == r.req.headers["if-modified-since"] ) {
                    r.res.statusCode = 304;
                    r.res.setHeader("Content-Type", "text/html");
                    return r.res.end();
                }
                this.trigger("next", r);
            });
        }
    },
    Compress: {
        fun: function (sys, items, opts) {
            let types = new Set(['css','js','html']),
                fs = require("fs"), zlib = require("zlib");
            this.on("enter", (e, r) => {
                let encoding = r.req.headers['accept-encoding'] || "";
                r.raw = fs.createReadStream(r.path);
                if ( !types.has(r.ext) )
                    return this.trigger("next", r);
                if ( encoding.match(/\bgzip\b/) ) {
                    r.compress = zlib.createGzip();
                    r.res.setHeader("Content-Encoding", "gzip");
                } else if ( encoding.match(/\bdeflate\b/) ) {
                    r.compress = zlib.createDeflate();
                    r.res.setHeader("Content-Encoding", "deflate");
                }
                this.trigger("next", r);
            });
        }
    }, 
    Output: {
        fun: function (sys, items, opts) {
            let mime = { css: "text/css", gif: "image/gif", htm: "text/html", html: "text/html", ico: "image/x-icon", jpeg: "image/jpeg", jpg: "image/jpeg", js: "text/javascript", json: "application/json", pdf: "application/pdf", png: "image/png", svg: "image/svg+xml", swf: "application/x-shockwave-flash", tiff: "image/tiff", txt: "text/plain", wav: "audio/x-wav", wma: "audio/x-ms-wma", wmv: "video/x-ms-wmv", xml: "text/xml", zip: "application/zip", appcache: "text/cache-manifest" };
            this.on("enter", (e, r) => {
                r.res.setHeader("Content-Type", mime[r.ext] || "unknow"); 
                r.compress ? r.raw.pipe(r.compress).pipe(r.res) : r.raw.pipe(r.res);
            });
        }
    },
    Err500: {
        fun: function (sys, items, opts) {
            let util = require("util");
            this.on("enter", (e, r) => {
                r.res.statusCode = 500;
                r.res.setHeader("Content-Type", "text/html");
                r.res.end(util.inspect(r.err));
            });
        }
    }
});

});

module.exports = xmlplus;