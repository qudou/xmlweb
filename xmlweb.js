/*!
 * xmlweb.js v1.1.24
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
            let statuses = require("statuses");
            this.on("reject", (e, d) => {
                d.res.statusCode = d.status = d.status || 501;
                d.res.setHeader("Content-Type", "text/html; charset=UTF-8");
                d.res.end(statuses[d.status] || String(d.status));
            });
            const SERVER = "xmlweb/" + require('os').type();
            require("http").createServer((req, res) => {
                res.setHeader("Server", SERVER);
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
        xml: "<Flow xmlns:s='static'>\
                <Router id='router'/>\
                <s:Status id='status'/>\
                <s:Cache id='cache'/>\
                <s:Ranges id='ranges'/>\
                <s:Compress id='compress'/>\
                <s:Output id='output'/>\
                <s:Error id='error'/>\
              </Flow>",
        opt: { root: ".", url: "/*" }, 
        map: { attrs: { router: "url", status: "root", cache: "etag lastModified cacheControl maxAge" } }
    },
    Router: {
        xml: "<main id='router' xmlns:i='/router'>\
                <i:ParseURL id='url'/>\
                <i:ParseBody id='body'/>\
              </main>",
        opt: { url: "/*", method: "GET", usebody: true },
        map: { attrs: {"url": "url"}, format: {"bool": "usebody"} },
        fun: function (sys, items, opts) {
            this.on("enter", async (e, d) => {
                if ( opts.method != '*' && d.req.method != opts.method )
                    return this.trigger(opts.ifNotMatch ? "next" : "reject", [d, opts.ifNotMatch]);
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
                d.res.end();
            });
        }
    },
    Session: {
        xml: "<main id='session' xmlns:i='session'>\
                <i:Cookie id='cookie'/>\
                <i:Manager id='manager'/>\
              </main>",
        map: { attrs: { cookie: "maxAge secure httpOnly", manager: "maxAge" } },
        fun: function (sys, items, opts) {
            this.on("enter", (e, d) => {
                d.cookies = items.cookie.parse(d.req.headers.cookie);
                d.session = items.manager.has(d.cookies.ssid);
                if ( !d.session ) {
                    d.session = items.manager.generate();
                    d.res.setHeader("Set-Cookie", [items.cookie.serialize("ssid", d.session.ssid)]);
                }
                this.trigger("next", d);
            });
            this.watch("save-session", (e, session) => items.manager.save(session.ssid));
            this.watch("destroy-session", (e, session) => items.manager.destroy(session.ssid));
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
                let map = {};
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
            function parse( cookies ) {
                let o, obj = {}, pair = /(.*?)=(.*?)(;|$)/g;
                while ( (o = pair.exec(cookies)) )
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
    Manager: {
        xml: "<Storage id='storage'/>",
        map: { format: { "int": "interval maxAge" } },
        opt: { interval: 60 * 1000, maxAge: 24 * 3600 * 1000 },
        fun: function (sys, items, opts) {
            let table = {}, uid = require('uid-safe').sync;
            function has(ssid) {
                return table[ssid];
            }
            function generate() {
                let ssid = uid(24);
                table[ssid] = { createtime: Date.now(), ssid: ssid };
                return table[ssid];
            }
            function destroy( ssid ) {
                if ( !table[ssid] ) return;
                delete table[ssid];
                items.storage.remove(ssid);
            }
            function save( ssid ) {
                table[ssid] && items.storage.save(ssid, table[ssid]);
            }
            setInterval(() => {
                let key, keyMap = [], now = Date.now();
                for ( key in table )
                    if (now - table[key].createtime > opts.maxAge )
                        keyMap.push(key);
                keyMap.forEach(destroy);
            }, opts.interval);
            items.storage.load();
            this.on("session-loaded", (e, data) => table = data);
            return { has: has, generate: generate, save: save, destroy: destroy };
        }
    },
    Storage: {
        xml: "<main id='storage'/>",
        fun: function (sys, items, opts) {
            let table = {}, fs = require("fs");
            function save( ssid, session ) {
                write(table[ssid] = session);
            }
            function remove( ssid ) {
                delete table[ssid]; write();
            }
            function write() {
                fs.writeFile("session", JSON.stringify(table), err => {
                    if ( err ) throw err;
                });
            }
            function load() {
                fs.stat("session", (err, stat) => {
                    if ( err == null )
                        table = JSON.parse(fs.readFileSync("session"));
                    else if (err.code != "ENOENT")
                        throw err;
                    sys.storage.trigger("session-loaded", table, false);
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
                let s = await status(d.path);
                if ( s.err == null ) {
                    s.stat.isFile() ? this.trigger("next", (d.stat = s.stat, d)) : this.trigger("reject", (d.status = 404, d));
                } else if (s.err.code == "ENOENT") {
                    this.trigger("reject", (d.status = 404, d));
                } else {
                    this.trigger("next", [(d.status = 500, d), "error"]);
                }
            });
            function status(path) {
                return new Promise(resolve => fs.stat(path, (err, stat) => resolve({err: err, stat: stat})));
            }
        }
    },
    Cache: {
        xml: "<IsPreconditionFailure id='isPreconditionFailure' xmlns='conditions'/>",
        opt: { etag: true, lastModified: true, cacheControl: false, maxAge: 3600 * 24 * 365 },
        map: { format: { "bool": "etag lastModified cacheControl", "int": "maxAge" } },
        fun: function (sys, items, opts) {
            let etag = require("etag"),
                fresh = require("fresh");
            this.on("enter", (e, d) => {
                let data = d;
                opts.etag && d.res.setHeader('ETag', etag(d.stat));
                opts.lastModified && d.res.setHeader('Last-Modified', d.stat.mtime.toUTCString());
                opts.cacheControl && d.res.setHeader('Cache-Control', `public, max-age=${opts.maxAge}`);
                if (isConditionalGET(d.req))
                    if (items.isPreconditionFailure(d.req, d.res)) {
                        data = [(d.status = 412, d), "error"];
                    } else if (isFresh(d.req, d.res)) {
                        data = [(d.status = 304, d), "error"];
                    }
                this.trigger("next", data);
            });
            function isConditionalGET (req) {
                return req.headers['if-match'] || req.headers['if-unmodified-since'] || req.headers['if-none-match'] || req.headers['if-modified-since'];
            }
            function isFresh (req, res) {
                return fresh(req.headers, {
                  'etag': res.getHeader('ETag'),
                  'last-modified': res.getHeader('Last-Modified')
                });
            }
        }
    },
    Ranges: {
        xml: "<IsRangeFresh id='isRangeFresh' xmlns='conditions'/>",
        fun: function (sys, items, opts) {
            let fs = require("fs"),
                BYTES_RANGE = /^ *bytes=/,
                parseRange = require('range-parser');
            this.on("enter", (e, d) => {
                let len = d.stat.size, ranges = d.req.headers.range;
                d.res.setHeader("Accept-Ranges", "bytes");
                if ( !BYTES_RANGE.test(ranges) || !items.isRangeFresh(d.req, d.res) )
                    return this.trigger("next", d);
                ranges = parseRange(len, ranges, {combine: true});
                if ( ranges === -1 ) {
                    d.res.setHeader('Content-Range', `bytes */${len}}`);
                    return this.trigger("next", [(d.status = 416, d), "error"]);
                }
                if ( ranges.length === 1 ) {
                    d.res.statusCode = 206;
                    d.res.setHeader('Content-Range', `bytes ${ranges[0].start + '-' + ranges[0].end + '/' + len}`);
                    d.res.setHeader('Content-Length', ranges[0].end - ranges[0].start + 1);
                    d.raw = fs.createReadStream(d.path, {start: ranges[0].start, end: ranges[0].end});
                    return this.trigger("next", [d, "output"]);
                }
                this.trigger("next", d);
            });
        }
    },
    Compress: {
        fun: function (sys, items, opts) {
            let types = new Set(['.css','.js','.htm','.html']),
                fs = require("fs"), zlib = require("zlib"), path = require("path");
            this.on("enter", (e, d) => {
                d.raw = fs.createReadStream(d.path);
                if ( !types.has(path.extname(d.path)) ) {
                    d.res.setHeader("Content-Length", d.stat.size);
                    return this.trigger("next", d);
                }
                let encoding = d.req.headers['accept-encoding'] || "";
                if ( encoding.indexOf("gzip") != -1 ) {
                    d.raw = d.raw.pipe(zlib.createGzip());
                    d.res.setHeader("Content-Encoding", "gzip");
                } else if ( encoding.indexOf("deflate") != -1 ) {
                    d.raw = d.raw.pipe(zlib.createDeflate());
                    d.res.setHeader("Content-Encoding", "deflate");
                } else {
                    d.res.setHeader("Content-Length", d.stat.size);
                }
                this.trigger("next", d);
            });
        }
    }, 
    Output: {
        fun: function (sys, items, opts) {
            let mime = require("mime");
            this.on("enter", (e, d) => {
                let type = mime.lookup(d.path),
                    charset = mime.charsets.lookup(type);
                d.res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
                d.raw.pipe(d.res);
            });
        }
    },
    Error: {
        fun: function (sys, items, opts) {
            let statuses = require("statuses");
            this.on("enter", (e, d) => {
                d.res.statusCode = d.status;
                d.res.setHeader("Content-Type", "text/html; charset=UTF-8");
                d.res.end(statuses[d.status] || String(d.status));
            });
        }
    }
});

$_("static/conditions").imports({
    IsPreconditionFailure: {
        xml: "<ParseHttpDate id='parseHttpDate'/>",
        fun: function (sys, items, opts) {
            const TOKEN_LIST = / *, */;
            return (req, res) => {
                let match = req.headers['if-match']
                if (match) {
                    let etag = res.getHeader('ETag');
                    return !etag || (match !== '*' && match.split(TOKEN_LIST_REGEXP).every(match => {
                        return match !== etag && match !== 'W/' + etag && 'W/' + match !== etag;
                    }));
                }
                let unmodifiedSince = items.parseHttpDate(req.headers['if-unmodified-since'])
                if (!isNaN(unmodifiedSince)) {
                    let lastModified = items.parseHttpDate(res.getHeader('Last-Modified'));
                    return isNaN(lastModified) || lastModified > unmodifiedSince;
                }
            };
        }
    },
    IsRangeFresh: {
        xml: "<ParseHttpDate id='parseHttpDate'/>",
        fun: function (sys, items, opts) {
            return (req, res) => {
                let ifRange = req.headers['if-range'];
                if (!ifRange) return true;
                if (ifRange.indexOf('"') !== -1) {
                    let etag = res.getHeader('ETag');
                    return Boolean(etag && ifRange.indexOf(etag) !== -1);
                }
                let lastModified = res.getHeader('Last-Modified');
                return items.parseHttpDate(lastModified) <= items.parseHttpDate(ifRange);
            };
        }
    },
    ParseHttpDate: {
        fun: function (sys, items, opts) {
            return date => {
                let timestamp = date && Date.parse(date);
                return typeof timestamp === 'number' ? timestamp : NaN;
            };
        }
    }
});

});

module.exports = xmlplus;