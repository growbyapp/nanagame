/* HEY, NANA - Room 707: all art drawn in code. Original drawings only. */
window.NG = window.NG || {};
(function () {
  'use strict';

  var INK = '#0d0b0c', INK2 = '#1d191b', PAPER = '#f3ece0', PAPER2 = '#e4d9c6',
    RED = '#d3122a', PINK = '#ff6fa3', STRAW = '#e8294f', GOLD = '#f4c430', SKIN = '#f8f0e4';

  // Every SVG gets its own id prefix so patterns never collide on one page.
  var uidN = 0;
  function uid() { uidN += 1; return 'ng' + uidN + '-'; }

  // Deterministic random, so scenes look the same on every render.
  function rng(seed) {
    var s = seed;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  function n(v) { return Math.round(v * 10) / 10; }

  function toneDefs(u) {
    return '' +
      '<pattern id="' + u + 'dots" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="3.5" cy="3.5" r="1.7" fill="' + INK + '"/></pattern>' +
      '<pattern id="' + u + 'fine" width="4.5" height="4.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="2.2" cy="2.2" r=".8" fill="' + INK + '"/></pattern>' +
      '<pattern id="' + u + 'wdots" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="4" cy="4" r="1.5" fill="' + PAPER + '"/></pattern>' +
      '<pattern id="' + u + 'hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><line x1="0" y1="0" x2="0" y2="5" stroke="' + INK + '" stroke-width="1"/></pattern>' +
      "<pattern id=\"" + u + "tartan\" width=\"30\" height=\"30\" patternUnits=\"userSpaceOnUse\"><rect width=\"30\" height=\"30\" fill=\"" + RED + "\"/><path d=\"M0 7H30M0 22H30M7 0V30M22 0V30\" stroke=\"" + INK + "\" stroke-width=\"5\" opacity=\".85\"/><path d=\"M0 15H30M15 0V30\" stroke=\"" + PAPER + "\" stroke-width=\"1\"/></pattern>" +
      "<pattern id=\"" + u + "ptartan\" width=\"26\" height=\"26\" patternUnits=\"userSpaceOnUse\"><rect width=\"26\" height=\"26\" fill=\"#f7c2d4\"/><path d=\"M0 7H26M7 0V26\" stroke=\"" + PINK + "\" stroke-width=\"6\" opacity=\".75\"/><path d=\"M0 19H26M19 0V26\" stroke=\"#fff\" stroke-width=\"2\"/><path d=\"M0 13H26M13 0V26\" stroke=\"" + STRAW + "\" stroke-width=\".8\"/></pattern>" +
      '<pattern id="' + u + 'whatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><line x1="0" y1="0" x2="0" y2="9" stroke="' + PAPER + '" stroke-width="1"/></pattern>';
  }

  /* ---------- sprites: flat cel-shaded characters, every shape authored by hand ---------- */
  var LINE = '#3a2f3a', SKIN_C = '#fbe6d4', SKIN_S = '#e9bfa6', WHITE = '#fffdf9';
  function P(d, fill, sw, stroke) {
    return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + (sw ? ' stroke="' + (stroke || INK) + '" stroke-width="' + sw + '" stroke-linejoin="round" stroke-linecap="round"' : '') + '/>';
  }
  function pt(a) { return n(a[0]) + ' ' + n(a[1]); }
  function berry(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')"><path d="M0 11C-10 4 -9 -6 -5 -7C-2 -9 2 -9 5 -7C9 -6 10 4 0 11Z" fill="' + STRAW + '" stroke="' + INK + '" stroke-width="1"/><path d="M-6 -7L0 -11L6 -7L0 -5Z" fill="#2c6b34"/></g>';
  }
  function orbPendant(x, y, k) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + k + ')"><circle r="7" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="1.5"/><path d="M-7 0H7M0 -7C-4 -3 -4 3 0 7C4 3 4 -3 0 -7" fill="none" stroke="' + INK + '" stroke-width=".8"/><ellipse rx="12" ry="3.6" fill="none" stroke="#fff" stroke-width="1.4" transform="rotate(-22)"/></g>';
  }
  function tartanDefs(u) {
    return '<pattern id="' + u + 't" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(8)"><rect width="26" height="26" fill="#c41f36"/><path d="M0 7H26M7 0V26" stroke="#2a0d16" stroke-width="5"/><path d="M0 20H26M20 0V26" stroke="#2a0d16" stroke-width="1.6"/><path d="M0 13.5H26M13.5 0V26" stroke="#f0d060" stroke-width=".9"/></pattern>' +
      '<pattern id="' + u + 'p" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(-6)"><rect width="24" height="24" fill="#f8bccf"/><path d="M0 6H24M6 0V24" stroke="#ee86aa" stroke-width="5"/><path d="M0 18H24M18 0V24" stroke="#fff" stroke-width="1.5"/></pattern>';
  }
  var FACE = 'M146 200C146 150 170 122 200 122C230 122 254 150 254 200C254 228 246 250 230 266C218 278 207 286 200 287C193 286 182 278 170 266C154 250 146 228 146 200Z';

  var EX = {
    neutral: { o: 1, s: 0, lo: 1, ir: 1, br: [0, 0], m: 'neutral' },
    happy: { o: .86, s: 0, lo: .6, ir: 1, br: [-3, -1], m: 'happy', soft: true },
    sad: { o: .8, s: -4, lo: 1, ir: 1, br: [-10, 6], tear: true, m: 'sad' },
    angry: { o: .72, s: 5, lo: .9, ir: .94, br: [8, -5], m: 'angry' },
    smirk: { o: .7, s: 2, lo: .85, ir: 1, br: [3, 0], brR: [-7, -6], oR: .9, m: 'smirk' },
    shock: { o: 1.2, s: 0, lo: 1.15, ir: .72, br: [-10, -8], m: 'shock' }
  };

  function eye(u, c, ex, far, flip) {
    var e = c.eye, x = EX[ex], W = 20, o = far && x.oR ? x.oR : x.o;
    var up = function (p, d) { return [p[0], (p[1] < 0 ? p[1] * o : p[1]) + (x.s * p[0] / W) * .9 + (d || 0)]; };
    if (ex === 'happy' && c.closedHappy) {
      return P('M-21 5C-13 -11 8 -13 20 4C8 -6 -11 -5 -21 5Z', INK, 1, INK) + P('M-20 4L-27 -1L-18 0Z', INK);
    }
    var O = up(e.o), C1 = up(e.c1), C2 = up(e.c2), I = up(e.i);
    var L1 = [e.l1[0], e.l1[1] * x.lo], L2 = [e.l2[0], e.l2[1] * x.lo];
    var shape = 'M' + pt(O) + 'C' + pt(C1) + ' ' + pt(C2) + ' ' + pt(I) + 'C' + pt(L1) + ' ' + pt(L2) + ' ' + pt(O) + 'Z';
    var id = u + (far ? 'F' : 'N'), ir = e.ir, k = x.ir, cx = ir[0], cy = ir[1], rx = ir[2] * k, ry = ir[3] * k, hl = flip ? -1 : 1;
    var s = '<clipPath id="' + id + '"><path d="' + shape + '"/></clipPath>' + P(shape, WHITE) + '<g clip-path="url(#' + id + ')">' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + e.c[0] + '"/>' +
      P('M' + n(cx - rx * .84) + ' ' + n(cy + ry * .2) + 'Q' + cx + ' ' + n(cy + ry * 1.5) + ' ' + n(cx + rx * .84) + ' ' + n(cy + ry * .2) + 'Q' + cx + ' ' + n(cy + ry * .55) + ' ' + n(cx - rx * .84) + ' ' + n(cy + ry * .2) + 'Z', e.c[1]) +
      '<ellipse cx="' + cx + '" cy="' + (cy - 1) + '" rx="' + n(e.pu[0] * k) + '" ry="' + n(e.pu[1] * k) + '" fill="' + INK + '"/>' +
      P('M' + pt(O) + 'C' + pt(C1) + ' ' + pt(C2) + ' ' + pt(I) + 'L' + pt([I[0], I[1] + 3]) + 'C' + pt([C2[0], C2[1] + 3.4]) + ' ' + pt([C1[0], C1[1] + 3.4]) + ' ' + pt([O[0], O[1] + 2.4]) + 'Z', '#c6b9cc') + '</g>';
    var r = k * e.hl;
    s += '<circle cx="' + n(cx - 4.5 * hl * k) + '" cy="' + n(cy - ry * .42) + '" r="' + n(r) + '" fill="#fff"/><circle cx="' + n(cx + 5 * hl * k) + '" cy="' + n(cy + ry * .38) + '" r="' + n(r * .38) + '" fill="#fff"/>';
    var T = e.T, Wg = up(e.wing);
    s += P('M' + pt(Wg) + 'C' + pt([C1[0] - 2, C1[1] - T]) + ' ' + pt([C2[0], C2[1] - T * .7]) + ' ' + pt([I[0] + 1.4, I[1] + .4]) + 'C' + pt([C2[0], C2[1] + T * .3]) + ' ' + pt([C1[0], C1[1] + T * .5]) + ' ' + pt([O[0] + 2, O[1] + 1.6]) + 'Z', INK);
    s += P('M' + pt([O[0] + 2, O[1] + 1.6]) + 'C' + pt([L2[0], L2[1] + .5]) + ' ' + pt([L1[0], L1[1] + .5]) + ' ' + pt([I[0] - 2, I[1] + 1]) + 'C' + pt([L1[0], L1[1] - 1.2]) + ' ' + pt([L2[0], L2[1] - 1.2]) + ' ' + pt([O[0] + 2, O[1] + 1.6]) + 'Z', e.liner ? INK : LINE);
    // upper-lid crease
    s += P('M' + n(O[0] + 3) + ' ' + n(O[1] - 7) + 'C' + n(C1[0] + 2) + ' ' + n(C1[1] - 7) + ' ' + n(C2[0]) + ' ' + n(C2[1] - 6) + ' ' + n(I[0] - 3) + ' ' + n(I[1] - 6), 'none', 1, LINE);
    return s;
  }
  function brow(c, b) {
    var e = c.brow, W = 20, y0 = e.y + b[0], y1 = e.y + 3 + b[1], m = (y0 + y1) / 2 - e.arch;
    return P('M' + n(W * .9) + ' ' + y0 + 'Q' + n(-W * .15) + ' ' + m + ' ' + n(-W * 1.3) + ' ' + y1 + 'Q' + n(-W * .15) + ' ' + n(m + e.w) + ' ' + n(W * .9) + ' ' + n(y0 + e.w) + 'Z', e.col);
  }
  function mouthShape(c, name, ox) {
    var lip = c.lip, ln = '#2a1a22';
    var M = {
      neutral: P('M191 257Q200 262 209 256Q200 259 191 257Z', ln, .8, ln) + (lip ? P('M195 261Q200 264 205 261Q200 263 195 261Z', lip) : P('M196 262Q200 264 204 262', 'none', 1, '#c79a84')),
      happy: c.closedHappy
        ? P('M186 252Q200 258 214 252Q211 272 200 273Q189 272 186 252Z', '#a23042', 1.6) + P('M191 266Q200 262 209 266Q205 272 200 272Q195 272 191 266Z', '#f07f92') + P('M189 253Q200 258 211 253L209 258Q200 261 191 258Z', '#fff')
        : P('M186 254Q200 268 214 253Q201 262 186 254Z', ln, .8, ln) + (lip ? P('M194 263Q200 266 206 262', 'none', 1.8, lip) : P('M195 264Q200 266 205 263', 'none', 1, '#c79a84')),
      sad: P('M191 262Q200 255 209 262Q200 258 191 262Z', ln, .8, ln) + P('M195 265Q200 263 205 265', 'none', 1, LINE),
      angry: P('M189 263Q200 255 211 263Q204 261 200 261Q196 261 189 263Z', ln, 1, ln) + P('M196 266H204', 'none', 1.2, LINE),
      smirk: P('M190 260Q203 263 214 251Q205 259 190 260Z', ln, .9, ln) + (lip ? P('M196 263Q201 265 207 261', 'none', 1.6, lip) : ''),
      shock: P('M194 257Q200 252 206 257Q208 272 200 274Q192 272 194 257Z', '#a23042', 1.5)
    };
    return '<g transform="translate(' + ox + ' 0)">' + M[name] + (c.demon && (name === 'happy' || name === 'angry' || name === 'smirk') ? P('M192 257l2.6 8l2.6 -7M203 257l2.6 7l2.6 -8', '#fff', .8) : '') + '</g>';
  }
  function tearDraw(x) { return P('M' + x + ' 218C' + (x - 4) + ' 234 ' + (x - 5) + ' 244 ' + x + ' 250C' + (x + 5) + ' 244 ' + (x + 4) + ' 234 ' + x + ' 218Z', '#a8d4f2', 1, '#4f86ad'); }

  // A hard cel shadow: the fringe itself, slid down onto the skin.
  function faceBlock(u, c) {
    var FACEP = c.face || FACE, clip = u + 'fc', h = c.hair, sk = c.skin || SKIN_C, shS = c.skinS || SKIN_S;
    var cast = (h.fringe || []).concat(h.side || []).map(function (d) { return P(d, shS); }).join('');
    return P(FACEP, sk, 2.4) + (c.faceTop || '') + '<clipPath id="' + clip + '"><path d="' + FACEP + '"/></clipPath><g clip-path="url(#' + clip + ')"><g transform="translate(' + (c.castX || -3) + ' 9)">' + cast + '</g></g>';
  }
  function neck(c) {
    var sk = c.skin || SKIN_C, shS = c.skinS || SKIN_S, w = c.male ? 19 : 15;
    return P('M' + (200 - w) + ' 262L' + (200 - w) + ' 328C' + (198 - w) + ' 338 ' + (186 - w) + ' 344 ' + (160 - w) + ' 350L' + (240 + w) + ' 350C' + (214 + w) + ' 344 ' + (202 + w) + ' 338 ' + (200 + w) + ' 328L' + (200 + w) + ' 262Z', sk, 2.2) +
      P('M' + (200 - w) + ' 270C' + (194 - w * .4) + ' 300 ' + (206 + w * .4) + ' 300 ' + (200 + w) + ' 270L' + (200 + w) + ' 296C' + (206 + w * .4) + ' 316 ' + (194 - w * .4) + ' 318 ' + (200 - w) + ' 300Z', shS);
  }

  var CAST = {};
  function portrait(charId, expr) {
    var id = CAST[charId] ? charId : 'hachi', c = CAST[id], ex = EX[expr] ? expr : 'neutral', x = EX[ex], u = uid(), h = c.hair;
    var t = (c.tilt || 0) + (c.tiltEx && c.tiltEx[ex] || 0), R = '<g transform="rotate(' + t + ' 200 290)">';
    var dx = c.turn || 0, L = 168 + dx, Rr = 232 + dx, Y = 206;
    var nearLeft = dx >= 0;
    var s = '<svg class="ng-portrait" xmlns="http://www.w3.org/2000/svg" viewBox="' + (c.demon ? '0 -8 400 540' : '30 58 340 450') + '" preserveAspectRatio="xMidYMax meet" role="img" aria-label="' + id + ' (' + ex + ')"><defs>' + tartanDefs(u) + '</defs>';
    s += R + (h.pre || '') + P(h.back, h.fill, 4.2) + (h.backS || []).map(function (d) { return P(d, h.sh); }).join('') + '</g>';
    s += c.body(u, c);
    s += R;
    if (c.ears) s += P('M' + (146) + ' 214C136 214 138 244 149 248Z', c.skin || SKIN_C, 2) + P('M254 214C264 214 262 244 251 248Z', c.skin || SKIN_C, 2);
    s += faceBlock(u, c);
    s += P('M' + (196 + dx) + ' 240Q' + (200 + dx) + ' 244 ' + (203 + dx) + ' 240', 'none', 1.5, '#b08870') + mouthShape(c, x.m, dx);
    (h.side || []).forEach(function (d) { s += P(d, h.fill, 1.4, h.ln); });
    (h.fringe || []).forEach(function (d) { s += P(d, h.fill, 1.4, h.ln); });
    (h.strand || []).forEach(function (d) { s += P(d, 'none', 1.2, h.ln); });
    (h.hi || []).forEach(function (d) { s += P(d, h.hi2); });
    s += (c.faceAcc ? c.faceAcc(u) : '');
    if (c.shades) {
      s += '<g transform="translate(' + L + ' ' + (Y - 4) + ')">' + brow(c, x.br) + '</g><g transform="translate(' + Rr + ' ' + (Y - 4) + ') scale(-1 1)">' + brow(c, x.brR || x.br) + '</g>';
      var sl = ex === 'shock' ? 10 : 0;
      var lens = function (cx, r) { return '<circle cx="' + cx + '" cy="' + (210 + sl) + '" r="' + r + '" fill="#121016" stroke="#46404e" stroke-width="2.2"/>' + P('M' + (cx - r * .62) + ' ' + (205 + sl) + 'A' + r * .78 + ' ' + r * .78 + ' 0 0 1 ' + (cx - r * .1) + ' ' + (198 + sl), 'none', 2.2, '#fff'); };
      s += lens(L, 20) + lens(Rr, 20) + P('M' + (L + 20) + ' ' + (204 + sl) + 'Q' + (200 + dx) + ' ' + (198 + sl) + ' ' + (Rr - 20) + ' ' + (204 + sl), 'none', 2.2, '#46404e');
    } else {
      s += '<g transform="translate(' + L + ' ' + Y + ')' + '">' + brow(c, x.br) + eye(u, c, ex, !nearLeft, false) + '</g>' +
        '<g transform="translate(' + Rr + ' ' + Y + ') scale(-1 1)">' + brow(c, x.brR || x.br) + eye(u, c, ex, nearLeft, true) + '</g>';
      if (x.tear) s += tearDraw(L - 8) + tearDraw(Rr + 8);
    }
    if (c.front) s += c.front(u);
    s += '</g></svg>';
    return s;
  }
  var EYE_F = { o: [-21, 4], c1: [-15, -9], c2: [5, -14], i: [20, 1], l1: [13, 11], l2: [-10, 11], ir: [1, -1, 11.5, 13], c: ['#231410', '#5a3a26'], pu: [5, 7], hl: 3.8, wing: [-31, -7], T: 3.4, liner: true };
  var EYE_H = { o: [-20, 4], c1: [-16, -11], c2: [5, -16], i: [19, 0], l1: [14, 13], l2: [-10, 14], ir: [1, 0, 12.5, 14.5], c: ['#6a3c1a', '#c98a45'], pu: [5.5, 8], hl: 4.8, wing: [-25, -1], T: 3.8 };
  function hand(x, y, r, sk) { return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (r || 0) + ')">' + P('M-13 -8C-8 -15 8 -15 13 -8C17 0 13 11 3 12C-8 12 -17 3 -13 -8Z', sk || SKIN_C, 2.2) + P('M-5 -12L-6 2M2 -13L1 3M9 -10L8 3', 'none', 1.2, LINE) + '</g>'; }
  CAST.nana = {
    turn: -4, tilt: -2, tiltEx: { happy: 2, sad: 4, smirk: -2, angry: -1, shock: 2 }, eye: EYE_F, lip: '#7c1b2c', brow: { col: INK, w: 2.6, y: -24, arch: 5 },
    hair: { fill: '#201a28', sh: '#110d17', ln: '#3c3350', hi2: '#5a5176',
      back: 'M200 88C154 86 124 114 118 168C116 198 112 222 106 240L88 262C100 262 108 258 114 252L100 296C114 292 124 280 130 266L120 322C138 310 150 292 156 276L150 336C166 322 178 302 184 286L190 330C196 318 200 306 204 296L212 338C220 322 226 306 228 290L246 332C252 316 254 298 252 282L274 322C280 304 278 286 274 270L298 298C300 282 296 266 292 254L314 262C304 248 296 226 292 200C290 134 248 86 200 88Z',
      backS: ['M124 210C122 240 116 254 110 266L128 258L120 312C136 298 148 276 150 250Z', 'M280 212C282 240 288 256 294 264L276 258L276 308C262 294 252 272 250 250Z'],
      side: ['M170 112C146 138 138 192 136 232C134 256 130 272 118 290C138 286 150 268 154 240C156 200 162 160 186 118Z', 'M230 112C254 138 262 192 264 232C266 256 272 272 284 288C262 286 250 268 246 240C244 200 238 160 214 118Z'],
      fringe: ['M190 94C154 98 138 134 142 176C156 162 174 142 188 114Z', 'M196 92C168 106 162 142 169 172C184 156 196 136 202 112Z', 'M198 92C188 122 182 158 190 196C204 168 212 136 208 102Z', 'M206 94C214 122 220 150 229 172C240 152 244 126 232 104Z', 'M214 94C236 112 250 140 259 174C270 144 256 106 228 94Z'],
      hi: ['M152 134C164 120 180 114 198 114L194 124L186 118L180 130L172 122L166 136L158 128Z', 'M218 116C234 120 246 130 254 142L246 136L242 146L232 130L226 140Z'] },
    body: function (u, c) {
      var J = '#1c1822', JS = '#100d15', L = '#8a809a', s = '';
      s += P('M158 342C134 346 112 352 100 372C92 396 86 450 84 508H322C318 450 312 412 302 386C294 366 270 356 244 346Z', J, 3.6);
      s += P('M100 372C94 404 88 460 86 508H110C112 464 118 424 126 396Z', JS);
      s += neck(c);
      s += P('M168 346L200 412L232 346C220 342 180 342 168 346Z', SKIN_C);
      s += P('M176 352Q188 358 196 354M226 352Q212 358 204 354', 'none', 1.2, LINE);
      s += P('M158 402Q200 420 242 402L252 508H150Z', 'url(#' + u + 't)', 2.4);
      [426, 448, 470, 492].forEach(function (y) { s += P('M192 ' + y + 'L208 ' + (y + 13) + 'M208 ' + y + 'L192 ' + (y + 13), 'none', 1.8, '#f3ece0'); });
      // jacket fronts and real notched lapels
      s += P('M158 342L170 346L190 508H84C86 450 92 396 100 372C112 352 134 346 158 342Z', J, 2.6);
      s += P('M244 346L232 348L210 508H322C318 450 312 412 302 386C294 366 270 356 244 346Z', J, 2.6);
      s += P('M170 346L134 390L148 396L140 412L176 462L188 420Z', '#26212d', 2, L);
      s += P('M232 348L266 392L252 398L260 414L224 462L212 420Z', '#26212d', 2, L);
      [[146, 402], [154, 410], [162, 418]].forEach(function (p) { s += P('M' + p[0] + ' ' + (p[1] - 4) + 'l4 4l-4 4l-4 -4z', '#efe7da'); });
      // diagonal zip
      s += P('M112 438L176 480', 'none', 4, '#000') + P('M112 438L176 480', 'none', 1.6, '#c9c2b6') + '<rect x="104" y="432" width="9" height="12" fill="#c9c2b6" stroke="' + INK + '" transform="rotate(33 108 438)"/>';
      s += P('M150 386L170 380M150 386C158 392 166 390 172 384', 'none', 1.8, '#efe7da') + '<circle cx="148" cy="387" r="2.4" fill="none" stroke="#efe7da" stroke-width="1.5"/>';
      s += P('M246 396L264 402M246 396C252 404 260 406 268 402', 'none', 1.8, '#efe7da') + '<circle cx="244" cy="396" r="2.4" fill="none" stroke="#efe7da" stroke-width="1.5"/>';
      s += P('M180 306Q200 318 220 306L220 321Q200 332 180 321Z', INK, 1.5, '#6a5f78');
      [188, 194, 200, 206, 212].forEach(function (x) { s += P('M' + x + ' 313l2.4 3.6l-2.4 3.6l-2.4 -3.6z', '#efe7da'); });
      s += P('M184 324Q200 362 216 324', 'none', 1.5, '#e0b53a') + orbPendant(200, 354, 1);
      // arm up, gripping the lapel, with the ring
      s += P('M290 366C314 386 326 430 322 470C318 490 300 494 290 482C276 456 262 430 244 408L262 388C272 400 282 414 292 430C296 414 294 386 278 362Z', J, 3);
      s += P('M302 440C304 462 302 476 296 484', 'none', 1.5, L);
      s += P('M262 380C258 370 238 368 228 374C218 380 216 398 224 404C232 410 252 410 264 402Z', SKIN_C, 2.2) + P('M226 386H247M224 396H248M254 374C258 386 258 396 254 406', 'none', 1.2, LINE);
      s += P('M216 382L228 372L248 368L252 382L229 387Z', GOLD, 1.7) + P('M233 371L236 386M243 369L245 383', 'none', 1.3, INK) + P('M216 382L226 379', 'none', 1.2, INK);
      return s;
    },
    faceAcc: function () { return '<circle cx="139" cy="252" r="3.4" fill="none" stroke="#efe7da" stroke-width="1.8"/><circle cx="262" cy="250" r="3.4" fill="none" stroke="#efe7da" stroke-width="1.8"/><circle cx="263" cy="238" r="2.2" fill="none" stroke="#efe7da" stroke-width="1.4"/>'; }
  };
  CAST.hachi = {
    turn: 4, tilt: 2, tiltEx: { happy: 3, sad: -4, shock: -3, angry: -1 }, castX: 3, closedHappy: true, eye: EYE_H, brow: { col: '#7a4f2a', w: 2, y: -24, arch: 7 },
    hair: { fill: '#c98f4f', sh: '#a26d34', ln: '#8a5a28', hi2: '#efc98a',
      back: 'M200 90C156 88 128 116 122 170C120 202 116 228 108 250C102 266 100 278 98 290C104 298 114 298 120 290C118 304 122 316 132 322C140 318 146 308 150 296C152 310 160 322 172 326C180 322 186 312 188 300C196 308 206 308 214 300C216 314 226 324 238 326C248 320 252 308 252 296C256 308 266 320 278 320C288 314 288 302 284 290C292 298 302 296 306 288C300 276 296 264 292 250C284 228 280 200 278 170C272 116 244 88 200 90Z',
      backS: ['M126 222C122 252 116 270 112 284C118 282 122 280 126 276C124 292 126 304 130 314C142 298 150 284 152 256Z', 'M274 222C278 252 284 270 288 284C282 282 278 280 276 276C278 292 276 304 272 314C258 298 250 284 248 256Z'],
      side: ['M168 110C142 138 134 190 134 232C132 256 128 276 136 298C150 294 156 268 156 240C156 200 162 160 186 118Z', 'M232 110C258 138 266 190 268 232C270 256 276 272 270 294C252 292 246 268 244 240C244 200 238 160 214 118Z'],
      fringe: ['M194 94C156 98 138 134 140 172C156 166 178 146 188 118Z', 'M202 92C172 106 166 142 173 174C188 168 202 148 208 112Z', 'M208 94C200 124 199 152 205 178C220 172 230 150 228 112Z', 'M214 94C226 118 232 150 239 170C252 164 258 142 250 112Z', 'M222 96C244 112 258 140 263 172C274 142 256 108 232 96Z'],
      strand: ['M128 244C120 258 118 270 122 282', 'M274 242C282 258 286 268 282 284'],
      hi: ['M152 138C166 124 184 116 200 116L198 126L190 120L184 132L174 124L168 140L158 130Z', 'M220 118C236 122 248 132 254 146L246 138L242 148L232 132L226 142Z'] },
    body: function (u, c) {
      var s = '';
      s += P('M164 344C148 350 136 356 130 372C146 392 150 450 152 508H248C250 450 254 392 270 372C264 356 252 350 236 344Z', '#fff8f2', 3.4);
      s += neck(c);
      s += P('M170 348C176 376 224 376 230 348L238 352C230 392 170 392 162 352Z', '#fff', 1.8);
      s += P('M160 384C176 410 224 410 240 384L274 508H126Z', 'url(#' + u + 'p)', 3);
      s += P('M168 390C160 430 150 470 140 508M232 390C240 430 250 470 262 508M196 410C194 450 192 480 190 508', 'none', 1.3, '#d86a94');
      s += P('M152 398Q200 416 248 398L250 410Q200 428 150 410Z', '#ff8fb2', 2);
      s += P('M128 366C112 370 106 386 110 400C118 410 134 410 146 402C150 386 146 370 128 366Z', '#fff', 2.8) + P('M272 366C288 370 294 386 290 400C282 410 266 410 254 402C250 386 254 370 272 366Z', '#fff', 2.8);
      s += P('M114 396C112 424 112 446 118 462C124 474 138 472 148 464C162 452 176 442 192 434L184 416C170 424 156 434 144 444C146 428 146 412 144 400Z', SKIN_C, 2.8);
      s += P('M286 396C288 424 288 446 282 462C276 474 262 472 252 464C238 452 224 442 208 434L216 416C230 424 244 434 256 444C254 428 254 412 256 400Z', SKIN_C, 2.8);
      s += P('M188 422C190 410 212 410 216 422C220 434 212 446 202 446C192 446 184 434 188 422Z', SKIN_C, 2.4) + P('M194 416L196 428M202 413V426M210 415L208 428', 'none', 1.2, LINE) + P('M190 432Q202 440 214 432', 'none', 1.1, LINE);
      s += P('M200 372C188 360 170 364 174 376C178 386 194 380 200 376C206 380 222 386 226 376C230 364 212 360 200 372Z', '#e8294f', 2) + '<circle cx="200" cy="374" r="4.6" fill="#ff6fa3" stroke="' + INK + '" stroke-width="1.6"/>';
      return s;
    }
  };
  /* ---------- the rest of the cast ---------- */
  function clone(a, b) { var r = {}, k; for (k in a) r[k] = a[k]; for (k in b) r[k] = b[k]; return r; }
  var FACE_M = 'M144 200C144 150 170 122 200 122C230 122 256 150 256 200C256 232 250 252 236 268C222 280 208 288 200 288C192 288 178 280 164 268C150 252 144 232 144 200Z';
  var EYE_M = { o: [-21, 3], c1: [-15, -8], c2: [5, -12], i: [20, 1], l1: [13, 9], l2: [-10, 9], ir: [1, -1, 10.5, 12], c: ['#231a14', '#6a4a30'], pu: [4.6, 6.4], hl: 3.2, wing: [-24, -1], T: 2.6 };
  var EYE_W = { o: [-21, 4], c1: [-15, -10], c2: [5, -15], i: [20, 1], l1: [13, 12], l2: [-10, 12], ir: [1, 0, 12, 14], c: ['#3a2a22', '#8a6a4a'], pu: [5, 7.4], hl: 4.2, wing: [-27, -3], T: 3.4 };
  var TORSO = 'M160 342C134 346 108 352 96 374C88 398 84 452 82 508H322C318 452 314 412 304 386C296 366 270 356 240 346Z';
  var ARM = 'M290 366C314 386 326 430 322 470C318 490 300 494 290 482C276 456 262 430 244 408L262 388C272 400 282 414 292 430C296 414 294 386 278 362Z';
  function hand2(x, y, sk) { return '<g transform="translate(' + x + ' ' + y + ')">' + P('M18 -8C14 -18 -6 -20 -16 -14C-26 -8 -28 10 -20 16C-12 22 8 22 20 14Z', sk || SKIN_C, 2.2) + P('M-18 -2H3M-20 8H4M10 -14C14 -2 14 8 10 18', 'none', 1.2, LINE) + '</g>'; }
  function armChest(fill, line, prop, sk) { return P(ARM, fill, 3, line || INK) + (prop || '') + hand2(244, 388, sk); }
  function armLeft(fill, line, prop, sk) { return '<g transform="translate(400 0) scale(-1 1)">' + P(ARM, fill, 3, line || INK) + hand2(244, 388, sk) + '</g>' + (prop || ''); }
  function vNeck(c, col) { return P('M170 348L200 ' + (c.vd || 404) + 'L230 348C218 344 182 344 170 348Z', c.skin || SKIN_C) + P('M178 354Q188 360 196 356M222 354Q212 360 204 356', 'none', 1.2, LINE); }
  function suit(c, col, inner, tie, ln) {
    var L = ln || '#8a809a', s = P(TORSO, col, 3.6) + neck(c);
    s += P('M170 348L200 470L230 348C218 344 182 344 170 348Z', inner, 2);
    if (tie) s += P('M193 372H207L204 392L212 470L200 486L188 470L196 392Z', tie, 1.6);
    s += P('M170 348L136 392L150 398L142 414L180 470L192 430Z', col, 2, L) + P('M230 348L264 392L250 398L258 414L220 470L208 430Z', col, 2, L);
    s += P('M180 470L168 508M220 470L232 508', 'none', 2, L);
    return s;
  }
  function strap(col) { return P('M250 346L120 508L146 508L270 354Z', col, 2); }
  function sticks() { return P('M214 372L300 300', 'none', 6, INK) + P('M214 372L300 300', 'none', 3, GOLD) + P('M224 384L316 322', 'none', 6, INK) + P('M224 384L316 322', 'none', 3, GOLD); }

  CAST.ren = {
    male: true, ears: true, face: FACE_M, turn: 3, tilt: 2, tiltEx: { smirk: -2, sad: 4 }, castX: 3, eye: clone(EYE_M, { c: ['#16101a', '#4c4a5a'], wing: [-27, -4] }), brow: { col: INK, w: 3, y: -23, arch: 4 },
    hair: { fill: '#17131d', sh: '#0c0a10', ln: '#3a3248', hi2: '#4d4664',
      back: 'M128 178L104 150L130 146L108 112L140 118L130 84L160 98L158 66L186 90L200 62L214 90L242 66L240 98L270 84L260 118L292 112L270 146L296 150L272 178C276 210 274 236 268 254L282 282L258 276L252 300L232 278L168 278L148 300L142 276L118 282L132 254C126 236 124 210 128 178Z',
      backS: ['M132 220C130 240 130 250 134 258L120 276L144 268L150 288L160 262Z', 'M268 220C270 240 270 250 266 258L280 276L256 268L250 288L240 262Z'],
      side: ['M160 124C146 150 142 200 144 244L136 266C150 256 158 236 160 214C162 180 170 150 184 126Z', 'M240 124C254 150 258 200 256 244L264 266C250 256 242 236 240 214C238 180 230 150 216 126Z'],
      fringe: ['M196 100C162 104 146 134 146 174L160 158L166 182C178 164 192 138 200 116Z', 'M200 98C188 126 184 158 190 190C204 168 214 138 214 110Z', 'M206 100C222 112 238 138 250 176L254 150C254 128 234 104 212 98Z'],
      hi: ['M156 138C168 124 182 118 198 118L194 128L184 122L178 134L168 126Z', 'M222 122C236 128 246 136 250 148L240 140L236 150L228 134Z'] },
    body: function (u, c) {
      var s = suit(c, '#17131d', SKIN_C, null);
      s += P('M168 322Q200 372 232 322', 'none', 2.2, GOLD) + '<g transform="translate(200 372)">' + P('M-9 0V-9C-9 -20 9 -20 9 -9V0', 'none', 4, GOLD) + '<rect x="-13" y="-2" width="26" height="22" rx="2" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="2"/><circle cy="7" r="3" fill="' + INK + '"/></g>';
      s += armChest('#17131d', '#3a3248');
      return s;
    },
    faceAcc: function () { return '<circle cx="139" cy="256" r="3.4" fill="none" stroke="#efe7da" stroke-width="1.8"/>'; }
  };
  CAST.nobu = {
    male: true, ears: true, face: FACE_M, turn: 4, tilt: 3, tiltEx: { happy: 2, shock: -3 }, castX: 3, closedHappy: true, eye: clone(EYE_M, { c: ['#4a2e14', '#b4823e'], ir: [1, 0, 11.5, 13.5], c1: [-15, -10], c2: [5, -14] }), brow: { col: '#8a6420', w: 3, y: -24, arch: 7 },
    hair: { fill: '#f0c43e', sh: '#c9951a', ln: '#a87a12', hi2: '#fbe48e',
      pre: P('M166 104C160 86 166 74 176 66C178 78 186 86 196 92C198 76 208 66 222 60C218 74 224 86 236 96Z', '#f0c43e', 4.2),
      back: 'M126 176C120 130 148 94 200 90C252 94 280 130 274 176C280 200 282 226 274 252L262 240L258 272L240 254L160 254L142 272L138 240L126 252C118 226 120 200 126 176Z',
      backS: ['M130 206C128 226 128 240 130 248L140 238L146 260L160 244Z', 'M270 206C272 226 272 240 270 248L260 238L254 260L240 244Z'],
      side: ['M162 122C146 148 142 196 144 236C148 226 158 208 162 186C166 160 176 138 188 124Z', 'M238 122C254 148 258 196 256 236C252 226 242 208 238 186C234 160 224 138 212 124Z'],
      fringe: ['M198 96C160 100 144 134 146 176C160 168 178 146 190 118Z', 'M200 94C178 112 172 146 176 178C190 170 204 146 208 116Z', 'M206 96C208 124 214 156 226 178C238 166 240 136 230 110Z', 'M214 96C238 110 252 142 254 176C266 146 248 106 222 96Z'],
      hi: ['M154 140C168 124 184 118 200 118L198 128L188 122L182 134L172 126L166 142Z', 'M222 122C238 128 248 138 252 150L242 142L238 152L230 136Z'] },
    body: function (u, c) {
      var s = P(TORSO, '#fff7ee', 3.6) + neck(c) + P('M172 348Q200 372 228 348', 'none', 2.4, INK);
      s += '<clipPath id="' + u + 'b"><path d="' + TORSO + '"/></clipPath><g clip-path="url(#' + u + 'b)"><path d="M70 396H330M70 430H330M70 464H330M70 498H330" stroke="' + INK + '" stroke-width="11"/></g>';
      s += strap(RED) + armChest('#fff7ee', INK, '', SKIN_C);
      return s;
    }
  };
  CAST.shin = {
    slim: true, turn: -3, tilt: -3, tiltEx: { smirk: -2 }, eye: clone(EYE_W, { c: ['#2e2640', '#8f7cb8'], wing: [-24, -1], T: 3, ir: [1, 0, 12.5, 14.5] }), brow: { col: '#4a3e58', w: 2.2, y: -24, arch: 7 },
    hair: { fill: '#9a8aa6', sh: '#75667f', ln: '#5e5068', hi2: '#cbbdd4',
      back: 'M200 90C158 90 130 116 126 170C124 206 122 232 114 256C122 262 130 260 136 254L132 290C146 284 156 270 160 256L172 278L228 278L240 256C244 270 254 284 268 290L264 254C270 260 278 262 286 256C278 232 276 206 274 170C270 116 242 90 200 90Z',
      backS: ['M130 216C128 240 124 250 120 254C128 256 134 252 138 246L138 280C150 272 156 260 158 244Z', 'M270 216C272 240 276 250 280 254C272 256 266 252 262 246L262 280C250 272 244 260 242 244Z'],
      side: ['M164 118C148 144 142 192 142 236C142 252 140 264 134 274C148 268 156 250 158 226C160 186 170 152 186 124Z', 'M236 118C252 144 258 192 258 236C258 252 260 264 266 274C252 268 244 250 242 226C240 186 230 152 214 124Z'],
      fringe: ['M216 94C176 96 148 124 142 176C160 170 186 150 200 120Z', 'M214 94C196 116 186 150 186 186C200 176 216 152 222 118Z', 'M218 96C224 124 232 150 244 172C254 156 252 122 232 100Z', 'M224 98C244 112 256 138 260 170C268 140 252 108 232 98Z'],
      hi: ['M154 140C170 122 190 116 208 118L204 128L194 122L188 134L178 126L170 142Z', 'M226 124C238 128 248 138 252 150L244 142L238 150L232 136Z'] },
    body: function (u, c) {
      var B = '#3b4a68', S = '#2c3850';
      var s = '<g transform="translate(200 0) scale(.86 1) translate(-200 0)">' + P(TORSO, B, 3.6) + P('M96 374C90 404 84 460 82 508H106C108 464 114 424 122 396Z', S) + '</g>';
      s += neck(c);
      s += P('M160 346C172 378 228 378 240 346L258 352C244 402 156 402 142 352Z', S, 2.4);
      s += P('M186 386L182 442M214 386L218 442', 'none', 2.6, '#efe7da');
      s += P('M148 460H252L262 508H138Z', S, 2.4);
      s += P('M268 354L150 508L172 508L288 366Z', '#c92a5a', 2);
      return s;
    },
    faceAcc: function () { return '<path d="M261 250l2.6 5l5.6 .8l-4 3.8l1 5.6l-5.2 -2.6l-5.2 2.6l1 -5.6l-4 -3.8l5.6 -.8z" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
  };
  CAST.yasu = {
    male: true, ears: true, shades: true, turn: 0, tilt: 1, tiltEx: { smirk: -1, shock: -2 }, skin: '#f6dfca', skinS: '#dfb79c', eye: EYE_M, brow: { col: '#1a1416', w: 3, y: -22, arch: 4 },
    face: 'M144 190C144 132 170 104 200 104C230 104 256 132 256 190C258 232 250 252 236 268C222 280 208 288 200 288C192 288 178 280 164 268C150 252 142 232 144 190Z',
    faceTop: P('M148 172C150 130 174 108 200 108C226 108 250 130 252 172C232 150 168 150 148 172Z', '#d8c6b4') + P('M168 124Q182 112 198 112', 'none', 3, '#fff'),
    hair: { fill: 'none', sh: 'none', ln: 'none', hi2: 'none', back: '', backS: [], side: [], fringe: [], hi: [] },
    body: function (u, c) {
      var s = suit(c, '#16141a', '#f7f4ee', '#b01a2c');
      s += armChest('#16141a', '#3a3248', sticks(), c.skin);
      return s;
    }
  };
  CAST.reira = {
    turn: -3, tilt: -2, tiltEx: { sad: 3, smirk: -2 }, eye: clone(EYE_F, { c: ['#26344e', '#7f9cc4'], wing: [-28, -5], ir: [1, -1, 12, 14], liner: false }), lip: '#b04a64', brow: { col: '#a58c5c', w: 2, y: -24, arch: 7 },
    hair: { fill: '#f1e2bc', sh: '#d3bd88', ln: '#a58c5c', hi2: '#fff8e2',
      back: 'M200 88C154 86 124 116 118 172C114 240 108 330 92 408C84 450 80 480 78 508H322C320 480 316 450 308 408C292 330 286 240 282 172C276 116 246 86 200 88Z',
      backS: ['M122 240C116 330 104 430 90 508H150C154 410 152 320 146 256Z', 'M278 240C284 330 296 430 310 508H250C246 410 248 320 254 256Z'],
      side: ['M180 104C150 130 136 190 134 250C132 300 128 340 118 372C142 358 154 322 156 268C158 212 168 150 196 112Z', 'M220 104C250 130 264 190 266 250C268 300 272 340 282 372C258 358 246 322 244 268C242 212 232 150 204 112Z'],
      fringe: ['M198 92C162 100 146 132 146 172C166 160 186 136 198 114Z', 'M202 92C238 100 254 132 254 172C234 160 214 136 202 114Z'],
      hi: ['M150 142C164 124 182 118 196 120L190 130L180 126L174 138L164 130Z', 'M250 142C236 124 218 118 204 120L210 130L220 126L226 138L236 130Z'] },
    body: function (u, c) {
      var s = '<g transform="translate(200 0) scale(.84 1) translate(-200 0)">' + P(TORSO, '#fffaf2', 3.6) + '</g>' + neck(c);
      s += P('M180 324C188 316 212 316 220 324L228 372C210 384 190 384 172 372Z', '#fffaf2', 2.2) + '<circle cx="200" cy="334" r="4.6" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="1.4"/>';
      s += P('M172 372Q200 392 228 372L238 508H162Z', '#fffaf2', 2.2) + P('M186 392C184 430 178 470 172 508M214 392C216 430 222 470 228 508M200 392V508', 'none', 1.2, '#b9ae9c');
      s += '<g transform="translate(200 0) scale(.92 1) translate(-200 0)">' + armChest('#fffaf2', INK, '<g transform="translate(232 366) rotate(26)"><rect x="-8" y="-4" width="16" height="44" rx="3" fill="#1c1822" stroke="' + INK + '" stroke-width="1.6"/><ellipse cy="-13" rx="12" ry="14" fill="#b9b0a2" stroke="' + INK + '" stroke-width="2"/></g>') + '</g>';
      return s;
    }
  };
  CAST.takumi = {
    male: true, face: FACE_M, turn: -4, tilt: -2, tiltEx: { smirk: -2, angry: -1 }, eye: clone(EYE_M, { c: ['#16121c', '#44608a'], wing: [-28, -5], T: 3 }), brow: { col: INK, w: 2.8, y: -24, arch: 5 },
    hair: { fill: '#1a1620', sh: '#0e0b13', ln: '#3a3248', hi2: '#4f4866',
      back: 'M204 88C156 88 124 118 120 176C116 240 112 320 104 400C102 440 106 470 112 508H288C294 470 298 440 296 400C288 320 284 240 280 176C276 118 248 88 204 88Z',
      backS: ['M124 250C120 320 114 400 112 508H146C150 410 150 330 148 264Z', 'M276 250C280 320 286 400 288 508H254C250 410 250 330 252 264Z'],
      side: ['M186 104C154 130 138 196 136 258C134 300 130 330 122 356C146 342 156 310 158 266C160 210 174 150 202 110Z', 'M216 104C248 132 262 196 264 258C266 298 270 330 276 352C256 340 246 308 244 266C242 210 232 150 208 112Z'],
      fringe: ['M210 92C172 98 150 130 148 174C168 158 192 136 208 112Z', 'M214 92C232 108 248 136 254 170C264 142 250 106 224 92Z'],
      hi: ['M154 142C170 124 188 118 206 120L200 130L190 124L184 136L174 128Z', 'M226 118C240 124 250 134 254 148L244 140L240 150L232 134Z'] },
    body: function (u, c) { return suit(c, '#22202a', '#f7f4ee', '#b01a2c') + armChest('#22202a', '#3a3248'); }
  };
  CAST.naoki = {
    male: true, ears: true, face: FACE_M, turn: 4, tilt: 3, tiltEx: { happy: 2 }, castX: 3, closedHappy: true, eye: clone(EYE_M, { c: ['#3a2410', '#a06a30'], ir: [1, 0, 11.5, 13.5], c1: [-15, -10], c2: [5, -14] }), brow: { col: '#4a2c10', w: 3.2, y: -24, arch: 8 },
    hair: { fill: '#a65f2a', sh: '#7a431a', ln: '#5c3214', hi2: '#d2925a',
      back: 'M128 180C122 136 152 96 200 94C248 96 278 136 272 180C276 200 276 222 268 240L256 232L250 256L150 256L144 232L132 240C124 222 124 200 128 180Z', backS: ['M134 210C132 224 134 234 136 238L146 232L148 250L160 240Z', 'M266 210C268 224 266 234 264 238L254 232L252 250L240 240Z'],
      pre: P('M150 112C144 96 150 86 160 80C162 90 168 96 178 98C178 86 186 76 198 72C198 84 206 92 216 94C222 84 232 80 244 82C238 92 240 102 250 112Z', '#a65f2a', 4.2),
      side: ['M160 124C148 150 146 196 146 232C152 220 160 200 164 180C166 160 176 140 188 126Z', 'M240 124C252 150 254 196 254 232C248 220 240 200 236 180C234 160 224 140 212 126Z'],
      fringe: ['M198 100C164 104 148 134 150 172L168 158L174 178C188 162 200 138 206 118Z', 'M204 100C208 126 216 154 230 172L240 156C244 132 230 108 212 100Z'],
      hi: ['M158 140C172 124 186 120 202 120L198 130L188 124L182 136L172 128Z'] },
    body: function (u, c) {
      var s = P(TORSO, '#c9243a', 3.6) + P('M96 374C90 404 84 460 82 508H106C108 464 114 424 122 396Z', '#a01a2c') + neck(c) + P('M172 348Q200 372 228 348', 'none', 2.4, INK);
      s += P('M166 374Q200 396 234 374', 'none', 7, '#f3ece0') + '<text x="186" y="466" text-anchor="middle" font-family="Impact,sans-serif" font-size="48" fill="#f3ece0">TN</text>';
      s += armChest('#c9243a', INK, sticks());
      return s;
    },
    faceAcc: function () { return P('M152 158C180 148 220 148 248 158L250 170C222 160 178 160 150 170Z', '#f3ece0', 1.8); }
  };
  CAST.junko = {
    turn: 3, tilt: 1, tiltEx: { smirk: 2, sad: -3 }, castX: 3, eye: clone(EYE_W, { c: ['#2a1f1a', '#7c6250'] }), lip: '#a8543f', brow: { col: '#221a1a', w: 2.6, y: -23, arch: 5 },
    hair: { fill: '#2a2230', sh: '#191320', ln: '#4b3f55', hi2: '#5d506a',
      back: 'M200 90C156 90 128 118 124 170C122 212 122 252 118 288C150 296 170 292 178 284L222 284C230 292 250 296 282 288C278 252 278 212 276 170C272 118 244 90 200 90Z',
      backS: ['M128 222C126 252 124 272 122 286C142 290 158 288 166 282C162 262 158 240 152 222Z', 'M272 222C274 252 276 272 278 286C258 290 242 288 234 282C238 262 242 240 248 222Z'],
      side: ['M164 118C148 146 140 194 138 240C138 256 138 270 140 284C154 276 158 256 160 226C162 186 172 152 188 124Z', 'M236 118C252 146 260 194 262 240C262 256 262 270 260 284C246 276 242 256 240 226C238 186 228 152 212 124Z'],
      fringe: ['M198 94C160 98 142 132 144 172C176 174 196 150 202 118Z', 'M204 94C240 98 258 132 256 172C224 174 206 150 202 118Z'],
      hi: ['M154 140C168 124 184 118 198 120L194 130L184 124L178 136L168 128Z', 'M246 140C232 124 216 118 204 120L208 130L218 124L224 136L234 128Z'] },
    body: function (u, c) {
      var C = '#e2d4bc', S = '#c9b89a';
      var s = '<g transform="translate(200 0) scale(.86 1) translate(-200 0)">' + P(TORSO, C, 3.6) + '</g>' + neck(c);
      s += P('M180 330C188 322 212 322 220 330L228 376C210 388 190 388 172 376Z', C, 2) + P('M178 346H222M175 360H225', 'none', 1.2, S);
      s += P('M112 452C150 440 214 438 284 452L286 480C230 470 160 472 116 484Z', S, 2.8) + P('M288 452C248 432 196 438 122 470L132 494C190 470 240 468 292 482Z', C, 2.8);
      s += hand2(128, 482, SKIN_C);
      return s;
    }
  };
  CAST.kyosuke = {
    male: true, ears: true, face: FACE_M, turn: -3, tilt: -2, tiltEx: { happy: -1 }, eye: clone(EYE_M, { c: ['#20160f', '#6a4a2a'] }), brow: { col: '#1a1416', w: 2.8, y: -23, arch: 5 },
    hair: { fill: '#26202c', sh: '#16121b', ln: '#463c50', hi2: '#5a4f68',
      back: 'M200 92C156 90 130 118 126 172C124 206 124 232 118 254L142 250L150 268L250 268L258 250L282 254C276 232 276 206 274 172C270 118 244 94 200 92Z', backS: ['M130 216C128 236 126 248 124 252L144 246L150 262L160 244Z', 'M270 216C272 236 274 248 276 252L256 246L250 262L240 244Z'],
      side: ['M162 122C148 150 144 196 144 236C150 224 158 204 162 182C166 158 176 138 188 126Z', 'M238 122C252 150 256 196 256 236C250 224 242 204 238 182C234 158 224 138 212 126Z'],
      fringe: ['M222 98C180 96 150 124 146 170C176 164 206 146 224 118Z', 'M226 98C242 112 254 138 254 168C266 138 250 106 232 98Z'],
      hi: ['M156 138C176 120 196 114 214 116L208 126L198 120L190 132L180 124L172 138Z'] },
    body: function (u, c) {
      var C = '#6f7d68', S = '#596552';
      var s = P(TORSO, C, 3.6) + P('M96 374C90 404 84 460 82 508H106C108 464 114 424 122 396Z', S) + neck(c) + vNeck(c);
      s += P('M170 346L154 384L184 406L200 386L216 406L246 384L230 346', '#7f8e77', 2.2);
      s += P('M200 386V508', 'none', 1.8, S) + [420, 450, 480].map(function (y) { return '<circle cx="207" cy="' + y + '" r="2.6" fill="#efe7da" stroke="' + INK + '" stroke-width="1"/>'; }).join('');
      return s;
    }
  };
  CAST.shoji = {
    male: true, slim: true, ears: true, face: FACE_M, turn: 3, tilt: 3, tiltEx: { sad: -3 }, castX: 3, eye: clone(EYE_M, { c: ['#20160f', '#8a6240'], ir: [1, 0, 11, 13], c1: [-15, -10], c2: [5, -14] }), brow: { col: '#3e2a1c', w: 2.6, y: -24, arch: 7 },
    hair: { fill: '#5e4432', sh: '#412e20', ln: '#2e2014', hi2: '#8a6a4e',
      back: 'M200 90C156 90 128 118 124 172C122 206 122 234 112 262L136 256L138 290C152 280 160 266 164 254L236 254C240 266 248 280 262 290L264 256L288 262C278 234 278 206 276 172C272 118 244 90 200 90Z', backS: ['M128 216C126 240 122 252 118 258L138 250L142 278C152 268 156 256 158 242Z', 'M272 216C274 240 278 252 282 258L262 250L258 278C248 268 244 256 242 242Z'],
      side: ['M166 118C148 146 142 194 142 238C150 226 158 206 162 184C166 158 176 136 190 124Z', 'M234 118C252 146 258 194 258 238C250 226 242 206 238 184C234 158 224 136 210 124Z'],
      fringe: ['M196 94C160 98 144 132 146 174L164 160C172 148 186 132 196 114Z', 'M200 94C188 118 184 150 188 180C202 168 214 144 214 112Z', 'M208 96C228 108 246 136 254 174C264 142 246 106 218 96Z'],
      hi: ['M156 140C170 124 184 118 196 120L192 130L182 124L176 136L166 128Z', 'M224 122C238 128 248 136 252 148L242 142L238 150L230 136Z'] },
    body: function (u, c) {
      var s = '<g transform="translate(200 0) scale(.92 1) translate(-200 0)">' + P(TORSO, '#e8ddc8', 3.6) + '</g>' + neck(c) + vNeck(c);
      s += P('M156 352L176 348L200 420L224 348L244 352L256 508H144Z', '#8c6a3e', 2.6);
      s += P('M178 356L170 400M222 356L230 400', 'none', 2, '#6a4e2a');
      s += '<circle cx="172" cy="456" r="6" fill="' + RED + '"/><circle cx="186" cy="478" r="4.6" fill="#2d6ca6"/><circle cx="226" cy="464" r="5" fill="' + GOLD + '"/>';
      s += '<g transform="translate(200 0) scale(.92 1) translate(-200 0)">' + armChest('#e8ddc8', INK, '<g transform="rotate(24 236 366)"><rect x="233" y="310" width="6" height="74" fill="#6a4e2a" stroke="' + INK + '" stroke-width="1.4"/><path d="M231 310L241 310L238 292L234 292Z" fill="' + RED + '" stroke="' + INK + '" stroke-width="1.2"/></g>') + '</g>';
      return s;
    }
  };
  CAST.misato = {
    turn: -3, tilt: -3, tiltEx: { happy: -2, shock: 3 }, closedHappy: true, eye: clone(EYE_H, { c: ['#4a1f38', '#d86a96'] }), brow: { col: '#a79470', w: 2, y: -24, arch: 7 },
    hair: { fill: '#f4ebd2', sh: '#d9c79e', ln: '#a8966e', hi2: '#fffbee',
      pre: P('M132 130C96 138 78 186 82 248C84 288 98 320 118 340C124 310 128 280 130 250C132 210 138 170 150 140Z', '#f4ebd2', 4) + P('M268 130C304 138 322 186 318 248C316 288 302 320 282 340C276 310 272 280 270 250C268 210 262 170 250 140Z', '#f4ebd2', 4) + P('M102 214C96 250 104 298 116 322C120 296 122 270 124 244Z', '#d9c79e') + P('M298 214C304 250 296 298 284 322C280 296 278 270 276 244Z', '#d9c79e'),
      back: 'M200 92C158 92 130 118 126 172C124 206 126 244 136 268L264 268C274 244 276 206 274 172C270 118 242 92 200 92Z', backS: [],
      side: ['M162 120C146 148 142 192 144 230C150 220 156 200 160 180C164 156 174 138 188 124Z', 'M238 120C254 148 258 192 256 230C250 220 244 200 240 180C236 156 226 138 212 124Z'],
      fringe: ['M198 96C160 100 144 134 146 172C162 166 182 148 192 118Z', 'M204 94C176 110 172 144 178 176C192 170 206 146 210 114Z', 'M210 96C222 118 232 150 240 172C254 160 256 134 240 108Z'],
      hi: ['M156 140C170 124 186 118 200 120L196 130L186 124L180 136L170 128Z'] },
    body: function (u, c) {
      var s = '<g transform="translate(200 0) scale(.82 1) translate(-200 0)">' + P(TORSO, '#16121c', 3.6, '#4a4254') + '</g>' + neck(c);
      s += P('M150 372C172 412 228 412 250 372L268 396C232 448 168 448 132 396Z', '#fff', 2.4);
      s += P('M132 396Q150 416 168 422Q200 434 232 422Q250 416 268 396', 'none', 1.4, '#b9ae9c');
      [[150, 466, RED, 'B'], [186, 482, GOLD, 'L'], [222, 482, PINK, 'A'], [254, 462, '#f3ece0', 'S']].forEach(function (b) { s += '<g transform="translate(' + b[0] + ' ' + b[1] + ')"><circle r="13" fill="' + b[2] + '" stroke="' + INK + '" stroke-width="1.8"/><text y="5" text-anchor="middle" font-family="Impact,sans-serif" font-size="15" fill="' + INK + '">' + b[3] + '</text></g>'; });
      s += P('M182 306Q200 316 218 306L218 318Q200 328 182 318Z', INK, 1.5);
      return s;
    },
    faceAcc: function () { return '<g transform="translate(128 128) rotate(-22)">' + P('M0 0C-20 -14 -36 -6 -30 8C-24 18 -8 8 0 4C8 8 24 18 30 8C36 -6 20 -14 0 0Z', INK, 1.6, '#efe7da') + '<circle r="4.4" fill="' + RED + '"/></g><g transform="translate(272 128) rotate(22)">' + P('M0 0C-20 -14 -36 -6 -30 8C-24 18 -8 8 0 4C8 8 24 18 30 8C36 -6 20 -14 0 0Z', INK, 1.6, '#efe7da') + '<circle r="4.4" fill="' + RED + '"/></g>'; }
  };
  CAST.demon = {
    male: true, demon: true, ears: true, face: FACE_M, skin: '#d9d0e2', skinS: '#b4a8c4', turn: -3, tilt: 4, tiltEx: { smirk: 3, shock: -3 }, eye: clone(EYE_M, { c: ['#8a5a00', GOLD], wing: [-30, -8], T: 4, liner: true }), brow: { col: INK, w: 5, y: -22, arch: 3 },
    hair: { fill: '#f6f2ea', sh: '#cfc7d6', ln: '#8d8496', hi2: '#fff',
      pre: P('M154 112C120 86 110 40 134 2C140 42 166 70 192 92Z', INK, 3, GOLD) + P('M246 112C280 86 290 40 266 2C260 42 234 70 208 92Z', INK, 3, GOLD),
      back: 'M200 90C150 90 120 118 116 170L66 228L114 216L74 290L128 252L130 280L270 280L272 252L326 290L286 216L334 228L284 170C280 118 250 90 200 90Z',
      backS: ['M120 196L84 226L120 216L90 276L134 246Z', 'M280 196L316 226L280 216L310 276L266 246Z'],
      side: [], fringe: ['M200 94C160 98 144 130 146 168C170 158 192 136 200 114Z', 'M200 94C240 98 256 130 254 168C230 158 208 136 200 114Z'], hi: [] },
    body: function (u) {
      var s = P('M0 532C10 438 70 372 150 340L200 430L250 340C330 372 390 438 400 532Z', RED, 2.6) + P('M0 532C30 470 66 402 150 340L120 480L60 532Z', INK) + P('M400 532C370 470 334 402 250 340L280 480L340 532Z', INK);
      s += P('M60 266L150 338L250 338L340 266L306 392L260 352L200 430L140 352L94 392Z', INK, 2.6, GOLD);
      s += '<circle cx="200" cy="444" r="15" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="2.4"/>' + P('M192 438l5 5M208 438l-5 5M193 452Q200 446 207 452', 'none', 2.2, INK);
      s += '<g transform="translate(320 462) rotate(14)"><rect x="-26" y="-34" width="52" height="118" rx="9" fill="#26432f" stroke="' + INK + '" stroke-width="2.6"/><rect x="-10" y="-66" width="20" height="36" fill="#26432f" stroke="' + INK + '" stroke-width="2.6"/><rect x="-19" y="-16" width="38" height="80" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.8"/><text y="16" text-anchor="middle" font-size="24" font-family="serif" font-weight="900" fill="' + RED + '">魔</text><text y="50" text-anchor="middle" font-size="24" font-family="serif" font-weight="900" fill="' + INK + '">王</text></g>';
      return s;
    },
    faceAcc: function () { return P('M200 262C178 252 158 260 144 244C154 276 184 276 200 268C216 276 246 276 256 244C242 260 222 252 200 262Z', INK) + P('M186 284L200 326L214 284Z', INK); }
  };

  /* ---------- scenes ---------- */
  function flakes(seed, count, r0, r1) {
    var R = rng(seed), out = '';
    for (var i = 0; i < count; i++) {
      var x = n(R() * 1600), y = n(R() * 900), r = n(r0 + R() * (r1 - r0));
      out += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"/><circle cx="' + x + '" cy="' + (y - 900) + '" r="' + r + '"/>';
    }
    return out;
  }
  function rain(seed, count) {
    var R = rng(seed), out = '';
    for (var i = 0; i < count; i++) {
      var x = n(R() * 1800 - 100), y = n(R() * 900), l = 40 + R() * 70;
      var seg = 'l' + n(-l * .32) + ' ' + n(l);
      out += '<path d="M' + x + ' ' + y + seg + '"/><path d="M' + x + ' ' + (y - 900) + seg + '"/>';
    }
    return out;
  }
  function skyline(seed, base, col, minH, maxH) {
    var R = rng(seed), x = -20, d = 'M-20 ' + base;
    while (x < 1640) {
      var w = 40 + R() * 90, h = minH + R() * (maxH - minH);
      d += 'V' + n(base - h) + 'H' + n(x + w);
      x += w;
    }
    return '<path d="' + d + 'V' + (base + 400) + 'H-20Z" fill="' + col + '"/>';
  }
  function windows(seed, count, x0, x1, y0, y1, cols) {
    var R = rng(seed), out = '';
    for (var i = 0; i < count; i++) {
      out += '<rect x="' + n(x0 + R() * (x1 - x0)) + '" y="' + n(y0 + R() * (y1 - y0)) + '" width="7" height="10" fill="' + cols[Math.floor(R() * cols.length)] + '" opacity="' + n(.4 + R() * .6) + '"/>';
    }
    return out;
  }
  function wrap(cls, inner, u) {
    return '<div class="ng-scene ng-scene-' + cls + '" style="position:absolute;inset:0;overflow:hidden;background:' + INK + '">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true"><defs>' + toneDefs(u) + '</defs>' + inner + '</svg></div>';
  }
  function glassDrawn(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-26 -60L-20 40Q0 48 20 40L26 -60Z" fill="#fff" fill-opacity=".55" stroke="' + INK + '" stroke-width="3"/>' +
      [[-10, -24], [10, -6], [-8, 18]].map(function (p) { return '<g transform="translate(' + p[0] + ' ' + p[1] + ')"><path d="M0 11C-10 4 -9 -6 -5 -7C-2 -9 2 -9 5 -7C9 -6 10 4 0 11Z" fill="' + STRAW + '" stroke="' + INK + '" stroke-width="1.2"/><path d="M-5 -7L0 -11L5 -7L0 -5Z" fill="' + INK + '"/></g>'; }).join('') + '</g>';
  }

  var SCENES = {
    'train-snow': function (u) {
      return '<linearGradient id="' + u + 'n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101428"/><stop offset="1" stop-color="#39405e"/></linearGradient>' +
        '<rect width="1600" height="900" fill="' + PAPER2 + '"/><rect width="1600" height="900" fill="url(#' + u + 'fine)" opacity=".5"/>' +
        '<rect y="0" width="1600" height="70" fill="' + INK2 + '"/><path d="M0 100H1600" stroke="' + INK + '" stroke-width="10"/>' +
        [[120, 640], [840, 640]].map(function (w) {
          return '<g><rect x="' + w[0] + '" y="150" width="' + w[1] + '" height="400" rx="28" fill="url(#' + u + 'n)" stroke="' + INK + '" stroke-width="14"/>' +
            '<path d="M' + w[0] + ' 500Q' + (w[0] + 200) + ' 462 ' + (w[0] + 400) + ' 496T' + (w[0] + w[1]) + ' 480V538Q' + (w[0] + w[1]) + ' 550 ' + (w[0] + w[1] - 22) + ' 550H' + (w[0] + 22) + 'Q' + w[0] + ' 550 ' + w[0] + ' 528Z" fill="#eef1f6"/></g>';
        }).join('') +
        '<g fill="#fff" class="sc-fall sc-slow" opacity=".9">' + flakes(11, 90, 1.6, 4) + '</g>' +
        '<g fill="#fff" class="sc-fall" opacity=".95">' + flakes(23, 40, 3.5, 7.5) + '</g>' +
        '<rect y="640" width="1600" height="260" fill="' + INK + '"/>' +
        [[210, 7], [1050, 8]].map(function (s) {
          return '<g transform="translate(' + s[0] + ' 0)"><path d="M0 900V620Q0 560 60 560H300Q360 560 360 620V900Z" fill="' + INK2 + '" stroke="' + PAPER + '" stroke-width="3"/><rect x="60" y="570" width="240" height="66" rx="10" fill="' + (s[1] === 7 ? RED : PINK) + '" stroke="' + INK + '" stroke-width="3"/><text x="180" y="622" text-anchor="middle" font-family="Impact,sans-serif" font-size="54" fill="' + INK + '">' + s[1] + '</text></g>';
        }).join('');
    },
    'room-707': function (u) {
      return '<radialGradient id="' + u + 'l" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#fff2c9" stop-opacity=".95"/><stop offset="1" stop-color="#fff2c9" stop-opacity="0"/></radialGradient>' +
        '<rect width="1600" height="900" fill="' + PAPER + '"/><rect width="1600" height="620" fill="url(#' + u + 'dots)" opacity=".22"/>' +
        // window on tokyo
        '<rect x="520" y="70" width="640" height="430" fill="#141a33" stroke="' + INK + '" stroke-width="16"/>' + '<g clip-path="none">' + '<svg x="528" y="78" width="624" height="414" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">' + skyline(5, 900, '#0b0d1c', 200, 620) + windows(7, 160, 0, 1600, 300, 880, [GOLD, '#fff', PINK]) + '</svg></g>' + '<path d="M840 70V500M520 280H1160" stroke="' + INK + '" stroke-width="10"/>' +
        '<path d="M520 70C500 240 508 400 470 540L560 500C574 330 560 170 600 70Z" fill="' + PINK + '" stroke="' + INK + '" stroke-width="4" opacity=".9"/><path d="M1160 70C1180 240 1172 400 1210 540L1120 500C1106 330 1120 170 1080 70Z" fill="' + PINK + '" stroke="' + INK + '" stroke-width="4" opacity=".9"/>' +
        // door
        '<rect x="90" y="110" width="280" height="560" fill="' + INK2 + '" stroke="' + INK + '" stroke-width="10"/><rect x="146" y="164" width="168" height="74" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="5"/><text x="230" y="222" text-anchor="middle" font-family="Impact,sans-serif" font-size="62" fill="' + RED + '">707</text><circle cx="330" cy="400" r="14" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="4"/>' +
        // posters, tape
        '<g transform="translate(1260 110) rotate(4)"><rect width="230" height="310" fill="' + INK + '"/><text x="115" y="190" text-anchor="middle" font-family="Impact,sans-serif" font-size="78" fill="' + PAPER + '">BLAST</text><rect x="72" y="-16" width="86" height="30" fill="' + GOLD + '" opacity=".7"/></g>' +
        // floor and table
        '<rect y="660" width="1600" height="240" fill="#b89a7a"/><rect y="660" width="1600" height="240" fill="url(#' + u + 'hatch)" opacity=".35"/><path d="M0 660H1600" stroke="' + INK + '" stroke-width="8"/>' +
        '<path d="M520 716H1100L1160 800H460Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="6"/><rect x="500" y="800" width="24" height="84" fill="' + INK + '"/><rect x="1096" y="800" width="24" height="84" fill="' + INK + '"/>' +
        glassDrawn(730, 676, 1.05) + glassDrawn(880, 676, 1.05) +
        '<rect x="980" y="710" width="90" height="10" fill="' + INK + '"/><rect x="990" y="694" width="80" height="16" fill="' + RED + '" stroke="' + INK + '" stroke-width="3"/><g transform="rotate(-8 320 810)"><rect x="230" y="752" width="190" height="104" rx="16" fill="url(#' + u + 'tartan)" stroke="' + INK + '" stroke-width="6"/></g>' +
        '<ellipse cx="620" cy="706" rx="26" ry="9" fill="#a79ea4" stroke="' + INK + '" stroke-width="3"/><path d="M618 702l26 -9" stroke="' + PAPER + '" stroke-width="5"/>' +
        // guitar
        '<g transform="translate(1380 720) rotate(-12)"><rect x="-10" y="-330" width="20" height="300" fill="' + INK + '"/><path d="M0 -60C-90 -60 -90 30 -56 50C-90 110 -60 170 0 170C60 170 90 110 56 50C90 30 90 -60 0 -60Z" fill="' + RED + '" stroke="' + INK + '" stroke-width="6"/><circle cy="40" r="22" fill="' + INK + '"/></g>' +
        '<rect width="1600" height="900" fill="url(#' + u + 'l)" opacity=".18"/>';
    },
    'jackson-hole': function (u) {
      return '<radialGradient id="' + u + 'g" cx=".5" cy=".2" r=".8"><stop offset="0" stop-color="#ffd67a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd67a" stop-opacity="0"/></radialGradient>' +
        '<rect width="1600" height="900" fill="#2b1f1b"/><rect width="1600" height="520" fill="url(#' + u + 'whatch)" opacity=".25"/>' +
        '<g transform="rotate(-3 800 150)"><rect x="470" y="60" width="660" height="150" rx="16" fill="' + INK + '" stroke="' + RED + '" stroke-width="6"/><text x="800" y="170" text-anchor="middle" font-family="Impact,sans-serif" font-size="118" fill="' + PINK + '" letter-spacing="10">BURGERS</text></g>' +
        [[200, 250, 8], [1180, 260, -6]].map(function (f) { return '<g transform="translate(' + f[0] + ' ' + f[1] + ') rotate(' + f[2] + ')"><rect width="220" height="280" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="5"/><rect x="20" y="20" width="180" height="150" fill="url(#' + u + 'dots)"/><path d="M20 200H200M20 226H170M20 252H190" stroke="' + INK + '" stroke-width="7"/></g>'; }).join('') +
        '<rect y="600" width="1600" height="300" fill="#6f2a23"/><path d="M0 600H1600" stroke="' + INK + '" stroke-width="12"/><rect y="618" width="1600" height="10" fill="' + GOLD + '"/>' +
        [240, 560, 880, 1200].map(function (x) { return '<g transform="translate(' + x + ' 690)"><rect x="-10" y="40" width="20" height="170" fill="' + PAPER2 + '" stroke="' + INK + '" stroke-width="4"/><ellipse rx="90" ry="34" fill="' + RED + '" stroke="' + INK + '" stroke-width="6"/></g>'; }).join('') +
        '<g transform="translate(800 556)"><ellipse cy="40" rx="150" ry="20" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="5"/><path d="M-90 0C-90 -70 90 -70 90 0Z" fill="#c98b45" stroke="' + INK + '" stroke-width="5"/><rect x="-98" y="0" width="196" height="12" rx="6" fill="#6f9f3a" stroke="' + INK + '" stroke-width="3"/><rect x="-92" y="12" width="184" height="16" rx="6" fill="#4a2a18" stroke="' + INK + '" stroke-width="3"/><path d="M-90 30H90L80 40H-80Z" fill="#c98b45" stroke="' + INK + '" stroke-width="4"/></g>' +
        '<rect width="1600" height="900" fill="url(#' + u + 'g)"/>';
    },
    'live-house': function (u) {
      var beams = [[300, RED], [800, PAPER], [1300, PINK]].map(function (b) {
        return '<path d="M' + b[0] + ' -10L' + (b[0] - 280) + ' 640H' + (b[0] + 280) + 'Z" fill="' + b[1] + '" opacity=".26" class="sc-beam"/>';
      }).join('');
      var R = rng(42), crowd = '';
      for (var i = 0; i < 34; i++) {
        var x = i * 50 - 20 + R() * 20, y = 760 + R() * 60;
        crowd += '<circle cx="' + n(x) + '" cy="' + n(y) + '" r="34" fill="' + INK + '"/>';
        if (i % 3 === 0) crowd += '<path d="M' + n(x + 20) + ' ' + n(y) + 'L' + n(x + 40) + ' ' + n(y - 130) + 'L' + n(x + 28) + ' ' + n(y - 160) + 'M' + n(x + 40) + ' ' + n(y - 130) + 'L' + n(x + 54) + ' ' + n(y - 162) + '" stroke="' + INK + '" stroke-width="16" stroke-linecap="round" fill="none"/>';
      }
      return '<rect width="1600" height="900" fill="#17131a"/><rect width="1600" height="640" fill="url(#' + u + 'wdots)" opacity=".14"/>' + beams +
        '<rect y="560" width="1600" height="90" fill="' + INK2 + '" stroke="' + PAPER + '" stroke-width="3"/>' +
        '<g fill="' + INK + '" stroke="' + PAPER + '" stroke-width="3"><rect x="150" y="310" width="230" height="250"/><rect x="1220" y="310" width="230" height="250"/><path d="M150 435H380M1220 435H1450" fill="none"/></g>' +
        '<g fill="url(#' + u + 'wdots)"><circle cx="265" cy="372" r="48"/><circle cx="265" cy="498" r="48"/><circle cx="1335" cy="372" r="48"/><circle cx="1335" cy="498" r="48"/></g>' +
        '<g transform="translate(800 430)"><ellipse rx="96" ry="96" cy="50" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="7"/><text y="74" text-anchor="middle" font-family="Impact,sans-serif" font-size="56" fill="' + RED + '">BLAST</text><rect x="-210" y="-20" width="84" height="52" rx="26" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="5"/><rect x="126" y="-20" width="84" height="52" rx="26" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="5"/><ellipse cx="-168" cy="-46" rx="70" ry="12" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="4"/><ellipse cx="168" cy="-46" rx="70" ry="12" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="4"/></g>' +
        '<g transform="translate(440 300)" stroke="' + PAPER + '" stroke-width="7"><path d="M0 0V270"/><circle cy="-14" r="20" fill="' + INK + '"/></g>' +
        crowd;
    },
    'tokyo-night': function (u) {
      return '<linearGradient id="' + u + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#090b1d"/><stop offset=".7" stop-color="#3c1e4a"/><stop offset="1" stop-color="#d3122a"/></linearGradient>' +
        '<rect width="1600" height="900" fill="url(#' + u + 's)"/><rect width="1600" height="900" fill="url(#' + u + 'wdots)" opacity=".1"/>' +
        '<g fill="#fff">' + flakes(3, 50, 1, 2.2).replace(/cy="-\d+[.\d]*"/g, 'cy="20"') + '</g>' +
        // an original lattice tower
        '<g transform="translate(1180 170)" fill="none" stroke="' + STRAW + '" stroke-width="5"><path d="M0 0L-110 620M0 0L110 620M-70 360L70 360M-52 260H52M-38 180H38M-90 480H90"/><path d="M-78 360L62 480M78 360L-62 480M-52 260L38 180M52 260L-38 180" stroke-width="2.4"/></g>' +
        skyline(19, 900, '#14112a', 200, 560) + windows(31, 260, 0, 1600, 360, 880, [GOLD, '#fff', PINK, '#7fd7ff']) +
        skyline(37, 900, INK, 80, 360) + windows(41, 120, 0, 1600, 560, 880, [GOLD, PINK]) +
        '<g transform="translate(180 420) rotate(-2)"><rect width="160" height="280" fill="' + INK + '" stroke="' + PINK + '" stroke-width="5"/><text x="80" y="108" text-anchor="middle" font-family="Impact,sans-serif" font-size="88" fill="' + PINK + '">酒</text><text x="80" y="226" text-anchor="middle" font-family="Impact,sans-serif" font-size="88" fill="' + GOLD + '">夜</text></g>' +
        '<path d="M0 760Q400 690 800 750T1600 720" fill="none" stroke="' + INK + '" stroke-width="4"/><path d="M0 800Q500 720 1000 790T1600 770" fill="none" stroke="' + INK + '" stroke-width="3"/>';
    },
    newsstand: function (u) {
      var heads = [['SCANDAL!!', RED, PAPER], ['WHO IS HE', INK, GOLD], ['NANA?!', PINK, INK], ['EXPOSED', PAPER, RED], ['L♥VE NEST', GOLD, INK], ['TEARS!', INK, PINK], ['SHOCK', RED, GOLD], ['TRUTH?', PAPER, INK]];
      var mags = heads.map(function (h, i) {
        var x = 80 + (i % 4) * 370, y = i < 4 ? 100 : 430, r = (i * 37 % 7) - 3;
        return '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ')"><rect width="330" height="300" fill="' + h[1] + '" stroke="' + INK + '" stroke-width="6"/><text x="165" y="96" text-anchor="middle" font-family="Impact,sans-serif" font-size="58" fill="' + h[2] + '">' + h[0] + '</text><rect x="30" y="118" width="130" height="150" fill="url(#' + u + 'dots)" stroke="' + INK + '" stroke-width="3"/><path d="M180 134H300M180 164H270M180 194H304M180 224H262M180 254H296" stroke="' + (h[1] === INK ? PAPER : INK) + '" stroke-width="8"/></g>';
      }).join('');
      return '<rect width="1600" height="900" fill="#2a2a2e"/><rect width="1600" height="900" fill="url(#' + u + 'whatch)" opacity=".18"/>' + mags +
        '<path d="M0 0H1600V60L1500 90L1400 60L1300 90L1200 60L1100 90L1000 60L900 90L800 60L700 90L600 60L500 90L400 60L300 90L200 60L100 90L0 60Z" fill="' + RED + '" stroke="' + INK + '" stroke-width="5"/><rect y="760" width="1600" height="140" fill="' + INK + '"/>';
    },
    arena: function (u) {
      var R = rng(77), lights = '';
      for (var i = 0; i < 620; i++) {
        var r = 150 + R() * 700, a = Math.PI * (1.02 + R() * .96);
        lights += '<circle cx="' + n(800 + Math.cos(a) * r * 1.1) + '" cy="' + n(640 + Math.sin(a) * r * .62) + '" r="' + n(1.2 + R() * 2.4) + '" fill="' + (i % 5 === 0 ? PINK : i % 3 === 0 ? GOLD : '#fff') + '"/>';
      }
      var beams = [80, 340, 620, 980, 1260, 1520].map(function (x, j) { return '<path d="M' + x + ' -20L' + (800 + (x - 800) * .15 - 40) + ' 700H' + (800 + (x - 800) * .15 + 40) + 'Z" fill="' + (j % 2 ? PINK : '#fff') + '" opacity=".15" class="sc-beam"/>'; }).join('');
      return '<rect width="1600" height="900" fill="#060510"/>' + lights + beams +
        '<path d="M300 900L460 620H1140L1300 900Z" fill="' + INK2 + '" stroke="' + PAPER + '" stroke-width="4"/><rect x="520" y="130" width="560" height="260" fill="' + INK + '" stroke="' + RED + '" stroke-width="7"/><text x="800" y="300" text-anchor="middle" font-family="Impact,sans-serif" font-size="170" fill="' + PAPER + '" letter-spacing="8">BLAST</text><rect x="520" y="130" width="560" height="260" fill="url(#' + u + 'wdots)" opacity=".3"/>' +
        '<g transform="translate(800 560)" stroke="' + PAPER + '" stroke-width="7"><path d="M0 0V130"/><circle cy="-16" r="18" fill="' + INK + '"/></g>';
    },
    'rain-rift': function (u) {
      return '<linearGradient id="' + u + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0d15"/><stop offset="1" stop-color="#2e3a52"/></linearGradient>' +
        '<radialGradient id="' + u + 'p" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9b3" stop-opacity=".6"/><stop offset="1" stop-color="#ffe9b3" stop-opacity="0"/></radialGradient>' +
        '<rect width="1600" height="900" fill="url(#' + u + 's)"/>' +
        '<rect x="940" y="60" width="520" height="700" fill="' + INK + '" stroke="#4a4246" stroke-width="4"/>' +
        (function () { var o = ''; for (var r = 0; r < 7; r++) for (var c = 0; c < 6; c++) { var lit = (r !== 0 || c !== 3) && (r * 7 + c * 3) % 5 === 0; o += '<rect x="' + (980 + c * 76) + '" y="' + (100 + r * 90) + '" width="52" height="62" fill="' + (lit ? '#ffd885' : '#181b28') + '" stroke="#3a3f52" stroke-width="2"/>'; } return o; })() +
        '<rect x="1205" y="92" width="68" height="78" fill="none" stroke="' + STRAW + '" stroke-width="4"/>' +
        '<rect y="740" width="1600" height="160" fill="#10141f"/><path d="M0 740H1600" stroke="#4a4246" stroke-width="4"/>' +
        '<g transform="translate(360 0)"><path d="M0 760V150Q0 90 60 90H150" fill="none" stroke="#2e2a33" stroke-width="16"/><path d="M130 86H220L232 118H118Z" fill="' + INK + '"/><circle cx="175" cy="210" r="320" fill="url(#' + u + 'p)"/><ellipse cx="175" cy="800" rx="210" ry="30" fill="#ffe9b3" opacity=".25"/></g>' +
        '<g transform="translate(535 640)"><path d="M-90 0Q0 -110 90 0Q60 -14 30 0Q0 -16 -30 0Q-60 -14 -90 0Z" fill="' + RED + '" stroke="' + INK + '" stroke-width="4"/><path d="M0 -8V120Q0 134 -14 134" fill="none" stroke="' + INK + '" stroke-width="5"/></g>' +
        '<g fill="none" stroke="#c6d3ec" stroke-width="2" class="sc-fall sc-fast" opacity=".55">' + rain(55, 150) + '</g>' +
        '<g fill="none" stroke="#fff" stroke-width="3" class="sc-fall sc-faster" opacity=".35">' + rain(91, 60) + '</g>';
    },
    'demon-realm': function (u) {
      var R = rng(99), pages = '', fl = '';
      for (var i = 0; i < 16; i++) {
        var x = R() * 1500, y = 60 + R() * 620, r = R() * 60 - 30;
        pages += '<g transform="translate(' + n(x) + ' ' + n(y) + ') rotate(' + n(r) + ')"><rect width="90" height="128" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3"/><rect x="10" y="10" width="70" height="46" fill="url(#' + u + 'dots)"/><rect x="10" y="62" width="32" height="56" fill="url(#' + u + 'hatch)"/><text x="62" y="96" text-anchor="middle" font-family="Impact,sans-serif" font-size="30" fill="' + RED + '">?</text></g>';
      }
      for (var j = 0; j < 22; j++) {
        var fx = j * 76 + R() * 30;
        var fh = 80 + R() * 180;
        fl += '<path d="M' + n(fx - 50) + ' 900C' + n(fx - 44) + ' ' + n(900 - fh * .6) + ' ' + n(fx + 16) + ' ' + n(900 - fh * .5) + ' ' + n(fx) + ' ' + n(900 - fh) + 'C' + n(fx + 50) + ' ' + n(900 - fh * .55) + ' ' + n(fx + 56) + ' 850 ' + n(fx + 56) + ' 900Z" fill="' + (j % 2 ? RED : GOLD) + '" stroke="' + INK + '" stroke-width="3"/>';
      }
      var rays = '';
      for (var k = 0; k < 18; k += 1) {
        var a = k / 18 * Math.PI * 2, a2 = a + .13;
        rays += '<path d="M800 380L' + n(800 + Math.cos(a) * 1300) + ' ' + n(380 + Math.sin(a) * 1300) + 'L' + n(800 + Math.cos(a2) * 1300) + ' ' + n(380 + Math.sin(a2) * 1300) + 'Z" fill="' + RED + '"/>';
      }
      return '<rect width="1600" height="900" fill="#1c0309"/><g opacity=".85" class="sc-spin">' + rays + '</g>' +
        '<g transform="translate(800 380)"><ellipse rx="340" ry="180" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="14"/><circle r="130" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="10"/><ellipse rx="26" ry="118" fill="' + INK + '"/><path d="M-340 0Q0 -270 340 0L300 -210L150 -160L0 -230L-150 -160L-300 -210Z" fill="' + INK + '"/></g>' +
        pages + fl + '<rect width="1600" height="900" fill="url(#' + u + 'wdots)" opacity=".08"/>';
    }
  };
  SCENES.studio = function (u) {
    var foam = '';
    for (var y = 0; y < 8; y++) for (var x = 0; x < 16; x++) foam += '<path d="M' + (x * 100) + ' ' + (y * 80) + 'h100l-50 80z" fill="' + ((x + y) % 2 ? '#2c282e' : '#232025') + '"/>';
    return '<rect width="1600" height="900" fill="#1a171c"/>' + foam + '<rect y="640" width="1600" height="260" fill="#574033"/><rect y="640" width="1600" height="260" fill="url(#' + u + 'hatch)" opacity=".3"/><path d="M0 640H1600" stroke="' + INK + '" stroke-width="10"/>' +
      '<g transform="translate(1040 300)"><rect width="340" height="360" fill="' + INK + '" stroke="' + PAPER + '" stroke-width="4"/><circle cx="90" cy="110" r="70" fill="url(#' + u + 'wdots)"/><circle cx="250" cy="110" r="70" fill="url(#' + u + 'wdots)"/><circle cx="90" cy="260" r="70" fill="url(#' + u + 'wdots)"/><circle cx="250" cy="260" r="70" fill="url(#' + u + 'wdots)"/></g>' +
      '<g transform="translate(420 520)" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="5"><ellipse cx="0" cy="110" rx="120" ry="120" fill="' + PAPER + '"/><ellipse cx="-180" cy="30" rx="80" ry="14"/><ellipse cx="180" cy="20" rx="80" ry="14"/></g>' +
      '<g transform="translate(120 280) rotate(-3)"><rect width="250" height="170" fill="' + PAPER + '"/><text x="125" y="70" text-anchor="middle" font-family="Impact,sans-serif" font-size="44" fill="' + RED + '">NO SMOKING</text><text x="125" y="130" text-anchor="middle" font-family="Courier New,monospace" font-size="30" fill="' + INK + '">(sorry, Nana)</text></g>' +
      '<g transform="translate(780 640)" stroke="' + PAPER + '" stroke-width="7"><path d="M0 0V-280"/><circle cy="-296" r="18" fill="' + INK + '"/></g><path d="M0 860C300 780 500 900 800 830S1300 760 1600 860" fill="none" stroke="' + INK + '" stroke-width="10"/>';
  };
  SCENES.penthouse = function (u) {
    return '<linearGradient id="' + u + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0f2a"/><stop offset="1" stop-color="#5a2c5e"/></linearGradient>' +
      '<rect width="1600" height="900" fill="url(#' + u + 's)"/>' + skyline(61, 680, '#0c0e22', 120, 420) + windows(63, 280, 0, 1600, 280, 670, [GOLD, '#fff', PINK]) +
      [260, 560, 860, 1160, 1460].map(function (x) { return '<rect x="' + x + '" y="0" width="14" height="680" fill="#c9c2b6"/>'; }).join('') +
      '<rect y="680" width="1600" height="220" fill="#ece6da"/><path d="M0 680H1600" stroke="' + INK + '" stroke-width="6"/><path d="M0 900L400 680M1600 900L1200 680M800 900V680" stroke="#b9b0a2" stroke-width="3"/>' +
      '<g transform="translate(200 610)"><path d="M0 110C-10 40 40 10 90 20H300C340 20 380 40 380 110V170H0Z" fill="' + INK + '" stroke="' + GOLD + '" stroke-width="4"/></g>' +
      '<g transform="translate(1120 540)"><path d="M0 240C-20 110 30 60 150 40C330 10 400 110 410 160L300 170C240 200 180 240 120 240Z" fill="' + INK + '" stroke="' + PAPER + '" stroke-width="4"/><path d="M60 240V300M340 170V300" stroke="' + INK + '" stroke-width="12"/></g>' +
      '<path d="M800 0V170" stroke="' + GOLD + '" stroke-width="4"/><g transform="translate(800 170)" fill="#fff" stroke="' + GOLD + '" stroke-width="3"><path d="M-110 0L-70 74H70L110 0Z" fill-opacity=".55"/><path d="M-70 74L-40 122H40L70 74Z" fill-opacity=".7"/></g>';
  };
  SCENES.rooftop = function (u) {
    return '<linearGradient id="' + u + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1540"/><stop offset=".6" stop-color="#b43a5e"/><stop offset="1" stop-color="#f4a24a"/></linearGradient>' +
      '<rect width="1600" height="900" fill="url(#' + u + 's)"/><circle cx="1160" cy="500" r="90" fill="#ffe3a8"/><g fill="#fff">' + flakes(71, 40, 1, 2.4).replace(/cy="-\d+[.\d]*"/g, 'cy="30"') + '</g>' +
      skyline(73, 680, '#231a3a', 80, 300) + windows(75, 90, 0, 1600, 420, 670, [GOLD, '#fff']) +
      '<rect y="660" width="1600" height="240" fill="#3a3238"/><rect y="660" width="1600" height="240" fill="url(#' + u + 'whatch)" opacity=".2"/>' +
      '<g stroke="' + INK + '" stroke-width="7" fill="none"><path d="M0 560H1600M0 640H1600"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (i) { return '<path d="M' + (i * 160) + ' 550V670"/>'; }).join('') + '</g>' +
      '<g transform="translate(180 420)"><rect width="260" height="260" fill="#7a6a58" stroke="' + INK + '" stroke-width="6"/><ellipse cx="130" rx="130" ry="30" fill="#8d7c68" stroke="' + INK + '" stroke-width="6"/><path d="M60 260V330M200 260V330" stroke="' + INK + '" stroke-width="14"/></g>' +
      '<path d="M1300 660l-20 -180M1280 480h160" stroke="' + INK + '" stroke-width="6" fill="none"/><path d="M1300 540C1360 520 1420 560 1480 540" fill="none" stroke="' + PINK + '" stroke-width="20"/>';
  };
  SCENES.hometown = function (u) {
    var houses = [[60, 300], [420, 260], [1000, 280], [1320, 310]].map(function (h, i) {
      return '<g transform="translate(' + h[0] + ' ' + h[1] + ')"><path d="M-30 150L120 20L280 150Z" fill="#fff" stroke="' + INK + '" stroke-width="5"/><rect y="150" width="250" height="260" fill="#6a5a4a" stroke="' + INK + '" stroke-width="5"/><rect x="40" y="210" width="70" height="90" fill="' + (i === 1 ? '#ffd885' : '#2a2a34') + '" stroke="' + INK + '" stroke-width="4"/><rect x="150" y="260" width="66" height="150" fill="' + INK + '"/></g>';
    }).join('');
    return '<linearGradient id="' + u + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8c97ad"/><stop offset="1" stop-color="#dfe3ea"/></linearGradient>' +
      '<rect width="1600" height="900" fill="url(#' + u + 's)"/><path d="M0 330L320 150L560 280L840 110L1180 300L1420 180L1600 280V500H0Z" fill="#fff" stroke="#9aa3b4" stroke-width="3"/>' + houses +
      '<path d="M0 690H1600V900H0Z" fill="#f2f4f8"/><path d="M640 690L420 900M960 690L1220 900" stroke="#c0c6d2" stroke-width="5"/>' +
      '<g transform="translate(800 240)"><rect x="-8" width="16" height="460" fill="' + INK + '"/><path d="M-120 30H120M-90 70H90" stroke="' + INK + '" stroke-width="7"/></g>' +
      '<g fill="#fff" class="sc-fall sc-slow">' + flakes(81, 80, 2, 5) + '</g><g fill="#fff" class="sc-fall">' + flakes(83, 30, 4, 8) + '</g>';
  };
  SCENES.platform = function (u) {
    return '<linearGradient id="' + u + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2038"/><stop offset="1" stop-color="#4a5474"/></linearGradient>' +
      '<rect width="1600" height="900" fill="url(#' + u + 's)"/>' +
      '<path d="M0 90H1600V140H0Z" fill="' + INK + '"/>' + [120, 520, 920, 1320].map(function (x) { return '<rect x="' + x + '" y="140" width="24" height="560" fill="' + INK + '"/><g transform="translate(' + (x + 12) + ' 150)"><rect x="-44" width="88" height="14" fill="#ffe9b3"/><path d="M-44 14L-210 560H210L44 14Z" fill="#ffe9b3" opacity=".12"/></g>'; }).join('') +
      '<g transform="translate(620 230)"><rect width="360" height="110" fill="#fff" stroke="' + INK + '" stroke-width="6"/><path d="M0 76H360" stroke="#2d6ca6" stroke-width="14"/><text x="180" y="58" text-anchor="middle" font-family="Georgia,serif" font-size="44" fill="' + INK + '">Hachiko Exit</text></g>' +
      '<rect y="700" width="1600" height="200" fill="#e9edf3"/><rect y="700" width="1600" height="26" fill="' + GOLD + '"/><rect y="700" width="1600" height="26" fill="url(#' + u + 'dots)" opacity=".4"/>' +
      '<g transform="translate(240 590)"><rect width="300" height="20" fill="' + RED + '" stroke="' + INK + '" stroke-width="4"/><rect y="36" width="300" height="20" fill="' + RED + '" stroke="' + INK + '" stroke-width="4"/><path d="M30 56V120M270 56V120" stroke="' + INK + '" stroke-width="12"/><path d="M0 0Q150 -18 300 0" fill="none" stroke="#fff" stroke-width="10"/></g>' +
      '<g fill="#fff" class="sc-fall sc-slow">' + flakes(87, 90, 2, 5) + '</g><g fill="#fff" class="sc-fall">' + flakes(89, 34, 4, 8) + '</g>';
  };
  SCENES.backstage = function (u) {
    var bulbs = '';
    for (var i = 0; i < 7; i++) bulbs += '<circle cx="' + (i * 66 + 40) + '" cy="-2" r="13" fill="#ffe9b3" stroke="' + INK + '" stroke-width="3"/><circle cx="' + (i * 66 + 40) + '" cy="322" r="13" fill="#ffe9b3" stroke="' + INK + '" stroke-width="3"/>';
    return '<rect width="1600" height="900" fill="#3a3238"/><rect width="1600" height="650" fill="url(#' + u + 'whatch)" opacity=".16"/>' +
      '<g transform="translate(120 120)"><rect width="480" height="320" fill="#a9b6c9" stroke="' + INK + '" stroke-width="10"/><rect width="480" height="320" fill="url(#' + u + 'wdots)" opacity=".3"/>' + bulbs + '</g>' +
      '<rect y="580" width="740" height="60" fill="#6a5a4a" stroke="' + INK + '" stroke-width="6"/>' +
      '<g transform="translate(760 90)"><path d="M0 40H720" stroke="' + PAPER + '" stroke-width="10"/>' + [[60, INK], [190, RED], [320, INK], [450, '#fff'], [580, PINK]].map(function (h) { return '<g transform="translate(' + h[0] + ' 40)"><path d="M0 0V40" stroke="' + PAPER + '" stroke-width="4"/><path d="M-60 40L60 40L74 400H-74Z" fill="' + h[1] + '" stroke="' + PAPER + '" stroke-width="3"/></g>'; }).join('') + '</g>' +
      '<rect y="640" width="1600" height="260" fill="#26222a"/><g transform="translate(860 650) rotate(5)"><rect width="340" height="170" fill="' + INK + '" stroke="' + PAPER + '" stroke-width="5"/><text x="170" y="104" text-anchor="middle" font-family="Impact,sans-serif" font-size="66" fill="' + PAPER + '">BLAST</text></g>' +
      '<g transform="translate(330 524) scale(.7)">' + glassPlain() + '</g><g transform="translate(150 164) rotate(-4)"><rect x="0" y="0" width="120" height="160" fill="' + PAPER + '"/><rect x="12" y="14" width="96" height="100" fill="url(#' + u + 'dots)"/></g>';
  };
  function glassPlain() { return '<rect x="-16" y="-24" width="32" height="60" rx="3" fill="#b9b0a2" stroke="' + INK + '" stroke-width="4"/><rect x="50" y="-40" width="26" height="76" fill="#26432f" stroke="' + INK + '" stroke-width="4"/>'; }
  SCENES.inn = function (u) {
    var shoji = '';
    for (var i = 0; i < 4; i++) {
      var x = 300 + i * 250, g = '';
      for (var a = 1; a < 4; a++) g += '<path d="M' + (a * 60) + ' 0V440" stroke="' + INK + '" stroke-width="3"/>';
      for (var b = 1; b < 6; b++) g += '<path d="M0 ' + (b * 73) + 'H240" stroke="' + INK + '" stroke-width="3"/>';
      shoji += '<g transform="translate(' + x + ' 150)"><rect width="240" height="440" fill="#fff4d8" stroke="' + INK + '" stroke-width="7"/>' + g + '</g>';
    }
    var tat = '';
    for (var t = 0; t < 8; t++) tat += '<path d="M' + (t * 230 - 120) + ' 900L' + (t * 150 + 260) + ' 610" stroke="#5a6a30" stroke-width="5"/>';
    return '<rect width="1600" height="900" fill="#3a2a1c"/>' + shoji +
      '<rect y="0" width="1600" height="120" fill="#2a1c12"/><path d="M0 120H1600" stroke="' + INK + '" stroke-width="12"/><rect x="60" y="120" width="44" height="490" fill="#5a3e24"/><rect x="1500" y="120" width="44" height="490" fill="#5a3e24"/>' +
      '<g transform="translate(90 120)"><path d="M0 0H180V190L150 170L120 200L90 170L60 200L30 170L0 190Z" fill="#23304e" stroke="' + INK + '" stroke-width="4"/><circle cx="90" cy="72" r="34" fill="none" stroke="#fff" stroke-width="6"/></g>' +
      '<rect y="610" width="1600" height="290" fill="#b9b878"/>' + tat +
      '<g transform="translate(610 720)"><rect width="380" height="50" fill="#4a2c1a" stroke="' + INK + '" stroke-width="5"/><path d="M40 50V130M340 50V130" stroke="' + INK + '" stroke-width="14"/><path d="M150 0C150 -40 230 -40 230 0Z" fill="#e4d9c6" stroke="' + INK + '" stroke-width="4"/></g>' +
      '<radialGradient id="' + u + 'w"><stop offset="0" stop-color="#ffcf80" stop-opacity=".5"/><stop offset="1" stop-color="#ffcf80" stop-opacity="0"/></radialGradient><rect width="1600" height="900" fill="url(#' + u + 'w)"/>';
  };
  SCENES['road-van'] = function (u) {
    return '<linearGradient id="' + u + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a6b"/><stop offset=".55" stop-color="#e8566a"/><stop offset="1" stop-color="#ffc06a"/></linearGradient>' +
      '<rect width="1600" height="900" fill="url(#' + u + 's)"/><circle cx="360" cy="560" r="130" fill="#ffe0a0"/><path d="M0 620L300 470L620 590L980 430L1300 580L1600 500V700H0Z" fill="#3a2a4e"/>' +
      '<rect y="660" width="1600" height="240" fill="#34303a"/><path d="M0 770H1600" stroke="' + GOLD + '" stroke-width="10" stroke-dasharray="90 60"/>' +
      '<path d="M0 660Q400 620 800 658T1600 640V670H0Z" fill="#4c6a34"/>' +
      '<g transform="translate(560 410)"><path d="M0 250V60Q0 10 60 10H360L470 120V250Z" fill="#efe6d8" stroke="' + INK + '" stroke-width="7"/><rect x="24" y="44" width="110" height="70" fill="#27425a" stroke="' + INK + '" stroke-width="5"/><rect x="164" y="44" width="110" height="70" fill="#27425a" stroke="' + INK + '" stroke-width="5"/><path d="M300 44H352L420 118H300Z" fill="#27425a" stroke="' + INK + '" stroke-width="5"/><text x="150" y="196" text-anchor="middle" font-family="Impact,sans-serif" font-size="58" fill="' + RED + '">BLAST</text><circle cx="96" cy="262" r="46" fill="' + INK + '"/><circle cx="96" cy="262" r="18" fill="#b9b0a2"/><circle cx="376" cy="262" r="46" fill="' + INK + '"/><circle cx="376" cy="262" r="18" fill="#b9b0a2"/><path d="M380 112L520 72L494 122Z" fill="#c9bcaa" stroke="' + INK + '" stroke-width="6"/></g>' +
      '<g class="sc-smoke" fill="#e8e2d8" stroke="' + INK + '" stroke-width="3"><circle cx="1000" cy="420" r="38"/><circle cx="1044" cy="340" r="56"/><circle cx="1100" cy="240" r="74"/><circle cx="1180" cy="130" r="96"/></g>' +
      '<g fill="#fff" opacity=".6">' + flakes(95, 30, 1, 2.2).replace(/cy="-\d+[.\d]*"/g, 'cy="24"') + '</g>';
  };
  // A friendlier id for the same place.
  SCENES.cafe = SCENES['jackson-hole'];

  function scene(id) {
    var fn = SCENES[id];
    var u = uid();
    if (!fn) return wrap('none', '<rect width="1600" height="900" fill="' + INK + '"/><rect width="1600" height="900" fill="url(#' + u + 'wdots)" opacity=".2"/>', u);
    return wrap(id, fn(u), u);
  }

  /* ---------- icons ---------- */
  var ICONS = {
    glass: function () { return '<path d="M16 10L20 56Q32 60 44 56L48 10Z" fill="#fff" fill-opacity=".8" stroke="' + INK + '" stroke-width="3"/><g transform="translate(26 26) scale(.75)"><path d="M0 11C-10 4 -9 -6 -5 -7C-2 -9 2 -9 5 -7C9 -6 10 4 0 11Z" fill="' + STRAW + '"/></g><g transform="translate(38 40) scale(.75)"><path d="M0 11C-10 4 -9 -6 -5 -7C-2 -9 2 -9 5 -7C9 -6 10 4 0 11Z" fill="' + STRAW + '"/></g>'; },
    padlock: function () { return '<path d="M20 30V20C20 4 44 4 44 20V30" fill="none" stroke="' + GOLD + '" stroke-width="6"/><rect x="12" y="28" width="40" height="30" rx="3" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="3"/><circle cx="32" cy="40" r="4" fill="' + INK + '"/><path d="M32 42V50" stroke="' + INK + '" stroke-width="3.4"/>'; },
    key: function () { return '<circle cx="18" cy="20" r="12" fill="none" stroke="' + GOLD + '" stroke-width="6"/><path d="M26 28L54 56M46 48L54 40M38 40L44 34" stroke="' + GOLD + '" stroke-width="6" stroke-linecap="round"/>'; },
    strawberry: function () { return '<path d="M32 58C10 42 10 20 20 16C26 12 38 12 44 16C54 20 54 42 32 58Z" fill="' + STRAW + '" stroke="' + INK + '" stroke-width="3"/><path d="M18 16L26 8L32 14L38 8L46 16L32 22Z" fill="#2c6b34" stroke="' + INK + '" stroke-width="2.4"/><g fill="' + PAPER + '"><circle cx="24" cy="30" r="1.8"/><circle cx="38" cy="28" r="1.8"/><circle cx="32" cy="38" r="1.8"/><circle cx="24" cy="42" r="1.8"/><circle cx="40" cy="40" r="1.8"/></g>'; },
    mic: function () { return '<g transform="rotate(35 32 32)"><rect x="22" y="4" width="20" height="30" rx="10" fill="' + PAPER2 + '" stroke="' + INK + '" stroke-width="3"/><path d="M23 14H41M23 22H41M32 4V34" stroke="' + INK + '" stroke-width="1.6"/><path d="M26 34H38L35 62H29Z" fill="' + INK + '"/></g>'; },
    pin: function () { return '<g fill="none" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"><path d="M10 40L52 30"/><path d="M10 40C24 54 42 48 52 36"/><circle cx="8" cy="42" r="5"/><path d="M48 26L60 32L50 40Z" fill="' + GOLD + '"/></g>'; },
    cups: function () {
      var g = function (x, r) { return '<g transform="translate(' + x + ' 34) rotate(' + r + ')"><path d="M-11 -24L-9 22Q0 26 9 22L11 -24Z" fill="#fff" fill-opacity=".85" stroke="' + INK + '" stroke-width="2.2"/><ellipse cy="-24" rx="11" ry="3" fill="#fff" stroke="' + INK + '" stroke-width="2"/><path d="M-10 -6Q0 -2 10 -6L9 22Q0 26 -9 22Z" fill="#ffd4e2" opacity=".75"/>' + berry(-3, -11, .55) + berry(4, 2, .6) + berry(-4, 14, .55) + '</g>'; };
      return g(19, -6) + g(45, 6);
    },
    ring: function () {
      return P('M6 60C10 46 16 36 26 28L38 40C30 46 24 52 20 62Z', '#f6dcc6', 2.4) +
        P('M24 30L34 18L46 16L44 28L34 38Z', GOLD, 2.4) + P('M36 16L50 8L58 4L54 16L46 26Z', GOLD, 2.4) + P('M52 8L62 2L56 14Z', '#fff2bf', 1.8) +
        P('M30 24L38 36M42 16L47 26', 'none', 1.6, INK) + '<circle cx="34" cy="26" r="1.8" fill="' + INK + '"/><circle cx="47" cy="17" r="1.6" fill="' + INK + '"/><circle cx="36" cy="30" r="2.6" fill="' + RED + '" stroke="' + INK + '" stroke-width="1"/>';
    },
    lighter: function () { return '<rect x="26" y="4" width="12" height="10" fill="' + PAPER2 + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M32 2C28 -2 36 -4 32 -8" fill="none" stroke="' + STRAW + '" stroke-width="2"/><g transform="translate(32 38)"><circle r="20" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="3"/><path d="M-20 0H20M0 -20C-10 -8 -10 8 0 20C10 8 10 -8 0 -20" fill="none" stroke="' + INK + '" stroke-width="1.6"/><ellipse rx="29" ry="9" fill="none" stroke="' + RED + '" stroke-width="3" transform="rotate(-24)"/></g>'; },
    shoes: function () { return '<path d="M8 40C10 28 16 22 22 22L40 30C50 32 58 36 58 42L58 44H8Z" fill="' + INK + '" stroke="' + PAPER + '" stroke-width="1.8"/><path d="M20 26L40 32" stroke="' + RED + '" stroke-width="3"/><path d="M24 24L24 34M32 27L32 37M40 30L40 38" stroke="' + PAPER + '" stroke-width="1.6"/><path d="M4 44H60C62 54 54 60 32 60C10 60 2 54 4 44Z" fill="url(#ngShoeT)" stroke="' + INK + '" stroke-width="2.4"/><path d="M4 50C20 56 44 56 60 50" stroke="' + PAPER + '" stroke-width="1.4" fill="none"/>'; },
    tartan: function (u) { return '<rect x="6" y="6" width="52" height="52" fill="' + RED + '" stroke="' + INK + '" stroke-width="3"/><path d="M6 18H58M6 44H58M18 6V58M44 6V58" stroke="' + INK + '" stroke-width="7" opacity=".85"/><path d="M6 31H58M31 6V58" stroke="' + PAPER + '" stroke-width="1.5"/>'; },
    door707: function () { return '<rect x="14" y="4" width="36" height="56" fill="' + INK2 + '" stroke="' + PAPER + '" stroke-width="2.4"/><rect x="20" y="10" width="24" height="12" fill="' + PAPER + '"/><text x="32" y="20.4" text-anchor="middle" font-family="Impact,sans-serif" font-size="11" fill="' + RED + '">707</text><circle cx="44" cy="36" r="2.4" fill="' + GOLD + '"/>'; },
    guitar: function () { return '<g transform="rotate(38 32 32)"><rect x="29" y="0" width="6" height="34" fill="' + INK + '"/><rect x="26" y="-4" width="12" height="8" fill="' + INK + '"/><path d="M32 30C20 30 18 42 24 46C16 52 20 66 32 66C44 66 48 52 40 46C46 42 44 30 32 30Z" fill="' + RED + '" stroke="' + INK + '" stroke-width="2.4"/><circle cx="32" cy="44" r="4" fill="' + INK + '"/></g>'; },
    bass: function () { return '<g transform="rotate(38 32 32)"><rect x="30" y="-8" width="4" height="42" fill="' + INK + '"/><rect x="27" y="-12" width="10" height="7" fill="' + INK + '"/><path d="M32 32C22 26 16 36 22 42C14 50 20 66 32 66C44 66 50 50 42 42C48 36 42 26 32 32Z" fill="' + PINK + '" stroke="' + INK + '" stroke-width="2.4"/><rect x="26" y="44" width="12" height="4" fill="' + INK + '"/></g>'; },
    drumsticks: function () { return '<g stroke-linecap="round"><path d="M10 58L48 8" stroke="' + INK + '" stroke-width="6"/><path d="M10 58L48 8" stroke="' + GOLD + '" stroke-width="3"/><path d="M54 58L16 8" stroke="' + INK + '" stroke-width="6"/><path d="M54 58L16 8" stroke="' + GOLD + '" stroke-width="3"/></g><circle cx="48" cy="8" r="3.4" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="1.6"/><circle cx="16" cy="8" r="3.4" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="1.6"/>'; },
    shades: function () { return '<circle cx="19" cy="34" r="13" fill="' + INK + '" stroke="#3a3238" stroke-width="2.4"/><circle cx="45" cy="34" r="13" fill="' + INK + '" stroke="#3a3238" stroke-width="2.4"/><path d="M31 30Q32 26 33 30" stroke="#3a3238" stroke-width="2.4" fill="none"/><path d="M12 28A8 8 0 0 1 20 24M38 28A8 8 0 0 1 46 24" stroke="#fff" stroke-width="2" fill="none"/>'; },
    letter: function () { return '<rect x="6" y="14" width="52" height="38" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3"/><path d="M6 16L32 36L58 16" fill="none" stroke="' + INK + '" stroke-width="2.6"/><circle cx="32" cy="36" r="6" fill="' + STRAW + '" stroke="' + INK + '" stroke-width="1.6"/>'; },
    star: function () { return '<path d="M32 4L40 24L60 26L45 40L50 60L32 49L14 60L19 40L4 26L24 24Z" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>'; },
    demon: function () { return '<path d="M16 22C8 14 8 4 12 2C14 10 20 14 26 16ZM48 22C56 14 56 4 52 2C50 10 44 14 38 16Z" fill="' + INK + '"/><circle cx="32" cy="36" r="24" fill="' + RED + '" stroke="' + INK + '" stroke-width="3"/><path d="M18 30L28 36M46 30L36 36" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="38" r="3" fill="' + GOLD + '"/><circle cx="40" cy="38" r="3" fill="' + GOLD + '"/><path d="M20 48Q32 56 44 48L40 50L38 45L34 50L30 45L26 50L24 45Z" fill="#fff" stroke="' + INK + '" stroke-width="1.4"/>'; }
  };
  function icon(name) {
    var fn = ICONS[name] || ICONS.star;
    return '<svg class="ng-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true"><defs><pattern id="ngShoeT" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="' + RED + '"/><path d="M0 3H10M3 0V10" stroke="' + INK + '" stroke-width="2"/></pattern></defs>' + fn() + '</svg>';
  }

  /* ---------- hero: the key visual ---------- */
  function placedPortrait(id, ex, x, y, w, h, rot, ox, oy) {
    var svgS = portrait(id, ex).replace('<svg class="ng-portrait"', '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"');
    return rot ? '<g transform="rotate(' + rot + ' ' + ox + ' ' + oy + ')">' + svgS + '</g>' : svgS;
  }
  function heroGlass(x, y, s, r) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (r || 0) + ') scale(' + s + ')">' + P('M-38 -92L-30 60Q0 72 30 60L38 -92Z', '#fff', 3.6) + P('M-35 -46Q0 -36 35 -46L30 60Q0 72 -30 60Z', '#ffdbe6') + '<ellipse cy="-92" rx="38" ry="8" fill="#fff" stroke="' + INK + '" stroke-width="3.6"/>' + berry(-12, -58, 1.5) + berry(14, -30, 1.7) + berry(-14, 2, 1.6) + berry(13, 36, 1.4) + P('M-24 -76L-20 40', 'none', 4, '#fff') + '</g>';
  }
  function hero() {
    var u = uid(), R = rng(707), snow = '';
    for (var i = 0; i < 44; i++) snow += '<circle cx="' + n(R() * 800) + '" cy="' + n(R() * 700) + '" r="' + n(1.6 + R() * 3.4) + '" fill="#fff" opacity="' + n(.55 + R() * .45) + '"/>';
    var bg = '<rect width="800" height="1000" fill="' + INK + '"/><rect width="800" height="1000" fill="url(#' + u + 'wdots)" opacity=".32"/>' +
      '<path d="M540 0H800V1000H170Z" fill="' + PINK + '"/><path d="M540 0H800V1000H170Z" fill="url(#' + u + 'dots)" opacity=".16"/><path d="M534 0L164 1000" stroke="' + PAPER + '" stroke-width="9"/>' +
      '<circle cx="520" cy="360" r="296" fill="' + RED + '"/><circle cx="520" cy="360" r="296" fill="url(#' + u + 'hatch)" opacity=".28"/><circle cx="520" cy="360" r="296" fill="none" stroke="' + INK + '" stroke-width="7"/>' +
      '<g transform="rotate(-3 180 300)"><rect x="26" y="30" width="296" height="770" fill="' + INK2 + '" stroke="' + PAPER + '" stroke-width="7"/><rect x="66" y="66" width="214" height="118" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="6"/><text x="173" y="162" text-anchor="middle" font-family="Impact,Haettenschweiler,sans-serif" font-size="104" fill="' + RED + '">707</text><rect x="118" y="46" width="118" height="34" fill="' + GOLD + '" opacity=".72" transform="rotate(4 177 63)"/><circle cx="296" cy="440" r="12" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="3"/></g>' + snow;
    var mic = P('M742 1000L664 556', 'none', 11, INK) + P('M742 1000L664 556', 'none', 2.6, '#a79ea4') +
      '<g transform="translate(650 540) rotate(-104)"><rect x="-17" y="0" width="34" height="74" rx="6" fill="' + INK + '" stroke="' + PAPER + '" stroke-width="2.2"/><ellipse cy="-13" rx="24" ry="28" fill="#b9b0a2" stroke="' + INK + '" stroke-width="3.6"/>' + P('M-20 -24H20M-23 -13H23M-22 -2H22M0 -42V14', 'none', 1.5, INK) + '</g>';
    var nana = placedPortrait('nana', 'smirk', 216, 180, 620, 820, 0);
    var hachi = placedPortrait('hachi', 'happy', -48, 400, 480, 636, 5, 200, 760);
    var fg = P('M0 958L24 944L70 954L126 940L190 952L262 938L330 950L346 1000H0Z', PAPER, 4.5) +
      heroGlass(62, 926, .64, -5) + heroGlass(150, 930, .64, 5) + berry(748, 150, 2.2) + berry(770, 620, 1.7);
    return '<svg class="ng-hero" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Nana at a microphone with Hachi at her side, in front of door 707"><defs>' + toneDefs(u) + '</defs>' + bg + nana + mic + hachi + fg + '</svg>';
  }

  NG.Art = { portrait: portrait, scene: scene, icon: icon, hero: hero };
})();
