var Base64 = (function() {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var obj = {
        encode: function(input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64
                } else {
                    if (isNaN(chr3)) {
                        enc4 = 64
                    }
                }
                output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4)
            } while (i < input.length);
            return output
        },
        decode: function(input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2)
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3)
                }
            } while (i < input.length);
            return output
        }
    };
    return obj
})();

function b64_sha1(s) {
    return binb2b64(core_sha1(str2binb(s), s.length * 8))
}

function str_sha1(s) {
    return binb2str(core_sha1(str2binb(s), s.length * 8))
}

function b64_hmac_sha1(key, data) {
    return binb2b64(core_hmac_sha1(key, data))
}

function str_hmac_sha1(key, data) {
    return binb2str(core_hmac_sha1(key, data))
}

function core_sha1(x, len) {
    x[len >> 5] |= 128 << (24 - len % 32);
    x[((len + 64 >> 9) << 4) + 15] = len;
    var w = new Array(80);
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    var e = -1009589776;
    var i, j, t, olda, oldb, oldc, oldd, olde;
    for (i = 0; i < x.length; i += 16) {
        olda = a;
        oldb = b;
        oldc = c;
        oldd = d;
        olde = e;
        for (j = 0; j < 80; j++) {
            if (j < 16) {
                w[j] = x[i + j]
            } else {
                w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1)
            }
            t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
            e = d;
            d = c;
            c = rol(b, 30);
            b = a;
            a = t
        }
        a = safe_add(a, olda);
        b = safe_add(b, oldb);
        c = safe_add(c, oldc);
        d = safe_add(d, oldd);
        e = safe_add(e, olde)
    }
    return [a, b, c, d, e]
}

function sha1_ft(t, b, c, d) {
    if (t < 20) {
        return (b & c) | ((~b) & d)
    }
    if (t < 40) {
        return b ^ c ^ d
    }
    if (t < 60) {
        return (b & c) | (b & d) | (c & d)
    }
    return b ^ c ^ d
}

function sha1_kt(t) {
    return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514
}

function core_hmac_sha1(key, data) {
    var bkey = str2binb(key);
    if (bkey.length > 16) {
        bkey = core_sha1(bkey, key.length * 8)
    }
    var ipad = new Array(16),
        opad = new Array(16);
    for (var i = 0; i < 16; i++) {
        ipad[i] = bkey[i] ^ 909522486;
        opad[i] = bkey[i] ^ 1549556828
    }
    var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * 8);
    return core_sha1(opad.concat(hash), 512 + 160)
}

function safe_add(x, y) {
    var lsw = (x & 65535) + (y & 65535);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 65535)
}

function rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt))
}

function str2binb(str) {
    var bin = [];
    var mask = 255;
    for (var i = 0; i < str.length * 8; i += 8) {
        bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (24 - i % 32)
    }
    return bin
}

function binb2str(bin) {
    var str = "";
    var mask = 255;
    for (var i = 0; i < bin.length * 32; i += 8) {
        str += String.fromCharCode((bin[i >> 5] >>> (24 - i % 32)) & mask)
    }
    return str
}

