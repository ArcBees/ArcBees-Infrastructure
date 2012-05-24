(function () {
    function diff_match_patch() {
        this.Diff_Timeout = 1;
        this.Diff_EditCost = 4;
        this.Match_Threshold = 0.5;
        this.Match_Distance = 1E3;
        this.Patch_DeleteThreshold = 0.5;
        this.Patch_Margin = 4;
        this.Match_MaxBits = 32
    }

    diff_match_patch.prototype.diff_main = function (a, b, c, d) {
        typeof d == "undefined" && (d = this.Diff_Timeout <= 0 ? Number.MAX_VALUE : (new Date).getTime() + this.Diff_Timeout * 1E3);
        if (a == null || b == null)throw Error("Null input. (diff_main)");
        if (a == b)return a ? [
            [0, a]
        ] : [];
        typeof c == "undefined" && (c = !0);
        var e = c, f = this.diff_commonPrefix(a, b), c = a.substring(0, f), a = a.substring(f), b = b.substring(f), f = this.diff_commonSuffix(a, b), g = a.substring(a.length - f), a = a.substring(0, a.length - f), b = b.substring(0, b.length - f), a = this.diff_compute_(a,
            b, e, d);
        c && a.unshift([0, c]);
        g && a.push([0, g]);
        this.diff_cleanupMerge(a);
        return a
    };
    diff_match_patch.prototype.diff_compute_ = function (a, b, c, d) {
        if (!a)return[
            [1, b]
        ];
        if (!b)return[
            [-1, a]
        ];
        var e = a.length > b.length ? a : b, f = a.length > b.length ? b : a, g = e.indexOf(f);
        if (g != -1)return c = [
            [1, e.substring(0, g)],
            [0, f],
            [1, e.substring(g + f.length)]
        ], a.length > b.length && (c[0][0] = c[2][0] = -1), c;
        if (f.length == 1)return[
            [-1, a],
            [1, b]
        ];
        return(e = this.diff_halfMatch_(a, b)) ? (f = e[0], a = e[1], g = e[2], b = e[3], e = e[4], f = this.diff_main(f, g, c, d), c = this.diff_main(a, b, c, d), f.concat([
            [0, e]
        ], c)) : c && a.length > 100 && b.length > 100 ? this.diff_lineMode_(a,
            b, d) : this.diff_bisect_(a, b, d)
    };
    diff_match_patch.prototype.diff_lineMode_ = function (a, b, c) {
        var d = this.diff_linesToChars_(a, b), a = d[0], b = d[1], d = d[2], a = this.diff_bisect_(a, b, c);
        this.diff_charsToLines_(a, d);
        this.diff_cleanupSemantic(a);
        a.push([0, ""]);
        for (var e = b = 0, f = 0, g = d = ""; b < a.length;) {
            switch (a[b][0]) {
                case 1:
                    f++;
                    g += a[b][1];
                    break;
                case -1:
                    e++;
                    d += a[b][1];
                    break;
                case 0:
                    if (e >= 1 && f >= 1) {
                        d = this.diff_main(d, g, !1, c);
                        a.splice(b - e - f, e + f);
                        b = b - e - f;
                        for (e = d.length - 1; e >= 0; e--)a.splice(b, 0, d[e]);
                        b += d.length
                    }
                    e = f = 0;
                    g = d = ""
            }
            b++
        }
        a.pop();
        return a
    };
    diff_match_patch.prototype.diff_bisect_ = function (a, b, c) {
        for (var d = a.length, e = b.length, f = Math.ceil((d + e) / 2), g = f, h = 2 * f, j = Array(h), i = Array(h), k = 0; k < h; k++)j[k] = -1, i[k] = -1;
        j[g + 1] = 0;
        i[g + 1] = 0;
        for (var k = d - e, l = k % 2 != 0, p = 0, r = 0, o = 0, t = 0, v = 0; v < f; v++) {
            if ((new Date).getTime() > c)break;
            for (var q = -v + p; q <= v - r; q += 2) {
                var m = g + q, n;
                n = q == -v || q != v && j[m - 1] < j[m + 1] ? j[m + 1] : j[m - 1] + 1;
                for (var s = n - q; n < d && s < e && a.charAt(n) == b.charAt(s);)n++, s++;
                j[m] = n;
                if (n > d)r += 2; else if (s > e)p += 2; else if (l && (m = g + k - q, m >= 0 && m < h && i[m] != -1)) {
                    var u = d - i[m];
                    if (n >= u)return this.diff_bisectSplit_(a, b, n, s, c)
                }
            }
            for (q = -v + o; q <= v - t; q += 2) {
                m = g + q;
                u = q == -v || q != v && i[m - 1] < i[m + 1] ? i[m + 1] : i[m - 1] + 1;
                for (n = u - q; u < d && n < e && a.charAt(d - u - 1) == b.charAt(e - n - 1);)u++, n++;
                i[m] = u;
                if (u > d)t += 2; else if (n > e)o += 2; else if (!l && (m = g + k - q, m >= 0 && m < h && j[m] != -1 && (n = j[m], s = g + n - m, u = d - u, n >= u)))return this.diff_bisectSplit_(a, b, n, s, c)
            }
        }
        return[
            [-1, a],
            [1, b]
        ]
    };
    diff_match_patch.prototype.diff_bisectSplit_ = function (a, b, c, d, e) {
        var f = a.substring(0, c), g = b.substring(0, d), a = a.substring(c), b = b.substring(d), f = this.diff_main(f, g, !1, e), e = this.diff_main(a, b, !1, e);
        return f.concat(e)
    };
    diff_match_patch.prototype.diff_linesToChars_ = function (a, b) {
        function c(a) {
            for (var b = "", c = 0, f = -1, g = d.length; f < a.length - 1;) {
                f = a.indexOf("\n", c);
                f == -1 && (f = a.length - 1);
                var p = a.substring(c, f + 1), c = f + 1;
                (e.hasOwnProperty ? e.hasOwnProperty(p) : e[p] !== void 0) ? b += String.fromCharCode(e[p]) : (b += String.fromCharCode(g), e[p] = g, d[g++] = p)
            }
            return b
        }

        var d = [], e = {};
        d[0] = "";
        var f = c(a), g = c(b);
        return[f, g, d]
    };
    diff_match_patch.prototype.diff_charsToLines_ = function (a, b) {
        for (var c = 0; c < a.length; c++) {
            for (var d = a[c][1], e = [], f = 0; f < d.length; f++)e[f] = b[d.charCodeAt(f)];
            a[c][1] = e.join("")
        }
    };
    diff_match_patch.prototype.diff_commonPrefix = function (a, b) {
        if (!a || !b || a.charAt(0) != b.charAt(0))return 0;
        for (var c = 0, d = Math.min(a.length, b.length), e = d, f = 0; c < e;)a.substring(f, e) == b.substring(f, e) ? f = c = e : d = e, e = Math.floor((d - c) / 2 + c);
        return e
    };
    diff_match_patch.prototype.diff_commonSuffix = function (a, b) {
        if (!a || !b || a.charAt(a.length - 1) != b.charAt(b.length - 1))return 0;
        for (var c = 0, d = Math.min(a.length, b.length), e = d, f = 0; c < e;)a.substring(a.length - e, a.length - f) == b.substring(b.length - e, b.length - f) ? f = c = e : d = e, e = Math.floor((d - c) / 2 + c);
        return e
    };
    diff_match_patch.prototype.diff_commonOverlap_ = function (a, b) {
        var c = a.length, d = b.length;
        if (c == 0 || d == 0)return 0;
        c > d ? a = a.substring(c - d) : c < d && (b = b.substring(0, c));
        c = Math.min(c, d);
        if (a == b)return c;
        for (var d = 0, e = 1; ;) {
            var f = a.substring(c - e), f = b.indexOf(f);
            if (f == -1)return d;
            e += f;
            if (f == 0 || a.substring(c - e) == b.substring(0, e))d = e, e++
        }
    };
    diff_match_patch.prototype.diff_halfMatch_ = function (a, b) {
        function c(a, b, c) {
            for (var d = a.substring(c, c + Math.floor(a.length / 4)), e = -1, g = "", h, j, q, m; (e = b.indexOf(d, e + 1)) != -1;) {
                var n = f.diff_commonPrefix(a.substring(c), b.substring(e)), s = f.diff_commonSuffix(a.substring(0, c), b.substring(0, e));
                g.length < s + n && (g = b.substring(e - s, e) + b.substring(e, e + n), h = a.substring(0, c - s), j = a.substring(c + n), q = b.substring(0, e - s), m = b.substring(e + n))
            }
            return g.length * 2 >= a.length ? [h, j, q, m, g] : null
        }

        if (this.Diff_Timeout <= 0)return null;
        var d = a.length > b.length ? a : b, e = a.length > b.length ? b : a;
        if (d.length < 4 || e.length * 2 < d.length)return null;
        var f = this, g = c(d, e, Math.ceil(d.length / 4)), d = c(d, e, Math.ceil(d.length / 2)), h;
        if (!g && !d)return null; else h = d ? g ? g[4].length > d[4].length ? g : d : d : g;
        var j;
        a.length > b.length ? (g = h[0], d = h[1], e = h[2], j = h[3]) : (e = h[0], j = h[1], g = h[2], d = h[3]);
        h = h[4];
        return[g, d, e, j, h]
    };
    diff_match_patch.prototype.diff_cleanupSemantic = function (a) {
        for (var b = !1, c = [], d = 0, e = null, f = 0, g = 0, h = 0, j = 0, i = 0; f < a.length;)a[f][0] == 0 ? (c[d++] = f, g = j, h = i, i = j = 0, e = a[f][1]) : (a[f][0] == 1 ? j += a[f][1].length : i += a[f][1].length, e !== null && e.length <= Math.max(g, h) && e.length <= Math.max(j, i) && (a.splice(c[d - 1], 0, [-1, e]), a[c[d - 1] + 1][0] = 1, d--, d--, f = d > 0 ? c[d - 1] : -1, i = j = h = g = 0, e = null, b = !0)), f++;
        b && this.diff_cleanupMerge(a);
        this.diff_cleanupSemanticLossless(a);
        for (f = 1; f < a.length;) {
            if (a[f - 1][0] == -1 && a[f][0] == 1) {
                b = a[f - 1][1];
                c =
                    a[f][1];
                d = this.diff_commonOverlap_(b, c);
                if (d >= b.length / 2 || d >= c.length / 2)a.splice(f, 0, [0, c.substring(0, d)]), a[f - 1][1] = b.substring(0, b.length - d), a[f + 1][1] = c.substring(d), f++;
                f++
            }
            f++
        }
    };
    diff_match_patch.prototype.diff_cleanupSemanticLossless = function (a) {
        function b(a, b) {
            if (!a || !b)return 5;
            var h = 0;
            if (a.charAt(a.length - 1).match(c) || b.charAt(0).match(c))if (h++, a.charAt(a.length - 1).match(d) || b.charAt(0).match(d))if (h++, a.charAt(a.length - 1).match(e) || b.charAt(0).match(e))h++, (a.match(f) || b.match(g)) && h++;
            return h
        }

        for (var c = /[^a-zA-Z0-9]/, d = /\s/, e = /[\r\n]/, f = /\n\r?\n$/, g = /^\r?\n\r?\n/, h = 1; h < a.length - 1;) {
            if (a[h - 1][0] == 0 && a[h + 1][0] == 0) {
                var j = a[h - 1][1], i = a[h][1], k = a[h + 1][1], l = this.diff_commonSuffix(j,
                    i);
                if (l)var p = i.substring(i.length - l), j = j.substring(0, j.length - l), i = p + i.substring(0, i.length - l), k = p + k;
                for (var l = j, p = i, r = k, o = b(j, i) + b(i, k); i.charAt(0) === k.charAt(0);) {
                    j += i.charAt(0);
                    var i = i.substring(1) + k.charAt(0), k = k.substring(1), t = b(j, i) + b(i, k);
                    t >= o && (o = t, l = j, p = i, r = k)
                }
                a[h - 1][1] != l && (l ? a[h - 1][1] = l : (a.splice(h - 1, 1), h--), a[h][1] = p, r ? a[h + 1][1] = r : (a.splice(h + 1, 1), h--))
            }
            h++
        }
    };
    diff_match_patch.prototype.diff_cleanupEfficiency = function (a) {
        for (var b = !1, c = [], d = 0, e = "", f = 0, g = !1, h = !1, j = !1, i = !1; f < a.length;) {
            if (a[f][0] == 0)a[f][1].length < this.Diff_EditCost && (j || i) ? (c[d++] = f, g = j, h = i, e = a[f][1]) : (d = 0, e = ""), j = i = !1; else if (a[f][0] == -1 ? i = !0 : j = !0, e && (g && h && j && i || e.length < this.Diff_EditCost / 2 && g + h + j + i == 3))a.splice(c[d - 1], 0, [-1, e]), a[c[d - 1] + 1][0] = 1, d--, e = "", g && h ? (j = i = !0, d = 0) : (d--, f = d > 0 ? c[d - 1] : -1, j = i = !1), b = !0;
            f++
        }
        b && this.diff_cleanupMerge(a)
    };
    diff_match_patch.prototype.diff_cleanupMerge = function (a) {
        a.push([0, ""]);
        for (var b = 0, c = 0, d = 0, e = "", f = "", g; b < a.length;)switch (a[b][0]) {
            case 1:
                d++;
                f += a[b][1];
                b++;
                break;
            case -1:
                c++;
                e += a[b][1];
                b++;
                break;
            case 0:
                c + d > 1 ? (c !== 0 && d !== 0 && (g = this.diff_commonPrefix(f, e), g !== 0 && (b - c - d > 0 && a[b - c - d - 1][0] == 0 ? a[b - c - d - 1][1] += f.substring(0, g) : (a.splice(0, 0, [0, f.substring(0, g)]), b++), f = f.substring(g), e = e.substring(g)), g = this.diff_commonSuffix(f, e), g !== 0 && (a[b][1] = f.substring(f.length - g) + a[b][1], f = f.substring(0, f.length -
                    g), e = e.substring(0, e.length - g))), c === 0 ? a.splice(b - c - d, c + d, [1, f]) : d === 0 ? a.splice(b - c - d, c + d, [-1, e]) : a.splice(b - c - d, c + d, [-1, e], [1, f]), b = b - c - d + (c ? 1 : 0) + (d ? 1 : 0) + 1) : b !== 0 && a[b - 1][0] == 0 ? (a[b - 1][1] += a[b][1], a.splice(b, 1)) : b++, c = d = 0, f = e = ""
        }
        a[a.length - 1][1] === "" && a.pop();
        c = !1;
        for (b = 1; b < a.length - 1;)a[b - 1][0] == 0 && a[b + 1][0] == 0 && (a[b][1].substring(a[b][1].length - a[b - 1][1].length) == a[b - 1][1] ? (a[b][1] = a[b - 1][1] + a[b][1].substring(0, a[b][1].length - a[b - 1][1].length), a[b + 1][1] = a[b - 1][1] + a[b + 1][1], a.splice(b - 1, 1), c = !0) :
            a[b][1].substring(0, a[b + 1][1].length) == a[b + 1][1] && (a[b - 1][1] += a[b + 1][1], a[b][1] = a[b][1].substring(a[b + 1][1].length) + a[b + 1][1], a.splice(b + 1, 1), c = !0)), b++;
        c && this.diff_cleanupMerge(a)
    };
    diff_match_patch.prototype.diff_xIndex = function (a, b) {
        var c = 0, d = 0, e = 0, f = 0, g;
        for (g = 0; g < a.length; g++) {
            a[g][0] !== 1 && (c += a[g][1].length);
            a[g][0] !== -1 && (d += a[g][1].length);
            if (c > b)break;
            e = c;
            f = d
        }
        return a.length != g && a[g][0] === -1 ? f : f + (b - e)
    };
    diff_match_patch.prototype.diff_prettyHtml = function (a) {
        for (var b = [], c = 0, d = /&/g, e = /</g, f = />/g, g = /\n/g, h = 0; h < a.length; h++) {
            var j = a[h][0], i = a[h][1], k = i.replace(d, "&amp;").replace(e, "&lt;").replace(f, "&gt;").replace(g, "&para;<br>");
            switch (j) {
                case 1:
                    b[h] = '<ins style="background:#e6ffe6;">' + k + "</ins>";
                    break;
                case -1:
                    b[h] = '<del style="background:#ffe6e6;">' + k + "</del>";
                    break;
                case 0:
                    b[h] = "<span>" + k + "</span>"
            }
            j !== -1 && (c += i.length)
        }
        return b.join("")
    };
    diff_match_patch.prototype.diff_text1 = function (a) {
        for (var b = [], c = 0; c < a.length; c++)a[c][0] !== 1 && (b[c] = a[c][1]);
        return b.join("")
    };
    diff_match_patch.prototype.diff_text2 = function (a) {
        for (var b = [], c = 0; c < a.length; c++)a[c][0] !== -1 && (b[c] = a[c][1]);
        return b.join("")
    };
    diff_match_patch.prototype.diff_levenshtein = function (a) {
        for (var b = 0, c = 0, d = 0, e = 0; e < a.length; e++) {
            var f = a[e][0], g = a[e][1];
            switch (f) {
                case 1:
                    c += g.length;
                    break;
                case -1:
                    d += g.length;
                    break;
                case 0:
                    b += Math.max(c, d), d = c = 0
            }
        }
        b += Math.max(c, d);
        return b
    };
    diff_match_patch.prototype.diff_toDelta = function (a) {
        for (var b = [], c = 0; c < a.length; c++)switch (a[c][0]) {
            case 1:
                b[c] = "+" + encodeURI(a[c][1]);
                break;
            case -1:
                b[c] = "-" + a[c][1].length;
                break;
            case 0:
                b[c] = "=" + a[c][1].length
        }
        return b.join("\t").replace(/%20/g, " ")
    };
    diff_match_patch.prototype.diff_fromDelta = function (a, b) {
        for (var c = [], d = 0, e = 0, f = b.split(/\t/g), g = 0; g < f.length; g++) {
            var h = f[g].substring(1);
            switch (f[g].charAt(0)) {
                case "+":
                    try {
                        c[d++] = [1, decodeURI(h)]
                    } catch (j) {
                        throw Error("Illegal escape in diff_fromDelta: " + h);
                    }
                    break;
                case "-":
                case "=":
                    var i = parseInt(h, 10);
                    if (isNaN(i) || i < 0)throw Error("Invalid number in diff_fromDelta: " + h);
                    h = a.substring(e, e += i);
                    f[g].charAt(0) == "=" ? c[d++] = [0, h] : c[d++] = [-1, h];
                    break;
                default:
                    if (f[g])throw Error("Invalid diff operation in diff_fromDelta: " +
                        f[g]);
            }
        }
        if (e != a.length)throw Error("Delta length (" + e + ") does not equal source text length (" + a.length + ").");
        return c
    };
    diff_match_patch.prototype.match_main = function (a, b, c) {
        if (a == null || b == null || c == null)throw Error("Null input. (match_main)");
        c = Math.max(0, Math.min(c, a.length));
        return a == b ? 0 : a.length ? a.substring(c, c + b.length) == b ? c : this.match_bitap_(a, b, c) : -1
    };
    diff_match_patch.prototype.match_bitap_ = function (a, b, c) {
        function d(a, d) {
            var e = a / b.length, g = Math.abs(c - d);
            return!f.Match_Distance ? g ? 1 : e : e + g / f.Match_Distance
        }

        if (b.length > this.Match_MaxBits)throw Error("Pattern too long for this browser.");
        var e = this.match_alphabet_(b), f = this, g = this.Match_Threshold, h = a.indexOf(b, c);
        h != -1 && (g = Math.min(d(0, h), g), h = a.lastIndexOf(b, c + b.length), h != -1 && (g = Math.min(d(0, h), g)));
        for (var j = 1 << b.length - 1, h = -1, i, k, l = b.length + a.length, p, r = 0; r < b.length; r++) {
            i = 0;
            for (k = l; i < k;)d(r, c +
                k) <= g ? i = k : l = k, k = Math.floor((l - i) / 2 + i);
            l = k;
            i = Math.max(1, c - k + 1);
            var o = Math.min(c + k, a.length) + b.length;
            k = Array(o + 2);
            for (k[o + 1] = (1 << r) - 1; o >= i; o--) {
                var t = e[a.charAt(o - 1)];
                k[o] = r === 0 ? (k[o + 1] << 1 | 1) & t : (k[o + 1] << 1 | 1) & t | (p[o + 1] | p[o]) << 1 | 1 | p[o + 1];
                if (k[o] & j && (t = d(r, o - 1), t <= g))if (g = t, h = o - 1, h > c)i = Math.max(1, 2 * c - h); else break
            }
            if (d(r + 1, c) > g)break;
            p = k
        }
        return h
    };
    diff_match_patch.prototype.match_alphabet_ = function (a) {
        for (var b = {}, c = 0; c < a.length; c++)b[a.charAt(c)] = 0;
        for (c = 0; c < a.length; c++)b[a.charAt(c)] |= 1 << a.length - c - 1;
        return b
    };
    diff_match_patch.prototype.patch_addContext_ = function (a, b) {
        if (b.length != 0) {
            for (var c = b.substring(a.start2, a.start2 + a.length1), d = 0; b.indexOf(c) != b.lastIndexOf(c) && c.length < this.Match_MaxBits - this.Patch_Margin - this.Patch_Margin;)d += this.Patch_Margin, c = b.substring(a.start2 - d, a.start2 + a.length1 + d);
            d += this.Patch_Margin;
            (c = b.substring(a.start2 - d, a.start2)) && a.diffs.unshift([0, c]);
            (d = b.substring(a.start2 + a.length1, a.start2 + a.length1 + d)) && a.diffs.push([0, d]);
            a.start1 -= c.length;
            a.start2 -= c.length;
            a.length1 +=
                c.length + d.length;
            a.length2 += c.length + d.length
        }
    };
    diff_match_patch.prototype.patch_make = function (a, b, c) {
        var d;
        if (typeof a == "string" && typeof b == "string" && typeof c == "undefined")d = a, b = this.diff_main(d, b, !0), b.length > 2 && (this.diff_cleanupSemantic(b), this.diff_cleanupEfficiency(b)); else if (a && typeof a == "object" && typeof b == "undefined" && typeof c == "undefined")b = a, d = this.diff_text1(b); else if (typeof a == "string" && b && typeof b == "object" && typeof c == "undefined")d = a; else if (typeof a == "string" && typeof b == "string" && c && typeof c == "object")d = a, b = c; else throw Error("Unknown call format to patch_make.");
        if (b.length === 0)return[];
        for (var c = [], a = new patch_obj, e = 0, f = 0, g = 0, h = d, j = 0; j < b.length; j++) {
            var i = b[j][0], k = b[j][1];
            if (!e && i !== 0)a.start1 = f, a.start2 = g;
            switch (i) {
                case 1:
                    a.diffs[e++] = b[j];
                    a.length2 += k.length;
                    d = d.substring(0, g) + k + d.substring(g);
                    break;
                case -1:
                    a.length1 += k.length;
                    a.diffs[e++] = b[j];
                    d = d.substring(0, g) + d.substring(g + k.length);
                    break;
                case 0:
                    k.length <= 2 * this.Patch_Margin && e && b.length != j + 1 ? (a.diffs[e++] = b[j], a.length1 += k.length, a.length2 += k.length) : k.length >= 2 * this.Patch_Margin && e && (this.patch_addContext_(a,
                        h), c.push(a), a = new patch_obj, e = 0, h = d, f = g)
            }
            i !== 1 && (f += k.length);
            i !== -1 && (g += k.length)
        }
        e && (this.patch_addContext_(a, h), c.push(a));
        return c
    };
    diff_match_patch.prototype.patch_deepCopy = function (a) {
        for (var b = [], c = 0; c < a.length; c++) {
            var d = a[c], e = new patch_obj;
            e.diffs = [];
            for (var f = 0; f < d.diffs.length; f++)e.diffs[f] = d.diffs[f].slice();
            e.start1 = d.start1;
            e.start2 = d.start2;
            e.length1 = d.length1;
            e.length2 = d.length2;
            b[c] = e
        }
        return b
    };
    diff_match_patch.prototype.patch_apply = function (a, b) {
        if (a.length == 0)return[b, []];
        var a = this.patch_deepCopy(a), c = this.patch_addPadding(a), b = c + b + c;
        this.patch_splitMax(a);
        for (var d = 0, e = [], f = 0; f < a.length; f++) {
            var g = a[f].start2 + d, h = this.diff_text1(a[f].diffs), j, i = -1;
            if (h.length > this.Match_MaxBits) {
                if (j = this.match_main(b, h.substring(0, this.Match_MaxBits), g), j != -1 && (i = this.match_main(b, h.substring(h.length - this.Match_MaxBits), g + h.length - this.Match_MaxBits), i == -1 || j >= i))j = -1
            } else j = this.match_main(b, h, g);
            if (j == -1)e[f] = !1, d -= a[f].length2 - a[f].length1; else if (e[f] = !0, d = j - g, g = i == -1 ? b.substring(j, j + h.length) : b.substring(j, i + this.Match_MaxBits), h == g)b = b.substring(0, j) + this.diff_text2(a[f].diffs) + b.substring(j + h.length); else if (g = this.diff_main(h, g, !1), h.length > this.Match_MaxBits && this.diff_levenshtein(g) / h.length > this.Patch_DeleteThreshold)e[f] = !1; else {
                this.diff_cleanupSemanticLossless(g);
                for (var h = 0, k, i = 0; i < a[f].diffs.length; i++) {
                    var l = a[f].diffs[i];
                    l[0] !== 0 && (k = this.diff_xIndex(g, h));
                    l[0] === 1 ? b = b.substring(0,
                        j + k) + l[1] + b.substring(j + k) : l[0] === -1 && (b = b.substring(0, j + k) + b.substring(j + this.diff_xIndex(g, h + l[1].length)));
                    l[0] !== -1 && (h += l[1].length)
                }
            }
        }
        b = b.substring(c.length, b.length - c.length);
        return[b, e]
    };
    diff_match_patch.prototype.patch_addPadding = function (a) {
        for (var b = this.Patch_Margin, c = "", d = 1; d <= b; d++)c += String.fromCharCode(d);
        for (d = 0; d < a.length; d++)a[d].start1 += b, a[d].start2 += b;
        var d = a[0], e = d.diffs;
        if (e.length == 0 || e[0][0] != 0)e.unshift([0, c]), d.start1 -= b, d.start2 -= b, d.length1 += b, d.length2 += b; else if (b > e[0][1].length) {
            var f = b - e[0][1].length;
            e[0][1] = c.substring(e[0][1].length) + e[0][1];
            d.start1 -= f;
            d.start2 -= f;
            d.length1 += f;
            d.length2 += f
        }
        d = a[a.length - 1];
        e = d.diffs;
        e.length == 0 || e[e.length - 1][0] != 0 ? (e.push([0,
            c]), d.length1 += b, d.length2 += b) : b > e[e.length - 1][1].length && (f = b - e[e.length - 1][1].length, e[e.length - 1][1] += c.substring(0, f), d.length1 += f, d.length2 += f);
        return c
    };
    diff_match_patch.prototype.patch_splitMax = function (a) {
        for (var b = this.Match_MaxBits, c = 0; c < a.length; c++)if (a[c].length1 > b) {
            var d = a[c];
            a.splice(c--, 1);
            for (var e = d.start1, f = d.start2, g = ""; d.diffs.length !== 0;) {
                var h = new patch_obj, j = !0;
                h.start1 = e - g.length;
                h.start2 = f - g.length;
                if (g !== "")h.length1 = h.length2 = g.length, h.diffs.push([0, g]);
                for (; d.diffs.length !== 0 && h.length1 < b - this.Patch_Margin;) {
                    var g = d.diffs[0][0], i = d.diffs[0][1];
                    g === 1 ? (h.length2 += i.length, f += i.length, h.diffs.push(d.diffs.shift()), j = !1) : g === -1 &&
                        h.diffs.length == 1 && h.diffs[0][0] == 0 && i.length > 2 * b ? (h.length1 += i.length, e += i.length, j = !1, h.diffs.push([g, i]), d.diffs.shift()) : (i = i.substring(0, b - h.length1 - this.Patch_Margin), h.length1 += i.length, e += i.length, g === 0 ? (h.length2 += i.length, f += i.length) : j = !1, h.diffs.push([g, i]), i == d.diffs[0][1] ? d.diffs.shift() : d.diffs[0][1] = d.diffs[0][1].substring(i.length))
                }
                g = this.diff_text2(h.diffs);
                g = g.substring(g.length - this.Patch_Margin);
                i = this.diff_text1(d.diffs).substring(0, this.Patch_Margin);
                i !== "" && (h.length1 += i.length,
                    h.length2 += i.length, h.diffs.length !== 0 && h.diffs[h.diffs.length - 1][0] === 0 ? h.diffs[h.diffs.length - 1][1] += i : h.diffs.push([0, i]));
                j || a.splice(++c, 0, h)
            }
        }
    };
    diff_match_patch.prototype.patch_toText = function (a) {
        for (var b = [], c = 0; c < a.length; c++)b[c] = a[c];
        return b.join("")
    };
    diff_match_patch.prototype.patch_fromText = function (a) {
        var b = [];
        if (!a)return b;
        for (var a = a.split("\n"), c = 0, d = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/; c < a.length;) {
            var e = a[c].match(d);
            if (!e)throw Error("Invalid patch string: " + a[c]);
            var f = new patch_obj;
            b.push(f);
            f.start1 = parseInt(e[1], 10);
            e[2] === "" ? (f.start1--, f.length1 = 1) : e[2] == "0" ? f.length1 = 0 : (f.start1--, f.length1 = parseInt(e[2], 10));
            f.start2 = parseInt(e[3], 10);
            e[4] === "" ? (f.start2--, f.length2 = 1) : e[4] == "0" ? f.length2 = 0 : (f.start2--, f.length2 = parseInt(e[4],
                10));
            for (c++; c < a.length;) {
                e = a[c].charAt(0);
                try {
                    var g = decodeURI(a[c].substring(1))
                } catch (h) {
                    throw Error("Illegal escape in patch_fromText: " + g);
                }
                if (e == "-")f.diffs.push([-1, g]); else if (e == "+")f.diffs.push([1, g]); else if (e == " ")f.diffs.push([0, g]); else if (e == "@")break; else if (e !== "")throw Error('Invalid patch mode "' + e + '" in: ' + g);
                c++
            }
        }
        return b
    };
    function patch_obj() {
        this.diffs = [];
        this.start2 = this.start1 = null;
        this.length2 = this.length1 = 0
    }

    patch_obj.prototype.toString = function () {
        var a, b;
        a = this.length1 === 0 ? this.start1 + ",0" : this.length1 == 1 ? this.start1 + 1 : this.start1 + 1 + "," + this.length1;
        b = this.length2 === 0 ? this.start2 + ",0" : this.length2 == 1 ? this.start2 + 1 : this.start2 + 1 + "," + this.length2;
        a = ["@@ -" + a + " +" + b + " @@\n"];
        var c;
        for (b = 0; b < this.diffs.length; b++) {
            switch (this.diffs[b][0]) {
                case 1:
                    c = "+";
                    break;
                case -1:
                    c = "-";
                    break;
                case 0:
                    c = " "
            }
            a[b + 1] = c + encodeURI(this.diffs[b][1]) + "\n"
        }
        return a.join("").replace(/%20/g, " ")
    };
    this.diff_match_patch = diff_match_patch;
    this.patch_obj = patch_obj;
    this.DIFF_DELETE = -1;
    this.DIFF_INSERT = 1;
    this.DIFF_EQUAL = 0;
})()
