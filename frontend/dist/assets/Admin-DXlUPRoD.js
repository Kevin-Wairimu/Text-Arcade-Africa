import {
  j as h,
  X as Ze,
  L as St,
  F as Xe,
  U as Je,
  z as et,
  H as Et,
  b as Ft,
  D as tt,
  T as $e,
  a as _t,
  A as rt,
  m as Ce,
  E as It,
  J as Rt,
  K as Mt,
  N as at,
  O as We,
  W as Tt,
  Y as zt,
  _ as nt,
  $ as Lt,
  a0 as Ot,
  a1 as Dt,
  C as Pt,
  a2 as st,
  a3 as Ht,
  a4 as it,
  a5 as lt,
  a6 as ot,
  a7 as ct,
  a8 as Bt,
  a9 as $t,
  aa as Wt,
  ab as Qt,
  d as dt,
  ac as ft,
  ad as Gt,
} from "./vendor-ui-CWCcK4Cr.js";
import { u as Vt, r as te, b as qt, L as Kt } from "./vendor-react-ETKQCU2X.js";
import { A as Me, B as Qe } from "./index-UDPKd6hI.js";
import { l as Yt } from "./vendor-utils-F73fQMrn.js";
function Zt(R, _) {
  return (
    _.forEach(function (D) {
      D &&
        typeof D != "string" &&
        !Array.isArray(D) &&
        Object.keys(D).forEach(function (u) {
          if (u !== "default" && !(u in R)) {
            var e = Object.getOwnPropertyDescriptor(D, u);
            Object.defineProperty(
              R,
              u,
              e.get
                ? e
                : {
                    enumerable: !0,
                    get: function () {
                      return D[u];
                    },
                  },
            );
          }
        });
    }),
    Object.freeze(R)
  );
}
function mt(R, _) {
  return new Promise(function (D, u) {
    let e;
    return Xt(R).then(function (t) {
      try {
        return (
          (e = t),
          D(new Blob([_.slice(0, 2), e, _.slice(2)], { type: "image/jpeg" }))
        );
      } catch (f) {
        return u(f);
      }
    }, u);
  });
}
const Xt = (R) =>
  new Promise((_, D) => {
    const u = new FileReader();
    (u.addEventListener("load", ({ target: { result: e } }) => {
      const t = new DataView(e);
      let f = 0;
      if (t.getUint16(f) !== 65496) return D("not a valid JPEG");
      for (f += 2; ; ) {
        const l = t.getUint16(f);
        if (l === 65498) break;
        const g = t.getUint16(f + 2);
        if (l === 65505 && t.getUint32(f + 4) === 1165519206) {
          const x = f + 10;
          let r;
          switch (t.getUint16(x)) {
            case 18761:
              r = !0;
              break;
            case 19789:
              r = !1;
              break;
            default:
              return D("TIFF header contains invalid endian");
          }
          if (t.getUint16(x + 2, r) !== 42)
            return D("TIFF header contains invalid version");
          const n = t.getUint32(x + 4, r),
            a = x + n + 2 + 12 * t.getUint16(x + n, r);
          for (let i = x + n + 2; i < a; i += 12)
            if (t.getUint16(i, r) == 274) {
              if (t.getUint16(i + 2, r) !== 3)
                return D("Orientation data type is invalid");
              if (t.getUint32(i + 4, r) !== 1)
                return D("Orientation data count is invalid");
              t.setUint16(i + 8, 1, r);
              break;
            }
          return _(e.slice(f, f + 2 + g));
        }
        f += 2 + g;
      }
      return _(new Blob());
    }),
      u.readAsArrayBuffer(R));
  });
var ze = {},
  Jt = {
    get exports() {
      return ze;
    },
    set exports(R) {
      ze = R;
    },
  };
