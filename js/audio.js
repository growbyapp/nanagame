/* HEY, NANA - Room 707: the band in a box.
   Everything here is synthesized live. Nothing touches other modules at parse time. */
window.NG = window.NG || {};
(function () {
  'use strict';

  var A = {};
  var ctx = null, comp = null, musicBus = null, sfxBus = null, reverbIn = null, noiseBuf = null;
  var vol = { music: 0.8, sfx: 0.8 };
  var players = [];
  var menuId = null, menuPlayer = null, pendingMenu = null;
  var userPaused = false;
  var curveCache = {};

  var LOOKAHEAD = 0.28, MENU_LOOKAHEAD = 1.4, PUMP_MS = 25;
  var VOWELS = {
    a: [800, 1200, 2900], e: [480, 1900, 2600], i: [320, 2250, 3000],
    o: [500, 880, 2800], u: [340, 720, 2500]
  };

  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  function curve(k) {
    if (curveCache[k]) return curveCache[k];
    var n = 2048, c = new Float32Array(n), i, x;
    for (i = 0; i < n; i++) { x = i * 2 / n - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); }
    curveCache[k] = c;
    return c;
  }

  function impulse(seconds, decay) {
    var rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    var buf = ctx.createBuffer(2, len, rate), ch, d, i;
    for (ch = 0; ch < 2; ch++) {
      d = buf.getChannelData(ch);
      for (i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function build() {
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return false;
    try { ctx = new C({ latencyHint: 'interactive' }); } catch (e) { ctx = null; return false; }

    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 5;
    comp.attack.value = 0.004; comp.release.value = 0.14;
    var master = ctx.createGain();
    master.gain.value = 0.8;
    var limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20;
    limiter.attack.value = 0.001; limiter.release.value = 0.06;
    comp.connect(master); master.connect(limiter); limiter.connect(ctx.destination);

    musicBus = ctx.createGain(); musicBus.gain.value = vol.music; musicBus.connect(comp);
    sfxBus = ctx.createGain(); sfxBus.gain.value = vol.sfx; sfxBus.connect(comp);

    var conv = ctx.createConvolver();
    conv.buffer = impulse(1.15, 2.6);
    var wet = ctx.createGain(); wet.gain.value = 0.32;
    reverbIn = ctx.createGain();
    reverbIn.connect(conv); conv.connect(wet); wet.connect(musicBus);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  function noiseSrc(t, dur) {
    var s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    s.start(t, Math.random() * 1.2, dur + 0.05);
    return s;
  }

  /* ---------- the band ---------- */
  function Player(song, opts) {
    this.song = song;
    this.events = song.events;
    this.dur = song.duration;
    this.loop = !!opts.loop;
    this.ahead = this.loop ? MENU_LOOKAHEAD : LOOKAHEAD;
    this.idx = 0; this.cycle = 0; this.dead = false;
    this.startAt = ctx.currentTime + (opts.delay || 0.08);
    this.live = [];
    this.lastGate = null;
    this.level = this.loop ? 1 : 0.72;

    var out = this.out = ctx.createGain();
    out.gain.value = 1;
    if (opts.fadeIn) {
      out.gain.setValueAtTime(0.0001, ctx.currentTime);
      out.gain.exponentialRampToValueAtTime(1, ctx.currentTime + opts.fadeIn);
    }
    out.connect(musicBus);
    var send = this.send = ctx.createGain();
    send.gain.value = 0.28;
    send.connect(reverbIn);

    var mix = [0.95, 0.85, 0.62, 0.62];
    this.lanes = [];
    this.trim = [];
    for (var i = 0; i < 4; i++) {
      var g = ctx.createGain(); g.gain.value = this.level;
      var tr = ctx.createGain(); tr.gain.value = mix[i];
      tr.connect(g); g.connect(out);
      this.lanes.push(g); this.trim.push(tr);
    }
    this.pad = ctx.createGain(); this.pad.gain.value = 0.34;
    this.pad.connect(out); this.pad.connect(send);

    this._buildBass();
    this._buildGuitar();
    this._buildVox();

    if (opts.ticks) {
      for (var k = 0; k < opts.ticks.length; k++) this._stick(this.startAt + opts.ticks[k]);
    }
    var self = this;
    this.timer = setInterval(function () { self._pump(); }, PUMP_MS);
    this._pump();
    players.push(this);
  }
  var P = Player.prototype;

  P._track = function (node, end) { this.live.push({ n: node, e: end }); };

  P._buildBass = function () {
    var sh = ctx.createWaveShaper(); sh.curve = curve(6);
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.Q.value = 0.8;
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 38;
    sh.connect(lp); lp.connect(hp); hp.connect(this.trim[1]);
    this.bassIn = sh;
  };

  P._buildGuitar = function () {
    var mk = function (self, pan) {
      var pre = ctx.createGain(); pre.gain.value = 1.7;
      var sh = ctx.createWaveShaper(); sh.curve = curve(48);
      try { sh.oversample = '2x'; } catch (e) { /* older browsers */ }
      var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 95;
      var mid = ctx.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 1500; mid.Q.value = 0.9; mid.gain.value = 4;
      var cab = ctx.createBiquadFilter(); cab.type = 'lowpass'; cab.frequency.value = 3700; cab.Q.value = 0.7;
      pre.connect(sh); sh.connect(hp); hp.connect(mid); mid.connect(cab);
      var last = cab;
      if (ctx.createStereoPanner) {
        var p = ctx.createStereoPanner(); p.pan.value = pan;
        cab.connect(p); last = p;
      }
      var g = ctx.createGain(); g.gain.value = 0.36;
      last.connect(g); g.connect(self.trim[2]);
      return pre;
    };
    this.gtrL = mk(this, -0.65);
    this.gtrR = mk(this, 0.65);
    var clean = ctx.createBiquadFilter(); clean.type = 'lowpass'; clean.frequency.value = 2300;
    clean.connect(this.trim[2]); clean.connect(this.send);
    this.gtrClean = clean;
  };

  P._buildVox = function () {
    var gate = this.voxGate = ctx.createGain(); gate.gain.value = 0;
    var src = ctx.createGain(); src.gain.value = 1;
    var oA = this.voxA = ctx.createOscillator(); oA.type = 'sawtooth';
    var oB = this.voxB = ctx.createOscillator(); oB.type = 'sawtooth'; oB.detune.value = 9;
    var oC = this.voxC = ctx.createOscillator(); oC.type = 'triangle';
    var cGain = ctx.createGain(); cGain.gain.value = 0.5;
    oA.connect(src); oB.connect(src); oC.connect(cGain); cGain.connect(src);
    var lfo = this.voxLfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5.7;
    var depth = this.voxDepth = ctx.createGain(); depth.gain.value = 0;
    lfo.connect(depth); depth.connect(oA.detune); depth.connect(oB.detune); depth.connect(oC.detune);

    var bank = ctx.createGain(); bank.gain.value = 1;
    this.formants = [];
    var q = [9, 12, 14], lvl = [1.0, 0.65, 0.3];
    for (var i = 0; i < 3; i++) {
      var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = VOWELS.a[i]; f.Q.value = q[i];
      var g = ctx.createGain(); g.gain.value = lvl[i];
      src.connect(f); f.connect(g); g.connect(bank);
      this.formants.push(f);
    }
    var body = ctx.createBiquadFilter(); body.type = 'peaking'; body.frequency.value = 2600; body.Q.value = 1; body.gain.value = 5;
    bank.connect(body); body.connect(gate);

    var boost = ctx.createGain(); boost.gain.value = 2.2;
    gate.connect(boost); boost.connect(this.trim[3]);
    var dly = ctx.createDelay(0.6); dly.delayTime.value = Math.min(0.5, (60 / this.song.bpm) * 0.75);
    var fb = ctx.createGain(); fb.gain.value = 0.24;
    var dGain = ctx.createGain(); dGain.gain.value = 0.3;
    boost.connect(dly); dly.connect(fb); fb.connect(dly); dly.connect(dGain); dGain.connect(this.trim[3]);
    boost.connect(this.send);
    this.dly = dly; this.fb = fb;

    var t = ctx.currentTime;
    oA.start(t); oB.start(t); oC.start(t); lfo.start(t);
  };

  P._stick = function (t) {
    var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 3;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    var s = noiseSrc(t, 0.07);
    s.connect(f); f.connect(g); g.connect(this.out);
    this._track(s, t + 0.1);
  };

  P._kick = function (t, v) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(175, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.075);
    g.gain.setValueAtTime(1.15 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    o.connect(g); g.connect(this.trim[0]);
    o.start(t); o.stop(t + 0.26);
    this._track(o, t + 0.26);
    var c = ctx.createGain(); c.gain.setValueAtTime(0.5 * v, t); c.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
    var s = noiseSrc(t, 0.03); s.connect(hp); hp.connect(c); c.connect(this.trim[0]);
    this._track(s, t + 0.08);
  };

  P._snare = function (t, v) {
    var o = ctx.createOscillator(), og = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(165, t + 0.09);
    og.gain.setValueAtTime(0.62 * v, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    o.connect(og); og.connect(this.trim[0]);
    o.start(t); o.stop(t + 0.15);
    this._track(o, t + 0.15);
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500;
    var g = ctx.createGain(); g.gain.setValueAtTime(0.85 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.19);
    var s = noiseSrc(t, 0.2); s.connect(hp); hp.connect(g); g.connect(this.trim[0]); g.connect(this.send);
    this._track(s, t + 0.25);
  };

  P._hat = function (t, v, open) {
    var d = open ? 0.2 : 0.04;
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7600;
    var g = ctx.createGain(); g.gain.setValueAtTime(0.3 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    var s = noiseSrc(t, d + 0.02); s.connect(hp); hp.connect(g); g.connect(this.trim[0]);
    this._track(s, t + d + 0.06);
  };

  P._crash = function (t, v) {
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4200;
    var g = ctx.createGain(); g.gain.setValueAtTime(0.5 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    var s = noiseSrc(t, 1.55); s.connect(hp); hp.connect(g); g.connect(this.trim[0]); g.connect(this.send);
    this._track(s, t + 1.6);
  };

  P._tom = function (t, v) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(82, t + 0.16);
    g.gain.setValueAtTime(0.85 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    o.connect(g); g.connect(this.trim[0]);
    o.start(t); o.stop(t + 0.28);
    this._track(o, t + 0.28);
  };

  P._bass = function (t, midi, dur) {
    var f = mtof(midi), end = t + Math.max(0.05, dur);
    var a = ctx.createOscillator(), b = ctx.createOscillator(), g = ctx.createGain();
    a.type = 'sawtooth'; b.type = 'square';
    a.frequency.value = f; b.frequency.value = f; b.detune.value = -6;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.006);
    g.gain.setValueAtTime(0.42, end - 0.012 > t ? end - 0.012 : t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, end + 0.03);
    a.connect(g); b.connect(g); g.connect(this.bassIn);
    a.start(t); b.start(t); a.stop(end + 0.05); b.stop(end + 0.05);
    this._track(a, end + 0.05); this._track(b, end + 0.05);
  };

  P._chord = function (t, midi, dur, type) {
    var notes = type === 'p' ? [0, 7] : [0, 7, 12];
    var ring = type === 'L';
    var end = t + Math.max(0.05, dur) + (ring ? 0.08 : 0.01);
    var peak = type === 'p' ? 0.3 : 0.42;
    if (this.lastGate) {
      this.lastGate.gain.cancelScheduledValues(t);
      this.lastGate.gain.setTargetAtTime(0.0001, t, 0.006);
    }
    var gate = ctx.createGain();
    gate.gain.setValueAtTime(0.0001, t);
    gate.gain.exponentialRampToValueAtTime(peak, t + 0.004);
    if (type === 'p') gate.gain.setTargetAtTime(0.0001, t + 0.05, 0.03);
    else {
      gate.gain.setTargetAtTime(peak * 0.7, t + 0.03, 0.2);
      gate.gain.setTargetAtTime(0.0001, end - 0.02, 0.02);
    }
    gate.connect(this.gtrL); gate.connect(this.gtrR);
    this.lastGate = gate;
    var stopAt = end + 0.12;
    for (var i = 0; i < notes.length; i++) {
      var f = mtof(midi + notes[i]);
      var a = ctx.createOscillator(), b = ctx.createOscillator();
      a.type = 'sawtooth'; b.type = 'sawtooth';
      a.frequency.value = f; b.frequency.value = f;
      a.detune.value = -7 - i * 2; b.detune.value = 7 + i * 3;
      a.connect(gate); b.connect(gate);
      a.start(t); b.start(t); a.stop(stopAt); b.stop(stopAt);
      this._track(a, stopAt); this._track(b, stopAt);
    }
  };

  P._pick = function (t, midi, dur) {
    var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    var end = t + Math.min(1.1, Math.max(0.3, dur * 1.8));
    o.type = 'triangle'; o2.type = 'sawtooth';
    o.frequency.value = mtof(midi); o2.frequency.value = mtof(midi); o2.detune.value = 5;
    var g2 = ctx.createGain(); g2.gain.value = 0.2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, end);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(this.gtrClean);
    o.start(t); o2.start(t); o.stop(end + 0.02); o2.stop(end + 0.02);
    this._track(o, end + 0.02); this._track(o2, end + 0.02);
  };

  P._vocal = function (t, midi, dur, vowel, scoop) {
    var f = mtof(midi), vs = VOWELS[vowel] || VOWELS.a, end = t + dur;
    var oscs = [this.voxA, this.voxB];
    for (var i = 0; i < oscs.length; i++) {
      if (scoop) {
        oscs[i].frequency.setValueAtTime(f * 0.89, t);
        oscs[i].frequency.setTargetAtTime(f, t + 0.01, 0.05);
      } else {
        oscs[i].frequency.setTargetAtTime(f, t, 0.016);
      }
    }
    this.voxC.frequency.setTargetAtTime(f * 0.5, t, 0.016);
    for (var j = 0; j < 3; j++) this.formants[j].frequency.setTargetAtTime(vs[j], t, 0.03);
    var gate = this.voxGate.gain;
    gate.setTargetAtTime(0.85, t, 0.013);
    gate.setTargetAtTime(0.0001, Math.max(t + 0.03, end - 0.035), 0.022);
    var depth = this.voxDepth.gain;
    depth.setValueAtTime(0, t);
    if (dur > 0.28) {
      depth.setValueAtTime(0, t + 0.16);
      depth.linearRampToValueAtTime(30, Math.min(end, t + 0.5));
    }
  };

  P._padChord = function (t, midis, dur) {
    var end = t + dur;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.28, t + 0.09);
    g.gain.setValueAtTime(0.28, Math.max(t + 0.1, end - 0.1));
    g.gain.linearRampToValueAtTime(0.0001, end + 0.05);
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    g.connect(lp); lp.connect(this.pad);
    var harm = [1, 2, 3, 4], lv = [0.55, 0.3, 0.18, 0.1];
    for (var i = 0; i < midis.length; i++) {
      for (var h = 0; h < harm.length; h++) {
        var o = ctx.createOscillator(), og = ctx.createGain();
        o.type = 'sine'; o.frequency.value = mtof(midis[i]) * harm[h];
        o.detune.value = (i - 1) * 3;
        og.gain.value = lv[h];
        o.connect(og); og.connect(g);
        o.start(t); o.stop(end + 0.08);
        this._track(o, end + 0.08);
      }
    }
  };

  P._fire = function (e, t) {
    switch (e.k) {
      case 'k': this._kick(t, e.v); break;
      case 's': this._snare(t, e.v); break;
      case 'h': this._hat(t, e.v, false); break;
      case 'o': this._hat(t, e.v, true); break;
      case 'c': this._crash(t, e.v); break;
      case 't': this._tom(t, e.v); break;
      case 'b': this._bass(t, e.midi, e.dur); break;
      case 'g':
        if (e.gt === 'a') this._pick(t, e.midi, e.dur);
        else this._chord(t, e.midi, e.dur, e.gt);
        break;
      case 'v': this._vocal(t, e.midi, e.dur, e.vowel, e.scoop); break;
      case 'pad': this._padChord(t, e.midis, e.dur); break;
    }
  };

  P._pump = function () {
    if (this.dead || !ctx) return;
    var horizon = ctx.currentTime + this.ahead;
    var ev = this.events;
    var guard = 0;
    while (guard++ < 4000) {
      if (this.idx >= ev.length) {
        if (!this.loop) break;
        this.idx = 0; this.cycle++;
        continue;
      }
      var e = ev[this.idx];
      var at = this.startAt + e.t + this.cycle * this.dur;
      if (at > horizon) break;
      this.idx++;
      if (at >= ctx.currentTime - 0.02) this._fire(e, Math.max(at, ctx.currentTime));
    }
    if (this.live.length > 180) {
      var now = ctx.currentTime;
      this.live = this.live.filter(function (x) { return x.e > now; });
    }
  };

  /* Song clock in seconds: what the listener is hearing right now. */
  P.time = function () {
    if (!ctx) return 0;
    return ctx.currentTime - this.startAt - A.latency();
  };

  /* A successful hit: this player is locked in. */
  P.hit = function (lane) {
    if (this.dead) return;
    var g = this.lanes[lane].gain, now = ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setTargetAtTime(1, now, 0.01);
  };

  /* A miss: that player drops out, briefly. Keep missing and they stay out. */
  P.miss = function (lane) {
    if (this.dead) return;
    var g = this.lanes[lane].gain, now = ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setTargetAtTime(0.04, now, 0.008);
    g.setTargetAtTime(0.5, now + 0.55, 0.09);
  };

  P.setBlast = function (on) {
    if (this.dead) return;
    var now = ctx.currentTime;
    this.out.gain.setTargetAtTime(on ? 1.18 : 1, now, 0.08);
    this.send.gain.setTargetAtTime(on ? 0.5 : 0.28, now, 0.1);
    this.fb.gain.setTargetAtTime(on ? 0.42 : 0.24, now, 0.1);
  };

  P.stop = function (fade) {
    if (this.dead) return;
    this.dead = true;
    clearInterval(this.timer);
    var now = ctx.currentTime, f = fade || 0.03, self = this;
    this.out.gain.cancelScheduledValues(now);
    this.out.gain.setTargetAtTime(0.0001, now, f / 3);
    var idx = players.indexOf(this);
    if (idx >= 0) players.splice(idx, 1);
    var kill = function () {
      var all = self.live;
      for (var i = 0; i < all.length; i++) {
        try { all[i].n.stop(); } catch (e) { /* already stopped */ }
        try { all[i].n.disconnect(); } catch (e2) { /* fine */ }
      }
      self.live = [];
      [self.voxA, self.voxB, self.voxC, self.voxLfo].forEach(function (o) {
        try { o.stop(); } catch (e) { /* fine */ }
        try { o.disconnect(); } catch (e2) { /* fine */ }
      });
      try { self.out.disconnect(); } catch (e3) { /* fine */ }
      try { self.send.disconnect(); } catch (e4) { /* fine */ }
    };
    setTimeout(kill, Math.ceil(f * 1000) + 40);
  };

  /* ---------- public, contract ---------- */
  /* iOS routes Web Audio through the ringer switch unless the page claims the playback session. */
  var sessionClaimed = false, keepAliveSet = false;
  function isIOS() {
    var n = navigator;
    return /iPad|iPhone|iPod/.test(n.userAgent) || (n.platform === 'MacIntel' && n.maxTouchPoints > 1);
  }
  function claimPlayback() {
    if (sessionClaimed) return;
    sessionClaimed = true;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* older iOS */ }
    if (!isIOS() || navigator.audioSession) return;
    try {
      var rate = 8000, n = 4000, bytes = new Uint8Array(44 + n), v = new DataView(bytes.buffer);
      var put = function (o, str) { for (var i = 0; i < str.length; i++) bytes[o + i] = str.charCodeAt(i); };
      put(0, 'RIFF'); v.setUint32(4, 36 + n, true); put(8, 'WAVEfmt '); v.setUint32(16, 16, true);
      v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate, true);
      v.setUint16(32, 1, true); v.setUint16(34, 8, true); put(36, 'data'); v.setUint32(40, n, true);
      for (var j = 44; j < bytes.length; j++) bytes[j] = 128;
      var el = new Audio(URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' })));
      el.loop = true; el.setAttribute('playsinline', '');
      var p = el.play();
      if (p && p.catch) p.catch(function () { sessionClaimed = false; });
    } catch (e2) { sessionClaimed = false; }
  }
  function revive() {
    if (ctx && !userPaused && ctx.state !== 'running') {
      var p = ctx.resume();
      if (p && p.catch) p.catch(function () {});
    }
  }
  function installKeepAlive() {
    if (keepAliveSet) return;
    keepAliveSet = true;
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') revive(); });
    window.addEventListener('pageshow', revive);
    ['touchend', 'pointerdown', 'keydown'].forEach(function (type) {
      document.addEventListener(type, function () { claimPlayback(); revive(); }, true);
    });
  }

  A.unlock = function () {
    if (!ctx && !build()) return;
    installKeepAlive();
    claimPlayback();
    if (ctx.state !== 'running' && !userPaused) {
      var p = ctx.resume();
      if (p && p.catch) p.catch(function () {});
    }
    try {
      var s = ctx.createBufferSource();
      s.buffer = ctx.createBuffer(1, 1, 22050);
      s.connect(ctx.destination);
      s.start(0);
    } catch (e) { /* fine */ }
    if (pendingMenu) { var id = pendingMenu; pendingMenu = null; A.menu(id); }
  };

  A.context = function () { return ctx; };

  A.setVolumes = function (music, sfx) {
    vol.music = clamp01(+music); vol.sfx = clamp01(+sfx);
    if (!ctx) return;
    musicBus.gain.setTargetAtTime(vol.music, ctx.currentTime, 0.02);
    sfxBus.gain.setTargetAtTime(vol.sfx, ctx.currentTime, 0.02);
  };

  A.stopMusic = function () {
    pendingMenu = null;
    menuId = null;
    if (menuPlayer) { menuPlayer.stop(0.4); menuPlayer = null; }
  };

  A.menu = function (id) {
    if (!ctx) { pendingMenu = id; return; }
    if (menuId === id && menuPlayer) return;
    var songs = window.NG.Songs;
    var def = songs && songs.menus && songs.menus[id];
    if (!def) return;
    A.stopMusic();
    menuId = id;
    menuPlayer = new Player(def, { loop: true, delay: 0.1, fadeIn: 0.5 });
  };

  function blip(t, type, f0, f1, dur, level, bus) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(level, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(bus || sfxBus);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function fuzz(t, freq, q, dur, level, type) {
    var f = ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    var g = ctx.createGain();
    g.gain.setValueAtTime(level, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    var s = noiseSrc(t, dur + 0.02);
    s.connect(f); f.connect(g); g.connect(sfxBus);
    return g;
  }

  function swell(t, freq, q, dur, level) {
    var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(level, t + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    var s = noiseSrc(t, dur + 0.02);
    s.connect(f); f.connect(g); g.connect(sfxBus);
  }

  var SFX = {
    click: function (t) { blip(t, 'square', 1500, 900, 0.03, 0.14); },
    select: function (t) { blip(t, 'square', 620, 620, 0.05, 0.14); blip(t + 0.05, 'square', 930, 930, 0.08, 0.14); },
    perfect: function (t) { blip(t, 'triangle', 1320, 1320, 0.09, 0.26); blip(t + 0.04, 'triangle', 1760, 1760, 0.12, 0.2); },
    good: function (t) { blip(t, 'triangle', 880, 880, 0.08, 0.22); },
    miss: function (t) {
      /* the clank: a dropped guitar lead hitting a stage floor */
      blip(t, 'square', 330, 92, 0.13, 0.32);
      blip(t, 'sawtooth', 1187, 240, 0.09, 0.2);
      fuzz(t, 2600, 4, 0.1, 0.5);
    },
    blast: function (t) {
      blip(t, 'sawtooth', 70, 880, 0.55, 0.42);
      blip(t, 'square', 110, 1320, 0.55, 0.22);
      fuzz(t, 3200, 0.6, 0.8, 0.6, 'highpass');
      swell(t + 0.2, 1500, 0.7, 1.3, 0.5);
    },
    cheer: function (t) { swell(t, 1300, 0.7, 1.4, 0.5); swell(t + 0.1, 2300, 1.1, 1.1, 0.26); },
    boo: function (t) { swell(t, 240, 1.4, 1.5, 0.75); blip(t, 'sawtooth', 138, 98, 1.2, 0.17); blip(t + 0.05, 'sawtooth', 148, 92, 1.2, 0.14); },
    flash: function (t) { fuzz(t, 5200, 0.7, 0.11, 0.5, 'highpass'); blip(t, 'sine', 2400, 900, 0.09, 0.12); },
    thud: function (t) { blip(t, 'sine', 130, 42, 0.2, 0.75); fuzz(t, 400, 1, 0.06, 0.4); },
    chime: function (t) { [1047, 1319, 1568].forEach(function (f, i) { blip(t + i * 0.07, 'sine', f, f, 0.5, 0.2); }); },
    page: function (t) { swell(t, 3400, 0.8, 0.18, 0.28); },
    win: function (t) { [523, 659, 784, 1047, 1319].forEach(function (f, i) { blip(t + i * 0.1, 'square', f, f, 0.2, 0.15); }); },
    lose: function (t) { [392, 370, 349, 262].forEach(function (f, i) { blip(t + i * 0.2, 'sawtooth', f, f * 0.97, 0.34, 0.17); }); },
    type: function (t) { blip(t, 'square', 1700 + Math.random() * 500, 800, 0.016, 0.07); }
  };

  A.sfx = function (name) {
    if (!ctx || !SFX[name] || ctx.state !== 'running') return;
    SFX[name](ctx.currentTime + 0.002);
  };

  var TONE = [40, 45, 52, 76];
  A.tone = function (lane, durSec) {
    if (!ctx || ctx.state !== 'running') return;
    var t = ctx.currentTime + 0.002, dur = Math.max(0.05, +durSec || 0.2), l = (lane | 0) & 3;
    if (l === 0) { blip(t, 'sine', 170, 50, Math.min(0.3, dur), 0.85); fuzz(t, 3000, 1, 0.03, 0.35, 'highpass'); return; }
    var f = mtof(TONE[l]);
    var o = ctx.createOscillator(), g = ctx.createGain();
    var fl = ctx.createBiquadFilter();
    fl.type = l === 3 ? 'bandpass' : 'lowpass';
    fl.frequency.value = l === 3 ? 900 : (l === 1 ? 800 : 2400);
    fl.Q.value = l === 3 ? 3 : 0.8;
    o.type = 'sawtooth'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.42, t + 0.008);
    g.gain.setValueAtTime(0.34, t + Math.max(0.01, dur - 0.04));
    g.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.05);
    o.connect(fl); fl.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + dur + 0.08);
  };

  /* ---------- extras for rhythm.js (not part of the shared contract) ---------- */
  A.isRunning = function () { return !!ctx && ctx.state === 'running'; };
  A.hasContext = function () { return !!ctx; };
  A.now = function () { return ctx ? ctx.currentTime : 0; };
  A.latency = function () {
    if (!ctx) return 0;
    var v = ctx.outputLatency;
    if (typeof v !== 'number' || !isFinite(v) || v <= 0 || v > 0.6) v = ctx.baseLatency || 0;
    return (typeof v === 'number' && isFinite(v) && v > 0 && v < 0.6) ? v : 0;
  };
  /* song: from NG.Songs.get. opts: {delay, ticks:[seconds from startAt]} */
  A.startSong = function (song, opts) {
    if (!ctx) return null;
    return new Player(song, opts || {});
  };
  A.pauseClock = function () {
    userPaused = true;
    if (ctx && ctx.state === 'running') {
      var p = ctx.suspend();
      if (p && p.catch) p.catch(function () {});
    }
  };
  A.resumeClock = function () {
    userPaused = false;
    if (ctx && ctx.state !== 'running') {
      var p = ctx.resume();
      if (p && p.catch) p.catch(function () {});
    }
  };
  /* Spend a gesture on the context while paused, so the later un-gestured resume is allowed on iOS. */
  A.blessResume = function () {
    if (!ctx || ctx.state === 'running') return;
    var p = ctx.resume();
    if (p && p.then) p.then(function () { if (userPaused && ctx.state === 'running') ctx.suspend(); }, function () {});
  };
  A._liveCount = function () {
    var n = 0;
    players.forEach(function (p) { n += p.live.length; });
    return { players: players.length, nodes: n };
  };

  window.NG.Audio = A;
})();
