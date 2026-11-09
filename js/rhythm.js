/* HEY, NANA - Room 707: the gig. Canvas highway, audio-clock judgement, a band that falls apart audibly. */
window.NG = window.NG || {};
(function () {
  'use strict';

  window.NG.Curses = [
    { id: 'speed-up', name: 'Triple Espresso', desc: 'The Demon Lord spiked the rider. Notes arrive 35% faster.', mult: 1.25 },
    { id: 'hidden', name: 'Stage Fright', desc: 'Notes lose their nerve and vanish before the line. Trust your ears.', mult: 1.5 },
    { id: 'mirror', name: 'Wrong Way Round', desc: 'The band swapped sides during soundcheck. Lanes are mirrored.', mult: 1.2 },
    { id: 'no-blast', name: "Manager's Orders", desc: 'No BLAST mode. "Think of the insurance," he purrs.', mult: 1.3 },
    { id: 'one-strike', name: 'Clause Seven', desc: 'One miss and your contract is void. Small print: he wrote it in glitter.', mult: 2 },
    { id: 'tight', name: 'Metronome Tyranny', desc: 'Timing windows shrink by 30%. He is counting. Out loud.', mult: 1.4 },
    { id: 'tough-room', name: 'Tough Room', desc: 'Your crowd was replaced by music critics. Misses hurt double.', mult: 1.25 }
  ];

  var COLORS = ['#f4c430', '#35d6c8', '#ff3b3b', '#ff6fa3'];
  var MEMBERS = ['YASU', 'SHIN', 'NOBU', 'NANA'];
  var KEY_LABELS = ['D', 'F', 'J', 'K'];
  // Touch devices (phones and iPads) never show keyboard hints.
  var IS_TOUCH = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || navigator.maxTouchPoints > 0;
  var KEYMAP = { KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 };
  var FONT = 'Impact, "Haettenschweiler", "Arial Narrow Bold", sans-serif';
  var HINT_KEY = 'ng_rhythm_hint_seen_v1';

  var WINDOWS = {
    hachi: { perfect: 0.09, good: 0.2, miss: 0.25 },
    nana: { perfect: 0.07, good: 0.16, miss: 0.2 },
    demon: { perfect: 0.05, good: 0.11, miss: 0.15 }
  };
  var CROWD = {
    hachi: { perfect: 1.6, good: 1, miss: 3 },
    nana: { perfect: 1.5, good: 0.9, miss: 3.5 },
    demon: { perfect: 1.2, good: 0.5, miss: 6 }
  };
  var RIVAL_SKILL = { hachi: 0.6, nana: 0.7, demon: 0.8 };
  var BOSS_REQ = { hachi: 0.55, nana: 0.64, demon: 0.72 };
  var BLAST_SECONDS = 8;

  var SHOUTS = {
    10: 'YASU NODDED. ONCE. THAT IS HUGE.',
    25: 'SHIN LOOKED UP FROM HIS PHONE!',
    50: 'NOBU IS CRYING AGAIN! GOOD CRYING!',
    75: 'THE LANDLORD IS BANGING ON THE FLOOR!',
    100: 'HACHI DROPPED HER SHORTCAKE!',
    150: 'NANA ALMOST SMILED! ALMOST!',
    200: 'THE AMP IS SMOKING. DO NOT STOP.',
    300: 'SOMEONE CALL THE TABLOIDS!',
    400: 'BLAST IS NOW LEGALLY A WEATHER EVENT.'
  };
  var TAUNTS = {
    shuffle: ['"Let me rearrange the furniture, darling."', '"Everyone change seats. I insist."'],
    fakes: ['"Some of these notes are lying to you. Purple ones. Do not touch."', '"Ooh, counterfeit notes! Hands off the purple!"'],
    blackout: ['"Oops, I forgot to pay the electric bill."', '"Who turned off the lights? Me. It was me."'],
    lurch: ['"Tempo is a social construct. Enjoy the seasick scroll."', '"Hold on to your hair. The stage is drunk."']
  };
  var TRICK_NAMES = { shuffle: 'LANE SHUFFLE', fakes: 'FAKE NOTES', blackout: 'BLACKOUT', lurch: 'SPEED LURCH' };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rngFrom(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h += 0x6D2B79F5;
      var t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function comboMult(c) { return c >= 50 ? 4 : c >= 25 ? 3 : c >= 10 ? 2 : 1; }
  function rgba(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  function start(container, opts) {
    opts = opts || {};
    var NG = window.NG;
    var song = NG.Songs.get(opts.songId);
    if (!song) throw new Error('Unknown song: ' + opts.songId);
    var A = NG.Audio;
    var settings = opts.settings || NG.settings || {};
    var diff = WINDOWS[opts.difficulty] ? opts.difficulty : 'hachi';
    var persona = opts.persona || 'black';
    var mode = opts.mode || 'normal';
    var curseIds = (opts.curses || []).filter(function (id) { return NG.Curses.some(function (c) { return c.id === id; }); });
    var cursed = {}; curseIds.forEach(function (id) { cursed[id] = true; });
    var curseMult = NG.Curses.reduce(function (m, c) { return cursed[c.id] ? m * c.mult : m; }, 1);
    var reduce = !!settings.reduceFlash;
    var tighten = cursed.tight ? 0.7 : 1;
    // Touch screens add latency and fingers cover the notes, so phones get roomier windows.
    var touchEase = IS_TOUCH ? 1.2 : 1;
    var WIN = { perfect: WINDOWS[diff].perfect * tighten * touchEase, good: WINDOWS[diff].good * tighten * touchEase, miss: WINDOWS[diff].miss * tighten * touchEase };
    var CROWDC = CROWD[diff];
    var canFail = diff !== 'hachi';
    // Notes take longer to fall on phones and on the easiest difficulty, giving more time to read them.
    var baseApproach = 1.55 * (IS_TOUCH ? 1.2 : 1) * (diff === 'hachi' ? 1.15 : 1) / (settings.speed || 1) / (cursed['speed-up'] ? 1.35 : 1);

    /* ---------- DOM ---------- */
    var prevPosition = null;
    if (getComputedStyle(container).position === 'static') { prevPosition = container.style.position; container.style.position = 'relative'; }
    var root = document.createElement('div');
    root.className = 'rg-root' + (reduce ? ' rg-calm' : '');
    if (container.clientHeight < 80) root.className += ' rg-fixed';
    var curseChips = curseIds.map(function (id) {
      var c = NG.Curses.filter(function (x) { return x.id === id; })[0];
      return '<span>' + c.name + '</span>';
    }).join('');
    var shields = persona === 'pink' ? 3 : 0;
    var modeHtml = '';
    if (mode === 'duel') {
      modeHtml = '<div class="rg-versus"><span class="rg-vs-face rg-vs-nana"></span><div class="rg-versus-mid">' +
        '<div class="rg-mode-names"><span>BLAST</span><span class="rg-rival-score">TRAPNEST</span></div><div class="rg-tug"><i></i></div>' +
        '</div><span class="rg-vs-face rg-vs-reira"></span></div>';
    } else if (mode === 'boss') {
      modeHtml = '<div class="rg-mode-names"><span>THE DEMON LORD</span><span class="rg-boss-text"></span></div><div class="rg-boss"><i></i></div>';
    }
    root.innerHTML =
      '<canvas class="rg-canvas"></canvas>' +
      '<div class="rg-stage"></div><div class="rg-avatars"></div>' +
      '<div class="rg-hachi"></div><div class="rg-bubble"></div><div class="rg-puppy"></div>' +
      '<div class="rg-cutin"><div class="rg-cutin-band"><div class="rg-cutin-face"></div><b>BLAST!</b></div></div>' +
      '<div class="rg-hud">' +
        '<div class="rg-hud-top">' +
          '<div class="rg-score"><small>SCORE</small><b>0</b></div>' +
          '<div class="rg-song">' + esc(song.title) + '<em>' + diff.toUpperCase() + (curseMult > 1 ? ' &times;' + curseMult.toFixed(2) : '') + '</em>' +
            (curseChips ? '<div class="rg-curses">' + curseChips + '</div>' : '') + '</div>' +
          '<div class="rg-shields"></div>' +
          '<button class="rg-pause" aria-label="Pause">II</button>' +
        '</div>' +
        '<div class="rg-meters">' +
          '<div class="rg-meter"><label>CROWD</label><div class="rg-bar crowd"><i></i></div></div>' +
          '<div class="rg-meter"><label>BLAST</label><div class="rg-bar blastbar"><i></i></div></div>' +
        '</div>' +
        '<div class="rg-mode"' + (modeHtml ? '' : ' hidden') + '>' + modeHtml + '</div>' +
      '</div>' +
      '<button class="rg-blast">BLAST</button>' +
      '<div class="rg-safe-probe"></div>' +
      '<div class="rg-shout"></div><div class="rg-warn"></div>' +
      '<div class="rg-banner" hidden></div><div class="rg-overlay" hidden></div>';
    container.appendChild(root);

    function $(s) { return root.querySelector(s); }
    function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
    var canvas = $('.rg-canvas'), g = canvas.getContext('2d'), probe = $('.rg-safe-probe');
    var ui = {
      hud: $('.rg-hud'), score: $('.rg-score b'), crowd: $('.rg-bar.crowd'), crowdFill: $('.rg-bar.crowd i'),
      blastFill: $('.rg-bar.blastbar i'), blast: $('.rg-blast'), blastMeter: $('.rg-bar.blastbar').parentNode,
      shields: $('.rg-shields'), shout: $('.rg-shout'), warn: $('.rg-warn'), banner: $('.rg-banner'), overlay: $('.rg-overlay'),
      tug: $('.rg-tug i'), rivalScore: $('.rg-rival-score'), bossFill: $('.rg-boss i'), bossText: $('.rg-boss-text')
    };
    if (cursed['no-blast']) { ui.blast.hidden = true; ui.blastMeter.style.visibility = 'hidden'; }


    /* ---------- the band, in person ---------- */
    var hasArt = !!(NG.Art && NG.Art.portrait);
    var els = {
      stage: $('.rg-stage'), avatars: $('.rg-avatars'), hachi: $('.rg-hachi'), bubble: $('.rg-bubble'),
      puppy: $('.rg-puppy'), cutin: $('.rg-cutin'), cutinFace: $('.rg-cutin-face'),
      vsNana: $('.rg-vs-nana'), vsReira: $('.rg-vs-reira')
    };
    /* A slot parses each portrait once and swaps the cached node, so an expression change is cheap. */
    function makeSlot(el, id, expr) {
      var slot = {
        el: el, nodes: {}, id: null, expr: null, swapped: 0,
        set: function (nid, nexpr, force) {
          if (!hasArt || (nid === slot.id && nexpr === slot.expr)) return;
          var now = performance.now();
          if (!force && slot.id === nid && now - slot.swapped < 180) return;
          var key = nid + '|' + nexpr, node = slot.nodes[key];
          if (!node) {
            var tpl = document.createElement('div');
            try { tpl.innerHTML = NG.Art.portrait(nid, nexpr); } catch (e) { return; }
            node = tpl.firstElementChild;
            if (!node) return;
            slot.nodes[key] = node;
          }
          if (slot.node && slot.node.parentNode === el) el.replaceChild(node, slot.node);
          else el.appendChild(node);
          slot.node = node; slot.id = nid; slot.expr = nexpr; slot.swapped = now;
        }
      };
      if (id) slot.set(id, expr, true);
      return slot;
    }
    var PROPS = {
      yasu: '<svg viewBox="0 0 120 50"><ellipse cx="60" cy="30" rx="30" ry="19" fill="#d3122a" stroke="#f3ece0" stroke-width="3"/><ellipse cx="60" cy="30" rx="11" ry="7" fill="#0d0b0c"/><ellipse cx="18" cy="20" rx="17" ry="6" fill="#f4c430" stroke="#0d0b0c" stroke-width="2"/><ellipse cx="102" cy="20" rx="17" ry="6" fill="#f4c430" stroke="#0d0b0c" stroke-width="2"/></svg>',
      shin: '<svg viewBox="0 0 120 40"><path d="M4 24Q14 6 34 14L76 17 116 8 118 16 76 25 34 30Q14 36 4 24Z" fill="#35d6c8" stroke="#0d0b0c" stroke-width="3"/><circle cx="26" cy="22" r="5" fill="#0d0b0c"/></svg>',
      nobu: '<svg viewBox="0 0 120 44"><path d="M6 30L20 8 42 18 38 28 62 20 112 12 114 20 66 28 44 40 18 42Z" fill="#ff3b3b" stroke="#f3ece0" stroke-width="3"/><circle cx="34" cy="28" r="4" fill="#0d0b0c"/></svg>',
      nana: '<svg viewBox="0 0 30 90"><rect x="13" y="16" width="4" height="74" fill="#c9c2b5"/><ellipse cx="15" cy="9" rx="8" ry="10" fill="#f3ece0" stroke="#0d0b0c" stroke-width="2"/><rect x="5" y="85" width="20" height="5" fill="#c9c2b5"/></svg>'
    };
    var BAND_SPOTS = {
      normal: { shin: 14, yasu: 32, nana: 52, nobu: 82 },
      boss: { shin: 9, yasu: 25, nana: 43, nobu: 62 },
      land: { nana: 8, nobu: 17, shin: 83, yasu: 92 },
      landBoss: { nana: 6, nobu: 13.5, yasu: 21, shin: 80 }
    };
    var bandSlots = {}, avatarSlots = [], hachiSlot = null, puppySlot = null, demonSlot = null, vsA = null, vsB = null;
    var demonEl = null;
    (function buildCast() {
      if (!hasArt) { els.hachi.style.display = 'none'; return; }
      var spots = mode === 'boss' ? BAND_SPOTS.boss : BAND_SPOTS.normal;
      if (mode === 'boss') {
        demonEl = document.createElement('div');
        demonEl.className = 'rg-member rg-demon';
        els.stage.appendChild(demonEl);
        demonSlot = makeSlot(demonEl, 'demon', 'smirk');
      }
      ['yasu', 'shin', 'nobu', 'nana'].forEach(function (id) {
        var el = document.createElement('div');
        el.className = 'rg-member rg-m-' + id;
        el.style.left = spots[id] + '%';
        var body = document.createElement('div');
        body.className = 'rg-member-body';
        el.appendChild(body);
        var prop = document.createElement('div');
        prop.className = 'rg-prop';
        prop.innerHTML = PROPS[id];
        el.appendChild(prop);
        els.stage.appendChild(el);
        bandSlots[id] = { el: el, slot: makeSlot(body, id, 'neutral'), transform: '' };
      });
      for (var i = 0; i < 4; i++) {
        var a = document.createElement('div');
        a.className = 'rg-avatar';
        els.avatars.appendChild(a);
        avatarSlots.push(makeSlot(a, null));
      }
      hachiSlot = makeSlot(els.hachi, 'hachi', 'neutral');
      puppySlot = makeSlot(els.puppy, 'hachi', 'sad');
      makeSlot(els.cutinFace, 'nana', 'smirk');
      if (els.vsNana) { vsA = makeSlot(els.vsNana, 'nana', 'neutral'); vsB = makeSlot(els.vsReira, 'reira', 'neutral'); }
    })();

    var CHEERS = {
      10: 'Go go go! That was so cool!', 25: 'That is MY band! I know them!', 50: 'I saved a strawberry for this!',
      75: 'I am screaming! Is this screaming?', 100: 'I may faint. Hold my cake!', 150: 'Nana! NANA! Look over here!',
      200: 'Somebody film this for my mum!', 300: 'I have lost my voice and one shoe!', 400: 'Are we allowed to be this good?'
    };
    var BOSS_CHEERS = ['Boo! Get off the stage, Demon guy!', 'His eyeliner is running! Keep going!', 'One more push! Do it for the cake!'];

    function hachiSay(text) {
      if (!hasArt) return;
      R.hachiPopAt = performance.now();
      els.bubble.textContent = text;
      els.bubble.classList.remove('show');
      void els.bubble.offsetWidth;
      els.bubble.classList.add('show');
    }
    function showPuppy(lane) {
      if (!hasArt) return;
      els.puppy.style.left = laneX(lane, 1) + 'px';
      els.puppy.style.top = (L.hit - 15 * L.unit - els.puppy.offsetHeight - 4) + 'px';
      els.puppy.classList.remove('show');
      void els.puppy.offsetWidth;
      els.puppy.classList.add('show');
    }
    function playCutin() {
      if (!hasArt) return;
      els.cutin.classList.remove('play');
      void els.cutin.offsetWidth;
      els.cutin.classList.add('play');
    }
    function resetCast() {
      if (!hasArt) return;
      els.bubble.classList.remove('show');
      els.puppy.classList.remove('show');
      els.cutin.classList.remove('play');
    }
    function layoutCast() {
      if (!hasArt) return;
      els.stage.style.top = L.hud + 'px';
      els.stage.style.height = Math.max(40, L.stageH) + 'px';
      els.stage.style.left = L.safe.l + 'px';
      els.stage.style.right = L.safe.r + 'px';
      var spots = BAND_SPOTS[L.land ? (mode === 'boss' ? 'landBoss' : 'land') : (mode === 'boss' ? 'boss' : 'normal')];
      MEMBER_ORDER.forEach(function (id) { bandSlots[id].el.style.left = spots[id] + '%'; });
      if (demonEl) demonEl.style.left = (L.land ? 91 : 86) + '%';
      var side = (L.W - L.base) / 2 - Math.max(L.safe.l, L.safe.r);
      var wide = side > 110;
      var below = L.H - L.safe.b - L.hit - 15 * L.unit - 30;
      var h = wide ? Math.min(clamp(L.H * 0.34, 120, 250), (side - 6) / 0.66) : clamp(below, 44, 150);
      var bw = ui.blast.offsetWidth || 104;
      var hw = h * (wide ? 0.66 : 0.9);
      els.hachi.style.height = h + 'px';
      els.hachi.style.width = hw + 'px';
      els.hachi.style.left = (L.safe.l + 2) + 'px';
      els.hachi.style.bottom = L.safe.b + 'px';
      els.hachi.classList.toggle('rg-crop', !wide);
      if (wide) {
        els.bubble.style.left = (L.safe.l + 8) + 'px'; els.bubble.style.bottom = (L.safe.b + h + 6) + 'px';
        els.bubble.style.maxWidth = Math.max(110, side - 14) + 'px';
      } else {
        els.bubble.style.left = (L.safe.l + hw + 6) + 'px'; els.bubble.style.bottom = (L.safe.b + 6) + 'px';
        els.bubble.style.maxWidth = Math.max(100, L.W - L.safe.l - L.safe.r - hw - bw - 26) + 'px';
      }
      var kids = els.avatars.children, size = avatarSize();
      for (var i = 0; i < kids.length; i++) {
        kids[i].style.width = kids[i].style.height = size + 'px';
        kids[i].style.left = (laneX(i, 1) - L.base / 8 + 3) + 'px';
        kids[i].style.top = (L.hit + 15 * L.unit + 3) + 'px';
      }
    }
    function avatarSize() { return L.land ? 20 : clamp(L.W * 0.062, 20, 40); }
    function setTransform(rec, value) {
      if (rec.transform === value) return;
      rec.transform = value;
      rec.el.style.transform = value;
    }
    var hachiRec = { el: els.hachi, transform: '' }, demonRec = { el: demonEl, transform: '' };
    var MEMBER_ORDER = ['yasu', 'shin', 'nobu', 'nana'];

    function updateCast(t, now) {
      if (!hasArt || !R) return;
      var calm = reduce ? 0.45 : 1;
      var beat = R.pulse * calm;
      var excited = R.blastOn ? 1.7 : 1;
      for (var i = 0; i < 4; i++) {
        var id = MEMBER_ORDER[i], rec = bandSlots[id];
        var sinceMiss = now - R.missAt[i], sincePop = now - R.popAt[i];
        var pop = sincePop < 170 ? 1 - sincePop / 170 : 0;
        var stumble = sinceMiss < 500 ? 1 - sinceMiss / 500 : 0;
        var expr;
        if (R.failed) expr = 'sad';
        else if (stumble > 0) expr = 'shock';
        else if (R.blastOn) expr = id === 'nana' ? 'smirk' : 'happy';
        else if (R.crowd < 22) expr = 'sad';
        else if (R.combo >= 25) expr = 'happy';
        else if (id === 'nana' && R.combo >= 10) expr = 'smirk';
        else expr = 'neutral';
        rec.slot.set(id, expr, stumble > 0);
        var y = -(beat * 7 * excited) - pop * 12;
        var rot = stumble * (i % 2 ? 9 : -9) * calm;
        var sc = 1 + pop * 0.09;
        var x = stumble * Math.sin(now / 28) * 5 * calm;
        setTransform(rec, 'translate(calc(-50% + ' + x.toFixed(1) + 'px),' + y.toFixed(1) + 'px) rotate(' + rot.toFixed(1) + 'deg) scale(' + sc.toFixed(3) + ')');
        var vSrc = srcAtLane(i, t);
        avatarSlots[i].set(MEMBER_ORDER[vSrc], 'neutral', true);
      }
      /* Hachi, front row */
      var hx = now - R.hachiMissAt, hp = now - R.hachiPopAt;
      var hExpr = R.failed ? 'sad' : hx < 650 ? 'shock' : R.crowd < 22 ? 'sad' : (R.combo >= 10 || R.blastOn) ? 'happy' : 'neutral';
      hachiSlot.set('hachi', hExpr, hx < 650);
      if (R.crowd < 22 && !R.cheeredLow && !R.failed && t > 2) { R.cheeredLow = true; hachiSay("It's fine! Big finish! Right? Big finish?"); }
      if (R.crowd > 45) R.cheeredLow = false;
      var hPop = hp < 300 ? 1 - hp / 300 : 0;
      setTransform(hachiRec, 'translateY(' + (-(beat * 6 * excited) - hPop * 14).toFixed(1) + 'px) scale(' + (1 + hPop * 0.14).toFixed(3) + ')');

      if (demonSlot) {
        var hpV = R.bossHp;
        var dExpr = R.bossDown ? 'sad' : now - R.tauntAt < 2600 ? 'happy' : hpV > 75 ? 'smirk' : hpV > 50 ? 'neutral' : hpV > 25 ? 'angry' : 'shock';
        demonSlot.set('demon', dExpr);
        var dy = R.bossDown ? 22 : -(beat * 4);
        setTransform(demonRec, 'translate(-50%,' + dy.toFixed(1) + 'px) rotate(' + (R.bossDown ? 7 : Math.sin(t * 1.3) * 2 * calm).toFixed(1) + 'deg)');
      }
      if (vsA && R.rival) {
        var lead = R.lastLead || 0;
        var done = R.over && !R.failed;
        var won = done && duelResult();
        vsA.set('nana', won ? 'happy' : done ? 'sad' : lead > 0 ? 'smirk' : lead < 0 ? 'angry' : 'neutral');
        vsB.set('reira', won ? 'sad' : done ? 'happy' : lead > 0 ? 'shock' : lead < 0 ? 'smirk' : 'neutral');
      }
    }

    /* ---------- listeners: all removed in destroy ---------- */
    var bound = [];
    function on(target, type, fn, o) { target.addEventListener(type, fn, o); bound.push([target, type, fn, o]); }

    /* ---------- layout ---------- */
    var L = { W: 1, H: 1, top: 100, hit: 500, base: 400, cx: 200, topScale: 0.24 };
    var halftone = null;
    function safeInsets() {
      var cs = getComputedStyle(probe);
      return { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
    }
    function resize() {
      var r = root.getBoundingClientRect();
      var W = Math.max(240, r.width), H = Math.max(240, r.height);
      var dpr = clamp(window.devicePixelRatio || 1, 1, 2);
      var pw = Math.round(W * dpr), ph = Math.round(H * dpr);
      if (canvas.width !== pw) canvas.width = pw;
      if (canvas.height !== ph) canvas.height = ph;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var land = W / H > 1.45 && H < 560;
      var tablet = !land && Math.min(W, H) >= 700;
      root.classList.toggle('rg-land', land);
      root.classList.toggle('rg-tablet', tablet);
      var safe = safeInsets();
      var hud = ui.hud.offsetHeight || 80;
      L.W = W; L.H = H; L.dpr = dpr; L.land = land; L.tablet = tablet; L.safe = safe; L.hud = hud;
      L.maxP = W < 700 || land ? 150 : 300;
      L.cx = W / 2;
      if (land) {
        L.base = Math.min(W * 0.56, H * 1.5);
        L.stageH = clamp(H * 0.44, 90, 170);
        L.floor = hud + L.stageH;
        L.top = hud + 6;
        L.hit = H - 54 - safe.b;
        L.topScale = 0.42;
        L.crowdY = L.floor;
      } else {
        L.base = W < 900 ? W * 0.98 : Math.min(W * 0.74, 900);
        L.hit = H - safe.b - clamp(H * 0.17, 74, 190);
        L.top = hud + clamp(H * 0.22, 96, 280);
        if (L.hit - L.top < 180) L.top = Math.max(hud + 8, L.hit - 180);
        L.stageH = L.top - hud - 2;
        L.floor = L.top - 2;
        L.topScale = W < 560 ? 0.3 : 0.22;
        L.crowdY = L.top;
      }
      L.unit = clamp(L.base / 400, 0.9, 1.6);
      var p = document.createElement('canvas');
      p.width = 8; p.height = 8;
      var pc = p.getContext('2d');
      pc.fillStyle = 'rgba(255,255,255,1)';
      pc.beginPath(); pc.arc(2, 2, 1, 0, 6.3); pc.arc(6, 6, 1, 0, 6.3); pc.fill();
      halftone = g.createPattern(p, 'repeat');
      buildCrowd();
      layoutCast();
    }
    function ease(s) { return Math.pow(Math.max(0, s), 1.7); }
    function yAt(s) { return L.top + (L.hit - L.top) * ease(s); }
    function scaleAt(s) { return L.topScale + (1 - L.topScale) * ease(s); }
    function edgeX(i, s) { return L.cx + (i - 2) * (L.base / 4) * scaleAt(s); }
    function laneX(l, s) { return L.cx + (l - 1.5) * (L.base / 4) * scaleAt(s); }

    /* ---------- crowd ---------- */
    var crowdP = [];
    function buildCrowd() {
      crowdP = [];
      var rng = rngFrom('crowd' + song.id);
      var rows = [{ y: L.crowdY + 8, r: 7, step: 16 }, { y: L.crowdY + 14, r: 10, step: 21 }];
      rows.forEach(function (row, ri) {
        for (var x = -10; x < L.W + 20; x += row.step) {
          crowdP.push({ x: x + rng() * 6, y: row.y, r: row.r * (0.85 + rng() * 0.3), phase: rng() * 6.28, phone: rng() < 0.2, arm: rng() < 0.5, row: ri });
        }
      });
      if ((L.W - L.base) / 2 > 70) {
        var sideLeft = L.cx - L.base / 2 - 8;
        for (var ry = 0; ry < 5; ry++) {
          var y = L.crowdY + 50 + Math.max(0, L.hit - L.crowdY - 40) * (ry / 4);
          var r = 11 + ry * 3;
          for (var sx = 0; sx < sideLeft; sx += r * 2.2) {
            crowdP.push({ x: sx + rng() * 8, y: y, r: r, phase: rng() * 6.28, phone: rng() < 0.15, arm: rng() < 0.55, row: 2 });
            crowdP.push({ x: L.W - sx - rng() * 8, y: y, r: r, phase: rng() * 6.28, phone: rng() < 0.15, arm: rng() < 0.55, row: 2 });
          }
        }
      }
    }

    /* ---------- per-run state ---------- */
    var R = null;
    var finished = false, destroyed = false, rafId = 0;
    var timers = [];
    function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }

    function buildTricks() {
      if (mode !== 'boss') return [];
      var list = song.tricks && song.tricks.length ? song.tricks.map(function (t) { return { type: t.type, t: t.t, dur: t.dur }; }) : null;
      if (!list) {
        var d = song.duration;
        list = [
          { type: 'shuffle', t: d * 0.2, dur: 9 }, { type: 'fakes', t: d * 0.38, dur: 10 },
          { type: 'blackout', t: d * 0.56, dur: 8 }, { type: 'lurch', t: d * 0.74, dur: 8 }
        ];
      }
      var shuffleN = 0;
      list.forEach(function (tr) {
        if (tr.type === 'shuffle') {
          tr.perm = shuffleN++ % 2 === 0 ? [2, 3, 0, 1] : [1, 0, 3, 2];
        }
      });
      return list;
    }

    function buildNotes(tricks, rng) {
      var chart = song.charts[diff];
      var notes = chart.map(function (n) {
        return { t: n.t, lane: cursed.mirror ? 3 - n.lane : n.lane, src: n.lane, dur: n.dur, fake: false, state: 0, holding: false, tail: 0 };
      });
      tricks.forEach(function (tr) {
        if (tr.type !== 'shuffle') return;
        var perm = tr.perm;
        notes.forEach(function (n) {
          if (n.t >= tr.t && n.t < tr.t + tr.dur) n.lane = perm[n.lane];
        });
      });
      /* a shuffled note must never land inside a hold already sitting in that lane */
      notes.sort(function (a, b) { return a.t - b.t || a.lane - b.lane; });
      var laneBusy = [-1, -1, -1, -1];
      notes = notes.filter(function (n) {
        if (n.t < laneBusy[n.lane] + 0.05) return false;
        laneBusy[n.lane] = n.t + n.dur;
        return true;
      });
      tricks.forEach(function (tr) {
        if (tr.type !== 'fakes') return;
        var step = (diff === 'hachi' ? 2 : 1) * (60 / song.bpm);
        for (var t = tr.t + step; t < tr.t + tr.dur - step; t += step * (diff === 'demon' ? 1 : 2)) {
          var lane = Math.floor(rng() * 4);
          var clash = notes.some(function (n) {
            if (n.lane === lane && n.t - 0.34 < t && n.t + n.dur + 0.34 > t) return true;
            return !n.fake && Math.abs(n.t - t) < 0.1;
          });
          if (!clash) notes.push({ t: t, lane: lane, src: lane, dur: 0, fake: true, state: 0, holding: false, tail: 0 });
        }
      });
      notes.sort(function (a, b) { return a.t - b.t || a.lane - b.lane; });
      return notes;
    }

    function buildRival(notes, rng) {
      var p = RIVAL_SKILL[diff], points = [], score = 0, combo = 0, i = 0;
      notes.forEach(function (n) {
        if (n.fake) return;
        i++;
        var hot = Math.sin(i / 37) * 0.09 + Math.sin(i / 11 + 1) * 0.05;
        var hit = rng() < p + hot;
        if (hit) {
          score += (rng() < 0.55 ? 300 : 150) * Math.min(3, comboMult(combo));
          combo++;
        } else combo = 0;
        points.push({ t: n.t, s: score });
      });
      return points;
    }

    function newRun() {
      var rng = rngFrom(song.id + diff);
      var tricks = buildTricks();
      var notes = buildNotes(tricks, rng);
      var real = notes.filter(function (n) { return !n.fake; }).length;
      var rival = mode === 'duel' ? buildRival(notes, rng) : null;
      /* lane labels: which member stands at each visual lane, over time */
      var baseMap = [0, 1, 2, 3];
      if (cursed.mirror) baseMap = [3, 2, 1, 0];
      tricks.forEach(function (tr) {
        if (tr.type === 'shuffle') {
          var m = [0, 0, 0, 0];
          for (var v = 0; v < 4; v++) { m[tr.perm[v]] = baseMap[v]; }
          tr.map = m;
        }
      });
      return {
        notes: notes, real: real, rival: rival, tricks: tricks, baseMap: baseMap, player: null,
        phase: 'idle', t0: 0, pausedAt: 0, simulated: false,
        score: 0, combo: 0, maxCombo: 0, perfect: 0, good: 0, miss: 0, crowd: 50, blast: 0, blastOn: false, blastEnd: 0,
        shields: shields, maxShields: shields, bossHp: 100, bossDown: false, bossPhase: 0, tricked: {},
        leadChanged: 0, lastLead: 0, down: [0, 0, 0, 0], laneFlash: [0, 0, 0, 0], laneHit: [0, 0, 0, 0],
        firstVisible: 0, particles: [], pops: [], rings: [], shake: 0, flash: 0, zoom: 0, pulse: 0, beatIdx: 0, lastBeat: 0,
        missAt: [-9, -9, -9, -9], popAt: [-9, -9, -9, -9], hachiMissAt: -9, hachiPopAt: -9, tauntAt: -9, cheeredLow: false,
        holds: [], over: false, failed: false, autoRng: rngFrom('auto' + song.id), lastShown: {}
      };
    }

    /* ---------- clock ---------- */
    function songTime() {
      if (!R) return 0;
      if (R.player) return R.player.time() - (settings.offsetMs || 0) / 1000;
      return (performance.now() - R.t0) / 1000 - (settings.offsetMs || 0) / 1000;
    }
    function inputTime(e) {
      var t = songTime();
      if (e && e.timeStamp) {
        var delta = (performance.now() - e.timeStamp) / 1000;
        if (delta > 0 && delta < 0.06) t -= delta;
      }
      return t;
    }

    /* ---------- feedback ---------- */
    function shout(text) {
      ui.shout.textContent = text;
      ui.shout.classList.remove('show');
      void ui.shout.offsetWidth;
      ui.shout.classList.add('show');
    }
    var warnTimer = 0;
    function warn(title, sub, ms) {
      ui.warn.innerHTML = '<small>' + esc(title) + '</small>' + esc(sub);
      ui.warn.classList.add('show');
      clearTimeout(warnTimer);
      warnTimer = later(function () { ui.warn.classList.remove('show'); }, ms);
    }
    function spark(x, y, color, n, power) {
      var P = R.particles;
      for (var i = 0; i < n && P.length < L.maxP; i++) {
        var a = Math.random() * 6.28, sp = (Math.random() * 0.8 + 0.2) * (power || 320);
        P.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 110, life: 0.3 + Math.random() * 0.4, age: 0, color: color, size: 2 + Math.random() * 3.2, g: 720 });
      }
    }
    function pop(text, lane, color, big) {
      R.pops.push({ text: text, x: laneX(lane, 1), y: L.hit - 34, age: 0, life: 0.55, color: color, rot: (Math.random() - 0.5) * 0.28, big: big ? 1.35 : 1 });
      if (R.pops.length > 16) R.pops.shift();
    }
    function ring(lane, color) { R.rings.push({ x: laneX(lane, 1), y: L.hit, age: 0, color: color }); }

    function refreshShields() {
      if (R.maxShields === 0) { ui.shields.innerHTML = ''; return; }
      var s = '';
      for (var i = 0; i < R.maxShields; i++) s += '<i class="' + (i < R.shields ? '' : 'gone') + '">&hearts;</i>';
      ui.shields.innerHTML = s;
    }

    /* ---------- judgement ---------- */
    function scoreFor(base) {
      var m = comboMult(R.combo) * (R.blastOn ? 2 : 1);
      R.score += base * m;
    }
    function addCrowd(v) { R.crowd = clamp(R.crowd + v, 0, 100); }
    function fillBlast(amount) {
      if (cursed['no-blast'] || R.blastOn) return;
      var unit = 230 / Math.max(40, R.real);
      var v = amount * unit * (1 + Math.min(R.combo, 50) / 50) * (persona === 'black' ? 1.25 : 1);
      R.blast = clamp(R.blast + v, 0, 100);
    }
    function bossDamage(q) {
      if (mode !== 'boss' || R.bossDown) return;
      R.bossHp = Math.max(0, R.bossHp - q * 100 / (R.real * BOSS_REQ[diff]));
      var stage = R.bossHp <= 25 ? 3 : R.bossHp <= 50 ? 2 : R.bossHp <= 75 ? 1 : 0;
      if (stage > R.bossPhase) {
        R.bossPhase = stage;
        shout(['', '"A scratch! I will bill you for that."', '"Stop! My eyeliner is RUNNING!"', '"I regret this entire encore!"'][stage]);
        hachiSay(BOSS_CHEERS[stage - 1]);
      }
      if (R.bossHp <= 0) {
        R.bossDown = true;
        shout('THE DEMON LORD TAKES A KNEE! FINISH THE SONG!');
        hachiSay('And STAY down, you glitter goblin!');
        A.sfx('cheer');
        R.shake = Math.max(R.shake, 12);
      }
    }

    function goodHit(n, kind) {
      var perfect = kind === 'perfect';
      if (perfect) R.perfect++; else R.good++;
      R.combo++;
      if (R.combo > R.maxCombo) R.maxCombo = R.combo;
      scoreFor(perfect ? 300 : 150);
      addCrowd(perfect ? CROWDC.perfect : CROWDC.good);
      fillBlast(perfect ? 1 : 0.5);
      bossDamage(perfect ? 1 : 0.65);
      if (R.player) R.player.hit(n.src);
      R.laneHit[n.lane] = 1;
      R.popAt[n.src] = performance.now();
      var c = COLORS[n.src];
      spark(laneX(n.lane, 1), L.hit, c, perfect ? 15 : 8, perfect ? 380 : 240);
      ring(n.lane, perfect ? '#ffffff' : c);
      pop(perfect ? 'PERFECT' : 'GOOD', n.lane, perfect ? '#fff27a' : '#ffffff', perfect);
      checkMilestone();
    }

    function checkMilestone() {
      var c = R.combo;
      if (SHOUTS[c]) {
        shout(c + ' COMBO! ' + SHOUTS[c]);
        hachiSay(CHEERS[c] || 'WOOOO! That is my band!');
        R.shake = Math.max(R.shake, c >= 100 ? 11 : 6);
        A.sfx('cheer');
        for (var i = 0; i < 4; i++) spark(laneX(i, 1), L.hit, COLORS[i], 26, 520);
      } else if (c > 400 && c % 100 === 0) {
        shout(c + ' COMBO! THE NEIGHBOURS HAVE JOINED THE BAND.');
        R.shake = Math.max(R.shake, 10);
        A.sfx('cheer');
      }
    }

    function missed(n, reason) {
      if (R.shields > 0) {
        R.shields--;
        refreshShields();
        if (!n.fake) R.good++;
        pop('PUPPY EYES!', n.lane, '#ffb0cd', true);
        showPuppy(n.lane);
        spark(laneX(n.lane, 1), L.hit, '#ff9dc4', 22, 300);
        ring(n.lane, '#ff9dc4');
        shout(['"...one last chance."', '"Fine. But only because of the eyes."', '"LAST ONE. Stop looking at me like that."'][R.maxShields - R.shields - 1]);
        A.sfx('chime');
        if (R.player && !n.fake) R.player.hit(n.src);
        return;
      }
      R.miss++;
      R.combo = 0;
      addCrowd(-CROWDC.miss * (cursed['tough-room'] ? 2 : 1));
      if (mode === 'boss' && !R.bossDown) R.bossHp = Math.min(100, R.bossHp + 0.35);
      if (R.player) R.player.miss(n.src);
      A.sfx('miss');
      R.laneFlash[n.lane] = 1;
      R.missAt[n.src] = R.hachiMissAt = performance.now();
      R.shake = Math.max(R.shake, 4);
      pop(reason || 'MISS', n.lane, '#ff5a5a', false);
      if (cursed['one-strike']) {
        if (canFail) { R.crowd = 0; }
        else shout('CLAUSE SEVEN WAIVED FOR BEGINNERS. HE IS SULKING.');
      }
      if (canFail && R.crowd <= 0) failSet();
    }

    function pressLane(lane, t) {
      var ns = R.notes, best = null, bestDt = 1, fake = null;
      for (var i = R.firstVisible; i < ns.length; i++) {
        var n = ns[i];
        if (n.t - t > WIN.miss) break;
        if (n.state !== 0 || n.lane !== lane) continue;
        var dt = Math.abs(t - n.t);
        if (n.fake) { if (dt <= 0.08) fake = n; continue; }
        if (dt < bestDt) { bestDt = dt; best = n; }
      }
      if (best && bestDt <= WIN.miss) {
        if (bestDt > WIN.good) {
          /* inside the window but too sloppy: a hit that counts as a miss */
          best.state = 2;
          missed(best);
          return;
        }
        var kind = bestDt <= WIN.perfect ? 'perfect' : 'good';
        best.state = 1;
        goodHit(best, kind);
        if (best.dur > 0) { best.holding = true; R.holds.push(best); }
        return;
      }
      if (fake) {
        fake.state = 2;
        missed(fake, 'FAKE!');
        if (!R.failed && mode === 'boss' && R.shields >= 0) shout('"HA! You touched the purple one!"');
      }
    }

    function press(lane, t) {
      if (!R || R.phase !== 'play') return;
      R.down[lane]++;
      R.laneFlash[lane] = Math.max(R.laneFlash[lane], 0.4);
      if (t >= -0.2) pressLane(lane, t);
    }
    function release(lane) {
      if (!R) return;
      R.down[lane] = Math.max(0, R.down[lane] - 1);
    }

    function completeHold(n) {
      n.holding = false;
      n.state = 3;
      scoreFor(120);
      addCrowd(0.6);
      fillBlast(0.4);
      spark(laneX(n.lane, 1), L.hit, COLORS[n.src], 12, 300);
      pop('HELD!', n.lane, COLORS[n.src], false);
    }
    function dropHold(n) {
      n.holding = false;
      n.state = 3;
      R.combo = 0;
      addCrowd(-1.5);
      if (R.player) R.player.miss(n.src);
      pop('DROPPED', n.lane, '#ffb15a', false);
    }

    function activateBlast(t) {
      if (!R || R.phase !== 'play' || cursed['no-blast'] || R.blastOn || R.blast < 100) return;
      R.blastOn = true;
      R.blastEnd = t + BLAST_SECONDS;
      R.flash = reduce ? 0 : 1;
      R.shake = Math.max(R.shake, 12);
      if (R.player) R.player.setBlast(true);
      A.sfx('blast');
      shout(persona === 'pink' ? 'HACHI GOES FERAL! BLAST MODE!' : 'BLAST MODE! EVERYBODY LOSE YOUR MINDS!');
      for (var i = 0; i < 4; i++) spark(laneX(i, 1), L.hit, COLORS[i], 40, 760);
      playCutin();
    }

    function failSet() {
      if (R.failed || R.over) return;
      R.failed = true;
      R.over = true;
      R.phase = 'over';
      if (R.player) R.player.stop(0.7);
      R.player = null;
      A.sfx('boo');
      ui.banner.innerHTML = 'BOOED OFF STAGE<small>THE CROWD WANTS ITS MONEY BACK</small>';
      ui.banner.hidden = false;
      later(function () { finish(false); }, 1900);
    }

    /* ---------- update ---------- */
    function update(t, dt) {
      var ns = R.notes;
      /* late notes */
      for (var i = R.firstVisible; i < ns.length; i++) {
        var n = ns[i];
        if (n.t - t > 0) break;
        if (n.state === 0 && t - n.t > (n.fake ? 0.1 : WIN.miss)) {
          n.state = 2;
          if (!n.fake) missed(n);
          if (R.over) return;
        }
      }
      while (R.firstVisible < ns.length) {
        var f = ns[R.firstVisible];
        if (f.state !== 0 && !f.holding && t - (f.t + f.dur) > 0.6) R.firstVisible++;
        else break;
      }
      /* holds */
      for (var h = R.holds.length - 1; h >= 0; h--) {
        var hn = R.holds[h];
        var end = hn.t + hn.dur;
        if (t >= end) { completeHold(hn); R.holds.splice(h, 1); continue; }
        if (R.down[hn.lane] <= 0 && t > (hn.grace || 0)) {
          if (end - t <= 0.14) completeHold(hn);
          else dropHold(hn);
          R.holds.splice(h, 1);
          continue;
        }
        R.score += 40 * dt * (R.blastOn ? 2 : 1);
        if (Math.random() < 0.55) spark(laneX(hn.lane, 1), L.hit, COLORS[hn.src], 1, 170);
      }
      /* BLAST */
      if (R.blastOn) {
        R.blast = clamp(100 * (R.blastEnd - t) / BLAST_SECONDS, 0, 100);
        if (t >= R.blastEnd) {
          R.blastOn = false; R.blast = 0;
          if (R.player) R.player.setBlast(false);
        }
      }
      /* beats */
      var bs = song.beats;
      while (R.beatIdx < bs.length && bs[R.beatIdx] <= t) {
        R.lastBeat = bs[R.beatIdx];
        R.beatIdx++;
        R.pulse = 1;
      }
      /* boss warnings */
      if (R.tricks.length) {
        for (var k = 0; k < R.tricks.length; k++) {
          var tr = R.tricks[k];
          if (!R.tricked[k] && t >= tr.t - 2.6) {
            R.tricked[k] = true;
            var pool = TAUNTS[tr.type];
            warn('TRICK INCOMING: ' + TRICK_NAMES[tr.type], pool[k % pool.length], 2500);
            R.tauntAt = performance.now();
            A.sfx('thud');
            if (!reduce) R.shake = Math.max(R.shake, 5);
          }
        }
      }
      /* duel lead changes */
      if (R.rival) {
        var rs = rivalScore(t);
        var lead = R.score > rs ? 1 : -1;
        if (lead !== R.lastLead && t > 8 && t - R.leadChanged > 7) {
          R.leadChanged = t;
          shout(lead > 0 ? 'BLAST TAKES THE LEAD! TRAPNEST LOOK NERVOUS!' : 'TRAPNEST PULL AHEAD! THE LASERS ARE WORKING!');
          hachiSay(lead > 0 ? 'Trapnest WHO? Sorry, who?' : 'Lasers are cheating! Somebody tell them!');
        }
        R.lastLead = lead;
      }
      if (t >= song.duration + 0.5 && !R.over) {
        R.over = true;
        R.phase = 'over';
        A.sfx('cheer');
        ui.banner.innerHTML = (mode === 'duel'
          ? (duelResult() ? 'WE BEAT TRAPNEST!' : 'TRAPNEST TOOK IT')
          : mode === 'boss'
            ? (R.bossHp <= 0 ? 'ENCORE DENIED!' : 'HE WANTS ANOTHER ENCORE...')
            : 'SET COMPLETE!') + '<small>THANK YOU, GOODNIGHT, PLEASE TIP THE BASSIST</small>';
        ui.banner.hidden = false;
        later(function () { finish(false); }, 1500);
      }
    }

    function rivalScore(t) {
      var list = R.rival;
      if (!list || !list.length) return 0;
      var lo = 0, hi = list.length - 1, idx = -1;
      while (lo <= hi) {
        var mid = (lo + hi) >> 1;
        if (list[mid].t <= t) { idx = mid; lo = mid + 1; } else hi = mid - 1;
      }
      if (idx < 0) return 0;
      var progress = clamp(t / song.duration, 0, 1);
      return list[idx].s * (1.12 - 0.12 * progress);
    }
    function rivalFinal() { return R.rival && R.rival.length ? R.rival[R.rival.length - 1].s : 0; }
    function duelResult() { return R.score >= rivalFinal() && !R.failed; }

    /* ---------- rendering ---------- */
    function draw(t, visualDt) {
      var W = L.W, H = L.H;
      g.save();
      var shake = R.shake * (reduce ? 0.35 : 1);
      if (shake > 0.2) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      if (R.blastOn && !reduce) {
        var z = 1 + 0.014 * R.pulse;
        g.translate(L.cx, L.hit); g.scale(z, z); g.translate(-L.cx, -L.hit);
      }
      drawStage(t, W);
      drawCrowd(t);
      drawHighway(t);
      drawNotes(t);
      drawReceptors(t);
      drawFx(visualDt);
      g.restore();
      if (R.flash > 0.01) {
        g.fillStyle = 'rgba(255,240,245,' + (R.flash * 0.65) + ')';
        g.fillRect(0, 0, W, H);
      }
      if (reduce && R.blastOn) {
        var v = g.createRadialGradient(L.cx, H / 2, Math.min(W, H) * 0.3, L.cx, H / 2, Math.max(W, H) * 0.75);
        v.addColorStop(0, 'rgba(255,111,163,0)'); v.addColorStop(1, 'rgba(255,111,163,0.22)');
        g.fillStyle = v; g.fillRect(0, 0, W, H);
      }
      if (t < 0 && R.phase === 'play') drawCount(t);
    }

    function drawCount(t) {
      var iv = R.countIv;
      var n = Math.ceil(-t / iv);
      if (n > 3) return;
      var f = 1 - ((-t) % iv) / iv;
      g.save();
      g.textAlign = 'center'; g.textBaseline = 'middle';
      var size = Math.min(L.W * 0.4, 170);
      g.font = 'italic ' + (size * (reduce ? 1 : 1.2 - 0.2 * f)) + 'px ' + FONT;
      g.fillStyle = '#d3122a'; g.fillText(String(n), L.cx + 6, (L.top + L.hit) / 2 + 6);
      g.fillStyle = '#f3ece0'; g.fillText(String(n), L.cx, (L.top + L.hit) / 2);
      g.restore();
    }

    function drawStage(t, W) {
      var pulse = reduce ? 0.4 : R.pulse;
      var gr = g.createLinearGradient(0, 0, 0, L.top + 30);
      gr.addColorStop(0, '#120609'); gr.addColorStop(1, R.blastOn ? '#6b0f26' : '#32070f');
      g.fillStyle = gr; g.fillRect(0, 0, W, L.H);
      if (halftone) {
        g.globalAlpha = 0.07; g.fillStyle = halftone; g.fillRect(0, 0, W, L.H); g.globalAlpha = 1;
      }
      /* the riser the band stands on */
      var floorY = L.floor;
      g.fillStyle = '#17090d'; g.fillRect(0, floorY - 12, W, 22);
      g.fillStyle = '#d3122a'; g.fillRect(0, floorY - 13, W, 2);
      /* lights */
      g.save();
      g.globalCompositeOperation = 'lighter';
      var count = R.blastOn ? 8 : 4;
      for (var i = 0; i < count; i++) {
        var ox = W * (i + 0.5) / count;
        var a = Math.sin(t * (R.blastOn ? 2.2 : 0.8) + i * 1.7) * 0.5;
        var len = L.top + 90, w = 42 + 34 * (R.blastOn ? 1 : 0.5);
        var ex = ox + Math.sin(a) * len;
        var col = COLORS[i % 4];
        var cg = g.createLinearGradient(ox, 0, ex, len);
        var alpha = (R.blastOn ? 0.26 : 0.15) + 0.14 * pulse * (i % 2 === (R.beatIdx & 1) ? 1 : 0.3);
        cg.addColorStop(0, rgba(col, alpha)); cg.addColorStop(1, rgba(col, 0));
        g.fillStyle = cg;
        g.beginPath(); g.moveTo(ox - 5, 0); g.lineTo(ox + 5, 0); g.lineTo(ex + w, len); g.lineTo(ex - w, len); g.closePath(); g.fill();
      }
      g.restore();
      if (R.blastOn) {
        g.save();
        g.translate(L.cx, Math.max(L.hud + 24, L.top - 22));
        g.rotate(-0.04);
        g.textAlign = 'center'; g.textBaseline = 'middle';
        var fs = Math.min(W * 0.2, 96);
        g.font = fs + 'px ' + FONT;
        var hue = reduce ? 345 : (t * 240) % 360;
        g.fillStyle = 'hsla(' + hue + ',95%,60%,0.85)';
        g.fillText('BLAST!', 0, 0);
        g.lineWidth = 2; g.strokeStyle = '#fff'; g.strokeText('BLAST!', 0, 0);
        g.restore();
      }
    }

    function drawCrowd(t) {
      var pulse = reduce ? 0.5 : R.pulse;
      var energy = clamp(R.crowd / 100, 0, 1);
      var amp = (2 + energy * 10) * (R.blastOn ? 2 : 1);
      g.fillStyle = '#040304';
      for (var i = 0; i < crowdP.length; i++) {
        var p = crowdP[i];
        var y = p.y - Math.abs(Math.sin(t * Math.PI * song.bpm / 60 + p.phase * 0.25)) * amp * (reduce ? 0.5 : 1) - pulse * 2;
        g.beginPath();
        g.arc(p.x, y, p.r, 0, 6.3);
        g.moveTo(p.x - p.r * 1.4, y + p.r * 3);
        g.lineTo(p.x - p.r * 1.3, y + p.r * 1.2);
        g.lineTo(p.x + p.r * 1.3, y + p.r * 1.2);
        g.lineTo(p.x + p.r * 1.4, y + p.r * 3);
        g.fill();
        if ((p.arm || R.blastOn) && energy > 0.3) {
          g.save();
          g.strokeStyle = '#040304'; g.lineWidth = Math.max(2, p.r * 0.45); g.lineCap = 'round';
          g.beginPath();
          var hx = p.x + Math.sin(t * 2 + p.phase) * p.r * 0.8 + p.r;
          var hy = y - p.r * 2.6;
          g.moveTo(p.x + p.r * 1.1, y + p.r * 1.2);
          g.lineTo(hx, hy);
          g.stroke();
          if (p.phone) {
            g.fillStyle = 'rgba(255,255,220,0.2)'; g.beginPath(); g.arc(hx, hy, p.r * 0.95, 0, 6.3); g.fill();
            g.fillStyle = '#fffbe6'; g.beginPath(); g.arc(hx, hy, p.r * 0.32, 0, 6.3); g.fill();
          }
          g.restore();
          g.fillStyle = '#040304';
        }
      }
    }

    function highwayPath() {
      g.beginPath();
      g.moveTo(edgeX(0, 0), L.top);
      g.lineTo(edgeX(4, 0), L.top);
      g.lineTo(edgeX(4, 1.06), yAt(1.06));
      g.lineTo(edgeX(0, 1.06), yAt(1.06));
      g.closePath();
    }

    function approachNow(t) {
      var ap = baseApproach;
      for (var i = 0; i < R.tricks.length; i++) {
        var tr = R.tricks[i];
        if (tr.type === 'lurch' && t > tr.t && t < tr.t + tr.dur) {
          var x = (t - tr.t) / tr.dur;
          var env = Math.min(1, Math.min(x, 1 - x) * 6);
          var amp = diff === 'hachi' ? 0.22 : diff === 'nana' ? 0.33 : 0.42;
          ap = ap * (1 + amp * env * Math.sin((t - tr.t) * 2 * Math.PI / 2.4));
        }
      }
      return ap;
    }
    function sAt(noteT, t, ap) { return 1 - (noteT - t) / ap; }

    function drawHighway(t) {
      var i;
      g.save();
      highwayPath();
      g.fillStyle = R.blastOn ? 'rgba(52,6,20,0.93)' : 'rgba(10,8,10,0.9)';
      g.fill();
      g.clip();
      if (halftone) { g.globalAlpha = 0.05; g.fillStyle = halftone; g.fillRect(0, 0, L.W, L.H); g.globalAlpha = 1; }

      for (i = 0; i < 4; i++) {
        var fl = Math.max(R.laneFlash[i], R.laneHit[i]);
        var src = srcAtLane(i, t);
        if (R.down[i] > 0) fl = Math.max(fl, 0.5);
        if (fl > 0.02) {
          var gd = g.createLinearGradient(0, L.hit, 0, L.top);
          var col = R.laneFlash[i] > R.laneHit[i] && R.laneFlash[i] === 1 ? '#ff2a2a' : COLORS[src];
          gd.addColorStop(0, rgba(col, 0.5 * fl)); gd.addColorStop(1, rgba(col, 0));
          g.fillStyle = gd;
          g.beginPath();
          g.moveTo(edgeX(i, 0), L.top); g.lineTo(edgeX(i + 1, 0), L.top);
          g.lineTo(edgeX(i + 1, 1.06), yAt(1.06)); g.lineTo(edgeX(i, 1.06), yAt(1.06));
          g.closePath(); g.fill();
        }
      }

      /* beat bars */
      var ap = approachNow(t);
      g.strokeStyle = 'rgba(243,236,224,0.15)';
      var bs = song.beats;
      for (i = Math.max(0, R.beatIdx - 2); i < bs.length; i++) {
        var s = sAt(bs[i], t, ap);
        if (s < 0) break;
        if (s > 1.05) continue;
        g.lineWidth = i % 4 === 0 ? 3 : 1;
        g.beginPath();
        g.moveTo(edgeX(0, s), yAt(s)); g.lineTo(edgeX(4, s), yAt(s));
        g.stroke();
      }
      g.restore();

      /* lane rails */
      g.lineWidth = 1.5;
      for (i = 0; i <= 4; i++) {
        g.strokeStyle = i === 0 || i === 4 ? (R.blastOn ? '#ff6fa3' : '#d3122a') : 'rgba(243,236,224,0.2)';
        g.lineWidth = i === 0 || i === 4 ? 3 : 1;
        g.beginPath();
        g.moveTo(edgeX(i, 0), L.top); g.lineTo(edgeX(i, 1.06), yAt(1.06));
        g.stroke();
      }

      /* blast flames on the rails */
      if (R.blastOn) {
        for (i = 0; i < 3 && R.particles.length < L.maxP; i++) {
          var side = Math.random() < 0.5 ? 0 : 4, sv = Math.random();
          R.particles.push({
            x: edgeX(side, sv), y: yAt(sv), vx: (side === 0 ? -1 : 1) * (40 + Math.random() * 90), vy: -120 - Math.random() * 180,
            life: 0.45, age: 0, color: Math.random() < 0.5 ? '#ff6fa3' : '#ffb347', size: 3 + Math.random() * 4, g: -80
          });
        }
        if (R.particles.length < L.maxP - 20 && Math.random() < 0.5) {
          R.particles.push({
            x: Math.random() * L.W, y: L.hud, vx: (Math.random() - 0.5) * 50, vy: 140 + Math.random() * 110,
            life: 1.8, age: 0, color: COLORS[Math.floor(Math.random() * 4)], size: 5, g: 40, conf: 1
          });
        }
      }
    }

    function srcAtLane(v, t) {
      for (var i = 0; i < R.tricks.length; i++) {
        var tr = R.tricks[i];
        if (tr.type === 'shuffle' && t >= tr.t && t < tr.t + tr.dur) return tr.map[v];
      }
      return R.baseMap[v];
    }

    function noteIcon(src, x, y, r) {
      g.save();
      g.translate(x, y);
      g.strokeStyle = '#0d0b0c'; g.fillStyle = '#0d0b0c';
      g.lineWidth = Math.max(1.4, r * 0.24); g.lineCap = 'round'; g.lineJoin = 'round';
      if (src === 0) {
        g.beginPath(); g.moveTo(-r, -r * 0.8); g.lineTo(r * 0.6, r * 0.8); g.moveTo(r, -r * 0.8); g.lineTo(-r * 0.6, r * 0.8); g.stroke();
      } else if (src === 1) {
        g.beginPath(); g.arc(-r * 0.1, -r * 0.1, r * 0.55, Math.PI * 0.75, Math.PI * 2.3); g.stroke();
        g.beginPath(); g.arc(r * 0.8, -r * 0.42, r * 0.14, 0, 6.3); g.fill();
        g.beginPath(); g.arc(r * 0.8, r * 0.12, r * 0.14, 0, 6.3); g.fill();
      } else if (src === 2) {
        g.beginPath();
        g.moveTo(r * 0.35, -r); g.lineTo(-r * 0.5, r * 0.05); g.lineTo(-r * 0.02, r * 0.05);
        g.lineTo(-r * 0.35, r); g.lineTo(r * 0.5, -r * 0.1); g.lineTo(r * 0.02, -r * 0.1);
        g.closePath(); g.fill();
      } else {
        g.beginPath(); g.ellipse(0, -r * 0.35, r * 0.42, r * 0.6, 0, 0, 6.3); g.fill();
        g.beginPath(); g.moveTo(0, r * 0.25); g.lineTo(0, r); g.moveTo(-r * 0.4, r); g.lineTo(r * 0.4, r); g.stroke();
      }
      g.restore();
    }

    function drawNotes(t) {
      var ap = approachNow(t), ns = R.notes;
      var hidden = !!cursed.hidden;
      var alphaFor = function (s) {
        if (!hidden) return 1;
        return clamp((0.66 - s) / 0.2, 0, 1);
      };
      var endIdx = R.firstVisible;
      while (endIdx < ns.length && ns[endIdx].t - t < ap * 1.05) endIdx++;
      var i, n;
      /* hold bodies first */
      for (i = endIdx - 1; i >= R.firstVisible; i--) {
        n = ns[i];
        if (n.dur <= 0 || n.state === 2 || (n.state === 3 && !n.holding)) continue;
        var headS = clamp(sAt(n.t, t, ap), 0, 1.04);
        var tailS = clamp(sAt(n.t + n.dur, t, ap), 0, 1.04);
        if (n.holding) headS = 1;
        var a = alphaFor(headS);
        g.globalAlpha = n.holding ? 0.95 : 0.55 * Math.max(a, n.state === 1 ? 1 : a);
        g.fillStyle = COLORS[n.src];
        var hw = (L.base / 4) * 0.24;
        g.beginPath();
        g.moveTo(laneX(n.lane, tailS) - hw * scaleAt(tailS), yAt(tailS));
        g.lineTo(laneX(n.lane, tailS) + hw * scaleAt(tailS), yAt(tailS));
        g.lineTo(laneX(n.lane, headS) + hw * scaleAt(headS), yAt(headS));
        g.lineTo(laneX(n.lane, headS) - hw * scaleAt(headS), yAt(headS));
        g.closePath(); g.fill();
        g.globalAlpha = 1;
      }
      for (i = endIdx - 1; i >= R.firstVisible; i--) {
        n = ns[i];
        if (n.state !== 0) continue;
        var s = sAt(n.t, t, ap);
        if (s < -0.02 || s > 1.12) continue;
        var alpha = alphaFor(s);
        if (alpha <= 0) continue;
        drawNote(n, s, alpha, t);
      }
      /* blackout goes over the notes, below the receptors */
      var band = null;
      for (i = 0; i < R.tricks.length; i++) {
        var tr = R.tricks[i];
        if (tr.type === 'blackout' && t > tr.t && t < tr.t + tr.dur) {
          band = diff === 'hachi' ? [0.56, 0.7] : [0.44, 0.74];
          var fade = clamp(Math.min(t - tr.t, tr.t + tr.dur - t) * 3, 0, 1);
          var wobble = reduce ? 0 : Math.sin(t * 3) * 0.02;
          var fromS = band[0] + wobble, toS = band[1] + wobble;
          g.save();
          g.globalAlpha = fade * 0.97;
          g.fillStyle = '#050304';
          g.beginPath();
          g.moveTo(edgeX(0, fromS) - 3, yAt(fromS)); g.lineTo(edgeX(4, fromS) + 3, yAt(fromS));
          g.lineTo(edgeX(4, toS) + 3, yAt(toS)); g.lineTo(edgeX(0, toS) - 3, yAt(toS));
          g.closePath(); g.fill();
          if (halftone) { g.globalAlpha = fade * 0.3; g.fillStyle = halftone; g.fill(); }
          g.restore();
        }
      }
    }

    function drawNote(n, s, alpha, t) {
      var scale = scaleAt(s);
      var x = laneX(n.lane, s), y = yAt(s);
      if (n.fake && !reduce) x += Math.sin(t * 22 + n.t * 7) * 2.2 * scale;
      var w = (L.base / 4) * 0.84 * scale, h = Math.max(10, 28 * scale * L.unit);
      g.save();
      g.globalAlpha = alpha;
      if (n.fake) {
        g.fillStyle = '#6a2fd6';
        g.strokeStyle = '#e8d0ff'; g.lineWidth = 2;
        roundRect(x - w / 2, y - h / 2, w, h, 5); g.fill(); g.stroke();
        g.strokeStyle = '#ffffff'; g.lineWidth = 2.6;
        g.beginPath();
        g.moveTo(x - h * 0.3, y - h * 0.3); g.lineTo(x + h * 0.3, y + h * 0.3);
        g.moveTo(x + h * 0.3, y - h * 0.3); g.lineTo(x - h * 0.3, y + h * 0.3);
        g.stroke();
      } else {
        g.fillStyle = '#0d0b0c';
        roundRect(x - w / 2 + 2, y - h / 2 + 3, w, h, 5); g.fill();
        g.fillStyle = COLORS[n.src];
        g.strokeStyle = '#fff6e6'; g.lineWidth = 1.6;
        roundRect(x - w / 2, y - h / 2, w, h, 5); g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.32)';
        g.fillRect(x - w * 0.42, y - h * 0.36, w * 0.84, Math.max(2, h * 0.16));
        if (h > 12) noteIcon(n.src, x, y + h * 0.04, h * 0.3);
      }
      g.restore();
    }
    function roundRect(x, y, w, h, r) {
      g.beginPath();
      g.moveTo(x + r, y);
      g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
      g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
      g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y);
      g.closePath();
    }

    function drawReceptors(t) {
      var w = (L.base / 4);
      for (var i = 0; i < 4; i++) {
        var src = srcAtLane(i, t);
        var x = laneX(i, 1), pressed = R.down[i] > 0, hitF = R.laneHit[i];
        var c = COLORS[src];
        var sz = (pressed ? 0.92 : 1) * (1 + hitF * 0.1);
        var rw = w * 0.86 * sz, rh = 30 * sz * L.unit;
        g.fillStyle = pressed ? c : '#141012';
        g.strokeStyle = c; g.lineWidth = 3;
        roundRect(x - rw / 2, L.hit - rh / 2, rw, rh, 7); g.fill(); g.stroke();
        if (pressed) { g.save(); noteIcon(src, x, L.hit + 1, 8); g.restore(); }
        else {
          g.fillStyle = c;
          g.font = '15px ' + FONT;
          g.textAlign = 'center'; g.textBaseline = 'middle';
          var showKey = L.W >= 520 && !IS_TOUCH;
          g.fillText(showKey ? KEY_LABELS[i] : '', x, L.hit + 1);
          if (!showKey) noteIconColored(src, x, L.hit + 1, 7, c);
        }
        g.fillStyle = c;
        g.font = (L.land ? 15 : Math.max(14, Math.min(28, L.W * 0.05))) + 'px ' + FONT;
        g.textAlign = 'center'; g.textBaseline = 'top';
        g.fillText(MEMBERS[src], x + (hasArt ? avatarSize() * 0.42 : 0), L.hit + rh / 2 + 5);
      }
      /* combo */
      if (R.combo >= 5) {
        var cy = yAt(0.42);
        var bump = reduce ? 0 : R.laneHit.reduce(function (a, b) { return Math.max(a, b); }, 0) * 0.08;
        var size = Math.min(L.W * 0.13, 96) * (L.land ? 0.7 : 1) * (1 + bump);
        g.save();
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = 'italic ' + size + 'px ' + FONT;
        g.lineWidth = 5; g.strokeStyle = 'rgba(13,11,12,0.8)';
        g.strokeText(String(R.combo), L.cx, cy);
        g.fillStyle = R.blastOn ? '#ff6fa3' : '#f3ece0';
        g.fillText(String(R.combo), L.cx, cy);
        var m = comboMult(R.combo) * (R.blastOn ? 2 : 1);
        g.font = (size * 0.3) + 'px ' + FONT;
        g.fillStyle = '#f4c430';
        g.strokeText('COMBO  x' + m, L.cx, cy + size * 0.65);
        g.fillText('COMBO  x' + m, L.cx, cy + size * 0.65);
        g.restore();
      }
    }
    function noteIconColored(src, x, y, r, c) {
      g.save();
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = c;
      g.beginPath(); g.arc(x, y, r + 3, 0, 6.3); g.fill();
      noteIcon(src, x, y, r);
      g.restore();
    }

    function drawFx(dt) {
      var P = R.particles, i, p;
      for (i = P.length - 1; i >= 0; i--) {
        p = P[i];
        p.age += dt;
        if (p.age >= p.life) { P.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt;
        g.globalAlpha = 1 - p.age / p.life;
        g.fillStyle = p.color;
        if (p.conf) g.fillRect(p.x, p.y, p.size, p.size * 0.5 + Math.abs(Math.sin(p.age * 11)) * p.size);
        else g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      g.globalAlpha = 1;
      var Rg = R.rings;
      for (i = Rg.length - 1; i >= 0; i--) {
        p = Rg[i];
        p.age += dt;
        if (p.age > 0.3) { Rg.splice(i, 1); continue; }
        var k = p.age / 0.3;
        g.strokeStyle = p.color; g.lineWidth = 4 * (1 - k); g.globalAlpha = 1 - k;
        g.beginPath(); g.ellipse(p.x, p.y, 18 + 58 * k, 7 + 20 * k, 0, 0, 6.3); g.stroke();
      }
      g.globalAlpha = 1;
      var Pp = R.pops;
      for (i = Pp.length - 1; i >= 0; i--) {
        p = Pp[i];
        p.age += dt;
        if (p.age >= p.life) { Pp.splice(i, 1); continue; }
        var f = p.age / p.life;
        var scale = (f < 0.2 ? 0.7 + f * 2.5 : 1.2 - (f - 0.2) * 0.3) * p.big;
        g.save();
        var popFont = L.land ? 20 : Math.min(36, L.W * 0.063);
        g.font = popFont + 'px ' + FONT;
        var halfW = g.measureText(p.text).width * scale / 2 + 6;
        g.translate(clamp(p.x, halfW, L.W - halfW), p.y - f * 44);
        g.rotate(p.rot);
        g.scale(scale, scale);
        g.globalAlpha = f > 0.65 ? 1 - (f - 0.65) / 0.35 : 1;
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = 4; g.strokeStyle = '#0d0b0c'; g.strokeText(p.text, 0, 0);
        g.fillStyle = p.color; g.fillText(p.text, 0, 0);
        g.restore();
      }
      g.globalAlpha = 1;
    }

    /* ---------- HUD sync ---------- */
    function setText(el, key, value) {
      if (R.lastShown[key] === value) return;
      R.lastShown[key] = value;
      el.textContent = value;
    }
    function setWidth(el, key, pct) {
      var v = Math.round(pct * 2) / 2;
      if (R.lastShown[key] === v) return;
      R.lastShown[key] = v;
      el.style.width = v + '%';
    }
    function syncHud(t) {
      setText(ui.score, 'score', Math.round(R.score * curseMult).toLocaleString('en-US'));
      setWidth(ui.crowdFill, 'crowd', R.crowd);
      setWidth(ui.blastFill, 'blast', R.blast);
      if (R.lastShown.low !== (R.crowd < 22)) {
        R.lastShown.low = R.crowd < 22;
        ui.crowd.classList.toggle('low', R.crowd < 22);
      }
      var ready = R.blast >= 100 && !R.blastOn && !cursed['no-blast'];
      if (R.lastShown.ready !== ready) { R.lastShown.ready = ready; ui.blast.classList.toggle('ready', ready); }
      if (R.lastShown.on !== R.blastOn) { R.lastShown.on = R.blastOn; ui.blast.classList.toggle('on', R.blastOn); }
      if (mode === 'duel' && ui.tug) {
        var rs = rivalScore(t);
        var d = clamp((R.score - rs) / Math.max(4000, R.score + rs), -1, 1) * 0.5 * 90;
        ui.tug.style.left = (50 + d) + '%';
        setText(ui.rivalScore, 'rival', 'TRAPNEST ' + Math.round(rs).toLocaleString('en-US'));
      }
      if (mode === 'boss' && ui.bossFill) {
        setWidth(ui.bossFill, 'boss', R.bossHp);
        setText(ui.bossText, 'bossText', R.bossDown ? 'DEFEATED!' : Math.ceil(R.bossHp) + '%');
      }
    }

    /* ---------- loop ---------- */
    var lastFrame = 0;
    function frame(now) {
      if (destroyed || finished) return;
      rafId = requestAnimationFrame(frame);
      var dt = Math.min(0.05, lastFrame ? (now - lastFrame) / 1000 : 0.016);
      lastFrame = now;
      var live = R.phase === 'play' || R.phase === 'over';
      var t = R.phase === 'idle' ? -9 : songTime();
      if (R.phase === 'play' && R.player && !A.isRunning()) {
        /* phone call, Siri, audio route change: the clock stopped, so stop the set with it */
        if (!R.deadSince) R.deadSince = now;
        else if (now - R.deadSince > 450) { R.deadSince = 0; pause(); }
      } else R.deadSince = 0;
      if (R.autoP && R.phase === 'play') autoplay(t);
      if (R.phase === 'play') {
        update(t, dt);
        if (R.t0Reached !== true && t >= 0) R.t0Reached = true;
      }
      /* visual decay runs on display time; judgement and clocks never do */
      if (live) {
        R.pulse *= Math.pow(0.0035, dt);
        R.shake *= Math.pow(0.002, dt);
        R.flash *= Math.pow(0.0009, dt);
        for (var i = 0; i < 4; i++) {
          R.laneFlash[i] *= Math.pow(0.0005, dt);
          R.laneHit[i] *= Math.pow(0.0002, dt);
        }
      }
      draw(R.phase === 'idle' ? -9 : t, live ? dt : 0);
      syncHud(t);
      updateCast(t, now);
    }

    /* test hook: opts._auto is a hit rate, drives the real input path */
    function autoplay(t) {
      var ns = R.notes, p = R.autoP;
      for (var i = R.firstVisible; i < ns.length; i++) {
        var n = ns[i];
        if (n.t > t) break;
        if (n.state === 0 && !n.autoed) {
          n.autoed = true;
          if (n.fake) continue;
          if (R.autoRng() < p) {
            press(n.lane, t);
            (function (lane, dur) {
              later(function () { release(lane); }, (dur > 0 ? dur + 0.05 : 0.03) * 1000);
            })(n.lane, n.dur);
          }
        }
      }
    }

    /* ---------- flow ---------- */
    function hideOverlay() { ui.overlay.hidden = true; ui.overlay.innerHTML = ''; }
    function showOverlay(html) { ui.overlay.innerHTML = '<div class="rg-card">' + html + '</div>'; ui.overlay.hidden = false; }
    function btn(sel, fn) {
      var el = ui.overlay.querySelector(sel);
      if (!el) return;
      el.addEventListener('click', function (e) { e.stopPropagation(); A.unlock(); fn(); });
    }

    function hintSeen() {
      try { return !!window.localStorage.getItem(HINT_KEY); } catch (e) { return hintSeenMem; }
    }
    var hintSeenMem = false;
    function markHint() {
      hintSeenMem = true;
      try { window.localStorage.setItem(HINT_KEY, '1'); } catch (e) { /* private mode */ }
    }

    function begin() {
      R = newRun();
      R.autoP = typeof opts._auto === 'number' ? opts._auto : 0;
      ui.banner.hidden = true;
      ui.warn.classList.remove('show');
      ui.shout.classList.remove('show');
      refreshShields();
      resize();
      resetCast();
      lastFrame = 0;
      if (!rafId) rafId = requestAnimationFrame(frame);
      if (!hintSeen() && !R.autoP) showHint();
      else gate();
    }

    function showHint() {
      var keys = '';
      for (var i = 0; i < 4; i++) {
        keys += '<span style="background:' + COLORS[i] + '">' + (IS_TOUCH ? '' : KEY_LABELS[i]) + '<small>' + MEMBERS[i] + '</small></span>';
      }
      var perk = persona === 'pink'
        ? 'You have 3 Puppy Eyes. Each one cancels a miss. Nobody can say no to that face.'
        : 'BLACK STONE energy: your BLAST meter fills 25% faster.';
      showOverlay(
        '<h2>HOW TO NOT GET BOOED</h2>' +
        '<div class="rg-keys">' + keys + '</div>' +
        (IS_TOUCH ? '<p><b>Tap each column</b> as its notes reach the line. Use as many fingers as you like.</p>' : '<p>Hit <b>D F J K</b> or the <b>arrows</b> as notes reach the line.</p>') +
        '<p>Long notes: keep holding. Miss, and that player drops out. The whole room hears it.</p>' +
        '<p>' + (IS_TOUCH ? 'Tap <b>BLAST</b> when the meter is full. ' : '<b>SPACE</b> or the BLAST button when the meter is full. <b>ESC</b> pauses. ') + perk + '</p>' +
        '<div class="rg-actions"><button class="rg-btn rg-go">PLUG IN</button></div>'
      );
      btn('.rg-go', function () { markHint(); hideOverlay(); gate(); });
    }

    function gate() {
      A.unlock();
      var tries = 0;
      (function poll() {
        if (destroyed || finished || !R) return;
        if (!A.hasContext() || A.isRunning()) { startSet(); return; }
        if (tries++ < 8) { later(poll, 50); return; }
        showOverlay('<h2>AMP IS OFF</h2><p>Your browser needs one tap before the band can play.</p><div class="rg-actions"><button class="rg-btn rg-go">TAP TO PLUG IN</button></div>');
        btn('.rg-go', function () { hideOverlay(); gate(); });
      })();
    }

    function startSet() {
      var beat = song.beats.length > 1 ? song.beats[1] - song.beats[0] : 60 / song.bpm;
      var k = Math.max(1, Math.ceil(0.62 / beat));
      var iv = beat * k;
      R.countIv = iv;
      var lead = 3 * iv + 0.35;
      A.setVolumes(settings.music == null ? 0.8 : settings.music, settings.sfx == null ? 0.8 : settings.sfx);
      if (A.stopMusic) A.stopMusic();
      R.player = A.startSong(song, { delay: lead, ticks: [-3 * iv, -2 * iv, -iv] });
      R.t0 = performance.now() + lead * 1000;
      R.phase = 'play';
    }

    var resuming = false;
    function pause() {
      if (!R || R.phase !== 'play') return;
      var t = songTime();
      R.phase = 'paused';
      R.pausedAt = t;
      resuming = false;
      R.pausedPerf = performance.now();
      A.pauseClock();
      for (var i = 0; i < R.holds.length; i++) R.holds[i].grace = t + 1.0;
      R.down = [0, 0, 0, 0];
      pointers = {};
      showOverlay(
        '<h2>BAND MEETING</h2><p>Nobu is apologising to his guitar.</p>' +
        '<div class="rg-actions">' +
          '<button class="rg-btn rg-resume">RESUME</button>' +
          '<button class="rg-btn rg-restart">RESTART</button>' +
          '<button class="rg-btn rg-quit">QUIT THE SET</button>' +
        '</div>'
      );
      btn('.rg-resume', function () { A.blessResume(); resumeCount(); });
      btn('.rg-restart', function () {
        hideOverlay();
        stopRun();
        begin();
      });
      btn('.rg-quit', function () { hideOverlay(); finish(true); });
    }

    function resumeCount() {
      hideOverlay();
      resuming = true;
      var n = 3;
      var tick = function () {
        if (destroyed || finished || !R || !resuming) return;
        if (n === 0) {
          resuming = false;
          ui.banner.hidden = true;
          A.resumeClock();
          if (!R.player) R.t0 += performance.now() - R.pausedPerf;
          R.phase = 'play';
          return;
        }
        ui.banner.textContent = String(n);
        ui.banner.hidden = false;
        n--;
        later(tick, 520);
      };
      tick();
    }

    function stopRun() {
      clearTimers();
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      A.resumeClock();
      if (R && R.player) { R.player.stop(0.04); R.player = null; }
      if (R) R.phase = 'idle';
      resuming = false;
    }

    function finish(quit) {
      if (finished || destroyed) return;
      finished = true;
      var run = R;
      var judged = run.perfect + run.good + run.miss;
      var accuracy = judged ? (run.perfect + run.good * 0.6) / judged : 0;
      var cleared = !quit && !run.failed;
      var rank = 'D';
      if (cleared) rank = accuracy >= 0.95 ? 'S' : accuracy >= 0.88 ? 'A' : accuracy >= 0.75 ? 'B' : accuracy >= 0.6 ? 'C' : 'D';
      var result = {
        songId: song.id, difficulty: diff, score: Math.round(run.score * curseMult), accuracy: accuracy, maxCombo: run.maxCombo,
        perfect: run.perfect, good: run.good, miss: run.miss, rank: rank, cleared: cleared, quit: !!quit
      };
      if (mode === 'duel') result.duelWon = !quit && duelResult();
      if (mode === 'boss') result.bossDefeated = !quit && !run.failed && run.bossHp <= 0;
      stopRun();
      if (typeof opts.onFinish === 'function') opts.onFinish(result);
    }

    /* ---------- input ---------- */
    function onKeyDown(e) {
      if (e.repeat) return;
      if (e.code === 'Escape') {
        if (R.phase === 'play') pause();
        else if (R.phase === 'paused' && !resuming && !ui.overlay.hidden) resumeCount();
        e.preventDefault();
        return;
      }
      if (e.code === 'Space') {
        if (R.phase === 'play') { activateBlast(inputTime(e)); e.preventDefault(); }
        return;
      }
      if (R.phase !== 'play') return;
      var lane = KEYMAP[e.code];
      if (lane == null) return;
      e.preventDefault();
      press(lane, inputTime(e));
    }
    function onKeyUp(e) {
      var lane = KEYMAP[e.code];
      if (lane != null) release(lane);
    }
    var pointers = {};
    function laneFromPoint(px) {
      var left = L.cx - L.base / 2;
      return clamp(Math.floor((px - left) / (L.base / 4)), 0, 3);
    }
    function onPointerDown(e) {
      if (!R || R.phase !== 'play') return;
      e.preventDefault();
      var rect = canvas.getBoundingClientRect();
      var py = e.clientY - rect.top;
      if (py < L.top * 0.92) {
        /* tapping the stage itself triggers BLAST: easier than aiming a thumb at a button */
        activateBlast(inputTime(e));
        return;
      }
      var lane = laneFromPoint(e.clientX - rect.left);
      pointers[e.pointerId] = lane;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* fine */ }
      press(lane, inputTime(e));
    }
    function onPointerUp(e) {
      if (pointers[e.pointerId] == null) return;
      var lane = pointers[e.pointerId];
      delete pointers[e.pointerId];
      release(lane);
    }
    function onHide() {
      if (document.visibilityState === 'hidden' || !document.hasFocus()) pause();
    }

    on(window, 'keydown', onKeyDown);
    on(window, 'keyup', onKeyUp);
    on(canvas, 'pointerdown', onPointerDown);
    on(canvas, 'pointerup', onPointerUp);
    on(canvas, 'pointercancel', onPointerUp);
    on(window, 'blur', onHide);
    on(document, 'visibilitychange', onHide);
    on($('.rg-pause'), 'click', function (e) { e.stopPropagation(); pause(); });
    on(ui.blast, 'pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (R && R.phase === 'play') activateBlast(inputTime(e));
    });
    on(window, 'resize', resize);
    on(window, 'orientationchange', function () { resize(); later(resize, 250); });
    if (window.visualViewport) on(window.visualViewport, 'resize', resize);
    on(root, 'touchstart', function (e) {
      /* stops double-tap zoom, callouts and rubber-banding; buttons and scrollable cards keep their clicks */
      var el = e.target;
      if (el.closest && (el.closest('button') || el.closest('.rg-card'))) return;
      e.preventDefault();
    }, { passive: false });
    on(root, 'gesturestart', function (e) { e.preventDefault(); });
    on(root, 'contextmenu', function (e) { e.preventDefault(); });
    var ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(function () { resize(); }); ro.observe(root); }

    begin();

    return {
      destroy: function () {
        if (destroyed) return;
        destroyed = true;
        stopRun();
        bound.forEach(function (b) { b[0].removeEventListener(b[1], b[2], b[3]); });
        bound = [];
        if (ro) ro.disconnect();
        if (root.parentNode) root.parentNode.removeChild(root);
        if (prevPosition !== null) container.style.position = prevPosition;
        R = null;
      }
    };
  }

  window.NG.Rhythm = { start: start };
})();
