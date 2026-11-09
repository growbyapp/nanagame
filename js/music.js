/* HEY, NANA - Room 707: recorded music and voice.
   One music element, so two tracks can never play over each other.
   On http(s) both elements are routed through Web Audio, because iOS ignores
   element.volume. On file:// routing would output silence, so element.volume is used. */
window.NG = window.NG || {};
(function () {
  'use strict';

  var A = NG.Audio;
  if (!A) return;

  // `audio/` holds the original soundtrack that ships with the public site.
  // `assets/` is an optional local-only folder; when present it takes over.
  var TRACKS = {
    title: { src: 'audio/title.mp3', trim: 1, local: 'assets/music/opening.mp3', localTrim: 0.43 },
    happy: { src: 'audio/happy.mp3', trim: 1, local: 'assets/music/happy.mp3', localTrim: 0.51 },
    intense: { src: 'audio/intense.mp3', trim: 1, local: 'assets/music/intense.mp3', localTrim: 0.6 },
    sad: { src: 'audio/sad.mp3', trim: 1, local: 'assets/music/sad.mp3', localTrim: 0.77 }
  };
  var useLocal = false, hasVoice = false;
  function probe(src, cb) {
    var a = new window.Audio();
    a.preload = 'metadata';
    a.addEventListener('loadedmetadata', function () { cb(true); });
    a.addEventListener('error', function () { cb(false); });
    a.src = src;
  }
  probe('assets/music/happy.mp3', function (ok) { useLocal = ok; });
  probe('assets/voice/laugh.mp3', function (ok) { hasVoice = ok; });

  /* Tracks a player picks themselves. They are stored only in this browser and never leave the device. */
  var custom = {}, customNames = {}, CUSTOM_TRIM = 0.6, MAX_BYTES = 40 * 1024 * 1024;

  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = window.indexedDB.open('nana707-tracks', 1);
      req.onupgradeneeded = function () { req.result.createObjectStore('tracks'); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function withStore(mode, fn) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('tracks', mode), req = fn(tx.objectStore('tracks'));
        tx.oncomplete = function () { db.close(); resolve(req && req.result); };
        tx.onerror = tx.onabort = function () { db.close(); reject(tx.error); };
      });
    });
  }
  function adopt(slot, rec) {
    if (custom[slot]) URL.revokeObjectURL(custom[slot]);
    custom[slot] = URL.createObjectURL(rec.blob);
    customNames[slot] = rec.name;
  }
  function loadCustom() {
    if (!window.indexedDB) return;
    Promise.all([withStore('readonly', function (s) { return s.getAllKeys(); }), withStore('readonly', function (s) { return s.getAll(); })])
      .then(function (r) { r[0].forEach(function (slot, i) { if (TRACKS[slot]) adopt(slot, r[1][i]); }); })
      .catch(function () { /* private mode: the originals still play */ });
  }
  loadCustom();

  function canPlay(blob) {
    return new Promise(function (resolve, reject) {
      var a = new window.Audio(), url = URL.createObjectURL(blob);
      var done = function (fn, v) { clearTimeout(t); URL.revokeObjectURL(url); fn(v); };
      var t = setTimeout(function () { done(reject, new Error('timeout')); }, 8000);
      a.preload = 'metadata';
      a.addEventListener('loadedmetadata', function () { done(resolve); });
      a.addEventListener('error', function () { done(reject, new Error('unplayable')); });
      a.src = url;
    });
  }

  function reloadIfPlaying(slot) {
    delete positions[slot];
    if (current === slot) { music.el.src = srcFor(slot); apply(); play(music); }
  }

  A.customTracks = function () { return customNames; };
  A.setCustomTrack = function (slot, file) {
    if (!TRACKS[slot] || !file) return Promise.reject(new Error('slot'));
    if (file.size > MAX_BYTES) return Promise.reject(new Error('large'));
    return canPlay(file).then(function () {
      var rec = { blob: file, name: file.name };
      return withStore('readwrite', function (s) { return s.put(rec, slot); }).then(function () {
        adopt(slot, rec);
        reloadIfPlaying(slot);
      });
    });
  };
  A.clearCustomTrack = function (slot) {
    return withStore('readwrite', function (s) { return s.delete(slot); }).then(function () {
      if (custom[slot]) URL.revokeObjectURL(custom[slot]);
      delete custom[slot];
      delete customNames[slot];
      reloadIfPlaying(slot);
    });
  };
  var ALIAS = { room: 'happy', tension: 'intense' };
  var FADE_OUT = 0.35, FADE_IN = 0.7, DUCK = 0.3, TICK = 30;
  var SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';

  var music = media(true), voice = media(false);
  var vol = { music: 0.45, voice: 0.9 };
  var current = null, pending = null, level = 0, duck = 1, duckTarget = 1, unlocked = false, routed = false;
  var positions = {}, voiceSafety = null;
  var original = { setVolumes: A.setVolumes, unlock: A.unlock };

  function media(loop) {
    var el = new window.Audio();
    el.preload = 'auto';
    el.loop = loop;
    el.setAttribute('playsinline', '');
    return { el: el, gain: null };
  }
  function setGain(m, v) {
    v = Math.max(0, Math.min(1, v));
    if (m.gain) m.gain.gain.value = v; else m.el.volume = v;
  }
  function play(m) {
    var p = m.el.play();
    if (p && p.catch) p.catch(function () { /* blocked until the next tap */ });
  }

  function route() {
    if (routed || !/^https?:$/.test(location.protocol) || !A.context) return;
    var ctx = A.context();
    if (!ctx) return;
    routed = true;
    [music, voice].forEach(function (m) {
      try {
        var src = ctx.createMediaElementSource(m.el);
        m.gain = ctx.createGain();
        src.connect(m.gain);
        m.gain.connect(ctx.destination);
      } catch (e) { m.gain = null; }
    });
  }

  function trackId(id) { return ALIAS[id] || id; }
  function srcFor(t) { return custom[t] || (useLocal ? TRACKS[t].local : TRACKS[t].src); }

  function apply() {
    var trim = !current ? 1 : custom[current] ? CUSTOM_TRIM : (useLocal ? TRACKS[current].localTrim : TRACKS[current].trim);
    setGain(music, level * trim * vol.music * duck);
  }

  function swap() {
    var next = pending;   // '' means fade to silence
    pending = null;
    if (current && current !== 'title') positions[current] = music.el.currentTime;
    current = next || null;
    music.el.pause();
    if (!next) { level = 0; return; }
    music.el.src = srcFor(next);
    var at = positions[next] || 0;
    if (at) {
      var seek = function () {
        music.el.removeEventListener('loadedmetadata', seek);
        try { music.el.currentTime = at; } catch (e) { /* start from the top */ }
      };
      music.el.addEventListener('loadedmetadata', seek);
    }
    level = 0;
    apply();
    play(music);
  }

  setInterval(function () {
    var dt = TICK / 1000;
    if (pending !== null && pending !== current) {
      level -= dt / FADE_OUT;
      if (level <= 0 || !current) swap();
      apply();
      return;
    }
    pending = null;
    if (current && level < 1) level = Math.min(1, level + dt / FADE_IN);
    if (duck !== duckTarget) {
      var step = dt / 0.25;
      duck = duck < duckTarget ? Math.min(duckTarget, duck + step) : Math.max(duckTarget, duck - step);
    }
    if (current) apply();
  }, TICK);

  A.context = A.context || function () { return null; };

  A.menu = function (id) {
    var t = trackId(id);
    if (!TRACKS[t]) return;
    if (pending === t || (pending === null && current === t)) return;
    pending = t;
    if (!current && unlocked) swap();
  };

  A.stopMusic = function () {
    if (current || pending) pending = '';
    if (!current) pending = null;
  };

  A.setVolumes = function (m, s, v) {
    if (typeof m === 'number') vol.music = m;
    if (typeof v === 'number') vol.voice = v;
    setGain(voice, vol.voice);
    apply();
    original.setVolumes.call(A, m, s);
  };

  function releaseDuck() {
    duckTarget = 1;
    if (voiceSafety) { clearTimeout(voiceSafety); voiceSafety = null; }
  }
  voice.el.addEventListener('ended', releaseDuck);
  voice.el.addEventListener('error', releaseDuck);

  // Only one voice clip at a time: a new line cuts off the last one.
  var voiceDone = null;
  function voiceEnded() {
    var cb = voiceDone;
    voiceDone = null;
    if (cb) cb();
  }
  voice.el.addEventListener('ended', voiceEnded);
  voice.el.addEventListener('error', voiceEnded);

  A.voice = function (id, onEnd) {
    if (!unlocked || !hasVoice || vol.voice <= 0 || !id) { if (onEnd) onEnd(); return; }
    voiceDone = onEnd || null;
    voice.el.pause();
    voice.el.src = 'assets/voice/' + id + '.mp3';
    setGain(voice, vol.voice);
    duckTarget = DUCK;
    if (voiceSafety) clearTimeout(voiceSafety);
    voiceSafety = setTimeout(releaseDuck, 30000);
    play(voice);
  };
  A.hasVoice = function () { return hasVoice; };
  A.stopVoice = function () {
    voiceDone = null;
    voice.el.pause();
    releaseDuck();
  };

  A.unlock = function () {
    original.unlock.call(A);
    if (unlocked) return;
    unlocked = true;
    route();
    // iOS only lets an element play later if it was started inside a tap.
    voice.el.src = SILENCE;
    play(voice);
    if (pending && !current) swap();
  };

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      music.el.pause();
      voice.el.pause();
    } else if (current) {
      play(music);
    }
  });
})();
