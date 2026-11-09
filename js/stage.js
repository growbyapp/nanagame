/* HEY, NANA - Room 707: staging. Entrances, emotes, camera moves, weather and prop close-ups for the visual novel.
   main.js owns the story; this file only moves things around it. Every effect is optional: if anything here fails,
   the dialogue still runs. One-shot motion uses the Web Animations API (transform and opacity only), loops are CSS. */
window.NG = window.NG || {};
(function () {
  'use strict';

  var INK = '#0d0b0c', INK2 = '#1d191b', PAPER = '#f3ece0', PAPER2 = '#e4d9c6', RED = '#d3122a', PINK = '#ff6fa3',
    STRAW = '#e8294f', GOLD = '#f4c430', SILVER = '#d5d9e0', SILVER_S = '#8d93a0', SKIN = '#fbe6d4', SKIN_S = '#e9bfa6', LINE = '#3a2f3a';

  /* ---------- small helpers ---------- */

  var uidN = 0;
  function uid() { uidN += 1; return 'st' + uidN + '-'; }
  function rng(seed) {
    var s = seed;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  function r1(v) { return Math.round(v * 10) / 10; }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function kill(n) { if (n && n.parentNode) n.parentNode.removeChild(n); }

  var vn = null, cam = null, shaker = null, veil = null, propLayer = null;
  var hooks = { skipping: function () { return false; }, sfx: function () {} };
  var slots = {}, cast = { left: null, right: null }, active = null;
  var running = [], timers = [];
  var fx = { zoom: false, black: null, spot: null, weather: null };
  var prop = null;
  var linesSinceMount = 0, sceneBusyUntil = 0;

  function now() { return Date.now(); }
  function fast() { try { return !!hooks.skipping(); } catch (e) { return false; } }
  function reducedMotion() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }
  function noFlash() { return !!(NG.settings && NG.settings.reduceFlash) || reducedMotion(); }
  // 1 = full motion, .5 = the player asked for less flashing, 0 = the system asked for reduced motion.
  function amp() { return reducedMotion() ? 0 : (NG.settings && NG.settings.reduceFlash) ? 0.5 : 1; }
  function sfx(name) { try { hooks.sfx(name); } catch (e) { /* sound is optional */ } }
  function later(fn, ms) {
    var t = setTimeout(function () { var i = timers.indexOf(t); if (i !== -1) timers.splice(i, 1); fn(); }, ms);
    timers.push(t);
    return t;
  }

  // One-shot animation. Skipped (the end state applies at once) when skipping or when the browser has no WAAPI.
  function anim(node, frames, opts, done) {
    if (!node || !node.animate || fast()) { if (done) done(); return null; }
    var a;
    try { a = node.animate(frames, opts); } catch (e) { if (done) done(); return null; }
    running.push(a);
    var over = false;
    var end = function () {
      if (over) return;
      over = true;
      var i = running.indexOf(a);
      if (i !== -1) running.splice(i, 1);
      if (done) done();
    };
    a.onfinish = end;
    a.oncancel = end;
    return a;
  }
  function fastForward() {
    running.slice().forEach(function (a) { try { a.finish(); } catch (e) { try { a.cancel(); } catch (e2) { /* gone */ } } });
    sync();
  }
  // Scale a translate/rotate amount by the motion level.
  function k(v) { return r1(v * amp()); }

  function sync() {
    if (!vn) return;
    vn.classList.toggle('st-fast', fast());
    vn.classList.toggle('st-noflash', noFlash());
    vn.classList.toggle('st-still', reducedMotion());
  }

  /* ---------- the stage itself ---------- */

  function attach(node, h) {
    reset();
    vn = node;
    if (h) for (var key in h) hooks[key] = h[key];
    cam = vn.querySelector('.vn-cam');
    shaker = vn.querySelector('.vn-shake');
    if (!cam || !shaker) { vn = null; return false; }
    veil = el('div', 'st-veil');
    propLayer = el('div', 'st-prop');
    var box = vn.querySelector('.vn-box');
    vn.insertBefore(veil, box);
    vn.insertBefore(propLayer, box);
    var portraits = shaker.querySelector('.vn-portraits');
    shaker.insertBefore(el('div', 'st-amb st-back'), portraits);
    shaker.appendChild(el('div', 'st-amb st-front'));
    findSlots();
    sync();
    return true;
  }
  function ready() { return !!(vn && cam && shaker); }
  function findSlots() {
    var p = shaker.querySelector('.vn-portraits');
    slots.left = p && p.querySelector('.portrait.left');
    slots.right = p && p.querySelector('.portrait.right');
  }
  function dirOf(side) { return side === 'left' ? 1 : -1; }

  function reset() {
    timers.forEach(clearTimeout);
    timers = [];
    running.slice().forEach(function (a) { try { a.cancel(); } catch (e) { /* gone */ } });
    running = [];
    prop = null;
    fx = { zoom: false, black: null, spot: null, weather: null };
    cast = { left: null, right: null };
    active = null;
    sceneBusyUntil = 0;
    if (!vn) return;
    clearCast();
    if (veil) veil.innerHTML = '';
    if (propLayer) propLayer.innerHTML = '';
    if (cam) { cam.style.transform = ''; cam.style.transformOrigin = ''; }
    vn.querySelectorAll('.st-out').forEach(kill);
  }

  function mounted() {
    linesSinceMount = 0;
    sync();
    // A soft open from black every time the story screen comes back (chapter cards, minigames, quizzes).
    if (!ready() || fast() || !veil) return;
    var b = el('div', 'st-black');
    veil.appendChild(b);
    anim(b, [{ opacity: 1 }, { opacity: 0 }], { duration: reducedMotion() ? 200 : 650, easing: 'ease-out' }, function () { kill(b); });
    if (!b.animate || fast()) kill(b);
  }

  function onLine() {
    linesSinceMount++;
    sync();
    if (prop && prop.docked) {
      if (prop.age >= 1) closeProp(); else prop.age++;
    }
  }

  /* ---------- characters ---------- */

  function portraitSvg(who, expr) {
    try { return NG.Art ? NG.Art.portrait(who, expr) : ''; } catch (e) { return ''; }
  }

  function makeActor(who, expr) {
    var c = { who: who, expr: expr, pose: null, actPose: null };
    c.actor = el('div', 'st-actor');
    c.poseEl = el('div', 'st-pose');
    c.emo = el('div', 'st-emo');
    c.idle = el('div', 'st-idle', portraitSvg(who, expr));
    c.emo.appendChild(c.idle);
    c.poseEl.appendChild(c.emo);
    c.actor.appendChild(c.poseEl);
    c.actor.dataset.who = who;
    c.actor.dataset.expr = expr;
    return c;
  }

  // Resting pose per expression: transform list kept in one shape so transitions interpolate cleanly.
  function poseFor(expr, d) {
    switch (expr) {
      case 'happy': return [0, -1, 0, 1, 1];
      case 'sad': return [d * -1, 2.6, d * -1.2, 0.985, 0.985];
      case 'angry': return [d * 1.6, -0.4, d * 0.8, 1.01, 1.01];
      case 'smirk': return [d * -0.8, 0, d * -1.8, 1, 1];
      case 'shock': return [0, -1.4, 0, 1.01, 1.01];
      default: return [0, 0, 0, 1, 1];
    }
  }
  var ACT_POSES = {
    'lean-in': function (d) { return [d * 7, -0.5, d * 3, 1.03, 1.03]; },
    'turn-away': function (d) { return [d * -5, 0.5, d * -1, -1, 1]; },
    collapse: function (d) { return [d * -2, 16, d * -5, 0.97, 0.95]; }
  };
  function poseCss(p) {
    var a = amp() || 0.25;
    return 'translate(' + r1(p[0] * a) + '%, ' + r1(p[1] * a) + '%) rotate(' + r1(p[2] * a) + 'deg) scale(' + p[3] + ', ' + p[4] + ')';
  }
  function applyPose(c, side, transition) {
    var d = dirOf(side);
    var p = c.actPose && ACT_POSES[c.actPose] ? ACT_POSES[c.actPose](d) : poseFor(c.expr, d);
    c.poseEl.style.transition = transition || '';
    c.poseEl.style.transform = poseCss(p);
  }

  function setExpr(c, expr) {
    if (c.expr === expr) return false;
    c.expr = expr;
    c.actor.dataset.expr = expr;
    var old = c.idle.firstElementChild;
    var next = el('div', 'st-swap', portraitSvg(c.who, expr)).firstElementChild;
    if (!next) return true;
    c.idle.appendChild(next);
    if (old) {
      // A 120 ms cross-fade hides the hard redraw between faces.
      if (old.animate && !fast()) {
        old.style.zIndex = 1;
        anim(old, [{ opacity: 1 }, { opacity: 0 }], { duration: 130, easing: 'linear' }, function () { kill(old); });
      } else kill(old);
    }
    return true;
  }

  function enterDelay() { return Math.max(0, sceneBusyUntil - now()); }

  function enter(c, side, delay) {
    var d = dirOf(side);
    var still = amp() === 0;
    anim(c.actor, still ? [{ opacity: 0 }, { opacity: 1 }] : [
      { opacity: 0, transform: 'translateX(' + (d * -34) + '%) rotate(' + (d * -2) + 'deg)' },
      { opacity: 1, offset: 0.55 },
      { opacity: 1, transform: 'translateX(' + (d * 1.5) + '%) rotate(0deg)', offset: 0.8 },
      { opacity: 1, transform: 'translateX(0) rotate(0deg)' }
    ], { duration: still ? 220 : 520, delay: delay || 0, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' });
  }

  function leave(c, side, onGone) {
    if (!c) return;
    var d = dirOf(side);
    c.actor.classList.add('st-leaving');
    var a = anim(c.actor, amp() === 0 ? [{ opacity: 1 }, { opacity: 0 }] : [
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: 'translateX(' + (d * -38) + '%)' }
    ], { duration: amp() === 0 ? 180 : 380, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' }, function () { kill(c.actor); if (onGone) onGone(); });
    if (!a) kill(c.actor);
  }

  function place(side, who, expr, delay) {
    var c = makeActor(who, expr);
    cast[side] = c;
    applyPose(c, side, 'none');
    if (slots[side]) slots[side].appendChild(c.actor);
    enter(c, side, delay);
    return c;
  }

  function sideOf(who) {
    if (cast.left && cast.left.who === who) return 'left';
    if (cast.right && cast.right.who === who) return 'right';
    return null;
  }

  function setActive(side) {
    var was = active;
    active = side;
    ['left', 'right'].forEach(function (s) { if (slots[s]) slots[s].classList.toggle('active', s === side); });
    if (fx.spot) aimSpot();
    return !!(side && was && was !== side);
  }

  function say(side, who, expr) {
    if (!ready() || !slots.left || !slots.right) return false;
    sync();
    expr = expr || 'neutral';
    var other = side === 'left' ? 'right' : 'left';
    // Nobody stands in two places at once: if they are already on the other side, they speak from there.
    if (cast[other] && cast[other].who === who && !(cast[side] && cast[side].who === who)) { side = other; }
    var c = cast[side], emote = null, entered = false;
    if (c && c.who === who) {
      if (setExpr(c, expr)) { emote = expr; applyPose(c, side); }
    } else {
      if (c) leave(c, side);
      c = place(side, who, expr, enterDelay());
      entered = true;
      if (expr !== 'neutral') emote = expr;
    }
    var turned = setActive(side);
    if (emote && emote !== 'neutral') emoteFor(c, side, emote, entered ? enterDelay() + 380 : 0);
    else if (turned && !entered) stepUp(c);
    return true;
  }

  function narrate() { setActive(null); return true; }

  function clearCast() {
    ['left', 'right'].forEach(function (s) {
      if (slots[s]) { slots[s].innerHTML = ''; slots[s].classList.remove('active'); delete slots[s].dataset.key; }
    });
    cast = { left: null, right: null };
    active = null;
    return true;
  }

  /* ---------- emotes: motion on the character plus small manga marks ---------- */

  function stepUp(c) {
    if (!amp()) return;
    anim(c.emo, [{ transform: 'translateY(0)' }, { transform: 'translateY(' + k(-1.4) + '%)' }, { transform: 'translateY(0)' }], { duration: 300, easing: 'ease-out' });
  }

  var MOVES = {
    jump: function (a) {
      return { f: [
        { transform: 'translateY(0) scale(1, 1)' },
        { transform: 'translateY(' + r1(1.5 * a) + '%) scale(1.02, .97)', offset: 0.12 },
        { transform: 'translateY(' + r1(-8 * a) + '%) scale(.985, 1.025)', offset: 0.42 },
        { transform: 'translateY(0) scale(1.02, .98)', offset: 0.78 },
        { transform: 'translateY(0) scale(1, 1)' }
      ], ms: 560, ease: 'ease-out' };
    },
    shake: function (a, d) {
      var x = function (v) { return 'translateX(' + r1(v * a) + '%) rotate(' + r1(v * a * 0.4 * d) + 'deg)'; };
      return { f: [{ transform: x(0) }, { transform: x(2.6) }, { transform: x(-2.6) }, { transform: x(2) }, { transform: x(-1.6) }, { transform: x(0.9) }, { transform: x(0) }], ms: 480, ease: 'linear' };
    },
    nod: function (a) {
      var y = function (v) { return 'translateY(' + r1(v * a) + '%) scale(1, ' + (1 - v * a * 0.004) + ')'; };
      return { f: [{ transform: y(0) }, { transform: y(2.2) }, { transform: y(0) }, { transform: y(1.6) }, { transform: y(0) }], ms: 820, ease: 'ease-in-out' };
    },
    sob: function (a) {
      var f = [];
      for (var i = 0; i <= 10; i++) f.push({ transform: 'translateY(' + r1((i % 2 ? 1.1 : 0) * a) + '%) scale(1, ' + (i % 2 ? 1 - 0.012 * a : 1) + ')' });
      return { f: f, ms: 1400, ease: 'ease-in-out' };
    },
    laugh: function (a, d) {
      var f = [];
      for (var i = 0; i <= 6; i++) f.push({ transform: 'translateY(' + r1((i % 2 ? -2.6 : 0) * a) + '%) rotate(' + r1((i % 2 ? 1.2 : -0.4) * a * d) + 'deg)' });
      return { f: f, ms: 980, ease: 'ease-in-out' };
    },
    happy: function (a) {
      return { f: [{ transform: 'translateY(0)' }, { transform: 'translateY(' + r1(-3 * a) + '%)' }, { transform: 'translateY(0)' }, { transform: 'translateY(' + r1(-1.4 * a) + '%)' }, { transform: 'translateY(0)' }], ms: 620, ease: 'ease-out' };
    },
    sad: function (a) {
      return { f: [{ transform: 'translateY(' + r1(-1 * a) + '%) scale(1, 1.01)' }, { transform: 'translateY(0) scale(1, 1)' }], ms: 1100, ease: 'ease-in-out' };
    },
    smirk: function (a, d) {
      return { f: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(' + r1(-2.4 * a * d) + 'deg)', offset: 0.4 }, { transform: 'rotate(0deg)' }], ms: 560, ease: 'ease-out' };
    }
  };
  MOVES.shock = MOVES.jump;
  MOVES.angry = MOVES.shake;

  function play(c, side, move, delay) {
    var m = MOVES[move];
    if (!m || !c || !amp()) return;
    var x = m(amp(), dirOf(side));
    anim(c.emo, x.f, { duration: x.ms, easing: x.ease, delay: delay || 0 });
  }

  // Marks are drawn in the portrait's own coordinates, so they sit on the head in every layout.
  function marksSvg(c, inner) {
    var svg = c.idle.querySelector('svg');
    var vb = (svg && svg.getAttribute('viewBox')) || '30 58 340 450';
    return '<svg class="st-marks" xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" preserveAspectRatio="xMidYMax meet" aria-hidden="true">' + inner + '</svg>';
  }
  function burstLines(cx, cy, r0, r1x, from, to, n) {
    var d = '';
    for (var i = 0; i < n; i++) {
      var t = (from + (to - from) * (i / (n - 1))) * Math.PI / 180;
      var len = r1x + ((i * 37) % 3) * 18;
      d += 'M' + r1(cx + Math.cos(t) * r0) + ' ' + r1(cy + Math.sin(t) * r0) + 'L' + r1(cx + Math.cos(t) * len) + ' ' + r1(cy + Math.sin(t) * len);
    }
    return '<path d="' + d + '" stroke="' + INK + '" stroke-width="9" stroke-linecap="round" opacity=".7"/><path d="' + d + '" stroke="' + PAPER + '" stroke-width="4" stroke-linecap="round"/>';
  }
  function sparkle(x, y, s, col) {
    return '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M0 -12L3 -3L12 0L3 3L0 12L-3 3L-12 0L-3 -3Z" fill="' + col + '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>';
  }
  var MARKS = {
    shock: function (d) {
      var x = 200 + d * 96;
      return burstLines(200, 214, 150, 205, -168, -12, 13) +
        '<g transform="translate(' + x + ' 116) rotate(' + (d * 12) + ')"><path d="M-14 -26L14 -26L6 10L-6 10Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/><circle cy="22" r="7" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="4"/></g>';
    },
    jump: function () { return burstLines(200, 214, 150, 200, -160, -20, 9); },
    angry: function (d) {
      var x = 200 + d * 74;
      var arc = 'M-4 -14C-4 -6 -6 -4 -14 -4M4 -14C4 -6 6 -4 14 -4M-4 14C-4 6 -6 4 -14 4M4 14C4 6 6 4 14 4';
      return '<g transform="translate(' + x + ' 132) scale(1.5)"><path d="' + arc + '" fill="none" stroke="' + INK + '" stroke-width="6.5" stroke-linecap="round"/><path d="' + arc + '" fill="none" stroke="' + RED + '" stroke-width="3.6" stroke-linecap="round"/></g>';
    },
    sad: function (d) {
      var s = '';
      [-34, -14, 6, 26].forEach(function (o, i) {
        var x = 200 + d * 10 + o;
        s += '<path d="M' + x + ' ' + (88 - (i % 2) * 10) + 'q-5 12 0 24q5 12 0 24" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round" opacity=".55"/><path d="M' + x + ' ' + (88 - (i % 2) * 10) + 'q-5 12 0 24q5 12 0 24" fill="none" stroke="#c9d6f2" stroke-width="2.6" stroke-linecap="round"/>';
      });
      return s;
    },
    sob: function (d) {
      var tear = function (x, y) { return '<path transform="translate(' + x + ' ' + y + ')" d="M0 -10C-6 0 -8 6 -8 10C-8 15 -4 18 0 18C4 18 8 15 8 10C8 6 6 0 0 -10Z" fill="#a8d4f2" stroke="' + INK + '" stroke-width="2.4"/>'; };
      return MARKS.sad(d) + tear(150, 262) + tear(252, 266);
    },
    happy: function (d) {
      return sparkle(200 + d * 104, 126, 1.5, GOLD) + sparkle(200 + d * 128, 176, 0.9, PINK) + sparkle(200 - d * 100, 104, 1, PAPER);
    },
    laugh: function (d) {
      return MARKS.happy(d) + '<text x="' + (200 + d * 112) + '" y="236" text-anchor="middle" font-family="Impact, Haettenschweiler, sans-serif" font-size="34" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="5" paint-order="stroke" transform="rotate(' + (d * 10) + ' ' + (200 + d * 112) + ' 230)">HA!</text>';
    },
    smirk: function (d) { return sparkle(200 + d * 70, 196, 0.8, PAPER); },
    hug: function (d) {
      var heart = function (x, y, s, col) { return '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M0 10C-14 0 -16 -10 -9 -14C-5 -16 -1 -14 0 -10C1 -14 5 -16 9 -14C16 -10 14 0 0 10Z" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>'; };
      return heart(200 + d * 120, 150, 1.8, PINK) + heart(200 + d * 150, 100, 1.1, STRAW);
    }
  };
  function showMarks(c, side, kind, delay) {
    var draw = MARKS[kind];
    if (!draw || !c || fast()) return;
    var old = c.emo.querySelector('.st-marks');
    kill(old);
    var holder = el('div', 'st-marks-wrap', marksSvg(c, draw(dirOf(side))));
    var svg = holder.firstElementChild;
    if (!svg) return;
    c.emo.appendChild(svg);
    var life = kind === 'shock' || kind === 'jump' ? 700 : kind === 'sad' || kind === 'sob' ? 1700 : 1200;
    var a = anim(svg, [
      { opacity: 0, transform: 'scale(.94)' },
      { opacity: 1, transform: 'scale(1.02)', offset: 0.18 },
      { opacity: 1, transform: 'scale(1)', offset: 0.7 },
      { opacity: 0, transform: kind === 'sad' || kind === 'sob' ? 'translateY(2%)' : 'scale(1)' }
    ], { duration: life, delay: delay || 0, easing: 'ease-out', fill: 'backwards' }, function () { kill(svg); });
    if (!a) kill(svg);
  }
  function emoteFor(c, side, expr, delay) {
    play(c, side, expr, delay);
    showMarks(c, side, expr, delay);
  }

  /* ---------- explicit acts ---------- */

  var ACTS = ['enter-left', 'enter-right', 'exit', 'jump', 'shake', 'lean-in', 'turn-away', 'nod', 'sob', 'laugh', 'collapse', 'hug', 'reset'];

  function act(who, move, opts) {
    if (!ready() || !who || ACTS.indexOf(move) === -1) return false;
    opts = opts || {};
    sync();
    var side;
    if (move === 'enter-left' || move === 'enter-right') {
      side = move === 'enter-left' ? 'left' : 'right';
      var was = sideOf(who);
      if (was && was !== side) { leave(cast[was], was); cast[was] = null; if (active === was) setActive(null); }
      if (cast[side] && cast[side].who === who) { if (opts.expr) setExpr(cast[side], opts.expr); enter(cast[side], side, 0); return true; }
      if (cast[side]) leave(cast[side], side);
      place(side, who, opts.expr || 'neutral', enterDelay());
      return true;
    }
    side = sideOf(who);
    if (!side) {
      if (move === 'exit') return true;
      side = opts.side === 'left' || opts.side === 'right' ? opts.side : (who === 'hachi' ? 'left' : 'right');
      if (cast[side]) leave(cast[side], side);
      place(side, who, opts.expr || 'neutral', enterDelay());
    }
    var c = cast[side];
    if (opts.expr && setExpr(c, opts.expr)) applyPose(c, side);
    if (move === 'exit') {
      cast[side] = null;
      if (active === side) setActive(null);
      leave(c, side);
      return true;
    }
    if (move === 'reset') { c.actPose = null; applyPose(c, side, 'transform .45s cubic-bezier(.3,.8,.3,1)'); return true; }
    if (ACT_POSES[move]) {
      c.actPose = move;
      var t = move === 'collapse' ? 'transform .7s cubic-bezier(.55,-.15,.6,1.25)' : move === 'turn-away' ? 'transform .55s cubic-bezier(.4,0,.2,1)' : 'transform .45s cubic-bezier(.3,.8,.3,1.15)';
      applyPose(c, side, t);
      if (move === 'collapse') showMarks(c, side, 'sad', 300);
      return true;
    }
    if (move === 'hug') return hug(c, side);
    play(c, side, move === 'shake' ? 'shake' : move, 0);
    if (move === 'jump' || move === 'sob' || move === 'laugh') showMarks(c, side, move, 0);
    return true;
  }

  function hug(c, side) {
    var other = side === 'left' ? 'right' : 'left';
    var o = cast[other];
    if (!o) {
      if (amp()) anim(c.actor, [{ transform: 'translateX(0)' }, { transform: 'translateX(' + (dirOf(side) * 8) + '%)', offset: 0.3 }, { transform: 'translateX(' + (dirOf(side) * 8) + '%)', offset: 0.75 }, { transform: 'translateX(0)' }], { duration: 1600, easing: 'ease-in-out' });
      return true;
    }
    // Measure the real gap so the two meet in the middle on every screen shape.
    var gap = 0;
    try {
      var a = slots.left.getBoundingClientRect(), b = slots.right.getBoundingClientRect();
      gap = (b.left + b.width / 2) - (a.left + a.width / 2);
    } catch (e) { gap = 0; }
    var move = Math.max(0, gap * (amp() ? 0.3 : 0));
    ['left', 'right'].forEach(function (s) {
      var x = cast[s];
      if (!x) return;
      var d = dirOf(s);
      var tx = function (f, sc) { return 'translateX(' + r1(d * move * f) + 'px) scale(' + sc + ')'; };
      anim(x.actor, [
        { transform: tx(0, 1) },
        { transform: tx(1.04, 1.02), offset: 0.22 },
        { transform: tx(0.96, 0.99), offset: 0.32 },
        { transform: tx(1, 1.01), offset: 0.8 },
        { transform: tx(0, 1) }
      ], { duration: 2600, easing: 'ease-in-out' });
      showMarks(x, s, 'hug', 500);
    });
    return true;
  }

  /* ---------- scenes: mood transitions and ambience ---------- */

  function changeScene(id, html, mood) {
    if (!ready()) return false;
    sync();
    closeProp(true);
    var bg = shaker.querySelector('.vn-bg');
    var oldPortraits = shaker.querySelector('.vn-portraits');
    var wasBlack = fx.black;
    var instant = fast() || !vn.isConnected || linesSinceMount === 0 || !!wasBlack || !bg.firstChild;
    clearFx(true);
    shaker.querySelectorAll('.st-out').forEach(kill);

    var fresh = el('div', 'vn-portraits', '<div class="portrait left"></div><div class="portrait right"></div>');
    if (!instant) {
      var out = el('div', 'st-out');
      var inner = el('div', 'st-out-in');
      out.appendChild(inner);
      while (bg.firstChild) inner.appendChild(bg.firstChild);
      shaker.querySelectorAll('.st-amb').forEach(function (a) { inner.appendChild(a); });
      inner.insertBefore(oldPortraits, inner.querySelector('.st-front'));
      shaker.appendChild(out);
      runTransition(out, mood);
    } else {
      kill(oldPortraits);
      shaker.querySelectorAll('.st-amb').forEach(kill);
    }
    bg.innerHTML = html;
    var amb = ambience(id);
    var back = el('div', 'st-amb st-back', amb.back);
    var front = el('div', 'st-amb st-front', amb.front);
    bg.parentNode.insertBefore(back, bg.nextSibling);
    back.parentNode.insertBefore(fresh, back.nextSibling);
    fresh.parentNode.insertBefore(front, fresh.nextSibling);
    var stray = shaker.querySelector('.st-out');
    if (stray) shaker.appendChild(stray);
    cast = { left: null, right: null };
    active = null;
    findSlots();

    if (wasBlack) {
      fx.black = null;
      anim(wasBlack, [{ opacity: 1 }, { opacity: 0 }], { duration: reducedMotion() ? 200 : 900, easing: 'ease-in-out' }, function () { kill(wasBlack); });
      if (!wasBlack.animate || fast()) kill(wasBlack);
      sceneBusyUntil = now() + 500;
    } else if (instant && vn.isConnected && linesSinceMount === 0) {
      // First scene after the screen opened: the open-from-black in mounted() already covers it.
      sceneBusyUntil = now() + 250;
    }
    return true;
  }

  function runTransition(out, mood) {
    var still = amp() === 0;
    var done = function () { kill(out); };
    var drift = function (dist, ms) {
      out.querySelectorAll('.st-actor').forEach(function (a) {
        var d = a.parentNode && a.parentNode.classList.contains('left') ? 1 : -1;
        anim(a, [{ transform: 'translateX(0)' }, { transform: 'translateX(' + (d * -dist) + '%)' }], { duration: ms, easing: 'ease-in', fill: 'forwards' });
      });
    };
    if (still || mood === 'stop' || mood === 'title' || !mood) {
      if (!still) drift(16, 450);
      anim(out, [{ opacity: 1 }, { opacity: 0 }], { duration: still ? 250 : 450, easing: 'ease-in-out' }, done);
      sceneBusyUntil = now() + (still ? 150 : 300);
      return;
    }
    if (mood === 'sad') {
      // Soft: the old room lets go slowly and its people drift out.
      drift(10, 1000);
      anim(out, [{ opacity: 1 }, { opacity: 0 }], { duration: 1000, easing: 'ease-in-out' }, done);
      sceneBusyUntil = now() + 700;
    } else if (mood === 'tension') {
      // Hard: a slash wipe. The outer frame moves while the picture stays still.
      out.classList.add('wipe');
      var inner = out.firstElementChild;
      var opts = { duration: 420, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'forwards' };
      anim(inner, [{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }], opts);
      anim(out, [{ transform: 'translateX(0)' }, { transform: 'translateX(-100%)' }], opts, done);
      sceneBusyUntil = now() + 380;
    } else {
      // Comedy: a halftone disc pops over the old scene, then shrinks away with a bounce.
      var disc = el('div', 'st-disc');
      veil.appendChild(disc);
      anim(disc, [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'cubic-bezier(.5,0,.9,.5)', fill: 'forwards' }, function () {
        kill(out);
        anim(disc, [{ transform: 'scale(1)' }, { transform: 'scale(1.06)', offset: 0.22 }, { transform: 'scale(0)' }], { duration: 480, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' }, function () { kill(disc); });
        if (!disc.animate || fast()) kill(disc);
      });
      if (!disc.animate) { kill(out); kill(disc); }
      sceneBusyUntil = now() + 620;
    }
    if (!out.animate) done();
  }

  function particles(cls, n, seed, style) {
    var R = rng(seed), s = '';
    for (var i = 0; i < n; i++) s += '<i style="' + style(R, i) + '"></i>';
    return '<div class="st-fx ' + cls + '">' + s + '</div>';
  }
  function pct(v) { return r1(v) + '%'; }
  function snowFx(seed, n) {
    return particles('st-snow', n, seed, function (R) {
      var d = 7 + R() * 7, s = 5 + R() * 9;
      return 'left:' + pct(R() * 104 - 2) + ';width:' + r1(s) + 'px;height:' + r1(s) + 'px;--dx:' + r1((R() - 0.5) * 18) + 'vw;opacity:' + r1(0.45 + R() * 0.45) + ';animation-duration:' + r1(d) + 's;animation-delay:-' + r1(R() * d) + 's';
    });
  }
  function rainFx(seed, n) {
    return particles('st-rain', n, seed, function (R) {
      var d = 0.55 + R() * 0.4;
      return 'left:' + pct(R() * 130 - 5) + ';height:' + Math.round(50 + R() * 70) + 'px;opacity:' + r1(0.25 + R() * 0.35) + ';animation-duration:' + r1(d * 100) / 100 + 's;animation-delay:-' + r1(R() * d * 100) / 100 + 's';
    });
  }
  function dustFx(seed, n, col) {
    return particles('st-dust', n, seed, function (R) {
      var d = 9 + R() * 9, s = 2 + R() * 3;
      return 'left:' + pct(R() * 100) + ';top:' + pct(8 + R() * 70) + ';width:' + r1(s) + 'px;height:' + r1(s) + 'px;--dx:' + r1((R() - 0.5) * 12) + 'vw;--dy:' + r1((R() - 0.6) * 14) + 'vh;background:' + (col || '#fff6dc') + ';animation-duration:' + r1(d) + 's;animation-delay:-' + r1(R() * d) + 's';
    });
  }
  function emberFx(seed, n) {
    return particles('st-ember', n, seed, function (R) {
      var d = 5 + R() * 5, s = 3 + R() * 4;
      return 'left:' + pct(R() * 100) + ';width:' + r1(s) + 'px;height:' + r1(s) + 'px;--dx:' + r1((R() - 0.5) * 14) + 'vw;background:' + (R() < 0.5 ? GOLD : '#ff5a2a') + ';animation-duration:' + r1(d) + 's;animation-delay:-' + r1(R() * d) + 's';
    });
  }
  function bokehFx(seed, n, cols) {
    return particles('st-bokeh', n, seed, function (R) {
      var d = 10 + R() * 10, s = 18 + R() * 34;
      return 'left:' + pct(R() * 100) + ';top:' + pct(R() * 70) + ';width:' + r1(s) + 'px;height:' + r1(s) + 'px;--c:' + cols[Math.floor(R() * cols.length)] + ';--dx:' + r1((R() - 0.5) * 8) + 'vw;--dy:' + r1((R() - 0.5) * 6) + 'vh;animation-duration:' + r1(d) + 's;animation-delay:-' + r1(R() * d) + 's';
    });
  }
  function steamFx(seed, n, x0, x1) {
    return particles('st-steam', n, seed, function (R) {
      var d = 6 + R() * 4, s = 40 + R() * 50;
      return 'left:' + pct(x0 + R() * (x1 - x0)) + ';width:' + r1(s) + 'px;height:' + r1(s) + 'px;animation-duration:' + r1(d) + 's;animation-delay:-' + r1(R() * d) + 's';
    });
  }
  function petalFx(seed, n) {
    return particles('st-petal', n, seed, function (R) {
      var d = 8 + R() * 6;
      return 'top:' + pct(R() * 60) + ';--dy:' + r1(10 + R() * 30) + 'vh;animation-duration:' + r1(d) + 's;animation-delay:-' + r1(R() * d) + 's';
    });
  }
  function flashFx(seed, n) {
    return particles('st-pap', n, seed, function (R) {
      var d = 6 + R() * 6;
      return 'left:' + pct(8 + R() * 84) + ';top:' + pct(8 + R() * 45) + ';animation-duration:' + r1(d) + 's;animation-delay:-' + r1(R() * d) + 's';
    });
  }

  function ambience(id) {
    var calm = noFlash();
    switch (id) {
      case 'train-snow': return { back: '', front: snowFx(7, 12) };
      case 'hometown': case 'platform': return { back: '', front: snowFx(id === 'platform' ? 9 : 13, 10) };
      case 'rain-rift': return { back: '', front: rainFx(5, 26) + (calm ? '' : '<div class="st-bolt"></div>') };
      case 'room-707': return { back: '<div class="st-beam"></div>' + dustFx(3, 16), front: '' };
      case 'inn': case 'backstage': case 'studio': return { back: '<div class="st-beam' + (id === 'inn' ? ' warm' : ' dim') + '"></div>' + dustFx(id.length, 12), front: '' };
      case 'jackson-hole': return { back: '<div class="st-glow warm"></div>' + steamFx(17, 5, 44, 56), front: '' };
      case 'live-house': return { back: '<div class="st-flicker' + (calm ? ' calm' : '') + '"></div><div class="st-haze"></div>', front: '' };
      case 'tokyo-night': return { back: '<div class="st-neon a"></div><div class="st-neon b' + (calm ? '' : ' buzz') + '"></div><div class="st-car"></div>', front: '' };
      case 'penthouse': return { back: bokehFx(21, 9, ['#ffe3a8', '#ffffff', '#ffd1e0']), front: '' };
      case 'arena': return { back: bokehFx(29, 12, [GOLD, PINK, '#ffffff']), front: '' };
      case 'demon-realm': return { back: '<div class="st-heat"></div>', front: emberFx(31, 18) };
      case 'rooftop': return { back: '', front: petalFx(37, 7) };
      case 'newsstand': return { back: calm ? '' : flashFx(41, 4), front: '' };
      case 'road-van': return { back: '<div class="st-pass"></div>', front: '' };
      default: return { back: '', front: '' };
    }
  }

  /* ---------- camera and screen effects ---------- */

  // Where the speaker's face is on screen, worked out from the portrait's viewBox (bottom-anchored, contained).
  function headPoint(side) {
    var s = side && slots[side];
    var r = s && rect(s);
    if (!r || !r.width) return null;
    var vb = [30, 58, 340, 450];
    var c = cast[side], svg = c && c.idle.querySelector('svg');
    if (svg) {
      var v = String(svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
      if (v.length === 4 && v[2] > 0 && v[3] > 0) vb = v;
    }
    var scale = Math.min(r.width / vb[2], r.height / vb[3]);
    return { x: r.left + r.width / 2, y: r.bottom - vb[3] * scale + (205 - vb[1]) * scale };
  }

  function speakerOrigin() {
    var h = headPoint(active), v = rect(cam);
    if (!h || !v || !v.width) return '50% 42%';
    var x = Math.min(85, Math.max(15, (h.x - v.left) / v.width * 100));
    var y = Math.min(70, Math.max(20, (h.y - v.top) / v.height * 100));
    return r1(x) + '% ' + r1(y) + '%';
  }

  function aimSpot() {
    if (!fx.spot) return;
    var h = headPoint(active), v = rect(vn), x = 0, y = 0;
    if (h && v && v.width) {
      x = h.x - (v.left + v.width / 2);
      y = h.y - (v.top + v.height * 0.42);
    }
    fx.spot.style.transform = 'translate(' + Math.round(x) + 'px, ' + Math.round(y) + 'px)';
  }

  function clearFx(keepBlack) {
    if (fx.zoom && cam) { cam.style.transform = ''; fx.zoom = false; }
    if (fx.spot) { var sp = fx.spot; fx.spot = null; fade(sp, 0, 400, true); }
    if (fx.weather) { kill(fx.weather); fx.weather = null; }
    if (!keepBlack && fx.black) { var b = fx.black; fx.black = null; fade(b, 0, 600, true); }
    if (veil) veil.querySelectorAll('.st-vignette, .st-white, .st-lines').forEach(kill);
  }

  function fade(node, to, ms, remove) {
    var from = parseFloat(node.style.opacity || (to ? 0 : 1));
    node.style.opacity = to;
    var a = anim(node, [{ opacity: from }, { opacity: to }], { duration: ms, easing: 'ease-in-out' }, function () { if (remove) kill(node); });
    if (!a && remove) kill(node);
  }

  function focusLines() {
    var R = rng(53), d = '';
    for (var i = 0; i < 44; i++) {
      var t = (i / 44) * Math.PI * 2 + R() * 0.08, w = 0.006 + R() * 0.012, r0 = 34 + R() * 12;
      var a = t - w, b = t + w;
      d += 'M' + r1(50 + Math.cos(a) * 80) + ' ' + r1(50 + Math.sin(a) * 80) + 'L' + r1(50 + Math.cos(t) * r0) + ' ' + r1(50 + Math.sin(t) * r0) + 'L' + r1(50 + Math.cos(b) * 80) + ' ' + r1(50 + Math.sin(b) * 80) + 'Z';
    }
    return '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + '" fill="' + PAPER + '"/></svg>';
  }
  function lines(ms) {
    var l = el('div', 'st-lines', focusLines());
    veil.appendChild(l);
    var a = anim(l, [{ opacity: 0, transform: 'scale(1.15)' }, { opacity: 0.85, transform: 'scale(1)', offset: 0.2 }, { opacity: 0 }], { duration: ms || 600, easing: 'ease-out' }, function () { kill(l); });
    if (!a) kill(l);
  }
  function shakeCam(power, ms, vertical) {
    if (!amp()) return;
    var p = power * amp(), f = [];
    var steps = [1, -0.8, 0.6, -0.45, 0.3, -0.15, 0];
    f.push({ transform: 'translate(0, 0) scale(1.03)' });
    steps.forEach(function (s, i) {
      var x = vertical ? s * p * 0.3 : s * p, y = vertical ? s * p : (i % 2 ? -0.5 : 0.5) * s * p;
      f.push({ transform: 'translate(' + r1(x) + '%, ' + r1(y) + '%) scale(1.03)' });
    });
    f.push({ transform: 'translate(0, 0) scale(1)' });
    anim(shaker, f, { duration: ms, easing: 'ease-out' });
  }

  var FX = {
    shake: function () { shakeCam(1.4, 520); return 0; },
    flash: function () {
      sfx('flash');
      if (noFlash()) { lines(700); return 0; }
      var w = el('div', 'st-white');
      veil.appendChild(w);
      var a = anim(w, [{ opacity: 0 }, { opacity: 0.85, offset: 0.12 }, { opacity: 0 }], { duration: 420, easing: 'ease-out' }, function () { kill(w); });
      if (!a) kill(w);
      return 0;
    },
    'zoom-in': function () {
      cam.style.transformOrigin = speakerOrigin();
      cam.style.transform = 'scale(' + (amp() ? 1.14 : 1.08) + ')';
      fx.zoom = true;
      return 0;
    },
    'zoom-out': function () {
      if (fx.zoom) { cam.style.transform = ''; fx.zoom = false; }
      else if (amp()) anim(cam, [{ transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 700, easing: 'cubic-bezier(.2,.7,.3,1)' });
      return 0;
    },
    'fade-black': function () {
      if (fx.black) return 0;
      var b = el('div', 'st-black');
      b.style.opacity = 0;
      veil.appendChild(b);
      fx.black = b;
      fade(b, 1, 650, false);
      return fast() ? 0 : 700;
    },
    'door-slam': function () {
      sfx('thud');
      shakeCam(2.2, 420, true);
      if (amp()) lines(450);
      var dust = el('div', 'st-slamdust', '<i></i><i></i><i></i><i></i><i></i>');
      veil.appendChild(dust);
      later(function () { kill(dust); }, 1100);
      if (!noFlash()) {
        var d = el('div', 'st-black');
        veil.appendChild(d);
        var a = anim(d, [{ opacity: 0.55 }, { opacity: 0 }], { duration: 160, easing: 'linear' }, function () { kill(d); });
        if (!a) kill(d);
      }
      return 0;
    },
    'phone-buzz': function () {
      var p = el('div', 'st-phone', propSvg('phone'));
      propLayer.appendChild(p);
      sfx('select');
      later(function () { sfx('select'); }, 650);
      anim(p, [{ opacity: 0, transform: 'translateY(-20px) rotate(-8deg)' }, { opacity: 1, transform: 'translateY(0) rotate(6deg)' }], { duration: 260, easing: 'ease-out', fill: 'backwards' });
      var svg = p.firstElementChild;
      if (amp() && svg) {
        var f = [];
        for (var i = 0; i <= 16; i++) f.push({ transform: 'translateX(' + (i % 2 ? 3 : -3) * amp() + 'px) rotate(' + (i % 2 ? 2 : -2) + 'deg)' });
        f.push({ transform: 'none' });
        anim(svg, f, { duration: 1500, delay: 200, easing: 'linear' });
      }
      later(function () {
        var a = anim(p, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(-12px) rotate(6deg)' }], { duration: 300, easing: 'ease-in', fill: 'forwards' }, function () { kill(p); });
        if (!a) kill(p);
      }, fast() ? 0 : 2600);
      return 0;
    },
    rain: function () { weather(rainFx(61, 30)); return 0; },
    snow: function () { weather(snowFx(67, 16)); return 0; },
    heartbeat: function () {
      sfx('thud');
      var v = el('div', 'st-vignette');
      veil.appendChild(v);
      var beat = [{ opacity: 0.2 }, { opacity: 0.85, offset: 0.1 }, { opacity: 0.35, offset: 0.25 }, { opacity: 0.8, offset: 0.35 }, { opacity: 0.2, offset: 0.7 }, { opacity: 0 }];
      var a = anim(v, beat, { duration: 1100, iterations: 2, easing: 'ease-out' }, function () { kill(v); });
      if (!a) kill(v);
      if (amp()) {
        var s = function (x) { return { transform: 'scale(' + (1 + x * 0.03 * amp()) + ')' }; };
        anim(shaker, [s(0), s(0.8), s(0.2), s(1), s(0)], { duration: 1100, iterations: 2, easing: 'ease-out' });
      }
      later(function () { sfx('thud'); }, 1100);
      return 0;
    },
    spotlight: function () {
      if (!fx.spot) {
        var sp = el('div', 'st-spot');
        sp.style.opacity = 0;
        veil.appendChild(sp);
        fx.spot = sp;
        fade(sp, 1, 600, false);
      }
      aimSpot();
      return 0;
    },
    clear: function () { clearFx(false); return 0; }
  };

  function weather(html) {
    if (fx.weather) kill(fx.weather);
    var front = shaker.querySelector('.vn-portraits');
    fx.weather = el('div', 'st-amb st-weather', html);
    if (front && front.nextSibling) shaker.insertBefore(fx.weather, front.nextSibling); else shaker.appendChild(fx.weather);
    anim(fx.weather, [{ opacity: 0 }, { opacity: 1 }], { duration: 800, easing: 'ease-out' });
  }

  // Returns how long main.js should hold before the next step, or -1 if the effect is unknown.
  function runFx(id) {
    if (!ready() || !FX[id]) return -1;
    sync();
    return FX[id]() || 0;
  }

  /* ---------- props ---------- */

  function P(d, fill, sw, stroke, extra) {
    return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + (sw ? ' stroke="' + (stroke || INK) + '" stroke-width="' + sw + '" stroke-linejoin="round" stroke-linecap="round"' : '') + (extra || '') + '/>';
  }
  function C(cx, cy, r, fill, sw, stroke, extra) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (fill || 'none') + '"' + (sw ? ' stroke="' + (stroke || INK) + '" stroke-width="' + sw + '"' : '') + (extra || '') + '/>';
  }
  function E(cx, cy, rx, ry, fill, sw, stroke, extra) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + (fill || 'none') + '"' + (sw ? ' stroke="' + (stroke || INK) + '" stroke-width="' + sw + '"' : '') + (extra || '') + '/>';
  }
  function Rc(x, y, w, h, rx, fill, sw, stroke, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + (fill || 'none') + '"' + (sw ? ' stroke="' + (stroke || INK) + '" stroke-width="' + sw + '" stroke-linejoin="round"' : '') + (extra || '') + '/>';
  }
  function T(x, y, text, size, fill, font, extra) {
    return '<text x="' + x + '" y="' + y + '" font-family="' + (font || 'Impact, Haettenschweiler, \'Arial Narrow Bold\', sans-serif') + '" font-size="' + size + '" fill="' + fill + '" text-anchor="middle"' + (extra || '') + '>' + text + '</text>';
  }
  var HAND = '\'Noteworthy\', \'Segoe Print\', \'Bradley Hand\', cursive';
  var MONO = '\'American Typewriter\', \'Courier New\', monospace';
  function twinkle(x, y, s, col, delay) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path class="st-twinkle" style="animation-delay:' + (delay || 0) + 's" d="M0 -12L3 -3L12 0L3 3L0 12L-3 3L-12 0L-3 -3Z" fill="' + (col || '#fff') + '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/></g>';
  }
  function berry(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M0 11C-10 4 -9 -6 -5 -7C-2 -9 2 -9 5 -7C9 -6 10 4 0 11Z" fill="' + STRAW + '" stroke="' + INK + '" stroke-width="1.2"/><path d="M-5 -7L0 -11L5 -7L0 -5Z" fill="#2c6b34"/><circle cx="-2" cy="-1" r=".9" fill="#ffe7a0"/><circle cx="2.5" cy="3" r=".9" fill="#ffe7a0"/></g>';
  }
  // Halftone shading: the shape again, filled with a dot screen.
  function tone(u, d) { return '<path d="' + d + '" fill="url(#' + u + 'ht)"/>'; }

  function glassShape(u, cracked) {
    var body = 'M-26 -60L-20 50Q0 58 20 50L26 -60Z';
    return P(body, '#ffffff', 4, INK, ' fill-opacity=".55"') +
      P('M-24.6 -18L-20.6 48Q0 55 20.6 48L24.6 -18Z', '#ffc2d6', 0, '', ' opacity=".75"') +
      tone(u, 'M10 -18L24.6 -18L20.6 48Q14 51 8 52Z') +
      berry(-9, -34, 1.5) + berry(10, -8, 1.5) + berry(-7, 20, 1.5) +
      E(0, -60, 26, 6, '#ffffff', 3, INK, ' fill-opacity=".7"') +
      P('M-17 -50L-12.5 38', 'none', 4, '#ffffff', ' opacity=".9"') + P('M-9 -52L-7 -30', 'none', 2.4, '#ffffff', ' opacity=".8"') +
      (cracked ? '' : '');
  }

  var PROPS = {
    ring: { burst: RED, sfx: 'chime', art: function (u) {
      var finger = function (x, top, w, h) { return Rc(x, top, w, h, w / 2, SKIN, 3.4, LINE); };
      var nail = function (x, top, w) { return Rc(x + 4, top + 4, w - 8, 17, (w - 8) / 2, INK, 2, LINE) + P('M' + (x + 7) + ' ' + (top + 12) + 'q1 -4 4 -5', 'none', 2, '#fff', ' opacity=".75"'); };
      var crease = function (x, y, w) { return P('M' + x + ' ' + y + 'q' + w / 2 + ' 4 ' + w + ' 0', 'none', 2, LINE, ' opacity=".55"'); };
      var plate = function (d, shade) { return P(d, SILVER, 3.6) + P(shade, SILVER_S) + tone(u, shade); };
      return '<g transform="rotate(-12 100 120)">' +
        finger(58, 44, 22, 100) + finger(134, 64, 19, 82) + finger(109, 34, 22, 108) + finger(83, 20, 22, 120) +
        nail(58, 44, 22) + nail(134, 64, 19) + nail(109, 34, 22) + nail(83, 20, 22) +
        crease(60, 98, 16) + crease(112, 92, 16) + crease(137, 104, 14) +
        P('M50 206C46 176 48 148 54 130Q66 120 80 128Q94 120 108 128Q122 120 134 128Q146 122 156 132C160 152 162 180 160 206Z', SKIN, 3.4, LINE) +
        P('M128 136C140 150 146 176 146 206L160 206C162 180 160 152 156 132Z', SKIN_S) +
        P('M58 152C40 148 26 134 22 118C20 106 32 102 38 110C46 120 54 128 66 134Z', SKIN, 3.4, LINE) +
        plate('M78 106C88 112 102 112 112 106L112 124C102 130 88 130 78 124Z', 'M100 111C104 110 108 108 112 106L112 124C108 126 104 128 100 128Z') +
        plate('M78 86C88 92 102 92 112 86L112 104C102 110 88 110 78 104Z', 'M100 91C104 90 108 88 112 86L112 104C108 106 104 108 100 108Z') +
        plate('M80 80C80 64 88 52 95 46C102 52 110 64 110 80L110 84C102 88 88 88 80 84Z', 'M100 56C106 64 110 72 110 80L110 84C106 86 103 87 100 87Z') +
        P('M84 78C84 68 88 60 93 54', 'none', 3, '#ffffff', ' opacity=".9"') + P('M82 92L82 100M82 112L82 120', 'none', 3, '#ffffff', ' opacity=".85"') +
        C(80, 95, 2.6, INK) + C(110, 95, 2.6, INK) + C(80, 115, 2.6, INK) + C(110, 115, 2.6, INK) +
        P('M86 96H104M86 116H104', 'none', 1.6, INK, ' opacity=".6"') +
        P('M95 62L99 70L95 78L91 70Z', RED, 2, INK) +
        '</g>' + twinkle(140, 34, 1.4, '#fff', 0) + twinkle(52, 40, 1, GOLD, 0.5) + twinkle(160, 116, 0.9, '#fff', 0.9);
    } },
    'strawberry-glasses': { burst: PINK, sfx: 'chime', art: function (u) {
      return '<g transform="translate(72 116) rotate(-14)">' + glassShape(u) + '</g><g transform="translate(128 116) rotate(14)">' + glassShape(u) + '</g>' +
        '<g class="st-clink">' + P('M100 30V14M86 34L78 22M114 34L122 22M80 46L66 44M120 46L134 44', 'none', 7, INK) + P('M100 30V14M86 34L78 22M114 34L122 22M80 46L66 44M120 46L134 44', 'none', 3.5, GOLD) + '</g>' +
        twinkle(42, 40, 1.1, '#fff', 0.2) + twinkle(164, 64, 0.9, GOLD, 0.7);
    } },
    'cracked-glass': { burst: INK2, sfx: 'miss', art: function (u) {
      var crack = 'M8 -61L2 -42L12 -32L3 -12L10 2L4 18M12 -32L22 -30M3 -12L-8 -6';
      return '<g transform="translate(96 110) rotate(-6) scale(1.22)">' + glassShape(u) +
        P(crack, 'none', 4.6, INK) + P(crack, 'none', 1.6, '#ffffff') + '</g>' +
        '<g class="st-shard">' + P('M130 34L142 30L138 52Z', '#ffffff', 3, INK, ' fill-opacity=".8"') + P('M146 50L152 49L150 58Z', '#ffffff', 2, INK, ' fill-opacity=".8"') + '</g>' +
        P('M118 176q4 8 0 12', 'none', 3, '#ffc2d6') + C(116, 192, 4, '#ffc2d6', 2, INK);
    } },
    lighter: { burst: RED, sfx: 'click', art: function (u) {
      var holes = '';
      for (var r = 0; r < 3; r++) for (var c = 0; c < 4; c++) holes += C(84 + c * 10, 62 + r * 8, 2.4, INK);
      return P('M126 86L126 40Q126 32 134 32L160 32Q168 32 168 40L168 86Z', GOLD, 3.8) + P('M154 32L160 32Q168 32 168 40L168 86L154 86Z', '#c9971c') + tone(u, 'M154 32L160 32Q168 32 168 40L168 86L154 86Z') +
        P('M134 40V78', 'none', 3.4, '#fff6d0', ' opacity=".85"') + Rc(122, 80, 14, 10, 3, SILVER, 2.6) +
        '<g class="st-flame">' + P('M98 54C78 40 86 18 98 2C104 18 122 32 104 54Z', '#ff8a1f', 3, INK) + P('M99 50C90 42 94 30 99 20C103 30 110 40 102 50Z', '#ffe066') + '</g>' +
        Rc(76, 52, 46, 32, 3, SILVER, 3.4) + holes +
        Rc(62, 82, 76, 100, 10, GOLD, 4) + P('M120 84L128 84Q136 84 136 92L136 172Q136 180 128 180L120 180Z', '#c9971c') + tone(u, 'M120 84L128 84Q136 84 136 92L136 172Q136 180 128 180L120 180Z') +
        P('M62 108H138', 'none', 3, INK) + P('M72 92V170', 'none', 4, '#fff6d0', ' opacity=".9"') +
        C(100, 144, 19, '#f7d774', 3.2) + E(100, 144, 8, 19, 'none', 1.8) + P('M81 144H119M84 134H116M84 154H116', 'none', 1.6, INK) +
        P('M100 117L103 123L110 124L105 129L106 136L100 132L94 136L95 129L90 124L97 123Z', RED, 1.8, INK) +
        P('M78 166L124 122', 'none', 6, INK) + P('M78 166L124 122', 'none', 2.6, SILVER) + C(76, 168, 5, 'none', 3, INK) + P('M121 119L130 120L127 128Z', SILVER, 2.4, INK);
    } },
    padlock: { burst: INK2, sfx: 'thud', art: function (u) {
      var links = '';
      [[100, -6, 6, 12], [100, 16, 12, 6], [100, 36, 6, 12]].forEach(function (l) { links += E(l[0], l[1], l[2], l[3], 'none', 7, INK) + E(l[0], l[1], l[2], l[3], 'none', 3.2, SILVER); });
      return '<g class="st-swing">' + links +
        P('M72 104V80C72 50 128 50 128 80V104', 'none', 18, INK) + P('M72 104V80C72 50 128 50 128 80V104', 'none', 10, SILVER) + P('M78 92V80C78 64 88 58 96 57', 'none', 3, '#fff', ' opacity=".9"') +
        Rc(52, 98, 96, 82, 12, GOLD, 4.4) + P('M124 100H136Q148 100 148 112V168Q148 180 136 180H124Z', '#c9971c') + tone(u, 'M124 100H136Q148 100 148 112V168Q148 180 136 180H124Z') +
        P('M62 108V170', 'none', 4.5, '#fff6d0', ' opacity=".9"') +
        C(100, 128, 9, INK) + P('M95 132L105 132L108 156L92 156Z', INK) +
        P('M66 112h6M66 166h6M128 112h6M128 166h6', 'none', 3, INK) + '</g>' + twinkle(150, 70, 1, '#fff', 0.3);
    } },
    key: { burst: PINK, sfx: 'chime', art: function () {
      var teeth = 'M84 7L84 19L92 19L92 12L100 12L100 21L108 21L108 12L116 12L116 7Z';
      return C(52, 50, 22, 'none', 8, INK) + C(52, 50, 22, 'none', 4, SILVER) +
        '<g transform="translate(74 66) rotate(38)">' +
        Rc(16, -8, 108, 16, 3, SILVER, 3.6) + P(teeth, SILVER, 3.4) + P('M24 -1H118', 'none', 2, SILVER_S) +
        C(0, 0, 26, SILVER, 4) + C(0, 0, 8, INK) + P('M-14 -12Q-8 -20 2 -21', 'none', 3, '#fff') + '</g>' +
        P('M40 64Q34 92 46 112', 'none', 2.4, INK) +
        '<g transform="translate(48 136) rotate(-12)">' + Rc(-30, -22, 60, 44, 4, PAPER, 3.4) + C(-20, -12, 4, INK) + T(4, 13, '707', 26, RED) + '</g>' +
        berry(150, 54, 2.6) + P('M150 26L150 36', 'none', 2.4, INK) + twinkle(170, 140, 1, '#fff', 0.4);
    } },
    cake: { burst: PINK, sfx: 'chime', art: function (u) {
      return E(100, 166, 84, 18, '#ffffff', 4) + E(100, 162, 66, 11, 'none', 2, '#d9d0c4') +
        P('M140 156L170 132L170 90L140 108Z', '#fff8ee', 4) + tone(u, 'M140 156L170 132L170 90L140 108Z') +
        P('M36 156H140V108H36Z', '#f6d58e', 4) +
        P('M36 124H140V134H36Z', '#fff8ee', 0) + P('M36 108H140V116H36Z', '#fff8ee', 0) +
        P('M48 124a7 7 0 0 1 14 0M74 124a7 7 0 0 1 14 0M100 124a7 7 0 0 1 14 0M124 124a7 7 0 0 1 14 0', STRAW, 1.6) +
        P('M36 124H140M36 134H140M36 116H140', 'none', 2, '#e3b45e') + P('M36 156H140V108H36Z', 'none', 4) +
        P('M36 108L66 88L170 90L140 108Z', '#ffffff', 4) +
        P('M40 108q5 -8 10 0q5 -8 10 0q5 -8 10 0q5 -8 10 0q5 -8 10 0q5 -8 10 0q5 -8 10 0q5 -8 10 0q5 -8 10 0q5 -8 10 0', '#ffffff', 2.4) +
        P('M106 92C94 92 92 80 104 78C102 70 118 70 118 78C130 78 128 92 116 92Z', '#ffffff', 3) +
        berry(112, 66, 3) + twinkle(52, 62, 1, '#fff', 0.2) + twinkle(162, 54, 0.9, GOLD, 0.6);
    } },
    cigarettes: { burst: RED, sfx: 'click', art: function (u) {
      var cig = function (x, top) { return Rc(x, top, 13, 56, 2, '#ffffff', 3) + Rc(x, top, 13, 16, 2, '#d99a4e', 3) + C(x + 4, top + 6, 1.2, '#8a5a24') + C(x + 9, top + 11, 1.2, '#8a5a24'); };
      return P('M58 74L66 34L150 34L142 74Z', '#2a2228', 4) + cig(72, 30) + cig(92, 20) + cig(112, 34) +
        Rc(58, 70, 84, 112, 6, INK2, 4.2) + P('M58 74H142V82H58Z', SILVER, 0) + P('M58 82H142', 'none', 2.4, INK) +
        P('M58 126L142 104L142 128L58 150Z', RED, 0) + P('M58 126L142 104M58 150L142 128', 'none', 2.6, INK) +
        P('M100 146L105 156L116 157L108 164L110 175L100 169L90 175L92 164L84 157L95 156Z', GOLD, 2.4, INK) +
        P('M126 72H136Q142 72 142 78V176Q142 182 136 182H126Z', '#000', 0, '', ' opacity=".35"') + P('M66 88V172', 'none', 3, '#ffffff', ' opacity=".35"');
    } },
    pick: { burst: GOLD, sfx: 'select', art: function (u) {
      var shape = 'M100 22C150 22 176 42 170 82C164 122 126 166 100 182C74 166 36 122 30 82C24 42 50 22 100 22Z';
      return '<g class="st-wobble">' + P(shape, RED, 5) + tone(u, 'M100 22C150 22 176 42 170 82C164 122 126 166 100 182Z') +
        P('M100 34C142 34 162 50 158 82C154 114 122 152 100 166C78 152 46 114 42 82C38 50 58 34 100 34Z', 'none', 2.4, PAPER, ' opacity=".7"') +
        '<g transform="rotate(-8 100 96)">' + T(100, 106, 'BLAST', 40, PAPER, null, ' stroke="' + INK + '" stroke-width="5" paint-order="stroke"') + '</g>' +
        P('M100 122L104 131L114 132L106 138L109 148L100 142L91 148L94 138L86 132L96 131Z', GOLD, 2.2, INK) +
        P('M52 64C58 46 74 36 94 34', 'none', 4, '#fff', ' opacity=".85"') + '</g>';
    } },
    mic: { burst: RED, sfx: 'select', art: function (u) {
      var mesh = '';
      for (var i = -3; i <= 3; i++) mesh += 'M' + (100 + i * 9) + ' 26V90M68 ' + (58 + i * 9) + 'H132';
      return '<g class="st-pulse">' + P('M150 40a26 26 0 0 1 0 36M162 30a40 40 0 0 1 0 56', 'none', 6, INK) + P('M150 40a26 26 0 0 1 0 36M162 30a40 40 0 0 1 0 56', 'none', 3, PAPER) + '</g>' +
        '<g transform="rotate(-24 100 110)">' +
        P('M100 176C100 192 84 192 80 182C76 170 64 172 62 186', 'none', 6, INK) +
        P('M78 98L122 98L110 176L90 176Z', INK2, 4) + P('M104 98L122 98L110 176L102 176Z', '#000', 0, '', ' opacity=".35"') + P('M86 106L94 168', 'none', 3, '#fff', ' opacity=".5"') +
        Rc(74, 86, 52, 14, 3, RED, 3.6) +
        C(100, 58, 34, SILVER, 4) + '<clipPath id="' + u + 'g"><circle cx="100" cy="58" r="32"/></clipPath><path clip-path="url(#' + u + 'g)" d="' + mesh + '" stroke="' + INK + '" stroke-width="1.6" opacity=".6"/>' +
        P('M100 26A32 32 0 0 1 132 58A32 32 0 0 1 112 88C122 74 124 46 100 26Z', SILVER_S, 0, '', ' opacity=".7"') +
        P('M80 40Q86 30 98 28', 'none', 4, '#fff') + '</g>';
    } },
    phone: { burst: PINK, sfx: 'select', art: function (u) {
      var keys = '';
      for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) keys += Rc(74 + c * 18, 132 + r * 13, 14, 9, 3, PAPER, 1.6);
      return '<g class="st-buzz">' + P('M40 54q-10 14 0 28M28 46q-16 22 0 44M160 54q10 14 0 28M172 46q16 22 0 44', 'none', 6, INK) + P('M40 54q-10 14 0 28M28 46q-16 22 0 44M160 54q10 14 0 28M172 46q16 22 0 44', 'none', 2.6, PAPER) + '</g>' +
        Rc(122, 2, 10, 16, 3, INK2, 3) +
        Rc(62, 12, 76, 98, 12, '#ff8fb8', 4) + P('M118 12h8Q138 12 138 24V98Q138 110 126 110H118Z', '#e8608e') + tone(u, 'M118 12h8Q138 12 138 24V98Q138 110 126 110H118Z') +
        Rc(72, 24, 56, 66, 4, '#c8ecff', 3) + '<rect class="st-screen" x="74" y="26" width="52" height="62" fill="#ffffff" opacity=".0"/>' +
        P('M100 66C88 58 86 50 92 46C96 44 99 46 100 49C101 46 104 44 108 46C114 50 112 58 100 66Z', STRAW, 2, INK) +
        T(100, 82, 'CALLING', 9, INK, MONO, ' font-weight="700"') + P('M78 32h12M110 32h12', 'none', 2, INK) +
        Rc(66, 108, 68, 10, 5, SILVER, 3) +
        Rc(62, 116, 76, 82, 12, '#ff8fb8', 4) + P('M118 116h8Q138 116 138 128V186Q138 198 126 198H118Z', '#e8608e') + keys +
        P('M66 186q-14 2 -18 -10', 'none', 2.4, INK) + berry(46, 170, 2.2);
    } },
    letter: { burst: PINK, sfx: 'page', art: function (u) {
      return Rc(26, 84, 148, 92, 4, PAPER2, 4) +
        '<g transform="rotate(-4 100 70)">' + Rc(44, 26, 112, 112, 2, '#fffdf6', 3.4) +
        P('M54 74H146M54 90H146M54 106H146M54 122H146', 'none', 1.4, '#7f97c4') +
        T(96, 62, 'Hey, Nana', 21, INK, HAND, ' font-style="italic"') + P('M58 84q20 -6 40 0t40 0M58 100q24 -6 48 0t30 -2', 'none', 2, INK, ' opacity=".7"') + '</g>' +
        P('M26 100L100 146L174 100L174 176L26 176Z', '#f6efe2', 4) + tone(u, 'M100 146L174 100L174 176Z') +
        P('M26 176L86 136M174 176L114 136', 'none', 2.4, INK) +
        P('M100 160C86 150 84 140 90 136C94 134 98 136 100 140C102 136 106 134 110 136C116 140 114 150 100 160Z', STRAW, 2.4, INK) +
        Rc(146, 108, 22, 26, 1, '#ffd1e0', 2, INK, ' stroke-dasharray="3 2"') + T(157, 126, '707', 10, RED);
    } },
    'nail-polish': { burst: PINK, sfx: 'click', art: function (u) {
      return Rc(84, 16, 32, 52, 7, INK2, 4) + P('M90 24V60', 'none', 4, '#fff', ' opacity=".55"') +
        Rc(86, 66, 28, 16, 2, SILVER, 3.4) +
        P('M66 98C66 88 74 82 84 82L116 82C126 82 134 88 134 98L134 168C134 178 126 184 116 184L84 184C74 184 66 178 66 168Z', '#ffffff', 4, INK, ' fill-opacity=".55"') +
        P('M71 104C71 96 76 92 84 92L116 92C124 92 129 96 129 104L129 166C129 173 124 178 116 178L84 178C76 178 71 173 71 166Z', '#b0102a') +
        tone(u, 'M110 92L116 92C124 92 129 96 129 104L129 166C129 173 124 178 116 178L110 178Z') +
        P('M78 102V168', 'none', 5, '#fff', ' opacity=".75"') +
        Rc(84, 122, 32, 22, 2, PAPER, 2.4) + P('M100 126L102.5 131L108 131.5L104 135L105 140L100 137.5L95 140L96 135L92 131.5L97.5 131Z', GOLD, 1.4, INK) +
        twinkle(150, 60, 1.1, '#fff', 0) + twinkle(52, 132, 0.8, PINK, 0.5);
    } },
    'nail-brush': { burst: PINK, sfx: 'click', art: function () {
      return P('M28 166C60 150 90 172 124 154C142 146 160 150 172 158', 'none', 18, INK) + P('M28 166C60 150 90 172 124 154C142 146 160 150 172 158', 'none', 11, '#b0102a') +
        P('M40 160C58 154 74 160 90 160', 'none', 3, '#ff6a84', ' opacity=".8"') +
        '<g transform="translate(96 84) rotate(-40)">' +
        Rc(-80, -8, 92, 16, 8, PINK, 3.6) + P('M-72 -3H4', 'none', 3, '#fff', ' opacity=".7"') +
        Rc(10, -9, 26, 18, 2, SILVER, 3.4) + P('M14 -9V9M22 -9V9', 'none', 1.6, INK) +
        P('M36 -7C52 -6 64 -2 74 0C64 2 52 6 36 7Z', '#b0102a', 3, INK) + '</g>' +
        '<g class="st-drip">' + P('M152 50C148 58 146 62 146 65C146 69 149 71 152 71C155 71 158 69 158 65C158 62 156 58 152 50Z', '#b0102a', 2.4, INK) + '</g>';
    } },
    'paw-print': { burst: GOLD, sfx: 'select', art: function () {
      var paw = function (x, y, r, i) {
        return '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ')"><g class="st-step" style="animation-delay:' + (i * 0.22) + 's">' +
          P('M0 2C-12 2 -18 12 -15 19C-12 25 -5 24 0 22C5 24 12 25 15 19C18 12 12 2 0 2Z', INK) +
          E(-15, -9, 5.5, 7, INK) + E(-5.5, -17, 5.5, 7.5, INK) + E(5.5, -17, 5.5, 7.5, INK) + E(15, -9, 5.5, 7, INK) +
          E(0, 14, 6, 4, '#c97a92', 0, '', ' opacity=".55"') + '</g></g>';
      };
      return paw(48, 166, 34, 0) + paw(84, 132, 20, 1) + paw(104, 92, 38, 2) + paw(142, 62, 24, 3);
    } },
    ticket: { burst: GOLD, sfx: 'page', art: function (u) {
      var bars = '';
      for (var i = 0; i < 12; i++) bars += Rc(146 + i * 3, 112, i % 3 ? 1.4 : 2.4, 20, 0, INK);
      return '<g transform="rotate(-9 100 100)">' +
        Rc(12, 56, 176, 88, 6, PAPER, 4) + Rc(12, 56, 124, 24, 0, RED, 0) + P('M12 80H136', 'none', 2.4, INK) +
        tone(u, 'M12 120H136V144H18Q12 144 12 138Z') +
        T(74, 73, 'LIVE TOUR &#183; 707', 12, PAPER, MONO, ' font-weight="700"') +
        T(74, 116, 'BLAST', 40, INK, null, ' letter-spacing="2"') + T(74, 136, 'ADMIT ONE', 11, RED, MONO, ' font-weight="700"') +
        P('M138 60V140', 'none', 2.4, INK, ' stroke-dasharray="4 4"') + C(138, 56, 7, INK) + C(138, 144, 7, INK) +
        T(162, 80, 'No.', 10, INK, MONO) + T(162, 102, '0707', 15, RED) + bars +
        '</g>' + twinkle(170, 40, 1, '#fff', 0.2) + twinkle(30, 168, 0.8, PINK, 0.6);
    } },
    'demo-cd': { burst: INK2, sfx: 'chime', art: function (u) {
      return '<g class="st-spin">' + C(124, 100, 64, '#dfe3ea', 4) +
        P('M124 40A60 60 0 0 1 184 100', 'none', 8, PINK, ' opacity=".55"') + P('M124 52A48 48 0 0 1 172 100', 'none', 6, '#7fe0ff', ' opacity=".5"') +
        P('M64 100A60 60 0 0 1 88 52', 'none', 7, GOLD, ' opacity=".5"') + P('M124 160A60 60 0 0 1 72 130', 'none', 6, '#b9a6ff', ' opacity=".45"') +
        C(124, 100, 22, '#f2f5fa', 3) + C(124, 100, 8, INK) +
        T(150, 146, '707 &#9829;', 13, RED, HAND, ' transform="rotate(-30 150 146)"') + '</g>' +
        Rc(16, 40, 104, 124, 3, PAPER2, 4) + tone(u, 'M96 40H120V164H96Z') +
        T(66, 92, 'BLAST', 30, INK, HAND, ' font-weight="700" transform="rotate(-6 66 92)"') + T(66, 120, 'demo', 22, RED, HAND, ' transform="rotate(-4 66 120)"') +
        P('M30 136q16 -6 34 0t40 -2', 'none', 2.4, INK, ' opacity=".6"') + Rc(40, 30, 50, 16, 0, GOLD, 0, '', ' opacity=".6" transform="rotate(-6 65 38)"');
    } },
    tabloid: { burst: RED, sfx: 'page', art: function (u) {
      var col = '';
      for (var i = 0; i < 7; i++) col += P('M124 ' + (94 + i * 8) + 'H' + (i === 6 ? 150 : 164), 'none', 3, '#8a8580');
      for (var j = 0; j < 3; j++) col += P('M36 ' + (166 + j * 8) + 'H' + (j === 2 ? 120 : 164), 'none', 3, '#8a8580');
      return '<g transform="rotate(5 100 100)">' + Rc(26, 12, 148, 180, 1, '#f7f3ea', 4) +
        Rc(26, 12, 148, 28, 0, INK, 0) + T(100, 33, 'WEEKLY RUMOUR', 17, PAPER, null, ' letter-spacing="1"') +
        T(100, 78, 'CAUGHT?!', 38, RED, null, ' stroke="' + INK + '" stroke-width="1.5"') +
        Rc(36, 88, 80, 66, 0, '#9a948c', 3) + tone(u, 'M36 88H116V154H36Z') +
        C(62, 112, 10, INK) + P('M46 154C46 136 54 126 62 126C70 126 78 136 78 154Z', INK) +
        C(92, 110, 10, INK) + P('M76 154C76 134 84 124 92 124C100 124 108 134 108 154Z', INK) +
        Rc(48, 106, 58, 7, 0, '#000') + col +
        E(76, 121, 46, 40, 'none', 3.4, RED, ' transform="rotate(-8 76 121)" stroke-dasharray="180 12"') + '</g>';
    } }
  };
  // Friendly aliases so writers can use the obvious word.
  var ALIAS = { glasses: 'strawberry-glasses', 'strawberry-glass': 'strawberry-glasses', crack: 'cracked-glass', 'broken-glass': 'cracked-glass', cigs: 'cigarettes', 'cigarette-pack': 'cigarettes', 'guitar-pick': 'pick', cd: 'demo-cd', demo: 'demo-cd', polish: 'nail-polish', brush: 'nail-brush', paw: 'paw-print', 'cat-paw': 'paw-print', 'tour-ticket': 'ticket', strawberrycake: 'cake', 'strawberry-cake': 'cake', newspaper: 'tabloid', 'tabloid-page': 'tabloid', 'orb-lighter': 'lighter' };
  // Existing NG.Art icons that read well large.
  var ICON_PROPS = ['glass', 'strawberry', 'pin', 'cups', 'shoes', 'tartan', 'door707', 'guitar', 'bass', 'drumsticks', 'shades', 'star', 'demon'];

  function propId(id) { id = String(id || '').toLowerCase(); return ALIAS[id] || id; }
  function hasProp(id) { id = propId(id); return !!PROPS[id] || ICON_PROPS.indexOf(id) !== -1; }

  function propSvg(id) {
    id = propId(id);
    var u = uid();
    var defs = '<defs><pattern id="' + u + 'ht" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="3" cy="3" r="1.25" fill="' + INK + '" opacity=".38"/></pattern></defs>';
    if (PROPS[id]) {
      var body;
      try { body = PROPS[id].art(u); } catch (e) { return ''; }
      return '<svg class="st-prop-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" aria-hidden="true">' + defs + body + '</svg>';
    }
    if (ICON_PROPS.indexOf(id) !== -1) {
      try { return NG.Art && NG.Art.icon ? NG.Art.icon(id) : ''; } catch (e) { return ''; }
    }
    return '';
  }

  function burstSvg(col) {
    var pts = [];
    for (var i = 0; i < 32; i++) {
      var r = i % 2 ? 76 : 98, t = i / 32 * Math.PI * 2;
      pts.push(r1(100 + Math.cos(t) * r) + ',' + r1(100 + Math.sin(t) * r));
    }
    var u = uid();
    var dots = col === INK2 ? PAPER : INK;
    return '<svg class="st-burst" viewBox="0 0 200 200" aria-hidden="true"><defs><pattern id="' + u + 'b" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="3.5" cy="3.5" r="1.4" fill="' + dots + '" opacity=".22"/></pattern></defs>' +
      '<polygon points="' + pts.join(' ') + '" fill="' + col + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/><polygon points="' + pts.join(' ') + '" fill="url(#' + u + 'b)"/>' +
      '<circle cx="100" cy="100" r="70" fill="' + PAPER + '" opacity=".1"/></svg>';
  }

  function showProp(id, caption) {
    if (!ready() || fast() || !hasProp(id)) return false;
    var art = propSvg(id);
    if (!art) return false;
    sync();
    closeProp(true);
    var def = PROPS[propId(id)] || { burst: GOLD, sfx: 'chime' };
    var layer = el('div', 'st-prop-card');
    var inner = el('div', 'st-prop-in', burstSvg(def.burst) + '<div class="st-prop-art">' + art + '</div>' + '<i class="st-tape"></i>');
    layer.appendChild(inner);
    propLayer.appendChild(layer);
    var dim = el('div', 'st-dim');
    veil.appendChild(dim);
    prop = { node: layer, inner: inner, dim: dim, docked: false, age: 0, caption: !!caption };
    sfx(def.sfx);
    var still = amp() === 0;
    anim(dim, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
    anim(inner, still ? [{ opacity: 0 }, { opacity: 1 }] : [
      { opacity: 0, transform: 'scale(.3) rotate(-14deg)' },
      { opacity: 1, transform: 'scale(1.08) rotate(3deg)', offset: 0.6 },
      { opacity: 1, transform: 'scale(1) rotate(-2deg)' }
    ], { duration: still ? 220 : 560, easing: 'cubic-bezier(.2,.9,.3,1.2)', fill: 'backwards' });
    var burst = inner.querySelector('.st-burst');
    if (burst && amp()) anim(burst, [{ transform: 'rotate(-30deg) scale(.6)' }, { transform: 'rotate(0deg) scale(1)' }], { duration: 700, easing: 'cubic-bezier(.2,.9,.3,1)' });
    return true;
  }

  function dockProp() {
    if (!prop || prop.docked) return;
    var p = prop;
    p.docked = true;
    p.age = 0;
    fade(p.dim, 0, 300, true);
    var before = rect(p.node);
    propLayer.classList.add('docked');
    var after = rect(p.node);
    if (before && after && after.width) {
      // FLIP: jump to the corner, then animate from where it was.
      var dx = (before.left + before.width / 2) - (after.left + after.width / 2), dy = (before.top + before.height / 2) - (after.top + after.height / 2), s = before.width / after.width;
      anim(p.inner, [{ transform: 'translate(' + r1(dx) + 'px, ' + r1(dy) + 'px) scale(' + r1(s * 100) / 100 + ') rotate(-2deg)' }, { transform: 'translate(0, 0) scale(1) rotate(-4deg)' }], { duration: 480, easing: 'cubic-bezier(.3,.8,.3,1)' });
    }
  }
  function rect(n) { try { return n.getBoundingClientRect(); } catch (e) { return null; } }

  function closeProp(instant) {
    if (!prop) return;
    var p = prop;
    prop = null;
    kill(p.dim);
    var gone = function () { kill(p.node); if (propLayer && !propLayer.querySelector('.st-prop-card')) propLayer.classList.remove('docked'); };
    if (instant) { gone(); return; }
    var a = anim(p.inner, [{ opacity: 1, transform: 'scale(1) rotate(-4deg)' }, { opacity: 0, transform: 'scale(.6) rotate(8deg)' }], { duration: 260, easing: 'ease-in', fill: 'forwards' }, gone);
    if (!a) gone();
  }

  /* ---------- flourishes on main.js overlays ---------- */

  function flourish(kind, node) {
    if (!node) return;
    sync();
    closeProp(true);
    if (kind === 'polaroid') {
      if (!noFlash() && !fast()) {
        var f = el('div', 'st-camflash');
        node.insertBefore(f, node.firstChild);
        later(function () { kill(f); }, 800);
      }
      var card = node.querySelector('.polaroid');
      if (card) card.classList.add('st-develop');
    } else if (kind === 'keepsake') {
      node.insertBefore(el('div', 'st-rays'), node.firstChild);
      var artBox = node.querySelector('.keepsake-art');
      if (artBox) artBox.insertAdjacentHTML('beforeend', '<span class="st-sparks"><svg viewBox="0 0 40 100" aria-hidden="true">' + twinkle(22, 24, 0.9, GOLD, 0.1) + twinkle(14, 76, 0.7, '#fff', 0.3) + '</svg><svg viewBox="0 0 40 100" aria-hidden="true">' + twinkle(18, 30, 1.1, '#fff', 0.5) + twinkle(26, 80, 0.8, PINK, 0.9) + '</svg></span>');
    } else if (kind === 'letter') {
      node.classList.add('st-paper');
    }
  }

  NG.Stage = {
    attach: attach, reset: reset, mounted: mounted, onLine: onLine, sync: sync, fastForward: fastForward,
    say: say, narrate: narrate, clearCast: clearCast, changeScene: changeScene,
    act: act, fx: runFx, prop: showProp, dockProp: dockProp, closeProp: closeProp, hasProp: hasProp, propSvg: propSvg,
    flourish: flourish,
    moves: ACTS.slice(), effects: Object.keys(FX), props: Object.keys(PROPS).concat(ICON_PROPS)
  };
})();
