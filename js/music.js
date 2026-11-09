/* HEY, NANA - Room 707: recorded music and voice.
   One music element, so two tracks can never play over each other.
   On http(s) both elements are routed through Web Audio, because iOS ignores
   element.volume. On file:// routing would output silence, so element.volume is used. */
window.NG = window.NG || {};
(function () {
  'use strict';

  var A = NG.Audio;
  if (!A) return;

  var TRACKS = {
    title: { src: 'assets/music/opening.mp3', trim: 0.43 },
    happy: { src: 'assets/music/happy.mp3', trim: 0.51 },
    intense: { src: 'assets/music/intense.mp3', trim: 0.6 },
    sad: { src: 'assets/music/sad.mp3', trim: 0.77 }
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

  function apply() {
    var trim = current ? TRACKS[current].trim : 1;
    setGain(music, level * trim * vol.music * duck);
  }

  function swap() {
    var next = pending;   // '' means fade to silence
    pending = null;
    if (current && current !== 'title') positions[current] = music.el.currentTime;
    current = next || null;
    music.el.pause();
    if (!next) { level = 0; return; }
    music.el.src = TRACKS[next].src;
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
    if (!unlocked || vol.voice <= 0 || !id) { if (onEnd) onEnd(); return; }
    voiceDone = onEnd || null;
    voice.el.pause();
    voice.el.src = 'assets/voice/' + id + '.mp3';
    setGain(voice, vol.voice);
    duckTarget = DUCK;
    if (voiceSafety) clearTimeout(voiceSafety);
    voiceSafety = setTimeout(releaseDuck, 30000);
    play(voice);
  };
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
