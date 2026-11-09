window.NG = window.NG || {};
(function () {
  'use strict';

  var SAVE_KEY = 'nana707.v1';
  var STATS = { bond: 'Bond', fame: 'Fame', scandal: 'Scandal', harmony: 'Harmony' };
  var STAT_ICONS = { bond: 'glass', fame: 'star', scandal: 'pin', harmony: 'mic' };
  var NAMES = {
    hachi: 'Hachi', nana: 'Nana', ren: 'Ren', nobu: 'Nobu', shin: 'Shin', yasu: 'Yasu',
    reira: 'Reira', takumi: 'Takumi', naoki: 'Naoki', junko: 'Junko', kyosuke: 'Kyosuke', shoji: 'Shoji', misato: 'Misato', demon: 'The Demon Lord', paula: 'Paula', samu: 'Samu', yuki: 'Yuki'
  };
  var DIFFS = [
    { id: 'hachi', name: 'Hachi', desc: 'Easy. You cannot fail. She believes in you.' },
    { id: 'nana', name: 'Nana', desc: 'The real gig. The crowd can turn on you.' },
    { id: 'demon', name: 'Demon', desc: 'Fate itself is holding the drumsticks.' }
  ];
  var RANK_FAME = { S: 2, A: 2, B: 1 };
  var DEAL_LINES = [
    'A little curse, for a lot of glory. What could go wrong? (Everything. I checked.)',
    'Sign here, here, and across your entire future.',
    'I do love a girl with ambition and poor impulse control.'
  ];

  var CAST = [
    ['nana', 'Nana Osaki', 'BLAST, vocals', 'Came to Tokyo to be somebody. Has a voice that could end a war, or start one.'],
    ['hachi', 'Nana "Hachi" Komatsu', 'Roommate, 707', 'Falls in love at first sight about twice a week. As loyal as the dog she is nicknamed after.'],
    ['ren', 'Ren Honjo', 'Trapnest, guitar', 'BLAST\'s first bassist. Wears a padlock around his neck and his heart somewhere much harder to reach.'],
    ['nobu', 'Nobu', 'BLAST, guitar', 'Heir to a family inn who chose a guitar. All heart, no poker face.'],
    ['shin', 'Shin', 'BLAST, bass', 'Youngest in the band. Oldest eyes in any room.'],
    ['yasu', 'Yasu', 'BLAST, drums and leader', 'Shaved head, dark glasses, ex-lawyer. The only adult in any building.'],
    ['reira', 'Reira', 'Trapnest, vocals', 'A voice like moonlight through glass, and the loneliest smile in Japan.'],
    ['takumi', 'Takumi', 'Trapnest, bass and leader', 'Gets what he wants, and has already decided what that is.'],
    ['naoki', 'Naoki', 'Trapnest, drums', 'The happiest man in the music industry. Is that your sandwich?'],
    ['junko', 'Junko', 'Hachi\'s best friend', 'Has been telling Hachi this for years.'],
    ['kyosuke', 'Kyosuke', 'Junko\'s boyfriend', 'Has a spare futon, and has never once said "I told you so".'],
    ['shoji', 'Shoji', 'Hachi\'s ex', 'An art student. The reason she got on the train.'],
    ['misato', 'Misato', 'BLAST superfan', 'Knows your setlist better than you do.'],
    ['demon', 'The Demon Lord', 'Fate, allegedly', 'Hachi\'s official explanation for everything.'],
    ['paula', 'Paula', 'Nail tech, biggest fan', 'Kind, emotional and frighteningly good at customer service. Has read your whole life.'],
    ['samu', 'Samu', 'Paula\'s boyfriend', 'Crossed a dimension with her phone charger. Has read two chapters.'],
    ['yuki', 'Yuki', 'Cat, management', 'Her name means snow. She is black. She thinks that is funny too.']
  ];
  var SONG_FACE = { 'last-train': ['nana', 'neutral'], 'strawberry-glass': ['hachi', 'happy'], 'padlock': ['ren', 'neutral'], 'room-707': ['nobu', 'happy'], 'birdcage': ['reira', 'smirk'], 'demon-encore': ['demon', 'smirk'] };
  var REACTIONS = {
    S: [['happy', 'I cried off all my mascara and it was WORTH IT!'], ['smirk', 'Not bad. Don\'t get used to it.']],
    A: [['happy', 'That was so cool I forgot to breathe!'], ['smirk', 'Good. Again tomorrow, louder.']],
    B: [['happy', 'I clapped the whole time! Mostly on the beat!'], ['neutral', 'We got through it. Next time we take it.']],
    C: [['sad', 'It wasn\'t bad! ...Was it bad?'], ['angry', 'Nobu\'s tuning can\'t take all the blame.']],
    D: [['sad', 'This is the Demon Lord\'s fault. I have evidence.'], ['angry', 'Get up. We\'re playing it again.']]
  };
  var PREP_LINES = [
    ['Front row, glow stick, spare tissues. I\'m ready!', 'Stay close. I\'m only singing it once.'],
    ['I made everyone onigiri! Please don\'t throw up!', 'If you\'re scared, be scared loud.'],
    ['Nana! Look at me! I\'m waving! It\'s me!', 'I can see you, Hachi. The whole venue can.']
  ];

  // Each location and minigame has its own mood. A `music` step in the script overrides the next scene.
  var SCENE_MOOD = {
    'train-snow': 'sad', 'room-707': 'room', 'jackson-hole': 'room', 'live-house': 'tension', 'tokyo-night': 'sad',
    newsstand: 'tension', arena: 'tension', 'rain-rift': 'sad', 'demon-realm': 'tension', studio: 'room', penthouse: 'sad',
    rooftop: 'sad', hometown: 'sad', platform: 'sad', backstage: 'tension', inn: 'room', 'road-van': 'room'
  };
  var GAME_MOOD = { shortcake: 'room', redflag: 'room', scandal: 'tension', crowdsurf: 'tension', padlock: 'sad', cups: 'tension', fitcheck: 'room', objection: 'tension', inn: 'room', sandwich: 'room', nails: 'room' };
  var musicLock = false;
  // Recorded lines, played as wordless "memory" beats so they never clash with the written dialogue.
  var MEMORY_WHO = { 'regret': 'nana', 'are-you-happy': 'nana', 'afraid-distance': 'nana', 'cheap-glass': 'nana', 'jealous-reira': 'nana', 'crush-them': 'nana', 'love-not-waste': 'nana', 'face-to-face': 'nana', 'cant-move': 'nana', 'no-matter': 'nana', 'nobu-stepped': 'nana', 'takumi-advice': 'nana', 'fish': 'nana', 'stars-ren': 'nana' };
  var WF_MEMORY = {
    'ren-lives': { open: 'stars-ren', ends: { passenger: 'dreams-happy', clinic: 'no-matter', answered: 'love-not-waste', the_road: 'fish' } },
    'hachi-nobu': { open: 'nobu-face', ends: { inn_life: 'house-hill', two_fathers: 'takumi-advice', her_own: 'dreams-happy', let_go: 'nobu-stepped' } },
    'never-left': { open: 'stairs', ends: { our_room: 'every-day', open_door: 'summer', empty: 'need-me', everyone: 'kitchen-stage' } },
    'the-train': { open: 'fate', ends: { plus_one: 'afraid-distance', two_stars: 'jealous-reira', stones: 'adored', second_train: 'regret' } },
    'reira-sings': { open: 'jealous-reira', ends: { street: 'dream-again', gilded: 'afraid-distance', duet: 'sing-again', wreck: 'forgive' } },
    'sunglasses': { open: 'no-matter', ends: { told_her: 'dreams-happy', miu: 'so-happy', law: 'regret', shades: 'cant-move' } },
    'finding-nana': { open: 'calling', ends: { home: 'love-not-waste', letters: 'are-you-happy', goodbye: 'cant-move', one_song: 'sing-again' } }
  };
  var LETTER_VOICE = ['hey-nana-1', 'hey-nana-2', 'hey-nana-3', 'hey-nana-4', 'hey-nana-5'];
  var greeted = false;

  var app, toasts;
  var meta = defaultMeta();
  var state = null;
  var frames = [];
  var vn = null;
  var waiting = null;
  var typing = null;
  var skipping = false;
  var cleanup = null;
  var pendingCurses = [];

  NG.settings = { offsetMs: 0, speed: 1, reduceFlash: false, music: 0.45, sfx: 0.6, voice: 0.9 };

  function defaultMeta() {
    return { settings: null, run: null, unlocked: { 'last-train': true }, best: {}, games: {}, polaroids: {}, keepsakes: {}, endings: {}, whatif: {}, wfRun: null, wfSeen: false, mangaOK: false, diff: 'hachi', persona: 'pink' };
  }
  function freshState() {
    return { persona: 'pink', bond: 0, fame: 0, scandal: 0, harmony: 0, flags: {}, chapter: 0, step: 0, scene: null, music: null };
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        var base = defaultMeta();
        for (var k in base) if (saved[k] !== undefined) meta[k] = saved[k];
        if (meta.settings) for (var s in NG.settings) if (meta.settings[s] !== undefined) NG.settings[s] = meta.settings[s];
        // Saves from before the recorded soundtrack kept the old, too-loud levels.
        if (!saved.audioV) { NG.settings.music = 0.45; NG.settings.sfx = 0.6; }
      }
    } catch (e) { /* private mode: play without saving */ }
  }
  function save() {
    meta.settings = NG.settings;
    meta.audioV = 1;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(meta)); } catch (e) { /* ignore */ }
  }

  function audio(fn) {
    if (!NG.Audio || !NG.Audio[fn]) return;
    try { NG.Audio[fn].apply(NG.Audio, [].slice.call(arguments, 1)); } catch (e) { console.warn(e); }
  }
  function sfx(name) { audio('sfx', name); }

  // A broken drawing must never take a whole screen down with it.
  function art(fn, a, b) {
    try { return NG.Art ? NG.Art[fn](a, b) : ''; } catch (e) { console.warn('art', fn, a, e); return ''; }
  }
  function portrait(who, expr) { return art('portrait', who, expr || 'neutral'); }
  function icon(name) { return art('icon', name); }
  function sceneHtml(id) { return id ? art('scene', id) : ''; }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function btn(label, cls, fn) {
    var b = el('button', 'btn ' + (cls || ''));
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', function (e) { e.stopPropagation(); sfx('click'); fn(e); });
    return b;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  function mount(node) {
    audio('stopVoice');
    if (cleanup) { var c = cleanup; cleanup = null; c(); }
    app.innerHTML = '';
    var s = el('section', 'screen active');
    s.appendChild(node);
    app.appendChild(s);
    window.scrollTo(0, 0);
    return s;
  }

  function toast(text, cls) {
    var t = el('div', 'toast ' + (cls || ''));
    t.textContent = text;
    toasts.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }

  /* ---------- Gate and title ---------- */

  function showGate() {
    var g = el('div', 'gate');
    g.innerHTML =
      '<h1 class="gate-title">An unofficial love letter to <em>NANA</em></h1>' +
      '<p class="disclaimer">A free, non-commercial fan game. <em>NANA</em> and its characters belong to Ai Yazawa and their rights holders, and Vivienne Westwood is a trademark of its owner; this project is not affiliated with or endorsed by either. All art, music and writing here are original fan work.</p>' +
      '<p class="disclaimer">Goes off-canon on purpose, and alludes to late-series events. Best with sound on.</p>';
    g.appendChild(btn('Open the door to 707', 'primary', function () {
      audio('unlock');
      audio('setVolumes', NG.settings.music, NG.settings.sfx, NG.settings.voice);
      showTitle();
      if (!greeted) { greeted = true; audio('voice', 'remember-first'); }
    }));
    mount(g);
  }

  function ransom(text) {
    return text.split('').map(function (ch) {
      return ch === ' ' ? '<span class="sp">&nbsp;</span>' : '<span>' + esc(ch) + '</span>';
    }).join('');
  }

  function showTitle() {
    audio('menu', 'title');
    var t = el('div', 'title');
    t.innerHTML =
      '<div class="title-art' + (NG.Art && NG.Art.hero ? ' hero' : '') + '">' + (NG.Art && NG.Art.hero ? NG.Art.hero() : portrait('hachi', 'happy') + portrait('nana', 'smirk')) + '</div>' +
      '<h1 class="ransom" aria-label="Hey, Nana">' + ransom('HEY, NANA') + '</h1>' +
      '<p class="title-sub">Room 707 &mdash; a fan game for everyone still waiting</p>';
    var menu = el('div', 'title-menu');
    if (meta.run) menu.appendChild(btn('Continue the story', 'primary', function () { resumeStory(); }));
    menu.appendChild(btn('New story', meta.run ? '' : 'primary', function () {
      if (meta.run && !window.confirm('Start over? Your current story will be lost. Songs and polaroids stay.')) return;
      startStory();
    }));
    if (NG.WhatIf) menu.appendChild(btn('What If...?', '', showWhatIf));
    menu.appendChild(btn('Live House', '', showLiveHouse));
    menu.appendChild(btn('Arcade', '', showArcade));
    menu.appendChild(btn('The Cast', '', showCast));
    menu.appendChild(btn('Scrapbook', '', showScrapbook));
    menu.appendChild(btn('Settings', 'ghost', showSettings));
    t.appendChild(menu);
    t.appendChild(el('p', 'disclaimer', 'Unofficial fan work. Not affiliated with Ai Yazawa or the rights holders.'));
    mount(t);
  }

  /* ---------- Story runner ---------- */

  function startStory() {
    state = freshState();
    NG.state = state;
    frames = [];
    if (vn) vn.classList.remove('whatif');
    openChapter(0);
  }

  function resumeStory() {
    var saved = NG.Story.chapters[meta.run.chapter];
    if (saved && saved.manga && !meta.mangaOK) { mangaGate(resumeStory, showTitle); return; }
    state = meta.run;
    NG.state = state;
    if (!state.flags) state.flags = {};
    buildVN();
    vn.classList.remove('whatif');
    if (state.scene) setScene(state.scene);
    if (state.music) playMusic(state.music);
    frames = [{ steps: chapterSteps(state.chapter), i: state.step, top: true }];
    showVN();
    step();
  }

  function chapterSteps(i) {
    var c = NG.Story.chapters[i];
    return c ? c.steps : [];
  }

  // The anime stops around manga volume 12. Anything beyond that gets a warning first.
  function mangaGate(proceed, back) {
    if (meta.mangaOK) { proceed(); return; }
    var g = el('div', 'gate manga-gate');
    g.innerHTML = '<div class="manga-tag">Manga spoilers</div><h1 class="gate-title">This goes <em>past the anime</em></h1>' +
      '<p class="disclaimer">What comes next deals with events from the manga that the anime never reached. If you have only seen the anime, you may want to turn back here.</p>';
    g.appendChild(btn('I have read the manga. Continue', 'primary', function () { meta.mangaOK = true; save(); proceed(); }));
    g.appendChild(btn('Not yet, take me back', 'ghost', back));
    mount(g);
  }

  function openChapter(i) {
    var gated = NG.Story.chapters[i];
    if (gated && gated.manga && !meta.mangaOK) { mangaGate(function () { openChapter(i); }, showTitle); return; }
    state.chapter = i;
    state.step = 0;
    var chapter = NG.Story.chapters[i];
    if (!chapter) { showTitle(); return; }
    if (!vn) buildVN();
    var card = el('div', 'chapter-card');
    card.innerHTML = '<div class="duo plain"><div class="duo-char">' + portrait('hachi', 'neutral') + '</div><div class="duo-char">' + portrait('nana', 'neutral') + '</div></div><div class="chapter-no">' + (i === 0 ? 'Prologue' : 'Track ' + i) + '</div><h2>' + esc(chapter.title) + '</h2>';
    mount(card);
    sfx('page');
    var go = function () {
      if (!card.isConnected) return;
      frames = [{ steps: chapter.steps, i: 0, top: true }];
      showVN();
      step();
    };
    card.addEventListener('click', go);
    setTimeout(go, 1700);
  }

  function persist() {
    if (frames.length === 1 && frames[0].top) {
      state.step = frames[0].i;
      if (state.mode === 'whatif') meta.wfRun = JSON.parse(JSON.stringify(state));
      else meta.run = JSON.parse(JSON.stringify(state));
      save();
    }
  }

  function step() {
    while (frames.length && frames[frames.length - 1].i >= frames[frames.length - 1].steps.length) {
      var finished = frames.pop();
      if (finished.onDone) { finished.onDone(); return; }
    }
    if (!frames.length) {
      if (state.mode === 'whatif') showWhatIf(); else openChapter(state.chapter + 1);
      return;
    }
    persist();
    var f = frames[frames.length - 1];
    var s = f.steps[f.i++];
    var h = HANDLERS[s.type];
    if (h) h(s); else step();
  }

  function pushSteps(steps, onDone) {
    frames.push({ steps: steps || [], i: 0, onDone: onDone });
  }

  function test(c) {
    if (!c) return true;
    var s = state;
    if (c.bond != null && s.bond < c.bond) return false;
    if (c.fame != null && s.fame < c.fame) return false;
    if (c.harmony != null && s.harmony < c.harmony) return false;
    if (c.maxScandal != null && s.scandal > c.maxScandal) return false;
    if (c.flag && !s.flags[c.flag]) return false;
    if (c.notFlag && s.flags[c.notFlag]) return false;
    if (c.bossDefeated != null && !!s.flags.bossDefeated !== c.bossDefeated) return false;
    if (c.rel) for (var who in c.rel) if (((s.rel || {})[who] || 0) < c.rel[who]) return false;
    return true;
  }

  function applyEffects(fx) {
    if (!fx) return;
    Object.keys(fx).forEach(function (k) {
      if (!STATS[k] || !fx[k]) return;
      state[k] = Math.max(0, (state[k] || 0) + fx[k]);
      var worse = k === 'scandal' ? fx[k] > 0 : fx[k] < 0;
      toast((fx[k] > 0 ? '+' : '') + fx[k] + ' ' + STATS[k], worse ? 'bad' : 'good');
    });
    updateHUD();
  }

  function playMusic(id) {
    state.music = id;
    if (id === 'stop') audio('stopMusic'); else audio('menu', id);
  }

  function buildVN() {
    vn = el('div', 'vn');
    var stats = Object.keys(STATS).map(function (k) {
      return '<div class="stat" data-stat="' + k + '" title="' + STATS[k] + '">' + icon(STAT_ICONS[k]) + '<span class="stat-label">' + STATS[k] + '</span><b>0</b></div>';
    }).join('');
    vn.innerHTML =
      '<div class="vn-bg"></div>' +
      '<div class="vn-portraits"><div class="portrait left"></div><div class="portrait right"></div></div>' +
      '<div class="vn-hud">' + stats + '</div>' +
      '<div class="vn-tools"><button type="button" class="vn-tool" data-act="skip">Skip</button><button type="button" class="vn-tool" data-act="menu">Menu</button></div>' +
      '<div class="vn-box"><div class="vn-name"></div><div class="vn-text"></div><div class="vn-next">&#9660;</div></div>' +
      '<div class="vn-choices"></div>';
    vn.addEventListener('click', function (e) {
      var tool = e.target.closest('.vn-tool');
      if (tool) {
        e.stopPropagation();
        sfx('click');
        if (tool.dataset.act === 'menu') {
          stopTyping();
          clearChoiceTimer();
          waiting = null;
          if (state && state.mode === 'whatif') showWhatIf(); else showTitle();
        }
        else toggleSkip();
        return;
      }
      if (e.target.closest('.vn-choices, .letter-wrap, .polaroid-pop, .keepsake-pop, .memory')) return;
      vnAdvance();
    });
    updateHUD();
  }

  function showVN() { mount(vn); updateHUD(); }

  function updateHUD() {
    if (!vn || !state) return;
    Object.keys(STATS).forEach(function (k) {
      var b = vn.querySelector('.stat[data-stat="' + k + '"] b');
      if (b) b.textContent = state[k] || 0;
    });
  }

  function toggleSkip() {
    skipping = !skipping;
    var t = vn.querySelector('[data-act="skip"]');
    if (t) t.classList.toggle('on', skipping);
    if (skipping) vnAdvance();
  }
  function stopSkip() {
    skipping = false;
    var t = vn && vn.querySelector('[data-act="skip"]');
    if (t) t.classList.remove('on');
  }

  function vnAdvance() {
    if (typing) { typing.finish(); return; }
    if (waiting) { var w = waiting; waiting = null; w(); }
  }

  var choiceTimer = null;
  function clearChoiceTimer() {
    if (choiceTimer) { clearInterval(choiceTimer); choiceTimer = null; }
    var bar = vn && vn.querySelector('.vn-timer');
    if (bar) bar.remove();
  }

  function jumpTo(name) {
    for (var d = frames.length - 1; d >= 0; d--) {
      var idx = frames[d].steps.findIndex(function (x) { return x.type === 'label' && x.name === name; });
      if (idx !== -1) {
        frames.length = d + 1;
        frames[d].i = idx;
        return;
      }
    }
  }

  function remember(text) {
    var r = el('div', 'remember');
    r.innerHTML = '<span class="remember-icon">' + icon('letter') + '</span>';
    r.appendChild(document.createTextNode(text));
    toasts.appendChild(r);
    sfx('chime');
    setTimeout(function () { r.remove(); }, 3200);
  }

  function stopTyping() {
    if (typing) { clearInterval(typing.timer); typing = null; }
  }

  function setScene(id) {
    state.scene = id;
    vn.querySelector('.vn-bg').innerHTML = sceneHtml(id);
    clearPortraits();
    if (musicLock) musicLock = false;
    else if (SCENE_MOOD[id]) playMusic(SCENE_MOOD[id]);
  }
  function clearPortraits() {
    vn.querySelectorAll('.portrait').forEach(function (p) {
      p.innerHTML = '';
      p.classList.remove('active');
      delete p.dataset.key;
    });
  }

  function showLine(name, text) {
    var box = vn.querySelector('.vn-box');
    box.classList.remove('hidden');
    box.classList.toggle('narration', !name);
    vn.querySelector('.vn-name').textContent = name || '';
    vn.querySelector('.vn-name').style.display = name ? '' : 'none';
    var textEl = vn.querySelector('.vn-text');
    vn.querySelector('.vn-choices').innerHTML = '';
    stopTyping();
    var done = function () {
      waiting = step;
      if (skipping) setTimeout(vnAdvance, 40);
    };
    if (skipping) { textEl.textContent = text; done(); return; }
    var i = 0;
    textEl.textContent = '';
    var t = {
      timer: setInterval(function () {
        i++;
        textEl.textContent = text.slice(0, i);
        if (i % 4 === 0) sfx('type');
        if (i >= text.length) t.finish();
      }, 24),
      finish: function () {
        clearInterval(t.timer);
        textEl.textContent = text;
        typing = null;
        done();
      }
    };
    typing = t;
  }

  var HANDLERS = {
    scene: function (s) { setScene(s.id); step(); },
    music: function (s) { playMusic(s.id); musicLock = true; step(); },
    stat: function (s) { applyEffects(s.effects); step(); },
    label: function () { step(); },
    jump: function (s) {
      if (test(s.if)) jumpTo(s.to);
      step();
    },
    narrate: function (s) {
      vn.querySelectorAll('.portrait').forEach(function (p) { p.classList.remove('active'); });
      showLine('', s.text);
    },
    say: function (s) {
      var side = s.side || (s.who === 'hachi' ? 'left' : 'right');
      var other = side === 'left' ? 'right' : 'left';
      var p = vn.querySelector('.portrait.' + side);
      var key = s.who + ':' + (s.expr || 'neutral');
      if (p.dataset.key !== key) {
        p.innerHTML = portrait(s.who, s.expr);
        p.dataset.key = key;
      }
      p.classList.add('active');
      vn.querySelector('.portrait.' + other).classList.remove('active');
      showLine(NAMES[s.who] || s.who, s.text);
    },
    letter: function (s) {
      stopSkip();
      var wrap = el('div', 'letter-wrap');
      wrap.appendChild(el('div', 'letter-author', portrait('hachi', 'happy')));
      var letter = el('div', 'letter');
      var text = el('div', 'letter-text');
      text.textContent = s.text;
      letter.appendChild(text);
      letter.appendChild(btn('Keep reading', 'primary', function () { wrap.remove(); audio('stopVoice'); step(); }));
      wrap.appendChild(letter);
      sfx('page');
      audio('voice', LETTER_VOICE[Math.floor(Math.random() * LETTER_VOICE.length)]);
      vn.appendChild(wrap);
    },
    choice: function (s) {
      stopSkip();
      var list = vn.querySelector('.vn-choices');
      var box = vn.querySelector('.vn-box');
      box.classList.remove('narration');
      vn.querySelector('.vn-name').style.display = 'none';
      vn.querySelector('.vn-text').textContent = s.prompt || '';
      list.innerHTML = '';
      clearChoiceTimer();
      function pick(o) {
        clearChoiceTimer();
        sfx('select');
        list.innerHTML = '';
        applyEffects(o.effects);
        if (o.flag) state.flags[o.flag] = true;
        if (o.rel) {
          state.rel = state.rel || {};
          Object.keys(o.rel).forEach(function (k) { state.rel[k] = (state.rel[k] || 0) + o.rel[k]; });
        }
        if (state.mode === 'whatif') { state.log = state.log || []; state.log.push(o.label); }
        if (o.remember) remember(o.remember);
        if (o.reply && o.reply.length) {
          pushSteps(o.reply, o.next ? function () { jumpTo(o.next); step(); } : undefined);
        } else if (o.next) jumpTo(o.next);
        step();
      }
      s.options.forEach(function (o) {
        var c = el('button', 'choice' + (o.silent ? ' silent' : ''));
        c.type = 'button';
        c.textContent = o.label;
        c.addEventListener('click', function (e) { e.stopPropagation(); pick(o); });
        list.appendChild(c);
      });
      if (s.timer) {
        var bar = el('div', 'vn-timer', '<span></span>');
        vn.appendChild(bar);
        var fill = bar.firstChild;
        var total = s.timer * 1000;
        var started = Date.now();
        choiceTimer = setInterval(function () {
          var left = total - (Date.now() - started);
          fill.style.width = Math.max(0, left / total * 100) + '%';
          if (left <= 0) pick(s.options.find(function (o) { return o.silent; }) || s.options[0]);
        }, 40);
      }
    },
    memory: function (s) { runMemory(s.id, step); },
    remember: function (s) { remember(s.text); step(); },
    qte: function (s) { stopSkip(); runQTE(s); },
    wfend: function (s) {
      stopSkip();
      var end = WF_MEMORY[state.ep] && WF_MEMORY[state.ep].ends[s.id];
      if (end) runMemory(end, function () { finishWhatIf(s.id); });
      else finishWhatIf(s.id);
    },
    quiz: function () { stopSkip(); runQuiz(); },
    minigame: function (s) { stopSkip(); runStoryMinigame(s.id); },
    deal: function () { stopSkip(); runDeal(); },
    gig: function (s) { stopSkip(); runStoryGig(s); },
    keepsake: function (s) {
      var k = NG.Story.keepsakes && NG.Story.keepsakes[s.id];
      if (!k) { step(); return; }
      stopSkip();
      meta.keepsakes[s.id] = true;
      save();
      sfx('chime');
      var pop = el('div', 'keepsake-pop');
      pop.innerHTML = '<div class="keepsake-card"><div class="keepsake-tag">Keepsake found</div><div class="keepsake-art">' + icon(k.icon) + '</div><h3>' + esc(k.title) + '</h3><p>' + esc(k.caption) + '</p></div>';
      pop.querySelector('.keepsake-card').appendChild(btn('Put it on the shelf', 'primary', function () { pop.remove(); step(); }));
      vn.appendChild(pop);
    },
    polaroid: function (s) {
      var p = NG.Story.polaroids[s.id];
      if (!p) { step(); return; }
      stopSkip();
      meta.polaroids[s.id] = true;
      save();
      sfx('flash');
      var pop = el('div', 'polaroid-pop');
      pop.appendChild(polaroidCard(s.id, p));
      pop.appendChild(btn('Tape it in the scrapbook', 'primary', function () { pop.remove(); step(); }));
      vn.appendChild(pop);
    },
    ending: function () {
      var ending = NG.Story.endings.find(function (e) { return test(e.when); }) || NG.Story.endings[NG.Story.endings.length - 1];
      meta.endings[ending.id] = ending.title;
      save();
      pushSteps(ending.steps, function () { showEnd(ending); });
      step();
    }
  };

  function showEnd(ending) {
    stopSkip();
    meta.run = null;
    Object.keys(meta.best).forEach(function (id) { meta.unlocked[id] = true; });
    save();
    audio('menu', 'title');
    var found = Object.keys(meta.endings).length;
    var total = NG.Story.endings.length;
    var n = el('div', 'end-card');
    n.innerHTML = '<div class="duo plain"><div class="duo-char">' + portrait('hachi', 'happy') + '</div><div class="duo-char">' + portrait('nana', 'smirk') + '</div></div><div class="chapter-no">Ending found</div><h2>' + esc(ending.title) + '</h2>' +
      '<p>' + found + ' of ' + total + ' endings. The Demon Lord keeps the receipts.</p>';
    n.appendChild(btn('Back to the title', 'primary', showTitle));
    mount(n);
  }

  /* ---------- What If...? ---------- */

  function runMemory(id, next) {
    // Without voice clips there is nothing to play, so the beat is skipped outright.
    if (skipping || !(NG.Audio && NG.Audio.hasVoice && NG.Audio.hasVoice())) { next(); return; }
    stopTyping();
    var who = MEMORY_WHO[id] || 'hachi';
    var box = el('div', 'memory');
    box.innerHTML = '<div class="memory-face">' + portrait(who, 'neutral') + '</div><div class="memory-bars"><i></i><i></i><i></i><i></i><i></i></div><div class="memory-tag">A memory &middot; tap to skip</div>';
    vn.appendChild(box);
    var finished = false;
    var safety = setTimeout(finish, 45000);
    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(safety);
      audio('stopVoice');
      box.remove();
      next();
    }
    box.addEventListener('click', function (e) { e.stopPropagation(); finish(); });
    if (NG.Audio && NG.Audio.voice) NG.Audio.voice(id, finish); else finish();
  }

  function runQTE(s) {
    var need = s.taps || 8;
    var taps = 0;
    var box = el('div', 'qte');
    box.innerHTML = '<div class="qte-prompt">' + esc(s.prompt || 'Hurry!') + '</div><div class="qte-bar"><span></span></div><button type="button" class="qte-btn">TAP!</button><div class="qte-count"></div>';
    vn.appendChild(box);
    var button = box.querySelector('.qte-btn');
    var fill = box.querySelector('.qte-bar span');
    var count = box.querySelector('.qte-count');
    var total = (s.seconds || 3) * 1000;
    var started = Date.now();
    var done = false;
    function finish(ok) {
      if (done) return;
      done = true;
      clearInterval(timer);
      document.removeEventListener('keydown', onKey);
      box.remove();
      sfx(ok ? 'perfect' : 'miss');
      pushSteps(ok ? s.success : s.fail);
      step();
    }
    function hit(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      taps++;
      sfx('click');
      button.classList.remove('hit');
      void button.offsetWidth;
      button.classList.add('hit');
      count.textContent = taps + ' / ' + need;
      if (taps >= need) finish(true);
    }
    function onKey(e) {
      if (e.repeat || (e.key !== ' ' && e.key !== 'Enter')) return;
      hit(e);
    }
    button.addEventListener('pointerdown', hit);
    document.addEventListener('keydown', onKey);
    count.textContent = '0 / ' + need;
    var timer = setInterval(function () {
      var left = total - (Date.now() - started);
      fill.style.width = Math.max(0, left / total * 100) + '%';
      if (left <= 0) finish(false);
    }, 30);
  }

  function episode(id) { return NG.WhatIf.episodes.find(function (e) { return e.id === id; }); }

  function showWhatIf() {
    if (!meta.wfSeen) { showWhatIfGate(); return; }
    audio('menu', 'sad');
    var n = listScreen('What If...?', 'The moments we all wanted to go differently. Your choices will be remembered.');
    var list = el('div', 'wf-list');
    NG.WhatIf.episodes.forEach(function (ep, i) {
      var found = meta.whatif[ep.id] || {};
      var ids = Object.keys(ep.endings);
      var seen = ids.filter(function (x) { return found[x]; }).length;
      var c = el('button', 'wf-card');
      c.type = 'button';
      var faces = (ep.cast || []).slice(0, 3).map(function (who) { return '<div class="wf-face">' + portrait(who, 'neutral') + '</div>'; }).join('');
      c.innerHTML = '<div class="wf-no">Episode ' + (i + 1) + (ep.manga ? '<span class="manga-tag">Manga spoilers</span>' : '') + '</div><div class="wf-title">' + esc(ep.title) + '</div>' +
        '<div class="wf-tag">' + esc(ep.tagline || '') + '</div><div class="wf-faces">' + faces + '</div>' +
        '<div class="wf-found">' + ids.map(function (x) { return found[x] ? '&#9733;' : '&#9734;'; }).join('') + ' <span>' + seen + ' of ' + ids.length + ' endings</span></div>';
      c.addEventListener('click', function () { sfx('select'); showEpisode(ep); });
      list.appendChild(c);
    });
    n.appendChild(list);
    mount(n);
  }

  function showWhatIfGate() {
    var g = el('div', 'gate');
    g.innerHTML = '<h1 class="gate-title">These roads were <em>never taken</em></h1>' +
      '<p class="disclaimer">What If...? deals with grief, addiction and loss, and it is fan fiction, not canon. It assumes you know the anime. Episodes marked Manga spoilers go past where the anime stops, and will warn you first.</p>';
    g.appendChild(btn('I know the story. Take me there', 'primary', function () { meta.wfSeen = true; save(); showWhatIf(); }));
    g.appendChild(btn('Not yet', 'ghost', showTitle));
    mount(g);
  }

  function showEpisode(ep) {
    var found = meta.whatif[ep.id] || {};
    var p = el('div', 'prep wf-detail');
    var faces = (ep.cast || []).map(function (who) { return '<div class="wf-face big">' + portrait(who, 'neutral') + '</div>'; }).join('');
    p.innerHTML = '<div class="chapter-no">What If...?</div>' + (ep.manga ? '<div class="manga-tag">Manga spoilers</div>' : '') + '<h2>' + esc(ep.title) + '</h2><div class="wf-faces">' + faces + '</div><p>' + esc(ep.premise || '') + '</p>' +
      '<div class="wf-endings">' + Object.keys(ep.endings).map(function (id) {
        return found[id] ? '<div class="wf-end on"><b>' + esc(ep.endings[id].title) + '</b><span>' + esc(ep.endings[id].caption || '') + '</span></div>' : '<div class="wf-end"><b>? ? ?</b><span>This road is still dark.</span></div>';
      }).join('') + '</div>';
    var acts = el('div', 'results-actions');
    if (meta.wfRun && meta.wfRun.ep === ep.id) acts.appendChild(btn('Continue where you left off', 'primary', function () { begin(meta.wfRun); }));
    function begin(resume) {
      if (ep.manga) mangaGate(function () { startEpisode(ep, resume); }, function () { showEpisode(ep); });
      else startEpisode(ep, resume);
    }
    acts.appendChild(btn(meta.wfRun && meta.wfRun.ep === ep.id ? 'Start over' : 'Begin', meta.wfRun && meta.wfRun.ep === ep.id ? '' : 'primary', function () { begin(null); }));
    acts.appendChild(btn('Back', 'ghost', showWhatIf));
    p.appendChild(acts);
    mount(p);
  }

  function startEpisode(ep, resume) {
    state = resume ? JSON.parse(JSON.stringify(resume)) : { mode: 'whatif', ep: ep.id, flags: {}, rel: {}, log: [], bond: 0, fame: 0, scandal: 0, harmony: 0, step: 0, scene: null, music: null };
    NG.state = state;
    stopSkip();
    if (!vn) buildVN();
    vn.classList.add('whatif');
    vn.querySelector('.vn-text').textContent = '';
    vn.querySelector('.vn-name').textContent = '';
    vn.querySelector('.vn-choices').innerHTML = '';
    clearPortraits();
    var first = state.scene || ep.scene;
    if (first) setScene(first);
    if (state.music) playMusic(state.music);
    frames = [{ steps: ep.steps, i: state.step || 0, top: true }];
    showVN();
    var open = !resume && WF_MEMORY[ep.id] && WF_MEMORY[ep.id].open;
    if (open) runMemory(open, step); else step();
  }

  function finishWhatIf(id) {
    var ep = episode(state.ep);
    var end = ep.endings[id] || { title: 'The End', caption: '' };
    meta.whatif[ep.id] = meta.whatif[ep.id] || {};
    var isNew = !meta.whatif[ep.id][id];
    meta.whatif[ep.id][id] = true;
    meta.wfRun = null;
    save();
    var log = (state.log || []);
    var total = Object.keys(ep.endings).length;
    var seen = Object.keys(meta.whatif[ep.id]).length;
    audio('menu', 'sad');
    var n = el('div', 'end-card wf-recap');
    n.innerHTML = '<div class="chapter-no">' + (isNew ? 'New ending' : 'Ending') + ' &middot; ' + seen + ' of ' + total + '</div><h2>' + esc(end.title) + '</h2><p>' + esc(end.caption || '') + '</p>' +
      (log.length ? '<div class="wf-log"><h3>The choices that got you here</h3><ol>' + log.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ol></div>' : '');
    var acts = el('div', 'results-actions');
    acts.appendChild(btn('Take another road', 'primary', function () { startEpisode(ep, null); }));
    acts.appendChild(btn('All episodes', 'ghost', showWhatIf));
    n.appendChild(acts);
    mount(n);
  }

  /* ---------- Quiz ---------- */

  function runQuiz() {
    var quiz = NG.Story.quiz;
    var tally = { black: 0, pink: 0 };
    var q = 0;
    var host = el('div', 'quiz');
    var cast = el('div', 'quiz-cast', '<div class="quiz-face" data-p="pink">' + portrait('hachi', 'neutral') + '</div><div class="quiz-vs">VS</div><div class="quiz-face" data-p="black">' + portrait('nana', 'neutral') + '</div>');
    var node = el('div', 'quiz-body');
    host.appendChild(cast);
    host.appendChild(node);
    mount(host);
    function react(persona) {
      var other = persona === 'black' ? 'pink' : 'black';
      var who = { black: 'nana', pink: 'hachi' };
      var me = cast.querySelector('[data-p="' + persona + '"]');
      var them = cast.querySelector('[data-p="' + other + '"]');
      me.innerHTML = portrait(who[persona], persona === 'black' ? 'smirk' : 'happy');
      them.innerHTML = portrait(who[other], other === 'black' ? 'angry' : 'shock');
      me.classList.add('won');
      them.classList.remove('won');
    }
    function render() {
      node.innerHTML = '';
      if (q >= quiz.questions.length) return result();
      var item = quiz.questions[q];
      if (q === 0 && quiz.intro) node.appendChild(el('p', 'quiz-intro', esc(quiz.intro)));
      node.appendChild(el('div', 'quiz-count', 'Question ' + (q + 1) + ' of ' + quiz.questions.length));
      node.appendChild(el('h2', 'quiz-q', esc(item.q)));
      var answers = el('div', 'quiz-answers');
      item.answers.forEach(function (a) {
        var c = el('button', 'choice');
        c.type = 'button';
        c.textContent = a.label;
        c.addEventListener('click', function () {
          sfx('select');
          tally[a.persona]++;
          react(a.persona);
          q++;
          render();
        });
        answers.appendChild(c);
      });
      node.appendChild(answers);
    }
    function result() {
      var persona = tally.black > tally.pink ? 'black' : 'pink';
      state.persona = persona;
      meta.persona = persona;
      var r = quiz.results[persona];
      sfx('win');
      cast.remove();
      var wrap = el('div', 'quiz-result');
      var card = el('div', 'glass-card');
      card.innerHTML = '<div class="quiz-winner">' + portrait(persona === 'black' ? 'nana' : 'hachi', persona === 'black' ? 'smirk' : 'happy') + '</div><div class="glass-icon">' + icon('glass') + '</div>' +
        '<h2>' + esc(r.title) + '</h2><p>' + esc(r.text) + '</p>' +
        '<p class="persona-perk">' + (persona === 'black' ? 'Perk: your BLAST meter fills 25% faster.' : 'Perk: 3 Puppy Eyes shields each forgive one miss.') + '</p>';
      wrap.appendChild(card);
      var acts = el('div', 'results-actions');
      acts.appendChild(btn('That is so me', 'primary', function () { showVN(); step(); }));
      acts.appendChild(btn('I am actually the other Nana', 'ghost', function () {
        state.persona = persona === 'black' ? 'pink' : 'black';
        meta.persona = state.persona;
        toast('Noted. Fate has been amended.', 'good');
        showVN();
        step();
      }));
      wrap.appendChild(acts);
      node.appendChild(wrap);
    }
    render();
  }

  /* ---------- Demon deal ---------- */

  function pickCurses(n) {
    var pool = (NG.Curses || []).slice();
    var out = [];
    while (pool.length && out.length < n) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return out;
  }

  function curseCards(curses, selected, onChange) {
    var wrap = el('div', 'deal-cards');
    curses.forEach(function (c) {
      var card = el('button', 'curse-card');
      card.type = 'button';
      card.innerHTML = '<div class="curse-name">' + esc(c.name) + '</div><div class="curse-desc">' + esc(c.desc) + '</div><div class="curse-mult">x' + c.mult + '</div>';
      if (selected.indexOf(c.id) !== -1) card.classList.add('selected');
      card.addEventListener('click', function () {
        sfx('select');
        var at = selected.indexOf(c.id);
        if (at === -1) selected.push(c.id); else selected.splice(at, 1);
        card.classList.toggle('selected');
        if (onChange) onChange();
      });
      wrap.appendChild(card);
    });
    return wrap;
  }

  function runDeal() {
    audio('menu', 'tension');
    var node = el('div', 'deal');
    var offers = pickCurses(3);
    var selected = [];
    node.innerHTML = '<h2 class="deal-title">A word from the Demon Lord</h2>' +
      '<div class="deal-duo"><div class="deal-portrait">' + portrait('demon', 'smirk') + '</div><div class="deal-hachi">' + portrait('hachi', 'shock') + '<span class="bubble">Nana, DON\'T sign it!!</span></div></div>' +
      '<p class="deal-line">' + esc(DEAL_LINES[Math.floor(Math.random() * DEAL_LINES.length)]) + '</p>';
    node.appendChild(curseCards(offers, selected));
    var acts = el('div', 'deal-actions');
    acts.appendChild(btn('Take the deal', 'primary', function () {
      pendingCurses = selected.slice();
      if (selected.length) { sfx('thud'); toast('The Demon Lord is delighted.', 'bad'); }
      finish();
    }));
    acts.appendChild(btn('Absolutely not', 'ghost', function () { pendingCurses = []; finish(); }));
    node.appendChild(acts);
    mount(node);
    function finish() {
      if (state.music) playMusic(state.music);
      showVN();
      step();
    }
  }

  /* ---------- Gigs ---------- */

  function songInfo(id) {
    var list = (NG.Songs && NG.Songs.list) || [];
    return list.find(function (s) { return s.id === id; }) || { id: id, title: id };
  }

  function diffPicker(onPick) {
    var row = el('div', 'prep-diffs');
    DIFFS.forEach(function (d) {
      var b = el('button', 'prep-diff' + (meta.diff === d.id ? ' on' : ''));
      b.type = 'button';
      b.innerHTML = '<b>' + d.name + '</b><span>' + d.desc + '</span>';
      b.addEventListener('click', function () {
        sfx('select');
        meta.diff = d.id;
        save();
        row.querySelectorAll('.prep-diff').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        if (onPick) onPick(d.id);
      });
      row.appendChild(b);
    });
    return row;
  }

  function duo(hachiExpr, hachiLine, nanaExpr, nanaLine) {
    return '<div class="duo">' +
      '<div class="duo-char">' + portrait('hachi', hachiExpr) + '<span class="bubble">' + esc(hachiLine) + '</span></div>' +
      '<div class="duo-char">' + portrait('nana', nanaExpr) + '<span class="bubble">' + esc(nanaLine) + '</span></div></div>';
  }
  function prepDuo() {
    var l = PREP_LINES[Math.floor(Math.random() * PREP_LINES.length)];
    return duo('happy', l[0], 'smirk', l[1]);
  }

  function runGig(cfg, onResult) {
    audio('stopMusic');
    var stage = el('div', 'stage');
    mount(stage);
    var ctl = null;
    var finished = false;
    cleanup = function () { if (ctl && !finished) ctl.destroy(); };
    ctl = NG.Rhythm.start(stage, {
      songId: cfg.song,
      difficulty: meta.diff,
      persona: cfg.persona,
      curses: cfg.curses || [],
      mode: cfg.mode || 'normal',
      settings: NG.settings,
      onFinish: function (result) {
        if (finished) return;
        finished = true;
        setTimeout(function () {
          if (ctl) ctl.destroy();
          onResult(recordBest(result));
        }, 0);
      }
    });
  }

  function recordBest(r) {
    if (r.quit) return r;
    var byDiff = meta.best[r.songId] = meta.best[r.songId] || {};
    var prev = byDiff[r.difficulty];
    r.newBest = !prev || r.score > prev.score;
    if (r.newBest) byDiff[r.difficulty] = { score: r.score, rank: r.rank };
    save();
    return r;
  }

  function reactionDuo(r) {
    var x = r.cleared === false ? REACTIONS.D : (REACTIONS[r.rank] || REACTIONS.B);
    return duo(x[0][0], x[0][1], x[1][0], x[1][1]);
  }

  function resultsCard(r, title, extra) {
    var n = el('div', 'results');
    var rows = [
      ['Score', Number(r.score || 0).toLocaleString() + (r.newBest ? ' — new best' : '')],
      ['Accuracy', Math.round((r.accuracy || 0) * 100) + '%'],
      ['Best combo', r.maxCombo],
      ['Perfect / Good / Miss', r.perfect + ' / ' + r.good + ' / ' + r.miss]
    ];
    n.innerHTML = '<div class="results-rank rank-' + esc(r.rank) + '">' + esc(r.rank) + '</div><h2 class="results-title">' + esc(title) + '</h2>' +
      (extra ? '<p class="results-extra">' + esc(extra) + '</p>' : '') +
      reactionDuo(r) +
      '<div class="results-stats">' + rows.map(function (x) { return '<div><span>' + x[0] + '</span><b>' + esc(x[1]) + '</b></div>'; }).join('') + '</div>';
    return n;
  }

  function runStoryGig(s) {
    meta.unlocked[s.song] = true;
    save();
    var curses = pendingCurses;
    pendingCurses = [];
    var info = songInfo(s.song);
    function prep() {
      var p = el('div', 'prep');
      p.innerHTML = '<div class="chapter-no">' + esc(s.venue || 'Tonight') + '</div><h2>' + esc(info.title) + '</h2>' +
        (info.subtitle ? '<p>' + esc(info.subtitle) + '</p>' : '') +
        (curses.length ? '<p class="prep-curses">Cursed: ' + curses.map(curseName).join(', ') + '</p>' : '') + prepDuo();
      p.appendChild(diffPicker());
      p.appendChild(btn('Go on stage', 'primary', play));
      mount(p);
    }
    function play() {
      runGig({ song: s.song, persona: state.persona, curses: curses, mode: s.mode }, after);
    }
    function after(r) {
      if (r.quit) { prep(); return; }
      var title = gigTitle(r, s.mode);
      var extra = gigExtra(r, s.mode);
      audio('menu', (s.mode === 'boss' ? r.bossDefeated : r.cleared) ? 'room' : 'sad');
      sfx(r.cleared ? 'win' : 'lose');
      var n = resultsCard(r, title, extra);
      var acts = el('div', 'results-actions');
      var won = s.mode === 'boss' ? r.bossDefeated : r.cleared;
      if (won) {
        acts.appendChild(btn('Next', 'primary', function () { finish(r, true); }));
        acts.appendChild(btn('Play it again', 'ghost', play));
      } else {
        acts.appendChild(btn('Try again', 'primary', play));
        acts.appendChild(btn(s.mode === 'boss' ? 'Accept your fate' : 'Walk off stage', 'ghost', function () { finish(r, false); }));
      }
      n.appendChild(acts);
      mount(n);
      gigVoice(r, won);
    }
    function finish(r, won) {
      if (s.mode === 'duel') state.flags.duelWon = !!r.duelWon;
      if (s.mode === 'boss') state.flags.bossDefeated = !!r.bossDefeated;
      showVN();
      if (won) applyEffects({ fame: RANK_FAME[r.rank] || 0, harmony: r.rank === 'S' ? 1 : 0 });
      else applyEffects({ scandal: 1, harmony: -1 });
      if (state.music) playMusic(state.music);
      step();
    }
    prep();
  }

  function gigVoice(r, won) {
    if (!won) { audio('voice', Math.random() < 0.5 ? 'not-your-fault' : 'no-luck'); return; }
    if (r.rank === 'S') audio('voice', 'damn');
    else if (r.rank === 'A') audio('voice', Math.random() < 0.5 ? 'million' : 'so-happy');
    else if (r.rank === 'B') audio('voice', 'so-happy');
  }

  function curseName(id) {
    var c = (NG.Curses || []).find(function (x) { return x.id === id; });
    return esc(c ? c.name : id);
  }

  function gigTitle(r, mode) {
    if (mode === 'boss') return r.bossDefeated ? 'Fate, defeated' : 'The Demon Lord takes a bow';
    if (mode === 'duel') return r.duelWon ? 'Trapnest has left the building' : 'Trapnest wins this round';
    if (!r.cleared) return 'Booed off the stage';
    return r.rank === 'S' ? 'The roof came off' : 'BLAST survives another night';
  }
  function gigExtra(r, mode) {
    if (mode === 'duel' && !r.duelWon && r.cleared) return 'You can keep going, but Reira will remember this.';
    if (mode === 'boss' && !r.bossDefeated) return 'He is laughing. Do not let him keep laughing.';
    return '';
  }

  /* ---------- Minigames ---------- */

  function playMinigame(id, persona, onDone) {
    var game = NG.Minigames && NG.Minigames[id];
    if (!game) { onDone({ quit: true }); return; }
    audio('menu', GAME_MOOD[id] || 'room');
    var stage = el('div', 'stage');
    mount(stage);
    var ctl = null;
    var finished = false;
    cleanup = function () { if (ctl && !finished) ctl.destroy(); };
    ctl = game.start(stage, {
      persona: persona,
      settings: NG.settings,
      onFinish: function (r) {
        if (finished) return;
        finished = true;
        setTimeout(function () {
          if (ctl) ctl.destroy();
          if (!r.quit) {
            var prev = meta.games[id];
            if (!prev || r.score > prev.score) meta.games[id] = { score: r.score, stars: r.stars };
            save();
          }
          onDone(r);
        }, 0);
      }
    });
  }

  function runStoryMinigame(id) {
    playMinigame(id, state.persona, function (r) {
      showVN();
      if (!r.quit) {
        applyEffects(r.effects);
        if (r.headline) state.flags.headline = r.headline;
      }
      if (state.music) playMusic(state.music);
      step();
    });
  }

  /* ---------- Free play menus ---------- */

  function listScreen(title, subtitle, back) {
    var n = el('div', 'list-screen');
    var head = el('div', 'list-header');
    head.appendChild(btn('Back', 'ghost', back || showTitle));
    head.appendChild(el('h2', '', esc(title)));
    if (subtitle) head.appendChild(el('p', '', esc(subtitle)));
    n.appendChild(head);
    return n;
  }

  function showLiveHouse() {
    audio('menu', 'room');
    var n = listScreen('Live House', 'Songs you have reached in the story are yours to replay.');
    var list = el('div', 'song-list');
    ((NG.Songs && NG.Songs.list) || []).forEach(function (s) {
      var open = !!meta.unlocked[s.id];
      var card = el('button', 'song-card' + (open ? '' : ' locked'));
      card.type = 'button';
      var best = meta.best[s.id] && meta.best[s.id][meta.diff];
      var face = SONG_FACE[s.id];
      card.innerHTML = (open && face ? '<div class="song-face">' + portrait(face[0], face[1]) + '</div>' : '') + '<div class="song-title">' + (open ? esc(s.title) : '? ? ?') + '</div>' +
        '<div class="song-sub">' + (open ? esc(s.subtitle || '') + ' &middot; ' + s.bpm + ' BPM' : 'Reach this song in the story') + '</div>' +
        '<div class="song-best">' + (best ? best.rank + ' &middot; ' + Number(best.score).toLocaleString() : (open ? 'Not played on this difficulty' : '')) + '</div>';
      if (open) card.addEventListener('click', function () { sfx('select'); showFreePrep(s); });
      list.appendChild(card);
    });
    n.appendChild(list);
    mount(n);
  }

  function showFreePrep(song, keep) {
    var curses = keep || [];
    var p = el('div', 'prep');
    p.innerHTML = '<div class="chapter-no">Live House</div><h2>' + esc(song.title) + '</h2>' + prepDuo();
    p.appendChild(diffPicker());

    var personaRow = el('div', 'prep-persona');
    [['pink', 'Hachi-type: 3 shields'], ['black', 'Nana-type: faster BLAST']].forEach(function (x) {
      var b = el('button', 'prep-diff' + (meta.persona === x[0] ? ' on' : ''));
      b.type = 'button';
      b.textContent = x[1];
      b.addEventListener('click', function () {
        sfx('select');
        meta.persona = x[0];
        save();
        personaRow.querySelectorAll('button').forEach(function (o) { o.classList.remove('on'); });
        b.classList.add('on');
      });
      personaRow.appendChild(b);
    });
    p.appendChild(personaRow);

    // Actions go above the deals so the Start button is reachable without scrolling on a phone.
    var acts = el('div', 'results-actions');
    function start() {
      var mode = song.id === 'birdcage' ? 'duel' : song.id === 'demon-encore' ? 'boss' : 'normal';
      runGig({ song: song.id, persona: meta.persona, curses: curses.slice(), mode: mode }, function (r) {
        if (r.quit) { showFreePrep(song, curses); return; }
        audio('menu', r.cleared ? 'room' : 'sad');
        sfx(r.cleared ? 'win' : 'lose');
        var n = resultsCard(r, gigTitle(r, mode), '');
        var a = el('div', 'results-actions');
        a.appendChild(btn('Again', 'primary', start));
        a.appendChild(btn('Pick another song', 'ghost', showLiveHouse));
        n.appendChild(a);
        mount(n);
        gigVoice(r, r.cleared);
      });
    }
    acts.appendChild(btn('Go on stage', 'primary', start));
    acts.appendChild(btn('Back', 'ghost', showLiveHouse));
    p.appendChild(acts);
    if (NG.Curses && NG.Curses.length) {
      p.appendChild(el('h3', 'prep-sub', 'Demon Lord deals (optional)'));
      p.appendChild(curseCards(NG.Curses, curses));
    }
    mount(p);
  }

  function showArcade() {
    audio('menu', 'room');
    var n = listScreen('Arcade', 'Every Room 707 minigame, with no plot to get in the way.');
    var list = el('div', 'song-list');
    Object.keys(NG.Minigames || {}).forEach(function (id) {
      var g = NG.Minigames[id];
      var card = el('button', 'song-card');
      card.type = 'button';
      var best = meta.games[id];
      card.innerHTML = '<div class="song-title">' + esc(g.title) + '</div><div class="song-sub">' + esc(g.howto || '') + '</div>' +
        '<div class="song-best">' + (best ? '&#9733;'.repeat(best.stars) + ' &middot; ' + Number(best.score).toLocaleString() : 'Not played yet') + '</div>';
      card.addEventListener('click', function () {
        sfx('select');
        playMinigame(id, meta.persona, showArcade);
      });
      list.appendChild(card);
    });
    n.appendChild(list);
    mount(n);
  }

  function polaroidCard(id, p, locked) {
    var card = el('div', 'polaroid' + (locked ? ' locked' : ''));
    if (locked) {
      card.innerHTML = '<div class="polaroid-art"></div><div class="polaroid-caption">Not developed yet</div>';
      return card;
    }
    var art = p.art || {};
    var chars = (art.chars || []).map(function (c) { return '<div class="polaroid-char">' + portrait(c, 'happy') + '</div>'; }).join('');
    card.innerHTML = '<div class="polaroid-art">' + sceneHtml(art.scene) + '<div class="polaroid-chars">' + chars + '</div></div>' +
      '<div class="polaroid-caption"><b>' + esc(p.title) + '</b><br>' + esc(p.caption) + '</div>';
    return card;
  }

  function showScrapbook() {
    audio('menu', 'room');
    var all = (NG.Story && NG.Story.polaroids) || {};
    var ids = Object.keys(all);
    var got = ids.filter(function (id) { return meta.polaroids[id]; }).length;
    var endings = Object.keys(meta.endings).length;
    var totalEnds = NG.Story ? NG.Story.endings.length : 0;
    var n = listScreen('Scrapbook', got + ' of ' + ids.length + ' polaroids. ' + endings + ' of ' + totalEnds + ' endings.');
    var wrap = el('div', 'scrapbook');
    var items = (NG.Story && NG.Story.keepsakes) || {};
    var shelf = el('div', 'shelf');
    Object.keys(items).forEach(function (id) {
      var open = !!meta.keepsakes[id];
      shelf.appendChild(el('div', 'shelf-item' + (open ? '' : ' locked'),
        '<div class="shelf-art">' + (open ? icon(items[id].icon) : '?') + '</div><b>' + (open ? esc(items[id].title) : 'Not found yet') + '</b>' + (open ? '<span>' + esc(items[id].caption) + '</span>' : '')));
    });
    wrap.appendChild(el('h3', 'prep-sub', 'The shelf in 707'));
    wrap.appendChild(shelf);
    wrap.appendChild(el('h3', 'prep-sub', 'Polaroids'));
    var grid = el('div', 'polaroid-grid');
    ids.forEach(function (id) { grid.appendChild(polaroidCard(id, all[id], !meta.polaroids[id])); });
    wrap.appendChild(grid);
    n.appendChild(wrap);
    mount(n);
  }

  function showCast() {
    audio('menu', 'room');
    var n = listScreen('The Cast', 'Tap anyone to catch a different mood.');
    var grid = el('div', 'cast-grid');
    var exprs = ['neutral', 'happy', 'smirk', 'shock', 'angry', 'sad'];
    CAST.forEach(function (c) {
      var at = 0;
      var card = el('button', 'cast-card');
      card.type = 'button';
      card.innerHTML = '<div class="cast-face">' + portrait(c[0], exprs[at]) + '</div><div class="cast-name">' + esc(c[1]) + '</div><div class="cast-role">' + esc(c[2]) + '</div><p>' + esc(c[3]) + '</p>';
      card.addEventListener('click', function () {
        sfx('select');
        at = (at + 1) % exprs.length;
        card.querySelector('.cast-face').innerHTML = portrait(c[0], exprs[at]);
      });
      grid.appendChild(card);
    });
    n.appendChild(grid);
    mount(n);
  }

  function showSettings() {
    var n = listScreen('Settings', '');
    var form = el('div', 'settings');
    function slider(label, key, min, max, stepBy, fmt) {
      var row = el('div', 'setting');
      var id = 'set-' + key;
      row.innerHTML = '<label for="' + id + '">' + label + ' <output>' + fmt(NG.settings[key]) + '</output></label>';
      var input = el('input');
      input.id = id;
      input.type = 'range';
      input.min = min;
      input.max = max;
      input.step = stepBy;
      input.value = NG.settings[key];
      input.addEventListener('input', function () {
        NG.settings[key] = parseFloat(input.value);
        row.querySelector('output').textContent = fmt(NG.settings[key]);
        audio('setVolumes', NG.settings.music, NG.settings.sfx, NG.settings.voice);
        save();
      });
      row.appendChild(input);
      form.appendChild(row);
    }
    var pct = function (v) { return Math.round(v * 100) + '%'; };
    slider('Music', 'music', 0, 1, 0.05, pct);
    slider('Sound effects', 'sfx', 0, 1, 0.05, pct);
    if (NG.Audio && NG.Audio.hasVoice && NG.Audio.hasVoice()) slider('Voices', 'voice', 0, 1, 0.05, pct);
    slider('Note speed', 'speed', 0.6, 1.8, 0.1, function (v) { return v.toFixed(1) + 'x'; });
    slider('Timing offset (raise if your hits feel late)', 'offsetMs', -200, 200, 5, function (v) { return v + ' ms'; });

    var flash = el('div', 'setting');
    flash.innerHTML = '<label for="set-flash">Reduce flashing</label>';
    var box = el('input');
    box.id = 'set-flash';
    box.type = 'checkbox';
    box.checked = NG.settings.reduceFlash;
    box.addEventListener('change', function () { NG.settings.reduceFlash = box.checked; save(); });
    flash.appendChild(box);
    form.appendChild(flash);

    if (NG.Audio && NG.Audio.setCustomTrack && window.indexedDB) form.appendChild(soundtrackPanel());
    form.appendChild(saveCodePanel());

    var acts = el('div', 'results-actions');
    acts.appendChild(btn('Erase all progress', 'ghost', function () {
      if (!window.confirm('Erase your story, scores and polaroids? This cannot be undone.')) return;
      var s = NG.settings;
      meta = defaultMeta();
      meta.settings = s;
      save();
      toast('Room 707 has been swept clean.', 'good');
    }));
    form.appendChild(acts);
    form.appendChild(el('p', 'disclaimer', 'Fan-made and non-commercial. NANA belongs to Ai Yazawa and their rights holders. Art, music and text in this game are original tributes.'));
    n.appendChild(form);
    mount(n);
  }

  /* ---------- Save codes: move progress between devices with no server ---------- */

  var CODE_PREFIX = 'NANA707.';

  function toB64(bytes) {
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function fromB64(text) {
    var t = text.replace(/-/g, '+').replace(/_/g, '/');
    while (t.length % 4) t += '=';
    var bin = atob(t);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  function pipe(bytes, stream) {
    return new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer().then(function (b) { return new Uint8Array(b); });
  }

  function makeSaveCode() {
    var data = {};
    ['run', 'unlocked', 'best', 'games', 'polaroids', 'keepsakes', 'endings', 'whatif', 'wfRun', 'wfSeen', 'mangaOK', 'diff', 'persona'].forEach(function (k) { data[k] = meta[k]; });
    var bytes = new TextEncoder().encode(JSON.stringify(data));
    if (!window.CompressionStream) return Promise.resolve(CODE_PREFIX + 'p' + toB64(bytes));
    return pipe(bytes, new CompressionStream('deflate-raw')).then(function (z) { return CODE_PREFIX + 'z' + toB64(z); });
  }

  function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  function isStep(v, max) { return Number.isInteger(v) && v >= 0 && v <= max; }

  function validRun(r) {
    if (!isObj(r) || !isObj(r.flags) || !NG.Story) return false;
    if (!Number.isInteger(r.chapter) || r.chapter < 0 || r.chapter >= NG.Story.chapters.length) return false;
    if (!isStep(r.step, NG.Story.chapters[r.chapter].steps.length)) return false;
    return ['bond', 'fame', 'scandal', 'harmony'].every(function (k) { return typeof r[k] === 'number'; });
  }
  function validEpisodeRun(r) {
    if (!isObj(r) || !isObj(r.flags) || !NG.WhatIf) return false;
    var ep = episode(r.ep);
    return !!ep && isStep(r.step, ep.steps.length);
  }

  // Codes are pasted text from anywhere, so only known fields of the right shape are accepted.
  function cleanSave(d) {
    if (!isObj(d)) return null;
    var keys = ['unlocked', 'best', 'games', 'polaroids', 'keepsakes', 'endings', 'whatif'];
    if (!keys.every(function (k) { return isObj(d[k]); })) return null;
    var out = {};
    keys.forEach(function (k) { out[k] = d[k]; });
    out.unlocked['last-train'] = true;
    out.wfSeen = !!d.wfSeen;
    out.mangaOK = !!d.mangaOK;
    out.diff = DIFFS.some(function (x) { return x.id === d.diff; }) ? d.diff : 'hachi';
    out.persona = d.persona === 'black' ? 'black' : 'pink';
    out.run = validRun(d.run) ? d.run : null;
    out.wfRun = validEpisodeRun(d.wfRun) ? d.wfRun : null;
    return out;
  }

  function readSaveCode(text) {
    var code = String(text || '').replace(/\s+/g, '');
    if (code.indexOf(CODE_PREFIX) !== 0) return Promise.reject(new Error('prefix'));
    var mode = code.charAt(CODE_PREFIX.length);
    var bytes = fromB64(code.slice(CODE_PREFIX.length + 1));
    var raw;
    if (mode === 'p') raw = Promise.resolve(bytes);
    else if (mode === 'z' && window.DecompressionStream) raw = pipe(bytes, new DecompressionStream('deflate-raw'));
    else return Promise.reject(new Error('format'));
    return raw.then(function (b) {
      var clean = cleanSave(JSON.parse(new TextDecoder().decode(b)));
      if (!clean) throw new Error('shape');
      return clean;
    });
  }

  function copyText(box) {
    box.focus();
    box.select();
    box.setSelectionRange(0, box.value.length);
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(box.value).then(function () { return true; }, function () { return document.execCommand('copy'); });
    }
    return Promise.resolve(document.execCommand('copy'));
  }

  function soundtrackPanel() {
    var wrap = el('div', 'soundtrack');
    wrap.innerHTML = '<h3 class="prep-sub">Your soundtrack</h3><p class="disclaimer">Choose your own audio files to play in the game. They stay in this browser on this device and are never uploaded. Please only use music you have the right to use.</p>';
    [['title', 'Title screen'], ['happy', 'Happy moments'], ['intense', 'Intense moments'], ['sad', 'Sad moments']].forEach(function (slot) {
      var row = el('div', 'track-row');
      var input = el('input');
      input.type = 'file';
      input.accept = 'audio/*,.mp3,.m4a,.aac,.wav,.ogg';
      input.hidden = true;
      function draw() {
        var name = NG.Audio.customTracks()[slot[0]];
        row.innerHTML = '';
        var info = el('div', 'track-info', '<b>' + slot[1] + '</b><span></span>');
        info.querySelector('span').textContent = name || 'Original track';
        row.appendChild(info);
        row.appendChild(input);
        row.appendChild(btn(name ? 'Change' : 'Choose file', '', function () { input.click(); }));
        if (name) row.appendChild(btn('Reset', 'ghost', function () {
          NG.Audio.clearCustomTrack(slot[0]).then(function () { toast('Back to the original track.', 'good'); draw(); }, trackFailed);
        }));
      }
      input.addEventListener('change', function () {
        var file = input.files[0];
        input.value = '';
        if (!file) return;
        NG.Audio.setCustomTrack(slot[0], file).then(function () {
          toast('Your track is in.', 'good');
          audio('menu', slot[0]);
          draw();
        }, trackFailed);
      });
      draw();
      wrap.appendChild(row);
    });
    return wrap;
  }
  function trackFailed(e) {
    toast(e && e.message === 'large' ? 'That file is too big. The limit is 40 MB.' : 'That file would not play. Try an MP3.', 'bad');
  }

  function saveCodePanel() {
    var wrap = el('div', 'save-code');
    wrap.innerHTML = '<h3 class="prep-sub">Move your save</h3><p class="disclaimer">Saves live in this browser. Copy this code to back up your progress or continue on another device.</p>';
    var out = el('textarea');
    out.readOnly = true;
    out.rows = 3;
    out.setAttribute('aria-label', 'Your save code');
    out.value = 'Making your code...';
    wrap.appendChild(out);
    var copy = btn('Copy my code', 'primary', function () {
      copyText(out).then(function (ok) { toast(ok ? 'Code copied. Keep it somewhere safe.' : 'Select the code and copy it by hand.', ok ? 'good' : 'bad'); });
    });
    wrap.appendChild(copy);
    makeSaveCode().then(function (code) { out.value = code; }, function () { out.value = 'This browser could not make a code.'; });

    var input = el('textarea');
    input.rows = 3;
    input.placeholder = 'Paste a save code here';
    input.setAttribute('aria-label', 'Paste a save code');
    wrap.appendChild(input);
    wrap.appendChild(btn('Load this code', '', function () {
      readSaveCode(input.value).then(function (data) {
        if (!window.confirm('Replace the progress in this browser with this save? This cannot be undone.')) return;
        Object.keys(data).forEach(function (k) { meta[k] = data[k]; });
        save();
        toast('Welcome back to 707.', 'good');
        showTitle();
      }, function () { toast('That code did not work. Check you copied all of it.', 'bad'); });
    }));
    return wrap;
  }

  /* ---------- Keyboard for the story ---------- */

  document.addEventListener('keydown', function (e) {
    if (!vn || !vn.isConnected || e.repeat) return;
    if (vn.querySelector('.memory')) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); vn.querySelector('.memory').click(); }
      return;
    }
    if (vn.querySelector('.letter-wrap, .polaroid-pop, .keepsake-pop')) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var b = vn.querySelector('.letter-wrap .btn, .polaroid-pop .btn, .keepsake-pop .btn');
        if (b) b.click();
      }
      return;
    }
    var choices = vn.querySelectorAll('.vn-choices .choice');
    if (choices.length) {
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= choices.length) choices[n - 1].click();
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      vnAdvance();
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    app = document.getElementById('app');
    toasts = document.getElementById('toasts');
    load();
    // iOS suspends audio after interruptions; any tap brings it back.
    document.addEventListener('pointerdown', function () { audio('unlock'); }, { passive: true });
    showGate();
  });
})();
