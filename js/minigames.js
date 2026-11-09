/* HEY, NANA — Room 707 :: minigames.js
   Ten short minigames. Classic script, no deps. All art is drawn in canvas / DOM / CSS.
   Unofficial, non-commercial fan tribute. All writing is original. */
window.NG = window.NG || {};
(function () {
  'use strict';
  var NG = window.NG;

  var F_PUNK = 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif';
  var F_HAND = 'Noteworthy, "Segoe Print", "Bradley Hand", cursive';
  var C = { ink: '#0d0b0c', ink2: '#1d191b', paper: '#f3ece0', paper2: '#e4d9c6', red: '#d3122a', pink: '#ff6fa3', straw: '#e8294f', gold: '#f4c430' };

  /* ---------- tiny utils ---------- */
  function sfx(n) { try { if (NG.Audio && NG.Audio.sfx) NG.Audio.sfx(n); } catch (e) { /* audio is optional */ } }
  function tone(l, d) { try { if (NG.Audio && NG.Audio.tone) NG.Audio.tone(l, d); } catch (e) { /* optional */ } }
  function unlock() { try { if (NG.Audio && NG.Audio.unlock) NG.Audio.unlock(); } catch (e) { /* optional */ } }
  function rr(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function rrect(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function heartPath(g, x, y, s) {
    g.beginPath(); g.moveTo(x, y + s * 0.4);
    g.bezierCurveTo(x - s * 1.1, y - s * 0.3, x - s * 0.5, y - s * 1.0, x, y - s * 0.4);
    g.bezierCurveTo(x + s * 0.5, y - s * 1.0, x + s * 1.1, y - s * 0.3, x, y + s * 0.4); g.closePath();
  }
  function starPath(g, x, y, r) {
    g.beginPath();
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
    g.closePath();
  }
  function berry(g, x, y, r) {
    g.save(); g.translate(x, y);
    g.fillStyle = C.straw; g.strokeStyle = C.ink; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, r * 1.05);
    g.bezierCurveTo(-r * 1.3, r * 0.3, -r * 1.0, -r * 0.8, 0, -r * 0.7);
    g.bezierCurveTo(r * 1.0, -r * 0.8, r * 1.3, r * 0.3, 0, r * 1.05); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#ffe9a0';
    for (var i = 0; i < 5; i++) { g.fillRect(-r * 0.5 + (i % 3) * r * 0.5, -r * 0.1 + Math.floor(i / 3) * r * 0.45, 1.6, 2.2); }
    g.fillStyle = '#2e8b3d';
    g.beginPath(); g.moveTo(0, -r * 0.7); g.lineTo(-r * 0.7, -r * 1.05); g.lineTo(-r * 0.15, -r * 0.55); g.lineTo(0, -r * 1.15); g.lineTo(r * 0.15, -r * 0.55); g.lineTo(r * 0.7, -r * 1.05); g.closePath(); g.fill();
    g.restore();
  }
  function ptext(g, s, x, y, size, fill, stroke, align, font) {
    g.font = size + 'px ' + (font || F_PUNK); g.textAlign = align || 'center'; g.textBaseline = 'middle';
    g.lineJoin = 'round'; g.lineWidth = Math.max(3, size * 0.16); g.strokeStyle = stroke || C.ink; g.strokeText(s, x, y);
    g.fillStyle = fill || C.paper; g.fillText(s, x, y);
  }
  /* offscreen halftone dot field; strength(x,y) -> 0..1 */
  function halftone(W, H, col, step, maxR, strength) {
    var c = document.createElement('canvas'); c.width = W; c.height = H; var g = c.getContext('2d');
    g.fillStyle = col;
    for (var y = 0, row = 0; y < H + step; y += step, row++) {
      for (var x = (row % 2) * step / 2; x < W + step; x += step) {
        var s = strength ? strength(x / W, y / H) : 1; if (s <= 0.03) continue;
        g.beginPath(); g.arc(x, y, maxR * s, 0, 6.283); g.fill();
      }
    }
    return c;
  }

  var NAMES = { hachi: 'Hachi', nana: 'Nana', ren: 'Ren', nobu: 'Nobu', shin: 'Shin', yasu: 'Yasu', reira: 'Reira', takumi: 'Takumi', demon: 'Demon Lord', naoki: 'Naoki' };
  function portraitSVG(ch, ex) {
    if (ch === 'naoki') return naokiSVG(ex, null);
    try { if (NG.Art && NG.Art.portrait) return NG.Art.portrait(ch, ex); } catch (e) { /* art is optional */ }
    return '<div class="mg-fallback">' + (NAMES[ch] || ch).charAt(0) + '</div>';
  }
  function faceBox(ch, ex, cls) { return '<div class="mg-face ' + (cls || '') + '">' + portraitSVG(ch, ex) + '</div>'; }
  /* portrait -> canvas Image (cached, loaded lazily). Returns null until ready. */
  function headImg(cache, ch, ex) {
    var k = ch + '/' + ex, o = cache[k];
    if (o) return o.ok ? o.img : null;
    o = cache[k] = { img: new Image(), ok: false };
    try {
      var svg = portraitSVG(ch, ex);
      if (svg.indexOf('<svg') !== 0) return null;
      svg = svg.replace('<svg ', '<svg width="380" height="574" ');
      o.img.onload = function () { o.ok = true; };
      o.img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    } catch (e) { /* ignore */ }
    return null;
  }
  function hostHTML(faces, who, say) {
    var h = '<div class="mg-host"><div class="mg-host-faces">';
    for (var i = 0; i < faces.length; i++) h += faceBox(faces[i][0], faces[i][1], i === 0 ? 'mg-face-lg' : 'mg-face-md');
    return h + '</div>' + (say ? '<div class="mg-bubble show mg-static"><b>' + NAMES[faces[who || 0][0]] + ':</b> ' + say + '</div>' : '') + '</div>';
  }

  /* ---------- particles + floating text ---------- */
  function Fx() { this.p = []; this.t = []; }
  Fx.prototype.burst = function (x, y, n, cols, o) {
    o = o || {};
    for (var i = 0; i < n && this.p.length < 420; i++) {
      var a = o.arc ? rr(o.arc[0], o.arc[1]) : rr(0, 6.283), s = rr(o.min || 60, o.max || 260);
      this.p.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: o.g == null ? 600 : o.g, life: 0, max: rr(0.4, 0.9) * (o.life || 1),
        size: rr(3, 7) * (o.size || 1), c: pick(cols), shape: o.shape || 'sq', rot: rr(0, 6.28), vr: rr(-9, 9) });
    }
  };
  Fx.prototype.text = function (x, y, s, c, size, life) { this.t.push({ x: x, y: y, s: s, c: c || C.paper, size: size || 24, life: 0, max: life || 1.1 }); if (this.t.length > 12) this.t.shift(); };
  Fx.prototype.step = function (dt) {
    var i, p;
    for (i = this.p.length - 1; i >= 0; i--) {
      p = this.p[i]; p.life += dt; if (p.life >= p.max) { this.p.splice(i, 1); continue; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    }
    for (i = this.t.length - 1; i >= 0; i--) { p = this.t[i]; p.life += dt; p.y -= 38 * dt; if (p.life >= p.max) this.t.splice(i, 1); }
  };
  Fx.prototype.draw = function (g) {
    var i, p;
    for (i = 0; i < this.p.length; i++) {
      p = this.p[i]; var k = 1 - p.life / p.max; g.globalAlpha = Math.min(1, k * 1.6); g.fillStyle = p.c;
      if (p.shape === 'heart') { heartPath(g, p.x, p.y, p.size * 1.3); g.fill(); }
      else if (p.shape === 'star') { starPath(g, p.x, p.y, p.size * 1.4); g.fill(); }
      else if (p.shape === 'circ') { g.beginPath(); g.arc(p.x, p.y, p.size * 0.6 * (0.5 + k), 0, 6.283); g.fill(); }
      else { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); g.restore(); }
    }
    g.globalAlpha = 1;
    for (i = 0; i < this.t.length; i++) {
      p = this.t[i]; var u = p.life / p.max, sc = u < 0.12 ? 0.5 + u / 0.12 * 0.7 : 1.2 - Math.min(0.2, (u - 0.12) * 0.5);
      g.globalAlpha = u > 0.7 ? 1 - (u - 0.7) / 0.3 : 1; g.save(); g.translate(p.x, p.y); g.scale(sc, sc); ptext(g, p.s, 0, 0, p.size, p.c); g.restore();
    }
    g.globalAlpha = 1;
  };

  /* ---------- shared game shell ----------
     make(ctx) -> { begin(), update(dt), draw(dt), resize(W,H), destroy() }  (all optional but begin)
     ctx: stage, canvas(), on(), later(), setScore(), sfx(), tone(), finish(res), reduce, persona, settings, playing */
  function runGame(def, container, opts, make) {
    opts = opts || {};
    var settings = opts.settings || {};
    var S = { alive: true, finishing: false, delivered: false };
    var offs = [], timers = [], raf = 0, last = 0, game = null, cvs = null, ro = null, result = null;
    var madeRel = false, prevMin = null;

    try {
      var cs = window.getComputedStyle && window.getComputedStyle(container);
      if (cs && cs.position === 'static') { container.style.position = 'relative'; madeRel = true; }
      if (container.offsetHeight < 240) { prevMin = container.style.minHeight; container.style.minHeight = (window.CSS && CSS.supports && CSS.supports('height', '100dvh')) ? '100dvh' : '100vh'; }
    } catch (e) { /* ignore */ }

    var root = el('div', 'mg-root mg-g-' + def.id + (settings.reduceFlash ? ' mg-reduce' : ''));
    var top = el('div', 'mg-top');
    var ttl = el('div', 'mg-title', def.title);
    var scoreEl = el('div', 'mg-score', '');
    var quit = el('button', 'mg-quit', '&#10005;'); quit.type = 'button'; quit.setAttribute('aria-label', 'Quit minigame'); quit.title = 'Quit'; quit.tabIndex = -1;
    top.appendChild(ttl); top.appendChild(scoreEl); top.appendChild(quit);
    var stage = el('div', 'mg-stage');
    var ov = el('div', 'mg-overlay');
    root.appendChild(top); root.appendChild(stage); root.appendChild(ov);
    container.appendChild(root);

    function on(t, e, f, o) { t.addEventListener(e, f, o); offs.push(function () { t.removeEventListener(e, f, o); }); }
    function later(fn, ms) { var id = setTimeout(function () { if (S.alive) fn(); }, ms); timers.push(id); return id; }

    var ctx = {
      stage: stage, root: root, settings: settings, persona: opts.persona, reduce: !!settings.reduceFlash, playing: false,
      on: on, later: later, sfx: sfx, tone: tone,
      setScore: function (h) { if (scoreEl.__h !== h) { scoreEl.__h = h; scoreEl.innerHTML = h; } },
      canvas: function () {
        var c = document.createElement('canvas'); c.className = 'mg-canvas'; stage.appendChild(c);
        cvs = { c: c, g: c.getContext('2d'), W: 0, H: 0, dpr: 1 }; fit(); return cvs;
      },
      cast: function (parent, chars, cls) {
        var box = el('div', 'mg-cast ' + (cls || '')), row = el('div', 'mg-cast-row'), b = el('div', 'mg-bubble');
        var faces = [], cur = [], base = [], rt = [], bt = 0, api;
        for (var i = 0; i < chars.length; i++) { var f = el('div', 'mg-face'); row.appendChild(f); faces.push(f); cur.push(null); base.push('neutral'); rt.push(0); }
        box.appendChild(row); box.appendChild(b); parent.appendChild(box);
        api = {
          el: box,
          set: function (i, ex) { if (cur[i] === ex) return; cur[i] = ex; faces[i].innerHTML = portraitSVG(chars[i], ex); },
          say: function (i, t, ms) {
            b.innerHTML = '<b>' + NAMES[chars[i]] + ':</b> ' + t; b.className = 'mg-bubble show'; clearTimeout(bt);
            if (ms !== 0) bt = later(function () { b.className = 'mg-bubble'; }, ms || 2300);
          },
          react: function (i, ex, t, ms) {
            api.set(i, ex); if (t) api.say(i, t, ms); clearTimeout(rt[i]);
            rt[i] = later(function () { api.set(i, base[i]); }, ms || 2300);
          },
          base: function (i, ex) { base[i] = ex; api.set(i, ex); },
          who: function (i, ch, ex) { chars[i] = ch; cur[i] = null; api.set(i, ex); }
        };
        return api;
      },
      finish: function (res) { if (!S.alive || S.finishing) return; S.finishing = true; showResults(res); }
    };

    function fit() {
      if (!cvs) return;
      var r = stage.getBoundingClientRect();
      var W = Math.max(120, Math.round(r.width)), H = Math.max(120, Math.round(r.height)), d = Math.min(2.5, window.devicePixelRatio || 1);
      if (W === cvs.W && H === cvs.H && d === cvs.dpr) return;
      cvs.W = W; cvs.H = H; cvs.dpr = d;
      cvs.c.width = Math.round(W * d); cvs.c.height = Math.round(H * d);
      cvs.g.setTransform(d, 0, 0, d, 0, 0);
      if (game && game.resize) game.resize(W, H);
    }
    on(window, 'resize', fit);
    on(window, 'orientationchange', function () { later(fit, 120); });
    try { if (window.ResizeObserver) { ro = new window.ResizeObserver(fit); ro.observe(stage); } } catch (e) { ro = null; }

    function frame(t) {
      if (!S.alive) return;
      raf = requestAnimationFrame(frame);
      if (!last) last = t;
      var dt = Math.min(0.05, Math.max(0, (t - last) / 1000)); last = t;
      if (!game) return;
      if (ctx.playing && game.update) game.update(dt);
      if (game.draw) game.draw(dt);
    }

    function deliver(quitFlag) {
      if (S.delivered) return; S.delivered = true; ctx.playing = false;
      var out;
      if (quitFlag || !result) out = { score: 0, stars: 0, effects: {}, quit: !!quitFlag };
      else {
        out = { score: result.score | 0, stars: clamp(result.stars | 0, 0, 3), effects: result.effects || {}, quit: false };
        if (result.headline) out.headline = result.headline;
      }
      if (opts.onFinish) opts.onFinish(out);
    }
    on(quit, 'click', function (e) { e.preventDefault(); sfx('click'); deliver(true); });

    function showHowto() {
      ov.className = 'mg-overlay'; ov.innerHTML = '';
      var hw = def.cast && def.cast.how, c;
      c = el('div', 'mg-card mg-howto', (hw ? hostHTML(hw.faces, 0, hw.say) : '') + '<h2 class="mg-h">' + def.title + '</h2><p class="mg-p">' + def.howto + '</p><p class="mg-keys">' + (def.controls || '') + '</p>');
      var b = el('button', 'mg-btn', 'Start'); b.type = 'button'; c.appendChild(b); ov.appendChild(c);
      on(b, 'click', function () { unlock(); sfx('select'); countdown(); });
      try { b.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }

    function countdown() {
      ov.className = 'mg-overlay mg-pass'; var n = 3;
      (function tick() {
        ov.innerHTML = '';
        if (n > 0) { ov.appendChild(el('div', 'mg-count', '' + n)); sfx('click'); n--; later(tick, 650); }
        else {
          ov.appendChild(el('div', 'mg-count mg-go', 'GO!')); sfx('chime');
          ctx.playing = true; if (game.begin) game.begin();
          later(function () { ov.innerHTML = ''; }, 550);
        }
      })();
    }

    function showResults(res) {
      ctx.playing = false; result = res || {};
      var stars = clamp(result.stars | 0, 0, 3);
      ov.className = 'mg-overlay'; ov.innerHTML = '';
      var line = result.line || pick((def.lines && (def.lines[stars] || def.lines[0])) || ['Well. That happened.']);
      var sh = ''; for (var i = 0; i < 3; i++) sh += '<span class="mg-star' + (i < stars ? ' on' : '') + '" style="--i:' + i + '">&#9733;</span>';
      var rc = def.cast && def.cast.res, hh = '';
      if (rc) { var ex = rc.ex[stars]; hh = hostHTML([[rc.faces[0], ex[0]], [rc.faces[1], ex[1]]], 0, rc.say[stars]); }
      var c = el('div', 'mg-card mg-results' + (result.cls ? ' ' + result.cls : ''),
        hh + '<h2 class="mg-h">' + (result.title || 'Results') + '</h2><div class="mg-big">' + (result.score | 0) + '</div><div class="mg-stars">' + sh + '</div>' +
        (result.html || '') + '<p class="mg-line">' + line + '</p>');
      var b = el('button', 'mg-btn', 'Continue'); b.type = 'button'; b.disabled = true; c.appendChild(b); ov.appendChild(c);
      sfx(stars > 0 ? 'win' : 'lose');
      if (window.NG.Audio && window.NG.Audio.voice) {
        window.NG.Audio.voice(pick([['laugh', 'made-her-cry', 'not-your-fault'], ['laugh', 'not-your-fault'], ['thank-you-nana', 'so-happy'], ['so-happy', 'thank-you-nana', 'damn']][stars]));
      }
      on(b, 'click', function () { sfx('select'); deliver(false); });
      later(function () { b.disabled = false; try { b.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 750);
    }

    game = make(ctx) || {};
    showHowto();
    raf = requestAnimationFrame(frame);

    return {
      destroy: function () {
        if (!S.alive) return; S.alive = false; ctx.playing = false;
        if (raf) cancelAnimationFrame(raf);
        for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
        timers.length = 0;
        for (i = 0; i < offs.length; i++) offs[i]();
        offs.length = 0;
        if (ro) { try { ro.disconnect(); } catch (e) { /* ignore */ } ro = null; }
        try { if (game && game.destroy) game.destroy(); } catch (e2) { /* ignore */ }
        if (root.parentNode) root.parentNode.removeChild(root);
        try { if (madeRel) container.style.position = ''; if (prevMin !== null) container.style.minHeight = prevMin; } catch (e3) { /* ignore */ }
      }
    };
  }

  /* =====================================================================
     1. STRAWBERRY SHORTCAKE STACK
     ===================================================================== */
  function shortcake(ctx) {
    var cv = ctx.canvas(), g = cv.g, W = 0, H = 0, lh = 28, baseW = 200, baseY = 0, tol = 6, bg = null;
    var fx = new Fx(), stack = [], pieces = [], cur = null;
    var layers = 0, perfects = 0, streak = 0, bestStreak = 0, cam = 0, shake = 0, tt = 0, timeLeft = 90, ended = false, endT = 0;
    // Depth: the cake only pays in full if you SERVE it standing, and Nana's black layers (once she is home) are the big gamble.
    var score = 0, served = false, collapsed = false, nanaHome = false, nanaPerfect = 0;
    var serveBtn = el('button', 'mg-sc-serve', 'Serve it'); serveBtn.type = 'button'; serveBtn.tabIndex = -1; serveBtn.style.display = 'none'; ctx.stage.appendChild(serveBtn);
    var cast = ctx.cast(ctx.stage, ['hachi', 'nana'], 'mg-corner');
    cast.base(0, 'happy'); cast.base(1, 'smirk'); cast.say(0, 'Okay. Okay. I can do this.', 3500);
    var NANA_SAY = { perfect: ['Hm. Not bad.', 'Fine. It is tidy.', 'Do not cry on it.'], cut: ['Tilted.', 'Leaning Tower of Cake.', 'Trim it. Move on.'] };
    function mood(he, ne, who, txt) { cast.react(0, he, who === 0 ? txt : null); cast.react(1, ne, who === 1 ? txt : null); }
    var SAY = {
      perfect: ['Oh! Pretty!', 'I am a BAKER!', 'Look at it go!', 'Is this talent?', 'Nana will cry. Happy cry.'],
      cut: ['It is... rustic!', 'Nobody will notice!', 'Just trim it. Like hair.', 'Cake diet. Fine.', 'Structural, but cute!'],
      hot: ['It is a tower of LOVE!', 'Call a newspaper!', 'Michelin who? Hachi!']
    };
    var CALL = ['PERFECT!', 'Nana-approved!', 'Bakery-grade!', 'Not crying (crying)', 'Illegal levels of cake!', 'Room 707 is shaking (good)', 'STRAWBERRY GOD', 'Wedding-cake energy!'];

    function layout() {
      var oldW = W; W = cv.W; H = cv.H;
      lh = clamp(H * 0.062, 20, 36); baseW = Math.min(W * 0.52, 280); baseY = H - 52; tol = Math.max(7, baseW * 0.042);
      if (oldW && oldW !== W) {
        var k = W / oldW, i;
        for (i = 0; i < stack.length; i++) { stack[i].x *= k; stack[i].w *= k; }
        for (i = 0; i < pieces.length; i++) { pieces[i].x *= k; pieces[i].w *= k; }
        if (cur) { cur.x *= k; cur.w *= k; }
      }
      bg = document.createElement('canvas'); bg.width = W; bg.height = H; var b = bg.getContext('2d');
      b.fillStyle = '#ffe6ee'; b.fillRect(0, 0, W, H);
      b.drawImage(halftone(W, H, 'rgba(255,111,163,0.28)', 14, 4.6, function (x, y) { return clamp(1.15 - y * 1.3, 0, 1) * (0.5 + 0.5 * Math.sin(x * 9)); }), 0, 0);
      var ty = H - 46;
      b.fillStyle = '#fff'; b.fillRect(0, ty, W, 46);
      for (var yy = 0; yy < 46; yy += 12) for (var xx = 0; xx < W + 24; xx += 24) {
        if (((xx / 24 + yy / 12) | 0) % 2 === 0) { b.fillStyle = 'rgba(232,41,79,0.55)'; b.fillRect(xx, ty + yy, 24, 12); }
      }
      b.fillStyle = C.ink; b.fillRect(0, ty - 3, W, 4);
      b.font = '44px ' + F_PUNK; b.textAlign = 'right'; b.fillStyle = 'rgba(13,11,12,0.07)'; b.fillText('ROOM 707', W - 10, 110);
      b.font = '17px ' + F_HAND; b.fillStyle = 'rgba(13,11,12,0.35)'; b.fillText('housewarming!!', W - 10, 138);
    }
    layout();
    stack.push({ x: (W - baseW) / 2, w: baseW, k: 0, sq: 0, berry: 0 });

    function speed() { return clamp(W * (0.42 + 0.018 * layers), W * 0.42, W * 0.95); }
    function newSwing() {
      var t = stack[stack.length - 1];
      cur = { x: Math.random() < 0.5 ? 0 : W - t.w, w: t.w, dir: 1, fy: Math.max(H * 0.18, 112), vy: 0, state: 'swing', nana: nanaHome && stack.length % 3 === 0 };
      cur.dir = cur.x === 0 ? 1 : -1;
    }
    function say(kind) {
      var n = Math.random() < 0.35 && NANA_SAY[kind];
      if (kind === 'cut') mood('shock', 'smirk', n ? 1 : 0, pick(n ? NANA_SAY.cut : SAY.cut));
      else mood('happy', kind === 'hot' ? 'happy' : 'smirk', n ? 1 : 0, pick(n ? NANA_SAY.perfect : SAY[kind]));
    }
    function topY(n) { return baseY - n * lh; }

    function drop() {
      if (ended || !cur || cur.state !== 'swing' || !ctx.playing) return;
      cur.state = 'fall'; cur.vy = H * 0.7; sfx('click');
    }

    function land() {
      var top = stack[stack.length - 1], n = stack.length, wy = topY(n + 1), kind = cur.nana ? 2 : n % 2;
      var dx = cur.x - top.x, ov = cur.w - Math.abs(dx), cx = cur.x + cur.w / 2;
      if (ov <= 3) {
        pieces.push({ x: cur.x, w: cur.w, y: wy, vx: dx > 0 ? 160 : -160, vy: -120, rot: 0, vr: dx > 0 ? 3 : -3, k: kind });
        shake = 10; sfx('thud'); fx.text(cx, wy + cam - 30, 'WHIFF!', C.paper, 30);
        mood('sad', 'smirk', 0, 'The cake left. Without me. This has the Demon Lord all over it.'); endGame(true); return;
      }
      var L, worth = Math.min(70, 10 + layers * 3), pts;
      if (Math.abs(dx) <= tol) {
        var gain = Math.min(baseW - top.w, baseW * (cur.nana ? 0.24 : streak >= 2 ? 0.07 : 0.045));
        L = { x: top.x - gain / 2, w: top.w + gain, k: kind, sq: 0.55, berry: 1, bside: perfects % 2 };
        perfects++; streak++; bestStreak = Math.max(bestStreak, streak);
        pts = (worth + Math.min(48, streak * 6)) * (cur.nana ? 3 : 1); score += pts;
        sfx('perfect'); shake = 5 + Math.min(8, streak);
        var cs = cur.nana ? 'NANA APPROVES' : CALL[Math.min(CALL.length - 1, streak - 1)];
        fx.text(cx, wy + cam - 36, cs + ' +' + pts, cur.nana ? C.gold : C.pink, 26 + Math.min(12, streak * 2));
        var hot = ['#e8294f', '#ff6fa3', '#f4c430', '#fff'];
        fx.burst(cx, wy + cam + lh / 2, 14 + Math.min(18, streak * 3), hot, { shape: streak > 2 ? 'heart' : 'star', min: 80, max: 300, g: 500 });
        if (!ctx.reduce && streak > 3) fx.burst(cx, wy + cam, 10, ['#fff'], { shape: 'circ', min: 120, max: 360, g: 0, life: 0.6 });
        if (cur.nana) { nanaPerfect++; mood('happy', 'smirk', 1, pick(['Black on pink. Finally, some taste.', 'That one can stay.', 'Do not tell her I liked it.'])); }
        else say(streak >= 4 ? 'hot' : 'perfect');
      } else {
        var nx = Math.max(cur.x, top.x);
        L = { x: nx, w: ov, k: kind, sq: 0.35, berry: 0 };
        var pw = cur.w - ov, px = dx > 0 ? top.x + top.w : cur.x;
        pieces.push({ x: px, w: pw, y: wy, vx: dx > 0 ? 70 : -70, vy: -60, rot: 0, vr: dx > 0 ? 2.4 : -2.4, k: kind });
        if (cur.nana) { // black sponge is unforgiving: a sloppy landing shaves off extra
          var extra = clamp(Math.abs(dx) * 0.5, 0, Math.max(0, ov - 8));
          if (dx < 0) L.x += extra; L.w -= extra;
          mood('shock', 'neutral', 1, 'Cocoa does not forgive. Neither do I.');
        } else say('cut');
        streak = 0; pts = worth; score += pts; sfx('good'); shake = 3;
        fx.burst(dx > 0 ? px : px + pw, wy + cam + lh / 2, 8, ['#f3c46b', '#ffd0df'], { min: 40, max: 160, g: 700 });
      }
      stack.push(L); layers++;
      if (layers === 3) serveBtn.style.display = '';
      if (layers === 6 && !nanaHome) { nanaHome = true; fx.text(W / 2, H * 0.3, 'NANA IS HOME', C.gold, Math.min(30, W / 12), 1.8); mood('shock', 'smirk', 1, 'Every third layer is mine now. Land it clean or lose some.'); sfx('chime'); }
      if (L.w < 16) { fx.text(W / 2, H * 0.3, 'TOO WOBBLY!', C.paper, 30); mood('shock', 'angry', 0, 'It is WOBBLING!'); endGame(true); return; }
      if (layers >= 30) { fx.text(W / 2, H * 0.24, 'IT HIT THE CEILING', C.pink, Math.min(30, W / 12), 1.6); serve(true); return; }
      if (timeLeft <= 0) { serve(true); return; }
      newSwing();
    }

    function endGame(fell) { if (ended) return; ended = true; endT = 0; cur = null; collapsed = !!fell; serveBtn.style.display = 'none'; }
    function serve(auto) {
      if (ended || (!auto && (!ctx.playing || layers < 3))) return;
      served = true; endGame(false); sfx('cheer'); fx.text(W / 2, H * 0.3, auto ? 'GUESTS ARE HERE!' : 'SERVED!', C.gold, Math.min(34, W / 11), 1.5);
      fx.burst(W / 2, H * 0.4, 30, ['#e8294f', '#ff6fa3', '#f4c430', '#fff'], { shape: 'heart', min: 80, max: 320, g: 400 });
      mood('happy', 'smirk', 0, 'It is standing! Everybody look at it quickly!');
    }

    function finishNow() {
      var final = served ? score : Math.floor(score * 0.5);
      var stars = !served ? (final >= 200 ? 1 : 0) : final >= 1700 ? 3 : final >= 800 ? 2 : final >= 200 ? 1 : 0;
      ctx.finish({
        title: served ? 'Cake report' : 'Cake incident report', score: final, stars: stars, effects: { bond: stars },
        html: '<div class="mg-stats"><span>Layers <b>' + layers + '</b></span><span>Perfect <b>' + perfects + '</b></span><span>Black layers <b>' + nanaPerfect + '</b></span><span>Best streak <b>' + bestStreak + '</b></span></div>' +
          (served ? '' : '<p class="mg-p">It fell before anyone saw it, so it only counts for half.</p>')
      });
    }

    ctx.on(serveBtn, 'pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); serve(false); });
    ctx.on(window, 'keydown', function (e) {
      var k = e.key;
      if (k === ' ' || k === 'Enter' || k === 'ArrowDown' || k === 's' || k === 'S') { if (!e.repeat) drop(); if (ctx.playing) e.preventDefault(); }
      else if ((k === 'e' || k === 'E') && !e.repeat) serve(false);
    });
    ctx.on(cv.c, 'pointerdown', function (e) { e.preventDefault(); drop(); });

    function update(dt) {
      tt += dt; fx.step(dt); shake = Math.max(0, shake - dt * 30);
      var i, p;
      if (!ended) timeLeft -= dt;
      for (i = 0; i < stack.length; i++) stack[i].sq *= Math.exp(-dt * 9);
      for (i = pieces.length - 1; i >= 0; i--) { p = pieces[i]; p.vy += H * 2.4 * dt; p.y += p.vy * dt; p.x += p.vx * dt; p.rot += p.vr * dt; if (p.y + cam > H + 80) pieces.splice(i, 1); }
      var camT = Math.max(0, H * 0.55 - topY(stack.length));
      cam += (camT - cam) * Math.min(1, dt * 4);
      if (ended) { endT += dt; if (endT > 1.4) { endT = -999; finishNow(); } return; }
      if (!cur) return;
      if (cur.state === 'swing') {
        cur.x += cur.dir * speed() * dt;
        if (cur.x < 0) { cur.x = 0; cur.dir = 1; } else if (cur.x > W - cur.w) { cur.x = W - cur.w; cur.dir = -1; }
        if (timeLeft <= 0) serve(true);
      } else {
        cur.vy += H * 5 * dt; cur.fy += cur.vy * dt;
        if (cur.fy >= topY(stack.length + 1) + cam) land();
      }
      ctx.setScore('SCORE <b>' + score + '</b> &middot; LAYERS <b>' + layers + '</b> &middot; ' + Math.max(0, Math.ceil(timeLeft)) + 's');
    }

    function drawLayer(L, wy) {
      g.save();
      var sq = L.sq || 0;
      g.translate(L.x + L.w / 2, wy + lh); g.scale(1 + sq * 0.18, 1 - sq * 0.4); g.translate(-(L.x + L.w / 2), -(wy + lh));
      g.lineWidth = 2.5; g.strokeStyle = C.ink;
      if (L.k === 2) {
        g.fillStyle = '#2a1c1f'; rrect(g, L.x, wy, L.w, lh, 6); g.fill(); g.stroke();
        g.strokeStyle = C.red; g.lineWidth = 3; g.beginPath(); g.moveTo(L.x + 6, wy + lh * 0.5);
        for (var dz = L.x + 6; dz < L.x + L.w - 6; dz += 14) g.lineTo(dz + 7, wy + lh * (dz % 28 < 14 ? 0.25 : 0.75));
        g.stroke(); g.strokeStyle = C.ink;
      } else if (L.k === 1) {
        g.fillStyle = '#ffd0df'; rrect(g, L.x, wy, L.w, lh, 6); g.fill(); g.stroke();
        g.fillStyle = '#fff3f7';
        for (var xx = L.x + 8; xx < L.x + L.w - 4; xx += 16) { g.beginPath(); g.arc(xx, wy + 2, 7, 0, Math.PI); g.fill(); }
        g.beginPath(); g.moveTo(L.x + 3, wy + 1); g.lineTo(L.x + L.w - 3, wy + 1); g.stroke();
      } else {
        g.fillStyle = '#f3c46b'; rrect(g, L.x, wy, L.w, lh, 6); g.fill(); g.stroke();
        g.fillStyle = '#c98f2c';
        for (var q = 0; q < L.w / 22; q++) g.fillRect(L.x + 8 + q * 22 + (q % 2) * 5, wy + 6 + (q % 3) * (lh / 4), 3, 3);
        g.fillStyle = '#ffe3a1'; g.fillRect(L.x + 6, wy + 3, L.w - 12, 3);
      }
      g.restore();
      if (L.berry) berry(g, L.bside ? L.x + L.w : L.x, wy + lh * 0.45, lh * 0.5);
    }

    function draw() {
      if (!W) return;
      g.save();
      if (bg) g.drawImage(bg, 0, 0);
      var sx = shake > 0 && !ctx.reduce ? rr(-shake, shake) * 0.5 : 0, sy = shake > 0 && !ctx.reduce ? rr(-shake, shake) * 0.5 : 0;
      g.translate(sx, sy);
      // plate
      var pcx = stack[0].x + stack[0].w / 2, py = baseY + cam;
      g.fillStyle = '#fff'; g.strokeStyle = C.ink; g.lineWidth = 3;
      g.beginPath(); g.ellipse(pcx, py + 6, baseW * 0.72, 12, 0, 0, 6.283); g.fill(); g.stroke();
      g.fillStyle = '#ffd0df'; g.beginPath(); g.ellipse(pcx, py + 5, baseW * 0.62, 7, 0, 0, 6.283); g.fill();
      for (var i = 0; i < stack.length; i++) drawLayer(stack[i], topY(i + 1) + cam);
      for (i = 0; i < pieces.length; i++) {
        var p = pieces[i]; g.save(); g.translate(p.x + p.w / 2, p.y + cam + lh / 2); g.rotate(p.rot); g.translate(-(p.x + p.w / 2), -(p.y + cam + lh / 2));
        drawLayer({ x: p.x, w: p.w, k: p.k, sq: 0 }, p.y + cam); g.restore();
      }
      if (cur) {
        if (cur.state === 'swing') {
          g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(cur.x + cur.w / 2, 0); g.lineTo(cur.x + cur.w / 2, cur.fy); g.stroke();
          g.fillStyle = C.red; g.beginPath(); g.arc(cur.x + cur.w / 2, cur.fy, 4, 0, 6.283); g.fill();
        }
        drawLayer({ x: cur.x, w: cur.w, k: cur.nana ? 2 : stack.length % 2, sq: 0 }, cur.fy);
      }
      fx.draw(g);
      g.restore();
      if (!cur && !ended && !ctx.playing) { ptext(g, 'Tap / Space to drop', W / 2, H * 0.2, 22, C.paper); }
    }

    return {
      begin: function () { newSwing(); },
      update: update, draw: draw,
      resize: function () { layout(); },
      destroy: function () { fx = null; }
    };
  }

  /* =====================================================================
     2. LOVE AT FIRST SIGHT RADAR
     ===================================================================== */
  var SUITORS = [
    // red flags (flag:true => RUN)
    { n: 'Kazuma "The Concept" Otsuki', t: 'My band is more of a concept.', d: ['Calls his band a "concept"', 'Has played zero shows, owns forty stickers', 'Drummer is a rice cooker'], w: 'A band with no songs is a hobby with sunglasses.', acc: 'shades' },
    { n: 'Daisuke, No Last Name', t: 'I am not like other guys.', d: ['Owns one (1) towel', 'Says "no drama" nine times a minute', 'Every ex is "a little crazy"'], w: 'The towel was a warning. The towel was always a warning.' },
    { n: 'Ryota Ito, Visionary', t: 'I wake up and choose growth.', d: ['Business card is laminated', 'Title: "Founder of Founding"', 'Borrowed your umbrella before you met'], w: 'Growth, yes. Of your tab.', acc: 'shades' },
    { n: 'Haruki the Free Spirit', t: 'Labels are a cage, babe.', d: ['No phone number, only "a vibe"', 'Couch-surfing since 2019', 'Cannot finish a sentence about next week'], w: 'Free spirit, expensive laundry.' },
    { n: 'Shota "I\'ll Call You"', t: 'I will totally call you.', d: ['Saves you as "Hachi?? bar"', 'Replies in 9-day cycles', 'Has "a little thing" with three girls'], w: 'He called. It was a pocket dial.' },
    { n: 'Tetsu Mirrorman', t: 'You will like my reflection.', d: ['Brings a ring light to dinner', 'Calls his mirror "bro"', 'Takes selfies at funerals, for the vibe'], w: 'You were the third wheel on a date with his own face.', acc: 'shades' },
    { n: 'Koji, CEO (1 employee)', t: 'I pay in exposure.', d: ['Employee is also Koji', 'Business: "selling vibes at festivals"', 'Wallet is a rubber band'], w: 'Exposure does not cover the bill. Ask the waiter.' },
    { n: 'Yuto, Borrower', t: 'Can I borrow something? Anything?', d: ['Owns one (1) pair of shoes', 'Has "borrowed" a car since 2020', 'Pays back in compliments'], w: 'He borrowed your heart and also your charger.' },
    { n: 'Masa, Already Planning', t: 'I drew our wedding on a napkin.', d: ['Napkin has a seating chart', 'Has named your three children', 'Knows your blood type after four minutes'], w: 'The third child is called Brandon. Run.' },
    { n: 'Eiji Rates-Everything', t: 'I only tell the truth, loudly.', d: ['Scores waiters out loud', 'Says dogs are "tiny noisy landlords"', 'Kicks vending machines that disappoint him'], w: 'He will rate your cooking. In public. With decimals.', acc: 'mustache' },
    { n: 'Naoki Ink-and-Regret', t: 'Every tattoo has a story.', d: ['Tattoo of a name that is not yours', 'Story is "bad weekend"', 'All tattoos are in comic-sans-ish'], w: 'You would be a new tattoo. A scratched-out one.', acc: 'tear' },
    { n: 'Souta Whatever', t: 'Let us not label it.', d: ['Late to everything by exactly "a vibe"', 'Eats your fries without eye contact', 'Said "not looking for anything" on date one'], w: 'He labelled it. It said "inconvenient".' },
    { n: 'Go and the Shoebox', t: 'We just need closure.', d: ['Ex is his phone wallpaper', 'Calls the breakup "the incident"', 'Shoebox labelled DO NOT OPEN, opened daily'], w: 'You are dating a shoebox with a pulse.', acc: 'tear' },
    { n: 'Jun & Mommy the Snake', t: 'She chooses people. Like a judge.', d: ['Snake named "Mommy"', 'Apartment smells of incense and regret', 'Snake did not choose you'], w: 'Mommy has seen your browser history. Mommy is disappointed.' },
    { n: 'Tomo, Poet at You', t: 'Listen. I wrote this on the train.', d: ['Rhymes "love" with "love"', 'Haiku with nine syllables, defended', 'Reads poetry during your meal, mid-chew'], w: 'Eleven stanzas about soup. You were not in them.', acc: 'hat' },
    { n: 'Hiro, Gym Prophet', t: 'Every day is leg day. Every. Day.', d: ['Counts your steps out loud', 'Protein shake in a wedding photo', 'Hugs like a load test'], w: 'He hugged you into a different postcode.' },
    { n: 'Akira "Logistics"', t: 'I do things. For people. Late.', d: ['Trench coat in July', 'Job is "logistics" and "a guy"', 'Looks over his shoulder at soup'], w: 'The guy is him. He is the guy.', acc: 'shades' },
    { n: 'Kei, Karaoke Menace', t: 'I have one song. It is enough.', d: ['Performs the one song six times', 'Owns a personal microphone, has a case', 'Cries if the score is under 100'], w: 'The machine said 94. The room said nothing. He said everything.' },
    { n: 'Taiga Van-Is-A-Lifestyle', t: 'Home is where I park.', d: ['Van has a mattress and no seatbelts', 'Honks at pigeons, personally', 'Bumper sticker: ASK ME ABOUT THE VAN'], w: 'The van is a cry for help with a sunroof.', acc: 'hat' },
    { n: 'Sora Is Always Texting', t: 'u up? (it is 3pm)', d: ['Texts "hey" and nothing else', 'Brought his mom to date one, as "support"', 'Mom reviewed you, in writing'], w: 'The review was two stars. Mom was kind.' },
    { n: 'Ryuji Well-Actually', t: 'Actually, it is pronounced...', d: ['Corrects your order to the waiter', 'Podcast: two listeners, one is his mom', 'Argues with the GPS and loses'], w: 'He explained your own joke back to you. Slowly.', acc: 'glasses' },
    { n: 'Shun Bill-Splitter', t: 'I only had water. Plus my share.', d: ['Splits the toothpick to the yen', 'Brought a coupon to the proposal', 'Loves you at 10% off, terms apply'], w: 'He itemised the kiss. It was two yen.', acc: 'glasses' },
    { n: 'Mikio, Cloud of Cologne', t: 'You can smell me coming.', d: ['Enters rooms four seconds early', 'Has named his cologne, "Daryl"', 'Department store, but a crime scene'], w: 'Your eyes watered. He took it as a compliment.', acc: 'mustache' },
    { n: 'Kaito, Almost Famous', t: 'I almost signed. In 2016.', d: ['Practises his autograph on receipts', 'Waiting on "a call" for ten years', 'Hair: expensive, mood: pending'], w: 'The call was a wrong number. He kept the number.', acc: 'shades' },
    { n: 'Yosuke, Technically Single', t: 'Separated. Spiritually.', d: ['Ring-shaped tan line', 'Photo with "a cousin" holding hands', 'Lowers voice to say "wife"'], w: 'Spiritually separated, legally sharing a mortgage.', acc: 'mustache' },
    { n: 'Hayato, Not Listening', t: 'Anyway, as I was saying.', d: ['Says "anyway" after your sentences', 'Falls asleep during his own story', 'Interrupts your name with his name'], w: 'You said "fire". He said "anyway". It was a fire.' },
    { n: 'Itsuki and Three Chords', t: 'This one is new, I swear.', d: ['Plays the same riff at every party', 'Knows three chords, uses one', 'Guitar has a name, and a restraining order'], w: 'It was the same riff. It is always the same riff.', acc: 'hat' },
    { n: 'Rento Time Traveler', t: 'I am from next Thursday.', d: ['Knows "nothing about today"', 'Is late, but from the future', 'Wants to borrow money from the past'], w: 'Next Thursday he still owes you lunch.' },
    { n: 'Ibuki, Sunglasses at Night', t: 'It is not a phase. It is a lifestyle.', d: ['Wears shades to the cinema', 'Walks into doors with dignity', 'Says "cool" like it is a diagnosis'], w: 'He kissed the lamp post. He called it a "moment".', acc: 'shades' },
    // decent ones (flag:false => LOVE)
    { n: 'Minoru, Brings Snacks', t: 'I brought snacks. Just in case.', d: ['Carries a spare umbrella, and offers it', 'Remembered your name after one hearing', 'Library card, used, laminated'], w: 'He texted when he got home. That is rarer than a unicorn.', ok: true, acc: 'glasses' },
    { n: 'Takeshi of the Noodle Shop', t: 'Sit. You look tired. Soup.', d: ['Smells like broth, which is a good sign', 'Washes dishes without being asked', 'Two houseplants. Both alive.'], w: 'He gave you the soup without a speech.', ok: true },
    { n: 'Daiki, Honest Bench', t: 'Honestly? I am tired too. Bench?', d: ['Keeps a bandage in his wallet', 'Asks your opinion and then waits', 'Pays back loans early. Apologises.'], w: 'He apologised to a chair. A good sign.', ok: true },
    { n: 'Fumio the Teacher', t: 'There are no stupid questions. Mostly.', d: ['Reads the whole menu, picks what you will like', 'Bows to the furniture he bumped', 'Calls his grandmother every Sunday'], w: 'Grandma approves. Grandma is the final boss, and she approves.', ok: true, acc: 'glasses' },
    { n: 'Sachio, Quiet Cat Person', t: 'No pressure. I mean it.', d: ['Owns MORE than one towel', 'Cat sits on him voluntarily', 'Said "no pressure" and there was none'], w: 'Cats do not lie. The cat said yes.', ok: true },
    { n: 'Yuma the Bike Mechanic', t: 'Text me when you get home.', d: ['Fixed your bike and said nothing', 'Hands have grease, heart has manners', '"You can leave anytime," he said, sincerely'], w: 'He texted "got home?" and meant it. Run toward him.', ok: true },
    { n: 'Osamu from the Bookshop', t: 'You can have the last dumpling.', d: ['Never dog-ears pages', 'Reads you the good bits out loud', 'Gives away the last dumpling, calmly'], w: 'The last dumpling. A man who gives up the last dumpling is a keeper.', ok: true, acc: 'glasses' }
  ];
  // Trick suitors arrive once Hachi has warmed up: scary-but-decent, and perfect-with-one-quiet-tell.
  var TRICKY = [
    { n: 'Haru, Perfect on Paper', t: 'My mother would adore you.', d: ['Remembers your birthday, and your ex\'s', 'Cooks, cleans, files a small report', 'Has a spreadsheet tab with your name on it'], w: 'The tab was called "Phase Two".', acc: 'glasses', nr: 'Read the third line again. Slowly.' },
    { n: 'Ren-ish Guy From the Bar', t: 'I only write sad songs about you.', d: ['Very nice cheekbones, sadly', 'Met you eleven minutes ago', 'Has already written the breakup ballad'], w: 'The second verse is about his car.', acc: 'shades', nr: 'Cheekbones are not a personality. I would know.' },
    { n: 'Kenji, So Supportive', t: 'You do you. I will just watch.', d: ['Waits outside your work "to be nice"', 'Knows your train, and the carriage', 'Never once asked if you wanted him to'], w: 'Supportive like a very slow search party.', nr: 'That is not nice. That is a schedule.' },
    { n: 'Toshi, Green Flag Collector', t: 'I went to therapy. Twice. Ask me.', d: ['Mentions therapy before your drink arrives', 'Calls his ex "a teacher"', 'Has you on a list of Growth Moments'], w: 'You were Growth Moment nine.', acc: 'glasses', nr: 'He said all the right words. In order. Run.' },
    { n: 'Genzo, Looks Like a Threat', t: 'Is this seat taken. Sorry. Hello.', d: ['Neck tattoo is his grandmother\'s recipe', 'Cracks his knuckles, then rescues a moth', 'Drives like a hearse so the cake stays level'], w: 'He carried the moth outside. It sent a card.', ok: true, acc: 'shades', nr: 'Terrifying. Keep him. He reminds me of a drummer I know.' },
    { n: 'Bun, Unemployed (Ask Why)', t: 'I quit to look after my dad.', d: ['No job, for a very good reason', 'Wears the same coat, mends it himself', 'Paid you back the 200 yen. In person.'], w: 'He was broke and he still brought the 200 yen.', ok: true, nr: 'No money, no lies. Better odds than most.' },
    { n: 'Rokuro With the Loud Laugh', t: 'HA! SORRY! THAT WAS LOUD!', d: ['Laughs like a dropped tray', 'Embarrassing shirt, picked by his niece', 'Stopped talking the moment you looked tired'], w: 'The loud ones are sometimes just glad you came.', ok: true, acc: 'hat', nr: 'Loud is not the same as bad. Trust me on that.' },
    { n: 'Ichiro the Awkward', t: 'I practised this sentence.', d: ['Sweating through a very clean shirt', 'Brought a list of topics, offered you the list', 'Asked before he sat down'], w: 'Topic four was "are you okay". Keep him.', ok: true, acc: 'glasses', nr: 'He is a disaster. A polite one. Green.' }
  ];
  var DEMON_DISGUISE = [
    { n: 'Akuma Ohno, Nice Young Man', t: 'I am a completely normal human.', d: ['Warm smile, excellent manners', 'Hat worn indoors, two small lumps under it', 'Business card reads "Contracts, Souls, Misc."'], w: 'The lumps were horns. The card was a clue.' },
    { n: 'Mr. Satou (Definitely)', t: 'Sign here. For the, uh, date.', d: ['Brought flowers and a notary', 'Smells faintly of burnt paper', 'Casts a shadow with a tail'], w: 'Nobody brings a notary to karaoke.' },
    { n: 'Kind Stranger, Age "Yes"', t: 'What a lovely soul. Figure of speech.', d: ['Holds doors, and eye contact, forever', 'Says "in perpetuity" about dessert', 'Has never been seen entering a church'], w: 'In perpetuity. About the pudding.' }
  ];
  var NANA_READ_BAD = ['Nope. I could smell it from here.', 'Hachi. No. Put him down.', 'That one is a future anecdote.'];
  var NANA_READ_OK = ['He is fine. Annoyingly fine.', 'I looked for the catch. There is no catch. Weird.', 'You can keep that one. Feed it.'];
  var DEMON = [
    { n: 'THE DEMON LORD', t: 'One tiny favour, sweetheart?', d: ['He offers you a "free soulmate"', 'Terms: left and right become "emotional concepts"', 'Smells of burnt contract paper'], w: 'Left and right just swapped. Good luck, bestie.' },
    { n: 'THE DEMON LORD (AGAIN)', t: 'I only want what is best for you.', d: ['Mysteriously holding your phone', 'Has rearranged your compass', 'Tiny horns, huge fine print'], w: 'Your compass is now a suggestion.' },
    { n: 'THE DEMON LORD, ENCORE', t: 'Did you miss me? Say yes.', d: ['Dramatic wind from nowhere', 'Reversed your left. Also your right.', 'Calls it "a creative choice"'], w: 'Directions are theatre now.' }
  ];
  var HACHI_SAYS = ['Oh no. He has a nice jawline.', 'Is that destiny or gas station sushi?', 'His eyes! They are... eyes!', 'My heart is doing a drum solo.', 'He looked at me. Or at the wall behind me!', 'This one is different. (It is always different.)', 'Okay but what if he is The One?', 'I am NOT being silly. I am being hopeful.', 'He smiled. At a pigeon. So gentle!', 'Do not look. Do not look. LOOKING.', 'I have a good feeling. Same feeling as last time.', 'My radar says: ooh.'];
  var PRAISE_RUN = ['Dodged!', 'Red flag, spotted!', 'Radar says NOPE', 'Nice sprint!', 'Hachi lives!', 'Bullet: dodged', 'Heart: saved'];
  var PRAISE_LOVE = ['A GOOD ONE!', 'Rare drop! Keep him!', 'Green flag, confirmed', 'Hachi finally wins!'];
  var STREAK_CALL = { 3: 'Radar warming up', 5: 'Radar ONLINE', 8: 'Heart of steel (with glitter)', 12: 'Nana would be proud', 16: 'LOVE ORACLE', 20: 'You are the red flag now' };

  function suitorSVG(i, c) {
    var hair = ['#1b1517', '#5a3b2a', '#d9a441', '#9a9aa6', '#a8213a', '#2b3a7a'][(i * 3 + 1) % 6];
    var skin = ['#f6d7bd', '#efc3a0', '#d9a47c'][i % 3];
    var bgc = ['#ffd0df', '#f3c46b', '#bfe6ff', '#d6f0c8', '#e1d2f5'][i % 5];
    var st = i % 4, s = '<svg viewBox="0 0 100 100" aria-hidden="true">';
    s += '<rect width="100" height="100" fill="' + bgc + '"/>';
    s += '<circle cx="20" cy="22" r="2" fill="#fff"/><circle cx="80" cy="16" r="1.6" fill="#fff"/><circle cx="86" cy="60" r="2.4" fill="#fff" opacity=".6"/>';
    s += '<path d="M14 100 Q16 70 50 68 Q84 70 86 100Z" fill="' + ['#0d0b0c', '#d3122a', '#34495e', '#7d3c98'][i % 4] + '" stroke="#0d0b0c" stroke-width="2.5"/>';
    s += '<rect x="42" y="58" width="16" height="14" fill="' + skin + '" stroke="#0d0b0c" stroke-width="2.5"/>';
    if (st === 2) s += '<path d="M24 62 Q20 28 50 22 Q80 28 76 62 L68 56 L32 56Z" fill="' + hair + '" stroke="#0d0b0c" stroke-width="2.5"/>';
    s += '<ellipse cx="50" cy="44" rx="22" ry="25" fill="' + skin + '" stroke="#0d0b0c" stroke-width="2.5"/>';
    if (st === 0) s += '<path d="M27 40 Q28 18 50 18 Q72 18 73 40 Q60 28 50 31 Q38 28 27 40Z" fill="' + hair + '" stroke="#0d0b0c" stroke-width="2.5"/>';
    if (st === 1) s += '<path d="M27 38 L30 14 L40 28 L47 10 L55 28 L66 12 L71 30 L74 38 Q60 28 50 30 Q38 28 27 38Z" fill="' + hair + '" stroke="#0d0b0c" stroke-width="2.5"/>';
    if (st === 2) s += '<path d="M28 38 Q50 18 72 38 Q60 30 50 32 Q40 30 28 38Z" fill="' + hair + '" stroke="#0d0b0c" stroke-width="2.5"/>';
    if (st === 3) s += '<path d="M44 20 L50 4 L56 20 Q62 18 62 24 L38 24 Q38 18 44 20Z" fill="' + hair + '" stroke="#0d0b0c" stroke-width="2.5"/><path d="M28 38 Q30 26 40 28 L38 40Z M72 38 Q70 26 60 28 L62 40Z" fill="' + hair + '"/>';
    var acc = c.acc || 'none';
    if (c.demon) s += '<path d="M30 28 L26 8 L40 22Z M70 28 L74 8 L60 22Z" fill="#d3122a" stroke="#0d0b0c" stroke-width="2.5"/>';
    if (acc === 'shades') s += '<rect x="30" y="38" width="17" height="10" rx="3" fill="#0d0b0c"/><rect x="53" y="38" width="17" height="10" rx="3" fill="#0d0b0c"/><rect x="46" y="41" width="8" height="3" fill="#0d0b0c"/>';
    else {
      var ey = c.demon ? '#d3122a' : '#0d0b0c';
      s += '<circle cx="40" cy="43" r="3" fill="' + ey + '"/><circle cx="60" cy="43" r="3" fill="' + ey + '"/>';
      if (acc === 'glasses') s += '<circle cx="40" cy="43" r="8" fill="none" stroke="#0d0b0c" stroke-width="2"/><circle cx="60" cy="43" r="8" fill="none" stroke="#0d0b0c" stroke-width="2"/><path d="M48 43h4" stroke="#0d0b0c" stroke-width="2"/>';
    }
    if (acc === 'hat') s += '<path d="M24 32 Q50 6 76 32Z" fill="#8a5a2b" stroke="#0d0b0c" stroke-width="2.5"/><rect x="18" y="30" width="64" height="6" rx="3" fill="#6b4220" stroke="#0d0b0c" stroke-width="2.5"/>';
    if (acc === 'tear') s += '<path d="M66 50 Q70 56 66 59 Q62 56 66 50Z" fill="#6fb8ff" stroke="#0d0b0c" stroke-width="1.5"/>';
    if (acc === 'mustache') s += '<path d="M38 57 Q44 52 50 56 Q56 52 62 57 Q56 60 50 58 Q44 60 38 57Z" fill="#0d0b0c"/>';
    if (c.ok) s += '<path d="M40 56 Q50 66 60 56" fill="none" stroke="#0d0b0c" stroke-width="2.6" stroke-linecap="round"/><circle cx="34" cy="53" r="3.5" fill="#ff6fa3" opacity=".6"/><circle cx="66" cy="53" r="3.5" fill="#ff6fa3" opacity=".6"/>';
    else if (c.demon) s += '<path d="M38 56 Q50 66 62 54" fill="#0d0b0c" stroke="#0d0b0c" stroke-width="2"/>';
    else if (acc !== 'mustache') s += '<path d="M41 58 Q52 56 59 53" fill="none" stroke="#0d0b0c" stroke-width="2.6" stroke-linecap="round"/>';
    return s + '</svg>';
  }

  function redflag(ctx) {
    var root = el('div', 'mg-rf');
    root.innerHTML =
      '<div class="mg-rf-hud"><span class="mg-rf-hearts"></span><span class="mg-rf-streak"></span></div>' +
      '<div class="mg-rf-cast"></div>' +
      '<div class="mg-rf-bar"><i></i></div>' +
      '<div class="mg-rf-banner"></div>' +
      '<div class="mg-rf-deck"></div>' +
      '<div class="mg-rf-toast"></div>' +
      '<div class="mg-rf-btns"><button type="button" class="mg-rf-btn mg-rf-l" data-s="L"><b>RUN</b><small>&larr; / A</small></button>' +
      '<button type="button" class="mg-rf-ask" tabindex="-1"><b>ASK NANA</b><small></small></button>' +
      '<button type="button" class="mg-rf-btn mg-rf-r" data-s="R"><b>LOVE</b><small>D / &rarr;</small></button></div>';
    ctx.stage.appendChild(root);
    var q = function (s) { return root.querySelector(s); };
    var heartsEl = q('.mg-rf-hearts'), streakEl = q('.mg-rf-streak'), barI = q('.mg-rf-bar i'), banner = q('.mg-rf-banner');
    var cast = ctx.cast(q('.mg-rf-cast'), ['hachi', 'nana'], 'mg-cast-inline'); cast.base(0, 'happy'); cast.base(1, 'smirk');
    var lastBad = false, NANA_FACEPALM = ['*facepalm*', 'Hachi. HACHI.', 'I did not say anything. Loudly.', 'Breathe. Just breathe.'];
    var deck = q('.mg-rf-deck'), toast = q('.mg-rf-toast'), btnL = q('.mg-rf-l'), btnR = q('.mg-rf-r'), askB = q('.mg-rf-ask');
    var asks = 2, asked = false, caughtDemon = 0, tricks = shuffle(TRICKY), ti = 0, disg = shuffle(DEMON_DISGUISE), demonsSeen = 0;

    var reds = shuffle(SUITORS.filter(function (c) { return !c.ok; })), oks = shuffle(SUITORS.filter(function (c) { return c.ok; }));
    var demons = shuffle(DEMON), ri = 0, oi = 0, di = 0, nCard = 0;
    var score = 0, correct = 0, streak = 0, best = 0, hearts = 3, timeLeft = 95, elapsed = 0;
    var card = null, cardEl = null, cardT = 0, cardMax = 3, flipped = false, flipLeft = 0, nextDemon = rr(20, 26), demonDue = false, locked = false, ended = false;
    var toastT = 0, drag = null, decentSeen = 0, decentGot = 0;

    function drawHearts() { var s = ''; for (var i = 0; i < 3; i++) s += '<span class="' + (i < hearts ? 'on' : 'off') + '">&#9829;</span>'; heartsEl.innerHTML = s; }
    function labels() {
      var l = flipped ? ['LOVE', 'RUN'] : ['RUN', 'LOVE'];
      btnL.firstChild.textContent = l[0]; btnR.firstChild.textContent = l[1];
      btnL.className = 'mg-rf-btn mg-rf-l ' + (l[0] === 'RUN' ? 'is-run' : 'is-love'); btnR.className = 'mg-rf-btn mg-rf-r ' + (l[1] === 'RUN' ? 'is-run' : 'is-love');
      root.className = 'mg-rf' + (flipped ? ' mg-flipped' : '');
    }
    function showToast(s, bad) { toast.textContent = s; toast.className = 'mg-rf-toast show' + (bad ? ' bad' : ''); toastT = bad ? 2.2 : 1.1; }

    function nextCard() {
      var c;
      if (demonDue) {
        demonDue = false;
        if (demonsSeen++ === 0) { c = Object.create(demons[di++ % demons.length]); c.demon = true; }
        else { c = Object.create(disg[(demonsSeen - 2) % disg.length]); c.disg = true; c.acc = 'hat'; }
      }
      else if (nCard >= 5 && ti < tricks.length && Math.random() < 0.34) { c = tricks[ti++]; }
      else if ((Math.random() < 0.24 || reds.length - ri < 1) && oi < oks.length) { c = oks[oi++]; }
      else { if (ri >= reds.length) { reds = shuffle(reds); ri = 0; } c = reds[ri++]; }
      if (oi >= oks.length && Math.random() < 0.5) { oks = shuffle(oks); oi = 0; }
      card = c; nCard++; if (c.ok) decentSeen++;
      cardMax = c.demon ? 12 : (c.nr || c.disg ? 15 : 12.5) - Math.min(1.5, streak * 0.08);
      cardT = cardMax; asked = false; drawAsk(); deck.innerHTML = '';
      cardEl = el('div', 'mg-rf-card' + (c.demon ? ' demon' : '') + ' enter');
      var det = ''; for (var i = 0; i < c.d.length; i++) det += '<li>' + c.d[i] + '</li>';
      cardEl.innerHTML = '<i class="mg-rf-tape"></i><div class="mg-rf-photo">' + suitorSVG(nCard + (c.n.length), c) + '</div><div class="mg-rf-info"><h3>' + c.n + '</h3><p class="mg-rf-tag">&ldquo;' + c.t + '&rdquo;</p><ul>' + det + '</ul>' +
        (c.demon ? '<p class="mg-rf-warn">WARNING: after this, LEFT and RIGHT swap for 8 seconds.</p>' : '') + '</div>' +
        '<span class="mg-rf-stamp s-l"></span><span class="mg-rf-stamp s-r"></span>';
      deck.appendChild(cardEl); stampText(); locked = false;
      cast.set(0, c.demon ? 'shock' : lastBad ? 'sad' : 'happy'); cast.set(1, c.demon || lastBad ? 'angry' : 'smirk');
      if (c.demon) cast.say(0, 'Oh. Oh no. He is back.', 0); else if (lastBad && Math.random() < 0.6) cast.say(1, pick(NANA_FACEPALM), 0); else cast.say(0, pick(HACHI_SAYS), 0);
      if (c.demon) { banner.textContent = 'DEMON LORD INCOMING'; banner.className = 'mg-rf-banner show warn'; sfx('boo'); }
    }
    function stampText() {
      var sl = cardEl.querySelector('.s-l'), sr = cardEl.querySelector('.s-r');
      sl.textContent = flipped ? 'LOVE' : 'RUN'; sr.textContent = flipped ? 'RUN' : 'LOVE';
      sl.className = 'mg-rf-stamp s-l ' + (flipped ? 'love' : 'run'); sr.className = 'mg-rf-stamp s-r ' + (flipped ? 'run' : 'love');
    }

    function drawAsk() { askB.lastChild.textContent = 'x' + asks; askB.disabled = asks <= 0 || asked; }
    function askNana() {
      if (!ctx.playing || locked || !card || card.demon || asked || asks <= 0 || ended) return;
      asks--; asked = true; drawAsk(); sfx('select'); cardT = Math.min(cardMax, cardT + 3);
      cast.react(1, 'smirk', null, 2600);
      cast.say(1, card.disg ? 'That is not a man. That is paperwork with horns.' : card.nr || pick(card.ok ? NANA_READ_OK : NANA_READ_BAD), 0);
    }
    function swapControls() {
      flipped = true; flipLeft = 8; labels(); if (cardEl) stampText(); banner.textContent = 'DEMON LORD: LEFT = LOVE, RIGHT = RUN'; banner.className = 'mg-rf-banner show warn'; sfx('lose');
    }

    function choose(side) { // 'L' | 'R'
      if (!ctx.playing || locked || !card || ended) return;
      var run = (side === 'L') !== flipped;
      answer(run ? 'run' : 'love', side);
    }

    function answer(ch, side) {
      locked = true;
      var c = card, el0 = cardEl, good, i;
      if (c.demon) {
        showToast('Controls swap for 8s. Left = LOVE, Right = RUN.', false);
        swapControls();
        nextDemon = elapsed + rr(20, 26);
      } else if (c.disg) {
        nextDemon = elapsed + rr(20, 26);
        if (ch === 'run') {
          caughtDemon++; streak++; correct++; best = Math.max(best, streak); var dp = asked ? 60 : 120; score += dp;
          showToast('CAUGHT HIM! The Demon Lord in a hat!  +' + dp, false); sfx('cheer');
          cast.react(0, 'angry', 'I KNEW IT. I have ALWAYS known it. Write this down.', 2400);
        } else {
          streak = 0; showToast((ch === null ? 'Too slow. ' : 'You loved the Demon Lord. ') + c.w, true);
          swapControls(); cast.react(0, 'shock', 'He seemed so NORMAL!', 2200);
        }
      } else {
        good = ch !== null && ((ch === 'run' && !c.ok) || (ch === 'love' && c.ok)); lastBad = !good;
        if (good) {
          streak++; correct++; best = Math.max(best, streak);
          var pts = 10 * (1 + Math.floor(streak / 4)) + (c.ok ? 30 : 0) + (c.nr ? 25 : 0); if (asked) pts = Math.ceil(pts / 2); score += pts; if (c.ok) decentGot++;
          showToast((c.ok ? pick(PRAISE_LOVE) : pick(PRAISE_RUN)) + '  +' + pts, false); sfx(c.ok ? 'perfect' : 'good');
          if (STREAK_CALL[streak]) { cast.react(1, 'smirk', pick(['Huh. You do have eyes, Hachi.', 'Not bad. Keep your head.', 'Look at you, learning.', 'Who are you and where is Hachi?']), 1800); if (streak >= 10) cast.react(0, 'smirk', null, 2000); banner.textContent = STREAK_CALL[streak] + '!'; banner.className = 'mg-rf-banner show good'; banner.__t = 1.4; }
        } else {
          streak = 0; hearts--; drawHearts(); sfx('miss');
          var why = ch === null ? 'Too slow! He moved in. ' : (c.ok ? 'He was FINE! ' : 'Oh no. Love. ');
          showToast(why + c.w, true);
          if (!ctx.reduce) { root.classList.add('mg-hit'); ctx.later(function () { root.classList.remove('mg-hit'); }, 320); }
          if (hearts <= 0) { endGame('heartbroken'); }
        }
      }
      if (el0) {
        var dirL = side ? side === 'L' : Math.random() < 0.5;
        el0.className = el0.className.replace(' enter', '') + (dirL ? ' out-l' : ' out-r');
        ctx.later(function () { if (el0.parentNode) el0.parentNode.removeChild(el0); }, 260);
      }
      if (!ended) { ctx.later(function () { if (!ended) nextCard(); }, 70); }
      streakEl.innerHTML = 'STREAK <b>' + streak + '</b>';
      if (c.demon || ended) return;
    }

    function endGame(why) {
      if (ended) return; ended = true; locked = true;
      ctx.later(function () {
        score += asks * 40; var stars = score >= 800 ? 3 : score >= 380 ? 2 : score >= 150 ? 1 : 0;
        var out = (why === 'heartbroken') ? 'Three heartbreaks. Hachi retires to a sofa with ice cream.' : 'Time! Hachi has been in love ' + nCard + ' times today. A personal record.';
        ctx.finish({ title: 'Radar report', score: score, stars: stars, effects: { harmony: stars, bond: stars },
          html: '<div class="mg-stats"><span>Correct <b>' + correct + '</b></span><span>Best streak <b>' + best + '</b></span><span>Decent guys <b>' + decentGot + '/' + decentSeen + '</b></span><span>Demons unmasked <b>' + caughtDemon + '</b></span></div><p class="mg-p">' + out + '</p>' });
      }, 900);
    }

    // input
    ctx.on(window, 'keydown', function (e) {
      if (e.repeat) return;
      var k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') { choose('L'); if (ctx.playing) e.preventDefault(); }
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') { choose('R'); if (ctx.playing) e.preventDefault(); }
      else if (k === 'ArrowUp' || k === 'w' || k === 'W') { askNana(); if (ctx.playing) e.preventDefault(); }
    });
    ctx.on(btnL, 'click', function () { choose('L'); });
    ctx.on(btnR, 'click', function () { choose('R'); });
    ctx.on(askB, 'click', askNana);
    ctx.on(deck, 'pointerdown', function (e) {
      if (!ctx.playing || locked || !cardEl) return;
      drag = { x: e.clientX, id: e.pointerId, dx: 0 };
      try { deck.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
    });
    ctx.on(deck, 'pointermove', function (e) {
      if (!drag || drag.id !== e.pointerId || !cardEl) return;
      drag.dx = e.clientX - drag.x;
      var r = drag.dx / 14, a = Math.min(1, Math.abs(drag.dx) / 90);
      cardEl.style.transform = 'translateX(' + drag.dx + 'px) rotate(' + r + 'deg)';
      cardEl.classList.toggle('lean-l', drag.dx < -12); cardEl.classList.toggle('lean-r', drag.dx > 12);
      cardEl.style.setProperty('--a', a.toFixed(2));
    });
    function endDrag(e) {
      if (!drag || (e && drag.id !== e.pointerId)) return;
      var dx = drag.dx; drag = null;
      if (cardEl) { cardEl.classList.remove('lean-l'); cardEl.classList.remove('lean-r'); }
      if (Math.abs(dx) > 70 && !locked) { if (cardEl) cardEl.style.transform = ''; choose(dx < 0 ? 'L' : 'R'); }
      else if (cardEl) { cardEl.style.transform = ''; cardEl.style.setProperty('--a', '0'); }
    }
    ctx.on(deck, 'pointerup', endDrag);
    ctx.on(deck, 'pointercancel', endDrag);

    function update(dt) {
      if (ended) return;
      elapsed += dt; timeLeft -= dt; cardT -= dt;
      if (toastT > 0) { toastT -= dt; if (toastT <= 0) toast.className = 'mg-rf-toast'; }
      if (banner.__t > 0) { banner.__t -= dt; if (banner.__t <= 0 && !flipped && !(card && card.demon)) banner.className = 'mg-rf-banner'; }
      if (flipped) {
        flipLeft -= dt;
        banner.textContent = 'DEMON LORD: LEFT = LOVE, RIGHT = RUN  (' + Math.max(0, Math.ceil(flipLeft)) + ')';
        if (flipLeft <= 0) { flipped = false; labels(); if (cardEl) stampText(); banner.className = 'mg-rf-banner show good'; banner.textContent = 'Controls back to normal. Probably.'; banner.__t = 1.3; }
      }
      if (!demonDue && elapsed >= nextDemon && !(card && card.demon) && !flipped && timeLeft > 9) demonDue = true;
      if (cardT <= 0 && !locked && card) { answer(card.demon ? 'love' : null, null); }
      if (timeLeft <= 0) { timeLeft = 0; endGame('time'); }
      var f = clamp(cardT / cardMax, 0, 1);
      barI.style.width = (f * 100).toFixed(1) + '%'; barI.className = f < 0.35 ? 'low' : '';
      ctx.setScore('SCORE <b>' + score + '</b> &middot; ' + Math.ceil(timeLeft) + 's');
    }

    drawHearts(); labels(); streakEl.innerHTML = 'STREAK <b>0</b>';
    cast.say(0, 'Ooh, someone is looking at me...', 0);
    return {
      begin: function () { nextCard(); },
      update: update,
      destroy: function () { drag = null; }
    };
  }

  /* =====================================================================
     3. SCANDAL RUN
     ===================================================================== */
  var SC_ROUNDS = [['Backstreet Shuffle', 'Reach the taxi. Grab the demo CD if you dare.'], ['Konbini Crossing', 'More cameras. Same eyebrows.'], ['Neon Gauntlet', 'A scooter reporter. Lose him in an alley.'], ['Flash Alley Finale', 'Last block. Do not wave.']];
  var HEAD_ZERO = [
    'GHOST OF SHIBUYA: Rock Singer Crosses Entire City, Nobody Notices',
    'ZERO PHOTOS! Is Nana a Myth? Experts Say "Probably in a Hoodie"',
    'PAPARAZZI WEEP IN PARKING LOT: "We Had One Job"',
    'SHE VANISHED: Tokyo Cameras Left Holding Only a Gust of Wind',
    'CLEAN GETAWAY! Taxi Door Slam Heard in Four Districts',
    'CITYWIDE MYSTERY: Where Did Nana Go? (Home. Probably Home.)'
  ];
  var HEAD_FEW = [
    'BLURRY SHOT SHOCKS NATION: Is That Nana or a Very Determined Coat?',
    '{n} PHOTO{s}! Singer Seen Near Taxi, Taxi Seen Near Singer',
    'BREAKING: Rocker Caught Walking, Experts Divided on Whether That Is Legal',
    'EXCLUSIVE: Nana\'s Left Shoe, In Focus. The Rest of Her, Unavailable',
    '{n} FLASH{es}, ZERO COMMENTS: Midnight Stroll Rattles Tokyo',
    'ALLEGED NANA SIGHTED; PIGEON ALSO PRESENT, NAMED AS WITNESS',
    'CAMERA CATCHES ELBOW: Is This the Face of a Scandal? (It Is an Elbow)',
    'SINGER SPOTTED SPRINTING; "She Was Late to Something," Say Sources'
  ];
  var HEAD_MID = [
    '{n} SNAPS! Nana\'s Midnight Marathon Exposed',
    'FLASH MOB: {n} Photos Prove She Owns Boots and Opinions',
    'SCANDAL-O-METER: {n} Photos, Zero Remorse, One Taxi',
    'NANA vs. THE CITY: City Takes {n} Photos, Loses Dignity',
    'WHO WALKS LIKE THAT? {n} Photos Say "Someone Late for Everything"',
    'TOKYO CAN\'T LOOK AWAY: {n} Shots of a Woman Calmly Going Home',
    'EXCLUSIVE: She Has Legs, a Plan, and {n} Pictures to Prove It',
    'SHOCK ALLEY CAM: {n} Photos, All Grainy, All Furious'
  ];
  var HEAD_MANY = [
    '{n} PHOTOS! The Entire City Now Owns a Picture of Nana\'s Elbow',
    'ROCK STAR TURNED INTO WALLPAPER: {n} Photos Flood Tokyo',
    'TOTAL EXPOSURE: {n} Flashes, One Very Tired Singer',
    'EVERYONE HAS A PHOTO. NANA HAS A TAXI. WHO WON?',
    '{n} SHOTS FIRED (by cameras, please calm down)',
    'HER FACE EVERYWHERE: Local Printer Runs Out of Ink',
    'EMERGENCY FRONT PAGE: {n} Photos and One Crumpled Jacket',
    'STREET SIEGE! Photographers Call Night "Best Shift of My Life"'
  ];
  var SUB_DIS = ['She wore sunglasses at night. Witnesses call it "a choice".', 'A hood with strong opinions was spotted near the scene.', 'Disguise expert: "Bold. Pointless. Iconic."'];
  var SUB_COVER = ['Vending machine hailed as "most helpful bystander in Tokyo".', 'Hid behind a drinks machine; the machine declined to comment.', 'Crouching behind a snack dispenser ruled "technically a plan".'];
  var SUB_ALLEY = ['Alley cat confirms she owes it a snack.', 'Dark alley described as "very dark, very alley".', 'Local bin: "Nobody asked me, but she was polite."'];
  var SUB_MISS = ['Taxi driver: "She waved, then ran like the meter was a monster."', 'Missed taxi blamed on "an exceptionally long crosswalk".'];
  var SUB_FAST = ['Record dash leaves cameras holding a jacket-shaped breeze.', 'Speed-walking expert: "That was not walking."'];
  var SUB_CD = ['Demo CD recovered from the scene; band declines to explain why it was ever there.', 'Unreleased BLAST demo vanishes from street, says nobody we can find.'];
  var SUB_ANY = ['Insiders say she regrets nothing and everything, equally.', 'Our reporter has questions. Mostly "why".', 'Sources close to the lamp post decline to comment.'];
  var TEASE = ['Is Hachi\'s cake a cake? Experts disagree, p.4', 'Horoscope: cancel plans. Unless plans are ramen.', 'Local man yells at pigeon, pigeon wins, p.9', 'Ten tips for hiding in plain sight (wear a hat)', 'Vending machine of the year: finalists, p.12', 'Concert review: loud, and also loud, p.7', 'Crossword: 3 letters, "taxi", starts with T', 'Lost: one boot. Found: opinions.'];

  function scandal(ctx) {
    var cv = ctx.canvas(), g = cv.g, W = 0, H = 0, portrait = false, sc = 1, ox = 0, oy = 0;
    var WU = 800, WV = 480;
    var fx = new Fx(), L = null, phase = 'intro', introT = 1.5, doneT = 0, fin = false;
    var P = { u: 30, v: 240, a: 0, r: 9 };
    var round = 0, photos = 0, cleared = 0, missed = 0, disguises = 0, coverT = 0, alleyT = 0, totalT = 0, roundT = 0, tAnim = 0;
    var charge = 0, grace = 0, invis = 0, invisKind = '', shake = 0, flash = 0, soft = 0, hidden = false, drag = null;
    var keys = {}, sees = 0, stamp = 0;
    var ROUND_CAP = 24, mad = 0, happyT = 0, cds = 0;
    var cast = ctx.cast(ctx.stage, ['nana', 'hachi'], 'mg-corner'); cast.base(0, 'neutral'); cast.base(1, 'happy');
    var PHONE = ['(on the phone) Go go go!', '(on the phone) The taxi is right there!', '(on the phone) Flash on the left! LEFT!', '(on the phone) You look amazing. Now run.', '(on the phone) Hide behind the vending machine!'];

    function layout() {
      W = cv.W; H = cv.H; portrait = H > W * 1.1;
      var lw = portrait ? WV : WU, lh2 = portrait ? WU : WV;
      sc = Math.min(W / lw, H / lh2); ox = (W - lw * sc) / 2; oy = (H - lh2 * sc) / 2;
    }
    layout();
    function toScr(u, v) { return portrait ? { x: ox + v * sc, y: oy + (WU - u) * sc } : { x: ox + u * sc, y: oy + v * sc }; }

    /* ----- geometry ----- */
    function hitRect(a, b, pad) { return a.u < b.u + b.w + pad && a.u + a.w + pad > b.u && a.v < b.v + b.h + pad && a.v + a.h + pad > b.v; }
    function angDiff(a, b) { var d = a - b; while (d > Math.PI) d -= 6.2832; while (d < -Math.PI) d += 6.2832; return d; }
    function slab(ax, ay, dx, dy, r) { // ray vs rect -> t entering (>=0) or Infinity
      var tmin = 0, tmax = Infinity, t1, t2, tmp;
      if (Math.abs(dx) < 1e-9) { if (ax < r.u || ax > r.u + r.w) return Infinity; }
      else { t1 = (r.u - ax) / dx; t2 = (r.u + r.w - ax) / dx; if (t1 > t2) { tmp = t1; t1 = t2; t2 = tmp; } tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); }
      if (Math.abs(dy) < 1e-9) { if (ay < r.v || ay > r.v + r.h) return Infinity; }
      else { t1 = (r.v - ay) / dy; t2 = (r.v + r.h - ay) / dy; if (t1 > t2) { tmp = t1; t1 = t2; t2 = tmp; } tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); }
      return tmin <= tmax ? tmin : Infinity;
    }
    function rayCircle(ax, ay, dx, dy, c) { // dx,dy unit
      var fx2 = ax - c.u, fy2 = ay - c.v, b = fx2 * dx + fy2 * dy, cc = fx2 * fx2 + fy2 * fy2 - c.r * c.r, disc = b * b - cc;
      if (disc < 0) return Infinity; var t = -b - Math.sqrt(disc); return t >= 0 ? t : Infinity;
    }
    function castRay(ax, ay, ang, range) {
      var dx = Math.cos(ang), dy = Math.sin(ang), best = range, i, t;
      for (i = 0; i < L.walls.length; i++) { t = slab(ax, ay, dx, dy, L.walls[i]); if (t < best) best = t; }
      for (i = 0; i < L.npcs.length; i++) { t = rayCircle(ax, ay, dx, dy, L.npcs[i]); if (t < best) best = t; }
      return best;
    }
    function blocked(ax, ay, bx, by) {
      var dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy); if (d < 1) return false; dx /= d; dy /= d;
      var i, t;
      for (i = 0; i < L.walls.length; i++) { t = slab(ax, ay, dx, dy, L.walls[i]); if (t < d) return true; }
      for (i = 0; i < L.npcs.length; i++) { t = rayCircle(ax, ay, dx, dy, L.npcs[i]); if (t < d - 6) return true; }
      return false;
    }

    /* ----- level generation ----- */
    function genLevel(r) {
      var gen = { walls: [], alleys: [], papas: [], npcs: [], items: [], taxi: { u: 768, v: 240 } }, i, k;
      function bands(top) {
        var n = 1 + (r >= 2 ? 1 : 0), gaps = [], tries = 0;
        while (gaps.length < n && tries++ < 40) { var gu = rr(190, 640); if (gaps.every(function (q) { return Math.abs(q - gu) > 130; })) gaps.push(gu); }
        gaps.sort(function (a, b) { return a - b; });
        var v0 = top ? 0 : 410, cursor = 0;
        gaps.forEach(function (gu2) {
          gen.walls.push({ u: cursor, v: v0, w: gu2 - cursor, h: 70, k: 'bldg', top: top });
          gen.alleys.push({ u: gu2, v: v0, w: 58, h: 70, top: top }); cursor = gu2 + 58;
        });
        gen.walls.push({ u: cursor, v: v0, w: WU - cursor, h: 70, k: 'bldg', top: top });
      }
      bands(true); bands(false);
      // paparazzi
      var np = Math.min(5, 2 + r);
      for (i = 0; i < np; i++) {
        var top = Math.random() < 0.5, u0 = 190 + (i + rr(0.1, 0.9)) * (470 / np);
        gen.papas.push({ u: u0, v: top ? 88 : 392, u0: u0, a0: top ? Math.PI / 2 : -Math.PI / 2, a: 0, amp: rr(0.75, 1.15), sp: 0.65 + 0.2 * r + rr(0, 0.3), ph: rr(0, 6), range: 170 + r * 20 + rr(0, 20), half: 0.4 + r * 0.015,
          patrol: r >= 1 && i % 2 === 1 ? 30 + r * 10 : 0, pdir: 1, poly: [], alert: false, vis: 0 });
      }
      // blockers (vending machines, kiosks, vans)
      var kinds = [{ k: 'vend', w: 24, h: 36 }, { k: 'vend', w: 24, h: 36 }, { k: 'kiosk', w: 56, h: 30 }, { k: 'van', w: 74, h: 36 }, { k: 'vend', w: 24, h: 36 }, { k: 'kiosk', w: 56, h: 30 }, { k: 'vend', w: 24, h: 36 }];
      function place(w, h, avoidWalls) {
        for (var tr = 0; tr < 50; tr++) {
          var rc = { u: rr(120, 690 - w), v: rr(88, 392 - h), w: w, h: h }, ok = true, j;
          if (avoidWalls) for (j = 0; j < gen.walls.length; j++) if (hitRect(rc, gen.walls[j], 34)) { ok = false; break; }
          if (ok) for (j = 0; j < gen.papas.length; j++) { var pp = gen.papas[j]; if (hitRect(rc, { u: pp.u - 14, v: pp.v - 14, w: 28, h: 28 }, 14)) { ok = false; break; } }
          if (ok) return rc;
        }
        return null;
      }
      for (i = 0; i < kinds.length; i++) { var rc = place(kinds[i].w, kinds[i].h, true); if (rc) { rc.k = kinds[i].k; rc.col = i % 3; gen.walls.push(rc); } }
      // crowds
      for (k = 0; k < 2; k++) {
        var cu = rr(220, 580), cvv = rr(120, 360), pal = ['#7d3c98', '#2e86c1', '#e67e22', '#b03a2e', '#566573'];
        for (i = 0; i < 5; i++) gen.npcs.push({ cu: cu + rr(-30, 30), cv: cvv + rr(-30, 30), u: 0, v: 0, r: 10, a: rr(0, 6.28), sp: rr(0.4, 0.9), orb: rr(5, 14), col: pick(pal) });
      }
      // disguises
      for (i = 0; i < 2; i++) { var ic = place(20, 20, true); if (ic) gen.items.push({ u: ic.u + 10, v: ic.v + 10, kind: i % 2 ? 'hood' : 'shades', got: false }); }
      // the risky pickup: a dropped demo CD, right where a camera is pointing
      var bait = pick(gen.papas), cd = null;
      for (i = 0; i < 40 && !cd; i++) {
        var tu = bait.u + rr(-70, 70), tv = bait.v + (bait.a0 > 0 ? 1 : -1) * rr(60, 120), probe = { u: tu - 10, v: tv - 10, w: 20, h: 20 };
        if (gen.walls.every(function (q) { return !hitRect(probe, q, 12); })) cd = { u: tu, v: tv, kind: 'cd', got: false };
      }
      if (cd) gen.items.push(cd);
      if (r >= 2) gen.hound = { u: 420, v: 240, u0: 420, v0: 240, r: 12, range: 68, seen: false };
      L = gen; L.npcs.forEach(function (n) { n.u = n.cu + Math.cos(n.a) * n.orb; n.v = n.cv + Math.sin(n.a) * n.orb; });
      bake(r);
    }

    /* ----- static background, baked per level ----- */
    function bake(r) {
      var b = document.createElement('canvas'); b.width = WU * 2; b.height = WV * 2; var c = b.getContext('2d'); c.scale(2, 2);
      c.fillStyle = '#17121f'; c.fillRect(0, 0, WU, WV);
      c.fillStyle = '#211a2e'; c.fillRect(0, 70, WU, 340);
      c.fillStyle = 'rgba(243,236,224,0.16)';
      for (var x = 0; x < WU; x += 54) c.fillRect(x, 238, 30, 4);
      for (x = 0; x < 9; x++) { c.fillStyle = 'rgba(243,236,224,0.08)'; for (var y = 0; y < 5; y++) c.fillRect(620 + x * 4, 90 + y * 60, 2, 30); }
      var col = ['#ff6fa3', '#d3122a', '#4fd1c5', '#f4c430'];
      for (var p = 0; p < 7; p++) { c.fillStyle = 'rgba(' + [255, 111, 163, 0.07].join(',') + ')'; c.beginPath(); c.ellipse(rr(60, 740), rr(100, 380), rr(14, 40), rr(5, 12), 0, 0, 6.28); c.fill(); }
      c.drawImage(halftone(WU, WV, 'rgba(255,255,255,0.05)', 10, 2.2, function (x2, y2) { return 0.4 + 0.6 * Math.sin(x2 * 6 + y2 * 3) * Math.sin(y2 * 5); }), 0, 0);
      L.walls.forEach(function (w) {
        if (w.k !== 'bldg') return;
        c.fillStyle = '#0d0a13'; c.fillRect(w.u, w.v, w.w, w.h);
        for (var wx = w.u + 8; wx < w.u + w.w - 12; wx += 22) for (var wy = w.v + 8; wy < w.v + w.h - 14; wy += 24) {
          c.fillStyle = Math.random() < 0.35 ? 'rgba(244,196,48,' + rr(0.35, 0.8).toFixed(2) + ')' : 'rgba(80,70,110,0.45)'; c.fillRect(wx, wy, 11, 14);
        }
        var ny = w.top ? w.v + w.h - 6 : w.v + 2;
        var nc = pick(col); c.save(); c.shadowColor = nc; c.shadowBlur = 14; c.fillStyle = nc; c.fillRect(w.u + 6, ny, Math.max(10, w.w - 12), 4); c.restore();
        if (w.w > 90) { c.save(); c.shadowColor = pick(col); c.shadowBlur = 10; c.strokeStyle = c.shadowColor; c.lineWidth = 3; var sx = w.u + w.w / 2; c.strokeRect(sx - 24, w.top ? w.v + 14 : w.v + w.h - 36, 48, 22); c.restore(); }
      });
      L.alleys.forEach(function (a) {
        c.fillStyle = '#050309'; c.fillRect(a.u, a.v, a.w, a.h);
        c.fillStyle = '#16111f'; for (var q = 0; q < 5; q++) c.fillRect(a.u + 4, a.v + 6 + q * 13, a.w - 8, 1.5);
        c.fillStyle = '#2a3a32'; c.fillRect(a.u + 6, a.top ? a.v + 4 : a.v + a.h - 18, 16, 14);
      });
      L.bg = b;
    }

    function startRound() {
      genLevel(round); P.u = 34; P.v = 240; P.a = 0; charge = 0; grace = 0.8; roundT = 0; invis = 0;
      phase = 'intro'; introT = 1.5; sfx('page'); if (L.hound) cast.say(0, 'A reporter on a scooter. Lose him in an alley.', 2600); else cast.say(1, pick(PHONE), 2600);
    }

    /* ----- input ----- */
    ctx.on(window, 'keydown', function (e) {
      var k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].indexOf(k) < 0) return;
      keys[k] = true; if (ctx.playing) e.preventDefault();
    });
    ctx.on(window, 'keyup', function (e) { keys[e.key.toLowerCase()] = false; });
    ctx.on(window, 'blur', function () { keys = {}; drag = null; });
    ctx.on(cv.c, 'pointerdown', function (e) {
      e.preventDefault(); var r = cv.c.getBoundingClientRect();
      drag = { id: e.pointerId, x0: e.clientX - r.left, y0: e.clientY - r.top, x: e.clientX - r.left, y: e.clientY - r.top };
      try { cv.c.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
    });
    ctx.on(cv.c, 'pointermove', function (e) { if (drag && drag.id === e.pointerId) { var r = cv.c.getBoundingClientRect(); drag.x = e.clientX - r.left; drag.y = e.clientY - r.top; } });
    function up(e) { if (drag && drag.id === e.pointerId) drag = null; }
    ctx.on(cv.c, 'pointerup', up); ctx.on(cv.c, 'pointercancel', up);

    function inputVec() {
      var sx = 0, sy = 0;
      if (keys.arrowleft || keys.a) sx -= 1; if (keys.arrowright || keys.d) sx += 1;
      if (keys.arrowup || keys.w) sy -= 1; if (keys.arrowdown || keys.s) sy += 1;
      if (!sx && !sy && drag) {
        var dx = drag.x - drag.x0, dy = drag.y - drag.y0, m = Math.hypot(dx, dy);
        if (m > 8) { var k = Math.min(1, m / 42); sx = dx / m * k; sy = dy / m * k; }
      }
      var m2 = Math.hypot(sx, sy); if (m2 > 1) { sx /= m2; sy /= m2; }
      return portrait ? { du: -sy, dv: sx } : { du: sx, dv: sy };
    }

    /* ----- game logic ----- */
    function popup(u, v, s, c, size) { var p = toScr(u, v); fx.text(p.x, p.y - 20, s, c, size || 22); }
    function spark(u, v, n, cols, o) { var p = toScr(u, v); fx.burst(p.x, p.y, n, cols, o); }

    function roundOver(ok) {
      var cleared0 = ok;
      if (cleared0) { happyT = 1.6; cast.say(1, 'YES! Taxi! Go go!', 1800); cleared++; sfx('win'); popup(P.u, P.v, pick(['TAXI!', 'GO GO GO!', 'DOOR SLAM!', 'ESCAPED!']), C.gold, 28); spark(L.taxi.u, L.taxi.v, 26, [C.gold, C.pink, '#fff'], { shape: 'star', min: 80, max: 300, g: 300 }); }
      else { mad = 1.6; cast.say(0, 'It left. Of course it left.', 2000); missed++; photos++; sfx('boo'); popup(P.u, P.v, 'TAXI LEFT!', C.paper, 28); shake = 8; }
      round++;
      if (round >= 4) { phase = 'done'; doneT = 0; }
      else startRound();
    }

    function takePhoto() {
      photos++; charge = 0; grace = 1.2; shake = 9; soft = 0.9; if (!ctx.reduce) flash = 0.16;
      mad = 1.6; cast.say(Math.random() < 0.5 ? 0 : 1, Math.random() < 0.5 ? 'Not the face!' : '(on the phone) They got you! Keep going!', 2000);
      sfx('flash'); popup(P.u, P.v, pick(['SNAP!', 'FLASH!', 'CHEESE!', 'PAPARAZZI!', 'OH COME ON']), C.paper, 26);
      spark(P.u, P.v, 14, ['#fff', C.gold, C.pink], { shape: 'star', min: 90, max: 260, g: 100 });
    }

    function update(dt) {
      tAnim += dt; fx.step(dt); shake = Math.max(0, shake - dt * 28); flash = Math.max(0, flash - dt); soft = Math.max(0, soft - dt * 1.4);
      if (!L) return;
      var i, n, p;
      for (i = 0; i < L.npcs.length; i++) { n = L.npcs[i]; n.a += n.sp * dt; n.u = n.cu + Math.cos(n.a) * n.orb; n.v = n.cv + Math.sin(n.a * 1.3) * n.orb; }
      if (phase === 'intro') { introT -= dt; ctx.setScore('ROUND <b>' + Math.min(4, round + 1) + '/4</b> &middot; PHOTOS <b>' + photos + '</b>'); if (introT <= 0) phase = 'run'; return; }
      if (phase === 'done') { doneT += dt; if (doneT > 1.1 && !fin) { fin = true; finishNow(); } return; }
      totalT += dt; roundT += dt; grace = Math.max(0, grace - dt); invis = Math.max(0, invis - dt);

      // move
      var iv = inputVec(), spd = 150;
      if (iv.du || iv.dv) { P.a = Math.atan2(iv.dv, iv.du); }
      P.u = clamp(P.u + iv.du * spd * dt, 8, WU - 8); P.v = clamp(P.v + iv.dv * spd * dt, 8, WV - 8);
      for (i = 0; i < L.walls.length; i++) {
        var w = L.walls[i], nu = clamp(P.u, w.u, w.u + w.w), nv = clamp(P.v, w.v, w.v + w.h), dx = P.u - nu, dy = P.v - nv, d = Math.hypot(dx, dy);
        if (d < P.r) {
          if (d > 0.001) { P.u = nu + dx / d * P.r; P.v = nv + dy / d * P.r; }
          else { P.v = w.v + w.h * 0.5 > P.v ? w.v - P.r : w.v + w.h + P.r; }
        }
      }
      // alley
      hidden = false;
      for (i = 0; i < L.alleys.length; i++) { var al = L.alleys[i]; if (P.u > al.u && P.u < al.u + al.w && P.v > al.v && P.v < al.v + al.h) hidden = true; }
      if (hidden) alleyT += dt;

      // items
      for (i = 0; i < L.items.length; i++) {
        var it = L.items[i];
        if (!it.got && Math.hypot(P.u - it.u, P.v - it.v) < 20) {
          it.got = true;
          if (it.kind === 'cd') { cds++; sfx('perfect'); popup(P.u, P.v, 'DEMO SAVED!', C.gold, 22); spark(it.u, it.v, 14, [C.gold, '#fff'], { shape: 'star', min: 60, max: 200, g: 200 }); cast.say(0, 'Shin left this in a gutter. Naturally.', 1900); continue; }
          cast.say(0, it.kind === 'hood' ? 'Hood up. Nobody looks at hoods.' : 'Sunglasses. At night. Obviously.', 1900); disguises++; invis = it.kind === 'hood' ? 4.5 : 5.5; invisKind = it.kind; sfx('chime');
          popup(P.u, P.v, it.kind === 'hood' ? 'HOOD UP. MYSTERY +10' : 'SUNGLASSES. AT NIGHT.', C.pink, 20);
          spark(it.u, it.v, 14, [C.pink, '#fff'], { shape: 'heart', min: 60, max: 200, g: 200 });
        }
      }

      // paparazzi
      sees = 0; var covered = false;
      for (i = 0; i < L.papas.length; i++) {
        p = L.papas[i];
        p.a = p.a0 + p.amp * Math.sin(tAnim * p.sp + p.ph);
        if (p.patrol) { p.u += p.pdir * p.patrol * dt; if (p.u > p.u0 + 70) p.pdir = -1; if (p.u < p.u0 - 70) p.pdir = 1; }
        // cone polygon
        var steps = 14, poly = p.poly; poly.length = 0; poly.push(p.u, p.v);
        for (var s = 0; s <= steps; s++) { var ang = p.a - p.half + (2 * p.half) * s / steps, t = castRay(p.u, p.v, ang, p.range); poly.push(p.u + Math.cos(ang) * t, p.v + Math.sin(ang) * t); }
        var dxp = P.u - p.u, dyp = P.v - p.v, dd = Math.hypot(dxp, dyp), st = 0;
        if (dd <= p.range && Math.abs(angDiff(Math.atan2(dyp, dxp), p.a)) <= p.half) st = blocked(p.u, p.v, P.u, P.v) ? 2 : 1;
        p.alert = false;
        if (st === 2) covered = true;
        if (st === 1 && !hidden && invis <= 0) { sees++; p.alert = true; }
      }
      if (L.hound) {
        var hd = L.hound, hdx = P.u - hd.u, hdy = P.v - hd.v, hdd = Math.hypot(hdx, hdy) || 1;
        var canSee = !hidden && invis <= 0 && hdd < 300 && !blocked(hd.u, hd.v, P.u, P.v);
        var tx0 = canSee ? hdx / hdd : (hd.u0 - hd.u), ty0 = canSee ? hdy / hdd : (hd.v0 - hd.v), tm = canSee ? 1 : (Math.hypot(tx0, ty0) || 1);
        if (canSee || tm > 4) { hd.u += tx0 / tm * 74 * dt; hd.v += ty0 / tm * 74 * dt; }
        for (i = 0; i < L.walls.length; i++) {
          var hw = L.walls[i], hnu = clamp(hd.u, hw.u, hw.u + hw.w), hnv = clamp(hd.v, hw.v, hw.v + hw.h), hx0 = hd.u - hnu, hy0 = hd.v - hnv, hdw = Math.hypot(hx0, hy0);
          if (hdw < hd.r && hdw > 0.001) { hd.u = hnu + hx0 / hdw * hd.r; hd.v = hnv + hy0 / hdw * hd.r; }
        }
        hd.seen = canSee && hdd < hd.range;
        if (hd.seen) sees++;
      }
      if (covered && !hidden) coverT += dt;
      mad = Math.max(0, mad - dt); happyT = Math.max(0, happyT - dt);
      cast.set(0, sees ? 'shock' : mad > 0 ? 'angry' : happyT > 0 ? 'happy' : invis > 0 ? 'smirk' : 'neutral'); cast.set(1, mad > 0 || sees ? 'shock' : 'happy');
      if (sees && grace <= 0) { charge += dt / 0.85; if (charge >= 1) takePhoto(); }
      else charge = Math.max(0, charge - dt * 1.4);

      // taxi / time
      if (Math.hypot(P.u - L.taxi.u, P.v - L.taxi.v) < 36) { roundOver(true); return; }
      if (roundT > ROUND_CAP) { roundOver(false); return; }
      ctx.setScore('ROUND <b>' + Math.min(4, round + 1) + '/4</b> &middot; PHOTOS <b>' + photos + '</b> &middot; ' + Math.max(0, Math.ceil(ROUND_CAP - roundT)) + 's');
    }

    /* ----- tabloid ----- */
    function fillTok(s) { return s.replace('{n}', photos).replace('{s}', photos === 1 ? '' : 'S').replace('{es}', photos === 1 ? '' : 'ES'); }
    function finishNow() {
      var main = fillTok(pick(photos === 0 ? HEAD_ZERO : photos <= 2 ? HEAD_FEW : photos <= 5 ? HEAD_MID : HEAD_MANY));
      var subs = [];
      if (disguises > 0) subs.push(pick(SUB_DIS));
      if (coverT > 1.5) subs.push(pick(SUB_COVER));
      if (alleyT > 1.5) subs.push(pick(SUB_ALLEY));
      if (missed > 0) subs.push(pick(SUB_MISS));
      if (cds > 0) subs.push(pick(SUB_CD));
      if (cleared === 4 && totalT < 38) subs.push(pick(SUB_FAST));
      subs = shuffle(subs).slice(0, 2); if (!subs.length) subs.push(pick(SUB_ANY));
      var tz = shuffle(TEASE).slice(0, 3);
      var stars = photos === 0 || (photos === 1 && cds >= 2) ? 3 : photos <= 3 ? 2 : photos <= 7 ? 1 : 0;
      if (cleared < 4) stars = Math.max(0, stars - 1);
      var score = Math.max(0, cleared * 200 - photos * 35 + disguises * 25 + cds * 80 + Math.max(0, Math.round(60 - totalT)));
      var html = '<div class="mg-paper"><div class="mg-paper-mast">THE MIDNIGHT SCANDAL-GRAM</div><div class="mg-paper-meta">LATE EDITION &middot; 100 YEN (OR LESS) &middot; TRUTH-ISH</div>' +
        '<h3 class="mg-paper-h">' + main + '</h3>' +
        '<div class="mg-paper-photo"><span class="mg-paper-fig"><i></i><b></b></span><span class="mg-paper-burst">' + photos + '<small>PHOTO' + (photos === 1 ? '' : 'S') + '</small></span><em>EXHIBIT A: A person. Probably.</em></div>' +
        '<p class="mg-paper-sub">' + subs.join(' ') + '</p><div class="mg-paper-tease"><span>' + tz.join('</span><span>') + '</span></div></div>';
      ctx.finish({ title: 'Tomorrow\'s front page', cls: 'mg-wide', score: score, stars: stars, effects: { scandal: Math.min(photos, 6), fame: photos >= 4 ? 2 : photos >= 1 ? 1 : 0 }, headline: main, html: html,
        line: pick([
          ['You were the entire front page. Nana asks the driver to go faster and not look at the radio.', 'Total exposure. Somewhere a printer is on fire.'],
          ['The tabloids got their breakfast. Nana got a taxi. Everyone is slightly unhappy.', 'Photographed, but with attitude. Attitude sells.'],
          ['A couple of grainy shots. Nana says the coat looked great. The coat agrees.', 'Mostly ghost, a little celebrity. Acceptable.'],
          ['Not one photo. The cameras file a missing-persons report on their own batteries.', 'Perfect heist. Nana buys a vending-machine coffee as a victory lap.']
        ][stars]) });
    }

    /* ----- drawing ----- */
    function drawWall(w) {
      if (w.k === 'bldg') return;
      g.save();
      g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(w.u + 3, w.v + 4, w.w, w.h);
      if (w.k === 'vend') {
        var cc = ['#d3122a', '#2c7bb6', '#f4c430'][w.col || 0];
        g.fillStyle = cc; g.fillRect(w.u, w.v, w.w, w.h); g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(w.u + 3, w.v + 4, w.w - 9, w.h - 12);
        g.fillStyle = 'rgba(255,111,163,0.9)'; g.fillRect(w.u + 5, w.v + 7, 4, 5); g.fillRect(w.u + 11, w.v + 7, 4, 5); g.fillRect(w.u + 5, w.v + 15, 4, 5);
        g.strokeStyle = C.ink; g.lineWidth = 1.5; g.strokeRect(w.u, w.v, w.w, w.h);
      } else if (w.k === 'kiosk') {
        g.fillStyle = '#7a5a3a'; g.fillRect(w.u, w.v, w.w, w.h);
        for (var s = 0; s < w.w; s += 10) { g.fillStyle = (s / 10) % 2 ? '#f3ece0' : '#d3122a'; g.fillRect(w.u + s, w.v, 10, w.h * 0.5); }
        g.strokeStyle = C.ink; g.lineWidth = 1.5; g.strokeRect(w.u, w.v, w.w, w.h);
      } else {
        g.fillStyle = '#e8e2d4'; rrect(g, w.u, w.v, w.w, w.h, 6); g.fill(); g.fillStyle = '#ff6fa3'; g.fillRect(w.u + 8, w.v, 8, w.h);
        g.fillStyle = '#4fd1c5'; g.fillRect(w.u + w.w - 18, w.v + 3, 12, w.h - 6); g.strokeStyle = C.ink; g.lineWidth = 1.5; rrect(g, w.u, w.v, w.w, w.h, 6); g.stroke();
      }
      g.restore();
    }
    function drawPlayer() {
      g.save(); g.translate(P.u, P.v); g.rotate(P.a);
      var a = (hidden ? 0.45 : 1) * (invis > 0 ? 0.6 : 1), i;
      g.globalAlpha = a; g.strokeStyle = C.ink; g.lineWidth = 1.6; g.lineJoin = 'round';
      g.fillStyle = '#17141a'; g.beginPath(); g.ellipse(0, 0, 6.5, 12, 0, 0, 6.283); g.fill(); g.stroke();
      g.fillStyle = C.red; g.fillRect(-1, -9, 2.4, 18);
      g.fillStyle = '#17141a'; g.fillRect(-1, -13.5, 6, 3.5); g.fillRect(-1, 10, 6, 3.5);
      if (invis > 0 && invisKind === 'hood') { g.fillStyle = '#6b6b78'; g.beginPath(); g.arc(1, 0, 9.5, 0, 6.283); g.fill(); g.stroke(); }
      g.fillStyle = '#f0c8a8'; g.beginPath(); g.arc(1.5, 0, 6.2, 0, 6.283); g.fill(); g.stroke();
      if (!(invis > 0 && invisKind === 'hood')) {
        g.fillStyle = '#0d0b0c'; g.beginPath(); g.arc(-1, 0, 7.4, Math.PI * 0.45, Math.PI * 1.55); g.fill();
        for (i = 0; i < 5; i++) { var an = Math.PI * (0.55 + i * 0.225); g.beginPath(); g.moveTo(Math.cos(an - 0.22) * 6.5 - 1, Math.sin(an - 0.22) * 6.5); g.lineTo(Math.cos(an) * 12 - 2.5, Math.sin(an) * 12.5); g.lineTo(Math.cos(an + 0.22) * 6.5 - 1, Math.sin(an + 0.22) * 6.5); g.closePath(); g.fill(); }
        g.fillStyle = C.red; g.fillRect(-3, -1, 2, 2);
      }
      if (invis > 0 && invisKind !== 'hood') { g.fillStyle = C.ink; g.fillRect(4, -5, 3, 4.5); g.fillRect(4, 0.5, 3, 4.5); }
      g.restore();
      if (invis > 0) { g.strokeStyle = 'rgba(255,255,255,0.7)'; g.setLineDash([4, 5]); g.lineDashOffset = -tAnim * 20; g.lineWidth = 1.5; g.beginPath(); g.arc(P.u, P.v, 17, 0, 6.283); g.stroke(); g.setLineDash([]); }
      if (charge > 0) { g.strokeStyle = charge > 0.66 ? '#ff4057' : '#ffe27a'; g.lineWidth = 4; g.beginPath(); g.arc(P.u, P.v, 15, -Math.PI / 2, -Math.PI / 2 + charge * 6.283); g.stroke(); }
    }

    function draw() {
      if (!W || !L) { if (W) { g.fillStyle = C.ink; g.fillRect(0, 0, W, H); } return; }
      g.fillStyle = '#0a080d'; g.fillRect(0, 0, W, H);
      g.save();
      var shx = shake > 0 && !ctx.reduce ? rr(-shake, shake) * 0.5 : 0, shy = shake > 0 && !ctx.reduce ? rr(-shake, shake) * 0.5 : 0;
      g.translate(ox + shx, oy + shy); g.scale(sc, sc);
      if (portrait) g.transform(0, -1, 1, 0, 0, WU);
      g.beginPath(); g.rect(0, 0, WU, WV); g.clip();
      g.drawImage(L.bg, 0, 0, WU, WV);
      var i, p;
      // taxi
      var tx = L.taxi.u, ty = L.taxi.v, pulse = 0.5 + 0.5 * Math.sin(tAnim * 2);
      var grd = g.createRadialGradient(tx, ty, 6, tx, ty, 52); grd.addColorStop(0, 'rgba(244,196,48,' + (0.3 + 0.12 * pulse).toFixed(2) + ')'); grd.addColorStop(1, 'rgba(244,196,48,0)');
      g.fillStyle = grd; g.fillRect(tx - 54, ty - 54, 108, 108);
      g.fillStyle = C.gold; g.strokeStyle = C.ink; g.lineWidth = 2; rrect(g, tx - 14, ty - 24, 32, 48, 7); g.fill(); g.stroke();
      g.fillStyle = '#3a3f55'; g.fillRect(tx - 8, ty - 14, 20, 10); g.fillRect(tx - 8, ty + 6, 20, 8);
      g.fillStyle = '#fff'; g.fillRect(tx - 4, ty - 4, 10, 6); g.fillStyle = C.red; g.fillRect(tx - 14, ty - 20, 3, 6); g.fillRect(tx - 14, ty + 14, 3, 6);
      // items
      for (i = 0; i < L.items.length; i++) {
        var it = L.items[i]; if (it.got) continue;
        var bob = Math.sin(tAnim * 3 + i) * 2;
        g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.arc(it.u, it.v + bob, 14, 0, 6.283); g.fill();
        if (it.kind === 'cd') { g.fillStyle = '#d9d4de'; g.strokeStyle = C.ink; g.lineWidth = 1.5; g.beginPath(); g.arc(it.u, it.v + bob, 9, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = C.gold; g.beginPath(); g.arc(it.u, it.v + bob, 3, 0, 6.283); g.fill(); g.stroke(); }
        else if (it.kind === 'hood') { g.fillStyle = '#6b6b78'; g.beginPath(); g.arc(it.u, it.v + bob, 8, Math.PI, 0); g.lineTo(it.u + 8, it.v + bob + 7); g.lineTo(it.u - 8, it.v + bob + 7); g.closePath(); g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1.5; g.stroke(); }
        else { g.fillStyle = C.ink; g.fillRect(it.u - 9, it.v + bob - 4, 8, 6); g.fillRect(it.u + 1, it.v + bob - 4, 8, 6); g.fillRect(it.u - 2, it.v + bob - 3, 4, 2); g.strokeStyle = C.pink; g.lineWidth = 1.5; g.strokeRect(it.u - 9, it.v + bob - 4, 18, 6); }
      }
      // cones
      for (i = 0; i < L.papas.length; i++) {
        p = L.papas[i]; var poly = p.poly; if (poly.length < 6) continue;
        var cg = g.createRadialGradient(p.u, p.v, 4, p.u, p.v, p.range), al = p.alert;
        cg.addColorStop(0, al ? 'rgba(255,90,110,0.5)' : 'rgba(255,246,205,0.42)'); cg.addColorStop(1, al ? 'rgba(255,90,110,0.06)' : 'rgba(255,246,205,0.03)');
        g.fillStyle = cg; g.beginPath(); g.moveTo(poly[0], poly[1]); for (var k = 2; k < poly.length; k += 2) g.lineTo(poly[k], poly[k + 1]); g.closePath(); g.fill();
      }
      for (i = 0; i < L.walls.length; i++) drawWall(L.walls[i]);
      for (i = 0; i < L.npcs.length; i++) {
        var n = L.npcs[i]; g.fillStyle = n.col; g.strokeStyle = C.ink; g.lineWidth = 1.5; g.beginPath(); g.ellipse(n.u, n.v, 6.5, 10, 0, 0, 6.283); g.fill(); g.stroke();
        g.fillStyle = '#e8c9aa'; g.beginPath(); g.arc(n.u, n.v, 5.4, 0, 6.283); g.fill(); g.stroke();
      }
      drawPlayer();
      if (L.hound) {
        var hh0 = L.hound; g.strokeStyle = hh0.seen ? 'rgba(255,64,87,0.75)' : 'rgba(255,246,205,0.3)'; g.lineWidth = 2; g.setLineDash([6, 6]); g.beginPath(); g.arc(hh0.u, hh0.v, hh0.range, 0, 6.283); g.stroke(); g.setLineDash([]);
        g.fillStyle = '#c1412f'; g.strokeStyle = C.ink; rrect(g, hh0.u - 16, hh0.v - 8, 32, 16, 6); g.fill(); g.stroke();
        g.fillStyle = '#e8c9aa'; g.beginPath(); g.arc(hh0.u, hh0.v, 6, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = C.ink; g.fillRect(hh0.u - 2, hh0.v - 14, 12, 8);
      }
      for (i = 0; i < L.papas.length; i++) {
        p = L.papas[i]; g.save(); g.translate(p.u, p.v); g.rotate(p.a);
        g.fillStyle = '#3b3b48'; g.strokeStyle = C.ink; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, 0, 6, 11, 0, 0, 6.283); g.fill(); g.stroke();
        g.fillStyle = '#e67e22'; g.fillRect(-3, -4, 6, 8); g.fillStyle = '#e8c9aa'; g.beginPath(); g.arc(0, 0, 5, 0, 6.283); g.fill(); g.stroke();
        g.fillStyle = C.ink; g.fillRect(5, -5, 11, 10); g.fillStyle = p.alert ? '#ff4057' : '#bfe6ff'; g.beginPath(); g.arc(16, 0, 3.4, 0, 6.283); g.fill();
        g.restore();
      }
      g.restore();
      // screen overlays
      for (i = 0; i < L.papas.length; i++) {
        p = L.papas[i]; if (!p.alert) continue; var sp = toScr(p.u, p.v); ptext(g, '!', sp.x, sp.y - 20 * sc - 8, Math.max(16, 22 * sc * 1.2), '#ff4057');
      }
      var vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
      vg.addColorStop(0, 'rgba(5,3,10,0)'); vg.addColorStop(1, 'rgba(5,3,10,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      if (soft > 0) { var sg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.7); sg.addColorStop(0, 'rgba(211,18,42,0)'); sg.addColorStop(1, 'rgba(211,18,42,' + (soft * 0.5).toFixed(2) + ')'); g.fillStyle = sg; g.fillRect(0, 0, W, H); }
      if (flash > 0 && !ctx.reduce) { g.fillStyle = 'rgba(255,255,255,' + (flash / 0.16 * 0.5).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
      fx.draw(g);
      if (drag) {
        g.strokeStyle = 'rgba(243,236,224,0.5)'; g.lineWidth = 2; g.beginPath(); g.arc(drag.x0, drag.y0, 38, 0, 6.283); g.stroke();
        var dx = drag.x - drag.x0, dy = drag.y - drag.y0, m = Math.hypot(dx, dy) || 1, kk = Math.min(m, 38) / m;
        g.fillStyle = 'rgba(255,111,163,0.7)'; g.beginPath(); g.arc(drag.x0 + dx * kk, drag.y0 + dy * kk, 14, 0, 6.283); g.fill();
      }
      if (phase === 'intro') {
        var rn = SC_ROUNDS[Math.min(3, round)];
        g.fillStyle = 'rgba(13,11,12,0.55)'; g.fillRect(0, H * 0.36, W, H * 0.22);
        ptext(g, 'ROUND ' + (round + 1) + ': ' + rn[0].toUpperCase(), W / 2, H * 0.43, Math.min(34, W / 12), C.pink);
        ptext(g, rn[1], W / 2, H * 0.51, Math.min(18, W / 22), C.paper, C.ink, 'center', F_HAND);
      }
    }

    return {
      begin: function () { startRound(); },
      update: update, draw: draw,
      resize: function () { layout(); },
      destroy: function () { keys = {}; drag = null; }
    };
  }

  /* =====================================================================
     4. CROWD SURF
     ===================================================================== */
  function crowdsurf(ctx) {
    var cv = ctx.canvas(), g = cv.g, W = 0, H = 0, r = 18, halfW = 60, halfBase = 60, handsY = 0, bg = null;
    var fx = new Fx(), keys = {}, drag = null, imgs = {}, nex = 'happy';
    var cast = ctx.cast(ctx.stage, ['nana', 'hachi'], 'mg-corner'); cast.base(0, 'happy'); cast.base(1, 'happy');
    var CHEER = ['WOOOO NANA!', 'You are FLYING!', 'I am SO loud right now!', 'Higher! HIGHER!', 'Hands up! Hands up!'];
    function mood(i, ex, txt, ms) { cast.react(i, ex, txt, ms); if (i === 0) { nex = ex; ctx.later(function () { nex = 'happy'; }, ms || 2300); } }
    headImg(imgs, 'nana', 'happy'); headImg(imgs, 'nana', 'shock'); headImg(imgs, 'nana', 'angry'); headImg(imgs, 'nana', 'smirk'); headImg(imgs, 'hachi', 'happy');
    var hx = 0, hxT = 0, hvx = 0, dip = 0;
    var ball = { x: 0, y: 0, vx: 0, vy: 0, ang: 0, spin: 0, sq: 0, alive: false, inv: 0 };
    var things = [], warns = [];
    var lives = 3, score = 0, streak = 0, best = 0, bounces = 0, got = 0, timeLeft = 70, tt = 0, shake = 0, spawnT = 1.2, guardT = 9, respawnT = 0, ended = false, endT = 0, airBonus = false, hitCups = 0, escorted = 0;
    // Depth: a moving spotlight to steer into, fan requests to complete, and a BLAST ability to earn.
    var spotX = 0, spotW = 0, hype = 0, blastT = 0, encore = false, perfChain = 0, reqDone = 0, blastFill = -1, blastReady = false, nobuSaved = false;
    var REQS = shuffle([
      { k: 'rose', n: 2, s: 'Catch 2 roses' }, { k: 'perfect', n: 3, s: '3 clean centre catches in a row' }, { k: 'lights', n: 1, s: 'Big air: touch the stage lights' },
      { k: 'spot', n: 3, s: '3 bounces in the spotlight' }, { k: 'loot', n: 4, s: 'Grab 4 things from the crowd' }, { k: 'stay', n: 8, s: 'Stay up for 8 bounces' }
    ]), reqI = 0, cur = null, reqN = 0;
    var reqEl = el('div', 'mg-cs-req', ''), blastBtn = el('button', 'mg-cs-blast', '<i></i><b>BLAST</b>');
    blastBtn.type = 'button'; blastBtn.setAttribute('aria-label', 'Use BLAST');
    ctx.stage.appendChild(reqEl); ctx.stage.appendChild(blastBtn);
    function drawReq() { reqEl.innerHTML = cur ? '<small>Fan request</small>' + cur.s + (cur.n > 1 ? ' <b>' + reqN + '/' + cur.n + '</b>' : '') : ''; }
    function nextReq() { cur = REQS[reqI++ % REQS.length]; reqN = 0; drawReq(); }
    function progress(k, v) {
      if (!cur || ended || cur.k !== k) return;
      reqN = v === undefined ? reqN + 1 : v;
      if (reqN < cur.n) { drawReq(); return; }
      reqDone++; var pts = 200 + reqDone * 50; score += pts * mod(); addHype(0.34); sfx('cheer');
      fx.text(W / 2, H * 0.34, 'REQUEST COMPLETE +' + pts * mod(), C.gold, Math.min(28, W / 13), 1.5);
      cast.react(1, 'happy', pick(CHEER), 1700); nextReq();
    }
    function mod() { return (blastT > 0 ? 2 : 1) * (encore ? 2 : 1); }
    function addHype(v) { hype = Math.min(1, hype + v); }
    function fireBlast() {
      if (hype < 1 || blastT > 0 || !ball.alive || ended || !ctx.playing) return;
      hype = 0; blastT = 5; halfW = halfBase * 1.35; ball.inv = Math.max(ball.inv, 2.5); sfx('blast'); shake = 10;
      for (var i = things.length - 1; i >= 0; i--) if (things[i].type === 'cup' || things[i].type === 'guard') { fx.burst(things[i].x, things[i].y, 10, [C.pink, C.gold], { min: 60, max: 220, g: 300, shape: 'star' }); things.splice(i, 1); }
      warns.length = 0; fx.text(W / 2, H * 0.3, 'BLAST! THE ROOM IS YOURS', C.pink, Math.min(32, W / 12), 1.6); mood(0, 'smirk', 'Get out of my way.', 2200);
    }
    function endBlast() { blastT = 0; halfW = halfBase; }
    ctx.on(blastBtn, 'pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); fireBlast(); });
    var STREAK_CALL = { 3: 'WHEEE!', 5: 'x2 CROWD LOVES YOU', 10: 'x3 NANA IS A COMET', 15: 'x4 STAGE-DIVE LEGEND', 20: 'x5 GRAVITY FILED A COMPLAINT', 30: 'THE ROOF IS A SUGGESTION' };
    var CUP_SAY = ['BEER TO THE FACE', 'COLD ONE, NANA!', 'HAIR: DAMP', 'THAT WAS A GOOD JACKET', 'REFRESHING (NO)'];
    var DROP_SAY = ['DROPPED! The crowd gasps', 'FLOOR: 1, NANA: 0', 'Somebody had a phone out', 'THUD (artistic)'];

    function mult() { return Math.min(5, 1 + Math.floor(streak / 5)); }
    function layout() {
      W = cv.W; H = cv.H; r = clamp(W * 0.04, 14, 22); halfBase = clamp(W * 0.17, 66, 130); halfW = halfBase * (blastT > 0 ? 1.35 : 1); handsY = H - 58; spotW = clamp(W * 0.13, 46, 110);
      if (!hx) { hx = hxT = W / 2; }
      hxT = clamp(hxT, halfW, W - halfW); hx = clamp(hx, halfW, W - halfW);
      bg = document.createElement('canvas'); bg.width = W; bg.height = H; var b = bg.getContext('2d');
      var gr = b.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#120a14'); gr.addColorStop(0.6, '#2a0a18'); gr.addColorStop(1, '#4a0d1e');
      b.fillStyle = gr; b.fillRect(0, 0, W, H);
      b.drawImage(halftone(W, H, 'rgba(255,111,163,0.16)', 13, 3.6, function (x, y) { return clamp(y * 1.4 - 0.2, 0, 1) * (0.6 + 0.4 * Math.sin(x * 12)); }), 0, 0);
      b.font = Math.min(120, W * 0.3) + 'px ' + F_PUNK; b.textAlign = 'center'; b.fillStyle = 'rgba(243,236,224,0.06)'; b.fillText('BLAST', W / 2, H * 0.42);
      b.fillStyle = '#05030a'; b.fillRect(0, 0, W, Math.max(18, H * 0.05));
      for (var x = 14; x < W; x += 34) { b.fillStyle = ['#ff6fa3', '#d3122a', '#f4c430'][(x / 34 | 0) % 3]; b.beginPath(); b.arc(x, Math.max(18, H * 0.05) - 5, 4, 0, 6.283); b.fill(); }
    }
    layout();

    function spawnBall(first) {
      ball.x = W * 0.15; ball.y = H * 0.12; ball.vx = W * 0.14; ball.vy = -H * 0.12; ball.ang = 0; ball.spin = 4; ball.alive = true; ball.inv = first ? 0.6 : 1.4; ball.sq = 0;
      if (first) fx.text(W * 0.3, H * 0.2, 'STAGE DIVE!', C.pink, 34, 1.5);
    }
    function bump(msg, col) { fx.text(clamp(ball.x, 80, W - 80), clamp(ball.y - 34, 40, H - 120), msg, col || C.paper, 22); }

    function lose(why) {
      mood(0, 'shock', null, 1800); cast.react(1, 'shock', 'NANAAA! Catch her!', 1800);
      lives--; streak = 0; ball.alive = false; shake = 12; sfx('boo');
      fx.burst(ball.x, Math.min(ball.y, H - 40), 14, ['#e4d9c6', '#9a8a8a'], { min: 40, max: 200, g: 500 });
      fx.text(W / 2, H * 0.4, why, C.paper, Math.min(30, W / 12), 1.4);
      if (lives <= 0) { endGame(); } else respawnT = 1.0;
    }
    function endGame() { if (ended) return; ended = true; endT = 0; }
    function finishNow() {
      var stars = score >= 4500 ? 3 : score >= 2500 ? 2 : score >= 800 ? 1 : 0;
      ctx.finish({ title: 'Stage dive report', score: score, stars: stars, effects: { fame: stars },
        html: '<div class="mg-stats"><span>Bounces <b>' + bounces + '</b></span><span>Best streak <b>' + best + '</b></span><span>Loot <b>' + got + '</b></span></div>' });
    }

    function gravity() { return H * (1.25 + Math.min(0.55, streak * 0.018)); }

    function bounce(offset) {
      streak++; bounces++; best = Math.max(best, streak); airBonus = false;
      var G = gravity(), h = H * (0.46 + Math.min(0.26, streak * 0.015));
      var bigAir = Math.abs(offset) < 0.25 && perfChain % 3 === 2;
      if (bigAir) { h = handsY - H * 0.05; fx.text(W / 2, H * 0.5, 'BIG AIR!', C.pink, Math.min(30, W / 12), 0.9); }
      h = Math.min(h, handsY - 8);
      ball.vy = -Math.sqrt(2 * G * h); ball.y = handsY - r;
      // A centre catch sends her straight up; only the outer edges of the hands steer her.
      var edge = Math.abs(offset) < 0.22 ? 0 : (offset < 0 ? -1 : 1) * (Math.abs(offset) - 0.22) / 0.78;
      ball.vx = clamp(ball.vx * 0.25 + edge * W * 0.24 + hvx * 0.05, -W * 0.34, W * 0.34); ball.spin = ball.vx / 55;
      ball.sq = 0.55; dip = 1; shake = Math.min(7, 2 + streak * 0.2);
      var perfect = Math.abs(offset) < 0.25, inSpot = Math.abs(ball.x - spotX) < spotW, pts = (10 * mult() + (perfect ? 5 : 0)) * (inSpot ? 2 : 1) * mod(); score += pts;
      perfChain = perfect ? perfChain + 1 : 0; progress('perfect', perfChain); progress('stay', streak);
      if (perfect) addHype(0.06);
      if (inSpot) { addHype(0.1); progress('spot'); bump('SPOTLIGHT +' + pts, C.gold); }
      sfx(streak % 5 === 0 ? 'cheer' : perfect ? 'perfect' : 'good');
      fx.burst(ball.x, handsY, 8, ['#e4d9c6', '#ff6fa3', '#fff'], { arc: [-3, -0.14], min: 60, max: 220, g: 600, shape: streak > 6 ? 'star' : 'sq' });
      if (STREAK_CALL[streak]) { fx.text(W / 2, H * 0.3, STREAK_CALL[streak], streak >= 10 ? C.gold : C.pink, Math.min(34, W / 11), 1.4); sfx('cheer'); }
      else if (streak > 1 && streak % 7 === 0) bump('+' + pts, C.gold);
    }

    function hitRectCircle(cx, cy, hw, hh) {
      var nx = clamp(ball.x, cx - hw, cx + hw), ny = clamp(ball.y, cy - hh, cy + hh);
      return Math.hypot(ball.x - nx, ball.y - ny) < r * 0.8;
    }

    function spawnThing() {
      var s = Math.random() < 0.5 ? -1 : 1, cupP = Math.min(0.34, 0.17 + tt * 0.003), roll = Math.random(), t;
      if (roll < cupP) {
        t = { type: 'cup', x: s < 0 ? -20 : W + 20, y: H * rr(0.55, 0.75), vx: -s * rr(W * 0.18, W * 0.38), vy: -H * rr(0.55, 0.85), g: H * 0.95, rot: 0, vr: rr(-6, 6), sz: 13 };
      } else {
        var k = Math.random(), type = lives < 3 && Math.random() < 0.1 ? 'glass' : k < 0.5 ? 'setlist' : k < 0.8 ? 'pick' : 'rose';
        t = { type: type, x: s < 0 ? -20 : W + 20, y: rr(H * 0.16, H * 0.6), vx: -s * rr(W * 0.14, W * 0.3) * (1 + tt * 0.004), vy: rr(-H * 0.2, H * 0.04), g: H * 0.3, rot: 0, vr: rr(-3, 3), sz: 14 };
      }
      things.push(t);
    }
    function spawnGuard() {
      var s = Math.random() < 0.5 ? -1 : 1, y = rr(H * 0.3, H * 0.58);
      warns.push({ side: s, y: y, t: 1.3 }); sfx('boo');
    }

    ctx.on(window, 'keydown', function (e) {
      var k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') { keys.l = true; if (ctx.playing) e.preventDefault(); }
      else if (k === 'arrowright' || k === 'd') { keys.r = true; if (ctx.playing) e.preventDefault(); }
      else if (k === ' ') { fireBlast(); if (ctx.playing) e.preventDefault(); }
    });
    ctx.on(window, 'keyup', function (e) {
      var k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.l = false; else if (k === 'arrowright' || k === 'd') keys.r = false;
    });
    ctx.on(window, 'blur', function () { keys = {}; drag = null; });
    ctx.on(cv.c, 'pointerdown', function (e) {
      e.preventDefault(); var rc = cv.c.getBoundingClientRect();
      drag = { id: e.pointerId, x0: e.clientX - rc.left, hx0: hxT };
      try { cv.c.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
    });
    ctx.on(cv.c, 'pointermove', function (e) { if (drag && drag.id === e.pointerId) { var rc = cv.c.getBoundingClientRect(); hxT = clamp(drag.hx0 + (e.clientX - rc.left - drag.x0) * 0.85, halfW, W - halfW); } });
    function up(e) { if (drag && drag.id === e.pointerId) drag = null; }
    ctx.on(cv.c, 'pointerup', up); ctx.on(cv.c, 'pointercancel', up);

    function update(dt) {
      tt += dt; fx.step(dt); shake = Math.max(0, shake - dt * 24); dip = Math.max(0, dip - dt * 6); ball.sq *= Math.exp(-dt * 10);
      var i, t;
      // hands
      var dir = (keys.l ? -1 : 0) + (keys.r ? 1 : 0);
      if (dir) hxT += dir * W * 0.8 * dt;
      if (ctx.settings._auto && ball.alive) { hxT = ball.x; if (hype >= 1) fireBlast(); }
      hxT = clamp(hxT, halfW, W - halfW);
      var old = hx; hx += (hxT - hx) * Math.min(1, dt * 11); hvx = (hx - old) / Math.max(dt, 0.001);
      if (!ended) timeLeft -= dt;
      if (timeLeft <= 15 && !encore && !ended) { encore = true; fx.text(W / 2, H * 0.36, 'ENCORE! DOUBLE POINTS', C.gold, Math.min(32, W / 12), 1.7); sfx('cheer'); }
      if (timeLeft <= 0 && !ended) { fx.text(W / 2, H * 0.4, 'ENCORE OVER!', C.gold, 34, 1.5); endGame(); }
      spotX = W * (0.5 + 0.34 * Math.sin(tt * 0.62));
      var pct = Math.round(hype * 100), ready = hype >= 1 && blastT <= 0;
      if (pct !== blastFill) { blastFill = pct; blastBtn.firstChild.style.height = pct + '%'; }
      if (ready !== blastReady) { blastReady = ready; blastBtn.className = 'mg-cs-blast' + (ready ? ' ready' : ''); }
      if (blastT > 0) { blastT -= dt; if (blastT <= 0) endBlast(); dt *= 0.62; }
      if (ended) { endT += dt; if (endT > 1.3 && endT < 50) { endT = 99; finishNow(); } }

      // ball
      if (ball.alive) {
        var G = gravity();
        ball.inv = Math.max(0, ball.inv - dt);
        ball.vy += G * dt; ball.x += ball.vx * dt; var py = ball.y; ball.y += ball.vy * dt; ball.ang += ball.spin * dt;
        if (ball.x < r) { ball.x = r; ball.vx = Math.abs(ball.vx); } else if (ball.x > W - r) { ball.x = W - r; ball.vx = -Math.abs(ball.vx); }
        if (ball.y < r) { ball.y = r; ball.vy = Math.abs(ball.vy) * 0.4; }
        if (!airBonus && ball.y - r < H * 0.07 && streak > 0) { airBonus = true; var ab = 20 * mult() * mod(); score += ab; bump('TOUCHED THE LIGHTS +' + ab, C.gold); sfx('chime'); progress('lights'); }
        if (ball.vy > 0 && ball.y + r >= handsY && py + r <= handsY + Math.max(8, ball.vy * dt) && Math.abs(ball.x - hx) <= halfW + r * 0.5) {
          bounce(clamp((ball.x - hx) / halfW, -1, 1));
        }
        if (ball.y > H + r) {
          if (!nobuSaved && lives === 1) { // once a gig, Nobu simply refuses to let her hit the floor
            nobuSaved = true; ball.y = handsY - r; ball.x = clamp(ball.x, r, W - r); ball.vy = -Math.sqrt(2 * G * H * 0.42); ball.vx *= 0.3; ball.inv = 1.4; streak = 0; shake = 8; sfx('cheer');
            fx.text(W / 2, H * 0.38, 'NOBU DIVED IN!', C.gold, Math.min(32, W / 12), 1.5); cast.react(1, 'shock', 'Nobu just jumped off the STAGE for her!', 2000);
          } else lose(pick(DROP_SAY));
        }
        if (Math.random() < dt * 40) fx.burst(ball.x, ball.y, 1, [C.pink], { min: 4, max: 20, g: 0, life: 0.5, shape: 'circ', size: 0.8 });
      } else if (!ended) {
        respawnT -= dt; if (respawnT <= 0) spawnBall(false);
      }

      // things
      if (!ended && ctx.playing) {
        spawnT -= dt; if (spawnT <= 0) { spawnT = Math.max(0.5, 1.5 - tt * 0.012) * rr(0.7, 1.2); spawnThing(); }
        guardT -= dt; if (guardT <= 0) { guardT = Math.max(5.5, 11 - tt * 0.07); spawnGuard(); }
      }
      for (i = warns.length - 1; i >= 0; i--) {
        var w = warns[i]; w.t -= dt;
        if (w.t <= 0) { things.push({ type: 'guard', x: w.side < 0 ? -34 : W + 34, y: w.y, vx: -w.side * W * 0.2 * (1 + tt * 0.003), vy: 0, g: 0, rot: 0, vr: 0, sz: 30 }); warns.splice(i, 1); }
      }
      for (i = things.length - 1; i >= 0; i--) {
        t = things[i]; t.vy += t.g * dt; t.x += t.vx * dt; t.y += t.vy * dt; t.rot += t.vr * dt;
        if (t.x < -80 || t.x > W + 80 || t.y > H + 60) { things.splice(i, 1); continue; }
        if (!ball.alive || ended) continue;
        if (blastT > 0 && t.type !== 'cup' && t.type !== 'guard') { var pull = Math.min(1, dt * 2.4); t.x += (ball.x - t.x) * pull; t.y += (ball.y - t.y) * pull; }
        if (t.type === 'guard') {
          if (ball.inv <= 0 && hitRectCircle(t.x, t.y, 30, 40)) { things.splice(i, 1); escorted++; lose('ESCORTED OUT BY SECURITY'); }
          continue;
        }
        if (Math.hypot(ball.x - t.x, ball.y - t.y) < r + t.sz) {
          if (t.type === 'cup') {
            if (ball.inv > 0) continue;
            mood(0, 'angry', 'Who threw that?!', 1700); things.splice(i, 1); hitCups++; streak = 0; score = Math.max(0, score - 30); ball.vy = Math.max(ball.vy, 0) + H * 0.2; ball.vx += (ball.x < t.x ? -1 : 1) * W * 0.1; perfChain = 0; shake = 9; sfx('thud');
            fx.burst(t.x, t.y, 16, ['#f4c430', '#fff3b0', '#fff'], { min: 60, max: 260, g: 700, shape: 'circ' }); bump(pick(CUP_SAY), '#ffe27a');
          } else {
            things.splice(i, 1); got++; progress('loot');
            if (t.type === 'glass') { lives = Math.min(3, lives + 1); sfx('win'); bump('STRAWBERRY GLASS! +1 HEART', C.pink); cast.react(1, 'happy', 'I saved your glass!', 1700); continue; }
            if (t.type === 'rose') progress('rose');
            addHype(t.type === 'rose' ? 0.16 : 0.08);
            var base = t.type === 'rose' ? 100 : t.type === 'setlist' ? 50 : 25, pts = base * mult() * mod(); score += pts; sfx(t.type === 'rose' ? 'perfect' : 'chime');
            fx.burst(t.x, t.y, 12, t.type === 'rose' ? [C.red, C.pink] : [C.gold, '#fff', C.pink], { shape: t.type === 'rose' ? 'heart' : 'star', min: 60, max: 220, g: 300 });
            bump((t.type === 'rose' ? 'ROSE! +' : t.type === 'setlist' ? 'SETLIST! +' : 'PICK! +') + pts, t.type === 'rose' ? C.pink : C.gold);
          }
        }
      }
      ctx.setScore('SCORE <b>' + score + '</b> &middot; x' + mult() + ' &middot; ' + new Array(Math.max(0, lives) + 1).join('&hearts;') + ' &middot; ' + Math.max(0, Math.ceil(timeLeft)) + 's');
    }

    function drawThing(t) {
      g.save(); g.translate(t.x, t.y); g.rotate(t.rot); g.strokeStyle = C.ink; g.lineWidth = 2; g.lineJoin = 'round';
      if (t.type === 'setlist') {
        g.fillStyle = C.paper; g.fillRect(-10, -13, 20, 26); g.strokeRect(-10, -13, 20, 26);
        g.fillStyle = C.red; g.fillRect(-10, -13, 20, 5); g.fillStyle = C.ink; for (var l = 0; l < 4; l++) g.fillRect(-6, -4 + l * 5, 12 - (l % 2) * 4, 1.6);
      } else if (t.type === 'pick') {
        g.fillStyle = C.pink; g.beginPath(); g.moveTo(0, 12); g.bezierCurveTo(-16, -2, -12, -13, 0, -12); g.bezierCurveTo(12, -13, 16, -2, 0, 12); g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(-4, -8, 3, 5);
      } else if (t.type === 'rose') {
        g.strokeStyle = '#2e8b3d'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 15); g.stroke();
        g.strokeStyle = C.ink; g.lineWidth = 2; g.fillStyle = C.red; g.beginPath(); g.arc(0, -3, 9, 0, 6.283); g.fill(); g.stroke();
        g.strokeStyle = '#7a0a18'; g.beginPath(); g.arc(0, -3, 5, 0.3, 4.5); g.stroke();
      } else if (t.type === 'glass') {
        g.fillStyle = '#fff4f7'; g.beginPath(); g.moveTo(-9, -13); g.lineTo(9, -13); g.lineTo(7, 13); g.lineTo(-7, 13); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = C.straw; [[-4, -6], [4, -3], [-2, 3], [4, 7]].forEach(function (d) { g.beginPath(); g.arc(d[0], d[1], 2.6, 0, 6.283); g.fill(); });
      } else if (t.type === 'cup') {
        g.fillStyle = '#f4c430'; g.beginPath(); g.moveTo(-9, -11); g.lineTo(9, -11); g.lineTo(6, 11); g.lineTo(-6, 11); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(-4, -12, 4.5, 0, 6.283); g.arc(3, -13, 5, 0, 6.283); g.fill();
      } else if (t.type === 'guard') {
        g.fillStyle = '#17141a'; g.fillRect(-32, -10, 64, 11); g.strokeRect(-32, -10, 64, 11);
        g.fillStyle = '#17141a'; rrect(g, -17, -22, 34, 56, 6); g.fill(); g.stroke();
        g.fillStyle = '#f0c8a8'; g.beginPath(); g.arc(0, -32, 11, 0, 6.283); g.fill(); g.stroke();
        g.fillStyle = C.ink; g.fillRect(-11, -35, 22, 6); g.fillRect(-12, -43, 24, 7);
        g.fillStyle = '#f3ece0'; g.fillRect(-9, -20, 18, 3);
        g.fillStyle = C.red; g.fillRect(-4, -18, 8, 20);
        g.fillStyle = '#17141a'; g.fillRect(-14, 28, 10, 18); g.fillRect(4, 28, 10, 18);
      }
      g.restore();
    }

    function drawNana() {
      if (!ball.alive) return;
      g.save(); g.translate(ball.x, ball.y); g.rotate(ball.ang); g.scale(1 + ball.sq * 0.25, 1 - ball.sq * 0.25);
      if (ball.inv > 0 && !ctx.reduce) g.globalAlpha = 0.75;
      var s = r / 18;
      g.scale(s, s); g.strokeStyle = C.ink; g.lineWidth = 2.2; g.lineJoin = 'round';
      g.fillStyle = '#17141a'; g.fillRect(-9, 8, 7, 14); g.fillRect(2, 8, 7, 14);
      g.fillStyle = C.red; g.fillRect(-9, 8, 7, 4); g.fillRect(2, 8, 7, 4);
      g.fillStyle = '#17141a'; rrect(g, -11, -6, 22, 18, 5); g.fill(); g.stroke();
      g.fillStyle = C.red; g.fillRect(-2, -6, 4, 18);
      // mic arm
      g.strokeStyle = '#17141a'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(9, -3); g.lineTo(18, -14); g.stroke();
      g.strokeStyle = C.ink; g.lineWidth = 1.6; g.fillStyle = '#f0c8a8'; g.beginPath(); g.arc(18.5, -15, 3.2, 0, 6.283); g.fill(); g.stroke();
      g.fillStyle = '#8c8794'; g.beginPath(); g.moveTo(17, -17); g.lineTo(23, -29); g.lineTo(26, -27); g.lineTo(20, -15); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#d9d4de'; g.beginPath(); g.arc(25, -31, 4.6, 0, 6.283); g.fill(); g.stroke();
      var hi = headImg(imgs, 'nana', nex);
      if (hi) { g.drawImage(hi, 0, 0, 380, 330, -26, -48, 52, 45); }
      else {
        g.lineWidth = 2.2; g.fillStyle = '#f0c8a8'; g.beginPath(); g.arc(0, -13, 10, 0, 6.283); g.fill(); g.stroke();
        g.fillStyle = C.ink; g.beginPath(); g.arc(0, -15, 11, Math.PI * 1.02, Math.PI * 1.98); g.lineTo(9, -13); g.lineTo(0, -17); g.lineTo(-9, -13); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(-12, -16); g.lineTo(-20, -8); g.lineTo(-9, -10); g.closePath(); g.fill(); g.beginPath(); g.moveTo(12, -16); g.lineTo(20, -8); g.lineTo(9, -10); g.closePath(); g.fill();
        g.fillRect(-5, -13, 2.2, 3); g.fillRect(3, -13, 2.2, 3);
      }
      g.restore();
    }

    function draw() {
      if (!W) return;
      g.save();
      g.drawImage(bg, 0, 0);
      var sway = ctx.reduce ? 0 : Math.sin(tt * 0.8) * 0.06, bc = ['rgba(255,111,163,0.1)', 'rgba(211,18,42,0.12)', 'rgba(255,255,255,0.07)'], i;
      for (i = 0; i < 3; i++) {
        var bx = W * (0.2 + i * 0.3), a = sway * (i % 2 ? -1 : 1);
        g.fillStyle = bc[i]; g.beginPath(); g.moveTo(bx, 8); g.lineTo(bx - W * 0.16 + a * H, H * 0.85); g.lineTo(bx + W * 0.16 + a * H, H * 0.85); g.closePath(); g.fill();
      }
      var sx = shake > 0 && !ctx.reduce ? rr(-shake, shake) * 0.5 : 0, sy = shake > 0 && !ctx.reduce ? rr(-shake, shake) * 0.5 : 0;
      g.translate(sx, sy);
      // crowd
      for (var row = 0; row < 2; row++) {
        for (var x = row * 14 - 10; x < W + 20; x += 30) {
          var yy = H - 18 + row * 16 - Math.sin(tt * 3 + x * 0.3 + row) * 3;
          g.fillStyle = row ? '#0a070c' : '#150e16'; g.beginPath(); g.arc(x, yy, 15, 0, 6.283); g.fill();
          if ((x * 7 | 0) % 3 === 0 && row === 0) { g.fillRect(x - 2, yy - 40 - Math.sin(tt * 2 + x) * 6, 4, 30); }
        }
      }
      var hh = headImg(imgs, 'hachi', 'happy'), hbx = W * 0.13, hby = H - 34 - Math.abs(Math.sin(tt * 4)) * 8;
      if (hh) {
        g.save(); g.translate(hbx, hby); g.rotate(Math.sin(tt * 4) * 0.08);
        g.fillStyle = C.pink; g.strokeStyle = C.ink; g.lineWidth = 2; g.fillRect(14, -52, 34, 20); g.strokeRect(14, -52, 34, 20); g.fillStyle = C.ink; g.font = '11px ' + F_PUNK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NANA!', 31, -42);
        g.drawImage(hh, 0, 0, 380, 330, -22, -38, 44, 38); g.restore();
      }
      // the spotlight she should land in
      var lit = ball.alive && Math.abs(ball.x - spotX) < spotW;
      g.fillStyle = lit ? 'rgba(255,240,170,0.26)' : 'rgba(255,240,170,0.14)';
      g.beginPath(); g.moveTo(spotX - 10, 8); g.lineTo(spotX + 10, 8); g.lineTo(spotX + spotW, handsY + 6); g.lineTo(spotX - spotW, handsY + 6); g.closePath(); g.fill();
      g.fillStyle = lit ? 'rgba(244,196,48,0.6)' : 'rgba(244,196,48,0.34)'; g.beginPath(); g.ellipse(spotX, handsY + 6, spotW, 11, 0, 0, 6.283); g.fill();
      if (blastT > 0) { g.fillStyle = 'rgba(255,111,163,0.12)'; g.fillRect(-20, -20, W + 40, H + 40); }
      // pad glow + hands
      var gl = g.createRadialGradient(hx, handsY + 20, 5, hx, handsY + 20, halfW * 1.4); gl.addColorStop(0, 'rgba(255,111,163,0.4)'); gl.addColorStop(1, 'rgba(255,111,163,0)');
      g.fillStyle = gl; g.fillRect(hx - halfW * 1.5, handsY - 40, halfW * 3, 120);
      var nh = halfW > 90 ? 11 : 9, step = (halfW * 2) / nh, skin = ['#f0c8a8', '#d9a47c', '#b57a52', '#f6d7bd'];
      for (i = 0; i < nh; i++) {
        var hxx = hx - halfW + (i + 0.5) * step, wave = Math.sin(tt * 4 + i * 1.3) * 2 + dip * 9;
        g.fillStyle = ['#1d191b', '#7d1f2c', '#2b3a7a'][i % 3]; g.fillRect(hxx - 6, handsY + 14 + wave, 12, 60);
        g.fillStyle = skin[i % 4]; g.strokeStyle = C.ink; g.lineWidth = 2; rrect(g, hxx - 7, handsY + wave - 2, 14, 18, 5); g.fill(); g.stroke();
        for (var f = 0; f < 4; f++) { rrect(g, hxx - 7 + f * 3.6, handsY + wave - 10 - (f === 1 || f === 2 ? 3 : 0), 3.4, 11, 1.5); g.fill(); g.stroke(); }
      }
      // warnings
      for (i = 0; i < warns.length; i++) {
        var wn = warns[i], wx = wn.side < 0 ? 26 : W - 26, ps = 1 + Math.sin(tt * 6) * 0.08;
        g.save(); g.translate(wx, wn.y); g.scale(ps, ps); g.fillStyle = C.red; g.strokeStyle = C.ink; g.lineWidth = 3;
        g.beginPath(); g.moveTo(0, -20); g.lineTo(20, 15); g.lineTo(-20, 15); g.closePath(); g.fill(); g.stroke(); g.restore();
        ptext(g, '!', wx, wn.y + 3, 22, C.paper);
        ptext(g, 'SECURITY', clamp(wx, 50, W - 50), wn.y + 32, 14, C.paper);
      }
      for (i = 0; i < things.length; i++) drawThing(things[i]);
      drawNana();
      fx.draw(g);
      g.restore();
    }

    return {
      begin: function () { spawnBall(true); nextReq(); },
      update: update, draw: draw,
      resize: function () { layout(); },
      destroy: function () { keys = {}; drag = null; for (var k in imgs) imgs[k].img.onload = null; }
    };
  }

  /* =====================================================================
     5. THE PADLOCK
     ===================================================================== */
  function padlock(ctx) {
    var LANE = ['#d3122a', '#ff6fa3', '#f4c430', '#5ec8e5'], SYM = ['&#9679;', '&#9829;', '&#9733;', '&#9670;'], KEYL = ['D', 'F', 'J', 'K'];
    var TOTAL = 8, MAP = { d: 0, f: 1, j: 2, k: 3, arrowleft: 0, arrowdown: 1, arrowup: 2, arrowright: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
    var pins = '', i;
    for (i = 0; i < TOTAL; i++) {
      var px = 44 + i * 17.5;
      pins += '<g class="mg-pl-pin" data-i="' + i + '"><rect x="' + px + '" y="128" width="12" height="62" rx="4" fill="#0d0b0c"/><rect class="mg-pl-bar" x="' + (px + 1.5) + '" y="168" width="9" height="20" rx="3" fill="' + LANE[i % 4] + '"/></g>';
    }
    var pads = '';
    for (i = 0; i < 4; i++) pads += '<button type="button" class="mg-pl-pad" tabindex="-1" data-l="' + i + '" style="--c:' + LANE[i] + '"><span class="mg-pl-sym">' + SYM[i] + '</span><small>' + KEYL[i] + '</small></button>';
    var root = el('div', 'mg-pl',
      '<div class="mg-pl-status">&nbsp;</div>' +
      '<div class="mg-pl-lockwrap"><div class="mg-pl-side l"></div><div class="mg-pl-glow"></div>' +
      '<svg class="mg-pl-lock" viewBox="0 0 220 250" aria-hidden="true">' +
      '<g class="mg-pl-shackle"><path d="M62 118 V80 a48 48 0 0 1 96 0 V118" fill="none" stroke="#0d0b0c" stroke-width="22" stroke-linecap="round"/>' +
      '<path d="M62 118 V80 a48 48 0 0 1 96 0 V118" fill="none" stroke="#bdb6c4" stroke-width="14" stroke-linecap="round"/><path d="M69 112 V80 a41 41 0 0 1 24 -37" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/></g>' +
      '<rect x="26" y="110" width="168" height="124" rx="18" fill="#2b2433" stroke="#0d0b0c" stroke-width="5"/>' +
      '<rect x="34" y="116" width="152" height="10" rx="5" fill="#fff" fill-opacity=".08"/>' +
      pins +
      '<circle cx="110" cy="213" r="8" fill="#0d0b0c"/><path d="M106 213 h8 l3 14 h-14z" fill="#0d0b0c"/>' +
      '</svg><div class="mg-pl-side r"></div></div>' +
      '<div class="mg-pl-tools"><div class="mg-pl-slips"></div><button type="button" class="mg-pl-hum" tabindex="-1"></button></div>' +
      '<div class="mg-pl-pads">' + pads + '</div>' +
      '<div class="mg-pl-hint">D F J K &middot; arrow keys &middot; or tap</div>');
    ctx.stage.appendChild(root);
    var statusEl = root.querySelector('.mg-pl-status'), slipsEl = root.querySelector('.mg-pl-slips'), humB = root.querySelector('.mg-pl-hum');
    var padEls = root.querySelectorAll('.mg-pl-pad'), pinEls = root.querySelectorAll('.mg-pl-pin'), lockEl = root.querySelector('.mg-pl-lock');

    var castL = ctx.cast(root.querySelector('.mg-pl-side.l'), ['ren'], 'mg-cast-side'), castR = ctx.cast(root.querySelector('.mg-pl-side.r'), ['nana'], 'mg-cast-side');
    castL.base(0, 'neutral'); castR.base(0, 'neutral');
    var REN_OK = ['Yes. That one.', 'Steady.', 'You have the hands for it.'], NANA_OK = ['Oh, nice.', 'Do not blink.', 'Keep going, keep going.'];
    var seq = [], pos = 0, state = 'idle', cleared = 0, mistakes = 0, lightT = [0, 0, 0, 0], opened = false;
    // Later tumblers change the rules: backwards, and a ghost note you must remember from the round before. Hums replay the pattern.
    var MODE = ['', '', '', 'rev', '', 'ghost', 'rev', 'ghost'], MAXSLIP = 3, hums = 2, mode = '', ghostAt = -1, modeClears = 0, showGhost = false;

    function setStatus(s) { statusEl.innerHTML = s; }
    function slips() {
      var h = 'SLIPS'; for (var k = 0; k < MAXSLIP; k++) h += ' <span class="' + (mistakes > k ? 'x' : '') + '">&#9679;</span>';
      slipsEl.innerHTML = h; humB.textContent = 'HUM IT AGAIN x' + hums; humB.disabled = hums <= 0 || state !== 'input';
      ctx.setScore('TUMBLER <b>' + Math.min(TOTAL, cleared + 1) + '/' + TOTAL + '</b> &middot; SLIPS <b>' + mistakes + '/' + MAXSLIP + '</b>');
    }
    function note() {
      var l, n = 0;
      do { l = Math.floor(Math.random() * 4); n++; } while (n < 8 && seq.length >= 2 && seq[seq.length - 1] === l && seq[seq.length - 2] === l);
      seq.push(l);
    }
    function light(l, ms) {
      padEls[l].classList.add('lit'); clearTimeout(lightT[l]);
      lightT[l] = ctx.later(function () { padEls[l].classList.remove('lit'); }, ms);
    }
    function step() { return Math.max(440, 660 - cleared * 28); }

    function playback() {
      state = 'show'; mode = MODE[cleared] || ''; slips();
      ghostAt = mode === 'ghost' && !showGhost && seq.length > 1 ? Math.floor(Math.random() * (seq.length - 1)) : -1;
      setStatus(mode === 'rev' ? 'Listen&hellip; then play it <b>backwards</b>.' : ghostAt >= 0 ? 'Listen&hellip; one note is <b>silent</b>. You know it.' : 'Listen&hellip;');
      var st = step(), idx = 0; showGhost = false;
      (function next() {
        if (idx >= seq.length) { ctx.later(function () { state = 'input'; pos = 0; slips(); setStatus((mode === 'rev' ? 'Backwards now' : 'Your turn') + ' &middot; ' + seq.length + ' tumblers'); }, st * 0.5); return; }
        var l = seq[idx];
        if (idx !== ghostAt) { light(l, st * 0.68); tone(l, st * 0.0009); }
        idx++; ctx.later(next, st);
      })();
    }

    function press(l) {
      if (state !== 'input') return;
      light(l, 170); tone(l, 0.28);
      if (l === (mode === 'rev' ? seq[seq.length - 1 - pos] : seq[pos])) {
        pos++;
        if (pos >= seq.length) cleared_();
      } else mistake();
    }

    function cleared_() {
      state = 'busy'; cleared++; if (mode) modeClears++; slips();
      if (pinEls[cleared - 1]) pinEls[cleared - 1].classList.add('on');
      castL.react(0, 'smirk', Math.random() < 0.5 ? pick(REN_OK) : null, 1700); castR.react(0, 'smirk', Math.random() < 0.5 ? pick(NANA_OK) : null, 1700);
      sfx('perfect'); setStatus('Click. Tumbler ' + cleared + ' of ' + TOTAL + ' set.');
      if (cleared >= TOTAL) { ctx.later(unlockSeq, 700); return; }
      note(); ctx.later(playback, 1200);
    }

    function mistake() {
      mistakes++; state = 'busy'; sfx('miss'); slips(); castL.react(0, 'sad', 'Careful.', 1800); castR.react(0, 'shock', null, 1800);
      lockEl.classList.remove('mg-rattle'); void lockEl.getBoundingClientRect(); lockEl.classList.add('mg-rattle');
      if (mistakes >= MAXSLIP) {
        state = 'end'; setStatus('The lock stays shut.'); castL.base(0, 'sad'); castR.base(0, 'sad'); castL.say(0, 'Next time.', 2500);
        ctx.later(function () { sfx('lose'); }, 300);
        ctx.later(finishNow, 2000);
      } else {
        setStatus('Wrong tumbler. Listen again.'); showGhost = true; ctx.later(playback, 1300);
      }
    }

    function unlockSeq() {
      state = 'end'; opened = true; setStatus('&nbsp;');
      for (var k = 0; k < 4; k++) (function (kk) { ctx.later(function () { light(kk, 300); tone(kk, 0.4); }, 220 * kk); })(k);
      ctx.later(function () {
        for (var q = 0; q < 4; q++) { tone(q, 1.2); padEls[q].classList.add('lit'); }
        root.classList.add('mg-open'); sfx('win'); setStatus('Click.'); castL.base(0, 'happy'); castR.base(0, 'happy');
      }, 1100);
      ctx.later(function () { sfx('chime'); setStatus('Some things you keep. This one finally lets go.'); castL.say(0, '...Thank you.', 3000); }, 2900);
      ctx.later(function () { for (var q = 0; q < 4; q++) padEls[q].classList.remove('lit'); }, 3600);
      ctx.later(finishNow, 6200);
    }

    function hum() {
      if (state !== 'input' || hums <= 0) return;
      hums--; showGhost = true; sfx('select'); castR.react(0, 'neutral', 'Fine. Once more. Pay attention.', 1700); playback();
    }
    ctx.on(humB, 'pointerdown', function (e) { e.preventDefault(); hum(); });

    function finishNow() {
      var stars = opened ? (mistakes <= 1 ? 3 : 2) : cleared >= 6 ? 2 : cleared >= 3 ? 1 : 0;
      var score = cleared * 125 + modeClears * 60 + hums * 40 + (opened && mistakes === 0 ? 150 : 0);
      var lines = [
        ['The lock stays shut. It has had practice. It is patient.', 'Silence from the tumblers. The padlock is not angry, just disappointed in a very gentle way.'],
        ['A few tumblers give way. The rest keep their secrets, and their grudges.', 'Some pins fall. The lock hums something low and rude.'],
        ['So close that the padlock exhales. It wanted you to get there.', 'Nearly. The last tumblers were holding their breath too.'],
        ['It opens. Nobody says anything, which is exactly the point.', 'Click. And somewhere a small silver weight leaves your chest.']
      ];
      ctx.finish({ title: opened ? 'Unlocked' : 'Still locked', score: score, stars: stars, effects: { bond: stars }, line: pick(lines[opened ? 3 : stars]),
        html: '<div class="mg-stats"><span>Tumblers <b>' + cleared + '/' + TOTAL + '</b></span><span>Slips <b>' + mistakes + '/' + MAXSLIP + '</b></span><span>Hums left <b>' + hums + '</b></span></div>' });
    }

    for (i = 0; i < padEls.length; i++) (function (pe) {
      ctx.on(pe, 'pointerdown', function (e) { e.preventDefault(); press(+pe.getAttribute('data-l')); });
    })(padEls[i]);
    ctx.on(window, 'keydown', function (e) {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key.toLowerCase();
      if (MAP[k] !== undefined) { if (ctx.playing) e.preventDefault(); press(MAP[k]); }
      else if (k === ' ' || k === 'h') { if (ctx.playing) e.preventDefault(); hum(); }
    });

    slips();
    return {
      begin: function () { seq = []; note(); note(); note(); setStatus('&nbsp;'); castR.say(0, 'Listen first. Then play.', 2200); playback(); },
      destroy: function () { /* every timer is owned by ctx.later and cleared by the shell */ }
    };
  }


  /* =====================================================================
     6. KEEP YOUR EYES ON THE CUP
     ===================================================================== */
  var GLASS_SVG = '<svg viewBox="0 0 40 56" aria-hidden="true"><path d="M4 4 H36 L31 52 H9Z" fill="#ffe3ee" stroke="#0d0b0c" stroke-width="3" stroke-linejoin="round"/>' +
    '<g fill="#e8294f"><circle cx="14" cy="18" r="3"/><circle cx="26" cy="22" r="3"/><circle cx="18" cy="32" r="3"/><circle cx="27" cy="40" r="3"/><circle cx="13" cy="44" r="3"/></g><path d="M9 8 H31" stroke="#fff" stroke-width="3"/></svg>';
  var DEMON_TAUNT = ['Keep up, little mortal!', 'Is that sweat? Adorable.', 'Left? Right? Who can say! Me. I can say.', 'I do this at parties. There are no parties.', 'Faster? Oh, you asked for it.', 'My hands are very fast. It is my one talent.'];
  var DEMON_FAKE = ['Look over here! Or do not! I am flexible.', 'That hat? No. Maybe. Yes. No.', 'A tiny twitch. Pure theatre.'];
  var DEMON_WIN = ['Lucky. Do not tell anyone.', 'Hmph. The glass was feeling generous.', 'I let you have that. Obviously.'];
  var DEMON_LOSE = ['Delicious. Your disappointment, I mean.', 'Wrong! Gloriously, tragically wrong!', 'The glass sends its regards. From over there.'];
  var HACHI_PANIC = ['Is it that one? It is that one!', 'Do not blink. Nobody blink!', 'My eyes are doing a spin cycle.', 'It went under the... the... hat!', 'I trusted the middle one. I always trust the middle one.'];

  function cups(ctx) {
    var root = el('div', 'mg-cups', '<div class="mg-strip"></div><div class="mg-cups-field"></div><div class="mg-cups-offer" hidden></div><div class="mg-cups-msg">&nbsp;</div>');
    ctx.stage.appendChild(root);
    var field = root.children[1], offerEl = root.children[2], msg = root.children[3];
    var cast = ctx.cast(root.children[0], ['hachi', 'demon'], 'mg-cast-strip'); cast.base(0, 'happy'); cast.base(1, 'smirk');
    // Depth: every win goes into a pot you either bank or let ride, and late rounds hide two glasses.
    var lives = 3, round = 0, cleared = 0, banked = 0, pot = 0, ride = false, streak = 0, phase = 'idle', hats = [], glasses = [], found = 0, ROUNDS = 7, rides = 0;

    function pos(slot, n) { return ((slot + 0.5) / n * 100) + '%'; }
    function hud() { ctx.setScore('ROUND <b>' + Math.min(ROUNDS, cleared + 1) + '/' + ROUNDS + '</b> &middot; ' + new Array(lives + 1).join('&hearts;') + ' &middot; BANK <b>' + banked + '</b> &middot; POT <b>' + pot + '</b>'); }
    function say(t) { msg.textContent = t; }

    function startRound() {
      var n = round < 3 ? 3 : round < 5 ? 4 : 5, two = round >= 4 && round % 2 === 0; field.innerHTML = ''; hats = []; found = 0;
      field.style.setProperty('--n', n);
      for (var i = 0; i < n; i++) {
        var b = el('button', 'mg-hat', '<span class="mg-glass">' + GLASS_SVG + '</span><span class="mg-hat-top"><i class="brim"></i><i class="crown"></i><i class="band"></i></span>');
        b.type = 'button'; b.tabIndex = -1; b.setAttribute('aria-label', 'Hat ' + (i + 1)); b.style.left = pos(i, n);
        field.appendChild(b); hats.push({ el: b, slot: i, ok: false });
      }
      glasses = shuffle(hats).slice(0, two ? 2 : 1); glasses.forEach(function (h) { h.ok = true; h.el.classList.add('has'); });
      phase = 'show'; hud(); say(two ? 'TWO glasses this time. Watch both.' : ride ? 'Riding the pot. Watch the glass...' : 'Watch the strawberry glass...');
      cast.react(0, 'happy', two ? 'He has a SECOND one? Where is he GETTING these?' : pick(['Ooh, it is so pretty!', 'I see it! I SEE IT!']), 1800); cast.react(1, 'smirk', null, 2000);
      ctx.later(function () { glasses.forEach(function (h) { h.el.classList.add('up'); }); sfx('chime'); }, 450);
      ctx.later(function () { glasses.forEach(function (h) { h.el.classList.remove('up'); }); }, two ? 2300 : 1900);
      ctx.later(function () { phase = 'shuffle'; say('Shuffling...'); cast.set(0, 'shock'); doSwap(0, Math.min(10, 3 + Math.round(round * 1.2)), n); }, two ? 2800 : 2400);
    }

    function doSwap(k, total, n) {
      if (phase !== 'shuffle') return;
      if (k >= total) { phase = 'pick'; say(glasses.length > 1 ? 'Find BOTH glasses. Tap two hats.' : 'Which hat? Tap it!'); cast.react(0, 'shock', 'Which one?! WHICH ONE?!', 2200); sfx('click'); return; }
      var tms = Math.max(340, 560 - round * 34);
      field.style.setProperty('--t', tms + 'ms');
      var ai = Math.floor(Math.random() * n), bi; do { bi = Math.floor(Math.random() * n); } while (bi === ai);
      var a = hats[ai], b = hats[bi], tmp = a.slot; a.slot = b.slot; b.slot = tmp;
      a.el.style.left = pos(a.slot, n); b.el.style.left = pos(b.slot, n);
      a.el.classList.add('hi'); b.el.classList.add('lo'); sfx('click');
      ctx.later(function () { a.el.classList.remove('hi'); b.el.classList.remove('lo'); }, tms);
      var extra = 0;
      if (round >= 3 && k === 2 + (round % 3)) {
        var fake = hats.filter(function (h) { return !h.ok; })[0];
        ctx.later(function () { if (phase === 'shuffle') { fake.el.classList.add('fake'); cast.react(1, 'smirk', pick(DEMON_FAKE), 1900); ctx.later(function () { fake.el.classList.remove('fake'); }, 420); } }, tms);
        extra = 460;
      } else if (k % 3 === 1) { cast.react(1, 'smirk', pick(DEMON_TAUNT), 1700); cast.react(0, 'shock', Math.random() < 0.5 ? pick(HACHI_PANIC) : null, 1700); }
      ctx.later(function () { doSwap(k + 1, total, n); }, tms + 110 + extra);
    }

    function finishRound() {
      hud();
      if (lives <= 0 || cleared >= ROUNDS) { banked += pot; pot = 0; ctx.later(finishNow, 1600); return; }
      if (pot > 0 && phase === 'won') { ctx.later(offer, 1400); return; }
      ctx.later(startRound, 1800);
    }
    function offer() {
      phase = 'offer'; say('Pot: ' + pot + '. Bank it, or let it ride for double?');
      cast.react(1, 'smirk', pick(['Go on. Double it. What is the worst that could happen? I can list them.', 'Bank it, if you are the kind of person who banks things.', 'Your friend says stop. I say your friend has no vision.']), 3200);
      offerEl.innerHTML = '<button type="button" class="mg-btn" data-a="bank">Bank ' + pot + '</button><button type="button" class="mg-btn mg-ride" data-a="ride">Ride x2</button>';
      offerEl.hidden = false;
    }
    ctx.on(offerEl, 'click', function (e) {
      var b = e.target.closest && e.target.closest('button'); if (!b || phase !== 'offer') return;
      offerEl.hidden = true; offerEl.innerHTML = ''; sfx('select');
      if (b.getAttribute('data-a') === 'bank') { banked += pot; pot = 0; ride = false; cast.react(0, 'happy', 'Safe! In the bank! Where the Demon Lord cannot reach it. Probably.', 2000); }
      else { ride = true; rides++; cast.react(0, 'shock', 'Why would you DO that? (Do it.)', 1800); }
      hud(); ctx.later(startRound, 900);
    });

    ctx.on(field, 'pointerdown', function (e) {
      if (phase !== 'pick' || !ctx.playing) return;
      var t = e.target.closest ? e.target.closest('.mg-hat') : null; if (!t) return;
      e.preventDefault();
      var h = hats.filter(function (x) { return x.el === t; })[0]; if (!h || h.el.classList.contains('up')) return;
      h.el.classList.add('up');
      if (h.ok) {
        found++;
        if (found < glasses.length) { sfx('good'); say('One! Where is the other one?'); return; }
        cleared++; round++; streak++; phase = 'won';
        var pts = (100 + streak * 20) * glasses.length; pot = (ride ? pot * 2 : pot) + pts; ride = false;
        sfx('perfect'); say('Found it!  +' + pts);
        cast.react(0, 'happy', 'YES! I KNEW IT! (I did not know it.)', 2000); cast.react(1, 'angry', pick(DEMON_WIN), 2000);
      } else {
        phase = 'result'; glasses.forEach(function (g2) { g2.el.classList.add('up'); });
        lives--; streak = 0; sfx('miss');
        say(ride ? 'Wrong hat. The pot is gone.' : 'Wrong hat.'); if (ride) pot = 0; ride = false;
        cast.react(0, 'sad', 'Oh noooo. The glass!', 2000); cast.react(1, 'smirk', pick(DEMON_LOSE), 2000);
      }
      finishRound();
    });

    function finishNow() {
      var score = banked + lives * 50, stars = score >= 2200 ? 3 : score >= 1100 ? 2 : score >= 350 ? 1 : 0;
      ctx.finish({ title: 'Verdict', score: score, stars: stars, effects: { bond: stars },
        html: '<div class="mg-stats"><span>Rounds <b>' + cleared + '/' + ROUNDS + '</b></span><span>Banked <b>' + banked + '</b></span><span>Rides <b>' + rides + '</b></span><span>Lives left <b>' + lives + '</b></span></div>' });
    }

    return { begin: function () { hud(); startRound(); }, destroy: function () { phase = 'idle'; } };
  }

  /* =====================================================================
     7. FIT CHECK
     ===================================================================== */
  var TT = '<defs><pattern id="mgtt" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="#9b1226"/><rect y="3" width="9" height="2" fill="#0d0b0c"/><rect x="3" width="2" height="9" fill="#0d0b0c"/></pattern>' +
    '<pattern id="mggg" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/><rect width="4" height="4" fill="#ff8fb3"/><rect x="4" y="4" width="4" height="4" fill="#ff8fb3"/></pattern></defs>';
  var LONG = 'M34 52 H86 L98 108 L86 112 L82 82 V112 H38 V82 L34 112 L22 108Z', SHORT = 'M34 52 H86 L94 76 L84 80 L82 70 V112 H38 V70 L36 80 L26 76Z';
  var ST = ' stroke="#0d0b0c" stroke-width="2" stroke-linejoin="round"';
  var FIT_ITEMS = {
    top: [
      { n: 'Pirate shirt', v: 'dramatic', t: ['romantic', 'dramatic', 'punk'], d: '<path d="' + LONG + '" fill="#f3ece0"' + ST + '/><path d="M48 54 l4 9 4-9 4 9 4-9 4 9 4-9 4 9" fill="none" stroke="#0d0b0c" stroke-width="1.6"/><path d="M24 106 l4 5 4-5 4 5 4-5M84 106 l4 5 4-5 4 5 4-5" fill="none" stroke="#0d0b0c" stroke-width="1.4"/>' },
      { n: 'Corset top', v: 'edgy', t: ['edgy', 'dramatic'], d: '<path d="M40 52 H80 L78 108 H42Z" fill="#17141a"' + ST + '/><path d="M60 54 V106" stroke="#d3122a" stroke-width="2.4" stroke-dasharray="3 3"/><path d="M52 60 h16 M52 72 h16 M52 84 h16 M52 96 h16" stroke="#d3122a" stroke-width="1.6"/>' },
      { n: 'Frilly blouse', v: 'sweet', t: ['sweet', 'romantic'], d: '<path d="' + SHORT + '" fill="#ffd0df"' + ST + '/><g fill="#fff" stroke="#0d0b0c" stroke-width="1.4"><circle cx="46" cy="112" r="4"/><circle cx="54" cy="112" r="4"/><circle cx="62" cy="112" r="4"/><circle cx="70" cy="112" r="4"/><circle cx="78" cy="112" r="4"/></g>' },
      { n: 'Safety-pin tee', v: 'punk', t: ['punk', 'casual'], d: '<path d="' + SHORT + '" fill="#3a3a42"' + ST + '/><g stroke="#cfd2d8" stroke-width="2" fill="none"><path d="M46 66 l10 6 M64 80 l12 -5 M50 92 l9 4"/><circle cx="46" cy="66" r="2"/><circle cx="76" cy="75" r="2"/></g>' },
      { n: 'Strawberry cardigan', v: 'sweet', t: ['sweet', 'casual'], d: '<path d="' + LONG + '" fill="#ff9fbf"' + ST + '/><g fill="#e8294f"><circle cx="46" cy="70" r="2.6"/><circle cx="74" cy="64" r="2.6"/><circle cx="50" cy="92" r="2.6"/><circle cx="72" cy="96" r="2.6"/></g><path d="M60 52 V112" stroke="#0d0b0c" stroke-width="2"/><circle cx="64" cy="72" r="2" fill="#fff"/><circle cx="64" cy="90" r="2" fill="#fff"/>' },
      { n: 'Courtroom blazer', v: 'formal', t: ['formal', 'serious'], d: '<path d="' + LONG + '" fill="#2f3340"' + ST + '/><path d="M60 52 L48 80 L60 112 L72 80Z" fill="#f3ece0"' + ST + '/><path d="M48 52 L60 76 L72 52" fill="none" stroke="#d3122a" stroke-width="3"/>' },
      { n: 'Pre-scuffed leather jacket', v: 'edgy', t: ['edgy', 'casual'], d: '<path d="' + LONG + '" fill="#17141a"' + ST + '/><path d="M60 52 V112" stroke="#bdb6c4" stroke-width="2.6"/><rect x="68" y="70" width="10" height="8" fill="#d3122a"/><path d="M36 60 l8 2 M30 96 l9 -2" stroke="#4a4552" stroke-width="2"/>' }
    ],
    bottom: [
      { n: 'Tartan bondage trousers', v: 'punk', t: ['punk', 'edgy'], d: '<path d="M38 108 H82 L80 190 H64 L60 130 L56 190 H40Z" fill="url(#mgtt)"' + ST + '/><path d="M38 124 H82 M38 140 H60" stroke="#17141a" stroke-width="4"/><path d="M60 124 q-4 12 2 24" fill="none" stroke="#bdb6c4" stroke-width="2"/>' },
      { n: 'Tutu skirt', v: 'sweet', t: ['sweet', 'dramatic'], d: '<path d="M42 108 H78 L98 150 H22Z" fill="#ffb6d0"' + ST + '/><path d="M30 146 Q60 158 90 146" fill="none" stroke="#e8294f" stroke-width="2"/><path d="M36 134 Q60 144 84 134" fill="none" stroke="#fff" stroke-width="2"/>' },
      { n: 'Tailored trousers', v: 'formal', t: ['formal', 'serious'], d: '<path d="M38 108 H82 L80 190 H64 L60 128 L56 190 H40Z" fill="#555a68"' + ST + '/><path d="M48 128 V188 M72 128 V188" stroke="#3d414d" stroke-width="2"/>' },
      { n: 'Ripped jeans', v: 'casual', t: ['casual', 'edgy'], d: '<path d="M38 108 H82 L80 190 H64 L60 128 L56 190 H40Z" fill="#3a6ea5"' + ST + '/><path d="M44 142 l8 3 M68 160 l8 -3 M44 170 l9 2" stroke="#e8f1ff" stroke-width="3"/>' },
      { n: 'Gingham mini skirt', v: 'sweet', t: ['sweet', 'casual'], d: '<path d="M40 108 H80 L86 138 H34Z" fill="url(#mggg)"' + ST + '/>' }
    ],
    shoes: [
      { n: 'Rocking-horse platforms', v: 'dramatic', t: ['dramatic', 'punk'], d: '<g><path d="M36 186 H58 V198 H34Z M62 186 H84 V198 H86Z" fill="#17141a"' + ST + '/><path d="M30 198 H60 Q56 214 34 212Z M60 198 H90 Q86 212 66 214Z" fill="#d3122a"' + ST + '/></g>' },
      { n: 'Combat boots', v: 'edgy', t: ['edgy', 'casual'], d: '<path d="M38 170 H58 V204 H32 V196 L38 192Z M62 170 H82 V192 L88 196 V204 H62Z" fill="#17141a"' + ST + '/><path d="M38 180 H58 M62 180 H82" stroke="#bdb6c4" stroke-width="2"/>' },
      { n: 'Bow Mary Janes', v: 'sweet', t: ['sweet', 'romantic'], d: '<path d="M36 192 H58 V202 H32Z M62 192 H84 V202 H88Z" fill="#ff8fb3"' + ST + '/><path d="M42 192 l-4 -4 v8z M54 192 l4 -4 v8z" fill="#fff"' + ST + '/>' },
      { n: 'Polished loafers', v: 'formal', t: ['formal', 'serious'], d: '<path d="M36 194 H58 V204 H30Z M62 194 H84 V204 H90Z" fill="#3b2414"' + ST + '/><path d="M36 198 H50 M70 198 H84" stroke="#a66d3d" stroke-width="2"/>' },
      { n: 'Tired sneakers', v: 'casual', t: ['casual'], d: '<path d="M36 192 H58 V204 H30Z M62 192 H84 V204 H90Z" fill="#e6e6e6"' + ST + '/><path d="M30 204 H58 M62 204 H90" stroke="#8b8b96" stroke-width="3"/>' }
    ],
    acc: [
      { n: 'Armour-style ring', v: 'edgy', t: ['edgy', 'punk'], d: '<g transform="translate(20 108)"><circle r="6" fill="none" stroke="#cfd2d8" stroke-width="3.4"/><path d="M-6 -6 L2 -14 L8 -4Z" fill="#cfd2d8"' + ST + '/></g>' },
      { n: 'Orb-style pendant (original design)', v: 'dramatic', t: ['dramatic', 'romantic'], d: '<path d="M50 54 Q60 84 70 54" fill="none" stroke="#bdb6c4" stroke-width="1.8"/><circle cx="60" cy="86" r="8" fill="#dcd6ee"' + ST + '/><path d="M60 80 l2 4 4 .5 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -.5Z" fill="#d3122a"/>' },
      { n: 'Pearl choker', v: 'romantic', t: ['romantic', 'formal'], d: '<g fill="#fff" stroke="#0d0b0c" stroke-width="1.4"><circle cx="50" cy="47" r="2.8"/><circle cx="55" cy="49" r="2.8"/><circle cx="60" cy="50" r="2.8"/><circle cx="65" cy="49" r="2.8"/><circle cx="70" cy="47" r="2.8"/></g>' },
      { n: 'Strawberry hair clip', v: 'sweet', t: ['sweet'], d: '<g transform="translate(76 18)"><path d="M0 8 C-8 2 -6 -6 0 -4 C6 -6 8 2 0 8Z" fill="#e8294f"' + ST + '/><path d="M-3 -5 L0 -9 L3 -5Z" fill="#2e8b3d"/></g>' },
      { n: 'Studded belt', v: 'punk', t: ['punk', 'edgy'], d: '<rect x="38" y="104" width="44" height="7" fill="#17141a"' + ST + '/><g fill="#cfd2d8"><circle cx="44" cy="107.5" r="1.8"/><circle cx="52" cy="107.5" r="1.8"/><circle cx="60" cy="107.5" r="1.8"/><circle cx="68" cy="107.5" r="1.8"/><circle cx="76" cy="107.5" r="1.8"/></g>' },
      { n: 'Dark sunglasses', v: 'serious', t: ['serious', 'edgy', 'casual'], d: '<rect x="45" y="22" width="13" height="8" rx="3" fill="#0d0b0c"/><rect x="62" y="22" width="13" height="8" rx="3" fill="#0d0b0c"/><path d="M58 25 h4" stroke="#0d0b0c" stroke-width="2"/>' }
    ]
  };
  var FIT_PRICE = { 'Pirate shirt': 4, 'Corset top': 3, 'Frilly blouse': 2, 'Safety-pin tee': 1, 'Strawberry cardigan': 2, 'Courtroom blazer': 5, 'Pre-scuffed leather jacket': 5,
    'Tartan bondage trousers': 4, 'Tutu skirt': 2, 'Tailored trousers': 4, 'Ripped jeans': 1, 'Gingham mini skirt': 2,
    'Rocking-horse platforms': 5, 'Combat boots': 3, 'Bow Mary Janes': 2, 'Polished loafers': 4, 'Tired sneakers': 1,
    'Armour-style ring': 3, 'Orb-style pendant (original design)': 5, 'Pearl choker': 3, 'Strawberry hair clip': 1, 'Studded belt': 2, 'Dark sunglasses': 2 };
  var FIT_BRIEFS = [
    { who: 'nana', say: 'Stage tonight. I want to look dangerous. Nothing cute.', want: ['edgy', 'dramatic'], no: 'sweet', budget: 14, win: 'Good. Now I look like a warning.', nope: 'Who put a bow on this. Who did this to me.' },
    { who: 'hachi', say: 'First date, but I do not want to look like I tried! Nothing scary!', want: ['sweet', 'casual'], no: 'punk', budget: 8, win: 'I look like I woke up cute! By accident! On purpose!', nope: 'The Demon Lord dressed me. I can tell.' },
    { who: 'yasu', say: 'Court appearance. Do not ask. Nothing that sparkles at a judge.', want: ['formal', 'serious'], no: 'dramatic', budget: 15, win: 'Adequate. I will be out by lunch.', nope: 'The judge will have questions. So do I.' },
    { who: 'nobu', say: 'My parents are hosting people! Make me look like I own an iron!', want: ['formal', 'sweet'], no: 'punk', budget: 13, win: 'I look so respectable! I could CRY! Mum might not recognise me!', nope: 'My mother will think this is a phase. She will be right.' },
    { who: 'shin', say: 'Photoshoot. They want mystery. I have been told I have mystery.', want: ['edgy', 'serious'], no: 'sweet', budget: 12, win: 'Fine. I look like I know something.', nope: 'No. I would like my mystery back.' },
    { who: 'reira', say: 'A press event. Elegant. Make the cameras apologise.', want: ['formal', 'dramatic'], no: 'casual', budget: 16, win: 'They will not know where to look. Thank you.', nope: 'Sneakers. To a press event. All right.' },
    { who: 'takumi', say: 'I need to look rich but humble. Rich-humble.', want: ['formal', 'casual'], no: 'sweet', budget: 12, win: 'Expensive, and I look sorry about it. Perfect.', nope: 'A frill. On me. Who do you work for.' }
  ];
  var FIT_TWISTS = [
    { who: 'nobu', say: 'Good news! Nothing formal! My cousin booked a surprise picnic.', want: ['casual', 'sweet'], no: 'serious', budget: 10, win: 'Everyone said I looked like a nice boy!', nope: 'Sir, this is a picnic.',
      twist: { say: 'UPDATE! The picnic is now a funeral! Nobody is dead! It is a long story!', want: ['formal', 'serious'], no: 'sweet', budget: 15 } },
    { who: 'hachi', say: 'Karaoke with the girls! Cute cute cute!', want: ['sweet', 'romantic'], no: 'punk', budget: 9, win: 'I am the cutest person who has ever cried at karaoke!', nope: 'Why do I look like I am about to fight a bus?',
      twist: { say: 'WAIT. Nana\'s band is coming. Change everything! Make me look cool!!', want: ['edgy', 'punk'], no: 'formal', budget: 13 } },
    { who: 'yasu', say: 'Quiet dinner with an old colleague. Plain is fine.', want: ['casual', 'serious'], no: 'dramatic', budget: 9, win: 'Nobody looked at me once. Ideal.', nope: 'You have given me a personality. Take it back.',
      twist: { say: 'Correction. The colleague is opposing counsel. I want him to feel it.', want: ['formal', 'edgy'], no: 'casual', budget: 14 } }
  ];
  var FIT_VERDICT = [
    ['I have seen scarecrows with a stronger point of view.', 'That is not an outfit. That is an accident with buttons.', 'Delete it. Burn the receipt.'],
    ['It is clothing. That is a start. Some people never reach that.', 'Nobody will be hurt. That is not the same as good.', 'The shoes are trying very hard. I respect the effort.'],
    ['Hm. Acceptable. Do not let it go to your head.', 'I would be seen with that. It is the highest praise I have.', 'Not bad. The belt and I are in agreement.'],
    ['...Dangerous. Annoyingly dangerous. Well done.', 'Fine. That is a good one. Do not tell anyone I said it.', 'It works. It really works. I hate how well it works.']
  ];
  var FIT_SLOTS = [['top', 'TOP'], ['bottom', 'BOTTOM'], ['shoes', 'SHOES'], ['acc', 'EXTRA']];

  function fitcheck(ctx) {
    var root = el('div', 'mg-fit', '<div class="mg-strip"></div><div class="mg-fit-main"><div class="mg-doll"></div><div class="mg-fit-panel"><div class="mg-fit-bar"><i></i></div><div class="mg-fit-brief"></div><div class="mg-fit-tabs"></div><div class="mg-fit-grid"></div><button type="button" class="mg-btn mg-fit-done">Done</button></div></div>');
    ctx.stage.appendChild(root);
    var q = function (s) { return root.querySelector(s); };
    var dollEl = q('.mg-doll'), tabsEl = q('.mg-fit-tabs'), gridEl = q('.mg-fit-grid'), barI = q('.mg-fit-bar i'), doneB = q('.mg-fit-done'), briefEl = q('.mg-fit-brief');
    var cast = ctx.cast(q('.mg-strip'), ['nana', 'hachi'], 'mg-cast-strip'); cast.base(0, 'neutral'); cast.base(1, 'happy');
    var briefs = shuffle(FIT_BRIEFS).slice(0, 3), bi = 0, sel = {}, tab = 'top', T = 65, tl = T, state = 'idle', total = 0, matchSum = 0, ROUND_N = 4, client = null, twisted = false, perfects = 0;
    briefs.splice(2, 0, pick(FIT_TWISTS)); // the third client changes their mind halfway through

    function dollSVG() {
      var s = '<svg viewBox="0 0 120 220" aria-hidden="true">' + TT + '<rect x="0" y="0" width="120" height="220" fill="none"/>';
      s += '<path d="M40 108 H80 L78 188 H64 L60 130 L56 188 H42Z" fill="#d8d2c8"' + ST + '/>';
      s += (sel.bottom ? sel.bottom.d : '');
      s += (sel.shoes ? sel.shoes.d : '<path d="M40 186 H56 V196 H38Z M64 186 H80 V196 H82Z" fill="#f0c8a8"' + ST + '/>');
      s += '<path d="M36 52 H84 L92 110 H84 L82 82 V110 H38 V82 L36 110 H28Z" fill="#f0c8a8"' + ST + '/>';
      s += '<path d="M40 52 H80 V108 H40Z" fill="#e8e2d6"' + ST + '/>';
      s += (sel.top ? sel.top.d : '');
      s += '<rect x="54" y="42" width="12" height="12" fill="#f0c8a8"' + ST + '/>';
      s += '<path d="M42 26 Q42 4 60 4 Q78 4 78 26 Q78 30 74 34 L46 34 Q42 30 42 26Z" fill="#17141a"' + ST + '/>';
      s += '<ellipse cx="60" cy="30" rx="15" ry="17" fill="#f0c8a8"' + ST + '/>';
      s += '<path d="M42 24 Q60 6 78 24 Q64 16 60 20 Q54 16 42 24Z" fill="#17141a"/>';
      s += '<circle cx="54" cy="30" r="1.8" fill="#0d0b0c"/><circle cx="66" cy="30" r="1.8" fill="#0d0b0c"/><path d="M55 38 Q60 41 65 38" fill="none" stroke="#0d0b0c" stroke-width="1.6" stroke-linecap="round"/>';
      s += (sel.acc ? sel.acc.d : '');
      return s + '</svg>';
    }
    function drawDoll() { dollEl.innerHTML = dollSVG(); }
    function drawTabs() {
      var h = ''; FIT_SLOTS.forEach(function (p) { h += '<button type="button" class="mg-tab' + (tab === p[0] ? ' on' : '') + (sel[p[0]] ? ' done' : '') + '" data-s="' + p[0] + '">' + p[1] + '</button>'; }); tabsEl.innerHTML = h;
    }
    function drawGrid() {
      var h = ''; FIT_ITEMS[tab].forEach(function (it, i) { h += '<button type="button" class="mg-item' + (sel[tab] === it ? ' on' : '') + (client && it.t.indexOf(client.no) >= 0 ? ' banned' : '') + '" data-i="' + i + '"><b>' + it.n + '</b><small>&yen;' + FIT_PRICE[it.n] + ' &middot; ' + it.t.join(', ') + '</small></button>'; }); gridEl.innerHTML = h;
    }
    function cost() { var c = 0; FIT_SLOTS.forEach(function (p) { if (sel[p[0]]) c += FIT_PRICE[sel[p[0]].n]; }); return c; }
    function drawBrief() {
      if (!client) return; var c = cost();
      briefEl.innerHTML = 'WANTS <b>' + client.want.join(' + ') + '</b> &middot; NO <b class="no">' + client.no + '</b> &middot; <span class="' + (c > client.budget ? 'over' : '') + '">&yen;' + c + '/' + client.budget + '</span>';
    }
    function bestFor(c) { // best tag score actually achievable under this brief's budget and ban
      var best = 0;
      FIT_ITEMS.top.forEach(function (a) { FIT_ITEMS.bottom.forEach(function (b) { FIT_ITEMS.shoes.forEach(function (d) { FIT_ITEMS.acc.forEach(function (e) {
        var set = [a, b, d, e], p = 0, m = 0, bad = false;
        set.forEach(function (it) { p += FIT_PRICE[it.n]; if (it.t.indexOf(c.no) >= 0) bad = true; it.t.forEach(function (t) { if (c.want.indexOf(t) >= 0) m++; }); });
        if (!bad && p <= c.budget && m > best) best = m;
      }); }); }); });
      return Math.max(1, best);
    }
    function render() { drawDoll(); drawTabs(); drawGrid(); drawBrief(); }

    ctx.on(tabsEl, 'pointerdown', function (e) { var b = e.target.closest && e.target.closest('.mg-tab'); if (!b || state !== 'play') return; e.preventDefault(); tab = b.getAttribute('data-s'); sfx('click'); drawTabs(); drawGrid(); });
    ctx.on(gridEl, 'click', function (e) {
      var b = e.target.closest && e.target.closest('.mg-item'); if (!b || state !== 'play') return;
      var it = FIT_ITEMS[tab][+b.getAttribute('data-i')]; sel[tab] = sel[tab] === it ? null : it; sfx('select');
      render();
      var nxt = FIT_SLOTS.map(function (p) { return p[0]; }).filter(function (k) { return !sel[k]; })[0];
      if (sel[tab] && nxt) { tab = nxt; drawTabs(); drawGrid(); }
    });
    ctx.on(doneB, 'click', function () { if (state === 'play') judge(); });

    function newRound() {
      client = briefs[bi]; sel = {}; tab = 'top'; tl = T; state = 'play'; twisted = false;
      cast.who(1, client.who, 'neutral'); cast.base(1, 'neutral');
      cast.say(1, client.say, 0); render(); doneB.disabled = false;
      ctx.setScore('CLIENT <b>' + (bi + 1) + '/' + ROUND_N + '</b> &middot; <b>' + total + '</b>');
    }
    function applyTwist() {
      twisted = true; var nw = {}, k0; for (k0 in client) nw[k0] = client[k0]; for (k0 in client.twist) nw[k0] = client.twist[k0]; delete nw.twist; client = nw;
      tl = Math.min(T, tl + 15); sfx('boo'); cast.base(1, 'shock'); cast.say(1, client.say, 0); drawBrief(); drawGrid();
    }
    function judge() {
      if (state !== 'play') return;
      if (client.twist && !twisted && tl > 0) { applyTwist(); return; } // finishing early just means they change their mind sooner
      state = 'judge'; doneB.disabled = true;
      var m = 0, filled = 0, spent = cost(), banned = false, best = bestFor(client);
      FIT_SLOTS.forEach(function (p) { var it = sel[p[0]]; if (it) { filled++; if (it.t.indexOf(client.no) >= 0) banned = true; it.t.forEach(function (t) { if (client.want.indexOf(t) >= 0) m++; }); } });
      var over = spent > client.budget, ratio = Math.min(1, m / best);
      if (banned) ratio *= 0.5; if (over) ratio *= 0.75;
      var pts = Math.round(ratio * 90) + (filled === 4 ? 10 : 0) + (over ? 0 : (client.budget - spent) * 3) + (twisted && ratio >= 0.75 ? 40 : 0);
      total += pts; matchSum += ratio;
      var tier = ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : ratio >= 0.3 ? 1 : 0;
      if (filled < 2) tier = 0; if (tier === 3) perfects++;
      cast.set(0, tier >= 2 ? 'smirk' : tier === 1 ? 'neutral' : 'angry'); cast.set(1, tier >= 2 ? 'happy' : 'sad');
      var note = banned ? client.nope : over ? 'Lovely. Who is paying for this? Not them.' : tier >= 2 && Math.random() < 0.6 ? client.win : null;
      if (note) cast.say(1, note + '  (+' + pts + ')', 0);
      else cast.say(0, pick(FIT_VERDICT[tier]) + '  (+' + pts + ')', 0);
      sfx(tier >= 2 ? 'perfect' : tier === 1 ? 'good' : 'miss');
      ctx.setScore('CLIENT <b>' + (bi + 1) + '/' + ROUND_N + '</b> &middot; <b>' + total + '</b>');
      ctx.later(function () {
        bi++; if (bi >= ROUND_N) finishNow(); else { cast.set(0, 'neutral'); newRound(); }
      }, 3200);
    }

    function finishNow() {
      state = 'end'; var avg = matchSum / ROUND_N, stars = avg >= 0.85 ? 3 : avg >= 0.65 ? 2 : avg >= 0.35 ? 1 : 0;
      ctx.finish({ title: 'Sale day verdict', score: total, stars: stars, effects: { bond: stars, fame: Math.max(0, stars - 1) },
        html: '<div class="mg-stats"><span>Clients <b>' + ROUND_N + '</b></span><span>Style match <b>' + Math.round(avg * 100) + '%</b></span><span>Nailed <b>' + perfects + '</b></span></div>' });
    }

    function update(dt) {
      if (state !== 'play') return;
      if (client.twist && !twisted && tl <= T * 0.6) applyTwist();
      tl -= dt; barI.style.width = Math.max(0, tl / T * 100).toFixed(1) + '%'; barI.className = tl < 5 ? 'low' : '';
      if (tl <= 0) judge();
    }

    drawDoll(); drawTabs(); gridEl.innerHTML = '';
    return { begin: function () { newRound(); }, update: update, destroy: function () { state = 'end'; } };
  }

  /* =====================================================================
     8. OBJECTION!
     ===================================================================== */
  var CLAUSES = [
    // evil
    ['The Artist\'s firstborn shall be considered merchandise.', 1], ['The Label may rename the band "Product 7".', 1],
    ['All songs about feelings must be approved by a man named Greg.', 1], ['The Artist agrees to be photographed in a banana costume, in perpetuity.', 1],
    ['Royalties will be paid in exposure, which is a kind of weather.', 1], ['The Label owns the Artist\'s name, face, and the sound of her sneezing.', 1],
    ['The Artist must smile during sad songs.', 1], ['Any hair colour change requires three signatures and a priest.', 1],
    ['The Label may sell the band\'s tour van to fund a "vision".', 1], ['The Artist waives the right to sleep during promotional periods.', 1],
    ['In the event of a hit, the Label\'s cat receives 40%.', 1], ['The Label may rewrite lyrics to include sponsors, such as Sparkle Mayo.', 1],
    ['The Artist may not date, befriend, or glance at anyone fun.', 1], ['Breakups are the Label\'s intellectual property.', 1],
    ['Rock-star behaviour will be billed at "dramatic rates".', 1], ['Term: forever, plus a sequel.', 1],
    ['Band members are interchangeable. Especially the drummer.', 1], ['The Label may pre-approve the Artist\'s opinions.', 1],
    ['All band photos must include a decorative fern, owned by the Label.', 1], ['The Artist shall thank the Label in every dream.', 1],
    // fair
    ['The Label will provide water at all gigs. Cold water.', 0], ['Artists keep the rights to their own songs.', 0],
    ['The tour van shall have working brakes.', 0], ['Payment is due within thirty days, in actual money.', 0],
    ['Either party may leave with notice and a firm handshake.', 0], ['Soundchecks shall start before the gig does.', 0],
    ['Band members receive meal breaks of at least fifteen minutes.', 0], ['The Artist may decline photos with mascots.', 0],
    ['Royalty statements shall be readable by humans.', 0], ['The Label shall spell the band\'s name correctly.', 0],
    ['All parties will be nice about the load-in elevator.', 0], ['Artists choose their own album art, within reason.', 0],
    ['Gigs shall have fire exits. This is boring but important.', 0], ['Disputes go to a mediator who has not met anyone involved.', 0]
  ];
  // The fine print: sounds generous but bites, or sounds insane but is fine. Only appears after the mid-game twist.
  var FINE_PRINT = [
    ['Signing bonus of two million yen, payable upon the heat death of the universe.', 1], ['The Artist keeps 100% of royalties, after deductions of 100%.', 1],
    ['The Label provides a private car. The Artist agrees to live in it.', 1], ['Free catering at all events. "Events" to be defined by Greg.', 1],
    ['Artists may leave at any time, subject to Appendix Forever.', 1], ['A generous holiday allowance, to be taken during the Artist\'s sleep.', 1],
    ['Full creative freedom, as described in the Label\'s creative requirements.', 1],
    ['The Drummer may bill the Label for the time spent reading this contract.', 0], ['In the event of fire, the Label carries the amps.', 0],
    ['Any employee named Greg must introduce himself before speaking.', 0], ['The Label surrenders its cat upon request.', 0],
    ['The Bassist is a minor and shall be sent home at a sensible hour. Yes, you.', 0], ['The Vocalist may glare at executives without notice.', 0]
  ];
  var YASU_OK = ['Sustained.', 'Objection. Obviously.', 'Noted. Stamped. Moving on.', 'Section denied.', 'That one had a trapdoor.'];
  var YASU_BAD = ['That one was fine. Alarming, but fine.', 'You objected to water. Water.', 'Overruled. By me. Quietly.'];
  var YASU_SIGNED = ['Signed. We are now owned by a sandwich.', 'Well. That is binding. Probably.', 'I will pretend I did not see that.'];
  var TAKUMI = ['Sign it. Everything is a great deal when I say it.', 'You will make so much money. In theory.', 'It is just a formality. Formalities are my hobby.', 'Such lovely handwriting. Use it on the line.'];

  function objection(ctx) {
    var root = el('div', 'mg-obj', '<div class="mg-strip"></div><div class="mg-obj-field"><div class="mg-obj-line"><span>X</span><i></i><em>SIGN HERE</em></div></div>');
    ctx.stage.appendChild(root);
    var field = root.children[1], line = field.firstChild;
    var cast = ctx.cast(root.children[0], ['yasu', 'takumi'], 'mg-cast-strip'); cast.base(0, 'neutral'); cast.base(1, 'smirk');
    var deck = shuffle(CLAUSES), di = 0, cards = [], t = 0, spawnT = 0.3, score = 0, streak = 0, caught = 0, signedEvil = 0, wrong = 0, lives = 3, TOTAL = 80, ended = false, fairSigned = 0;
    // Depth: stamping at the last second pays double, a streak earns a RECESS, and halfway through the fine print starts lying.
    var fine = shuffle(FINE_PRINT), fi = 0, finePhase = false, recess = 0, freeze = 0, late = 0;
    var recB = el('button', 'mg-obj-recess', ''); recB.type = 'button'; recB.tabIndex = -1; field.appendChild(recB);
    var banner = el('div', 'mg-obj-banner', ''); field.appendChild(banner);
    function drawRecess() { recB.textContent = 'RECESS x' + recess; recB.disabled = recess <= 0 || freeze > 0; }
    function callRecess() {
      if (!ctx.playing || ended || recess <= 0 || freeze > 0) return; recess--; freeze = 5; drawRecess(); sfx('select');
      banner.textContent = 'RECESS: THE CLAUSES WILL WAIT'; banner.className = 'mg-obj-banner show';
      cast.react(0, 'neutral', 'Five seconds. Read. Everyone else may sit quietly and feel bad.', 2600);
    }
    ctx.on(recB, 'pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); callRecess(); });
    ctx.on(window, 'keydown', function (e) { if (e.key === ' ' && !e.repeat) { if (ctx.playing) e.preventDefault(); callRecess(); } });

    function hud() { ctx.setScore('SCORE <b>' + score + '</b> &middot; ' + new Array(lives + 1).join('&#9998;') + ' &middot; ' + Math.max(0, Math.ceil(TOTAL - t)) + 's'); }
    function speed() { return field.clientHeight * Math.min(0.14, 0.085 + t * 0.0009); }
    function spawn() {
      if (di >= deck.length) { deck = shuffle(CLAUSES); di = 0; }
      var c = finePhase && fi < fine.length && Math.random() < 0.55 ? fine[fi++] : deck[di++], d = el('div', 'mg-clause', '<span>' + c[0] + '</span>'); field.appendChild(d);
      cards.push({ el: d, y: -d.offsetHeight - 4, h: d.offsetHeight, evil: c[1], done: false }); d.style.transform = 'translateY(' + cards[cards.length - 1].y + 'px)';
    }
    function gone(c) { c.done = true; ctx.later(function () { if (c.el.parentNode) c.el.parentNode.removeChild(c.el); }, 420); }

    ctx.on(field, 'pointerdown', function (e) {
      if (!ctx.playing || ended) return;
      var d = e.target.closest && e.target.closest('.mg-clause'); if (!d) return; e.preventDefault();
      var c = cards.filter(function (x) { return x.el === d; })[0]; if (!c || c.done) return;
      gone(c);
      if (c.evil) {
        streak++; caught++; var pts = 10 * (1 + Math.floor(streak / 4)), lineY0 = field.clientHeight - 62, isLate = c.y + c.h >= lineY0 - field.clientHeight * 0.2;
        if (isLate) { pts *= 2; late++; }
        if (streak % 5 === 0 && recess < 2) { recess++; drawRecess(); }
        score += pts; sfx('perfect'); c.el.classList.add('stamp');
        cast.react(0, 'smirk', (isLate ? 'Cutting it fine. Good.' : pick(YASU_OK)) + '  +' + pts, 1700); cast.react(1, 'angry', null, 1700);
      } else {
        streak = 0; wrong++; score = Math.max(0, score - 15); sfx('miss'); c.el.classList.add('wrong');
        cast.react(0, 'neutral', pick(YASU_BAD), 1900); cast.react(1, 'happy', 'Thank you for your cooperation!', 1900);
      }
      hud();
    });

    function resolveSigned(c) {
      gone(c);
      if (c.evil) {
        lives--; signedEvil++; streak = 0; sfx('boo'); c.el.classList.add('signed');
        cast.react(0, 'sad', pick(YASU_SIGNED), 2000); cast.react(1, 'happy', pick(TAKUMI), 2000);
        if (lives <= 0) endGame();
      } else { fairSigned++; score += 5; sfx('click'); c.el.classList.add('fine'); }
      hud();
    }

    function endGame() { if (ended) return; ended = true; ctx.later(finishNow, 900); }
    function finishNow() {
      var stars = score >= 340 ? 3 : score >= 190 ? 2 : score >= 70 ? 1 : 0;
      ctx.finish({ title: 'Contract review', score: score, stars: stars, effects: { harmony: stars, scandal: stars >= 3 ? -2 : stars === 2 ? -1 : 0 },
        html: '<div class="mg-stats"><span>Objections <b>' + caught + '</b></span><span>Last-second <b>' + late + '</b></span><span>Wrongful <b>' + wrong + '</b></span><span>Signed evil <b>' + signedEvil + '</b></span></div>' });
    }

    function update(dt) {
      if (ended) return; t += dt;
      var H = field.clientHeight, lineY = H - 62, v = speed(), i, c, last = cards.filter(function (x) { return !x.done; }).slice(-1)[0];
      line.style.top = lineY + 'px';
      if (!finePhase && t >= TOTAL * 0.45) {
        finePhase = true; banner.textContent = 'TAKUMI ADDS THE FINE PRINT'; banner.className = 'mg-obj-banner show'; ctx.later(function () { if (freeze <= 0) banner.className = 'mg-obj-banner'; }, 2600); sfx('boo');
        cast.react(0, 'neutral', 'He has started being generous. Read to the end of each sentence.', 3000); cast.react(1, 'smirk', null, 3000);
      }
      if (freeze > 0) { freeze -= dt; if (freeze <= 0) { banner.className = 'mg-obj-banner'; drawRecess(); } hud(); return; }
      spawnT -= dt;
      if (t < TOTAL - 8 && spawnT <= 0 && (!last || last.y > 8)) { spawn(); spawnT = Math.max(1.9, 3.1 - t * 0.018); if (Math.random() < 0.25) cast.react(1, 'smirk', pick(TAKUMI), 1800); }
      for (i = cards.length - 1; i >= 0; i--) {
        c = cards[i]; if (c.done) { if (!c.el.parentNode) cards.splice(i, 1); continue; }
        c.y += v * dt; c.el.style.transform = 'translateY(' + c.y.toFixed(1) + 'px)';
        if (c.y + c.h >= lineY) resolveSigned(c);
      }
      if (t >= TOTAL && !cards.some(function (x) { return !x.done; })) endGame();
      hud();
    }
    return { begin: function () { cast.say(0, 'Read carefully. Then stamp. Do not enjoy it.', 2500); drawRecess(); hud(); }, update: update, destroy: function () { cards.length = 0; } };
  }

  /* =====================================================================
     9. NOBU'S FAMILY INN
     ===================================================================== */
  var INN_ITEMS = {
    tea: { n: 'Tea', svg: '<svg viewBox="0 0 40 40"><path d="M8 16 H30 V26 Q30 34 19 34 Q8 34 8 26Z" fill="#fff" stroke="#0d0b0c" stroke-width="2.5"/><path d="M30 19 h4 a4 4 0 0 1 0 8 h-4" fill="none" stroke="#0d0b0c" stroke-width="2.5"/><path d="M14 12 q-3 -4 0 -8 M22 12 q-3 -4 0 -8" fill="none" stroke="#9aa" stroke-width="2"/><rect x="9" y="17" width="20" height="4" fill="#7bb661"/></svg>' },
    towel: { n: 'Towel', svg: '<svg viewBox="0 0 40 40"><rect x="6" y="12" width="28" height="20" rx="3" fill="#bfe6ff" stroke="#0d0b0c" stroke-width="2.5"/><path d="M6 20 H34 M6 26 H34" stroke="#fff" stroke-width="3"/><path d="M12 12 V32" stroke="#6fb8ff" stroke-width="2"/></svg>' },
    oden: { n: 'Oden', svg: '<svg viewBox="0 0 40 40"><path d="M5 18 H35 Q34 34 20 34 Q6 34 5 18Z" fill="#c98f2c" stroke="#0d0b0c" stroke-width="2.5"/><circle cx="14" cy="17" r="5" fill="#fff" stroke="#0d0b0c" stroke-width="2"/><rect x="20" y="10" width="9" height="9" rx="2" fill="#f3c46b" stroke="#0d0b0c" stroke-width="2"/><path d="M24 4 V14" stroke="#0d0b0c" stroke-width="2"/></svg>' },
    futon: { n: 'Futon', svg: '<svg viewBox="0 0 40 40"><rect x="4" y="14" width="32" height="18" rx="4" fill="#ffd0df" stroke="#0d0b0c" stroke-width="2.5"/><rect x="6" y="16" width="10" height="8" rx="3" fill="#fff" stroke="#0d0b0c" stroke-width="2"/><path d="M20 20 H34 M20 26 H34" stroke="#e8294f" stroke-width="2.5"/></svg>' }
  };
  var INN_KEYS = ['tea', 'towel', 'oden', 'futon'];
  var INN_OK = {
    tea: [['shin', 'Tea at exactly the right temperature. I do not know why I know this.']],
    towel: [['shin', 'Towel folded in thirds. It is a gift. I did not ask for it.']],
    oden: [['nobu', 'Oden! Hot! Careful! It is good, I swear, my mother made it!']],
    futon: [['yasu', 'Four futons. One trip. Do not ask me how.']]
  };
  var INN_WRONG = ['SORRY! WELCOME! SORRY! WELCOME!', 'That is... a different thing. I will fetch the right thing!', 'I panicked. In my defence, there was a lot of tea.'];
  var INN_NANA = ['Nana stares at the guest. The guest tips immediately.', 'One look. Triple tip. No words were used.'];
  var GUEST_FACES = ['#f0c8a8', '#e6b896', '#d9a47c', '#f6d7bd'], GUEST_HAIR = ['#1b1517', '#5a3b2a', '#9a9aa6', '#2b3a7a', '#a8213a'];
  function guestSVG(i, mood, grumpy) {
    var skin = GUEST_FACES[i % 4], hair = GUEST_HAIR[(i * 3) % 5];
    var mouth = mood === 0 ? '<path d="M38 56 Q50 66 62 56" fill="none" stroke="#0d0b0c" stroke-width="3" stroke-linecap="round"/>' : mood === 1 ? '<path d="M40 60 H60" stroke="#0d0b0c" stroke-width="3" stroke-linecap="round"/>' : '<path d="M38 64 Q50 54 62 64" fill="none" stroke="#0d0b0c" stroke-width="3" stroke-linecap="round"/>';
    var brows = mood === 2 || grumpy ? '<path d="M32 36 L45 41 M68 36 L55 41" stroke="#0d0b0c" stroke-width="3" stroke-linecap="round"/>' : '';
    return '<svg viewBox="0 0 100 100"><path d="M14 100 Q16 74 50 72 Q84 74 86 100Z" fill="' + (grumpy ? '#5a3b6a' : ['#7a9fd0', '#d09a7a', '#8cc09a', '#c08cc0'][i % 4]) + '" stroke="#0d0b0c" stroke-width="3"/>' +
      '<ellipse cx="50" cy="46" rx="24" ry="26" fill="' + skin + '" stroke="#0d0b0c" stroke-width="3"/><path d="M26 44 Q26 18 50 18 Q74 18 74 44 Q62 30 50 32 Q38 30 26 44Z" fill="' + hair + '" stroke="#0d0b0c" stroke-width="3"/>' +
      '<circle cx="40" cy="46" r="3" fill="#0d0b0c"/><circle cx="60" cy="46" r="3" fill="#0d0b0c"/>' + brows + mouth + '</svg>';
  }

  function inn(ctx) {
    var rooms = '', i;
    for (i = 0; i < 6; i++) rooms += '<div class="mg-room" data-r="' + i + '"><div class="mg-vacant">ROOM ' + (i + 1) + '</div><div class="mg-guest"></div><div class="mg-want"></div><div class="mg-pat"><i></i></div></div>';
    var tray = ''; INN_KEYS.forEach(function (k) { tray += '<button type="button" class="mg-tray-item" data-k="' + k + '">' + INN_ITEMS[k].svg + '<b>' + INN_ITEMS[k].n + '</b></button>'; });
    tray += '<button type="button" class="mg-inn-bow" tabindex="-1"><i></i><b>SORRY!</b></button>';
    var root = el('div', 'mg-inn', '<div class="mg-strip"></div><div class="mg-inn-rooms">' + rooms + '</div><div class="mg-inn-tray">' + tray + '</div>');
    ctx.stage.appendChild(root);
    var cast = ctx.cast(root.children[0], ['nobu', 'shin', 'yasu', 'nana'], 'mg-cast-strip');
    cast.base(0, 'happy'); cast.base(1, 'neutral'); cast.base(2, 'neutral'); cast.base(3, 'smirk');
    var roomEls = root.querySelectorAll('.mg-room'), trayEls = root.querySelectorAll('.mg-tray-item');
    var G = [null, null, null, null, null, null], sel = null, tgt = null, t = 0, TOTAL = 75, spawnT = 1, score = 0, served = 0, lost = 0, rep = 3, streak = 0, ended = false, grumpyServed = 0;
    // Depth: a streak pays out in tips, Nobu's mass apology spends the streak to buy everyone patience, and halfway through a tour bus arrives.
    var bow = 0, bus = false, bows = 0, bowB = root.querySelector('.mg-inn-bow'), bowI = bowB.firstChild;
    function drawBow() { bowI.style.height = Math.round(bow * 100) + '%'; bowB.classList.toggle('ready', bow >= 1); bowB.disabled = bow < 1; }

    function hud() { ctx.setScore('SCORE <b>' + score + '</b> &middot; ' + new Array(rep + 1).join('&hearts;') + ' &middot; ' + Math.max(0, Math.ceil(TOTAL - t)) + 's'); }
    function paint(r) {
      var g = G[r], el0 = roomEls[r], gu = el0.querySelector('.mg-guest');
      el0.classList.toggle('busy', !!g); el0.classList.toggle('grumpy', !!(g && g.grumpy));
      if (!g) { gu.innerHTML = ''; el0.querySelector('.mg-want').innerHTML = ''; return; }
      gu.innerHTML = guestSVG(g.look, g.mood, g.grumpy); el0.querySelector('.mg-want').innerHTML = INN_ITEMS[g.want].svg + (g.want2 ? '<em>+1</em>' : '');
    }
    function mult() { return 1 + Math.min(3, Math.floor(streak / 4)); }
    function selectTray(k) { sel = k; trayEls.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-k') === k); }); }
    function spawn() {
      var free = []; for (var r = 0; r < 6; r++) if (!G[r]) free.push(r); if (!free.length) return;
      var r2 = pick(free), grumpy = t > 8 && Math.random() < 0.18, two = bus && Math.random() < 0.55, base = Math.max(12, 20 - t * 0.09) * (grumpy ? 0.8 : 1) * (two ? 1.35 : 1);
      G[r2] = { want: pick(INN_KEYS), want2: two ? pick(INN_KEYS) : null, pat: base, max: base, look: Math.floor(Math.random() * 20), mood: 0, grumpy: grumpy };
      paint(r2); sfx('click');
    }
    function leave(r, happy) {
      var el0 = roomEls[r]; el0.classList.add(happy ? 'happy' : 'mad'); G[r] = null;
      ctx.later(function () { el0.classList.remove('happy'); el0.classList.remove('mad'); paint(r); }, 450);
    }
    function deliver(r) {
      var g = G[r]; if (!g || !ctx.playing || ended) return;
      if (!sel) { tgt = r; roomEls.forEach(function (x, j) { x.classList.toggle('tgt', j === r); }); sfx('click'); return; }
      if (sel === g.want && g.want2) { // first course of a two-item order
        g.want = g.want2; g.want2 = null; g.pat = Math.min(g.max, g.pat + 4); score += 8; sfx('good'); paint(r); selectTray(null); hud(); return;
      }
      if (sel === g.want) {
        var pts = (10 + Math.round(g.pat / g.max * 10)) * mult(), who = INN_OK[sel][0];
        if (g.grumpy) { pts += 30; grumpyServed++; cast.react(3, 'smirk', pick(INN_NANA), 2400); }
        else cast.react(['nobu', 'shin', 'yasu'].indexOf(who[0]), 'happy', who[1], 2400);
        streak++; served++; score += pts; bow = Math.min(1, bow + 0.25); drawBow(); sfx(g.grumpy ? 'cheer' : 'perfect'); leave(r, true);
        var fp = el('div', 'mg-float', '+' + pts); roomEls[r].appendChild(fp); ctx.later(function () { if (fp.parentNode) fp.parentNode.removeChild(fp); }, 900);
        selectTray(null);
      } else {
        g.pat = Math.max(0, g.pat - 3); streak = 0; sfx('miss'); cast.react(0, 'shock', pick(INN_WRONG), 2200);
      }
      hud();
    }
    function trayTap(k) {
      if (!ctx.playing || ended) return;
      if (tgt !== null && G[tgt]) { var keep = tgt; selectTray(k); tgt = null; roomEls.forEach(function (x) { x.classList.remove('tgt'); }); deliver(keep); return; }
      selectTray(sel === k ? null : k); sfx('click');
    }
    ctx.on(root.children[1], 'pointerdown', function (e) { var r = e.target.closest && e.target.closest('.mg-room'); if (r) { e.preventDefault(); deliver(+r.getAttribute('data-r')); } });
    function apologise() {
      if (!ctx.playing || ended || bow < 1) return;
      bow = 0; bows++; streak = 0; drawBow(); sfx('select');
      for (var q = 0; q < 6; q++) if (G[q]) { G[q].pat = Math.min(G[q].max, G[q].pat + G[q].max * 0.5); }
      cast.react(0, 'shock', pick(['I AM SO SORRY! ALL OF YOU! IN ADVANCE!', 'On behalf of my family, my band, and this tea: SORRY!', 'Nobu bows so low he finds a lost slipper.']), 2300);
      cast.react(1, 'neutral', 'He does this at restaurants too.', 2300);
    }
    ctx.on(bowB, 'pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); apologise(); });
    ctx.on(root.children[2], 'pointerdown', function (e) { var b = e.target.closest && e.target.closest('.mg-tray-item'); if (b) { e.preventDefault(); trayTap(b.getAttribute('data-k')); } });

    function finishNow() {
      var stars = score >= 1100 ? 3 : score >= 600 ? 2 : score >= 220 ? 1 : 0;
      ctx.finish({ title: 'Shift report', score: score, stars: stars, effects: { harmony: stars, bond: stars },
        html: '<div class="mg-stats"><span>Guests served <b>' + served + '</b></span><span>Walked out <b>' + lost + '</b></span><span>Scared into tipping <b>' + grumpyServed + '</b></span><span>Mass apologies <b>' + bows + '</b></span></div>' });
    }
    function update(dt) {
      if (ended) return; t += dt;
      if (!bus && t >= TOTAL * 0.45) { bus = true; sfx('boo'); cast.react(0, 'shock', 'A TOUR BUS! Two things each! Mum said NOTHING about a bus!', 2600); cast.react(2, 'neutral', 'I will carry them. Do not thank me. Do bring more towels.', 2600); }
      spawnT -= dt; if (spawnT <= 0 && t < TOTAL - 4) { spawn(); spawnT = Math.max(2.0, 3.6 - t * 0.028) * rr(0.8, 1.2); }
      for (var r = 0; r < 6; r++) {
        var g = G[r]; if (!g) continue; g.pat -= dt;
        var f = Math.max(0, g.pat / g.max), m = f > 0.55 ? 0 : f > 0.25 ? 1 : 2;
        roomEls[r].querySelector('.mg-pat i').style.width = (f * 100).toFixed(0) + '%';
        if (m !== g.mood) { g.mood = m; paint(r); if (m === 2) cast.react(0, 'shock', 'Room ' + (r + 1) + ' looks upset!', 1500); }
        if (g.pat <= 0) { lost++; rep--; streak = 0; sfx('boo'); leave(r, false); cast.react(0, 'sad', 'They left! The review is going to be one star!', 2000); if (rep <= 0) { ended = true; ctx.later(finishNow, 900); } }
      }
      if (t >= TOTAL) { ended = true; ctx.later(finishNow, 400); }
      hud();
    }
    return { begin: function () { hud(); cast.say(0, 'Welcome to the family inn! Please be normal!', 2600); drawBow(); }, update: update, destroy: function () { G = []; } };
  }

  /* =====================================================================
     10. NAOKI'S SANDWICH HEIST
     ===================================================================== */
  var DISGUISES = [
    ['a potted plant', '<path d="M120 60 q-30 -50 -10 -80 q30 20 30 70 q30 -60 70 -50 q-10 50 -60 70 q50 -30 90 -10 q-20 40 -90 30Z" fill="#3c9a4a" stroke="#0d0b0c" stroke-width="5"/>'],
    ['a traffic cone', '<path d="M200 -20 L260 90 H140Z" fill="#ff7a1a" stroke="#0d0b0c" stroke-width="5"/><path d="M178 30 H222 M165 60 H235" stroke="#fff" stroke-width="10"/>'],
    ['a fake moustache', '<path d="M140 190 Q170 165 200 188 Q230 165 260 190 Q230 212 200 200 Q170 212 140 190Z" fill="#17141a"/><rect x="130" y="110" width="140" height="34" rx="10" fill="#17141a"/>'],
    ['a chef', '<rect x="150" y="30" width="100" height="40" fill="#fff" stroke="#0d0b0c" stroke-width="5"/><circle cx="160" cy="25" r="30" fill="#fff" stroke="#0d0b0c" stroke-width="5"/><circle cx="200" cy="10" r="34" fill="#fff" stroke="#0d0b0c" stroke-width="5"/><circle cx="242" cy="25" r="30" fill="#fff" stroke="#0d0b0c" stroke-width="5"/>'],
    ['a pink wig', '<path d="M100 130 Q90 20 200 18 Q310 20 300 130 L320 260 L270 200 L130 200 L80 260Z" fill="#ff6fa3" stroke="#0d0b0c" stroke-width="5"/>'],
    ['a cardboard box', '<path d="M90 90 H310 V300 H90Z" fill="#c9985a" stroke="#0d0b0c" stroke-width="6"/><path d="M90 90 L200 60 L310 90" fill="#dcae72" stroke="#0d0b0c" stroke-width="6"/><rect x="130" y="115" width="140" height="22" fill="#0d0b0c"/>'],
    ['sunglasses and a beard', '<rect x="125" y="112" width="68" height="34" rx="10" fill="#0d0b0c"/><rect x="207" y="112" width="68" height="34" rx="10" fill="#0d0b0c"/><path d="M130 190 Q200 290 270 190 Q240 250 200 250 Q160 250 130 190Z" fill="#5a3b2a" stroke="#0d0b0c" stroke-width="5"/>'],
    ['a lampshade', '<path d="M130 20 L270 20 L300 100 L100 100Z" fill="#f3e6b0" stroke="#0d0b0c" stroke-width="5"/>']
  ];
  var NAOKI_OW = ['Ow! Worth it!', 'I was NOT here.', 'It is for a friend. The friend is me.', 'Rude! Also, fair.', 'That sandwich was a gift from the universe!'];
  var NAOKI_STEAL = ['Mmmf! Delicious!', 'Thanks for the lunch!', 'Heist: successful. Mayo: also.', 'NOM. (That was a thank-you.)'];
  var NANA_SW = ['Is that a plant. It is a plant. It is Naoki.', 'Do not feed the drummer.', 'There is a traffic cone at the buffet. Good luck.', 'He has a moustache. It is crooked. Whack.'];
  function naokiSVG(ex, dis) {
    var mouth = ex === 'shock' ? '<ellipse cx="200" cy="215" rx="22" ry="26" fill="#7a1020" stroke="#0d0b0c" stroke-width="5"/>' : '<path d="M150 190 Q200 262 250 190Z" fill="#fff" stroke="#0d0b0c" stroke-width="6" stroke-linejoin="round"/>';
    var eyes = ex === 'shock' ? '<circle cx="160" cy="140" r="14" fill="#fff" stroke="#0d0b0c" stroke-width="5"/><circle cx="240" cy="140" r="14" fill="#fff" stroke="#0d0b0c" stroke-width="5"/>' : '<path d="M140 142 Q160 118 180 142 M220 142 Q240 118 260 142" fill="none" stroke="#0d0b0c" stroke-width="8" stroke-linecap="round"/>';
    return '<svg class="ng-portrait" xmlns="http://www.w3.org/2000/svg" viewBox="10 -14 380 574" aria-hidden="true"><path d="M70 574 Q80 330 200 300 Q320 330 330 574Z" fill="#ff6fa3" stroke="#0d0b0c" stroke-width="6"/>' +
      '<path d="M90 120 L80 20 L140 70 L170 -10 L210 60 L260 -6 L270 70 L320 20 L312 120Z" fill="#e8c14a" stroke="#0d0b0c" stroke-width="6" stroke-linejoin="round"/>' +
      '<ellipse cx="200" cy="160" rx="112" ry="122" fill="#f6d7bd" stroke="#0d0b0c" stroke-width="6"/><circle cx="168" cy="190" r="0"/>' + eyes + mouth +
      '<circle cx="118" cy="190" r="14" fill="#ff6fa3" opacity=".5"/><circle cx="282" cy="190" r="14" fill="#ff6fa3" opacity=".5"/>' + (dis != null ? DISGUISES[dis][1] : '') + '</svg>';
  }

  function sandwich(ctx) {
    var cells = '', i;
    for (i = 0; i < 9; i++) cells += '<div class="mg-cell" data-c="' + i + '"><div class="mg-hole"><div class="mg-pop"></div></div><div class="mg-nom">NOM</div></div>';
    var root = el('div', 'mg-sw', '<div class="mg-strip"></div><div class="mg-sw-bar"><div class="mg-sw-left"></div><button type="button" class="mg-sw-bait" tabindex="-1">BAIT</button></div><div class="mg-sw-grid">' + cells + '</div>');
    ctx.stage.appendChild(root);
    var cast = ctx.cast(root.children[0], ['nana', 'naoki'], 'mg-cast-strip'); cast.base(0, 'smirk'); cast.base(1, 'happy');
    var leftEl = root.querySelector('.mg-sw-left'), baitB = root.querySelector('.mg-sw-bait'), gridEl = root.querySelector('.mg-sw-grid'), cellEls = root.querySelectorAll('.mg-cell');
    var P = [], t = 0, TOTAL = 60, spawnT = 0.5, sand = 10, MAXS = 10, score = 0, streak = 0, hits = 0, stolen = 0, bad = 0, ended = false;
    // Depth: spend a sandwich as bait for double points and slower grabs; at the halfway mark it becomes a costume party and everyone is in disguise.
    var baitT = 0, baited = 0, party = false;

    function drawSand() { var h = ''; for (var k = 0; k < MAXS; k++) h += '<span class="mg-sand' + (k < sand ? '' : ' gone') + '"></span>'; leftEl.innerHTML = h; }
    function hud() { ctx.setScore('SCORE <b>' + score + '</b> &middot; SANDWICHES <b>' + sand + '</b> &middot; ' + Math.max(0, Math.ceil(TOTAL - t)) + 's'); }
    function hide(c) { cellEls[c].classList.remove('up'); ctx.later(function () { if (!P[c]) cellEls[c].classList.remove('hit', 'stole', 'oops'); }, 600); }
    function spawn() {
      var free = []; for (var k = 0; k < 9; k++) if (!P[k]) free.push(k); if (!free.length || free.length < 7) return;
      var c = pick(free), decoy = t > 5 && Math.random() < (party ? 0.34 : 0.22), who = decoy ? pick(['reira', 'shin']) : 'naoki';
      var masked = who === 'naoki' ? Math.random() < 0.6 : party && Math.random() < 0.75;
      var p = { who: who, dur: Math.max(1.4, 2.3 - t * 0.012) * (baitT > 0 && who === 'naoki' ? 1.4 : 1), t: 0, dis: masked ? Math.floor(Math.random() * DISGUISES.length) : 0, plain: !masked, hit: false };
      P[c] = p; show2(c, p);
      if (p.who === 'naoki' && masked && Math.random() < 0.25) cast.react(0, 'smirk', 'That is ' + DISGUISES[p.dis][0] + '. It is Naoki.', 1800);
    }
    function show2(c, p) {
      var pop = cellEls[c].querySelector('.mg-pop');
      if (p.who === 'naoki') pop.innerHTML = '<div class="mg-face mg-popface">' + naokiSVG('happy', p.plain ? null : p.dis) + '</div>';
      else pop.innerHTML = faceBox(p.who, 'happy', 'mg-popface').replace('</svg>', (p.plain ? '' : DISGUISES[p.dis][1]) + '</svg>');
      cellEls[c].classList.add('up'); cellEls[c].classList.remove('hit', 'stole', 'oops');
    }
    function drawBait() { baitB.textContent = baitT > 0 ? 'BAITED ' + Math.ceil(baitT) : 'BAIT -1'; baitB.disabled = baitT > 0 || sand <= 1 || ended; }
    function setBait() {
      if (!ctx.playing || ended || baitT > 0 || sand <= 1) return;
      sand--; baited++; baitT = 7; drawSand(); drawBait(); sfx('select');
      cast.react(0, 'smirk', 'Leave one out. He cannot help himself. Double points.', 2000); cast.react(1, 'happy', 'Is that one... for me?', 2000);
    }
    ctx.on(baitB, 'pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); setBait(); });
    ctx.on(window, 'keydown', function (e) { if (e.key === ' ' && !e.repeat) { if (ctx.playing) e.preventDefault(); setBait(); } });
    ctx.on(gridEl, 'pointerdown', function (e) {
      if (!ctx.playing || ended) return;
      var ce = e.target.closest && e.target.closest('.mg-cell'); if (!ce) return; e.preventDefault();
      var c = +ce.getAttribute('data-c'), p = P[c]; if (!p || p.hit) return;
      p.hit = true;
      if (p.who === 'naoki') {
        hits++; streak++; var pts = 10 * (1 + Math.floor(streak / 5)) * (baitT > 0 ? 2 : 1); score += pts; sfx('good');
        ce.classList.add('hit'); cast.react(1, 'shock', pick(NAOKI_OW), 1500); if (streak % 5 === 0) cast.react(0, 'happy', 'Streak of ' + streak + '. I am almost impressed.', 1800);
      } else {
        bad++; streak = 0; sand = Math.max(0, sand - 1); score = Math.max(0, score - 20); sfx('miss'); ce.classList.add('oops'); drawSand();
        cast.react(0, 'shock', p.who === 'reira' ? 'You hit Reira. In the costume. Why would you do that.' : pick(['You hit Shin. He did not blink. That is worse.', 'Shin wants it noted that he is only here for the sandwiches.']), 2200);
        if (sand <= 0) endGame();
      }
      ctx.later(function () { hide(c); P[c] = null; }, 280); hud();
    });
    function endGame() { if (ended) return; ended = true; ctx.later(finishNow, 800); }
    function finishNow() {
      var stars = score >= 1100 ? 3 : score >= 350 ? 2 : score >= 90 ? 1 : 0; if (sand <= 0) stars = Math.min(stars, 1);
      ctx.finish({ title: 'Catering report', score: score, stars: stars, effects: { fame: stars },
        html: '<div class="mg-stats"><span>Naoki whacked <b>' + hits + '</b></span><span>Sandwiches left <b>' + sand + '/' + MAXS + '</b></span><span>Wrong faces <b>' + bad + '</b></span><span>Baits <b>' + baited + '</b></span></div>' });
    }
    function update(dt) {
      if (ended) return; t += dt; spawnT -= dt;
      if (baitT > 0) { baitT -= dt; drawBait(); if (baitT <= 0) { baitT = 0; drawBait(); } }
      if (!party && t >= TOTAL * 0.45) { party = true; sfx('boo'); cast.react(0, 'neutral', 'Costume party. Look at the faces. Reira will not forgive a second one.', 2800); cast.react(1, 'happy', null, 2800); }
      var active = P.filter(Boolean).length;
      if (spawnT <= 0 && t < TOTAL - 1 && active < 3) { spawn(); spawnT = Math.max(0.85, 1.25 - t * 0.008) * rr(0.8, 1.15); }
      for (var c = 0; c < 9; c++) {
        var p = P[c]; if (!p || p.hit) continue; p.t += dt;
        if (p.t >= p.dur) {
          if (p.who === 'naoki') {
            stolen++; streak = 0; sand = Math.max(0, sand - 1); sfx('boo'); cellEls[c].classList.add('stole'); drawSand();
            cast.react(1, 'happy', pick(NAOKI_STEAL), 1500);
            if (sand <= 0) endGame();
          }
          (function (cc) { ctx.later(function () { hide(cc); P[cc] = null; }, p.who === 'naoki' ? 350 : 0); })(c); p.hit = true;
        }
      }
      if (t >= TOTAL) endGame();
      hud();
    }
    drawSand(); drawBait();
    return { begin: function () { hud(); drawBait(); cast.say(0, 'Guard the sandwiches. Tap Naoki. Do NOT tap Reira or Shin.', 3000); }, update: update, destroy: function () { P = []; } };
  }

  /* ---------- registry ---------- */
  function define(def, make) {
    def.start = function (container, opts) { return runGame(def, container, opts, make); };
    NG.Minigames[def.id] = def;
  }
  NG.Minigames = NG.Minigames || {};

  define({
    id: 'shortcake', cast: { how: { faces: [['hachi', 'happy'], ['nana', 'smirk']], say: 'It is for the housewarming, so it has to be perfect. Or at least standing!' },
      res: { faces: ['hachi', 'nana'], ex: [['sad', 'smirk'], ['neutral', 'neutral'], ['happy', 'smirk'], ['happy', 'happy']],
        say: ['It fell over. I fell over. We are both fine.', 'It is... rustic, right? Rustic is a thing!', 'Look at it! It is a cake and I made it!', 'Nana, say something. Nana? Are you crying?'] } }, title: 'Strawberry Shortcake Stack',
    howto: 'Hachi is baking for the Room 707 housewarming, and gravity is not a fan. Drop each sponge layer on the stack; overhang gets sliced off. Land dead-centre for a strawberry, a streak and some width back. Higher layers pay more, but the cake only counts in full if you SERVE it before it falls. Once Nana is home, every third layer is black: land it clean for triple points, or lose extra. The ceiling is 30 layers.',
    controls: 'Tap, Space or Enter to drop &nbsp;&middot;&nbsp; Serve it button or E to bank',
    lines: [
      ['That is not a cake, that is a landslide with frosting. Hachi serves it anyway, with a spoon and a smile.', 'The cake leans like a tourist reading a map. Nobody mentions it.'],
      ['A cake! Technically! Nana eats a slice and says "interesting" in a very careful voice.', 'It stands. It tilts. It is full of love and structural doubt.'],
      ['Tall, pink, and only slightly haunted. The neighbours ask for the recipe.', 'Room 707 applauds. One strawberry rolls away to start a new life.'],
      ['A tower of glory. Hachi names it "Nana Mk. II" and refuses to cut it.', 'Bakery legend. Someone asks if it is available for weddings. Hachi blushes in three colours.']
    ]
  }, shortcake);

  define({
    id: 'redflag', cast: { how: { faces: [['hachi', 'happy'], ['nana', 'angry']], say: 'He looked at me across the street. Like a movie. A GOOD movie.' },
      res: { faces: ['hachi', 'nana'], ex: [['sad', 'angry'], ['shock', 'neutral'], ['happy', 'smirk'], ['happy', 'smirk']],
        say: ['He had a snake called Mommy. Mommy did not like me.', 'Wait, am I engaged? Did I get engaged?', 'I was careful this time! I was careful!', 'Radar online! Nana, you can stop sighing now.'] } }, title: 'Love at First Sight Radar',
    howto: 'Hachi has fallen in love at first sight. AGAIN. Take your time and read each suitor: RUN from the red flags, LOVE the rare decent human. Some look fine and are not, and some look awful and are lovely. Ask Nana twice per game (half points), three heartbreaks end it, and later the Demon Lord turns up in disguise. Spot his tell and RUN, or he swaps your left and right.',
    controls: 'Swipe the card or tap the buttons &nbsp;&middot;&nbsp; &larr; / A = RUN, &rarr; / D = LOVE, &uarr; / W = Ask Nana',
    lines: [
      ['Hachi agrees to a date with a man who owns zero chairs. Nana sighs from the next room, loudly, like a kettle.', 'Heartbroken, but weirdly optimistic. Standard Hachi.'],
      ['A few close calls and one questionable towel. Hachi is hopeful, slightly bruised, and checking her phone.', 'Passable radar. Please do not let her date anyone with a "concept".'],
      ['Strong radar! Hachi only got mildly engaged to a stranger. Progress!', 'Red flags: dodged. Ice cream: earned.'],
      ['Flawless instincts. The Demon Lord is furious. A genuinely decent man gets a ride home and a snack.', 'The radar is online, the heart is armoured, and the towel guy never stood a chance.']
    ]
  }, redflag);

  define({
    id: 'scandal', cast: { how: { faces: [['nana', 'smirk'], ['hachi', 'happy']], say: 'They want a photo? They can have the back of my head.' },
      res: { faces: ['nana', 'hachi'], ex: [['angry', 'shock'], ['neutral', 'sad'], ['smirk', 'happy'], ['smirk', 'happy']],
        say: ['Great. Front page. Again.', 'A couple of shots. I have had worse hair days.', 'Barely a smudge. Fine.', 'Ghost mode. Taxi, please.'] } }, title: 'Scandal Run',
    howto: 'Night, Tokyo, paparazzi everywhere. Sneak Nana through four streets to the taxi at the far end. Stay out of the flash cones; a few seconds in the light and it is a photo. Hide behind vending machines, vans and crowds, duck into alleys, and grab disguises. Each street has a demo CD lying somewhere you would rather not stand. From street three a reporter on a scooter hunts you; break his line of sight. Tomorrow\'s front page is up to you.',
    controls: 'Arrows / WASD to move &nbsp;&middot;&nbsp; or drag anywhere on touch',
    lines: [['...'], ['...'], ['...'], ['...']]
  }, scandal);

  define({
    id: 'crowdsurf', cast: { how: { faces: [['nana', 'smirk'], ['hachi', 'happy']], say: 'I jump, they catch me. They had better catch me.' },
      res: { faces: ['nana', 'hachi'], ex: [['shock', 'shock'], ['neutral', 'happy'], ['smirk', 'happy'], ['happy', 'happy']],
        say: ['The floor was colder than advertised.', 'Not my best landing. Again.', 'Not bad. Do it again.', 'Best gig I ever played without a stage.'] } }, title: 'Crowd Surf',
    howto: 'Nana has leapt off the stage. Keep the raised hands under her: catch her in the centre and she goes straight up, catch her on the edge and she drifts. Three clean centre catches in a row launch her into the lights. Land in the moving spotlight for double points, finish fan requests, and fill the BLAST meter for five glorious slow-motion seconds. Dodge beer and security. A strawberry glass gives back a heart, and on your last life Nobu will dive in once.',
    controls: '&larr; &rarr; / A D to move, Space for BLAST &nbsp;&middot;&nbsp; or drag, and tap BLAST',
    lines: [
      ['Nana meets the floor with great artistic commitment. The crowd claps for the effort.', 'A very short flight. A very long apology.'],
      ['She stays up for a while. A beer cup is mostly supportive, in a wet way.', 'Respectable. The hands were slightly sticky but sincere.'],
      ['Nana floats like a bad decision with great hair. The crowd is in love.', 'Big air, bigger attitude. Security takes notes on how to be less annoying.'],
      ['Legend. The crowd carries her out like a very loud, very cool parade float.', 'Gravity files a complaint. Nana files it under "later".']
    ]
  }, crowdsurf);

  define({
    id: 'padlock', cast: { how: { faces: [['ren', 'neutral'], ['nana', 'neutral']], say: 'It took me years to learn that lock. Do not rush it.' },
      res: { faces: ['ren', 'nana'], ex: [['sad', 'sad'], ['neutral', 'neutral'], ['smirk', 'smirk'], ['happy', 'happy']],
        say: ['Some locks need more than one try.', 'Close. The lock is still thinking.', 'Almost. It wanted you to get there.', '...Thanks.'] } }, title: 'The Padlock',
    howto: 'A heavy old padlock, four tumblers, one pattern. Listen to the tumblers sing, then play the pattern back. Each cleared round sets a pin and adds a note. Later tumblers must be played backwards or hide a note you have to remember. Hum it again twice if you need to. Three slips and it stays shut. Open it clean and something quiet and heavy finally lets go.',
    controls: 'Tap the pads &nbsp;&middot;&nbsp; D F J K or arrows &nbsp;&middot;&nbsp; H or Space to hum',
    lines: [['...'], ['...'], ['...'], ['...']]
  }, padlock);

  define({
    id: 'cups', title: 'Keep Your Eyes on the Cup',
    cast: { how: { faces: [['demon', 'smirk'], ['hachi', 'shock']], say: 'One strawberry glass. Three hats. What could possibly go wrong? Everything. Everything could.' },
      res: { faces: ['hachi', 'demon'], ex: [['sad', 'smirk'], ['shock', 'smirk'], ['happy', 'angry'], ['happy', 'shock']],
        say: ['I lost the glass. I lost it to a HAT.', 'I got a few! Mostly by panicking correctly.', 'We beat the Demon Lord at hats!', 'He is pretending it did not happen. He is sulking in a hat.'] } },
    howto: 'The Demon Lord hides Hachi\'s strawberry glass under a black top hat, then shuffles with unreasonable confidence. Follow the glass, tap the right hat. Each win goes in the pot: bank it, or let it ride for double and lose it all on a miss. More hats every round, theatrical fake-outs, and later he somehow has two glasses. Three wrong guesses and the show is over.',
    controls: 'Tap the hat you think hides the glass',
    lines: [['The Demon Lord wins at hats. He wanted this. He will mention it for weeks.', 'Out of hats, out of luck, out of dignity.'], ['A few right guesses and a lot of loud panicking. Honest work.', 'Not bad. The hats have been told to try harder.'], ['Solid eyes! The Demon Lord claims the glass was "too easy to follow".', 'You followed the glass through a storm of fake-outs. Hachi cries with pride.'], ['The glass was never in doubt. The Demon Lord throws his hat. It is the wrong hat.', 'Perfect eyes. Somewhere a magician gives up and becomes an accountant.']]
  }, cups);

  define({
    id: 'fitcheck', title: 'Fit Check',
    cast: { how: { faces: [['nana', 'smirk'], ['hachi', 'happy']], say: 'It is sale day. Everyone wants to look like something. You are the shop assistant now. Good luck.' },
      res: { faces: ['nana', 'hachi'], ex: [['angry', 'sad'], ['neutral', 'neutral'], ['smirk', 'happy'], ['happy', 'happy']],
        say: ['I would not wear any of that to my own funeral.', 'Fine. Nobody will be arrested.', 'I would be seen with that. Do not make it weird.', 'Okay. You can work here. Do not tell Hachi I said that.'] } },
    howto: 'Punk boutique, sale day. Four clients, each with a style brief, a budget, and one thing they refuse to wear. Match their tags across all four slots, spend less for a bonus, then hit Done. Plenty of time. The third client will change their mind halfway through, because of course they will. Nana delivers the verdict. Deadpan.',
    controls: 'Tap a category, tap a piece, tap Done',
    lines: [['The clients leave in silence. One of them is carrying their old clothes. In a bag. Quickly.', 'The shop has a policy of no refunds. It has never been more needed.'], ['Mostly wearable. Mostly. The belt is a strong opinion.', 'A passable day. Nobody cried. Not in the shop, anyway.'], ['Good eye. The clients paid and did not look back.', 'A strong day. Someone asked if you were hiring. You were not.'], ['A legend of the tartan rack. Nana pretends not to take notes.', 'Dressed everyone perfectly. The mirrors are nervous.']]
  }, fitcheck);

  define({
    id: 'objection', title: 'Objection!',
    cast: { how: { faces: [['yasu', 'neutral'], ['takumi', 'smirk']], say: 'I read the contract. All of it. I regret the contract. Stamp the bad parts.' },
      res: { faces: ['yasu', 'takumi'], ex: [['sad', 'smirk'], ['neutral', 'smirk'], ['smirk', 'angry'], ['smirk', 'shock']],
        say: ['We signed. We now belong to a sandwich.', 'Passable. We keep our names, mostly.', 'Good. Most of the evil is gone.', 'Zero evil clauses survived. I am almost smiling. Do not look.'] } },
    howto: 'Yasu, former lawyer, is reviewing a major-label contract. Clauses drift toward the signature line. Stamp the evil ones, leave the fair ones. Stamp right at the last second for double points. A streak of five earns a RECESS that freezes the page. Halfway through, Takumi adds fine print that sounds lovely and is not. Three evil clauses signed and the band is doomed.',
    controls: 'Tap evil clauses. Ignore the fair ones.',
    lines: [['The contract is signed. Takumi gets a very large pen. Everyone else gets a very small van.', 'Doomed. But with excellent paperwork.'], ['Some evil got through. The band retains the right to complain about it.', 'Half the contract is gone. The other half is mostly a banana costume.'], ['Strong objecting. The label\'s lawyer cries into a briefcase.', 'Nearly clean. Yasu nods once. That is a standing ovation.'], ['Not one evil clause survived. The label offers a new contract, with a clause saying "we are sorry".', 'Spotless. Yasu removes his glasses to polish them, which is the same as dancing.']]
  }, objection);

  define({
    id: 'inn', title: 'Nobu\'s Family Inn',
    cast: { how: { faces: [['nobu', 'shock'], ['nana', 'smirk']], say: 'My parents need help for one shift! Please do not break anything! Please be NORMAL!' },
      res: { faces: ['nobu', 'shin'], ex: [['sad', 'neutral'], ['shock', 'neutral'], ['happy', 'smirk'], ['happy', 'smirk']],
        say: ['My mother is going to find out about the oden.', 'We survived! Mostly! Nobody is on fire!', 'The guests are leaving smiling. Why does that feel suspicious?', 'My parents hired the whole band. I am so happy I could cry. Quietly.'] } },
    howto: 'The band is working a shift at Nobu\'s parents\' traditional inn. Guests want tea, towels, oden or a futon, and their patience is draining. Tap an item, then tap the guest. Streaks earn bigger tips. Serve enough and Nobu can apologise to the entire inn at once, buying everyone patience but ending your streak. Halfway through a tour bus arrives and guests want two things. Three walk-outs ruin the inn\'s reputation.',
    controls: 'Tap a tray item, then tap the guest who wants it',
    lines: [['The inn survives, technically. Nobu\'s mother says the word "interesting" in a very sharp way.', 'Too many walk-outs. The futons look disappointed.'], ['A decent shift. Only some of the tea was on the floor.', 'The guests got what they wanted, mostly. Nobu is sweating through his apron.'], ['A smooth shift! Shin is suspiciously good at this. Nobody knows why.', 'Yasu carried four futons, Nana scared a man into tipping, and the inn lives.'], ['The best shift the inn has ever seen. Nobu\'s father shakes everyone\'s hand twice.', 'Flawless service. Even the cat left a review. It was five stars and mostly hair.']]
  }, inn);

  define({
    id: 'sandwich', title: 'Naoki\'s Sandwich Heist',
    cast: { how: { faces: [['nana', 'smirk'], ['naoki', 'happy']], say: 'Backstage catering. A certain drummer is hungry. A certain drummer is in a plant.' },
      res: { faces: ['nana', 'naoki'], ex: [['angry', 'happy'], ['neutral', 'happy'], ['smirk', 'shock'], ['smirk', 'sad']],
        say: ['There are no sandwiches left. He is full and happy.', 'He ate a lot. We ate a little. Fair.', 'Good defence. He is limping and still smiling.', 'Not one sandwich lost. He is sulking in the corner. In a box.'] } },
    howto: 'Backstage catering! Naoki, Trapnest\'s cheerful drummer, keeps popping up to steal sandwiches, sometimes in silly disguises. Tap him before he grabs one. Do NOT tap Reira or Shin. Spend a sandwich as BAIT for seven seconds of double points and slower grabs. Halfway through it becomes a costume party, so check the faces. Your sandwiches are your health.',
    controls: 'Tap Naoki. Never tap Reira or Shin. BAIT button or Space.',
    lines: [['The table is bare. Naoki holds a single crust and a look of pure triumph.', 'Heist successful. For him. The sandwiches are in a happy place.'], ['A few sandwiches survive. Naoki waves from behind a lampshade.', 'A mixed result. The catering staff will not be told.'], ['A strong defence. Naoki leaves with only a pickle and his pride.', 'Most sandwiches saved. The drummer is somewhere with a traffic cone, plotting.'], ['A perfect table. Naoki bows to you from inside a cardboard box and leaves.', 'Not one sandwich stolen. Nana pays you in respect. Respect is rare.']]
  }, sandwich);
})();