function binb2b64(binarray) {
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var str = "";
    var triplet, j;
    for (var i = 0; i < binarray.length * 4; i += 3) {
        triplet = (((binarray[i >> 2] >> 8 * (3 - i % 4)) & 255) << 16) | (((binarray[i + 1 >> 2] >> 8 * (3 - (i + 1) % 4)) & 255) << 8) | ((binarray[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4)) & 255);
        for (j = 0; j < 4; j++) {
            if (i * 8 + j * 6 > binarray.length * 32) {
                str += "="
            } else {
                str += tab.charAt((triplet >> 6 * (3 - j)) & 63)
            }
        }
    }
    return str
}
var MD5 = (function() {
    var safe_add = function(x, y) {
        var lsw = (x & 65535) + (y & 65535);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 65535)
    };
    var bit_rol = function(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt))
    };
    var str2binl = function(str) {
        var bin = [];
        for (var i = 0; i < str.length * 8; i += 8) {
            bin[i >> 5] |= (str.charCodeAt(i / 8) & 255) << (i % 32)
        }
        return bin
    };
    var binl2str = function(bin) {
        var str = "";
        for (var i = 0; i < bin.length * 32; i += 8) {
            str += String.fromCharCode((bin[i >> 5] >>> (i % 32)) & 255)
        }
        return str
    };
    var binl2hex = function(binarray) {
        var hex_tab = "0123456789abcdef";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 15) + hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 15)
        }
        return str
    };
    var md5_cmn = function(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b)
    };
    var md5_ff = function(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
    };
    var md5_gg = function(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
    };
    var md5_hh = function(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t)
    };
    var md5_ii = function(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
    };
    var core_md5 = function(x, len) {
        x[len >> 5] |= 128 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        var olda, oldb, oldc, oldd;
        for (var i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;
            a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
            d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
            a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
            a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
            a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
            d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd)
        }
        return [a, b, c, d]
    };
    var obj = {
        hexdigest: function(s) {
            return binl2hex(core_md5(str2binl(s), s.length * 8))
        },
        hash: function(s) {
            return binl2str(core_md5(str2binl(s), s.length * 8))
        }
    };
    return obj
})();
if (!Function.prototype.bind) {
    Function.prototype.bind = function(obj) {
        var func = this;
        var _slice = Array.prototype.slice;
        var _concat = Array.prototype.concat;
        var _args = _slice.call(arguments, 1);
        return function() {
            return func.apply(obj ? obj : this, _concat.call(_args, _slice.call(arguments, 0)))
        }
    }
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt) {
        var len = this.length;
        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0) {
            from += len
        }
        for (; from < len; from++) {
            if (from in this && this[from] === elt) {
                return from
            }
        }
        return -1
    }
}(function(callback) {
    var Strophe;

    function $build(name, attrs) {
        return new Strophe.Builder(name, attrs)
    }

    function $msg(attrs) {
        return new Strophe.Builder("message", attrs)
    }

    function $iq(attrs) {
        return new Strophe.Builder("iq", attrs)
    }

    function $pres(attrs) {
        return new Strophe.Builder("presence", attrs)
    }
    Strophe = {
        VERSION: "1.1.3",
        NS: {
            HTTPBIND: "http://jabber.org/protocol/httpbind",
            BOSH: "urn:xmpp:xbosh",
            CLIENT: "jabber:client",
            AUTH: "jabber:iq:auth",
            ROSTER: "jabber:iq:roster",
            PROFILE: "jabber:iq:profile",
            DISCO_INFO: "http://jabber.org/protocol/disco#info",
            DISCO_ITEMS: "http://jabber.org/protocol/disco#items",
            MUC: "http://jabber.org/protocol/muc",
            SASL: "urn:ietf:params:xml:ns:xmpp-sasl",
            STREAM: "http://etherx.jabber.org/streams",
            BIND: "urn:ietf:params:xml:ns:xmpp-bind",
            SESSION: "urn:ietf:params:xml:ns:xmpp-session",
            VERSION: "jabber:iq:version",
            STANZAS: "urn:ietf:params:xml:ns:xmpp-stanzas",
            XHTML_IM: "http://jabber.org/protocol/xhtml-im",
            XHTML: "http://www.w3.org/1999/xhtml"
        },
        XHTML: {
            tags: ["a", "blockquote", "br", "cite", "em", "img", "li", "ol", "p", "span", "strong", "ul", "body"],
            attributes: {
                a: ["href"],
                blockquote: ["style"],
                br: [],
                cite: ["style"],
                em: [],
                img: ["src", "alt", "style", "height", "width"],
                li: ["style"],
                ol: ["style"],
                p: ["style"],
                span: ["style"],
                strong: [],
                ul: ["style"],
                body: []
            },
            css: ["background-color", "color", "font-family", "font-size", "font-style", "font-weight", "margin-left", "margin-right", "text-align", "text-decoration"],
            validTag: function(tag) {
                for (var i = 0; i < Strophe.XHTML.tags.length; i++) {
                    if (tag == Strophe.XHTML.tags[i]) {
                        return true
                    }
                }
                return false
            },
            validAttribute: function(tag, attribute) {
                if (typeof Strophe.XHTML.attributes[tag] !== "undefined" && Strophe.XHTML.attributes[tag].length > 0) {
                    for (var i = 0; i < Strophe.XHTML.attributes[tag].length; i++) {
                        if (attribute == Strophe.XHTML.attributes[tag][i]) {
                            return true
                        }
                    }
                }
                return false
            },
            validCSS: function(style) {
                for (var i = 0; i < Strophe.XHTML.css.length; i++) {
                    if (style == Strophe.XHTML.css[i]) {
                        return true
                    }
                }
                return false
            }
        },
        Status: {
            ERROR: 0,
            CONNECTING: 1,
            CONNFAIL: 2,
            AUTHENTICATING: 3,
            AUTHFAIL: 4,
            CONNECTED: 5,
            DISCONNECTED: 6,
            DISCONNECTING: 7,
            ATTACHED: 8
        },
        LogLevel: {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            FATAL: 4
        },
        ElementType: {
            NORMAL: 1,
            TEXT: 3,
            CDATA: 4,
            FRAGMENT: 11
        },
        TIMEOUT: 1.1,
        SECONDARY_TIMEOUT: 0.1,
        addNamespace: function(name, value) {
            Strophe.NS[name] = value
        },
        forEachChild: function(elem, elemName, func) {
            var i, childNode;
            for (i = 0; i < elem.childNodes.length; i++) {
                childNode = elem.childNodes[i];
                if (childNode.nodeType == Strophe.ElementType.NORMAL && (!elemName || this.isTagEqual(childNode, elemName))) {
                    func(childNode)
                }
            }
        },
        isTagEqual: function(el, name) {
            return el.tagName.toLowerCase() == name.toLowerCase()
        },
        _xmlGenerator: null,
        _makeGenerator: function() {
            var doc;
            if (document.implementation.createDocument === undefined || document.implementation.createDocument && document.documentMode && document.documentMode < 10) {
                doc = this._getIEXmlDom();
                doc.appendChild(doc.createElement("strophe"))
            } else {
                doc = document.implementation.createDocument("jabber:client", "strophe", null)
            }
            return doc
        },
        xmlGenerator: function() {
            if (!Strophe._xmlGenerator) {
                Strophe._xmlGenerator = Strophe._makeGenerator()
            }
            return Strophe._xmlGenerator
        },
        _getIEXmlDom: function() {
            var doc = null;
            var docStrings = ["Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.5.0", "Msxml2.DOMDocument.4.0", "MSXML2.DOMDocument.3.0", "MSXML2.DOMDocument", "MSXML.DOMDocument", "Microsoft.XMLDOM"];
            for (var d = 0; d < docStrings.length; d++) {
                if (doc === null) {
                    try {
                        doc = new ActiveXObject(docStrings[d])
                    } catch (e) {
                        doc = null
                    }
                } else {
                    break
                }
            }
            return doc
        },
        xmlElement: function(name) {
            if (!name) {
                return null
            }
            var node = Strophe.xmlGenerator().createElement(name);
            var a, i, k;
            for (a = 1; a < arguments.length; a++) {
                if (!arguments[a]) {
                    continue
                }
                if (typeof(arguments[a]) == "string" || typeof(arguments[a]) == "number") {
                    node.appendChild(Strophe.xmlTextNode(arguments[a]))
                } else {
                    if (typeof(arguments[a]) == "object" && typeof(arguments[a].sort) == "function") {
                        for (i = 0; i < arguments[a].length; i++) {
                            if (typeof(arguments[a][i]) == "object" && typeof(arguments[a][i].sort) == "function") {
                                node.setAttribute(arguments[a][i][0], arguments[a][i][1])
                            }
                        }
                    } else {
                        if (typeof(arguments[a]) == "object") {
                            for (k in arguments[a]) {
                                if (arguments[a].hasOwnProperty(k)) {
                                    node.setAttribute(k, arguments[a][k])
                                }
                            }
                        }
                    }
                }
            }
            return node
        },
        xmlescape: function(text) {
            text = text.replace(/\&/g, "&amp;");
            text = text.replace(/</g, "&lt;");
            text = text.replace(/>/g, "&gt;");
            text = text.replace(/'/g, "&apos;");
            text = text.replace(/"/g, "&quot;");
            return text
        },
        xmlTextNode: function(text) {
            return Strophe.xmlGenerator().createTextNode(text)
        },
        xmlHtmlNode: function(html) {
            var node;
            if (window.DOMParser) {
                var parser = new DOMParser();
                node = parser.parseFromString(html, "text/xml")
            } else {
                node = new ActiveXObject("Microsoft.XMLDOM");
                node.async = "false";
                node.loadXML(html)
            }
            return node
        },
        getText: function(elem) {
            if (!elem) {
                return null
            }
            var str = "";
            if (elem.childNodes.length === 0 && elem.nodeType == Strophe.ElementType.TEXT) {
                str += elem.nodeValue
            }
            for (var i = 0; i < elem.childNodes.length; i++) {
                if (elem.childNodes[i].nodeType == Strophe.ElementType.TEXT) {
                    str += elem.childNodes[i].nodeValue
                }
            }
            return Strophe.xmlescape(str)
        },
        copyElement: function(elem) {
            var i, el;
            if (elem.nodeType == Strophe.ElementType.NORMAL) {
                el = Strophe.xmlElement(elem.tagName);
                for (i = 0; i < elem.attributes.length; i++) {
                    el.setAttribute(elem.attributes[i].nodeName.toLowerCase(), elem.attributes[i].value)
                }
                for (i = 0; i < elem.childNodes.length; i++) {
                    el.appendChild(Strophe.copyElement(elem.childNodes[i]))
                }
            } else {
                if (elem.nodeType == Strophe.ElementType.TEXT) {
                    el = Strophe.xmlGenerator().createTextNode(elem.nodeValue)
                }
            }
            return el
        },
        createHtml: function(elem) {
            var i, el, j, tag, attribute, value, css, cssAttrs, attr, cssName, cssValue;
            if (elem.nodeType == Strophe.ElementType.NORMAL) {
                tag = elem.nodeName.toLowerCase();
                if (Strophe.XHTML.validTag(tag)) {
                    try {
                        el = Strophe.xmlElement(tag);
                        for (i = 0; i < Strophe.XHTML.attributes[tag].length; i++) {
                            attribute = Strophe.XHTML.attributes[tag][i];
                            value = elem.getAttribute(attribute);
                            if (typeof value == "undefined" || value === null || value === "" || value === false || value === 0) {
                                continue
                            }
                            if (attribute == "style" && typeof value == "object") {
                                if (typeof value.cssText != "undefined") {
                                    value = value.cssText
                                }
                            }
                            if (attribute == "style") {
                                css = [];
                                cssAttrs = value.split(";");
                                for (j = 0; j < cssAttrs.length; j++) {
                                    attr = cssAttrs[j].split(":");
                                    cssName = attr[0].replace(/^\s*/, "").replace(/\s*$/, "").toLowerCase();
                                    if (Strophe.XHTML.validCSS(cssName)) {
                                        cssValue = attr[1].replace(/^\s*/, "").replace(/\s*$/, "");
                                        css.push(cssName + ": " + cssValue)
                                    }
                                }
                                if (css.length > 0) {
                                    value = css.join("; ");
                                    el.setAttribute(attribute, value)
                                }
                            } else {
                                el.setAttribute(attribute, value)
                            }
                        }
                        for (i = 0; i < elem.childNodes.length; i++) {
                            el.appendChild(Strophe.createHtml(elem.childNodes[i]))
                        }
                    } catch (e) {
                        el = Strophe.xmlTextNode("")
                    }
                } else {
                    el = Strophe.xmlGenerator().createDocumentFragment();
                    for (i = 0; i < elem.childNodes.length; i++) {
                        el.appendChild(Strophe.createHtml(elem.childNodes[i]))
                    }
                }
            } else {
                if (elem.nodeType == Strophe.ElementType.FRAGMENT) {
                    el = Strophe.xmlGenerator().createDocumentFragment();
                    for (i = 0; i < elem.childNodes.length; i++) {
                        el.appendChild(Strophe.createHtml(elem.childNodes[i]))
                    }
                } else {
                    if (elem.nodeType == Strophe.ElementType.TEXT) {
                        el = Strophe.xmlTextNode(elem.nodeValue)
                    }
                }
            }
            return el
        },
        escapeNode: function(node) {
            return node.replace(/^\s+|\s+$/g, "").replace(/\\/g, "\\5c").replace(/ /g, "\\20").replace(/\"/g, "\\22").replace(/\&/g, "\\26").replace(/\'/g, "\\27").replace(/\//g, "\\2f").replace(/:/g, "\\3a").replace(/</g, "\\3c").replace(/>/g, "\\3e").replace(/@/g, "\\40")
        },
        unescapeNode: function(node) {
            return node.replace(/\\20/g, " ").replace(/\\22/g, '"').replace(/\\26/g, "&").replace(/\\27/g, "'").replace(/\\2f/g, "/").replace(/\\3a/g, ":").replace(/\\3c/g, "<").replace(/\\3e/g, ">").replace(/\\40/g, "@").replace(/\\5c/g, "\\")
        },
        getNodeFromJid: function(jid) {
            if (jid.indexOf("@") < 0) {
                return null
            }
            return jid.split("@")[0]
        },
        getDomainFromJid: function(jid) {
            var bare = Strophe.getBareJidFromJid(jid);
            if (bare.indexOf("@") < 0) {
                return bare
            } else {
                var parts = bare.split("@");
                parts.splice(0, 1);
                return parts.join("@")
            }
        },
        getResourceFromJid: function(jid) {
            var s = jid.split("/");
            if (s.length < 2) {
                return null
            }
            s.splice(0, 1);
            return s.join("/")
        },
        getBareJidFromJid: function(jid) {
            return jid ? jid.split("/")[0] : null
        },
        log: function(level, msg) {
            return
        },
        debug: function(msg) {
            this.log(this.LogLevel.DEBUG, msg)
        },
        info: function(msg) {
            this.log(this.LogLevel.INFO, msg)
        },
        warn: function(msg) {
            this.log(this.LogLevel.WARN, msg)
        },
        error: function(msg) {
            this.log(this.LogLevel.ERROR, msg)
        },
        fatal: function(msg) {
            this.log(this.LogLevel.FATAL, msg)
        },
        serialize: function(elem) {
            var result;
            if (!elem) {
                return null
            }
            if (typeof(elem.tree) === "function") {
                elem = elem.tree()
            }
            var nodeName = elem.nodeName;
            var i, child;
            if (elem.getAttribute("_realname")) {
                nodeName = elem.getAttribute("_realname")
            }
            result = "<" + nodeName;
            for (i = 0; i < elem.attributes.length; i++) {
                if (elem.attributes[i].nodeName != "_realname") {
                    result += " " + elem.attributes[i].nodeName.toLowerCase() + "='" + elem.attributes[i].value.replace(/&/g, "&amp;").replace(/\'/g, "&apos;").replace(/>/g, "&gt;").replace(/</g, "&lt;") + "'"
                }
            }
            if (elem.childNodes.length > 0) {
                result += ">";
                for (i = 0; i < elem.childNodes.length; i++) {
                    child = elem.childNodes[i];
                    switch (child.nodeType) {
                        case Strophe.ElementType.NORMAL:
                            result += Strophe.serialize(child);
                            break;
                        case Strophe.ElementType.TEXT:
                            result += Strophe.xmlescape(child.nodeValue);
                            break;
                        case Strophe.ElementType.CDATA:
                            result += "<![CDATA[" + child.nodeValue + "]]>"
                    }
                }
                result += "</" + nodeName + ">"
            } else {
                result += "/>"
            }
            return result
        },
        _requestId: 0,
        _connectionPlugins: {},
        addConnectionPlugin: function(name, ptype) {
            Strophe._connectionPlugins[name] = ptype
        }
    };
    Strophe.Builder = function(name, attrs) {
        if (name == "presence" || name == "message" || name == "iq") {
            if (attrs && !attrs.xmlns) {
                attrs.xmlns = Strophe.NS.CLIENT
            } else {
                if (!attrs) {
                    attrs = {
                        xmlns: Strophe.NS.CLIENT
                    }
                }
            }
        }
        this.nodeTree = Strophe.xmlElement(name, attrs);
        this.node = this.nodeTree
    };
    Strophe.Builder.prototype = {
        tree: function() {
            return this.nodeTree
        },
        toString: function() {
            return Strophe.serialize(this.nodeTree)
        },
        up: function() {
            this.node = this.node.parentNode;
            return this
        },
        attrs: function(moreattrs) {
            for (var k in moreattrs) {
                if (moreattrs.hasOwnProperty(k)) {
                    this.node.setAttribute(k, moreattrs[k])
                }
            }
            return this
        },
        c: function(name, attrs, text) {
            var child = Strophe.xmlElement(name, attrs, text);
            this.node.appendChild(child);
            if (!text) {
                this.node = child
            }
            return this
        },
        cnode: function(elem) {
            var impNode;
            var xmlGen = Strophe.xmlGenerator();
            try {
                impNode = (xmlGen.importNode !== undefined)
            } catch (e) {
                impNode = false
            }
            var newElem = impNode ? xmlGen.importNode(elem, true) : Strophe.copyElement(elem);
            this.node.appendChild(newElem);
            this.node = newElem;
            return this
        },
        t: function(text) {
            var child = Strophe.xmlTextNode(text);
            this.node.appendChild(child);
            return this
        },
        h: function(html) {
            var fragment = document.createElement("body");
            fragment.innerHTML = html;
            var xhtml = Strophe.createHtml(fragment);
            while (xhtml.childNodes.length > 0) {
                this.node.appendChild(xhtml.childNodes[0])
            }
            return this
        }
    };
    Strophe.Handler = function(handler, ns, name, type, id, from, options) {
        this.handler = handler;
        this.ns = ns;
        this.name = name;
        this.type = type;
        this.id = id;
        this.options = options || {
            matchBare: false
        };
        if (!this.options.matchBare) {
            this.options.matchBare = false
        }
        if (this.options.matchBare) {
            this.from = from ? Strophe.getBareJidFromJid(from) : null
        } else {
            this.from = from
        }
        this.user = true
    };
    Strophe.Handler.prototype = {
        isMatch: function(elem) {
            var nsMatch;
            var from = null;
            if (this.options.matchBare) {
                from = Strophe.getBareJidFromJid(elem.getAttribute("from"))
            } else {
                from = elem.getAttribute("from")
            }
            nsMatch = false;
            if (!this.ns) {
                nsMatch = true
            } else {
                var that = this;
                Strophe.forEachChild(elem, null, function(elem) {
                    if (elem.getAttribute("xmlns") == that.ns) {
                        nsMatch = true
                    }
                });
                nsMatch = nsMatch || elem.getAttribute("xmlns") == this.ns
            }
            if (nsMatch && (!this.name || Strophe.isTagEqual(elem, this.name)) && (!this.type || elem.getAttribute("type") == this.type) && (!this.id || elem.getAttribute("id") == this.id) && (!this.from || from == this.from)) {
                return true
            }
            return false
        },
        run: function(elem) {
            var result = null;
            try {
                result = this.handler(elem)
            } catch (e) {
                if (e.sourceURL) {
                    Strophe.fatal("error: " + this.handler + " " + e.sourceURL + ":" + e.line + " - " + e.name + ": " + e.message)
                } else {
                    if (e.fileName) {
                        if (typeof(console) != "undefined") {
                            console.trace();
                            console.error(this.handler, " - error - ", e, e.message)
                        }
                        Strophe.fatal("error: " + this.handler + " " + e.fileName + ":" + e.lineNumber + " - " + e.name + ": " + e.message)
                    } else {
                        Strophe.fatal("error: " + e.message + "\n" + e.stack)
                    }
                }
                throw e
            }
            return result
        },
        toString: function() {
            return "{Handler: " + this.handler + "(" + this.name + "," + this.id + "," + this.ns + ")}"
        }
    };
    Strophe.TimedHandler = function(period, handler) {
        this.period = period;
        this.handler = handler;
        this.lastCalled = new Date().getTime();
        this.user = true
    };
    Strophe.TimedHandler.prototype = {
        run: function() {
            this.lastCalled = new Date().getTime();
            return this.handler()
        },
        reset: function() {
            this.lastCalled = new Date().getTime()
        },
        toString: function() {
            return "{TimedHandler: " + this.handler + "(" + this.period + ")}"
        }
    };
    Strophe.Connection = function(service, options) {
        this.service = service;
        this.options = options || {};
        var proto = this.options.protocol || "";
        if (service.indexOf("ws:") === 0 || service.indexOf("wss:") === 0 || proto.indexOf("ws") === 0) {
            this._proto = new Strophe.Websocket(this)
        } else {
            this._proto = new Strophe.Bosh(this)
        }
        this.jid = "";
        this.domain = null;
        this.features = null;
        this._sasl_data = {};
        this.do_session = false;
        this.do_bind = false;
        this.timedHandlers = [];
        this.handlers = [];
        this.removeTimeds = [];
        this.removeHandlers = [];
        this.addTimeds = [];
        this.addHandlers = [];
        this._authentication = {};
        this._idleTimeout = null;
        this._disconnectTimeout = null;
        this.do_authentication = true;
        this.authenticated = false;
        this.disconnecting = false;
        this.connected = false;
        this.errors = 0;
        this.paused = false;
        this._data = [];
        this._uniqueId = 0;
        this._sasl_success_handler = null;
        this._sasl_failure_handler = null;
        this._sasl_challenge_handler = null;
        this.maxRetries = 5;
        this._idleTimeout = setTimeout(this._onIdle.bind(this), 100);
        for (var k in Strophe._connectionPlugins) {
            if (Strophe._connectionPlugins.hasOwnProperty(k)) {
                var ptype = Strophe._connectionPlugins[k];
                var F = function() {};
                F.prototype = ptype;
                this[k] = new F();
                this[k].init(this)
            }
        }
    };
    Strophe.Connection.prototype = {
        reset: function() {
            this._proto._reset();
            this.do_session = false;
            this.do_bind = false;
            this.timedHandlers = [];
            this.handlers = [];
            this.removeTimeds = [];
            this.removeHandlers = [];
            this.addTimeds = [];
            this.addHandlers = [];
            this._authentication = {};
            this.authenticated = false;
            this.disconnecting = false;
            this.connected = false;
            this.errors = 0;
            this._requests = [];
            this._uniqueId = 0
        },
        pause: function() {
            this.paused = true
        },
        resume: function() {
            this.paused = false
        },
        getUniqueId: function(suffix) {
            if (typeof(suffix) == "string" || typeof(suffix) == "number") {
                return ++this._uniqueId + ":" + suffix
            } else {
                return ++this._uniqueId + ""
            }
        },
        connect: function(jid, pass, callback, wait, hold, route) {
            this.jid = jid;
            this.authzid = Strophe.getBareJidFromJid(this.jid);
            this.authcid = Strophe.getNodeFromJid(this.jid);
            this.pass = pass;
            this.servtype = "xmpp";
            this.connect_callback = callback;
            this.disconnecting = false;
            this.connected = false;
            this.authenticated = false;
            this.errors = 0;
            this.domain = Strophe.getDomainFromJid(this.jid);
            this._changeConnectStatus(Strophe.Status.CONNECTING, null);
            this._proto._connect(wait, hold, route)
        },
        attach: function(jid, sid, rid, callback, wait, hold, wind) {
            this._proto._attach(jid, sid, rid, callback, wait, hold, wind)
        },
        xmlInput: function(elem) {
            return
        },
        xmlOutput: function(elem) {
            return
        },
        rawInput: function(data) {
            return
        },
        rawOutput: function(data) {
            return
        },
        send: function(elem) {
            if (elem === null) {
                return
            }
            if (typeof(elem.sort) === "function") {
                for (var i = 0; i < elem.length; i++) {
                    this._queueData(elem[i])
                }
            } else {
                if (typeof(elem.tree) === "function") {
                    this._queueData(elem.tree())
                } else {
                    this._queueData(elem)
                }
            }
            this._proto._send()
        },
        flush: function() {
            clearTimeout(this._idleTimeout);
            this._onIdle()
        },
        sendIQ: function(elem, callback, errback, timeout) {
            var timeoutHandler = null;
            var that = this;
            if (typeof(elem.tree) === "function") {
                elem = elem.tree()
            }
            var id = elem.getAttribute("id");
            if (!id) {
                id = this.getUniqueId("sendIQ");
                elem.setAttribute("id", id)
            }
            var handler = this.addHandler(function(stanza) {
                if (timeoutHandler) {
                    that.deleteTimedHandler(timeoutHandler)
                }
                var iqtype = stanza.getAttribute("type");
                if (iqtype == "result") {
                    if (callback) {
                        callback(stanza)
                    }
                } else {
                    if (iqtype == "error") {
                        if (errback) {
                            errback(stanza)
                        }
                    } else {
                        throw {
                            name: "StropheError",
                            message: "Got bad IQ type of " + iqtype
                        }
                    }
                }
            }, null, "iq", null, id);
            if (timeout) {
                timeoutHandler = this.addTimedHandler(timeout, function() {
                    that.deleteHandler(handler);
                    if (errback) {
                        errback(null)
                    }
                    return false
                })
            }
            this.send(elem);
            return id
        },
        _queueData: function(element) {
            if (element === null || !element.tagName || !element.childNodes) {
                throw {
                    name: "StropheError",
                    message: "Cannot queue non-DOMElement."
                }
            }
            this._data.push(element)
        },
        _sendRestart: function() {
            this._data.push("restart");
            this._proto._sendRestart();
            this._idleTimeout = setTimeout(this._onIdle.bind(this), 100)
        },
        addTimedHandler: function(period, handler) {
            var thand = new Strophe.TimedHandler(period, handler);
            this.addTimeds.push(thand);
            return thand
        },
        deleteTimedHandler: function(handRef) {
            this.removeTimeds.push(handRef)
        },
        addHandler: function(handler, ns, name, type, id, from, options) {
            var hand = new Strophe.Handler(handler, ns, name, type, id, from, options);
            this.addHandlers.push(hand);
            return hand
        },
        deleteHandler: function(handRef) {
            this.removeHandlers.push(handRef)
        },
        disconnect: function(reason) {
            this._changeConnectStatus(Strophe.Status.DISCONNECTING, reason);
            Strophe.info("Disconnect was called because: " + reason);
            if (this.connected) {
                var pres = false;
                this.disconnecting = true;
                if (this.authenticated) {
                    pres = $pres({
                        xmlns: Strophe.NS.CLIENT,
                        type: "unavailable"
                    })
                }
                this._disconnectTimeout = this._addSysTimedHandler(3000, this._onDisconnectTimeout.bind(this));
                this._proto._disconnect(pres)
            }
        },
        _changeConnectStatus: function(status, condition) {
            for (var k in Strophe._connectionPlugins) {
                if (Strophe._connectionPlugins.hasOwnProperty(k)) {
                    var plugin = this[k];
                    if (plugin.statusChanged) {
                        try {
                            plugin.statusChanged(status, condition)
                        } catch (err) {
                            Strophe.error("" + k + " plugin caused an exception changing status: " + err)
                        }
                    }
                }
            }
            if (this.connect_callback) {
                try {
                    this.connect_callback(status, condition)
                } catch (e) {
                    Strophe.error("User connection callback caused an exception: " + e)
                }
            }
        },
        _doDisconnect: function() {
            if (this._disconnectTimeout !== null) {
                this.deleteTimedHandler(this._disconnectTimeout);
                this._disconnectTimeout = null
            }
            Strophe.info("_doDisconnect was called");
            this._proto._doDisconnect();
            this.authenticated = false;
            this.disconnecting = false;
            this.handlers = [];
            this.timedHandlers = [];
            this.removeTimeds = [];
            this.removeHandlers = [];
            this.addTimeds = [];
            this.addHandlers = [];
            this._changeConnectStatus(Strophe.Status.DISCONNECTED, null);
            this.connected = false
        },
        _dataRecv: function(req, raw) {
            Strophe.info("_dataRecv called");
            var elem = this._proto._reqToData(req);
            if (elem === null) {
                return
            }
            if (this.xmlInput !== Strophe.Connection.prototype.xmlInput) {
                if (elem.nodeName === this._proto.strip && elem.childNodes.length) {
                    this.xmlInput(elem.childNodes[0])
                } else {
                    this.xmlInput(elem)
                }
            }
            if (this.rawInput !== Strophe.Connection.prototype.rawInput) {
                if (raw) {
                    this.rawInput(raw)
                } else {
                    this.rawInput(Strophe.serialize(elem))
                }
            }
            var i, hand;
            while (this.removeHandlers.length > 0) {
                hand = this.removeHandlers.pop();
                i = this.handlers.indexOf(hand);
                if (i >= 0) {
                    this.handlers.splice(i, 1)
                }
            }
            while (this.addHandlers.length > 0) {
                this.handlers.push(this.addHandlers.pop())
            }
            if (this.disconnecting && this._proto._emptyQueue()) {
                this._doDisconnect();
                return
            }
            var typ = elem.getAttribute("type");
            var cond, conflict;
            if (typ !== null && typ == "terminate") {
                if (this.disconnecting) {
                    return
                }
                cond = elem.getAttribute("condition");
                conflict = elem.getElementsByTagName("conflict");
                if (cond !== null) {
                    if (cond == "remote-stream-error" && conflict.length > 0) {
                        cond = "conflict"
                    }
                    this._changeConnectStatus(Strophe.Status.CONNFAIL, cond)
                } else {
                    this._changeConnectStatus(Strophe.Status.CONNFAIL, "unknown")
                }
                this.disconnect("unknown stream-error");
                return
            }
            var that = this;
            Strophe.forEachChild(elem, null, function(child) {
                var i, newList;
                newList = that.handlers;
                that.handlers = [];
                for (i = 0; i < newList.length; i++) {
                    var hand = newList[i];
                    try {
                        if (hand.isMatch(child) && (that.authenticated || !hand.user)) {
                            if (hand.run(child)) {
                                that.handlers.push(hand)
                            }
                        } else {
                            that.handlers.push(hand)
                        }
                    } catch (e) {
                        Strophe.warn("Removing Strophe handlers due to uncaught exception: " + e.message)
                    }
                }
            })
        },
        mechanisms: {},
        _connect_cb: function(req, _callback, raw) {
            Strophe.info("_connect_cb was called");
            this.connected = true;
            var bodyWrap = this._proto._reqToData(req);
            if (!bodyWrap) {
                return
            }
            if (this.xmlInput !== Strophe.Connection.prototype.xmlInput) {
                if (bodyWrap.nodeName === this._proto.strip && bodyWrap.childNodes.length) {
                    this.xmlInput(bodyWrap.childNodes[0])
                } else {
                    this.xmlInput(bodyWrap)
                }
            }
            if (this.rawInput !== Strophe.Connection.prototype.rawInput) {
                if (raw) {
                    this.rawInput(raw)
                } else {
                    this.rawInput(Strophe.serialize(bodyWrap))
                }
            }
            var conncheck = this._proto._connect_cb(bodyWrap);
            if (conncheck === Strophe.Status.CONNFAIL) {
                return
            }
            this._authentication.sasl_scram_sha1 = false;
            this._authentication.sasl_plain = false;
            this._authentication.sasl_digest_md5 = false;
            this._authentication.sasl_anonymous = false;
            this._authentication.legacy_auth = false;
            var hasFeatures = bodyWrap.getElementsByTagName("stream:features").length > 0;
            if (!hasFeatures) {
                hasFeatures = bodyWrap.getElementsByTagName("features").length > 0
            }
            var mechanisms = bodyWrap.getElementsByTagName("mechanism");
            var matched = [];
            var i, mech, found_authentication = false;
            if (!hasFeatures) {
                this._proto._no_auth_received(_callback);
                return
            }
            if (mechanisms.length > 0) {
                for (i = 0; i < mechanisms.length; i++) {
                    mech = Strophe.getText(mechanisms[i]);
                    if (this.mechanisms[mech]) {
                        matched.push(this.mechanisms[mech])
                    }
                }
            }
            this._authentication.legacy_auth = bodyWrap.getElementsByTagName("auth").length > 0;
            found_authentication = this._authentication.legacy_auth || matched.length > 0;
            if (!found_authentication) {
                this._proto._no_auth_received(_callback);
                return
            }
            if (this.do_authentication !== false) {
                this.authenticate(matched)
            }
        },
        authenticate: function(matched) {
            var i;
            for (i = 0; i < matched.length - 1; ++i) {
                var higher = i;
                for (var j = i + 1; j < matched.length; ++j) {
                    if (matched[j].prototype.priority > matched[higher].prototype.priority) {
                        higher = j
                    }
                }
                if (higher != i) {
                    var swap = matched[i];
                    matched[i] = matched[higher];
                    matched[higher] = swap
                }
            }
            var mechanism_found = false;
            for (i = 0; i < matched.length; ++i) {
                if (!matched[i].test(this)) {
                    continue
                }
                this._sasl_success_handler = this._addSysHandler(this._sasl_success_cb.bind(this), null, "success", null, null);
                this._sasl_failure_handler = this._addSysHandler(this._sasl_failure_cb.bind(this), null, "failure", null, null);
                this._sasl_challenge_handler = this._addSysHandler(this._sasl_challenge_cb.bind(this), null, "challenge", null, null);
                this._sasl_mechanism = new matched[i]();
                this._sasl_mechanism.onStart(this);
                var request_auth_exchange = $build("auth", {
                    xmlns: Strophe.NS.SASL,
                    mechanism: this._sasl_mechanism.name
                });
                if (this._sasl_mechanism.isClientFirst) {
                    var response = this._sasl_mechanism.onChallenge(this, null);
                    request_auth_exchange.t(Base64.encode(response))
                }
                this.send(request_auth_exchange.tree());
                mechanism_found = true;
                break
            }
            if (!mechanism_found) {
                if (Strophe.getNodeFromJid(this.jid) === null) {
                    this._changeConnectStatus(Strophe.Status.CONNFAIL, "x-strophe-bad-non-anon-jid");
                    this.disconnect("x-strophe-bad-non-anon-jid")
                } else {
                    this._changeConnectStatus(Strophe.Status.AUTHENTICATING, null);
                    this._addSysHandler(this._auth1_cb.bind(this), null, null, null, "_auth_1");
                    this.send($iq({
                        type: "get",
                        to: this.domain,
                        id: "_auth_1"
                    }).c("query", {
                        xmlns: Strophe.NS.AUTH
                    }).c("username", {}).t(Strophe.getNodeFromJid(this.jid)).tree())
                }
            }
        },
        _sasl_challenge_cb: function(elem) {
            var challenge = Base64.decode(Strophe.getText(elem));
            var response = this._sasl_mechanism.onChallenge(this, challenge);
            var stanza = $build("response", {
                xmlns: Strophe.NS.SASL
            });
            if (response !== "") {
                stanza.t(Base64.encode(response))
            }
            this.send(stanza.tree());
            return true
        },
        _auth1_cb: function(elem) {
            var iq = $iq({
                type: "set",
                id: "_auth_2"
            }).c("query", {
                xmlns: Strophe.NS.AUTH
            }).c("username", {}).t(Strophe.getNodeFromJid(this.jid)).up().c("password").t(this.pass);
            if (!Strophe.getResourceFromJid(this.jid)) {
                this.jid = Strophe.getBareJidFromJid(this.jid) + "/strophe"
            }
            iq.up().c("resource", {}).t(Strophe.getResourceFromJid(this.jid));
            this._addSysHandler(this._auth2_cb.bind(this), null, null, null, "_auth_2");
            this.send(iq.tree());
            return false
        },
        _sasl_success_cb: function(elem) {
            if (this._sasl_data["server-signature"]) {
                var serverSignature;
                var success = Base64.decode(Strophe.getText(elem));
                var attribMatch = /([a-z]+)=([^,]+)(,|$)/;
                var matches = success.match(attribMatch);
                if (matches[1] == "v") {
                    serverSignature = matches[2]
                }
                if (serverSignature != this._sasl_data["server-signature"]) {
                    this.deleteHandler(this._sasl_failure_handler);
                    this._sasl_failure_handler = null;
                    if (this._sasl_challenge_handler) {
                        this.deleteHandler(this._sasl_challenge_handler);
                        this._sasl_challenge_handler = null
                    }
                    this._sasl_data = {};
                    return this._sasl_failure_cb(null)
                }
            }
            Strophe.info("SASL authentication succeeded.");
            if (this._sasl_mechanism) {
                this._sasl_mechanism.onSuccess()
            }
            this.deleteHandler(this._sasl_failure_handler);
            this._sasl_failure_handler = null;
            if (this._sasl_challenge_handler) {
                this.deleteHandler(this._sasl_challenge_handler);
                this._sasl_challenge_handler = null
            }
            this._addSysHandler(this._sasl_auth1_cb.bind(this), null, "stream:features", null, null);
            this._sendRestart();
            return false
        },
        _sasl_auth1_cb: function(elem) {
            this.features = elem;
            var i, child;
            for (i = 0; i < elem.childNodes.length; i++) {
                child = elem.childNodes[i];
                if (child.nodeName == "bind") {
                    this.do_bind = true
                }
                if (child.nodeName == "session") {
                    this.do_session = true
                }
            }
            if (!this.do_bind) {
                this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
                return false
            } else {
                this._addSysHandler(this._sasl_bind_cb.bind(this), null, null, null, "_bind_auth_2");
                var resource = Strophe.getResourceFromJid(this.jid);
                if (resource) {
                    this.send($iq({
                        type: "set",
                        id: "_bind_auth_2"
                    }).c("bind", {
                        xmlns: Strophe.NS.BIND
                    }).c("resource", {}).t(resource).tree())
                } else {
                    this.send($iq({
                        type: "set",
                        id: "_bind_auth_2"
                    }).c("bind", {
                        xmlns: Strophe.NS.BIND
                    }).tree())
                }
            }
            return false
        },
        _sasl_bind_cb: function(elem) {
            if (elem.getAttribute("type") == "error") {
                Strophe.info("SASL binding failed.");
                var conflict = elem.getElementsByTagName("conflict"),
                    condition;
                if (conflict.length > 0) {
                    condition = "conflict"
                }
                this._changeConnectStatus(Strophe.Status.AUTHFAIL, condition);
                return false
            }
            var bind = elem.getElementsByTagName("bind");
            var jidNode;
            if (bind.length > 0) {
                jidNode = bind[0].getElementsByTagName("jid");
                if (jidNode.length > 0) {
                    this.jid = Strophe.getText(jidNode[0]);
                    if (this.do_session) {
                        this._addSysHandler(this._sasl_session_cb.bind(this), null, null, null, "_session_auth_2");
                        this.send($iq({
                            type: "set",
                            id: "_session_auth_2"
                        }).c("session", {
                            xmlns: Strophe.NS.SESSION
                        }).tree())
                    } else {
                        this.authenticated = true;
                        this._changeConnectStatus(Strophe.Status.CONNECTED, null)
                    }
                }
            } else {
                Strophe.info("SASL binding failed.");
                this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
                return false
            }
        },
        _sasl_session_cb: function(elem) {
            if (elem.getAttribute("type") == "result") {
                this.authenticated = true;
                this._changeConnectStatus(Strophe.Status.CONNECTED, null)
            } else {
                if (elem.getAttribute("type") == "error") {
                    Strophe.info("Session creation failed.");
                    this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
                    return false
                }
            }
            return false
        },
        _sasl_failure_cb: function(elem) {
            if (this._sasl_success_handler) {
                this.deleteHandler(this._sasl_success_handler);
                this._sasl_success_handler = null
            }
            if (this._sasl_challenge_handler) {
                this.deleteHandler(this._sasl_challenge_handler);
                this._sasl_challenge_handler = null
            }
            if (this._sasl_mechanism) {
                this._sasl_mechanism.onFailure()
            }
            this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
            return false
        },
        _auth2_cb: function(elem) {
            if (elem.getAttribute("type") == "result") {
                this.authenticated = true;
                this._changeConnectStatus(Strophe.Status.CONNECTED, null)
            } else {
                if (elem.getAttribute("type") == "error") {
                    this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
                    this.disconnect("authentication failed")
                }
            }
            return false
        },
        _addSysTimedHandler: function(period, handler) {
            var thand = new Strophe.TimedHandler(period, handler);
            thand.user = false;
            this.addTimeds.push(thand);
            return thand
        },
        _addSysHandler: function(handler, ns, name, type, id) {
            var hand = new Strophe.Handler(handler, ns, name, type, id);
            hand.user = false;
            this.addHandlers.push(hand);
            return hand
        },
        _onDisconnectTimeout: function() {
            Strophe.info("_onDisconnectTimeout was called");
            this._proto._onDisconnectTimeout();
            this._doDisconnect();
            return false
        },
        _onIdle: function() {
            var i, thand, since, newList;
            while (this.addTimeds.length > 0) {
                this.timedHandlers.push(this.addTimeds.pop())
            }
            while (this.removeTimeds.length > 0) {
                thand = this.removeTimeds.pop();
                i = this.timedHandlers.indexOf(thand);
                if (i >= 0) {
                    this.timedHandlers.splice(i, 1)
                }
            }
            var now = new Date().getTime();
            newList = [];
            for (i = 0; i < this.timedHandlers.length; i++) {
                thand = this.timedHandlers[i];
                if (this.authenticated || !thand.user) {
                    since = thand.lastCalled + thand.period;
                    if (since - now <= 0) {
                        if (thand.run()) {
                            newList.push(thand)
                        }
                    } else {
                        newList.push(thand)
                    }
                }
            }
            this.timedHandlers = newList;
            clearTimeout(this._idleTimeout);
            this._proto._onIdle();
            if (this.connected) {
                this._idleTimeout = setTimeout(this._onIdle.bind(this), 100)
            }
        }
    };
    if (callback) {
        callback(Strophe, $build, $msg, $iq, $pres)
    }
    Strophe.SASLMechanism = function(name, isClientFirst, priority) {
        this.name = name;
        this.isClientFirst = isClientFirst;
        this.priority = priority
    };
    Strophe.SASLMechanism.prototype = {
        test: function(connection) {
            return true
        },
        onStart: function(connection) {
            this._connection = connection
        },
        onChallenge: function(connection, challenge) {
            throw new Error("You should implement challenge handling!")
        },
        onFailure: function() {
            this._connection = null
        },
        onSuccess: function() {
            this._connection = null
        }
    };
    Strophe.SASLAnonymous = function() {};
    Strophe.SASLAnonymous.prototype = new Strophe.SASLMechanism("ANONYMOUS", false, 10);
    Strophe.SASLAnonymous.test = function(connection) {
        return connection.authcid === null
    };
    Strophe.Connection.prototype.mechanisms[Strophe.SASLAnonymous.prototype.name] = Strophe.SASLAnonymous;
    Strophe.SASLPlain = function() {};
    Strophe.SASLPlain.prototype = new Strophe.SASLMechanism("PLAIN", true, 20);
    Strophe.SASLPlain.test = function(connection) {
        return connection.authcid !== null
    };
    Strophe.SASLPlain.prototype.onChallenge = function(connection) {
        var auth_str = connection.authzid;
        auth_str = auth_str + "\u0000";
        auth_str = auth_str + connection.authcid;
        auth_str = auth_str + "\u0000";
        auth_str = auth_str + connection.pass;
        return auth_str
    };
    Strophe.Connection.prototype.mechanisms[Strophe.SASLPlain.prototype.name] = Strophe.SASLPlain;
    Strophe.SASLSHA1 = function() {};
    Strophe.SASLSHA1.prototype = new Strophe.SASLMechanism("SCRAM-SHA-1", true, 40);
    Strophe.SASLSHA1.test = function(connection) {
        return connection.authcid !== null
    };
    Strophe.SASLSHA1.prototype.onChallenge = function(connection, challenge, test_cnonce) {
        var cnonce = test_cnonce || MD5.hexdigest(Math.random() * 1234567890);
        var auth_str = "n=" + connection.authcid;
        auth_str += ",r=";
        auth_str += cnonce;
        connection._sasl_data.cnonce = cnonce;
        connection._sasl_data["client-first-message-bare"] = auth_str;
        auth_str = "n,," + auth_str;
        this.onChallenge = function(connection, challenge) {
            var nonce, salt, iter, Hi, U, U_old, i, k;
            var clientKey, serverKey, clientSignature;
            var responseText = "c=biws,";
            var authMessage = connection._sasl_data["client-first-message-bare"] + "," + challenge + ",";
            var cnonce = connection._sasl_data.cnonce;
            var attribMatch = /([a-z]+)=([^,]+)(,|$)/;
            while (challenge.match(attribMatch)) {
                var matches = challenge.match(attribMatch);
                challenge = challenge.replace(matches[0], "");
                switch (matches[1]) {
                    case "r":
                        nonce = matches[2];
                        break;
                    case "s":
                        salt = matches[2];
                        break;
                    case "i":
                        iter = matches[2];
                        break
                }
            }
            if (nonce.substr(0, cnonce.length) !== cnonce) {
                connection._sasl_data = {};
                return connection._sasl_failure_cb()
            }
            responseText += "r=" + nonce;
            authMessage += responseText;
            salt = Base64.decode(salt);
            salt += "\x00\x00\x00\x01";
            Hi = U_old = core_hmac_sha1(connection.pass, salt);
            for (i = 1; i < iter; i++) {
                U = core_hmac_sha1(connection.pass, binb2str(U_old));
                for (k = 0; k < 5; k++) {
                    Hi[k] ^= U[k]
                }
                U_old = U
            }
            Hi = binb2str(Hi);
            clientKey = core_hmac_sha1(Hi, "Client Key");
            serverKey = str_hmac_sha1(Hi, "Server Key");
            clientSignature = core_hmac_sha1(str_sha1(binb2str(clientKey)), authMessage);
            connection._sasl_data["server-signature"] = b64_hmac_sha1(serverKey, authMessage);
            for (k = 0; k < 5; k++) {
                clientKey[k] ^= clientSignature[k]
            }
            responseText += ",p=" + Base64.encode(binb2str(clientKey));
            return responseText
        }.bind(this);
        return auth_str
    };
    Strophe.Connection.prototype.mechanisms[Strophe.SASLSHA1.prototype.name] = Strophe.SASLSHA1;
    Strophe.SASLMD5 = function() {};
    Strophe.SASLMD5.prototype = new Strophe.SASLMechanism("DIGEST-MD5", false, 30);
    Strophe.SASLMD5.test = function(connection) {
        return connection.authcid !== null
    };
    Strophe.SASLMD5.prototype._quote = function(str) {
        return '"' + str.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"'
    };
    Strophe.SASLMD5.prototype.onChallenge = function(connection, challenge, test_cnonce) {
        var attribMatch = /([a-z]+)=("[^"]+"|[^,"]+)(?:,|$)/;
        var cnonce = test_cnonce || MD5.hexdigest("" + (Math.random() * 1234567890));
        var realm = "";
        var host = null;
        var nonce = "";
        var qop = "";
        var matches;
        while (challenge.match(attribMatch)) {
            matches = challenge.match(attribMatch);
            challenge = challenge.replace(matches[0], "");
            matches[2] = matches[2].replace(/^"(.+)"$/, "$1");
            switch (matches[1]) {
                case "realm":
                    realm = matches[2];
                    break;
                case "nonce":
                    nonce = matches[2];
                    break;
                case "qop":
                    qop = matches[2];
                    break;
                case "host":
                    host = matches[2];
                    break
            }
        }
        var digest_uri = connection.servtype + "/" + connection.domain;
        if (host !== null) {
            digest_uri = digest_uri + "/" + host
        }
        var A1 = MD5.hash(connection.authcid + ":" + realm + ":" + this._connection.pass) + ":" + nonce + ":" + cnonce;
        var A2 = "AUTHENTICATE:" + digest_uri;
        var responseText = "";
        responseText += "charset=utf-8,";
        responseText += "username=" + this._quote(connection.authcid) + ",";
        responseText += "realm=" + this._quote(realm) + ",";
        responseText += "nonce=" + this._quote(nonce) + ",";
        responseText += "nc=00000001,";
        responseText += "cnonce=" + this._quote(cnonce) + ",";
        responseText += "digest-uri=" + this._quote(digest_uri) + ",";
        responseText += "response=" + MD5.hexdigest(MD5.hexdigest(A1) + ":" + nonce + ":00000001:" + cnonce + ":auth:" + MD5.hexdigest(A2)) + ",";
        responseText += "qop=auth";
        this.onChallenge = function() {
            return ""
        }.bind(this);
        return responseText
    };
    Strophe.Connection.prototype.mechanisms[Strophe.SASLMD5.prototype.name] = Strophe.SASLMD5
})(function() {
    window.Strophe = arguments[0];
    window.$build = arguments[1];
    window.$msg = arguments[2];
    window.$iq = arguments[3];
    window.$pres = arguments[4]
});
Strophe.Request = function(elem, func, rid, sends) {
    this.id = ++Strophe._requestId;
    this.xmlData = elem;
    this.data = Strophe.serialize(elem);
    this.origFunc = func;
    this.func = func;
    this.rid = rid;
    this.date = NaN;
    this.sends = sends || 0;
    this.abort = false;
    this.dead = null;
    this.age = function() {
        if (!this.date) {
            return 0
        }
        var now = new Date();
        return (now - this.date) / 1000
    };
    this.timeDead = function() {
        if (!this.dead) {
            return 0
        }
        var now = new Date();
        return (now - this.dead) / 1000
    };
    this.xhr = this._newXHR()
};
Strophe.Request.prototype = {
    getResponse: function() {
        var node = null;
        if (this.xhr.responseXML && this.xhr.responseXML.documentElement) {
            node = this.xhr.responseXML.documentElement;
            if (node.tagName == "parsererror") {
                Strophe.error("invalid response received");
                Strophe.error("responseText: " + this.xhr.responseText);
                Strophe.error("responseXML: " + Strophe.serialize(this.xhr.responseXML));
                throw "parsererror"
            }
        } else {
            if (this.xhr.responseText) {
                Strophe.error("invalid response received");
                Strophe.error("responseText: " + this.xhr.responseText);
                Strophe.error("responseXML: " + Strophe.serialize(this.xhr.responseXML))
            }
        }
        return node
    },
    _newXHR: function() {
        var xhr = null;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("text/xml")
            }
        } else {
            if (window.ActiveXObject) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP")
            }
        }
        xhr.onreadystatechange = this.func.bind(null, this);
        return xhr
    }
};
Strophe.Bosh = function(connection) {
    this._conn = connection;
    this.rid = Math.floor(Math.random() * 4294967295);
    this.sid = null;
    this.hold = 1;
    this.wait = 60;
    this.window = 5;
    this._requests = []
};
Strophe.Bosh.prototype = {
    strip: null,
    _buildBody: function() {
        var bodyWrap = $build("body", {
            rid: this.rid++,
            xmlns: Strophe.NS.HTTPBIND
        });
        if (this.sid !== null) {
            bodyWrap.attrs({
                sid: this.sid
            })
        }
        return bodyWrap
    },
    _reset: function() {
        this.rid = Math.floor(Math.random() * 4294967295);
        this.sid = null
    },
    _connect: function(wait, hold, route) {
        this.wait = wait || this.wait;
        this.hold = hold || this.hold;
        var body = this._buildBody().attrs({
            to: this._conn.domain,
            "xml:lang": "en",
            wait: this.wait,
            hold: this.hold,
            content: "text/xml; charset=utf-8",
            ver: "1.6",
            "xmpp:version": "1.0",
            "xmlns:xmpp": Strophe.NS.BOSH
        });
        if (route) {
            body.attrs({
                route: route
            })
        }
        var _connect_cb = this._conn._connect_cb;
        this._requests.push(new Strophe.Request(body.tree(), this._onRequestStateChange.bind(this, _connect_cb.bind(this._conn)), body.tree().getAttribute("rid")));
        this._throttledRequestHandler()
    },
    _attach: function(jid, sid, rid, callback, wait, hold, wind) {
        this._conn.jid = jid;
        this.sid = sid;
        this.rid = rid;
        this._conn.connect_callback = callback;
        this._conn.domain = Strophe.getDomainFromJid(this._conn.jid);
        this._conn.authenticated = true;
        this._conn.connected = true;
        this.wait = wait || this.wait;
        this.hold = hold || this.hold;
        this.window = wind || this.window;
        this._conn._changeConnectStatus(Strophe.Status.ATTACHED, null)
    },
    _connect_cb: function(bodyWrap) {
        var typ = bodyWrap.getAttribute("type");
        var cond, conflict;
        if (typ !== null && typ == "terminate") {
            Strophe.error("BOSH-Connection failed: " + cond);
            cond = bodyWrap.getAttribute("condition");
            conflict = bodyWrap.getElementsByTagName("conflict");
            if (cond !== null) {
                if (cond == "remote-stream-error" && conflict.length > 0) {
                    cond = "conflict"
                }
                this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, cond)
            } else {
                this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, "unknown")
            }
            this._conn._doDisconnect();
            return Strophe.Status.CONNFAIL
        }
        if (!this.sid) {
            this.sid = bodyWrap.getAttribute("sid")
        }
        var wind = bodyWrap.getAttribute("requests");
        if (wind) {
            this.window = parseInt(wind, 10)
        }
        var hold = bodyWrap.getAttribute("hold");
        if (hold) {
            this.hold = parseInt(hold, 10)
        }
        var wait = bodyWrap.getAttribute("wait");
        if (wait) {
            this.wait = parseInt(wait, 10)
        }
    },
    _disconnect: function(pres) {
        this._sendTerminate(pres)
    },
    _doDisconnect: function() {
        this.sid = null;
        this.rid = Math.floor(Math.random() * 4294967295)
    },
    _emptyQueue: function() {
        return this._requests.length === 0
    },
    _hitError: function(reqStatus) {
        this.errors++;
        Strophe.warn("request errored, status: " + reqStatus + ", number of errors: " + this.errors);
        if (this.errors > 4) {
            this._onDisconnectTimeout()
        }
    },
    _no_auth_received: function(_callback) {
        if (_callback) {
            _callback = _callback.bind(this._conn)
        } else {
            _callback = this._conn._connect_cb.bind(this._conn)
        }
        var body = this._buildBody();
        this._requests.push(new Strophe.Request(body.tree(), this._onRequestStateChange.bind(this, _callback.bind(this._conn)), body.tree().getAttribute("rid")));
        this._throttledRequestHandler()
    },
    _onDisconnectTimeout: function() {
        var req;
        while (this._requests.length > 0) {
            req = this._requests.pop();
            req.abort = true;
            req.xhr.abort();
            req.xhr.onreadystatechange = function() {}
        }
    },
    _onIdle: function() {
        var data = this._conn._data;
        if (this._conn.authenticated && this._requests.length === 0 && data.length === 0 && !this._conn.disconnecting) {
            Strophe.info("no requests during idle cycle, sending blank request");
            data.push(null)
        }
        if (this._requests.length < 2 && data.length > 0 && !this._conn.paused) {
            var body = this._buildBody();
            for (var i = 0; i < data.length; i++) {
                if (data[i] !== null) {
                    if (data[i] === "restart") {
                        body.attrs({
                            to: this._conn.domain,
                            "xml:lang": "en",
                            "xmpp:restart": "true",
                            "xmlns:xmpp": Strophe.NS.BOSH
                        })
                    } else {
                        body.cnode(data[i]).up()
                    }
                }
            }
            delete this._conn._data;
            this._conn._data = [];
            this._requests.push(new Strophe.Request(body.tree(), this._onRequestStateChange.bind(this, this._conn._dataRecv.bind(this._conn)), body.tree().getAttribute("rid")));
            this._processRequest(this._requests.length - 1)
        }
        if (this._requests.length > 0) {
            var time_elapsed = this._requests[0].age();
            if (this._requests[0].dead !== null) {
                if (this._requests[0].timeDead() > Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait)) {
                    this._throttledRequestHandler()
                }
            }
            if (time_elapsed > Math.floor(Strophe.TIMEOUT * this.wait)) {
                Strophe.warn("Request " + this._requests[0].id + " timed out, over " + Math.floor(Strophe.TIMEOUT * this.wait) + " seconds since last activity");
                this._throttledRequestHandler()
            }
        }
    },
    _onRequestStateChange: function(func, req) {
        Strophe.debug("request id " + req.id + "." + req.sends + " state changed to " + req.xhr.readyState);
        if (req.abort) {
            req.abort = false;
            return
        }
        var reqStatus;
        if (req.xhr.readyState == 4) {
            reqStatus = 0;
            try {
                reqStatus = req.xhr.status
            } catch (e) {}
            if (typeof(reqStatus) == "undefined") {
                reqStatus = 0
            }
            if (this.disconnecting) {
                if (reqStatus >= 400) {
                    this._hitError(reqStatus);
                    return
                }
            }
            var reqIs0 = (this._requests[0] == req);
            var reqIs1 = (this._requests[1] == req);
            if ((reqStatus > 0 && reqStatus < 500) || req.sends > 5) {
                this._removeRequest(req);
                Strophe.debug("request id " + req.id + " should now be removed")
            }
            if (reqStatus == 200) {
                if (reqIs1 || (reqIs0 && this._requests.length > 0 && this._requests[0].age() > Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait))) {
                    this._restartRequest(0)
                }
                Strophe.debug("request id " + req.id + "." + req.sends + " got 200");
                func(req);
                this.errors = 0
            } else {
                Strophe.error("request id " + req.id + "." + req.sends + " error " + reqStatus + " happened");
                if (reqStatus === 0 || (reqStatus >= 400 && reqStatus < 600) || reqStatus >= 12000) {
                    this._hitError(reqStatus);
                    if (reqStatus >= 400 && reqStatus < 500) {
                        this._conn._changeConnectStatus(Strophe.Status.DISCONNECTING, null);
                        this._conn._doDisconnect()
                    }
                }
            }
            if (!((reqStatus > 0 && reqStatus < 500) || req.sends > 5)) {
                this._throttledRequestHandler()
            }
        }
    },
    _processRequest: function(i) {
        var self = this;
        var req = this._requests[i];
        var reqStatus = -1;
        try {
            if (req.xhr.readyState == 4) {
                reqStatus = req.xhr.status
            }
        } catch (e) {
            Strophe.error("caught an error in _requests[" + i + "], reqStatus: " + reqStatus)
        }
        if (typeof(reqStatus) == "undefined") {
            reqStatus = -1
        }
        if (req.sends > this.maxRetries) {
            this._onDisconnectTimeout();
            return
        }
        var time_elapsed = req.age();
        var primaryTimeout = (!isNaN(time_elapsed) && time_elapsed > Math.floor(Strophe.TIMEOUT * this.wait));
        var secondaryTimeout = (req.dead !== null && req.timeDead() > Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait));
        var requestCompletedWithServerError = (req.xhr.readyState == 4 && (reqStatus < 1 || reqStatus >= 500));
        if (primaryTimeout || secondaryTimeout || requestCompletedWithServerError) {
            if (secondaryTimeout) {
                Strophe.error("Request " + this._requests[i].id + " timed out (secondary), restarting")
            }
            req.abort = true;
            req.xhr.abort();
            req.xhr.onreadystatechange = function() {};
            this._requests[i] = new Strophe.Request(req.xmlData, req.origFunc, req.rid, req.sends);
            req = this._requests[i]
        }
        if (req.xhr.readyState === 0) {
            Strophe.debug("request id " + req.id + "." + req.sends + " posting");
            try {
                req.xhr.open("POST", this._conn.service, this._conn.options.sync ? false : true)
            } catch (e2) {
                Strophe.error("XHR open failed.");
                if (!this._conn.connected) {
                    this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, "bad-service")
                }
                this._conn.disconnect();
                return
            }
            var sendFunc = function() {
                req.date = new Date();
                if (self._conn.options.customHeaders) {
                    var headers = self._conn.options.customHeaders;
                    for (var header in headers) {
                        if (headers.hasOwnProperty(header)) {
                            req.xhr.setRequestHeader(header, headers[header])
                        }
                    }
                }
                req.xhr.send(req.data)
            };
            if (req.sends > 1) {
                var backoff = Math.min(Math.floor(Strophe.TIMEOUT * this.wait), Math.pow(req.sends, 3)) * 1000;
                setTimeout(sendFunc, backoff)
            } else {
                sendFunc()
            }
            req.sends++;
            if (this._conn.xmlOutput !== Strophe.Connection.prototype.xmlOutput) {
                if (req.xmlData.nodeName === this.strip && req.xmlData.childNodes.length) {
                    this._conn.xmlOutput(req.xmlData.childNodes[0])
                } else {
                    this._conn.xmlOutput(req.xmlData)
                }
            }
            if (this._conn.rawOutput !== Strophe.Connection.prototype.rawOutput) {
                this._conn.rawOutput(req.data)
            }
        } else {
            Strophe.debug("_processRequest: " + (i === 0 ? "first" : "second") + " request has readyState of " + req.xhr.readyState)
        }
    },
    _removeRequest: function(req) {
        Strophe.debug("removing request");
        var i;
        for (i = this._requests.length - 1; i >= 0; i--) {
            if (req == this._requests[i]) {
                this._requests.splice(i, 1)
            }
        }
        req.xhr.onreadystatechange = function() {};
        this._throttledRequestHandler()
    },
    _restartRequest: function(i) {
        var req = this._requests[i];
        if (req.dead === null) {
            req.dead = new Date()
        }
        this._processRequest(i)
    },
    _reqToData: function(req) {
        try {
            return req.getResponse()
        } catch (e) {
            if (e != "parsererror") {
                throw e
            }
            this._conn.disconnect("strophe-parsererror")
        }
    },
    _sendTerminate: function(pres) {
        Strophe.info("_sendTerminate was called");
        var body = this._buildBody().attrs({
            type: "terminate"
        });
        if (pres) {
            body.cnode(pres.tree())
        }
        var req = new Strophe.Request(body.tree(), this._onRequestStateChange.bind(this, this._conn._dataRecv.bind(this._conn)), body.tree().getAttribute("rid"));
        this._requests.push(req);
        this._throttledRequestHandler()
    },
    _send: function() {
        clearTimeout(this._conn._idleTimeout);
        this._throttledRequestHandler();
        this._conn._idleTimeout = setTimeout(this._conn._onIdle.bind(this._conn), 100)
    },
    _sendRestart: function() {
        this._throttledRequestHandler();
        clearTimeout(this._conn._idleTimeout)
    },
    _throttledRequestHandler: function() {
        if (!this._requests) {
            Strophe.debug("_throttledRequestHandler called with undefined requests")
        } else {
            Strophe.debug("_throttledRequestHandler called with " + this._requests.length + " requests")
        }
        if (!this._requests || this._requests.length === 0) {
            return
        }
        if (this._requests.length > 0) {
            this._processRequest(0)
        }
        if (this._requests.length > 1 && Math.abs(this._requests[0].rid - this._requests[1].rid) < this.window) {
            this._processRequest(1)
        }
    }
};
Strophe.Websocket = function(connection) {
    this._conn = connection;
    this.strip = "stream:stream";
    var service = connection.service;
    if (service.indexOf("ws:") !== 0 && service.indexOf("wss:") !== 0) {
        var new_service = "";
        if (connection.options.protocol === "ws" && window.location.protocol !== "https:") {
            new_service += "ws"
        } else {
            new_service += "wss"
        }
        new_service += "://" + window.location.host;
        if (service.indexOf("/") !== 0) {
            new_service += window.location.pathname + service
        } else {
            new_service += service
        }
        connection.service = new_service
    }
};
Strophe.Websocket.prototype = {
    _buildStream: function() {
        return $build("stream:stream", {
            to: this._conn.domain,
            xmlns: Strophe.NS.CLIENT,
            "xmlns:stream": Strophe.NS.STREAM,
            version: "1.0"
        })
    },
    _check_streamerror: function(bodyWrap, connectstatus) {
        var errors = bodyWrap.getElementsByTagName("stream:error");
        if (errors.length === 0) {
            return false
        }
        var error = errors[0];
        var condition = "";
        var text = "";
        var ns = "urn:ietf:params:xml:ns:xmpp-streams";
        for (var i = 0; i < error.childNodes.length; i++) {
            var e = error.childNodes[i];
            if (e.getAttribute("xmlns") !== ns) {
                break
            }
            if (e.nodeName === "text") {
                text = e.textContent
            } else {
                condition = e.nodeName
            }
        }
        var errorString = "WebSocket stream error: ";
        if (condition) {
            errorString += condition
        } else {
            errorString += "unknown"
        }
        if (text) {
            errorString += " - " + condition
        }
        Strophe.error(errorString);
        this._conn._changeConnectStatus(connectstatus, condition);
        this._conn._doDisconnect();
        return true
    },
    _reset: function() {
        return
    },
    _connect: function() {
        this._closeSocket();
        this.socket = new WebSocket(this._conn.service, "xmpp");
        this.socket.onopen = this._onOpen.bind(this);
        this.socket.onerror = this._onError.bind(this);
        this.socket.onclose = this._onClose.bind(this);
        this.socket.onmessage = this._connect_cb_wrapper.bind(this)
    },
    _connect_cb: function(bodyWrap) {
        var error = this._check_streamerror(bodyWrap, Strophe.Status.CONNFAIL);
        if (error) {
            return Strophe.Status.CONNFAIL
        }
    },
    _handleStreamStart: function(message) {
        var error = false;
        var ns = message.getAttribute("xmlns");
        if (typeof ns !== "string") {
            error = "Missing xmlns in stream:stream"
        } else {
            if (ns !== Strophe.NS.CLIENT) {
                error = "Wrong xmlns in stream:stream: " + ns
            }
        }
        var ns_stream = message.namespaceURI;
        if (typeof ns_stream !== "string") {
            error = "Missing xmlns:stream in stream:stream"
        } else {
            if (ns_stream !== Strophe.NS.STREAM) {
                error = "Wrong xmlns:stream in stream:stream: " + ns_stream
            }
        }
        var ver = message.getAttribute("version");
        if (typeof ver !== "string") {
            error = "Missing version in stream:stream"
        } else {
            if (ver !== "1.0") {
                error = "Wrong version in stream:stream: " + ver
            }
        }
        if (error) {
            this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, error);
            this._conn._doDisconnect();
            return false
        }
        return true
    },
    _connect_cb_wrapper: function(message) {
        if (message.data.indexOf("<stream:stream ") === 0 || message.data.indexOf("<?xml") === 0) {
            var data = message.data.replace(/^(<\?.*?\?>\s*)*/, "");
            if (data === "") {
                return
            }
            data = message.data.replace(/<stream:stream (.*[^\/])>/, "<stream:stream $1/>");
            var streamStart = new DOMParser().parseFromString(data, "text/xml").documentElement;
            this._conn.xmlInput(streamStart);
            this._conn.rawInput(message.data);
            if (this._handleStreamStart(streamStart)) {
                this._connect_cb(streamStart);
                this.streamStart = message.data.replace(/^<stream:(.*)\/>$/, "<stream:$1>")
            }
        } else {
            if (message.data === "</stream:stream>") {
                this._conn.rawInput(message.data);
                this._conn.xmlInput(document.createElement("stream:stream"));
                this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, "Received closing stream");
                this._conn._doDisconnect();
                return
            } else {
                var string = this._streamWrap(message.data);
                var elem = new DOMParser().parseFromString(string, "text/xml").documentElement;
                this.socket.onmessage = this._onMessage.bind(this);
                this._conn._connect_cb(elem, null, message.data)
            }
        }
    },
    _disconnect: function(pres) {
        if (this.socket.readyState !== WebSocket.CLOSED) {
            if (pres) {
                this._conn.send(pres)
            }
            var close = "</stream:stream>";
            this._conn.xmlOutput(document.createElement("stream:stream"));
            this._conn.rawOutput(close);
            try {
                this.socket.send(close)
            } catch (e) {
                Strophe.info("Couldn't send closing stream tag.")
            }
        }
        this._conn._doDisconnect()
    },
    _doDisconnect: function() {
        Strophe.info("WebSockets _doDisconnect was called");
        this._closeSocket()
    },
    _streamWrap: function(stanza) {
        return this.streamStart + stanza + "</stream:stream>"
    },
    _closeSocket: function() {
        if (this.socket) {
            try {
                this.socket.close()
            } catch (e) {}
        }
        this.socket = null
    },
    _emptyQueue: function() {
        return true
    },
    _onClose: function() {
        if (this._conn.connected && !this._conn.disconnecting) {
            Strophe.error("Websocket closed unexcectedly");
            this._conn._doDisconnect()
        } else {
            Strophe.info("Websocket closed")
        }
    },
    _no_auth_received: function(_callback) {
        Strophe.error("Server did not send any auth methods");
        this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, "Server did not send any auth methods");
        if (_callback) {
            _callback = _callback.bind(this._conn);
            _callback()
        }
        this._conn._doDisconnect()
    },
    _onDisconnectTimeout: function() {},
    _onError: function(error) {
        Strophe.error("Websocket error " + error);
        this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, "The WebSocket connection could not be established was disconnected.");
        this._disconnect()
    },
    _onIdle: function() {
        var data = this._conn._data;
        if (data.length > 0 && !this._conn.paused) {
            for (var i = 0; i < data.length; i++) {
                if (data[i] !== null) {
                    var stanza, rawStanza;
                    if (data[i] === "restart") {
                        stanza = this._buildStream();
                        rawStanza = this._removeClosingTag(stanza);
                        stanza = stanza.tree()
                    } else {
                        stanza = data[i];
                        rawStanza = Strophe.serialize(stanza)
                    }
                    this._conn.xmlOutput(stanza);
                    this._conn.rawOutput(rawStanza);
                    this.socket.send(rawStanza)
                }
            }
            this._conn._data = []
        }
    },
    _onMessage: function(message) {
        var elem, data;
        if (message.data === "</stream:stream>") {
            var close = "</stream:stream>";
            this._conn.rawInput(close);
            this._conn.xmlInput(document.createElement("stream:stream"));
            if (!this._conn.disconnecting) {
                this._conn._doDisconnect()
            }
            return
        } else {
            if (message.data.search("<stream:stream ") === 0) {
                data = message.data.replace(/<stream:stream (.*[^\/])>/, "<stream:stream $1/>");
                elem = new DOMParser().parseFromString(data, "text/xml").documentElement;
                if (!this._handleStreamStart(elem)) {
                    return
                }
            } else {
                data = this._streamWrap(message.data);
                elem = new DOMParser().parseFromString(data, "text/xml").documentElement
            }
        }
        if (this._check_streamerror(elem, Strophe.Status.ERROR)) {
            return
        }
        if (this._conn.disconnecting && elem.firstChild.nodeName === "presence" && elem.firstChild.getAttribute("type") === "unavailable") {
            this._conn.xmlInput(elem);
            this._conn.rawInput(Strophe.serialize(elem));
            return
        }
        this._conn._dataRecv(elem, message.data)
    },
    _onOpen: function() {
        Strophe.info("Websocket open");
        var start = this._buildStream();
        this._conn.xmlOutput(start.tree());
        var startString = this._removeClosingTag(start);
        this._conn.rawOutput(startString);
        this.socket.send(startString)
    },
    _removeClosingTag: function(elem) {
        var string = Strophe.serialize(elem);
        string = string.replace(/<(stream:stream .*[^\/])\/>$/, "<$1>");
        return string
    },
    _reqToData: function(stanza) {
        return stanza
    },
    _send: function() {
        this._conn.flush()
    },
    _sendRestart: function() {
        clearTimeout(this._conn._idleTimeout);
        this._conn._onIdle.bind(this._conn)()
    }
};