(function (R) {
  var _,
    D,
    u = {};
  ((Jt.exports = u),
    (u.parse = function (e, t) {
      for (
        var f = u.bin.readUshort,
          l = u.bin.readUint,
          g = 0,
          x = {},
          r = new Uint8Array(e),
          n = r.length - 4;
        l(r, n) != 101010256;
      )
        n--;
      ((g = n), (g += 4));
      var a = f(r, (g += 4));
      f(r, (g += 2));
      var i = l(r, (g += 2)),
        p = l(r, (g += 4));
      ((g += 4), (g = p));
      for (var U = 0; U < a; U++) {
        (l(r, g),
          (g += 4),
          (g += 4),
          (g += 4),
          l(r, (g += 4)),
          (i = l(r, (g += 4))));
        var E = l(r, (g += 4)),
          b = f(r, (g += 4)),
          L = f(r, g + 2),
          M = f(r, g + 4);
        g += 6;
        var S = l(r, (g += 8));
        ((g += 4), (g += b + L + M), u._readLocal(r, S, x, i, E, t));
      }
      return x;
    }),
    (u._readLocal = function (e, t, f, l, g, x) {
      var r = u.bin.readUshort,
        n = u.bin.readUint;
      (n(e, t), r(e, (t += 4)), r(e, (t += 2)));
      var a = r(e, (t += 2));
      (n(e, (t += 2)), n(e, (t += 4)), (t += 4));
      var i = r(e, (t += 8)),
        p = r(e, (t += 2));
      t += 2;
      var U = u.bin.readUTF8(e, t, i);
      if (((t += i), (t += p), x)) f[U] = { size: g, csize: l };
      else {
        var E = new Uint8Array(e.buffer, t);
        if (a == 0) f[U] = new Uint8Array(E.buffer.slice(t, t + l));
        else {
          if (a != 8) throw "unknown compression method: " + a;
          var b = new Uint8Array(g);
          (u.inflateRaw(E, b), (f[U] = b));
        }
      }
    }),
    (u.inflateRaw = function (e, t) {
      return u.F.inflate(e, t);
    }),
    (u.inflate = function (e, t) {
      return (
        e[0],
        e[1],
        u.inflateRaw(
          new Uint8Array(e.buffer, e.byteOffset + 2, e.length - 6),
          t,
        )
      );
    }),
    (u.deflate = function (e, t) {
      t == null && (t = { level: 6 });
      var f = 0,
        l = new Uint8Array(50 + Math.floor(1.1 * e.length));
      ((l[f] = 120),
        (l[f + 1] = 156),
        (f += 2),
        (f = u.F.deflateRaw(e, l, f, t.level)));
      var g = u.adler(e, 0, e.length);
      return (
        (l[f + 0] = (g >>> 24) & 255),
        (l[f + 1] = (g >>> 16) & 255),
        (l[f + 2] = (g >>> 8) & 255),
        (l[f + 3] = (g >>> 0) & 255),
        new Uint8Array(l.buffer, 0, f + 4)
      );
    }),
    (u.deflateRaw = function (e, t) {
      t == null && (t = { level: 6 });
      var f = new Uint8Array(50 + Math.floor(1.1 * e.length)),
        l = u.F.deflateRaw(e, f, l, t.level);
      return new Uint8Array(f.buffer, 0, l);
    }),
    (u.encode = function (e, t) {
      t == null && (t = !1);
      var f = 0,
        l = u.bin.writeUint,
        g = u.bin.writeUshort,
        x = {};
      for (var r in e) {
        var n = !u._noNeed(r) && !t,
          a = e[r],
          i = u.crc.crc(a, 0, a.length);
        x[r] = {
          cpr: n,
          usize: a.length,
          crc: i,
          file: n ? u.deflateRaw(a) : a,
        };
      }
      for (var r in x) f += x[r].file.length + 30 + 46 + 2 * u.bin.sizeUTF8(r);
      f += 22;
      var p = new Uint8Array(f),
        U = 0,
        E = [];
      for (var r in x) {
        var b = x[r];
        (E.push(U), (U = u._writeHeader(p, U, r, b, 0)));
      }
      var L = 0,
        M = U;
      for (var r in x)
        ((b = x[r]), E.push(U), (U = u._writeHeader(p, U, r, b, 1, E[L++])));
      var S = U - M;
      return (
        l(p, U, 101010256),
        (U += 4),
        g(p, (U += 4), L),
        g(p, (U += 2), L),
        l(p, (U += 2), S),
        l(p, (U += 4), M),
        (U += 4),
        (U += 2),
        p.buffer
      );
    }),
    (u._noNeed = function (e) {
      var t = e.split(".").pop().toLowerCase();
      return "png,jpg,jpeg,zip".indexOf(t) != -1;
    }),
    (u._writeHeader = function (e, t, f, l, g, x) {
      var r = u.bin.writeUint,
        n = u.bin.writeUshort,
        a = l.file;
      return (
        r(e, t, g == 0 ? 67324752 : 33639248),
        (t += 4),
        g == 1 && (t += 2),
        n(e, t, 20),
        n(e, (t += 2), 0),
        n(e, (t += 2), l.cpr ? 8 : 0),
        r(e, (t += 2), 0),
        r(e, (t += 4), l.crc),
        r(e, (t += 4), a.length),
        r(e, (t += 4), l.usize),
        n(e, (t += 4), u.bin.sizeUTF8(f)),
        n(e, (t += 2), 0),
        (t += 2),
        g == 1 && ((t += 2), (t += 2), r(e, (t += 6), x), (t += 4)),
        (t += u.bin.writeUTF8(e, t, f)),
        g == 0 && (e.set(a, t), (t += a.length)),
        t
      );
    }),
    (u.crc = {
      table: (function () {
        for (var e = new Uint32Array(256), t = 0; t < 256; t++) {
          for (var f = t, l = 0; l < 8; l++)
            1 & f ? (f = 3988292384 ^ (f >>> 1)) : (f >>>= 1);
          e[t] = f;
        }
        return e;
      })(),
      update: function (e, t, f, l) {
        for (var g = 0; g < l; g++)
          e = u.crc.table[255 & (e ^ t[f + g])] ^ (e >>> 8);
        return e;
      },
      crc: function (e, t, f) {
        return 4294967295 ^ u.crc.update(4294967295, e, t, f);
      },
    }),
    (u.adler = function (e, t, f) {
      for (var l = 1, g = 0, x = t, r = t + f; x < r; ) {
        for (var n = Math.min(x + 5552, r); x < n; ) g += l += e[x++];
        ((l %= 65521), (g %= 65521));
      }
      return (g << 16) | l;
    }),
    (u.bin = {
      readUshort: function (e, t) {
        return e[t] | (e[t + 1] << 8);
      },
      writeUshort: function (e, t, f) {
        ((e[t] = 255 & f), (e[t + 1] = (f >> 8) & 255));
      },
      readUint: function (e, t) {
        return (
          16777216 * e[t + 3] + ((e[t + 2] << 16) | (e[t + 1] << 8) | e[t])
        );
      },
      writeUint: function (e, t, f) {
        ((e[t] = 255 & f),
          (e[t + 1] = (f >> 8) & 255),
          (e[t + 2] = (f >> 16) & 255),
          (e[t + 3] = (f >> 24) & 255));
      },
      readASCII: function (e, t, f) {
        for (var l = "", g = 0; g < f; g++) l += String.fromCharCode(e[t + g]);
        return l;
      },
      writeASCII: function (e, t, f) {
        for (var l = 0; l < f.length; l++) e[t + l] = f.charCodeAt(l);
      },
      pad: function (e) {
        return e.length < 2 ? "0" + e : e;
      },
      readUTF8: function (e, t, f) {
        for (var l, g = "", x = 0; x < f; x++)
          g += "%" + u.bin.pad(e[t + x].toString(16));
        try {
          l = decodeURIComponent(g);
        } catch {
          return u.bin.readASCII(e, t, f);
        }
        return l;
      },
      writeUTF8: function (e, t, f) {
        for (var l = f.length, g = 0, x = 0; x < l; x++) {
          var r = f.charCodeAt(x);
          if (!(4294967168 & r)) ((e[t + g] = r), g++);
          else if (!(4294965248 & r))
            ((e[t + g] = 192 | (r >> 6)),
              (e[t + g + 1] = 128 | ((r >> 0) & 63)),
              (g += 2));
          else if (!(4294901760 & r))
            ((e[t + g] = 224 | (r >> 12)),
              (e[t + g + 1] = 128 | ((r >> 6) & 63)),
              (e[t + g + 2] = 128 | ((r >> 0) & 63)),
              (g += 3));
          else {
            if (4292870144 & r) throw "e";
            ((e[t + g] = 240 | (r >> 18)),
              (e[t + g + 1] = 128 | ((r >> 12) & 63)),
              (e[t + g + 2] = 128 | ((r >> 6) & 63)),
              (e[t + g + 3] = 128 | ((r >> 0) & 63)),
              (g += 4));
          }
        }
        return g;
      },
      sizeUTF8: function (e) {
        for (var t = e.length, f = 0, l = 0; l < t; l++) {
          var g = e.charCodeAt(l);
          if (!(4294967168 & g)) f++;
          else if (!(4294965248 & g)) f += 2;
          else if (!(4294901760 & g)) f += 3;
          else {
            if (4292870144 & g) throw "e";
            f += 4;
          }
        }
        return f;
      },
    }),
    (u.F = {}),
    (u.F.deflateRaw = function (e, t, f, l) {
      var g = [
          [0, 0, 0, 0, 0],
          [4, 4, 8, 4, 0],
          [4, 5, 16, 8, 0],
          [4, 6, 16, 16, 0],
          [4, 10, 16, 32, 0],
          [8, 16, 32, 32, 0],
          [8, 16, 128, 128, 0],
          [8, 32, 128, 256, 0],
          [32, 128, 258, 1024, 1],
          [32, 258, 258, 4096, 1],
        ][l],
        x = u.F.U,
        r = u.F._goodIndex;
      u.F._hash;
      var n = u.F._putsE,
        a = 0,
        i = f << 3,
        p = 0,
        U = e.length;
      if (l == 0) {
        for (; a < U; )
          (n(t, i, a + (k = Math.min(65535, U - a)) == U ? 1 : 0),
            (i = u.F._copyExact(e, a, k, t, i + 8)),
            (a += k));
        return i >>> 3;
      }
      var E = x.lits,
        b = x.strt,
        L = x.prev,
        M = 0,
        S = 0,
        O = 0,
        m = 0,
        I = 0,
        o = 0;
      for (U > 2 && (b[(o = u.F._hash(e, 0))] = 0), a = 0; a < U; a++) {
        if (((I = o), a + 1 < U - 2)) {
          o = u.F._hash(e, a + 1);
          var c = (a + 1) & 32767;
          ((L[c] = b[o]), (b[o] = c));
        }
        if (p <= a) {
          (M > 14e3 || S > 26697) &&
            U - a > 100 &&
            (p < a && ((E[M] = a - p), (M += 2), (p = a)),
            (i = u.F._writeBlock(
              a == U - 1 || p == U ? 1 : 0,
              E,
              M,
              m,
              e,
              O,
              a - O,
              t,
              i,
            )),
            (M = S = m = 0),
            (O = a));
          var v = 0;
          a < U - 2 &&
            (v = u.F._bestMatch(e, a, L, I, Math.min(g[2], U - a), g[3]));
          var k = v >>> 16,
            w = 65535 & v;
          if (v != 0) {
            w = 65535 & v;
            var A = r((k = v >>> 16), x.of0);
            x.lhst[257 + A]++;
            var y = r(w, x.df0);
            (x.dhst[y]++,
              (m += x.exb[A] + x.dxb[y]),
              (E[M] = (k << 23) | (a - p)),
              (E[M + 1] = (w << 16) | (A << 8) | y),
              (M += 2),
              (p = a + k));
          } else x.lhst[e[a]]++;
          S++;
        }
      }
      for (
        (O == a && e.length != 0) ||
        (p < a && ((E[M] = a - p), (M += 2), (p = a)),
        (i = u.F._writeBlock(1, E, M, m, e, O, a - O, t, i)),
        (M = 0),
        (S = 0),
        (M = S = m = 0),
        (O = a));
        7 & i;
      )
        i++;
      return i >>> 3;
    }),
    (u.F._bestMatch = function (e, t, f, l, g, x) {
      var r = 32767 & t,
        n = f[r],
        a = (r - n + 32768) & 32767;
      if (n == r || l != u.F._hash(e, t - a)) return 0;
      for (
        var i = 0, p = 0, U = Math.min(32767, t);
        a <= U && --x != 0 && n != r;
      ) {
        if (i == 0 || e[t + i] == e[t + i - a]) {
          var E = u.F._howLong(e, t, a);
          if (E > i) {
            if (((p = a), (i = E) >= g)) break;
            a + 2 < E && (E = a + 2);
            for (var b = 0, L = 0; L < E - 2; L++) {
              var M = (t - a + L + 32768) & 32767,
                S = (M - f[M] + 32768) & 32767;
              S > b && ((b = S), (n = M));
            }
          }
        }
        a += ((r = n) - (n = f[r]) + 32768) & 32767;
      }
      return (i << 16) | p;
    }),
    (u.F._howLong = function (e, t, f) {
      if (
        e[t] != e[t - f] ||
        e[t + 1] != e[t + 1 - f] ||
        e[t + 2] != e[t + 2 - f]
      )
        return 0;
      var l = t,
        g = Math.min(e.length, t + 258);
      for (t += 3; t < g && e[t] == e[t - f]; ) t++;
      return t - l;
    }),
    (u.F._hash = function (e, t) {
      return (((e[t] << 8) | e[t + 1]) + (e[t + 2] << 4)) & 65535;
    }),
    (u.saved = 0),
    (u.F._writeBlock = function (e, t, f, l, g, x, r, n, a) {
      var i,
        p,
        U,
        E,
        b,
        L,
        M,
        S,
        O,
        m = u.F.U,
        I = u.F._putsF,
        o = u.F._putsE;
      (m.lhst[256]++,
        (p = (i = u.F.getTrees())[0]),
        (U = i[1]),
        (E = i[2]),
        (b = i[3]),
        (L = i[4]),
        (M = i[5]),
        (S = i[6]),
        (O = i[7]));
      var c = 32 + ((a + 3) & 7 ? 8 - ((a + 3) & 7) : 0) + (r << 3),
        v = l + u.F.contSize(m.fltree, m.lhst) + u.F.contSize(m.fdtree, m.dhst),
        k = l + u.F.contSize(m.ltree, m.lhst) + u.F.contSize(m.dtree, m.dhst);
      k +=
        14 +
        3 * M +
        u.F.contSize(m.itree, m.ihst) +
        (2 * m.ihst[16] + 3 * m.ihst[17] + 7 * m.ihst[18]);
      for (var w = 0; w < 286; w++) m.lhst[w] = 0;
      for (w = 0; w < 30; w++) m.dhst[w] = 0;
      for (w = 0; w < 19; w++) m.ihst[w] = 0;
      var A = c < v && c < k ? 0 : v < k ? 1 : 2;
      if ((I(n, a, e), I(n, a + 1, A), (a += 3), A == 0)) {
        for (; 7 & a; ) a++;
        a = u.F._copyExact(g, x, r, n, a);
      } else {
        var y, C;
        if ((A == 1 && ((y = m.fltree), (C = m.fdtree)), A == 2)) {
          (u.F.makeCodes(m.ltree, p),
            u.F.revCodes(m.ltree, p),
            u.F.makeCodes(m.dtree, U),
            u.F.revCodes(m.dtree, U),
            u.F.makeCodes(m.itree, E),
            u.F.revCodes(m.itree, E),
            (y = m.ltree),
            (C = m.dtree),
            o(n, a, b - 257),
            o(n, (a += 5), L - 1),
            o(n, (a += 5), M - 4),
            (a += 4));
          for (var d = 0; d < M; d++)
            o(n, a + 3 * d, m.itree[1 + (m.ordr[d] << 1)]);
          ((a += 3 * M),
            (a = u.F._codeTiny(S, m.itree, n, a)),
            (a = u.F._codeTiny(O, m.itree, n, a)));
        }
        for (var s = x, T = 0; T < f; T += 2) {
          for (var N = t[T], z = N >>> 23, W = s + (8388607 & N); s < W; )
            a = u.F._writeLit(g[s++], y, n, a);
          if (z != 0) {
            var H = t[T + 1],
              $ = H >> 16,
              P = (H >> 8) & 255,
              F = 255 & H;
            (o(n, (a = u.F._writeLit(257 + P, y, n, a)), z - m.of0[P]),
              (a += m.exb[P]),
              I(n, (a = u.F._writeLit(F, C, n, a)), $ - m.df0[F]),
              (a += m.dxb[F]),
              (s += z));
          }
        }
        a = u.F._writeLit(256, y, n, a);
      }
      return a;
    }),
    (u.F._copyExact = function (e, t, f, l, g) {
      var x = g >>> 3;
      return (
        (l[x] = f),
        (l[x + 1] = f >>> 8),
        (l[x + 2] = 255 - l[x]),
        (l[x + 3] = 255 - l[x + 1]),
        (x += 4),
        l.set(new Uint8Array(e.buffer, t, f), x),
        g + ((f + 4) << 3)
      );
    }),
    (u.F.getTrees = function () {
      for (
        var e = u.F.U,
          t = u.F._hufTree(e.lhst, e.ltree, 15),
          f = u.F._hufTree(e.dhst, e.dtree, 15),
          l = [],
          g = u.F._lenCodes(e.ltree, l),
          x = [],
          r = u.F._lenCodes(e.dtree, x),
          n = 0;
        n < l.length;
        n += 2
      )
        e.ihst[l[n]]++;
      for (n = 0; n < x.length; n += 2) e.ihst[x[n]]++;
      for (
        var a = u.F._hufTree(e.ihst, e.itree, 7), i = 19;
        i > 4 && e.itree[1 + (e.ordr[i - 1] << 1)] == 0;
      )
        i--;
      return [t, f, a, g, r, i, l, x];
    }),
    (u.F.getSecond = function (e) {
      for (var t = [], f = 0; f < e.length; f += 2) t.push(e[f + 1]);
      return t;
    }),
    (u.F.nonZero = function (e) {
      for (var t = "", f = 0; f < e.length; f += 2)
        e[f + 1] != 0 && (t += (f >> 1) + ",");
      return t;
    }),
    (u.F.contSize = function (e, t) {
      for (var f = 0, l = 0; l < t.length; l++) f += t[l] * e[1 + (l << 1)];
      return f;
    }),
    (u.F._codeTiny = function (e, t, f, l) {
      for (var g = 0; g < e.length; g += 2) {
        var x = e[g],
          r = e[g + 1];
        l = u.F._writeLit(x, t, f, l);
        var n = x == 16 ? 2 : x == 17 ? 3 : 7;
        x > 15 && (u.F._putsE(f, l, r, n), (l += n));
      }
      return l;
    }),
    (u.F._lenCodes = function (e, t) {
      for (var f = e.length; f != 2 && e[f - 1] == 0; ) f -= 2;
      for (var l = 0; l < f; l += 2) {
        var g = e[l + 1],
          x = l + 3 < f ? e[l + 3] : -1,
          r = l + 5 < f ? e[l + 5] : -1,
          n = l == 0 ? -1 : e[l - 1];
        if (g == 0 && x == g && r == g) {
          for (var a = l + 5; a + 2 < f && e[a + 2] == g; ) a += 2;
          ((i = Math.min((a + 1 - l) >>> 1, 138)) < 11
            ? t.push(17, i - 3)
            : t.push(18, i - 11),
            (l += 2 * i - 2));
        } else if (g == n && x == g && r == g) {
          for (a = l + 5; a + 2 < f && e[a + 2] == g; ) a += 2;
          var i = Math.min((a + 1 - l) >>> 1, 6);
          (t.push(16, i - 3), (l += 2 * i - 2));
        } else t.push(g, 0);
      }
      return f >>> 1;
    }),
    (u.F._hufTree = function (e, t, f) {
      var l = [],
        g = e.length,
        x = t.length,
        r = 0;
      for (r = 0; r < x; r += 2) ((t[r] = 0), (t[r + 1] = 0));
      for (r = 0; r < g; r++) e[r] != 0 && l.push({ lit: r, f: e[r] });
      var n = l.length,
        a = l.slice(0);
      if (n == 0) return 0;
      if (n == 1) {
        var i = l[0].lit;
        return (
          (a = i == 0 ? 1 : 0),
          (t[1 + (i << 1)] = 1),
          (t[1 + (a << 1)] = 1),
          1
        );
      }
      l.sort(function (S, O) {
        return S.f - O.f;
      });
      var p = l[0],
        U = l[1],
        E = 0,
        b = 1,
        L = 2;
      for (l[0] = { lit: -1, f: p.f + U.f, l: p, r: U, d: 0 }; b != n - 1; )
        ((p = E != b && (L == n || l[E].f < l[L].f) ? l[E++] : l[L++]),
          (U = E != b && (L == n || l[E].f < l[L].f) ? l[E++] : l[L++]),
          (l[b++] = { lit: -1, f: p.f + U.f, l: p, r: U }));
      var M = u.F.setDepth(l[b - 1], 0);
      for (M > f && (u.F.restrictDepth(a, f, M), (M = f)), r = 0; r < n; r++)
        t[1 + (a[r].lit << 1)] = a[r].d;
      return M;
    }),
    (u.F.setDepth = function (e, t) {
      return e.lit != -1
        ? ((e.d = t), t)
        : Math.max(u.F.setDepth(e.l, t + 1), u.F.setDepth(e.r, t + 1));
    }),
    (u.F.restrictDepth = function (e, t, f) {
      var l = 0,
        g = 1 << (f - t),
        x = 0;
      for (
        e.sort(function (n, a) {
          return a.d == n.d ? n.f - a.f : a.d - n.d;
        }),
          l = 0;
        l < e.length && e[l].d > t;
        l++
      ) {
        var r = e[l].d;
        ((e[l].d = t), (x += g - (1 << (f - r))));
      }
      for (x >>>= f - t; x > 0; )
        (r = e[l].d) < t ? (e[l].d++, (x -= 1 << (t - r - 1))) : l++;
      for (; l >= 0; l--) e[l].d == t && x < 0 && (e[l].d--, x++);
      x != 0 && console.log("debt left");
    }),
    (u.F._goodIndex = function (e, t) {
      var f = 0;
      return (
        t[16 | f] <= e && (f |= 16),
        t[8 | f] <= e && (f |= 8),
        t[4 | f] <= e && (f |= 4),
        t[2 | f] <= e && (f |= 2),
        t[1 | f] <= e && (f |= 1),
        f
      );
    }),
    (u.F._writeLit = function (e, t, f, l) {
      return (u.F._putsF(f, l, t[e << 1]), l + t[1 + (e << 1)]);
    }),
    (u.F.inflate = function (e, t) {
      var f = Uint8Array;
      if (e[0] == 3 && e[1] == 0) return t || new f(0);
      var l = u.F,
        g = l._bitsF,
        x = l._bitsE,
        r = l._decodeTiny,
        n = l.makeCodes,
        a = l.codes2map,
        i = l._get17,
        p = l.U,
        U = t == null;
      U && (t = new f((e.length >>> 2) << 3));
      for (
        var E, b, L = 0, M = 0, S = 0, O = 0, m = 0, I = 0, o = 0, c = 0, v = 0;
        L == 0;
      )
        if (((L = g(e, v, 1)), (M = g(e, v + 1, 2)), (v += 3), M != 0)) {
          if (
            (U && (t = u.F._check(t, c + (1 << 17))),
            M == 1 && ((E = p.flmap), (b = p.fdmap), (I = 511), (o = 31)),
            M == 2)
          ) {
            ((S = x(e, v, 5) + 257),
              (O = x(e, v + 5, 5) + 1),
              (m = x(e, v + 10, 4) + 4),
              (v += 14));
            for (var k = 0; k < 38; k += 2)
              ((p.itree[k] = 0), (p.itree[k + 1] = 0));
            var w = 1;
            for (k = 0; k < m; k++) {
              var A = x(e, v + 3 * k, 3);
              ((p.itree[1 + (p.ordr[k] << 1)] = A), A > w && (w = A));
            }
            ((v += 3 * m),
              n(p.itree, w),
              a(p.itree, w, p.imap),
              (E = p.lmap),
              (b = p.dmap),
              (v = r(p.imap, (1 << w) - 1, S + O, e, v, p.ttree)));
            var y = l._copyOut(p.ttree, 0, S, p.ltree);
            I = (1 << y) - 1;
            var C = l._copyOut(p.ttree, S, O, p.dtree);
            ((o = (1 << C) - 1),
              n(p.ltree, y),
              a(p.ltree, y, E),
              n(p.dtree, C),
              a(p.dtree, C, b));
          }
          for (;;) {
            var d = E[i(e, v) & I];
            v += 15 & d;
            var s = d >>> 4;
            if (!(s >>> 8)) t[c++] = s;
            else {
              if (s == 256) break;
              var T = c + s - 254;
              if (s > 264) {
                var N = p.ldef[s - 257];
                ((T = c + (N >>> 3) + x(e, v, 7 & N)), (v += 7 & N));
              }
              var z = b[i(e, v) & o];
              v += 15 & z;
              var W = z >>> 4,
                H = p.ddef[W],
                $ = (H >>> 4) + g(e, v, 15 & H);
              for (
                v += 15 & H, U && (t = u.F._check(t, c + (1 << 17)));
                c < T;
              )
                ((t[c] = t[c++ - $]),
                  (t[c] = t[c++ - $]),
                  (t[c] = t[c++ - $]),
                  (t[c] = t[c++ - $]));
              c = T;
            }
          }
        } else {
          7 & v && (v += 8 - (7 & v));
          var P = 4 + (v >>> 3),
            F = e[P - 4] | (e[P - 3] << 8);
          (U && (t = u.F._check(t, c + F)),
            t.set(new f(e.buffer, e.byteOffset + P, F), c),
            (v = (P + F) << 3),
            (c += F));
        }
      return t.length == c ? t : t.slice(0, c);
    }),
    (u.F._check = function (e, t) {
      var f = e.length;
      if (t <= f) return e;
      var l = new Uint8Array(Math.max(f << 1, t));
      return (l.set(e, 0), l);
    }),
    (u.F._decodeTiny = function (e, t, f, l, g, x) {
      for (var r = u.F._bitsE, n = u.F._get17, a = 0; a < f; ) {
        var i = e[n(l, g) & t];
        g += 15 & i;
        var p = i >>> 4;
        if (p <= 15) ((x[a] = p), a++);
        else {
          var U = 0,
            E = 0;
          p == 16
            ? ((E = 3 + r(l, g, 2)), (g += 2), (U = x[a - 1]))
            : p == 17
              ? ((E = 3 + r(l, g, 3)), (g += 3))
              : p == 18 && ((E = 11 + r(l, g, 7)), (g += 7));
          for (var b = a + E; a < b; ) ((x[a] = U), a++);
        }
      }
      return g;
    }),
    (u.F._copyOut = function (e, t, f, l) {
      for (var g = 0, x = 0, r = l.length >>> 1; x < f; ) {
        var n = e[x + t];
        ((l[x << 1] = 0), (l[1 + (x << 1)] = n), n > g && (g = n), x++);
      }
      for (; x < r; ) ((l[x << 1] = 0), (l[1 + (x << 1)] = 0), x++);
      return g;
    }),
    (u.F.makeCodes = function (e, t) {
      for (
        var f, l, g, x, r = u.F.U, n = e.length, a = r.bl_count, i = 0;
        i <= t;
        i++
      )
        a[i] = 0;
      for (i = 1; i < n; i += 2) a[e[i]]++;
      var p = r.next_code;
      for (f = 0, a[0] = 0, l = 1; l <= t; l++)
        ((f = (f + a[l - 1]) << 1), (p[l] = f));
      for (g = 0; g < n; g += 2) (x = e[g + 1]) != 0 && ((e[g] = p[x]), p[x]++);
    }),
    (u.F.codes2map = function (e, t, f) {
      for (var l = e.length, g = u.F.U.rev15, x = 0; x < l; x += 2)
        if (e[x + 1] != 0)
          for (
            var r = x >> 1,
              n = e[x + 1],
              a = (r << 4) | n,
              i = t - n,
              p = e[x] << i,
              U = p + (1 << i);
            p != U;
          )
            ((f[g[p] >>> (15 - t)] = a), p++);
    }),
    (u.F.revCodes = function (e, t) {
      for (var f = u.F.U.rev15, l = 15 - t, g = 0; g < e.length; g += 2) {
        var x = e[g] << (t - e[g + 1]);
        e[g] = f[x] >>> l;
      }
    }),
    (u.F._putsE = function (e, t, f) {
      f <<= 7 & t;
      var l = t >>> 3;
      ((e[l] |= f), (e[l + 1] |= f >>> 8));
    }),
    (u.F._putsF = function (e, t, f) {
      f <<= 7 & t;
      var l = t >>> 3;
      ((e[l] |= f), (e[l + 1] |= f >>> 8), (e[l + 2] |= f >>> 16));
    }),
    (u.F._bitsE = function (e, t, f) {
      return (
        ((e[t >>> 3] | (e[1 + (t >>> 3)] << 8)) >>> (7 & t)) & ((1 << f) - 1)
      );
    }),
    (u.F._bitsF = function (e, t, f) {
      return (
        ((e[t >>> 3] | (e[1 + (t >>> 3)] << 8) | (e[2 + (t >>> 3)] << 16)) >>>
          (7 & t)) &
        ((1 << f) - 1)
      );
    }),
    (u.F._get17 = function (e, t) {
      return (
        (e[t >>> 3] | (e[1 + (t >>> 3)] << 8) | (e[2 + (t >>> 3)] << 16)) >>>
        (7 & t)
      );
    }),
    (u.F._get25 = function (e, t) {
      return (
        (e[t >>> 3] |
          (e[1 + (t >>> 3)] << 8) |
          (e[2 + (t >>> 3)] << 16) |
          (e[3 + (t >>> 3)] << 24)) >>>
        (7 & t)
      );
    }),
    (u.F.U =
      ((_ = Uint16Array),
      (D = Uint32Array),
      {
        next_code: new _(16),
        bl_count: new _(16),
        ordr: [
          16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
        ],
        of0: [
          3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51,
          59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 999, 999, 999,
        ],
        exb: [
          0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4,
          4, 5, 5, 5, 5, 0, 0, 0, 0,
        ],
        ldef: new _(32),
        df0: [
          1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385,
          513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385,
          24577, 65535, 65535,
        ],
        dxb: [
          0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10,
          10, 11, 11, 12, 12, 13, 13, 0, 0,
        ],
        ddef: new D(32),
        flmap: new _(512),
        fltree: [],
        fdmap: new _(32),
        fdtree: [],
        lmap: new _(32768),
        ltree: [],
        ttree: [],
        dmap: new _(32768),
        dtree: [],
        imap: new _(512),
        itree: [],
        rev15: new _(32768),
        lhst: new D(286),
        dhst: new D(30),
        ihst: new D(19),
        lits: new D(15e3),
        strt: new _(65536),
        prev: new _(32768),
      })),
    (function () {
      for (var e = u.F.U, t = 0; t < 32768; t++) {
        var f = t;
        ((f =
          ((4278255360 &
            (f =
              ((4042322160 &
                (f =
                  ((3435973836 &
                    (f =
                      ((2863311530 & f) >>> 1) | ((1431655765 & f) << 1))) >>>
                    2) |
                  ((858993459 & f) << 2))) >>>
                4) |
              ((252645135 & f) << 4))) >>>
            8) |
          ((16711935 & f) << 8)),
          (e.rev15[t] = ((f >>> 16) | (f << 16)) >>> 17));
      }
      function l(g, x, r) {
        for (; x-- != 0; ) g.push(0, r);
      }
      for (t = 0; t < 32; t++)
        ((e.ldef[t] = (e.of0[t] << 3) | e.exb[t]),
          (e.ddef[t] = (e.df0[t] << 4) | e.dxb[t]));
      (l(e.fltree, 144, 8),
        l(e.fltree, 112, 9),
        l(e.fltree, 24, 7),
        l(e.fltree, 8, 8),
        u.F.makeCodes(e.fltree, 9),
        u.F.codes2map(e.fltree, 9, e.flmap),
        u.F.revCodes(e.fltree, 9),
        l(e.fdtree, 32, 5),
        u.F.makeCodes(e.fdtree, 5),
        u.F.codes2map(e.fdtree, 5, e.fdmap),
        u.F.revCodes(e.fdtree, 5),
        l(e.itree, 19, 0),
        l(e.ltree, 286, 0),
        l(e.dtree, 30, 0),
        l(e.ttree, 320, 0));
    })());
})();
var er = Zt({ __proto__: null, default: ze }, [ze]);
const me = (function () {
  var R = {
    nextZero(r, n) {
      for (; r[n] != 0; ) n++;
      return n;
    },
    readUshort: (r, n) => (r[n] << 8) | r[n + 1],
    writeUshort(r, n, a) {
      ((r[n] = (a >> 8) & 255), (r[n + 1] = 255 & a));
    },
    readUint: (r, n) =>
      16777216 * r[n] + ((r[n + 1] << 16) | (r[n + 2] << 8) | r[n + 3]),
    writeUint(r, n, a) {
      ((r[n] = (a >> 24) & 255),
        (r[n + 1] = (a >> 16) & 255),
        (r[n + 2] = (a >> 8) & 255),
        (r[n + 3] = 255 & a));
    },
    readASCII(r, n, a) {
      let i = "";
      for (let p = 0; p < a; p++) i += String.fromCharCode(r[n + p]);
      return i;
    },
    writeASCII(r, n, a) {
      for (let i = 0; i < a.length; i++) r[n + i] = a.charCodeAt(i);
    },
    readBytes(r, n, a) {
      const i = [];
      for (let p = 0; p < a; p++) i.push(r[n + p]);
      return i;
    },
    pad: (r) => (r.length < 2 ? `0${r}` : r),
    readUTF8(r, n, a) {
      let i,
        p = "";
      for (let U = 0; U < a; U++) p += `%${R.pad(r[n + U].toString(16))}`;
      try {
        i = decodeURIComponent(p);
      } catch {
        return R.readASCII(r, n, a);
      }
      return i;
    },
  };
  function _(r, n, a, i) {
    const p = n * a,
      U = t(i),
      E = Math.ceil((n * U) / 8),
      b = new Uint8Array(4 * p),
      L = new Uint32Array(b.buffer),
      { ctype: M } = i,
      { depth: S } = i,
      O = R.readUshort;
    if (M == 6) {
      const N = p << 2;
      if (S == 8)
        for (var m = 0; m < N; m += 4)
          ((b[m] = r[m]),
            (b[m + 1] = r[m + 1]),
            (b[m + 2] = r[m + 2]),
            (b[m + 3] = r[m + 3]));
      if (S == 16) for (m = 0; m < N; m++) b[m] = r[m << 1];
    } else if (M == 2) {
      const N = i.tabs.tRNS;
      if (N == null) {
        if (S == 8)
          for (m = 0; m < p; m++) {
            var I = 3 * m;
            L[m] = (255 << 24) | (r[I + 2] << 16) | (r[I + 1] << 8) | r[I];
          }
        if (S == 16)
          for (m = 0; m < p; m++)
            ((I = 6 * m),
              (L[m] = (255 << 24) | (r[I + 4] << 16) | (r[I + 2] << 8) | r[I]));
      } else {
        var o = N[0];
        const z = N[1],
          W = N[2];
        if (S == 8)
          for (m = 0; m < p; m++) {
            var c = m << 2;
            ((I = 3 * m),
              (L[m] = (255 << 24) | (r[I + 2] << 16) | (r[I + 1] << 8) | r[I]),
              r[I] == o && r[I + 1] == z && r[I + 2] == W && (b[c + 3] = 0));
          }
        if (S == 16)
          for (m = 0; m < p; m++)
            ((c = m << 2),
              (I = 6 * m),
              (L[m] = (255 << 24) | (r[I + 4] << 16) | (r[I + 2] << 8) | r[I]),
              O(r, I) == o &&
                O(r, I + 2) == z &&
                O(r, I + 4) == W &&
                (b[c + 3] = 0));
      }
    } else if (M == 3) {
      const N = i.tabs.PLTE,
        z = i.tabs.tRNS,
        W = z ? z.length : 0;
      if (S == 1)
        for (var v = 0; v < a; v++) {
          var k = v * E,
            w = v * n;
          for (m = 0; m < n; m++) {
            c = (w + m) << 2;
            var A = 3 * (y = (r[k + (m >> 3)] >> (7 - ((7 & m) << 0))) & 1);
            ((b[c] = N[A]),
              (b[c + 1] = N[A + 1]),
              (b[c + 2] = N[A + 2]),
              (b[c + 3] = y < W ? z[y] : 255));
          }
        }
      if (S == 2)
        for (v = 0; v < a; v++)
          for (k = v * E, w = v * n, m = 0; m < n; m++)
            ((c = (w + m) << 2),
              (A = 3 * (y = (r[k + (m >> 2)] >> (6 - ((3 & m) << 1))) & 3)),
              (b[c] = N[A]),
              (b[c + 1] = N[A + 1]),
              (b[c + 2] = N[A + 2]),
              (b[c + 3] = y < W ? z[y] : 255));
      if (S == 4)
        for (v = 0; v < a; v++)
          for (k = v * E, w = v * n, m = 0; m < n; m++)
            ((c = (w + m) << 2),
              (A = 3 * (y = (r[k + (m >> 1)] >> (4 - ((1 & m) << 2))) & 15)),
              (b[c] = N[A]),
              (b[c + 1] = N[A + 1]),
              (b[c + 2] = N[A + 2]),
              (b[c + 3] = y < W ? z[y] : 255));
      if (S == 8)
        for (m = 0; m < p; m++) {
          var y;
          ((c = m << 2),
            (A = 3 * (y = r[m])),
            (b[c] = N[A]),
            (b[c + 1] = N[A + 1]),
            (b[c + 2] = N[A + 2]),
            (b[c + 3] = y < W ? z[y] : 255));
        }
    } else if (M == 4) {
      if (S == 8)
        for (m = 0; m < p; m++) {
          c = m << 2;
          var C = r[(d = m << 1)];
          ((b[c] = C), (b[c + 1] = C), (b[c + 2] = C), (b[c + 3] = r[d + 1]));
        }
      if (S == 16)
        for (m = 0; m < p; m++) {
          var d;
          ((c = m << 2),
            (C = r[(d = m << 2)]),
            (b[c] = C),
            (b[c + 1] = C),
            (b[c + 2] = C),
            (b[c + 3] = r[d + 2]));
        }
    } else if (M == 0)
      for (o = i.tabs.tRNS ? i.tabs.tRNS : -1, v = 0; v < a; v++) {
        const N = v * E,
          z = v * n;
        if (S == 1)
          for (var s = 0; s < n; s++) {
            var T =
              (C = 255 * ((r[N + (s >>> 3)] >>> (7 - (7 & s))) & 1)) == 255 * o
                ? 0
                : 255;
            L[z + s] = (T << 24) | (C << 16) | (C << 8) | C;
          }
        else if (S == 2)
          for (s = 0; s < n; s++)
            ((T =
              (C = 85 * ((r[N + (s >>> 2)] >>> (6 - ((3 & s) << 1))) & 3)) ==
              85 * o
                ? 0
                : 255),
              (L[z + s] = (T << 24) | (C << 16) | (C << 8) | C));
        else if (S == 4)
          for (s = 0; s < n; s++)
            ((T =
              (C = 17 * ((r[N + (s >>> 1)] >>> (4 - ((1 & s) << 2))) & 15)) ==
              17 * o
                ? 0
                : 255),
              (L[z + s] = (T << 24) | (C << 16) | (C << 8) | C));
        else if (S == 8)
          for (s = 0; s < n; s++)
            ((T = (C = r[N + s]) == o ? 0 : 255),
              (L[z + s] = (T << 24) | (C << 16) | (C << 8) | C));
        else if (S == 16)
          for (s = 0; s < n; s++)
            ((C = r[N + (s << 1)]),
              (T = O(r, N + (s << 1)) == o ? 0 : 255),
              (L[z + s] = (T << 24) | (C << 16) | (C << 8) | C));
      }
    return b;
  }
  function D(r, n, a, i) {
    const p = t(r),
      U = Math.ceil((a * p) / 8),
      E = new Uint8Array((U + 1 + r.interlace) * i);
    return (
      (n = r.tabs.CgBI ? e(n, E) : u(n, E)),
      r.interlace == 0
        ? (n = f(n, r, 0, a, i))
        : r.interlace == 1 &&
          (n = (function (L, M) {
            const S = M.width,
              O = M.height,
              m = t(M),
              I = m >> 3,
              o = Math.ceil((S * m) / 8),
              c = new Uint8Array(O * o);
            let v = 0;
            const k = [0, 0, 4, 0, 2, 0, 1],
              w = [0, 4, 0, 2, 0, 1, 0],
              A = [8, 8, 8, 4, 4, 2, 2],
              y = [8, 8, 4, 4, 2, 2, 1];
            let C = 0;
            for (; C < 7; ) {
              const s = A[C],
                T = y[C];
              let N = 0,
                z = 0,
                W = k[C];
              for (; W < O; ) ((W += s), z++);
              let H = w[C];
              for (; H < S; ) ((H += T), N++);
              const $ = Math.ceil((N * m) / 8);
              f(L, M, v, N, z);
              let P = 0,
                F = k[C];
              for (; F < O; ) {
                let V = w[C],
                  J = (v + P * $) << 3;
                for (; V < S; ) {
                  var d;
                  if (
                    (m == 1 &&
                      ((d = ((d = L[J >> 3]) >> (7 - (7 & J))) & 1),
                      (c[F * o + (V >> 3)] |= d << (7 - ((7 & V) << 0)))),
                    m == 2 &&
                      ((d = ((d = L[J >> 3]) >> (6 - (7 & J))) & 3),
                      (c[F * o + (V >> 2)] |= d << (6 - ((3 & V) << 1)))),
                    m == 4 &&
                      ((d = ((d = L[J >> 3]) >> (4 - (7 & J))) & 15),
                      (c[F * o + (V >> 1)] |= d << (4 - ((1 & V) << 2)))),
                    m >= 8)
                  ) {
                    const Z = F * o + V * I;
                    for (let Y = 0; Y < I; Y++) c[Z + Y] = L[(J >> 3) + Y];
                  }
                  ((J += m), (V += T));
                }
                (P++, (F += s));
              }
              (N * z != 0 && (v += z * (1 + $)), (C += 1));
            }
            return c;
          })(n, r)),
      n
    );
  }
  function u(r, n) {
    return e(new Uint8Array(r.buffer, 2, r.length - 6), n);
  }
  var e = (function () {
    const r = { H: {} };
    return (
      (r.H.N = function (n, a) {
        const i = Uint8Array;
        let p,
          U,
          E = 0,
          b = 0,
          L = 0,
          M = 0,
          S = 0,
          O = 0,
          m = 0,
          I = 0,
          o = 0;
        if (n[0] == 3 && n[1] == 0) return a || new i(0);
        const c = r.H,
          v = c.b,
          k = c.e,
          w = c.R,
          A = c.n,
          y = c.A,
          C = c.Z,
          d = c.m,
          s = a == null;
        for (s && (a = new i((n.length >>> 2) << 5)); E == 0; )
          if (((E = v(n, o, 1)), (b = v(n, o + 1, 2)), (o += 3), b != 0)) {
            if (
              (s && (a = r.H.W(a, I + (1 << 17))),
              b == 1 && ((p = d.J), (U = d.h), (O = 511), (m = 31)),
              b == 2)
            ) {
              ((L = k(n, o, 5) + 257),
                (M = k(n, o + 5, 5) + 1),
                (S = k(n, o + 10, 4) + 4),
                (o += 14));
              let N = 1;
              for (var T = 0; T < 38; T += 2) ((d.Q[T] = 0), (d.Q[T + 1] = 0));
              for (T = 0; T < S; T++) {
                const H = k(n, o + 3 * T, 3);
                ((d.Q[1 + (d.X[T] << 1)] = H), H > N && (N = H));
              }
              ((o += 3 * S),
                A(d.Q, N),
                y(d.Q, N, d.u),
                (p = d.w),
                (U = d.d),
                (o = w(d.u, (1 << N) - 1, L + M, n, o, d.v)));
              const z = c.V(d.v, 0, L, d.C);
              O = (1 << z) - 1;
              const W = c.V(d.v, L, M, d.D);
              ((m = (1 << W) - 1),
                A(d.C, z),
                y(d.C, z, p),
                A(d.D, W),
                y(d.D, W, U));
            }
            for (;;) {
              const N = p[C(n, o) & O];
              o += 15 & N;
              const z = N >>> 4;
              if (!(z >>> 8)) a[I++] = z;
              else {
                if (z == 256) break;
                {
                  let W = I + z - 254;
                  if (z > 264) {
                    const V = d.q[z - 257];
                    ((W = I + (V >>> 3) + k(n, o, 7 & V)), (o += 7 & V));
                  }
                  const H = U[C(n, o) & m];
                  o += 15 & H;
                  const $ = H >>> 4,
                    P = d.c[$],
                    F = (P >>> 4) + v(n, o, 15 & P);
                  for (o += 15 & P; I < W; )
                    ((a[I] = a[I++ - F]),
                      (a[I] = a[I++ - F]),
                      (a[I] = a[I++ - F]),
                      (a[I] = a[I++ - F]));
                  I = W;
                }
              }
            }
          } else {
            7 & o && (o += 8 - (7 & o));
            const N = 4 + (o >>> 3),
              z = n[N - 4] | (n[N - 3] << 8);
            (s && (a = r.H.W(a, I + z)),
              a.set(new i(n.buffer, n.byteOffset + N, z), I),
              (o = (N + z) << 3),
              (I += z));
          }
        return a.length == I ? a : a.slice(0, I);
      }),
      (r.H.W = function (n, a) {
        const i = n.length;
        if (a <= i) return n;
        const p = new Uint8Array(i << 1);
        return (p.set(n, 0), p);
      }),
      (r.H.R = function (n, a, i, p, U, E) {
        const b = r.H.e,
          L = r.H.Z;
        let M = 0;
        for (; M < i; ) {
          const S = n[L(p, U) & a];
          U += 15 & S;
          const O = S >>> 4;
          if (O <= 15) ((E[M] = O), M++);
          else {
            let m = 0,
              I = 0;
            O == 16
              ? ((I = 3 + b(p, U, 2)), (U += 2), (m = E[M - 1]))
              : O == 17
                ? ((I = 3 + b(p, U, 3)), (U += 3))
                : O == 18 && ((I = 11 + b(p, U, 7)), (U += 7));
            const o = M + I;
            for (; M < o; ) ((E[M] = m), M++);
          }
        }
        return U;
      }),
      (r.H.V = function (n, a, i, p) {
        let U = 0,
          E = 0;
        const b = p.length >>> 1;
        for (; E < i; ) {
          const L = n[E + a];
          ((p[E << 1] = 0), (p[1 + (E << 1)] = L), L > U && (U = L), E++);
        }
        for (; E < b; ) ((p[E << 1] = 0), (p[1 + (E << 1)] = 0), E++);
        return U;
      }),
      (r.H.n = function (n, a) {
        const i = r.H.m,
          p = n.length;
        let U, E, b, L;
        const M = i.j;
        for (var S = 0; S <= a; S++) M[S] = 0;
        for (S = 1; S < p; S += 2) M[n[S]]++;
        const O = i.K;
        for (U = 0, M[0] = 0, E = 1; E <= a; E++)
          ((U = (U + M[E - 1]) << 1), (O[E] = U));
        for (b = 0; b < p; b += 2)
          ((L = n[b + 1]), L != 0 && ((n[b] = O[L]), O[L]++));
      }),
      (r.H.A = function (n, a, i) {
        const p = n.length,
          U = r.H.m.r;
        for (let E = 0; E < p; E += 2)
          if (n[E + 1] != 0) {
            const b = E >> 1,
              L = n[E + 1],
              M = (b << 4) | L,
              S = a - L;
            let O = n[E] << S;
            const m = O + (1 << S);
            for (; O != m; ) ((i[U[O] >>> (15 - a)] = M), O++);
          }
      }),
      (r.H.l = function (n, a) {
        const i = r.H.m.r,
          p = 15 - a;
        for (let U = 0; U < n.length; U += 2) {
          const E = n[U] << (a - n[U + 1]);
          n[U] = i[E] >>> p;
        }
      }),
      (r.H.M = function (n, a, i) {
        i <<= 7 & a;
        const p = a >>> 3;
        ((n[p] |= i), (n[p + 1] |= i >>> 8));
      }),
      (r.H.I = function (n, a, i) {
        i <<= 7 & a;
        const p = a >>> 3;
        ((n[p] |= i), (n[p + 1] |= i >>> 8), (n[p + 2] |= i >>> 16));
      }),
      (r.H.e = function (n, a, i) {
        return (
          ((n[a >>> 3] | (n[1 + (a >>> 3)] << 8)) >>> (7 & a)) & ((1 << i) - 1)
        );
      }),
      (r.H.b = function (n, a, i) {
        return (
          ((n[a >>> 3] | (n[1 + (a >>> 3)] << 8) | (n[2 + (a >>> 3)] << 16)) >>>
            (7 & a)) &
          ((1 << i) - 1)
        );
      }),
      (r.H.Z = function (n, a) {
        return (
          (n[a >>> 3] | (n[1 + (a >>> 3)] << 8) | (n[2 + (a >>> 3)] << 16)) >>>
          (7 & a)
        );
      }),
      (r.H.i = function (n, a) {
        return (
          (n[a >>> 3] |
            (n[1 + (a >>> 3)] << 8) |
            (n[2 + (a >>> 3)] << 16) |
            (n[3 + (a >>> 3)] << 24)) >>>
          (7 & a)
        );
      }),
      (r.H.m = (function () {
        const n = Uint16Array,
          a = Uint32Array;
        return {
          K: new n(16),
          j: new n(16),
          X: [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
          S: [
            3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51,
            59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 999, 999, 999,
          ],
          T: [
            0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4,
            4, 5, 5, 5, 5, 0, 0, 0, 0,
          ],
          q: new n(32),
          p: [
            1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385,
            513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385,
            24577, 65535, 65535,
          ],
          z: [
            0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9,
            10, 10, 11, 11, 12, 12, 13, 13, 0, 0,
          ],
          c: new a(32),
          J: new n(512),
          _: [],
          h: new n(32),
          $: [],
          w: new n(32768),
          C: [],
          v: [],
          d: new n(32768),
          D: [],
          u: new n(512),
          Q: [],
          r: new n(32768),
          s: new a(286),
          Y: new a(30),
          a: new a(19),
          t: new a(15e3),
          k: new n(65536),
          g: new n(32768),
        };
      })()),
      (function () {
        const n = r.H.m;
        for (var a = 0; a < 32768; a++) {
          let p = a;
          ((p = ((2863311530 & p) >>> 1) | ((1431655765 & p) << 1)),
            (p = ((3435973836 & p) >>> 2) | ((858993459 & p) << 2)),
            (p = ((4042322160 & p) >>> 4) | ((252645135 & p) << 4)),
            (p = ((4278255360 & p) >>> 8) | ((16711935 & p) << 8)),
            (n.r[a] = ((p >>> 16) | (p << 16)) >>> 17));
        }
        function i(p, U, E) {
          for (; U-- != 0; ) p.push(0, E);
        }
        for (a = 0; a < 32; a++)
          ((n.q[a] = (n.S[a] << 3) | n.T[a]),
            (n.c[a] = (n.p[a] << 4) | n.z[a]));
        (i(n._, 144, 8),
          i(n._, 112, 9),
          i(n._, 24, 7),
          i(n._, 8, 8),
          r.H.n(n._, 9),
          r.H.A(n._, 9, n.J),
          r.H.l(n._, 9),
          i(n.$, 32, 5),
          r.H.n(n.$, 5),
          r.H.A(n.$, 5, n.h),
          r.H.l(n.$, 5),
          i(n.Q, 19, 0),
          i(n.C, 286, 0),
          i(n.D, 30, 0),
          i(n.v, 320, 0));
      })(),
      r.H.N
    );
  })();
  function t(r) {
    return [1, null, 3, 1, 2, null, 4][r.ctype] * r.depth;
  }
  function f(r, n, a, i, p) {
    let U = t(n);
    const E = Math.ceil((i * U) / 8);
    let b, L;
    U = Math.ceil(U / 8);
    let M = r[a],
      S = 0;
    if ((M > 1 && (r[a] = [0, 0, 1][M - 2]), M == 3))
      for (S = U; S < E; S++)
        r[S + 1] = (r[S + 1] + (r[S + 1 - U] >>> 1)) & 255;
    for (let O = 0; O < p; O++)
      if (((b = a + O * E), (L = b + O + 1), (M = r[L - 1]), (S = 0), M == 0))
        for (; S < E; S++) r[b + S] = r[L + S];
      else if (M == 1) {
        for (; S < U; S++) r[b + S] = r[L + S];
        for (; S < E; S++) r[b + S] = r[L + S] + r[b + S - U];
      } else if (M == 2) for (; S < E; S++) r[b + S] = r[L + S] + r[b + S - E];
      else if (M == 3) {
        for (; S < U; S++) r[b + S] = r[L + S] + (r[b + S - E] >>> 1);
        for (; S < E; S++)
          r[b + S] = r[L + S] + ((r[b + S - E] + r[b + S - U]) >>> 1);
      } else {
        for (; S < U; S++) r[b + S] = r[L + S] + l(0, r[b + S - E], 0);
        for (; S < E; S++)
          r[b + S] = r[L + S] + l(r[b + S - U], r[b + S - E], r[b + S - U - E]);
      }
    return r;
  }
  function l(r, n, a) {
    const i = r + n - a,
      p = i - r,
      U = i - n,
      E = i - a;
    return p * p <= U * U && p * p <= E * E ? r : U * U <= E * E ? n : a;
  }
  function g(r, n, a) {
    ((a.width = R.readUint(r, n)),
      (n += 4),
      (a.height = R.readUint(r, n)),
      (n += 4),
      (a.depth = r[n]),
      n++,
      (a.ctype = r[n]),
      n++,
      (a.compress = r[n]),
      n++,
      (a.filter = r[n]),
      n++,
      (a.interlace = r[n]),
      n++);
  }
  function x(r, n, a, i, p, U, E, b, L) {
    const M = Math.min(n, p),
      S = Math.min(a, U);
    let O = 0,
      m = 0;
    for (let C = 0; C < S; C++)
      for (let d = 0; d < M; d++)
        if (
          (E >= 0 && b >= 0
            ? ((O = (C * n + d) << 2), (m = ((b + C) * p + E + d) << 2))
            : ((O = ((-b + C) * n - E + d) << 2), (m = (C * p + d) << 2)),
          L == 0)
        )
          ((i[m] = r[O]),
            (i[m + 1] = r[O + 1]),
            (i[m + 2] = r[O + 2]),
            (i[m + 3] = r[O + 3]));
        else if (L == 1) {
          var I = r[O + 3] * 0.00392156862745098,
            o = r[O] * I,
            c = r[O + 1] * I,
            v = r[O + 2] * I,
            k = i[m + 3] * (1 / 255),
            w = i[m] * k,
            A = i[m + 1] * k,
            y = i[m + 2] * k;
          const s = 1 - I,
            T = I + k * s,
            N = T == 0 ? 0 : 1 / T;
          ((i[m + 3] = 255 * T),
            (i[m + 0] = (o + w * s) * N),
            (i[m + 1] = (c + A * s) * N),
            (i[m + 2] = (v + y * s) * N));
        } else if (L == 2)
          ((I = r[O + 3]),
            (o = r[O]),
            (c = r[O + 1]),
            (v = r[O + 2]),
            (k = i[m + 3]),
            (w = i[m]),
            (A = i[m + 1]),
            (y = i[m + 2]),
            I == k && o == w && c == A && v == y
              ? ((i[m] = 0), (i[m + 1] = 0), (i[m + 2] = 0), (i[m + 3] = 0))
              : ((i[m] = o), (i[m + 1] = c), (i[m + 2] = v), (i[m + 3] = I)));
        else if (L == 3) {
          if (
            ((I = r[O + 3]),
            (o = r[O]),
            (c = r[O + 1]),
            (v = r[O + 2]),
            (k = i[m + 3]),
            (w = i[m]),
            (A = i[m + 1]),
            (y = i[m + 2]),
            I == k && o == w && c == A && v == y)
          )
            continue;
          if (I < 220 && k > 20) return !1;
        }
    return !0;
  }
  return {
    decode: function (n) {
      const a = new Uint8Array(n);
      let i = 8;
      const p = R,
        U = p.readUshort,
        E = p.readUint,
        b = { tabs: {}, frames: [] },
        L = new Uint8Array(a.length);
      let M,
        S = 0,
        O = 0;
      const m = [137, 80, 78, 71, 13, 10, 26, 10];
      for (var I = 0; I < 8; I++)
        if (a[I] != m[I]) throw "The input is not a PNG file!";
      for (; i < a.length; ) {
        const C = p.readUint(a, i);
        i += 4;
        const d = p.readASCII(a, i, 4);
        if (((i += 4), d == "IHDR")) g(a, i, b);
        else if (d == "iCCP") {
          for (var o = i; a[o] != 0; ) o++;
          (p.readASCII(a, i, o - i), a[o + 1]);
          const s = a.slice(o + 2, i + C);
          let T = null;
          try {
            T = u(s);
          } catch {
            T = e(s);
          }
          b.tabs[d] = T;
        } else if (d == "CgBI") b.tabs[d] = a.slice(i, i + 4);
        else if (d == "IDAT") {
          for (I = 0; I < C; I++) L[S + I] = a[i + I];
          S += C;
        } else if (d == "acTL")
          ((b.tabs[d] = { num_frames: E(a, i), num_plays: E(a, i + 4) }),
            (M = new Uint8Array(a.length)));
        else if (d == "fcTL") {
          O != 0 &&
            (((y = b.frames[b.frames.length - 1]).data = D(
              b,
              M.slice(0, O),
              y.rect.width,
              y.rect.height,
            )),
            (O = 0));
          const s = {
            x: E(a, i + 12),
            y: E(a, i + 16),
            width: E(a, i + 4),
            height: E(a, i + 8),
          };
          let T = U(a, i + 22);
          T = U(a, i + 20) / (T == 0 ? 100 : T);
          const N = {
            rect: s,
            delay: Math.round(1e3 * T),
            dispose: a[i + 24],
            blend: a[i + 25],
          };
          b.frames.push(N);
        } else if (d == "fdAT") {
          for (I = 0; I < C - 4; I++) M[O + I] = a[i + I + 4];
          O += C - 4;
        } else if (d == "pHYs")
          b.tabs[d] = [p.readUint(a, i), p.readUint(a, i + 4), a[i + 8]];
        else if (d == "cHRM")
          for (b.tabs[d] = [], I = 0; I < 8; I++)
            b.tabs[d].push(p.readUint(a, i + 4 * I));
        else if (d == "tEXt" || d == "zTXt") {
          b.tabs[d] == null && (b.tabs[d] = {});
          var c = p.nextZero(a, i),
            v = p.readASCII(a, i, c - i),
            k = i + C - c - 1;
          if (d == "tEXt") A = p.readASCII(a, c + 1, k);
          else {
            var w = u(a.slice(c + 2, c + 2 + k));
            A = p.readUTF8(w, 0, w.length);
          }
          b.tabs[d][v] = A;
        } else if (d == "iTXt") {
          (b.tabs[d] == null && (b.tabs[d] = {}),
            (c = 0),
            (o = i),
            (c = p.nextZero(a, o)),
            (v = p.readASCII(a, o, c - o)));
          const s = a[(o = c + 1)];
          var A;
          (a[o + 1],
            (o += 2),
            (c = p.nextZero(a, o)),
            p.readASCII(a, o, c - o),
            (o = c + 1),
            (c = p.nextZero(a, o)),
            p.readUTF8(a, o, c - o),
            (k = C - ((o = c + 1) - i)),
            s == 0
              ? (A = p.readUTF8(a, o, k))
              : ((w = u(a.slice(o, o + k))), (A = p.readUTF8(w, 0, w.length))),
            (b.tabs[d][v] = A));
        } else if (d == "PLTE") b.tabs[d] = p.readBytes(a, i, C);
        else if (d == "hIST") {
          const s = b.tabs.PLTE.length / 3;
          for (b.tabs[d] = [], I = 0; I < s; I++)
            b.tabs[d].push(U(a, i + 2 * I));
        } else if (d == "tRNS")
          b.ctype == 3
            ? (b.tabs[d] = p.readBytes(a, i, C))
            : b.ctype == 0
              ? (b.tabs[d] = U(a, i))
              : b.ctype == 2 &&
                (b.tabs[d] = [U(a, i), U(a, i + 2), U(a, i + 4)]);
        else if (d == "gAMA") b.tabs[d] = p.readUint(a, i) / 1e5;
        else if (d == "sRGB") b.tabs[d] = a[i];
        else if (d == "bKGD")
          b.ctype == 0 || b.ctype == 4
            ? (b.tabs[d] = [U(a, i)])
            : b.ctype == 2 || b.ctype == 6
              ? (b.tabs[d] = [U(a, i), U(a, i + 2), U(a, i + 4)])
              : b.ctype == 3 && (b.tabs[d] = a[i]);
        else if (d == "IEND") break;
        ((i += C), p.readUint(a, i), (i += 4));
      }
      var y;
      return (
        O != 0 &&
          ((y = b.frames[b.frames.length - 1]).data = D(
            b,
            M.slice(0, O),
            y.rect.width,
            y.rect.height,
          )),
        (b.data = D(b, L, b.width, b.height)),
        delete b.compress,
        delete b.interlace,
        delete b.filter,
        b
      );
    },
    toRGBA8: function (n) {
      const a = n.width,
        i = n.height;
      if (n.tabs.acTL == null) return [_(n.data, a, i, n).buffer];
      const p = [];
      n.frames[0].data == null && (n.frames[0].data = n.data);
      const U = a * i * 4,
        E = new Uint8Array(U),
        b = new Uint8Array(U),
        L = new Uint8Array(U);
      for (let S = 0; S < n.frames.length; S++) {
        const O = n.frames[S],
          m = O.rect.x,
          I = O.rect.y,
          o = O.rect.width,
          c = O.rect.height,
          v = _(O.data, o, c, n);
        if (S != 0) for (var M = 0; M < U; M++) L[M] = E[M];
        if (
          (O.blend == 0
            ? x(v, o, c, E, a, i, m, I, 0)
            : O.blend == 1 && x(v, o, c, E, a, i, m, I, 1),
          p.push(E.buffer.slice(0)),
          O.dispose != 0)
        ) {
          if (O.dispose == 1) x(b, o, c, E, a, i, m, I, 0);
          else if (O.dispose == 2) for (M = 0; M < U; M++) E[M] = L[M];
        }
      }
      return p;
    },
    _paeth: l,
    _copyTile: x,
    _bin: R,
  };
})();
(function () {
  const { _copyTile: R } = me,
    { _bin: _ } = me,
    D = me._paeth;
  var u = {
    table: (function () {
      const o = new Uint32Array(256);
      for (let c = 0; c < 256; c++) {
        let v = c;
        for (let k = 0; k < 8; k++)
          1 & v ? (v = 3988292384 ^ (v >>> 1)) : (v >>>= 1);
        o[c] = v;
      }
      return o;
    })(),
    update(o, c, v, k) {
      for (let w = 0; w < k; w++) o = u.table[255 & (o ^ c[v + w])] ^ (o >>> 8);
      return o;
    },
    crc: (o, c, v) => 4294967295 ^ u.update(4294967295, o, c, v),
  };
  function e(o, c, v, k) {
    ((c[v] += (o[0] * k) >> 4),
      (c[v + 1] += (o[1] * k) >> 4),
      (c[v + 2] += (o[2] * k) >> 4),
      (c[v + 3] += (o[3] * k) >> 4));
  }
  function t(o) {
    return Math.max(0, Math.min(255, o));
  }
  function f(o, c) {
    const v = o[0] - c[0],
      k = o[1] - c[1],
      w = o[2] - c[2],
      A = o[3] - c[3];
    return v * v + k * k + w * w + A * A;
  }
  function l(o, c, v, k, w, A, y) {
    y == null && (y = 1);
    const C = k.length,
      d = [];
    for (var s = 0; s < C; s++) {
      const F = k[s];
      d.push([
        (F >>> 0) & 255,
        (F >>> 8) & 255,
        (F >>> 16) & 255,
        (F >>> 24) & 255,
      ]);
    }
    for (s = 0; s < C; s++) {
      let F = 4294967295;
      for (var T = 0, N = 0; N < C; N++) {
        var z = f(d[s], d[N]);
        N != s && z < F && ((F = z), (T = N));
      }
    }
    const W = new Uint32Array(w.buffer),
      H = new Int16Array(c * v * 4),
      $ = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (s = 0; s < $.length; s++) $[s] = 255 * (($[s] + 0.5) / 16 - 0.5);
    for (let F = 0; F < v; F++)
      for (let V = 0; V < c; V++) {
        var P;
        ((s = 4 * (F * c + V)),
          y != 2
            ? (P = [
                t(o[s] + H[s]),
                t(o[s + 1] + H[s + 1]),
                t(o[s + 2] + H[s + 2]),
                t(o[s + 3] + H[s + 3]),
              ])
            : ((z = $[4 * (3 & F) + (3 & V)]),
              (P = [
                t(o[s] + z),
                t(o[s + 1] + z),
                t(o[s + 2] + z),
                t(o[s + 3] + z),
              ])),
          (T = 0));
        let J = 16777215;
        for (N = 0; N < C; N++) {
          const X = f(P, d[N]);
          X < J && ((J = X), (T = N));
        }
        const Z = d[T],
          Y = [P[0] - Z[0], P[1] - Z[1], P[2] - Z[2], P[3] - Z[3]];
        (y == 1 &&
          (V != c - 1 && e(Y, H, s + 4, 7),
          F != v - 1 &&
            (V != 0 && e(Y, H, s + 4 * c - 4, 3),
            e(Y, H, s + 4 * c, 5),
            V != c - 1 && e(Y, H, s + 4 * c + 4, 1))),
          (A[s >> 2] = T),
          (W[s >> 2] = k[T]));
      }
  }
  function g(o, c, v, k, w) {
    w == null && (w = {});
    const { crc: A } = u,
      y = _.writeUint,
      C = _.writeUshort,
      d = _.writeASCII;
    let s = 8;
    const T = o.frames.length > 1;
    let N,
      z = !1,
      W = 33 + (T ? 20 : 0);
    if (
      (w.sRGB != null && (W += 13),
      w.pHYs != null && (W += 21),
      w.iCCP != null && ((N = pako.deflate(w.iCCP)), (W += 21 + N.length + 4)),
      o.ctype == 3)
    ) {
      for (var H = o.plte.length, $ = 0; $ < H; $++)
        o.plte[$] >>> 24 != 255 && (z = !0);
      W += 8 + 3 * H + 4 + (z ? 8 + 1 * H + 4 : 0);
    }
    for (var P = 0; P < o.frames.length; P++)
      (T && (W += 38),
        (W += (Z = o.frames[P]).cimg.length + 12),
        P != 0 && (W += 4));
    W += 12;
    const F = new Uint8Array(W),
      V = [137, 80, 78, 71, 13, 10, 26, 10];
    for ($ = 0; $ < 8; $++) F[$] = V[$];
    if (
      (y(F, s, 13),
      (s += 4),
      d(F, s, "IHDR"),
      (s += 4),
      y(F, s, c),
      (s += 4),
      y(F, s, v),
      (s += 4),
      (F[s] = o.depth),
      s++,
      (F[s] = o.ctype),
      s++,
      (F[s] = 0),
      s++,
      (F[s] = 0),
      s++,
      (F[s] = 0),
      s++,
      y(F, s, A(F, s - 17, 17)),
      (s += 4),
      w.sRGB != null &&
        (y(F, s, 1),
        (s += 4),
        d(F, s, "sRGB"),
        (s += 4),
        (F[s] = w.sRGB),
        s++,
        y(F, s, A(F, s - 5, 5)),
        (s += 4)),
      w.iCCP != null)
    ) {
      const Y = 13 + N.length;
      (y(F, s, Y),
        (s += 4),
        d(F, s, "iCCP"),
        (s += 4),
        d(F, s, "ICC profile"),
        (s += 11),
        (s += 2),
        F.set(N, s),
        (s += N.length),
        y(F, s, A(F, s - (Y + 4), Y + 4)),
        (s += 4));
    }
    if (
      (w.pHYs != null &&
        (y(F, s, 9),
        (s += 4),
        d(F, s, "pHYs"),
        (s += 4),
        y(F, s, w.pHYs[0]),
        (s += 4),
        y(F, s, w.pHYs[1]),
        (s += 4),
        (F[s] = w.pHYs[2]),
        s++,
        y(F, s, A(F, s - 13, 13)),
        (s += 4)),
      T &&
        (y(F, s, 8),
        (s += 4),
        d(F, s, "acTL"),
        (s += 4),
        y(F, s, o.frames.length),
        (s += 4),
        y(F, s, w.loop != null ? w.loop : 0),
        (s += 4),
        y(F, s, A(F, s - 12, 12)),
        (s += 4)),
      o.ctype == 3)
    ) {
      for (
        y(F, s, 3 * (H = o.plte.length)),
          s += 4,
          d(F, s, "PLTE"),
          s += 4,
          $ = 0;
        $ < H;
        $++
      ) {
        const Y = 3 * $,
          X = o.plte[$],
          re = 255 & X,
          ie = (X >>> 8) & 255,
          ge = (X >>> 16) & 255;
        ((F[s + Y + 0] = re), (F[s + Y + 1] = ie), (F[s + Y + 2] = ge));
      }
      if (
        ((s += 3 * H), y(F, s, A(F, s - 3 * H - 4, 3 * H + 4)), (s += 4), z)
      ) {
        for (y(F, s, H), s += 4, d(F, s, "tRNS"), s += 4, $ = 0; $ < H; $++)
          F[s + $] = (o.plte[$] >>> 24) & 255;
        ((s += H), y(F, s, A(F, s - H - 4, H + 4)), (s += 4));
      }
    }
    let J = 0;
    for (P = 0; P < o.frames.length; P++) {
      var Z = o.frames[P];
      T &&
        (y(F, s, 26),
        (s += 4),
        d(F, s, "fcTL"),
        (s += 4),
        y(F, s, J++),
        (s += 4),
        y(F, s, Z.rect.width),
        (s += 4),
        y(F, s, Z.rect.height),
        (s += 4),
        y(F, s, Z.rect.x),
        (s += 4),
        y(F, s, Z.rect.y),
        (s += 4),
        C(F, s, k[P]),
        (s += 2),
        C(F, s, 1e3),
        (s += 2),
        (F[s] = Z.dispose),
        s++,
        (F[s] = Z.blend),
        s++,
        y(F, s, A(F, s - 30, 30)),
        (s += 4));
      const Y = Z.cimg;
      (y(F, s, (H = Y.length) + (P == 0 ? 0 : 4)), (s += 4));
      const X = s;
      (d(F, s, P == 0 ? "IDAT" : "fdAT"),
        (s += 4),
        P != 0 && (y(F, s, J++), (s += 4)),
        F.set(Y, s),
        (s += H),
        y(F, s, A(F, X, s - X)),
        (s += 4));
    }
    return (
      y(F, s, 0),
      (s += 4),
      d(F, s, "IEND"),
      (s += 4),
      y(F, s, A(F, s - 4, 4)),
      (s += 4),
      F.buffer
    );
  }
  function x(o, c, v) {
    for (let k = 0; k < o.frames.length; k++) {
      const w = o.frames[k];
      w.rect.width;
      const A = w.rect.height,
        y = new Uint8Array(A * w.bpl + A);
      w.cimg = i(w.img, A, w.bpp, w.bpl, y, c, v);
    }
  }
  function r(o, c, v, k, w) {
    const A = w[0],
      y = w[1],
      C = w[2],
      d = w[3],
      s = w[4],
      T = w[5];
    let N = 6,
      z = 8,
      W = 255;
    for (var H = 0; H < o.length; H++) {
      const Q = new Uint8Array(o[H]);
      for (var $ = Q.length, P = 0; P < $; P += 4) W &= Q[P + 3];
    }
    const F = W != 255,
      V = (function (G, q, K, ae, se, le) {
        const ne = [];
        for (var ee = 0; ee < G.length; ee++) {
          const de = new Uint8Array(G[ee]),
            pe = new Uint32Array(de.buffer);
          var ue;
          let he = 0,
            ye = 0,
            xe = q,
            Ae = K,
            He = ae ? 1 : 0;
          if (ee != 0) {
            const Ut = le || ae || ee == 1 || ne[ee - 2].dispose != 0 ? 1 : 2;
            let Be = 0,
              Ke = 1e9;
            for (let _e = 0; _e < Ut; _e++) {
              var ve = new Uint8Array(G[ee - 1 - _e]);
              const Ct = new Uint32Array(G[ee - 1 - _e]);
              let we = q,
                ke = K,
                Ee = -1,
                Ie = -1;
              for (let Ne = 0; Ne < K; Ne++)
                for (let Ue = 0; Ue < q; Ue++)
                  pe[(oe = Ne * q + Ue)] != Ct[oe] &&
                    (Ue < we && (we = Ue),
                    Ue > Ee && (Ee = Ue),
                    Ne < ke && (ke = Ne),
                    Ne > Ie && (Ie = Ne));
              (Ee == -1 && (we = ke = Ee = Ie = 0),
                se && ((1 & we) == 1 && we--, (1 & ke) == 1 && ke--));
              const Ye = (Ee - we + 1) * (Ie - ke + 1);
              Ye < Ke &&
                ((Ke = Ye),
                (Be = _e),
                (he = we),
                (ye = ke),
                (xe = Ee - we + 1),
                (Ae = Ie - ke + 1));
            }
            ((ve = new Uint8Array(G[ee - 1 - Be])),
              Be == 1 && (ne[ee - 1].dispose = 2),
              (ue = new Uint8Array(xe * Ae * 4)),
              R(ve, q, K, ue, xe, Ae, -he, -ye, 0),
              (He = R(de, q, K, ue, xe, Ae, -he, -ye, 3) ? 1 : 0),
              He == 1
                ? a(de, q, K, ue, { x: he, y: ye, width: xe, height: Ae })
                : R(de, q, K, ue, xe, Ae, -he, -ye, 0));
          } else ue = de.slice(0);
          ne.push({
            rect: { x: he, y: ye, width: xe, height: Ae },
            img: ue,
            blend: He,
            dispose: 0,
          });
        }
        if (ae)
          for (ee = 0; ee < ne.length; ee++) {
            if ((je = ne[ee]).blend == 1) continue;
            const de = je.rect,
              pe = ne[ee - 1].rect,
              he = Math.min(de.x, pe.x),
              ye = Math.min(de.y, pe.y),
              xe = {
                x: he,
                y: ye,
                width: Math.max(de.x + de.width, pe.x + pe.width) - he,
                height: Math.max(de.y + de.height, pe.y + pe.height) - ye,
              };
            ((ne[ee - 1].dispose = 1),
              ee - 1 != 0 && n(G, q, K, ne, ee - 1, xe, se),
              n(G, q, K, ne, ee, xe, se));
          }
        let Re = 0;
        if (G.length != 1)
          for (var oe = 0; oe < ne.length; oe++) {
            var je;
            Re += (je = ne[oe]).rect.width * je.rect.height;
          }
        return ne;
      })(o, c, v, A, y, C),
      J = {},
      Z = [],
      Y = [];
    if (k != 0) {
      const Q = [];
      for (P = 0; P < V.length; P++) Q.push(V[P].img.buffer);
      const G = (function (se) {
          let le = 0;
          for (var ne = 0; ne < se.length; ne++) le += se[ne].byteLength;
          const ee = new Uint8Array(le);
          let ue = 0;
          for (ne = 0; ne < se.length; ne++) {
            const ve = new Uint8Array(se[ne]),
              Re = ve.length;
            for (let oe = 0; oe < Re; oe += 4) {
              let je = ve[oe],
                de = ve[oe + 1],
                pe = ve[oe + 2];
              const he = ve[oe + 3];
              (he == 0 && (je = de = pe = 0),
                (ee[ue + oe] = je),
                (ee[ue + oe + 1] = de),
                (ee[ue + oe + 2] = pe),
                (ee[ue + oe + 3] = he));
            }
            ue += Re;
          }
          return ee.buffer;
        })(Q),
        q = U(G, k);
      for (P = 0; P < q.plte.length; P++) Z.push(q.plte[P].est.rgba);
      let K = 0;
      for (P = 0; P < V.length; P++) {
        const ae = (re = V[P]).img.length;
        var X = new Uint8Array(q.inds.buffer, K >> 2, ae >> 2);
        Y.push(X);
        const se = new Uint8Array(q.abuf, K, ae);
        (T && l(re.img, re.rect.width, re.rect.height, Z, se, X),
          re.img.set(se),
          (K += ae));
      }
    } else
      for (H = 0; H < V.length; H++) {
        var re = V[H];
        const Q = new Uint32Array(re.img.buffer);
        var ie = re.rect.width;
        for (
          $ = Q.length, X = new Uint8Array($), Y.push(X), P = 0;
          P < $;
          P++
        ) {
          const G = Q[P];
          if (P != 0 && G == Q[P - 1]) X[P] = X[P - 1];
          else if (P > ie && G == Q[P - ie]) X[P] = X[P - ie];
          else {
            let q = J[G];
            if (
              q == null &&
              ((J[G] = q = Z.length), Z.push(G), Z.length >= 300)
            )
              break;
            X[P] = q;
          }
        }
      }
    const ge = Z.length;
    for (
      ge <= 256 &&
        s == 0 &&
        ((z = ge <= 2 ? 1 : ge <= 4 ? 2 : ge <= 16 ? 4 : 8),
        (z = Math.max(z, d))),
        H = 0;
      H < V.length;
      H++
    ) {
      ((re = V[H]).rect.x, re.rect.y, (ie = re.rect.width));
      const Q = re.rect.height;
      let G = re.img;
      new Uint32Array(G.buffer);
      let q = 4 * ie,
        K = 4;
      if (ge <= 256 && s == 0) {
        q = Math.ceil((z * ie) / 8);
        var j = new Uint8Array(q * Q);
        const ae = Y[H];
        for (let se = 0; se < Q; se++) {
          P = se * q;
          const le = se * ie;
          if (z == 8) for (var B = 0; B < ie; B++) j[P + B] = ae[le + B];
          else if (z == 4)
            for (B = 0; B < ie; B++)
              j[P + (B >> 1)] |= ae[le + B] << (4 - 4 * (1 & B));
          else if (z == 2)
            for (B = 0; B < ie; B++)
              j[P + (B >> 2)] |= ae[le + B] << (6 - 2 * (3 & B));
          else if (z == 1)
            for (B = 0; B < ie; B++)
              j[P + (B >> 3)] |= ae[le + B] << (7 - 1 * (7 & B));
        }
        ((G = j), (N = 3), (K = 1));
      } else if (F == 0 && V.length == 1) {
        j = new Uint8Array(ie * Q * 3);
        const ae = ie * Q;
        for (P = 0; P < ae; P++) {
          const se = 3 * P,
            le = 4 * P;
          ((j[se] = G[le]), (j[se + 1] = G[le + 1]), (j[se + 2] = G[le + 2]));
        }
        ((G = j), (N = 2), (K = 3), (q = 3 * ie));
      }
      ((re.img = G), (re.bpl = q), (re.bpp = K));
    }
    return { ctype: N, depth: z, plte: Z, frames: V };
  }
  function n(o, c, v, k, w, A, y) {
    const C = Uint8Array,
      d = Uint32Array,
      s = new C(o[w - 1]),
      T = new d(o[w - 1]),
      N = w + 1 < o.length ? new C(o[w + 1]) : null,
      z = new C(o[w]),
      W = new d(z.buffer);
    let H = c,
      $ = v,
      P = -1,
      F = -1;
    for (let J = 0; J < A.height; J++)
      for (let Z = 0; Z < A.width; Z++) {
        const Y = A.x + Z,
          X = A.y + J,
          re = X * c + Y,
          ie = W[re];
        ie == 0 ||
          (k[w - 1].dispose == 0 &&
            T[re] == ie &&
            (N == null || N[4 * re + 3] != 0)) ||
          (Y < H && (H = Y),
          Y > P && (P = Y),
          X < $ && ($ = X),
          X > F && (F = X));
      }
    (P == -1 && (H = $ = P = F = 0),
      y && ((1 & H) == 1 && H--, (1 & $) == 1 && $--),
      (A = { x: H, y: $, width: P - H + 1, height: F - $ + 1 }));
    const V = k[w];
    ((V.rect = A),
      (V.blend = 1),
      (V.img = new Uint8Array(A.width * A.height * 4)),
      k[w - 1].dispose == 0
        ? (R(s, c, v, V.img, A.width, A.height, -A.x, -A.y, 0),
          a(z, c, v, V.img, A))
        : R(z, c, v, V.img, A.width, A.height, -A.x, -A.y, 0));
  }
  function a(o, c, v, k, w) {
    R(o, c, v, k, w.width, w.height, -w.x, -w.y, 2);
  }
  function i(o, c, v, k, w, A, y) {
    const C = [];
    let d,
      s = [0, 1, 2, 3, 4];
    (A != -1 ? (s = [A]) : (c * k > 5e5 || v == 1) && (s = [0]),
      y && (d = { level: 0 }));
    const T = er;
    for (var N = 0; N < s.length; N++) {
      for (let H = 0; H < c; H++) p(w, o, H, k, v, s[N]);
      C.push(T.deflate(w, d));
    }
    let z,
      W = 1e9;
    for (N = 0; N < C.length; N++)
      C[N].length < W && ((z = N), (W = C[N].length));
    return C[z];
  }
  function p(o, c, v, k, w, A) {
    const y = v * k;
    let C = y + v;
    if (((o[C] = A), C++, A == 0))
      if (k < 500) for (var d = 0; d < k; d++) o[C + d] = c[y + d];
      else o.set(new Uint8Array(c.buffer, y, k), C);
    else if (A == 1) {
      for (d = 0; d < w; d++) o[C + d] = c[y + d];
      for (d = w; d < k; d++) o[C + d] = (c[y + d] - c[y + d - w] + 256) & 255;
    } else if (v == 0) {
      for (d = 0; d < w; d++) o[C + d] = c[y + d];
      if (A == 2) for (d = w; d < k; d++) o[C + d] = c[y + d];
      if (A == 3)
        for (d = w; d < k; d++)
          o[C + d] = (c[y + d] - (c[y + d - w] >> 1) + 256) & 255;
      if (A == 4)
        for (d = w; d < k; d++)
          o[C + d] = (c[y + d] - D(c[y + d - w], 0, 0) + 256) & 255;
    } else {
      if (A == 2)
        for (d = 0; d < k; d++)
          o[C + d] = (c[y + d] + 256 - c[y + d - k]) & 255;
      if (A == 3) {
        for (d = 0; d < w; d++)
          o[C + d] = (c[y + d] + 256 - (c[y + d - k] >> 1)) & 255;
        for (d = w; d < k; d++)
          o[C + d] =
            (c[y + d] + 256 - ((c[y + d - k] + c[y + d - w]) >> 1)) & 255;
      }
      if (A == 4) {
        for (d = 0; d < w; d++)
          o[C + d] = (c[y + d] + 256 - D(0, c[y + d - k], 0)) & 255;
        for (d = w; d < k; d++)
          o[C + d] =
            (c[y + d] + 256 - D(c[y + d - w], c[y + d - k], c[y + d - w - k])) &
            255;
      }
    }
  }
  function U(o, c) {
    const v = new Uint8Array(o),
      k = v.slice(0),
      w = new Uint32Array(k.buffer),
      A = E(k, c),
      y = A[0],
      C = A[1],
      d = v.length,
      s = new Uint8Array(d >> 2);
    let T;
    if (v.length < 2e7)
      for (var N = 0; N < d; N += 4)
        ((T = b(
          y,
          (z = v[N] * (1 / 255)),
          (W = v[N + 1] * (1 / 255)),
          (H = v[N + 2] * (1 / 255)),
          ($ = v[N + 3] * (1 / 255)),
        )),
          (s[N >> 2] = T.ind),
          (w[N >> 2] = T.est.rgba));
    else
      for (N = 0; N < d; N += 4) {
        var z = v[N] * 0.00392156862745098,
          W = v[N + 1] * (1 / 255),
          H = v[N + 2] * (1 / 255),
          $ = v[N + 3] * (1 / 255);
        for (T = y; T.left; ) T = L(T.est, z, W, H, $) <= 0 ? T.left : T.right;
        ((s[N >> 2] = T.ind), (w[N >> 2] = T.est.rgba));
      }
    return { abuf: k.buffer, inds: s, plte: C };
  }
  function E(o, c, v) {
    v == null && (v = 1e-4);
    const k = new Uint32Array(o.buffer),
      w = {
        i0: 0,
        i1: o.length,
        bst: null,
        est: null,
        tdst: 0,
        left: null,
        right: null,
      };
    ((w.bst = O(o, w.i0, w.i1)), (w.est = m(w.bst)));
    const A = [w];
    for (; A.length < c; ) {
      let C = 0,
        d = 0;
      for (var y = 0; y < A.length; y++)
        A[y].est.L > C && ((C = A[y].est.L), (d = y));
      if (C < v) break;
      const s = A[d],
        T = M(o, k, s.i0, s.i1, s.est.e, s.est.eMq255);
      if (s.i0 >= T || s.i1 <= T) {
        s.est.L = 0;
        continue;
      }
      const N = {
        i0: s.i0,
        i1: T,
        bst: null,
        est: null,
        tdst: 0,
        left: null,
        right: null,
      };
      ((N.bst = O(o, N.i0, N.i1)), (N.est = m(N.bst)));
      const z = {
        i0: T,
        i1: s.i1,
        bst: null,
        est: null,
        tdst: 0,
        left: null,
        right: null,
      };
      for (z.bst = { R: [], m: [], N: s.bst.N - N.bst.N }, y = 0; y < 16; y++)
        z.bst.R[y] = s.bst.R[y] - N.bst.R[y];
      for (y = 0; y < 4; y++) z.bst.m[y] = s.bst.m[y] - N.bst.m[y];
      ((z.est = m(z.bst)), (s.left = N), (s.right = z), (A[d] = N), A.push(z));
    }
    for (A.sort((C, d) => d.bst.N - C.bst.N), y = 0; y < A.length; y++)
      A[y].ind = y;
    return [w, A];
  }
  function b(o, c, v, k, w) {
    if (o.left == null)
      return (
        (o.tdst = (function (N, z, W, H, $) {
          const P = z - N[0],
            F = W - N[1],
            V = H - N[2],
            J = $ - N[3];
          return P * P + F * F + V * V + J * J;
        })(o.est.q, c, v, k, w)),
        o
      );
    const A = L(o.est, c, v, k, w);
    let y = o.left,
      C = o.right;
    A > 0 && ((y = o.right), (C = o.left));
    const d = b(y, c, v, k, w);
    if (d.tdst <= A * A) return d;
    const s = b(C, c, v, k, w);
    return s.tdst < d.tdst ? s : d;
  }
  function L(o, c, v, k, w) {
    const { e: A } = o;
    return A[0] * c + A[1] * v + A[2] * k + A[3] * w - o.eMq;
  }
  function M(o, c, v, k, w, A) {
    for (k -= 4; v < k; ) {
      for (; S(o, v, w) <= A; ) v += 4;
      for (; S(o, k, w) > A; ) k -= 4;
      if (v >= k) break;
      const y = c[v >> 2];
      ((c[v >> 2] = c[k >> 2]), (c[k >> 2] = y), (v += 4), (k -= 4));
    }
    for (; S(o, v, w) > A; ) v -= 4;
    return v + 4;
  }
  function S(o, c, v) {
    return o[c] * v[0] + o[c + 1] * v[1] + o[c + 2] * v[2] + o[c + 3] * v[3];
  }
  function O(o, c, v) {
    const k = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      w = [0, 0, 0, 0],
      A = (v - c) >> 2;
    for (let y = c; y < v; y += 4) {
      const C = o[y] * 0.00392156862745098,
        d = o[y + 1] * (1 / 255),
        s = o[y + 2] * (1 / 255),
        T = o[y + 3] * (1 / 255);
      ((w[0] += C),
        (w[1] += d),
        (w[2] += s),
        (w[3] += T),
        (k[0] += C * C),
        (k[1] += C * d),
        (k[2] += C * s),
        (k[3] += C * T),
        (k[5] += d * d),
        (k[6] += d * s),
        (k[7] += d * T),
        (k[10] += s * s),
        (k[11] += s * T),
        (k[15] += T * T));
    }
    return (
      (k[4] = k[1]),
      (k[8] = k[2]),
      (k[9] = k[6]),
      (k[12] = k[3]),
      (k[13] = k[7]),
      (k[14] = k[11]),
      { R: k, m: w, N: A }
    );
  }
  function m(o) {
    const { R: c } = o,
      { m: v } = o,
      { N: k } = o,
      w = v[0],
      A = v[1],
      y = v[2],
      C = v[3],
      d = k == 0 ? 0 : 1 / k,
      s = [
        c[0] - w * w * d,
        c[1] - w * A * d,
        c[2] - w * y * d,
        c[3] - w * C * d,
        c[4] - A * w * d,
        c[5] - A * A * d,
        c[6] - A * y * d,
        c[7] - A * C * d,
        c[8] - y * w * d,
        c[9] - y * A * d,
        c[10] - y * y * d,
        c[11] - y * C * d,
        c[12] - C * w * d,
        c[13] - C * A * d,
        c[14] - C * y * d,
        c[15] - C * C * d,
      ],
      T = s,
      N = I;
    let z = [Math.random(), Math.random(), Math.random(), Math.random()],
      W = 0,
      H = 0;
    if (k != 0)
      for (
        let P = 0;
        P < 16 &&
        ((z = N.multVec(T, z)),
        (H = Math.sqrt(N.dot(z, z))),
        (z = N.sml(1 / H, z)),
        !(P != 0 && Math.abs(H - W) < 1e-9));
        P++
      )
        W = H;
    const $ = [w * d, A * d, y * d, C * d];
    return {
      Cov: s,
      q: $,
      e: z,
      L: W,
      eMq255: N.dot(N.sml(255, $), z),
      eMq: N.dot(z, $),
      rgba:
        ((Math.round(255 * $[3]) << 24) |
          (Math.round(255 * $[2]) << 16) |
          (Math.round(255 * $[1]) << 8) |
          (Math.round(255 * $[0]) << 0)) >>>
        0,
    };
  }
  var I = {
    multVec: (o, c) => [
      o[0] * c[0] + o[1] * c[1] + o[2] * c[2] + o[3] * c[3],
      o[4] * c[0] + o[5] * c[1] + o[6] * c[2] + o[7] * c[3],
      o[8] * c[0] + o[9] * c[1] + o[10] * c[2] + o[11] * c[3],
      o[12] * c[0] + o[13] * c[1] + o[14] * c[2] + o[15] * c[3],
    ],
    dot: (o, c) => o[0] * c[0] + o[1] * c[1] + o[2] * c[2] + o[3] * c[3],
    sml: (o, c) => [o * c[0], o * c[1], o * c[2], o * c[3]],
  };
  ((me.encode = function (c, v, k, w, A, y, C) {
    (w == null && (w = 0), C == null && (C = !1));
    const d = r(c, v, k, w, [!1, !1, !1, 0, C, !1]);
    return (x(d, -1), g(d, v, k, A, y));
  }),
    (me.encodeLL = function (c, v, k, w, A, y, C, d) {
      const s = {
          ctype: 0 + (w == 1 ? 0 : 2) + (A == 0 ? 0 : 4),
          depth: y,
          frames: [],
        },
        T = (w + A) * y,
        N = T * v;
      for (let z = 0; z < c.length; z++)
        s.frames.push({
          rect: { x: 0, y: 0, width: v, height: k },
          img: new Uint8Array(c[z]),
          blend: 0,
          dispose: 1,
          bpp: Math.ceil(T / 8),
          bpl: Math.ceil(N / 8),
        });
      return (x(s, 0, !0), g(s, v, k, C, d));
    }),
    (me.encode.compress = r),
    (me.encode.dither = l),
    (me.quantize = U),
    (me.quantize.getKDtree = E),
    (me.quantize.getNearest = b));
})();
const gt = {
  toArrayBuffer(R, _) {
    const D = R.width,
      u = R.height,
      e = D << 2,
      t = R.getContext("2d").getImageData(0, 0, D, u),
      f = new Uint32Array(t.data.buffer),
      l = ((32 * D + 31) / 32) << 2,
      g = l * u,
      x = 122 + g,
      r = new ArrayBuffer(x),
      n = new DataView(r),
      a = 1 << 20;
    let i,
      p,
      U,
      E,
      b = a,
      L = 0,
      M = 0,
      S = 0;
    function O(o) {
      (n.setUint16(M, o, !0), (M += 2));
    }
    function m(o) {
      (n.setUint32(M, o, !0), (M += 4));
    }
    function I(o) {
      M += o;
    }
    (O(19778),
      m(x),
      I(4),
      m(122),
      m(108),
      m(D),
      m(-u >>> 0),
      O(1),
      O(32),
      m(3),
      m(g),
      m(2835),
      m(2835),
      I(8),
      m(16711680),
      m(65280),
      m(255),
      m(4278190080),
      m(1466527264),
      (function o() {
        for (; L < u && b > 0; ) {
          for (E = 122 + L * l, i = 0; i < e; )
            (b--,
              (p = f[S++]),
              (U = p >>> 24),
              n.setUint32(E + i, (p << 8) | U),
              (i += 4));
          L++;
        }
        S < f.length ? ((b = a), setTimeout(o, gt._dly)) : _(r);
      })());
  },
  toBlob(R, _) {
    this.toArrayBuffer(R, (D) => {
      _(new Blob([D], { type: "image/bmp" }));
    });
  },
  _dly: 9,
};
var fe = {
    CHROME: "CHROME",
    FIREFOX: "FIREFOX",
    DESKTOP_SAFARI: "DESKTOP_SAFARI",
    IE: "IE",
    IOS: "IOS",
    ETC: "ETC",
  },
  tr = {
    [fe.CHROME]: 16384,
    [fe.FIREFOX]: 11180,
    [fe.DESKTOP_SAFARI]: 16384,
    [fe.IE]: 8192,
    [fe.IOS]: 4096,
    [fe.ETC]: 8192,
  };
const Ve = typeof window < "u",
  xt = typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope,
  Le =
    Ve &&
    window.cordova &&
    window.cordova.require &&
    window.cordova.require("cordova/modulemapper"),
  rr =
    (Ve || xt) &&
    ((Le && Le.getOriginalSymbol(window, "File")) ||
      (typeof File < "u" && File)),
  bt =
    (Ve || xt) &&
    ((Le && Le.getOriginalSymbol(window, "FileReader")) ||
      (typeof FileReader < "u" && FileReader));
function qe(R, _, D = Date.now()) {
  return new Promise((u) => {
    const e = R.split(","),
      t = e[0].match(/:(.*?);/)[1],
      f = globalThis.atob(e[1]);
    let l = f.length;
    const g = new Uint8Array(l);
    for (; l--; ) g[l] = f.charCodeAt(l);
    const x = new Blob([g], { type: t });
    ((x.name = _), (x.lastModified = D), u(x));
  });
}
function yt(R) {
  return new Promise((_, D) => {
    const u = new bt();
    ((u.onload = () => _(u.result)),
      (u.onerror = (e) => D(e)),
      u.readAsDataURL(R));
  });
}
function vt(R) {
  return new Promise((_, D) => {
    const u = new Image();
    ((u.onload = () => _(u)), (u.onerror = (e) => D(e)), (u.src = R));
  });
}
function Se() {
  if (Se.cachedResult !== void 0) return Se.cachedResult;
  let R = fe.ETC;
  const { userAgent: _ } = navigator;
  return (
    /Chrom(e|ium)/i.test(_)
      ? (R = fe.CHROME)
      : /iP(ad|od|hone)/i.test(_) && /WebKit/i.test(_)
        ? (R = fe.IOS)
        : /Safari/i.test(_)
          ? (R = fe.DESKTOP_SAFARI)
          : /Firefox/i.test(_)
            ? (R = fe.FIREFOX)
            : (/MSIE/i.test(_) || document.documentMode) && (R = fe.IE),
    (Se.cachedResult = R),
    Se.cachedResult
  );
}
function wt(R, _) {
  const D = Se(),
    u = tr[D];
  let e = R,
    t = _,
    f = e * t;
  const l = e > t ? t / e : e / t;
  for (; f > u * u; ) {
    const g = (u + e) / 2,
      x = (u + t) / 2;
    (g < x ? ((t = x), (e = x * l)) : ((t = g * l), (e = g)), (f = e * t));
  }
  return { width: e, height: t };
}
function Pe(R, _) {
  let D, u;
  try {
    if (((D = new OffscreenCanvas(R, _)), (u = D.getContext("2d")), u === null))
      throw new Error("getContext of OffscreenCanvas returns null");
  } catch {
    ((D = document.createElement("canvas")), (u = D.getContext("2d")));
  }
  return ((D.width = R), (D.height = _), [D, u]);
}
function kt(R, _) {
  const { width: D, height: u } = wt(R.width, R.height),
    [e, t] = Pe(D, u);
  return (
    _ &&
      /jpe?g/.test(_) &&
      ((t.fillStyle = "white"), t.fillRect(0, 0, e.width, e.height)),
    t.drawImage(R, 0, 0, e.width, e.height),
    e
  );
}
function Te() {
  return (
    Te.cachedResult !== void 0 ||
      (Te.cachedResult =
        [
          "iPad Simulator",
          "iPhone Simulator",
          "iPod Simulator",
          "iPad",
          "iPhone",
          "iPod",
        ].includes(navigator.platform) ||
        (navigator.userAgent.includes("Mac") &&
          typeof document < "u" &&
          "ontouchend" in document)),
    Te.cachedResult
  );
}
function Oe(R, _ = {}) {
  return new Promise(function (D, u) {
    let e, t;
    var f = function () {
        try {
          return ((t = kt(e, _.fileType || R.type)), D([e, t]));
        } catch (g) {
          return u(g);
        }
      },
      l = function (g) {
        try {
          var x = function (r) {
            try {
              throw r;
            } catch (n) {
              return u(n);
            }
          };
          try {
            let r;
            return yt(R).then(function (n) {
              try {
                return (
                  (r = n),
                  vt(r).then(function (a) {
                    try {
                      return (
                        (e = a),
                        (function () {
                          try {
                            return f();
                          } catch (i) {
                            return u(i);
                          }
                        })()
                      );
                    } catch (i) {
                      return x(i);
                    }
                  }, x)
                );
              } catch (a) {
                return x(a);
              }
            }, x);
          } catch (r) {
            x(r);
          }
        } catch (r) {
          return u(r);
        }
      };
    try {
      if (Te() || [fe.DESKTOP_SAFARI, fe.MOBILE_SAFARI].includes(Se()))
        throw new Error("Skip createImageBitmap on IOS and Safari");
      return createImageBitmap(R).then(function (g) {
        try {
          return ((e = g), f());
        } catch {
          return l();
        }
      }, l);
    } catch {
      l();
    }
  });
}
function De(R, _, D, u, e = 1) {
  return new Promise(function (t, f) {
    let l;
    if (_ === "image/png") {
      let x, r, n;
      return (
        (x = R.getContext("2d")),
        ({ data: r } = x.getImageData(0, 0, R.width, R.height)),
        (n = me.encode([r.buffer], R.width, R.height, 4096 * e)),
        (l = new Blob([n], { type: _ })),
        (l.name = D),
        (l.lastModified = u),
        g.call(this)
      );
    }
    {
      let x = function () {
        return g.call(this);
      };
      if (_ === "image/bmp")
        return new Promise((r) => gt.toBlob(R, r)).then(
          function (r) {
            try {
              return (
                (l = r),
                (l.name = D),
                (l.lastModified = u),
                x.call(this)
              );
            } catch (n) {
              return f(n);
            }
          }.bind(this),
          f,
        );
      {
        let r = function () {
          return x.call(this);
        };
        if (
          typeof OffscreenCanvas == "function" &&
          R instanceof OffscreenCanvas
        )
          return R.convertToBlob({ type: _, quality: e }).then(
            function (n) {
              try {
                return (
                  (l = n),
                  (l.name = D),
                  (l.lastModified = u),
                  r.call(this)
                );
              } catch (a) {
                return f(a);
              }
            }.bind(this),
            f,
          );
        {
          let n;
          return (
            (n = R.toDataURL(_, e)),
            qe(n, D, u).then(
              function (a) {
                try {
                  return ((l = a), r.call(this));
                } catch (i) {
                  return f(i);
                }
              }.bind(this),
              f,
            )
          );
        }
      }
    }
    function g() {
      return t(l);
    }
  });
}
function be(R) {
  ((R.width = 0), (R.height = 0));
}
function Fe() {
  return new Promise(function (R, _) {
    let D, u, e, t;
    return Fe.cachedResult !== void 0
      ? R(Fe.cachedResult)
      : qe(
          "data:image/jpeg;base64,/9j/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAAAAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAEAAgMBEQACEQEDEQH/xABKAAEAAAAAAAAAAAAAAAAAAAALEAEAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8H//2Q==",
          "test.jpg",
          Date.now(),
        ).then(function (f) {
          try {
            return (
              (D = f),
              Oe(D).then(function (l) {
                try {
                  return (
                    (u = l[1]),
                    De(u, D.type, D.name, D.lastModified).then(function (g) {
                      try {
                        return (
                          (e = g),
                          be(u),
                          Oe(e).then(function (x) {
                            try {
                              return (
                                (t = x[0]),
                                (Fe.cachedResult =
                                  t.width === 1 && t.height === 2),
                                R(Fe.cachedResult)
                              );
                            } catch (r) {
                              return _(r);
                            }
                          }, _)
                        );
                      } catch (x) {
                        return _(x);
                      }
                    }, _)
                  );
                } catch (g) {
                  return _(g);
                }
              }, _)
            );
          } catch (l) {
            return _(l);
          }
        }, _);
  });
}
function jt(R) {
  return new Promise((_, D) => {
    const u = new bt();
    ((u.onload = (e) => {
      const t = new DataView(e.target.result);
      if (t.getUint16(0, !1) != 65496) return _(-2);
      const f = t.byteLength;
      let l = 2;
      for (; l < f; ) {
        if (t.getUint16(l + 2, !1) <= 8) return _(-1);
        const g = t.getUint16(l, !1);
        if (((l += 2), g == 65505)) {
          if (t.getUint32((l += 2), !1) != 1165519206) return _(-1);
          const x = t.getUint16((l += 6), !1) == 18761;
          l += t.getUint32(l + 4, x);
          const r = t.getUint16(l, x);
          l += 2;
          for (let n = 0; n < r; n++)
            if (t.getUint16(l + 12 * n, x) == 274)
              return _(t.getUint16(l + 12 * n + 8, x));
        } else {
          if ((65280 & g) != 65280) break;
          l += t.getUint16(l, !1);
        }
      }
      return _(-1);
    }),
      (u.onerror = (e) => D(e)),
      u.readAsArrayBuffer(R));
  });
}
function At(R, _) {
  const { width: D } = R,
    { height: u } = R,
    { maxWidthOrHeight: e } = _;
  let t,
    f = R;
  return (
    isFinite(e) &&
      (D > e || u > e) &&
      (([f, t] = Pe(D, u)),
      D > u
        ? ((f.width = e), (f.height = (u / D) * e))
        : ((f.width = (D / u) * e), (f.height = e)),
      t.drawImage(R, 0, 0, f.width, f.height),
      be(R)),
    f
  );
}
function Nt(R, _) {
  const { width: D } = R,
    { height: u } = R,
    [e, t] = Pe(D, u);
  switch (
    (_ > 4 && _ < 9
      ? ((e.width = u), (e.height = D))
      : ((e.width = D), (e.height = u)),
    _)
  ) {
    case 2:
      t.transform(-1, 0, 0, 1, D, 0);
      break;
    case 3:
      t.transform(-1, 0, 0, -1, D, u);
      break;
    case 4:
      t.transform(1, 0, 0, -1, 0, u);
      break;
    case 5:
      t.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      t.transform(0, 1, -1, 0, u, 0);
      break;
    case 7:
      t.transform(0, -1, -1, 0, u, D);
      break;
    case 8:
      t.transform(0, -1, 1, 0, 0, D);
  }
  return (t.drawImage(R, 0, 0, D, u), be(R), e);
}
function ut(R, _, D = 0) {
  return new Promise(function (u, e) {
    let t, f, l, g, x, r, n, a, i, p, U, E, b, L, M, S, O, m, I, o;
    function c(k = 5) {
      if (_.signal && _.signal.aborted) throw _.signal.reason;
      ((t += k), _.onProgress(Math.min(t, 100)));
    }
    function v(k) {
      if (_.signal && _.signal.aborted) throw _.signal.reason;
      ((t = Math.min(Math.max(k, t), 100)), _.onProgress(t));
    }
    return (
      (t = D),
      (f = _.maxIteration || 10),
      (l = 1024 * _.maxSizeMB * 1024),
      c(),
      Oe(R, _).then(
        function (k) {
          try {
            return (
              ([, g] = k),
              c(),
              (x = At(g, _)),
              c(),
              new Promise(function (w, A) {
                var y;
                if (!(y = _.exifOrientation))
                  return jt(R).then(
                    function (d) {
                      try {
                        return ((y = d), C.call(this));
                      } catch (s) {
                        return A(s);
                      }
                    }.bind(this),
                    A,
                  );
                function C() {
                  return w(y);
                }
                return C.call(this);
              }).then(
                function (w) {
                  try {
                    return (
                      (r = w),
                      c(),
                      Fe().then(
                        function (A) {
                          try {
                            return (
                              (n = A ? x : Nt(x, r)),
                              c(),
                              (a = _.initialQuality || 1),
                              (i = _.fileType || R.type),
                              De(n, i, R.name, R.lastModified, a).then(
                                function (y) {
                                  try {
                                    {
                                      let d = function () {
                                          if (f-- && (M > l || M > b)) {
                                            let T, N;
                                            return (
                                              (T = o
                                                ? 0.95 * I.width
                                                : I.width),
                                              (N = o
                                                ? 0.95 * I.height
                                                : I.height),
                                              ([O, m] = Pe(T, N)),
                                              m.drawImage(I, 0, 0, T, N),
                                              (a *=
                                                i === "image/png"
                                                  ? 0.85
                                                  : 0.95),
                                              De(
                                                O,
                                                i,
                                                R.name,
                                                R.lastModified,
                                                a,
                                              ).then(function (z) {
                                                try {
                                                  return (
                                                    (S = z),
                                                    be(I),
                                                    (I = O),
                                                    (M = S.size),
                                                    v(
                                                      Math.min(
                                                        99,
                                                        Math.floor(
                                                          ((L - M) / (L - l)) *
                                                            100,
                                                        ),
                                                      ),
                                                    ),
                                                    d
                                                  );
                                                } catch (W) {
                                                  return e(W);
                                                }
                                              }, e)
                                            );
                                          }
                                          return [1];
                                        },
                                        s = function () {
                                          return (
                                            be(I),
                                            be(O),
                                            be(x),
                                            be(n),
                                            be(g),
                                            v(100),
                                            u(S)
                                          );
                                        };
                                      if (
                                        ((p = y),
                                        c(),
                                        (U = p.size > l),
                                        (E = p.size > R.size),
                                        !U && !E)
                                      )
                                        return (v(100), u(p));
                                      var C;
                                      return (
                                        (b = R.size),
                                        (L = p.size),
                                        (M = L),
                                        (I = n),
                                        (o = !_.alwaysKeepResolution && U),
                                        (C = function (T) {
                                          for (; T; ) {
                                            if (T.then)
                                              return void T.then(C, e);
                                            try {
                                              if (T.pop) {
                                                if (T.length)
                                                  return T.pop()
                                                    ? s.call(this)
                                                    : T;
                                                T = d;
                                              } else T = T.call(this);
                                            } catch (N) {
                                              return e(N);
                                            }
                                          }
                                        }.bind(this))(d)
                                      );
                                    }
                                  } catch (d) {
                                    return e(d);
                                  }
                                }.bind(this),
                                e,
                              )
                            );
                          } catch (y) {
                            return e(y);
                          }
                        }.bind(this),
                        e,
                      )
                    );
                  } catch (A) {
                    return e(A);
                  }
                }.bind(this),
                e,
              )
            );
          } catch (w) {
            return e(w);
          }
        }.bind(this),
        e,
      )
    );
  });
}
const ar = `
let scriptImported = false
self.addEventListener('message', async (e) => {
  const { file, id, imageCompressionLibUrl, options } = e.data
  options.onProgress = (progress) => self.postMessage({ progress, id })
  try {
    if (!scriptImported) {
      // console.log('[worker] importScripts', imageCompressionLibUrl)
      self.importScripts(imageCompressionLibUrl)
      scriptImported = true
    }
    // console.log('[worker] self', self)
    const compressedFile = await imageCompression(file, options)
    self.postMessage({ file: compressedFile, id })
  } catch (e) {
    // console.error('[worker] error', e)
    self.postMessage({ error: e.message + '\\n' + e.stack, id })
  }
})
`;
let Ge;
function nr(R, _) {
  return new Promise((D, u) => {
    Ge ||
      (Ge = (function (f) {
        const l = [];
        return (l.push(f), URL.createObjectURL(new Blob(l)));
      })(ar));
    const e = new Worker(Ge);
    (e.addEventListener("message", function (f) {
      if (_.signal && _.signal.aborted) e.terminate();
      else if (f.data.progress === void 0) {
        if (f.data.error)
          return (u(new Error(f.data.error)), void e.terminate());
        (D(f.data.file), e.terminate());
      } else _.onProgress(f.data.progress);
    }),
      e.addEventListener("error", u),
      _.signal &&
        _.signal.addEventListener("abort", () => {
          (u(_.signal.reason), e.terminate());
        }),
      e.postMessage({
        file: R,
        imageCompressionLibUrl: _.libURL,
        options: { ..._, onProgress: void 0, signal: void 0 },
      }));
  });
}
function ce(R, _) {
  return new Promise(function (D, u) {
    let e, t, f, l, g, x;
    if (
      ((e = { ..._ }),
      (f = 0),
      ({ onProgress: l } = e),
      (e.maxSizeMB = e.maxSizeMB || Number.POSITIVE_INFINITY),
      (g = typeof e.useWebWorker != "boolean" || e.useWebWorker),
      delete e.useWebWorker,
      (e.onProgress = (i) => {
        ((f = i), typeof l == "function" && l(f));
      }),
      !(R instanceof Blob || R instanceof rr))
    )
      return u(new Error("The file given is not an instance of Blob or File"));
    if (!/^image/.test(R.type))
      return u(new Error("The file given is not an image"));
    if (
      ((x =
        typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope),
      !g || typeof Worker != "function" || x)
    )
      return ut(R, e).then(
        function (i) {
          try {
            return ((t = i), a.call(this));
          } catch (p) {
            return u(p);
          }
        }.bind(this),
        u,
      );
    var r = function () {
        try {
          return a.call(this);
        } catch (i) {
          return u(i);
        }
      }.bind(this),
      n = function (i) {
        try {
          return ut(R, e).then(function (p) {
            try {
              return ((t = p), r());
            } catch (U) {
              return u(U);
            }
          }, u);
        } catch (p) {
          return u(p);
        }
      };
    try {
      return (
        (e.libURL =
          e.libURL ||
          "https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js"),
        nr(R, e).then(function (i) {
          try {
            return ((t = i), r());
          } catch {
            return n();
          }
        }, n)
      );
    } catch {
      n();
    }
    function a() {
      try {
        ((t.name = R.name), (t.lastModified = R.lastModified));
      } catch {}
      try {
        e.preserveExif &&
          R.type === "image/jpeg" &&
          (!e.fileType || (e.fileType && e.fileType === R.type)) &&
          (t = mt(R, t));
      } catch {}
      return D(t);
    }
  });
}
((ce.getDataUrlFromFile = yt),
  (ce.getFilefromDataUrl = qe),
  (ce.loadImage = vt),
  (ce.drawImageInCanvas = kt),
  (ce.drawFileInCanvas = Oe),
  (ce.canvasToFile = De),
  (ce.getExifOrientation = jt),
  (ce.handleMaxWidthOrHeight = At),
  (ce.followExifOrientation = Nt),
  (ce.cleanupCanvasMemory = be),
  (ce.isAutoOrientationInBrowser = Fe),
  (ce.approximateBelowMaximumCanvasSizeOfBrowser = wt),
  (ce.copyExifWithoutOrientation = mt),
  (ce.getBrowserName = Se),
  (ce.version = "2.0.2"));
const ht = Yt("http://localhost:5000"),
  pt = [
    "Media Review",
    "Expert Insights",
    "Reflections",
    "Technology",
    "Events",
    "Digest",
    "Innovation",
    "Trends",
    "General",
    "Reports",
    "Archives",
  ],
  sr = ["Admin", "Employee", "Client"];
function dr() {
  const R = Vt(),
    [_, D] = te.useState([]),
    [u, e] = te.useState([]),
    [t, f] = te.useState({
      total: 0,
      featured: 0,
      categories: {},
      views: 0,
      totalViews: 0,
    }),
    [l, g] = te.useState({
      siteTitle: "",
      defaultCategory: "General",
      theme: "light",
    }),
    [x, r] = te.useState({
      title: "",
      content: "",
      author: "",
      category: "General",
      featured: !1,
      images: [],
      sourceUrl: "",
      videoUrl: "",
      imageLabels: {},
    }),
    [n, a] = te.useState(null),
    [i, p] = te.useState(!1),
    [U, E] = te.useState(!1),
    [b, L] = te.useState({ name: "", email: "", password: "", role: "Client" }),
    [M, S] = te.useState(null),
    [O, m] = te.useState(!1),
    I = qt.useRef(null),
    [o, c] = te.useState(
      () => localStorage.getItem("adminMenuOpen") || "dashboard",
    ),
    [v, k] = te.useState(!1),
    [w, A] = te.useState(!1),
    [y, C] = te.useState({ articles: !0, users: !0, settings: !0 }),
    [d, s] = te.useState({ articles: "", users: "", settings: "" }),
    T = localStorage.getItem("token");
  te.useEffect(() => localStorage.setItem("adminMenuOpen", o), [o]);
  const N = te.useCallback(
      async (j, B, Q, G) => {
        try {
          const q = { headers: { Authorization: `Bearer ${T}` } };
          let K;
          const ae = j.toLowerCase();
          return (
            ae === "get" || ae === "delete"
              ? (K = await Me[ae](B, q))
              : (K = await Me[ae](B, Q, q)),
            K.data
          );
        } catch (q) {
          throw (
            s((K) => ({ ...K, [G]: q.response?.data?.message || q.message })),
            q.response?.status === 401 && R("/login"),
            q
          );
        }
      },
      [T, R],
    ),
    z = te.useCallback(async () => {
      C((j) => ({ ...j, articles: !0 }));
      try {
        const j = await N("get", "/articles", null, "articles"),
          B = Array.isArray(j.articles) ? j.articles : [];
        D(B);
        const Q = B.reduce((G, q) => G + (q.views || 0), 0);
        f({
          total: B.length,
          featured: B.filter((G) => G.featured).length,
          categories: B.reduce((G, q) => {
            const K = q.category || "General";
            return ((G[K] = (G[K] || 0) + 1), G);
          }, {}),
          views: Q,
          totalViews: Q,
        });
      } finally {
        C((j) => ({ ...j, articles: !1 }));
      }
    }, [N]),
    W = te.useCallback(async () => {
      C((j) => ({ ...j, users: !0 }));
      try {
        const j = await N("get", "/users", null, "users");
        e(Array.isArray(j.users) ? j.users : []);
      } finally {
        C((j) => ({ ...j, users: !1 }));
      }
    }, [N]),
    H = te.useCallback(async () => {
      C((j) => ({ ...j, settings: !0 }));
      try {
        const j = await N("get", "/settings", null, "settings");
        g(j || { siteTitle: "", defaultCategory: "General", theme: "light" });
      } finally {
        C((j) => ({ ...j, settings: !1 }));
      }
    }, [N]);
  (te.useEffect(() => {
    if (!T) {
      R("/login");
      return;
    }
    ((o === "dashboard" || o === "articles") && z(),
      o === "users" && W(),
      o === "settings" && H());
  }, [o, T, z, W, H]),
    te.useEffect(
      () => (
        ht.on("viewsUpdated", () =>
          f((j) => ({ ...j, totalViews: j.totalViews + 1 })),
        ),
        () => ht.off("viewsUpdated")
      ),
      [],
    ));
  const $ = async (j) => {
      (j.preventDefault(), A(!0));
      try {
        (n
          ? await N("put", `/articles/${n}`, x, "articles")
          : await N("post", "/articles", x, "articles"),
          await z(),
          r({
            title: "",
            content: "",
            author: "",
            category: "General",
            featured: !1,
            images: [],
            sourceUrl: "",
            videoUrl: "",
            imageLabels: {},
          }),
          a(null));
      } finally {
        A(!1);
      }
    },
    P = async (j) => {
      try {
        const B = await N("get", `/articles/${j._id}`, null, "articles"),
          Q = B.article || B;
        (r({
          title: Q.title,
          content: Q.content,
          author: Q.author || "",
          category: Q.category,
          featured: Q.featured,
          images: Q.images || (Q.image ? [Q.image] : []),
          sourceUrl: Q.sourceUrl || "",
          videoUrl: Q.videoUrl || "",
          imageLabels: Q.imageLabels || {},
        }),
          a(Q._id),
          window.scrollTo({ top: 0, behavior: "smooth" }));
      } catch {
        alert("Failed to load article");
      }
    },
    F = async () => {
      A(!0);
      try {
        const j = _.map((B, Q) => ({ id: B._id, order: Q }));
        (await N("post", "/articles/reorder", { orders: j }, "articles"),
          E(!1),
          alert("Article sequence updated!"));
      } catch {
        alert("Reorder failed");
      } finally {
        A(!1);
      }
    },
    V = async (j) => {
      const B = Array.from(j.target.files || []);
      if (B.length !== 0) {
        A(!0);
        try {
          const Q = await Promise.all(
            B.map(async (G) => {
              const q = await ce(G, { maxSizeMB: 0.8, maxWidthOrHeight: 1200 }),
                K = new FormData();
              return (
                K.append("file", q, G.name),
                (
                  await Me.post("/upload", K, {
                    headers: {
                      Authorization: `Bearer ${T}`,
                      "Content-Type": "multipart/form-data",
                    },
                  })
                ).data.url
              );
            }),
          );
          r((G) => ({ ...G, images: [...G.images, ...Q] }));
        } catch {
          alert("Upload failed");
        } finally {
          A(!1);
        }
      }
    },
    J = (j) => {
      const B = I.current;
      if (!B) return;
      const Q = x.imageLabels[j] || "Editorial Media ",
        G = B.selectionStart,
        q = B.selectionEnd,
        K = x.content,
        ae = K.substring(0, G),
        se = K.substring(q, K.length),
        le = `
<figure class="my-12 group">
  <div class="rounded-[2rem] overflow-hidden border-4 border-white dark:border-white/5 shadow-2xl relative">
    <img src="${j}" class="w-full h-auto object-cover" />
  </div>
  <figcaption class="mt-4 text-center text-xs font-bold uppercase tracking-[0.3em] text-taa-primary/60 dark:text-white/40">
    ${Q}
  </figcaption>
</figure>
`;
      (r({ ...x, content: ae + le + se }),
        setTimeout(() => {
          B.focus();
          const ne = G + le.length;
          B.setSelectionRange(ne, ne);
        }, 0));
    },
    Z = async (j) => {
      (j.preventDefault(), A(!0));
      try {
        (M
          ? await N("put", `/users/${M}`, b, "users")
          : await N("post", "/users", b, "users"),
          await W(),
          m(!1),
          L({ name: "", email: "", password: "", role: "Client" }),
          S(null));
      } catch (B) {
        alert(B.response?.data?.message || "Operation failed");
      } finally {
        A(!1);
      }
    },
    Y = (j) => {
      (S(j._id),
        L({ name: j.name, email: j.email, role: j.role, password: "" }),
        m(!0));
    },
    X = async (j) => {
      if (window.confirm("Delete this user?"))
        try {
          (await N("delete", `/users/${j}`, null, "users"), await W());
        } catch {
          alert("Delete failed");
        }
    },
    re = async (j) => {
      try {
        (await N(
          "put",
          `/users/${j._id}/suspend`,
          { suspended: !j.suspended },
          "users",
        ),
          await W());
      } catch {
        alert("Status update failed");
      }
    },
    ie = [
      { id: "dashboard", label: "Dashboard", icon: St },
      { id: "articles", label: "Articles", icon: Xe },
      { id: "users", label: "Users", icon: Je },
      { id: "settings", label: "Settings", icon: et },
    ],
    ge = te.useMemo(() => {
      const j = _.reduce((B, Q) => {
        const G = Q.category || "General";
        return ((B[G] = (B[G] || 0) + (Q.views || 0)), B);
      }, {});
      return Object.keys(j)
        .map((B) => ({ name: B, views: j[B] }))
        .sort((B, Q) => Q.views - B.views);
    }, [_]);
  return h.jsxs("div", {
    className:
      "min-h-screen bg-taa-surface dark:bg-taa-dark flex transition-colors duration-300 overflow-hidden",
    children: [
      h.jsx("aside", {
        className: `fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0f172a] border-r border-taa-primary/10 dark:border-white/10 z-[101] transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] md:translate-x-0 md:static md:w-80 md:flex-shrink-0 ${v ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`,
        children: h.jsxs("div", {
          className: "h-full flex flex-col p-8 overflow-y-auto",
          children: [
            h.jsxs("div", {
              className: "mb-12 flex items-center justify-between",
              children: [
                h.jsx("span", {
                  className:
                    "text-3xl font-black text-taa-primary tracking-tighter",
                  children: "ADMIN",
                }),
                h.jsx("button", {
                  className:
                    "md:hidden p-2 text-gray-500 hover:text-taa-primary transition-colors",
                  onClick: () => k(!1),
                  children: h.jsx(Ze, { size: 24 }),
                }),
              ],
            }),
            h.jsxs("nav", {
              className: "flex-1 space-y-3",
              children: [
                h.jsxs(Kt, {
                  to: "/",
                  className:
                    "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-taa-primary/5 dark:hover:bg-white/5 transition-all mb-6 border-b border-taa-primary/10 pb-6",
                  children: [
                    h.jsx(Et, { size: 20, className: "text-taa-primary" }),
                    h.jsx("span", { children: "Back to Site" }),
                  ],
                }),
                ie.map((j) =>
                  h.jsxs(
                    "button",
                    {
                      onClick: () => {
                        (c(j.id), k(!1));
                      },
                      className: `w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${o === j.id ? "bg-taa-primary text-white shadow-lg shadow-taa-primary/30 scale-[1.02]" : "text-gray-500 dark:text-gray-400 hover:bg-taa-primary/5 dark:hover:bg-white/5 hover:text-taa-primary dark:hover:text-taa-accent"}`,
                      children: [h.jsx(j.icon, { size: 20 }), j.label],
                    },
                    j.id,
                  ),
                ),
              ],
            }),
            h.jsx("div", {
              className: "mt-auto pt-8 border-t border-taa-primary/10",
              children: h.jsxs("button", {
                onClick: () => {
                  (localStorage.clear(), R("/"));
                },
                className:
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-500/5 transition-all",
                children: [h.jsx(Ft, { size: 20 }), " Logout"],
              }),
            }),
          ],
        }),
      }),
      h.jsxs("main", {
        className:
          "flex-1 h-screen overflow-y-auto relative bg-taa-surface dark:bg-taa-dark transition-colors duration-300",
        children: [
          h.jsxs("header", {
            className:
              "sticky top-0 z-30 bg-taa-surface/80 dark:bg-taa-dark/80 backdrop-blur-xl border-b border-taa-primary/5 px-6 md:px-12 py-6 flex items-center justify-between",
            children: [
              h.jsx("h1", {
                className:
                  "text-2xl md:text-4xl font-black text-taa-dark dark:text-white capitalize tracking-tight",
                children: o,
              }),
              h.jsxs("div", {
                className: "flex items-center gap-4",
                children: [
                  o === "articles" &&
                    h.jsxs("button", {
                      onClick: () => p(!i),
                      className: `px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all flex items-center gap-2 ${i ? "bg-taa-accent text-white" : "bg-taa-primary/10 text-taa-primary"}`,
                      children: [
                        i ? h.jsx(Ze, { size: 14 }) : h.jsx(tt, { size: 14 }),
                        " ",
                        i ? "Done Reordering" : "Arrange Order",
                      ],
                    }),
                  h.jsxs("div", {
                    className:
                      "hidden sm:flex items-center gap-3 bg-taa-primary/5 px-4 py-2 rounded-xl border border-taa-primary/10",
                    children: [
                      h.jsx($e, { size: 16, className: "text-taa-primary" }),
                      h.jsxs("span", {
                        className:
                          "text-xs font-black text-taa-primary uppercase",
                        children: [t.totalViews, " Views"],
                      }),
                    ],
                  }),
                  h.jsx("button", {
                    className:
                      "md:hidden p-3 rounded-xl bg-taa-primary text-white",
                    onClick: () => k(!0),
                    children: h.jsx(_t, { size: 20 }),
                  }),
                ],
              }),
            ],
          }),
          h.jsxs("div", {
            className: "p-6 md:p-12 pb-32",
            children: [
              o === "articles" &&
                h.jsxs("div", {
                  className: "space-y-12",
                  children: [
                    h.jsx(rt, {
                      children:
                        i &&
                        h.jsxs(Ce.div, {
                          initial: { height: 0, opacity: 0 },
                          animate: { height: "auto", opacity: 1 },
                          exit: { height: 0, opacity: 0 },
                          className:
                            "glass-card p-6 md:p-10 rounded-[2.5rem] border-2 border-taa-accent/20 bg-taa-accent/5 overflow-hidden",
                          children: [
                            h.jsxs("div", {
                              className:
                                "flex items-center justify-between mb-8",
                              children: [
                                h.jsxs("div", {
                                  children: [
                                    h.jsx("h3", {
                                      className:
                                        "text-2xl font-black text-taa-dark dark:text-white",
                                      children: "Arrange Article Order",
                                    }),
                                    h.jsx("p", {
                                      className:
                                        "text-xs font-bold text-gray-500 uppercase tracking-widest mt-1",
                                      children:
                                        "Drag handles to change placement on home feed",
                                    }),
                                  ],
                                }),
                                U &&
                                  h.jsxs("button", {
                                    onClick: F,
                                    disabled: w,
                                    className:
                                      "px-8 py-3 bg-taa-accent text-white rounded-xl font-black text-xs shadow-xl shadow-taa-accent/20 flex items-center gap-2 active:scale-95 transition-all",
                                    children: [
                                      h.jsx(It, { size: 16 }),
                                      " ",
                                      w ? "Saving..." : "Save Sequence",
                                    ],
                                  }),
                              ],
                            }),
                            h.jsx(Rt, {
                              axis: "y",
                              values: _,
                              onReorder: (j) => {
                                (D(j), E(!0));
                              },
                              className: "space-y-3",
                              children: _.map((j) =>
                                h.jsxs(
                                  Mt,
                                  {
                                    value: j,
                                    className:
                                      "bg-white dark:bg-[#1e293b] p-4 rounded-2xl shadow-md flex items-center gap-6 border border-taa-primary/5 cursor-grab active:cursor-grabbing",
                                    children: [
                                      h.jsx(tt, {
                                        className: "text-gray-300",
                                        size: 20,
                                      }),
                                      h.jsx("div", {
                                        className:
                                          "w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-black/20",
                                        children: h.jsx("img", {
                                          src: (
                                            j.images?.[0] || j.image
                                          )?.startsWith("/uploads/")
                                            ? `${Qe}${j.images?.[0] || j.image}`
                                            : j.images?.[0] || j.image,
                                          className:
                                            "w-full h-full object-cover",
                                        }),
                                      }),
                                      h.jsx("span", {
                                        className:
                                          "font-black text-taa-dark dark:text-white truncate",
                                        children: j.title,
                                      }),
                                      h.jsx("span", {
                                        className:
                                          "ml-auto text-[10px] font-black text-taa-primary uppercase bg-taa-primary/5 px-3 py-1 rounded-full",
                                        children: j.category,
                                      }),
                                    ],
                                  },
                                  j._id,
                                ),
                              ),
                            }),
                          ],
                        }),
                    }),
                    h.jsxs("div", {
                      className:
                        "glass-card p-6 md:p-10 rounded-[2.5rem] border-taa-primary/5 shadow-2xl",
                      children: [
                        h.jsxs("h3", {
                          className:
                            "text-2xl font-black text-taa-dark dark:text-white mb-8 flex items-center gap-3",
                          children: [
                            h.jsx(at, { className: "text-taa-primary" }),
                            " ",
                            n ? "Update Story" : "New Story",
                          ],
                        }),
                        h.jsxs("form", {
                          onSubmit: $,
                          className: "space-y-6",
                          children: [
                            h.jsxs("div", {
                              className: "grid md:grid-cols-2 gap-6",
                              children: [
                                h.jsxs("div", {
                                  className: "space-y-2",
                                  children: [
                                    h.jsx("label", {
                                      className:
                                        "text-xs font-black text-gray-400 uppercase ml-2",
                                      children: "Headline",
                                    }),
                                    h.jsx("input", {
                                      type: "text",
                                      className:
                                        "w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white shadow-inner",
                                      value: x.title,
                                      onChange: (j) =>
                                        r({ ...x, title: j.target.value }),
                                      required: !0,
                                    }),
                                  ],
                                }),
                                h.jsxs("div", {
                                  className: "space-y-2",
                                  children: [
                                    h.jsx("label", {
                                      className:
                                        "text-xs font-black text-gray-400 uppercase ml-2",
                                      children: "Topic",
                                    }),
                                    h.jsx("select", {
                                      className:
                                        "w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white appearance-none shadow-inner",
                                      value: x.category,
                                      onChange: (j) =>
                                        r({ ...x, category: j.target.value }),
                                      children: pt.map((j) =>
                                        h.jsx(
                                          "option",
                                          { value: j, children: j },
                                          j,
                                        ),
                                      ),
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            h.jsxs("div", {
                              className: "space-y-2",
                              children: [
                                h.jsxs("label", {
                                  className:
                                    "text-xs font-black text-gray-400 uppercase ml-2",
                                  children: [
                                    "Body Content ",
                                    h.jsx("span", {
                                      className:
                                        "lowercase font-normal opacity-60",
                                      children:
                                        "(Use the media library below to insert high-end image blocks)",
                                    }),
                                  ],
                                }),
                                h.jsx("textarea", {
                                  ref: I,
                                  rows: "12",
                                  className:
                                    "w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-6 outline-none font-medium text-taa-dark dark:text-white leading-relaxed shadow-inner",
                                  value: x.content,
                                  onChange: (j) =>
                                    r({ ...x, content: j.target.value }),
                                  required: !0,
                                }),
                              ],
                            }),
                            h.jsxs("div", {
                              className:
                                "space-y-6 bg-taa-primary/5 p-8 rounded-[3rem] border border-taa-primary/10",
                              children: [
                                h.jsxs("div", {
                                  className:
                                    "flex items-center justify-between mb-2",
                                  children: [
                                    h.jsxs("div", {
                                      children: [
                                        h.jsxs("h4", {
                                          className:
                                            "text-xl font-black text-taa-dark dark:text-white flex items-center gap-3",
                                          children: [
                                            h.jsx(Sparkles, {
                                              className: "text-taa-primary",
                                              size: 20,
                                            }),
                                            " Story Delegates Hub",
                                          ],
                                        }),
                                        h.jsx("p", {
                                          className:
                                            "text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1",
                                          children:
                                            "Manage, Name & Arrange Visual Story Elements",
                                        }),
                                      ],
                                    }),
                                    h.jsxs("label", {
                                      className:
                                        "px-6 py-3 bg-taa-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-taa-primary/20 flex items-center gap-2",
                                      children: [
                                        h.jsx(at, { size: 14 }),
                                        " Add New Delegate",
                                        h.jsx("input", {
                                          type: "file",
                                          multiple: !0,
                                          className: "hidden",
                                          onChange: V,
                                          accept: "image/*",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                h.jsxs("div", {
                                  className:
                                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8",
                                  children: [
                                    x.images.map((j, B) =>
                                      h.jsxs(
                                        Ce.div,
                                        {
                                          initial: { opacity: 0, scale: 0.9 },
                                          animate: { opacity: 1, scale: 1 },
                                          className:
                                            "relative group bg-white dark:bg-black/20 p-4 rounded-[2.5rem] border border-taa-primary/10 shadow-xl hover:border-taa-primary/30 transition-all",
                                          children: [
                                            h.jsxs("div", {
                                              className:
                                                "relative aspect-[16/10] rounded-[1.5rem] overflow-hidden mb-4 shadow-inner bg-taa-dark/5",
                                              children: [
                                                h.jsx("img", {
                                                  src: j.startsWith("data:")
                                                    ? j
                                                    : `${Qe}${j}`,
                                                  className:
                                                    "w-full h-full object-cover transition-transform group-hover:scale-105",
                                                  alt: `Delegate ${B}`,
                                                }),
                                                h.jsxs("div", {
                                                  className:
                                                    "absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0",
                                                  children: [
                                                    h.jsx("button", {
                                                      type: "button",
                                                      onClick: () =>
                                                        r((Q) => ({
                                                          ...Q,
                                                          images:
                                                            Q.images.filter(
                                                              (G, q) => q !== B,
                                                            ),
                                                        })),
                                                      className:
                                                        "p-2 bg-red-500 text-white rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all",
                                                      children: h.jsx(We, {
                                                        size: 14,
                                                      }),
                                                    }),
                                                    h.jsx("button", {
                                                      type: "button",
                                                      onClick: () => J(j),
                                                      className:
                                                        "px-3 py-2 bg-taa-primary text-white rounded-lg text-[10px] font-black shadow-lg hover:scale-110 active:scale-95 transition-all",
                                                      children:
                                                        "PLACE IN STORY",
                                                    }),
                                                  ],
                                                }),
                                                B === 0 &&
                                                  h.jsx("span", {
                                                    className:
                                                      "absolute bottom-3 left-3 bg-taa-accent text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg",
                                                    children: "Primary Cover",
                                                  }),
                                              ],
                                            }),
                                            h.jsxs("div", {
                                              className: "px-2 space-y-3",
                                              children: [
                                                h.jsxs("div", {
                                                  children: [
                                                    h.jsx("label", {
                                                      className:
                                                        "text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block",
                                                      children:
                                                        "Delegate Identity / Name",
                                                    }),
                                                    h.jsxs("div", {
                                                      className:
                                                        "relative group/input",
                                                      children: [
                                                        h.jsx(Tt, {
                                                          size: 12,
                                                          className:
                                                            "absolute left-3 top-1/2 -translate-y-1/2 text-taa-primary group-focus-within/input:scale-110 transition-transform",
                                                        }),
                                                        h.jsx("input", {
                                                          type: "text",
                                                          placeholder:
                                                            "What do we call this image?",
                                                          value:
                                                            x.imageLabels[j] ||
                                                            "",
                                                          onChange: (Q) =>
                                                            r((G) => ({
                                                              ...G,
                                                              imageLabels: {
                                                                ...G.imageLabels,
                                                                [j]: Q.target
                                                                  .value,
                                                              },
                                                            })),
                                                          className:
                                                            "w-full pl-9 pr-4 py-2 bg-taa-surface dark:bg-white/5 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-taa-primary transition-all",
                                                        }),
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                                h.jsxs("div", {
                                                  className:
                                                    "flex items-center justify-between gap-4",
                                                  children: [
                                                    h.jsxs("div", {
                                                      className:
                                                        "flex gap-1.5 overflow-hidden",
                                                      children: [
                                                        h.jsx("span", {
                                                          className:
                                                            "w-1.5 h-1.5 rounded-full bg-taa-primary animate-pulse",
                                                        }),
                                                        h.jsx("span", {
                                                          className:
                                                            "w-1.5 h-1.5 rounded-full bg-taa-accent",
                                                        }),
                                                        h.jsx("span", {
                                                          className:
                                                            "w-1.5 h-1.5 rounded-full bg-taa-primary/30",
                                                        }),
                                                      ],
                                                    }),
                                                    h.jsx("p", {
                                                      className:
                                                        "text-[9px] font-black text-taa-primary uppercase tracking-widest opacity-60",
                                                      children:
                                                        "Verified Media Delegate",
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        },
                                        B,
                                      ),
                                    ),
                                    x.images.length === 0 &&
                                      h.jsxs("div", {
                                        className:
                                          "col-span-full py-20 border-2 border-dashed border-taa-primary/10 rounded-[3rem] flex flex-col items-center justify-center text-center",
                                        children: [
                                          h.jsx(zt, {
                                            size: 48,
                                            className:
                                              "text-taa-primary/20 mb-4",
                                          }),
                                          h.jsx("p", {
                                            className:
                                              "text-gray-400 font-bold text-sm uppercase tracking-widest",
                                            children:
                                              "No Story Delegates Provisioned",
                                          }),
                                          h.jsx("p", {
                                            className:
                                              "text-[10px] text-gray-500 mt-2",
                                            children:
                                              "Upload images to begin building your visual story.",
                                          }),
                                        ],
                                      }),
                                  ],
                                }),
                              ],
                            }),
                            h.jsxs("div", {
                              className:
                                "grid md:grid-cols-2 gap-6 pt-6 border-t border-taa-primary/5",
                              children: [
                                h.jsxs("div", {
                                  className: "space-y-4",
                                  children: [
                                    h.jsx("label", {
                                      className:
                                        "text-xs font-black text-gray-400 uppercase ml-2",
                                      children: "Video & External Reference",
                                    }),
                                    h.jsx("input", {
                                      type: "text",
                                      placeholder: "Video URL (YouTube/Vimeo)",
                                      className:
                                        "w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-xl p-3 outline-none font-bold text-sm text-taa-dark dark:text-white shadow-inner",
                                      value: x.videoUrl,
                                      onChange: (j) =>
                                        r({ ...x, videoUrl: j.target.value }),
                                    }),
                                    h.jsx("input", {
                                      type: "text",
                                      placeholder: "External Source Link",
                                      className:
                                        "w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-xl p-3 outline-none font-bold text-sm text-taa-dark dark:text-white shadow-inner",
                                      value: x.sourceUrl,
                                      onChange: (j) =>
                                        r({ ...x, sourceUrl: j.target.value }),
                                    }),
                                  ],
                                }),
                                h.jsxs("div", {
                                  className:
                                    "flex flex-col justify-between items-end",
                                  children: [
                                    h.jsxs("label", {
                                      className:
                                        "flex items-center gap-3 cursor-pointer select-none bg-taa-primary/5 px-6 py-4 rounded-2xl border border-taa-primary/10 w-full md:w-auto",
                                      children: [
                                        h.jsx("input", {
                                          type: "checkbox",
                                          className:
                                            "w-5 h-5 rounded-lg accent-taa-primary",
                                          checked: x.featured,
                                          onChange: (j) =>
                                            r({
                                              ...x,
                                              featured: j.target.checked,
                                            }),
                                        }),
                                        h.jsx("span", {
                                          className:
                                            "font-black text-sm text-taa-dark dark:text-white uppercase tracking-widest",
                                          children: "Mark as Featured",
                                        }),
                                      ],
                                    }),
                                    h.jsxs("div", {
                                      className: "flex gap-4 mt-6",
                                      children: [
                                        n &&
                                          h.jsx("button", {
                                            type: "button",
                                            onClick: () => {
                                              (a(null),
                                                r({
                                                  title: "",
                                                  content: "",
                                                  author: "",
                                                  category: "General",
                                                  featured: !1,
                                                  images: [],
                                                  sourceUrl: "",
                                                  videoUrl: "",
                                                  imageLabels: {},
                                                }));
                                            },
                                            className:
                                              "px-8 py-4 font-black text-gray-400 uppercase text-xs tracking-widest",
                                            children: "Discard Changes",
                                          }),
                                        h.jsx("button", {
                                          disabled: w,
                                          className:
                                            "px-10 py-4 bg-taa-primary text-white rounded-2xl font-black shadow-2xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 text-sm uppercase tracking-widest",
                                          children: w
                                            ? "Processing..."
                                            : n
                                              ? "Update Story"
                                              : "Publish Story",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    h.jsx("div", {
                      className:
                        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8",
                      children: _.map((j) =>
                        h.jsxs(
                          "div",
                          {
                            className:
                              "glass-card rounded-3xl overflow-hidden flex flex-col group border-taa-primary/5 shadow-xl hover:shadow-2xl transition-all",
                            children: [
                              h.jsxs("div", {
                                className:
                                  "h-48 relative overflow-hidden bg-taa-dark",
                                children: [
                                  h.jsx("img", {
                                    src: (j.images?.[0] || j.image)?.startsWith(
                                      "/uploads/",
                                    )
                                      ? `${Qe}${j.images?.[0] || j.image}`
                                      : j.images?.[0] ||
                                        j.image ||
                                        "https://via.placeholder.com/400x200",
                                    className:
                                      "w-full h-full object-cover transition-transform group-hover:scale-110 opacity-80",
                                    alt: j.title,
                                  }),
                                  h.jsxs("div", {
                                    className:
                                      "absolute top-4 left-4 flex gap-2",
                                    children: [
                                      h.jsx("span", {
                                        className:
                                          "px-3 py-1 bg-taa-primary text-white text-[8px] font-black uppercase rounded-lg shadow-lg",
                                        children: j.category,
                                      }),
                                      j.featured &&
                                        h.jsx("span", {
                                          className:
                                            "px-3 py-1 bg-taa-accent text-white text-[8px] font-black uppercase rounded-lg shadow-lg",
                                          children: "Featured",
                                        }),
                                    ],
                                  }),
                                  h.jsxs("div", {
                                    className:
                                      "absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0",
                                    children: [
                                      h.jsx("button", {
                                        onClick: () => P(j),
                                        className:
                                          "p-3 bg-white text-taa-dark rounded-xl shadow-2xl hover:bg-taa-primary hover:text-white transition-all",
                                        children: h.jsx(nt, { size: 16 }),
                                      }),
                                      h.jsx("button", {
                                        onClick: () =>
                                          Me.delete(`/articles/${j._id}`, {
                                            headers: {
                                              Authorization: `Bearer ${T}`,
                                            },
                                          }).then(z),
                                        className:
                                          "p-3 bg-white text-red-500 rounded-xl shadow-2xl hover:bg-red-500 hover:text-white transition-all",
                                        children: h.jsx(We, { size: 16 }),
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              h.jsxs("div", {
                                className: "p-6 flex-1 flex flex-col",
                                children: [
                                  h.jsx("h4", {
                                    className:
                                      "font-black text-taa-dark dark:text-white leading-tight mb-4 group-hover:text-taa-primary transition-colors",
                                    children: j.title,
                                  }),
                                  h.jsxs("div", {
                                    className:
                                      "mt-auto flex items-center justify-between pt-4 border-t border-taa-primary/5",
                                    children: [
                                      h.jsxs("span", {
                                        className:
                                          "text-[10px] font-bold text-gray-400 uppercase tracking-widest",
                                        children: ["Order: #", j.order || 0],
                                      }),
                                      h.jsxs("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                          h.jsxs("span", {
                                            className:
                                              "text-[10px] font-black text-taa-primary bg-taa-primary/5 px-2 py-1 rounded-md",
                                            children: [j.views || 0, " VIEWS"],
                                          }),
                                          h.jsx("a", {
                                            href: `/article/${j.slug || j._id}`,
                                            target: "_blank",
                                            rel: "noreferrer",
                                            className:
                                              "text-gray-400 hover:text-taa-primary transition-colors",
                                            children: h.jsx(Lt, { size: 16 }),
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          },
                          j._id,
                        ),
                      ),
                    }),
                  ],
                }),
              o === "dashboard" &&
                h.jsxs(Ce.div, {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  className: "space-y-12",
                  children: [
                    h.jsx("div", {
                      className:
                        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
                      children: [
                        {
                          label: "Articles",
                          val: t.total,
                          icon: Xe,
                          color: "text-blue-500",
                        },
                        {
                          label: "Featured",
                          val: t.featured,
                          icon: Ot,
                          color: "text-green-500",
                        },
                        {
                          label: "Categories",
                          val: Object.keys(t.categories).length,
                          icon: $e,
                          color: "text-purple-500",
                        },
                        {
                          label: "Views",
                          val: t.totalViews,
                          icon: Dt,
                          color: "text-taa-primary",
                        },
                      ].map((j, B) =>
                        h.jsxs(
                          "div",
                          {
                            className:
                              "glass-card p-6 rounded-[2.5rem] border-taa-primary/5 shadow-xl",
                            children: [
                              h.jsx(j.icon, {
                                className: `${j.color} mb-4`,
                                size: 24,
                              }),
                              h.jsx("p", {
                                className:
                                  "text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-1",
                                children: j.label,
                              }),
                              h.jsx("h3", {
                                className:
                                  "text-3xl font-black text-taa-dark dark:text-white tracking-tighter",
                                children: j.val,
                              }),
                            ],
                          },
                          B,
                        ),
                      ),
                    }),
                    h.jsxs("div", {
                      className: "grid lg:grid-cols-2 gap-8",
                      children: [
                        h.jsxs("div", {
                          className:
                            "glass-card p-8 rounded-[3rem] border-taa-primary/5 shadow-2xl h-[400px]",
                          children: [
                            h.jsxs("h3", {
                              className:
                                "text-xl font-black text-taa-dark dark:text-white mb-8 flex items-center gap-3",
                              children: [
                                h.jsx(Pt, {
                                  className: "text-taa-primary",
                                  size: 20,
                                }),
                                " Audience Reach",
                              ],
                            }),
                            h.jsx(st, {
                              width: "100%",
                              height: "80%",
                              children: h.jsxs(Ht, {
                                data: ge,
                                children: [
                                  h.jsx(it, {
                                    strokeDasharray: "3 3",
                                    vertical: !1,
                                    stroke: "#e5e7eb",
                                    strokeOpacity: 0.5,
                                  }),
                                  h.jsx(lt, {
                                    dataKey: "name",
                                    axisLine: !1,
                                    tickLine: !1,
                                    tick: { fontSize: 9, fontWeight: "bold" },
                                  }),
                                  h.jsx(ot, {
                                    axisLine: !1,
                                    tickLine: !1,
                                    tick: { fontSize: 9 },
                                  }),
                                  h.jsx(ct, {
                                    contentStyle: {
                                      borderRadius: "16px",
                                      border: "none",
                                      boxShadow:
                                        "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                                    },
                                  }),
                                  h.jsx(Bt, {
                                    dataKey: "views",
                                    radius: [6, 6, 0, 0],
                                    barSize: 40,
                                    children: ge.map((j, B) =>
                                      h.jsx(
                                        $t,
                                        {
                                          fill:
                                            B % 2 === 0 ? "#1E6B2B" : "#77BFA1",
                                        },
                                        B,
                                      ),
                                    ),
                                  }),
                                ],
                              }),
                            }),
                          ],
                        }),
                        h.jsxs("div", {
                          className:
                            "glass-card p-8 rounded-[3rem] border-taa-primary/5 shadow-2xl h-[400px]",
                          children: [
                            h.jsxs("h3", {
                              className:
                                "text-xl font-black text-taa-dark dark:text-white mb-8 flex items-center gap-3",
                              children: [
                                h.jsx($e, {
                                  className: "text-taa-accent",
                                  size: 20,
                                }),
                                " Growth Trend",
                              ],
                            }),
                            h.jsx(st, {
                              width: "100%",
                              height: "80%",
                              children: h.jsxs(Wt, {
                                data: _.slice(0, 10)
                                  .reverse()
                                  .map((j) => ({
                                    name: j.title.slice(0, 10),
                                    views: j.views,
                                  })),
                                children: [
                                  h.jsx("defs", {
                                    children: h.jsxs("linearGradient", {
                                      id: "colorV",
                                      x1: "0",
                                      y1: "0",
                                      x2: "0",
                                      y2: "1",
                                      children: [
                                        h.jsx("stop", {
                                          offset: "5%",
                                          stopColor: "#77BFA1",
                                          stopOpacity: 0.3,
                                        }),
                                        h.jsx("stop", {
                                          offset: "95%",
                                          stopColor: "#77BFA1",
                                          stopOpacity: 0,
                                        }),
                                      ],
                                    }),
                                  }),
                                  h.jsx(it, {
                                    strokeDasharray: "3 3",
                                    vertical: !1,
                                    stroke: "#e5e7eb",
                                    strokeOpacity: 0.5,
                                  }),
                                  h.jsx(lt, {
                                    dataKey: "name",
                                    axisLine: !1,
                                    tickLine: !1,
                                    tick: { fontSize: 9, fontWeight: "bold" },
                                  }),
                                  h.jsx(ot, {
                                    axisLine: !1,
                                    tickLine: !1,
                                    tick: { fontSize: 9 },
                                  }),
                                  h.jsx(ct, {}),
                                  h.jsx(Qt, {
                                    type: "monotone",
                                    dataKey: "views",
                                    stroke: "#1E6B2B",
                                    strokeWidth: 4,
                                    fill: "url(#colorV)",
                                  }),
                                ],
                              }),
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              o === "users" &&
                h.jsxs(
                  Ce.div,
                  {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0 },
                    className: "space-y-8",
                    children: [
                      h.jsxs("div", {
                        className:
                          "flex flex-col sm:flex-row items-center justify-between gap-6 bg-taa-primary/5 p-8 rounded-[3rem] border border-taa-primary/10",
                        children: [
                          h.jsxs("div", {
                            className: "flex items-center gap-6",
                            children: [
                              h.jsx("div", {
                                className:
                                  "w-16 h-16 rounded-3xl bg-taa-primary text-white flex items-center justify-center shadow-xl shadow-taa-primary/20",
                                children: h.jsx(Je, { size: 32 }),
                              }),
                              h.jsxs("div", {
                                children: [
                                  h.jsx("h3", {
                                    className:
                                      "text-2xl font-black text-taa-dark dark:text-white",
                                    children: "Access Portal",
                                  }),
                                  h.jsxs("p", {
                                    className:
                                      "text-xs text-gray-500 font-bold uppercase tracking-widest",
                                    children: [
                                      u.length,
                                      " Registered Accounts",
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          h.jsxs("button", {
                            onClick: () => {
                              (S(null),
                                L({
                                  name: "",
                                  email: "",
                                  password: "",
                                  role: "Client",
                                }),
                                m(!0));
                            },
                            className:
                              "px-10 py-5 bg-taa-primary text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-2xl hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest",
                            children: [h.jsx(dt, { size: 20 }), " Add Member"],
                          }),
                        ],
                      }),
                      h.jsx("div", {
                        className:
                          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8",
                        children: u.map((j) =>
                          h.jsxs(
                            "div",
                            {
                              className:
                                "glass-card p-8 rounded-[3rem] border-taa-primary/5 flex flex-col group shadow-xl",
                              children: [
                                h.jsxs("div", {
                                  className:
                                    "flex items-start justify-between mb-8",
                                  children: [
                                    h.jsx("div", {
                                      className:
                                        "w-14 h-14 rounded-2xl bg-taa-primary/10 text-taa-primary flex items-center justify-center font-black text-xl shadow-inner",
                                      children: j.name?.[0] || "?",
                                    }),
                                    h.jsx("div", {
                                      className: `px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${j.role === "Admin" ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"}`,
                                      children: j.role,
                                    }),
                                  ],
                                }),
                                h.jsxs("div", {
                                  className: "mb-8",
                                  children: [
                                    h.jsx("h4", {
                                      className:
                                        "font-black text-taa-dark dark:text-white text-xl truncate mb-1",
                                      children: j.name || "Anonymous User",
                                    }),
                                    h.jsx("p", {
                                      className:
                                        "text-sm text-gray-500 font-bold truncate opacity-60",
                                      children: j.email,
                                    }),
                                  ],
                                }),
                                h.jsxs("div", {
                                  className:
                                    "mt-auto flex items-center justify-between gap-4 pt-6 border-t border-taa-primary/5",
                                  children: [
                                    h.jsxs("div", {
                                      className: "flex gap-3",
                                      children: [
                                        h.jsx("button", {
                                          onClick: () => Y(j),
                                          className:
                                            "p-3 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-taa-primary hover:text-white transition-all shadow-sm",
                                          children: h.jsx(nt, { size: 16 }),
                                        }),
                                        h.jsx("button", {
                                          onClick: () => X(j._id),
                                          className:
                                            "p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm",
                                          children: h.jsx(We, { size: 16 }),
                                        }),
                                      ],
                                    }),
                                    h.jsx("button", {
                                      onClick: () => re(j),
                                      className: `text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-lg transition-all ${j.suspended ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-green-500 hover:bg-green-500/10"}`,
                                      children: j.suspended
                                        ? "Suspended"
                                        : "Active",
                                    }),
                                  ],
                                }),
                              ],
                            },
                            j._id,
                          ),
                        ),
                      }),
                    ],
                  },
                  "usr",
                ),
              o === "settings" &&
                h.jsx(
                  Ce.div,
                  {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0 },
                    className: "max-w-3xl mx-auto w-full pb-20 pt-12",
                    children: h.jsxs("div", {
                      className:
                        "glass-card p-10 md:p-16 rounded-[4rem] border-taa-primary/5 shadow-2xl relative overflow-hidden bg-white/50 dark:bg-taa-dark/50 backdrop-blur-3xl",
                      children: [
                        h.jsx("div", {
                          className:
                            "absolute top-0 right-0 w-80 h-80 bg-taa-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2",
                        }),
                        h.jsxs("div", {
                          className: "relative z-10",
                          children: [
                            h.jsxs("div", {
                              className:
                                "flex items-center gap-6 mb-16 pb-12 border-b border-taa-primary/10",
                              children: [
                                h.jsx("div", {
                                  className:
                                    "w-16 h-16 rounded-3xl bg-taa-primary/10 text-taa-primary flex items-center justify-center shadow-inner",
                                  children: h.jsx(et, { size: 32 }),
                                }),
                                h.jsxs("div", {
                                  children: [
                                    h.jsx("h3", {
                                      className:
                                        "text-3xl font-black text-taa-dark dark:text-white",
                                      children: "Core Engine",
                                    }),
                                    h.jsx("p", {
                                      className:
                                        "text-xs text-gray-500 font-black uppercase tracking-[0.2em] opacity-60",
                                      children: "System Configuration",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            h.jsxs("form", {
                              className: "space-y-12",
                              onSubmit: (j) => {
                                (j.preventDefault(),
                                  N("put", "/settings", l, "settings").then(
                                    () => alert("Settings verified and saved!"),
                                  ));
                              },
                              children: [
                                h.jsxs("div", {
                                  className: "space-y-10",
                                  children: [
                                    h.jsxs("div", {
                                      className: "space-y-4",
                                      children: [
                                        h.jsx("label", {
                                          className:
                                            "flex items-center gap-2 text-[10px] font-black text-taa-primary uppercase tracking-[0.3em] ml-2",
                                          children: "Platform Identity",
                                        }),
                                        h.jsx("input", {
                                          type: "text",
                                          className:
                                            "w-full bg-white dark:bg-black/20 border-2 border-transparent focus:border-taa-primary rounded-[2rem] p-6 outline-none font-black text-2xl text-taa-dark dark:text-white shadow-2xl transition-all",
                                          value: l.siteTitle,
                                          onChange: (j) =>
                                            g({
                                              ...l,
                                              siteTitle: j.target.value,
                                            }),
                                        }),
                                      ],
                                    }),
                                    h.jsxs("div", {
                                      className: "space-y-4",
                                      children: [
                                        h.jsx("label", {
                                          className:
                                            "flex items-center gap-2 text-[10px] font-black text-taa-primary uppercase tracking-[0.3em] ml-2",
                                          children: "Default Focus Feed",
                                        }),
                                        h.jsxs("div", {
                                          className: "relative",
                                          children: [
                                            h.jsx("select", {
                                              className:
                                                "w-full bg-white dark:bg-black/20 border-2 border-transparent focus:border-taa-primary rounded-[2rem] p-6 outline-none font-black text-2xl text-taa-dark dark:text-white appearance-none shadow-2xl transition-all",
                                              value: l.defaultCategory,
                                              onChange: (j) =>
                                                g({
                                                  ...l,
                                                  defaultCategory:
                                                    j.target.value,
                                                }),
                                              children: pt.map((j) =>
                                                h.jsx(
                                                  "option",
                                                  { value: j, children: j },
                                                  j,
                                                ),
                                              ),
                                            }),
                                            h.jsx("div", {
                                              className:
                                                "absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-taa-primary",
                                              children: h.jsx(ft, {
                                                size: 24,
                                                className: "rotate-90",
                                              }),
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                h.jsx("div", {
                                  className:
                                    "pt-12 border-t border-taa-primary/10",
                                  children: h.jsx("button", {
                                    className:
                                      "w-full py-6 bg-taa-primary text-white rounded-[2.5rem] font-black text-xl shadow-[0_25px_50px_-12px_rgba(30,107,43,0.5)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest",
                                    children: "Update Environment",
                                  }),
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  },
                  "set",
                ),
            ],
          }),
        ],
      }),
      h.jsx(rt, {
        children:
          O &&
          h.jsxs(h.Fragment, {
            children: [
              h.jsx(Ce.div, {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
                onClick: () => m(!1),
                className:
                  "fixed inset-0 bg-taa-dark/80 backdrop-blur-xl z-[200]",
              }),
              h.jsxs(Ce.div, {
                initial: { opacity: 0, scale: 0.9, y: 50 },
                animate: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.9, y: 50 },
                className:
                  "fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md h-fit z-[201] glass-card p-10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-taa-primary/10",
                children: [
                  h.jsxs("h3", {
                    className:
                      "text-2xl font-black text-taa-dark dark:text-white mb-10 flex items-center gap-4",
                    children: [
                      M
                        ? h.jsx(Gt, { className: "text-taa-primary", size: 28 })
                        : h.jsx(dt, {
                            className: "text-taa-primary",
                            size: 28,
                          }),
                      M ? "Privilege Control" : "Provision Account",
                    ],
                  }),
                  h.jsxs("form", {
                    onSubmit: Z,
                    className: "space-y-6",
                    children: [
                      h.jsxs("div", {
                        className: "space-y-2",
                        children: [
                          h.jsx("label", {
                            className:
                              "text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2",
                            children: "Full Name",
                          }),
                          h.jsx("input", {
                            type: "text",
                            value: b.name,
                            onChange: (j) => L({ ...b, name: j.target.value }),
                            className:
                              "w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white shadow-inner",
                            required: !0,
                          }),
                        ],
                      }),
                      h.jsxs("div", {
                        className: "space-y-2",
                        children: [
                          h.jsx("label", {
                            className:
                              "text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2",
                            children: "Email Identity",
                          }),
                          h.jsx("input", {
                            type: "email",
                            value: b.email,
                            onChange: (j) => L({ ...b, email: j.target.value }),
                            className:
                              "w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white shadow-inner",
                            required: !0,
                          }),
                        ],
                      }),
                      !M &&
                        h.jsxs("div", {
                          className: "space-y-2",
                          children: [
                            h.jsx("label", {
                              className:
                                "text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2",
                              children: "Access Password",
                            }),
                            h.jsx("input", {
                              type: "password",
                              value: b.password,
                              onChange: (j) =>
                                L({ ...b, password: j.target.value }),
                              className:
                                "w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white shadow-inner",
                              required: !0,
                            }),
                          ],
                        }),
                      h.jsxs("div", {
                        className: "space-y-2",
                        children: [
                          h.jsx("label", {
                            className:
                              "text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2",
                            children: "System Role",
                          }),
                          h.jsxs("div", {
                            className: "relative",
                            children: [
                              h.jsx("select", {
                                value: b.role,
                                onChange: (j) =>
                                  L({ ...b, role: j.target.value }),
                                className:
                                  "w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white appearance-none shadow-inner",
                                children: sr.map((j) =>
                                  h.jsx("option", { value: j, children: j }, j),
                                ),
                              }),
                              h.jsx("div", {
                                className:
                                  "absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-taa-primary",
                                children: h.jsx(ft, {
                                  size: 18,
                                  className: "rotate-90",
                                }),
                              }),
                            ],
                          }),
                        ],
                      }),
                      h.jsxs("div", {
                        className: "flex gap-6 pt-8",
                        children: [
                          h.jsx("button", {
                            type: "button",
                            onClick: () => m(!1),
                            className:
                              "flex-1 py-5 font-black text-gray-400 uppercase text-xs tracking-widest",
                            children: "Cancel",
                          }),
                          h.jsx("button", {
                            type: "submit",
                            disabled: w,
                            className:
                              "flex-[2] py-5 bg-taa-primary text-white rounded-[2rem] font-black shadow-2xl hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]",
                            children: w ? "Provisioning..." : "Commit Access",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
      }),
    ],
  });
}
export { dr as default };
