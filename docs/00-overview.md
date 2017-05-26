# 概述

xmlweb 是一个基于状态机理论设计的 web 服务器，使用它可以设计出高可读性、高可维护性的 web 服务应用。另外，xmlweb 基于 xmlplus 实现，你可以自由地使用 xmlplus 特性来高效地完成开发任务。

## 安装

通过 npm，你可以非常方便使用如下命令安装 xmlweb。

```bash
$ npm install xmlweb
```

下面是项目的基本组织结构：

```
xmlplus/
├── xmlweb.js
├── docs/
└── example/
```

在根目录 `xmlplus/` 下，xmlweb.js 是源文件，目录 `docs/` 和目录 `example/` 包含同名的子级目录。目录 `docs/` 包含框架的文档文件，`example/` 包含与文档相关的配套示例代码。

## 一个简单的 web 服务器

通过下面给出的代码，可以搭建一个非常简单的静态 web 服务器。

```js
// 00-01
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
```

注意到示例开头的一个注释 `00-01`，那么你可以根据此注释定位到目录 `/example/00/`，注释中的 `00` 即章节序，`01` 就是示例所在目录的名称。

在测试此示例之前，你需要在代码文件所在的当前目录创建一个名为 `static` 的子目录作为静态 web 服务器的根目录，并且在根目录下创建一个简单的 html 文件，假设该文件的名称为 `index.html`。那么，你可以在浏览器中输入如下的 URL 来访问刚才创建的文件。除了这个地址外，任何的其它的输入都会返回一个内置的简单的 `404` 页面。

```
http://localhost:81/index.html
```

要理解这个示例是如何工作的，你需要注意组件 Index 的视图项部分。此视图项包含一个 Http 组件、一个 Static 组件以及一个 NotFound 组件。当一个请求到来时，Http 会生成一个数据流。此数据流先会拜访组件 static，如果静态目录中存在请求文件，则返回此文件内容，否则数据流会进入组件对象 notfound，组件对象 notfound 简单地返回请求的资源不存在的提示。