/* HEY, NANA - Room 707: original songs as data. The music and the chart are the same events. */
window.NG = window.NG || {};
(function () {
  'use strict';

  var NOTE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  var VOWEL_CYCLES = ['aoeai', 'oaoei', 'eaoua', 'aaoei'];

  function noteToMidi(s) {
    var m = /^([a-g])([#b]?)(\d)$/.exec(s);
    if (!m) throw new Error('bad note ' + s);
    return 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }

  function parseChord(s) {
    var m = /^([A-G])([#b]?)(m?)$/.exec(s);
    if (!m) throw new Error('bad chord ' + s);
    var pc = (NOTE[m[1].toLowerCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12;
    return { pc: pc, minor: !!m[3] };
  }

  /* drums: lines for k s h o t c */
  var DR = {
    none: {},
    tick: { h: 'x...x...x...x...' },
    build: { k: 'x.......x.......', h: 'x.x.x.x.x.x.x.x.' },
    rock: { k: 'x.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
    rockOpen: { k: 'x.....x.x.x.....', s: '....x.......x...', o: 'x...x...x...x...', h: '..x...x...x...x.' },
    punk: { k: 'x.x...x.x.x...x.', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
    skate: { k: 'x...x...x...x...', s: '..x...x...x...x.', o: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
    blast: { k: 'x.x.x.x.x.x.x.x.', s: '.x.x.x.x.x.x.x.x', h: 'x...x...x...x...' },
    half: { k: 'x.....x...x.....', s: '........x.......', o: 'x.......x.......', h: '..x...x...x...x.' },
    halfDouble: { k: 'x.x...xxx.x...x.', s: '........x.......', o: 'x.......x.......', h: '..x...x...x...x.' },
    cage: { k: 'x..x..x.x..x..x.', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
    gallop: { k: 'x.xxx.xxx.xxx.xx', s: '....x.......x...', h: 'x...x...x...x...' },
    sevens: { k: 'x.....x.....x.', s: '...x.....x....', h: 'x.x.x.x.x.x.x.' },
    waltz: { k: 'x...........', s: '....x...x...', h: 'x.x.x.x.x.x.' },
    fill: { k: 'x.......x.......', s: '....x.x.x.xxxxxx', t: '............xxxx', h: 'x.x.x.x.........' }
  };

  var SONGS = [
    {
      id: 'last-train', title: 'Last Train, First Snow', subtitle: 'Two strangers. One carriage. Too many suitcases.',
      bpm: 124, key: 'G', mood: 'wistful',
      mel: {
        v1: 'r:2 d4:2 g4:4 g4:2 a4:2 b4:4 | a4:4 g4:2 e4:2 d4:8 | r:2 b3:2 e4:4 e4:2 f#4:2 g4:4 | e4:6 d4:2 c4:8',
        v2: 'r:2 d4:2 g4:4 g4:2 a4:2 b4:4 | d5:4 b4:2 a4:2 g4:8 | r:2 b4:2 a4:4 g4:2 e4:2 g4:4 | a4:12 r:4',
        c1: 'e5:6 d5:2 c5:4 g4:4 | d5:6 b4:2 g4:8 | a4:2 a4:2 b4:2 c5:2 d5:4 a4:4 | b4:12 r:4',
        c2: 'e5:6 d5:2 c5:4 g4:4 | d5:6 b4:2 g4:8 | a4:2 b4:2 c5:4 b4:2 a4:2 f#4:4 | g4:16',
        br: 'c5:8 b4:4 a4:4 | g4:8 e4:4 g4:4 | a4:6 b4:2 c5:4 d5:4 | d5:14 r:2',
        out: 'd5:8 b4:8 | a4:12 r:4 | g4:6 e4:2 c4:8 | d4:4 g4:12'
      },
      sections: [
        { n: 'intro', bars: 4, ch: ['G', 'D', 'Em', 'C'], dr: 'tick', ba: 'R.......R.......', gt: '1.2.3.2.1.2.3.2.' },
        { n: 'verse', bars: 8, ch: ['G', 'D', 'Em', 'C'], dr: 'build', ba: 'R...R...R...R.5.', gt: '1.2.3.2.1.2.3.2.', me: ['v1', 'v2'] },
        { n: 'chorus', bars: 8, ch: ['C', 'G', 'D', 'Em'], dr: 'rock', ba: 'R.R.R.R.R.R.R.5.', gt: 'L~~~~~~~x.x.x.x.', me: ['c1', 'c2'], crash: 1 },
        { n: 'verse', bars: 8, ch: ['G', 'D', 'Em', 'C'], dr: 'rock', ba: 'R...R...R...R.5.', gt: 'p.p.p.p.1.2.3.2.', me: ['v1', 'v2'], crash: 1 },
        { n: 'chorus', bars: 8, ch: ['C', 'G', 'D', 'Em'], dr: 'rockOpen', ba: 'R.R.R.R.R.R.R.5.', gt: 'L~~~~~~~x.x.x.x.', me: ['c1', 'c2'], crash: 1 },
        { n: 'bridge', bars: 4, ch: ['Am', 'C', 'D', 'D'], dr: 'half', ba: 'R~~~~~~~R~~~~~~~', gt: 'L~~~~~~~~~~~~~~~', me: ['br'], crash: 1 },
        { n: 'chorus', bars: 8, ch: ['C', 'G', 'D', 'Em'], dr: 'rockOpen', ba: 'R.R.R.R.R.R.R.5.', gt: 'L~~~~~~~x.x.x.x.', me: ['c1', 'c2'], crash: 1 },
        { n: 'outro', bars: 4, ch: ['G', 'D', 'C', 'G'], dr: 'tick', ba: 'R~~~~~~~~~~~~~~~', gt: 'L~~~~~~~~~~~~~~~', me: ['out'], crash: 1 }
      ]
    },
    {
      id: 'strawberry-glass', title: 'Strawberry Glass', subtitle: 'Sticky, sugary, slightly chipped.',
      bpm: 168, key: 'D', mood: 'bright',
      mel: {
        ho: 'a4:4 f#4:2 a4:2 b4:4 a4:4 | e5:4 c#5:2 a4:2 e4:8 | b4:4 d5:2 b4:2 f#5:4 d5:4 | d5:4 b4:4 g4:8',
        v1: 'f#4:2 f#4:2 e4:2 d4:2 f#4:4 a4:4 | e4:2 e4:2 c#4:2 a3:2 e4:8 | f#4:2 f#4:2 d4:2 f#4:2 b4:4 a4:2 f#4:2 | g4:6 f#4:2 e4:4 d4:4',
        v2: 'f#4:2 f#4:2 e4:2 d4:2 f#4:4 a4:4 | e4:2 e4:2 c#4:2 a3:2 e4:8 | d5:2 d5:2 b4:2 a4:2 f#4:4 b4:4 | a4:4 g4:4 e4:8',
        pre: 'e4:2 g4:2 b4:4 a4:4 e4:4 | e4:2 g4:2 a4:4 c#5:8 | e4:2 g4:2 b4:4 a4:4 g4:4 | a4:4 c#5:4 e5:8',
        c1: 'f#5:6 d5:2 a4:4 d5:4 | e5:6 c#5:2 a4:8 | f#5:2 f#5:2 f#5:2 e5:2 d5:4 b4:4 | g4:2 b4:2 d5:4 e5:8',
        c2: 'f#5:6 d5:2 a4:4 d5:4 | e5:6 c#5:2 a4:8 | f#5:2 f#5:2 f#5:2 e5:2 d5:4 b4:4 | g4:2 a4:2 b4:4 d5:8',
        br: 'r:4 b4:4 d5:4 b4:4 | g4:8 r:4 b4:4 | a4:4 f#4:4 d4:4 f#4:4 | e4:8 a4:8',
        br2: 'r:4 d5:4 f#5:4 d5:4 | b4:8 r:4 d5:4 | d5:4 a4:4 f#4:4 a4:4 | c#5:8 e5:8',
        out: 'f#5:4 e5:4 d5:4 a4:4 | g4:4 a4:4 b4:4 c#5:4 | d5:16 | r:16'
      },
      sections: [
        { n: 'intro', bars: 4, ch: ['D', 'A', 'Bm', 'G'], dr: 'build', ba: 'R.R.R.R.R.R.R.R.', gt: 'x.xxx.x.x.xxx.x.', me: ['ho'], crash: 1 },
        { n: 'verse', bars: 8, ch: ['D', 'A', 'Bm', 'G'], dr: 'skate', ba: 'R.R.R.R.R.R.5.R.', gt: 'p.p.pp.pp.p.pp.p', me: ['v1', 'v2'], crash: 1 },
        { n: 'pre', bars: 4, ch: ['Em', 'A', 'Em', 'A'], dr: 'rock', ba: 'R~R~R~R~R~R~5~5~', gt: 'x~~.x~~.x~~.x~~.', me: ['pre'] },
        { n: 'chorus', bars: 8, ch: ['D', 'A', 'Bm', 'G'], dr: 'punk', ba: 'R.R.R.R.O.O.5.5.', gt: 'L~~~x.x.x~~~x.x.', me: ['c1', 'c2'], crash: 1 },
        { n: 'verse', bars: 8, ch: ['D', 'A', 'Bm', 'G'], dr: 'skate', ba: 'R.R.R.R.R.R.5.R.', gt: 'p.p.pp.pp.p.pp.p', me: ['v1', 'v2'], crash: 1 },
        { n: 'pre', bars: 4, ch: ['Em', 'A', 'Em', 'A'], dr: 'rock', ba: 'R~R~R~R~R~R~5~5~', gt: 'x~~.x~~.x~~.x~~.', me: ['pre'] },
        { n: 'chorus', bars: 8, ch: ['D', 'A', 'Bm', 'G'], dr: 'punk', ba: 'R.R.R.R.O.O.5.5.', gt: 'L~~~x.x.x~~~x.x.', me: ['c1', 'c2'], crash: 1 },
        { n: 'bridge', bars: 8, ch: ['Bm', 'G', 'D', 'A'], dr: 'half', ba: 'R~~~R~~~R~~~5~~~', gt: 'L~~~~~~~~~~~~~~~', me: ['br', 'br2'], crash: 1 },
        { n: 'chorus', bars: 8, ch: ['D', 'A', 'Bm', 'G'], dr: 'punk', ba: 'R.R.R.R.O.O.5.5.', gt: 'L~~~x.x.x~~~x.x.', me: ['c1', 'c2'], crash: 1 },
        { n: 'outro', bars: 4, ch: ['G', 'A', 'D', 'D'], dr: 'rockOpen', ba: 'R.R.R.R.R.R.R.R.', gt: 'x.x.x.x.x.x.x.x.', me: ['out'], crash: 1 }
      ]
    },
    {
      id: 'padlock', title: 'Padlock', subtitle: 'Heavy door. Heavier heart. Nobody has the key.',
      bpm: 84, key: 'Cm', mood: 'gothic',
      mel: {
        v1: 'c4:4 eb4:2 g4:2 c5:8 | bb4:4 ab4:2 g4:2 eb4:8 | f4:4 ab4:2 c5:2 f5:6 eb5:2 | d5:4 c5:2 b4:2 g4:8',
        v2: 'c4:4 eb4:2 g4:2 c5:8 | eb5:4 d5:2 c5:2 ab4:8 | f4:4 ab4:2 c5:2 eb5:6 d5:2 | b4:2 c5:2 d5:4 g4:8',
        c1: 'g5:8 f5:4 eb5:4 | c5:8 ab4:4 c5:4 | bb4:4 eb5:4 g5:6 f5:2 | d5:8 b4:8',
        c2: 'g5:8 ab5:4 g5:4 | eb5:8 c5:4 eb5:4 | bb4:4 c5:2 d5:2 eb5:4 f5:4 | g5:16',
        br: 'c5:6 ab4:2 f4:8 | eb5:6 c5:2 g4:8 | f5:6 db5:2 ab4:8 | g4:4 b4:4 d5:4 f5:4',
        out: 'c5:16 | g4:8 c4:8'
      },
      sections: [
        { n: 'intro', bars: 4, ch: ['Cm', 'Ab', 'Fm', 'G'], dr: 'none', ba: 'R~~~~~~~~~~~~~~~', gt: '1.2.3.2.3.2.1.2.', organ: 1 },
        { n: 'verse', bars: 8, ch: ['Cm', 'Ab', 'Fm', 'G'], dr: 'half', ba: 'R.....R...R.....', gt: 'p..p..p.p.p.p..p', me: ['v1', 'v2'], crash: 1 },
        { n: 'chorus', bars: 8, ch: ['Cm', 'Ab', 'Eb', 'G'], dr: 'halfDouble', ba: 'R.R...R.R.R...5.', gt: 'L~~~~~~~x.xx.x.x', me: ['c1', 'c2'], crash: 1, organ: 1 },
        { n: 'bridge', bars: 4, ch: ['Fm', 'Cm', 'Db', 'G'], dr: 'tick', ba: 'R~~~~~~~R~~~~~~~', gt: '1.2.3.2.3.2.3.2.', me: ['br'], organ: 1 },
        { n: 'chorus', bars: 8, ch: ['Cm', 'Ab', 'Eb', 'G'], dr: 'halfDouble', ba: 'R.R.R.R.R.R.R.5.', gt: 'L~~~~~~~x.xx.x.x', me: ['c1', 'c2'], crash: 1, organ: 1 },
        { n: 'outro', bars: 2, ch: ['Cm', 'Cm'], dr: 'half', ba: 'R~~~~~~~~~~~~~~~', gt: 'L~~~~~~~~~~~~~~~', me: ['out'], crash: 1, organ: 1 }
      ]
    },
    {
      id: 'room-707', title: 'Room 707', subtitle: 'The landlord has asked us to stop. The crowd has not.',
      bpm: 200, key: 'Am', mood: 'chaotic',
      mel: {
        hk: 'a4:2 a4:2 c5:2 a4:2 e5:4 d5:2 c5:2 | a4:2 a4:2 c5:2 a4:2 f5:4 e5:2 c5:2 | g4:2 g4:2 c5:2 g4:2 e5:4 d5:2 c5:2 | b4:4 d5:4 g5:8',
        v1: 'a4:2 a4:2 a4:2 g4:2 a4:4 c5:4 | g4:2 g4:2 g4:2 f#4:2 g4:4 b4:4 | f4:2 f4:2 f4:2 e4:2 f4:4 a4:4 | e4:2 g#4:2 b4:2 e5:2 r:8',
        v2: 'a4:2 a4:2 a4:2 g4:2 a4:4 e5:4 | g4:2 g4:2 g4:2 f#4:2 g4:4 d5:4 | f4:2 f4:2 a4:2 c5:2 f5:4 e5:4 | e5:2 d5:2 b4:2 g#4:2 e4:8',
        c1: 'e5:3 e5:1 a4:2 e5:2 r:2 e5:2 d5:2 c5:2 | c5:3 c5:1 f4:2 c5:2 r:2 c5:2 d5:2 e5:2 | g5:4 e5:2 c5:2 e5:4 g5:4 | d5:2 d5:2 e5:2 d5:2 b4:8',
        c2: 'e5:3 e5:1 a4:2 e5:2 r:2 e5:2 d5:2 c5:2 | c5:3 c5:1 f4:2 c5:2 r:2 c5:2 d5:2 e5:2 | g5:4 e5:2 c5:2 a5:4 g5:4 | e5:2 d5:2 c5:2 b4:2 a4:8',
        sv: 'a4:2 c5:2 e5:2 a4:2 c5:2 e5:2 g5:2 | f5:4 e5:4 d5:2 c5:2 b4:2',
        sv2: 'a4:2 c5:2 e5:2 a4:2 c5:2 e5:2 a5:2 | g5:4 f5:4 e5:2 d5:2 c5:2',
        out: 'a5:4 g5:4 e5:4 c5:4 | a4:16 | a5:8 e5:8 | a4:12 r:4'
      },
      sections: [
        { n: 'intro', bars: 8, ch: ['Am', 'F', 'C', 'G'], dr: 'punk', ba: 'R.R.R.R.R.R.R.R.', gt: 'x.x.xx.xx.x.xx.x', me: ['hk', 'hk'], crash: 1 },
        { n: 'verse', bars: 16, ch: ['Am', 'G', 'F', 'E'], dr: 'skate', ba: 'R.R.R.R.R.R.5.R.', gt: 'p.p.p.ppp.p.p.pp', me: ['v1', 'v2', 'v1', 'v2'], crash: 1 },
        { n: 'chorus', bars: 16, ch: ['Am', 'F', 'C', 'G'], dr: 'blast', ba: 'R.R.R.R.O.O.R.R.', gt: 'x.xxx.xxx.xxx.xx', me: ['c1', 'c2', 'c1', 'c2'], crash: 1 },
        { n: 'break', bars: 8, len: 14, ch: ['Am', 'Dm', 'Am', 'E'], dr: 'sevens', ba: 'R.R.R.R.R.R.R.', gt: 'x.x.x.xx.x.x.x', me: ['sv', 'sv2', 'sv', 'sv2'], crash: 1 },
        { n: 'verse', bars: 8, ch: ['Am', 'G', 'F', 'E'], dr: 'skate', ba: 'R.R.R.R.R.R.5.R.', gt: 'p.p.p.ppp.p.p.pp', me: ['v1', 'v2'], crash: 1 },
        { n: 'chorus', bars: 16, ch: ['Am', 'F', 'C', 'G'], dr: 'blast', ba: 'R.R.R.R.O.O.R.R.', gt: 'x.xxx.xxx.xxx.xx', me: ['c1', 'c2', 'c1', 'c2'], crash: 1 },
        { n: 'outro', bars: 4, ch: ['F', 'Am', 'F', 'Am'], dr: 'rockOpen', ba: 'R.R.R.R.R.R.R.R.', gt: 'L~~~~~~~~~~~~~~~', me: ['out'], crash: 1 }
      ]
    },
    {
      id: 'birdcage', title: 'Birdcage', subtitle: 'Gilded bars, perfect pitch. Trapnest brought lasers.',
      bpm: 150, key: 'F#m', mood: 'sleek',
      mel: {
        v1: 'c#5:3 c#5:3 e5:2 f#5:8 | d5:3 c#5:3 b4:2 a4:8 | a4:3 b4:3 c#5:2 e5:8 | e5:3 d5:3 c#5:2 b4:8',
        v2: 'c#5:3 c#5:3 e5:2 f#5:8 | a5:3 f#5:3 e5:2 d5:8 | a4:3 b4:3 c#5:2 a5:8 | g#5:3 e5:3 c#5:2 b4:8',
        c1: 'a5:6 g#5:2 f#5:4 e5:4 | e5:6 f#5:2 c#5:8 | b4:4 c#5:2 e5:2 b5:6 a5:2 | f#5:8 r:4 c#5:4',
        c2: 'a5:6 g#5:2 f#5:4 e5:4 | e5:6 f#5:2 c#5:8 | b4:4 c#5:2 e5:2 g#5:4 a5:4 | f#5:16',
        br: 'd5:8 f#5:8 | c#5:8 a4:8 | b4:6 d5:2 g5:8 | c#5:4 f5:4 g#5:8',
        out: 'f#5:8 c#5:8 | a4:8 e5:8 | c#5:8 f#4:8 | f#5:12 r:4'
      },
      sections: [
        { n: 'intro', bars: 4, ch: ['F#m', 'D', 'A', 'E'], dr: 'cage', ba: 'R..R..R.R..R..R.', gt: 'x..x..x.x..x..x.', crash: 1 },
        { n: 'verse', bars: 8, ch: ['F#m', 'D', 'A', 'E'], dr: 'cage', ba: 'R..R..R.R..R..5.', gt: 'p..p..p.p..p..p.', me: ['v1', 'v2'], crash: 1 },
        { n: 'chorus', bars: 8, ch: ['D', 'A', 'E', 'F#m'], dr: 'punk', ba: 'R.R.R.R.R.R.5.5.', gt: 'L~~~~~x.x.x.x.x.', me: ['c1', 'c2'], crash: 1 },
        { n: 'verse', bars: 8, ch: ['F#m', 'D', 'A', 'E'], dr: 'cage', ba: 'R..R..R.R..R..5.', gt: 'x..x..x.x..x..x.', me: ['v1', 'v2'], crash: 1 },
        { n: 'chorus', bars: 8, ch: ['D', 'A', 'E', 'F#m'], dr: 'punk', ba: 'R.R.R.R.R.R.5.5.', gt: 'L~~~~~x.x.x.x.x.', me: ['c1', 'c2'], crash: 1 },
        { n: 'bridge', bars: 8, ch: ['Bm', 'F#m', 'G', 'C#'], dr: 'half', ba: 'R~~~R~~~R~~~5~~~', gt: 'L~~~~~~~L~~~~~~~', me: ['br', 'br'], crash: 1, organ: 1 },
        { n: 'chorus', bars: 8, ch: ['D', 'A', 'E', 'F#m'], dr: 'blast', ba: 'R.R.R.R.O.O.5.5.', gt: 'L~~~~~x.x.x.x.x.', me: ['c1', 'c2'], crash: 1 },
        { n: 'outro', bars: 4, ch: ['F#m', 'D', 'E', 'F#m'], dr: 'cage', ba: 'R..R..R.R..R..R.', gt: 'x..x..x.L~~~~~~~', me: ['out'], crash: 1 }
      ]
    },
    {
      id: 'demon-encore', title: "The Demon Lord's Encore", subtitle: 'He has notes. He has so many notes.',
      bpm: 192, key: 'Dm', mood: 'unhinged',
      mel: {
        ov: 'd5:8 f5:4 e5:4 | bb4:8 d5:4 c5:4 | g4:8 bb4:4 a4:4 | a4:4 c#5:4 e5:8',
        v1: 'd5:4 a4:2 d5:2 f5:4 d5:4 | c5:4 g4:2 c5:2 e5:4 c5:4 | bb4:4 f4:2 bb4:2 d5:4 bb4:4 | a4:2 a4:2 c#5:4 e5:8',
        v2: 'd5:4 a4:2 d5:2 f5:4 a5:4 | g5:4 e5:2 c5:2 e5:4 g5:4 | f5:4 d5:2 bb4:2 d5:4 f5:4 | e5:2 c#5:2 a4:4 a5:8',
        c1: 'bb5:6 a5:2 g5:4 a5:4 | f5:6 e5:2 d5:8 | e5:2 f5:2 g5:4 a5:4 g5:2 f5:2 | e5:2 d5:2 c#5:4 d5:8',
        c2: 'bb5:6 a5:2 g5:4 a5:4 | f5:6 e5:2 d5:8 | e5:2 f5:2 g5:4 bb5:4 a5:2 g5:2 | a5:4 c#5:4 d5:8',
        w1: 'd5:4 f5:2 a5:2 f5:2 d5:2 | c#5:4 e5:2 g5:2 e5:2 c#5:2 | bb4:4 d5:2 f5:2 d5:2 bb4:2 | a4:4 c#5:4 e5:4',
        w2: 'd5:4 f5:2 a5:2 f5:2 d5:2 | c#5:4 e5:2 g5:2 e5:2 c#5:2 | bb4:4 d5:2 f5:2 bb5:2 a5:2 | a5:4 g5:4 e5:4',
        bow: 'a5:32',
        fin: 'd6:4 c6:2 bb5:2 a5:4 bb5:4 | f5:6 e5:2 d5:8 | e5:2 f5:2 g5:4 a5:4 bb5:2 c6:2 | d6:4 c#6:4 d6:8',
        out: 'd6:8 a5:8 | f5:8 d5:8 | a5:4 g5:4 f5:4 e5:4 | d5:8 d6:8'
      },
      sections: [
        { n: 'overture', bars: 4, bpm: 96, ch: ['Dm', 'Bb', 'Gm', 'A'], dr: 'half', ba: 'R~~~~~~~~~~~~~~~', gt: 'L~~~~~~~~~~~~~~~', me: ['ov'], crash: 1, organ: 1 },
        { n: 'verse', bars: 8, ch: ['Dm', 'C', 'Bb', 'A'], dr: 'gallop', ba: 'R.RRR.RRR.RRR.RR', gt: 'x.ppx.ppx.ppx.pp', me: ['v1', 'v1'], crash: 1,
          tricks: [{ bar: 3, type: 'shuffle', bars: 4 }] },
        { n: 'chorus', bars: 8, ch: ['Gm', 'Dm', 'A', 'Dm'], dr: 'blast', ba: 'R.R.R.R.O.O.R.R.', gt: 'L~~~x.x.x.xxx.x.', me: ['c1', 'c2'], crash: 1, organ: 1,
          tricks: [{ bar: 1, type: 'fakes', bars: 6 }] },
        { n: 'verse', bars: 8, ch: ['Dm', 'C', 'Bb', 'A'], dr: 'gallop', ba: 'R.RRR.RRR.RRR.RR', gt: 'x.ppx.ppx.ppx.pp', me: ['v1', 'v2'], crash: 1,
          tricks: [{ bar: 2, type: 'blackout', bars: 5 }] },
        { n: 'chorus', bars: 8, ch: ['Gm', 'Dm', 'A', 'Dm'], dr: 'blast', ba: 'R.R.R.R.O.O.R.R.', gt: 'L~~~x.x.x.xxx.x.', me: ['c1', 'c2'], crash: 1, organ: 1 },
        { n: 'waltz', bars: 12, len: 12, bpm: 168, ch: ['Dm', 'A', 'Bb', 'A'], dr: 'waltz', ba: 'R...5...5...', gt: '..x...x.x...', me: ['w1', 'w2', 'w1'], crash: 1, organ: 1,
          tricks: [{ bar: 2, type: 'lurch', bars: 8 }] },
        { n: 'bow', bars: 2, bpm: 96, ch: ['A', 'A'], dr: 'none', ba: '................', gt: 'L~~~~~~~~~~~~~~~', me: ['bow'], crash: 1 },
        { n: 'finale', bars: 16, bpm: 200, tr: 2, ch: ['Gm', 'Dm', 'A', 'Dm'], dr: 'blast', ba: 'R.RRR.RRR.RRR.RR', gt: 'x.xxx.xxx.xxx.xx', me: ['fin', 'fin', 'fin', 'fin'], crash: 1, organ: 1,
          tricks: [{ bar: 4, type: 'shuffle', bars: 4 }, { bar: 10, type: 'fakes', bars: 4 }] },
        { n: 'outro', bars: 4, bpm: 200, tr: 2, ch: ['Dm', 'Bb', 'A', 'Dm'], dr: 'fill', ba: 'R.R.R.R.R.R.R.R.', gt: 'L~~~~~~~L~~~~~~~', me: ['out'], crash: 1, organ: 1 }
      ]
    }
  ];

  var MENUS = {
    title: {
      bpm: 112, key: 'Am',
      mel: { a: 'e5:6 d5:2 c5:4 a4:4 | c5:6 b4:2 g4:8 | a4:4 c5:2 e5:2 g5:4 e5:4 | d5:8 r:8' },
      sections: [{ n: 'loop', bars: 4, ch: ['Am', 'F', 'C', 'G'], dr: 'rock', ba: 'R.R.R.R.R.R.R.R.', gt: 'p.p.p.p.p.p.p.pp', me: ['a'], vel: 0.7 }]
    },
    room: {
      bpm: 84, key: 'D',
      mel: { a: 'r:8 a4:4 f#4:4 | e4:8 r:8 | r:8 b4:4 a4:4 | f#4:12 r:4' },
      sections: [{ n: 'loop', bars: 4, ch: ['D', 'Bm', 'G', 'A'], dr: 'tick', ba: 'R.....R...R.....', gt: '1.2.3.2.3.2.1.2.', me: ['a'], vel: 0.6 }]
    },
    tension: {
      bpm: 72, key: 'Cm',
      mel: { a: 'r:16 | r:8 g4:8 | r:16 | r:8 ab4:8' },
      sections: [{ n: 'loop', bars: 4, ch: ['Cm', 'Cm', 'Db', 'Cm'], dr: 'half', ba: 'R.R.R.R.R.R.R.R.', gt: '1...2...3...2...', me: ['a'], organ: 1, vel: 0.6 }]
    },
    sad: {
      bpm: 66, key: 'Em',
      mel: { a: 'b4:8 a4:4 g4:4 | e4:12 r:4 | d4:8 e4:4 g4:4 | f#4:12 r:4' },
      sections: [{ n: 'loop', bars: 4, ch: ['Em', 'C', 'G', 'D'], dr: 'none', ba: 'R~~~~~~~~~~~~~~~', gt: '1.2.3.2.1.2.3.2.', me: ['a'], organ: 1, vel: 0.5 }]
    }
  };

  /* ---------- compiler: data to timed events ---------- */
  function fifthAbove(m) { return m + 7; }

  function holdLen(line, i, sectionSteps, sc) {
    var n = 1;
    while (sc + n < sectionSteps && line.charAt((i + n) % line.length) === '~' && n < line.length) n++;
    return n;
  }

  function compile(def) {
    var events = [], beats = [], sections = [], tricks = [], cand = [];
    var now = 0, barIdx = 0, errors = [];
    def.sections.forEach(function (sec, sIdx) {
      var len = sec.len || 16, bpm = sec.bpm || def.bpm, sps = 15 / bpm;
      var steps = len * sec.bars, start = now, tr = sec.tr || 0, vel = sec.vel || 1;
      var dr = DR[sec.dr] || {};
      var intensity = { intro: 0.7, verse: 0.9, pre: 1, chorus: 1.2, bridge: 0.8, 'break': 1.15, outro: 0.6, overture: 0.65, waltz: 1.05, bow: 0.3, finale: 1.3, loop: 1 }[sec.n] || 1;

      var chordAt = function (bar, s) {
        var parts = sec.ch[bar % sec.ch.length].split('/');
        return parseChord(parts[Math.floor(s / (len / parts.length))]);
      };
      var push = function (e, candidate) {
        events.push(e);
        if (candidate) cand.push(e);
      };

      sections.push({ name: sec.n, t: start, end: start + steps * sps, index: sIdx });
      (sec.tricks || []).forEach(function (tk) {
        tricks.push({ type: tk.type, t: start + tk.bar * len * sps, dur: tk.bars * len * sps, section: sIdx });
      });
      for (var b = 0; b < steps; b += 4) beats.push(start + b * sps);

      if (sec.crash) events.push({ t: start, lane: 0, k: 'c', v: 0.9 });

      for (var i = 0; i < steps; i++) {
        var t = start + i * sps, bar = Math.floor(i / len), s = i % len, bigBar = barIdx + bar;
        var meta = function (o) {
          o.t = t; o.step = i; o.bp = s; o.bar = bigBar; o.int = intensity; o.sec = sIdx; return o;
        };
        ['k', 's', 't', 'h', 'o', 'c'].forEach(function (key) {
          var line = dr[key];
          if (!line) return;
          var ch = line.charAt(i % line.length);
          if (ch !== 'x') return;
          var v = key === 'h' ? (s % 4 === 0 ? 0.9 : 0.65) : 1;
          var e = meta({ lane: 0, k: key, v: v * vel });
          push(e, key === 'k' || key === 's' || key === 't' || key === 'h');
        });

        var chord = chordAt(bar, s);
        var gRoot = 40 + (chord.pc - 4 + 12) % 12 + tr;
        var bRoot = 28 + (chord.pc - 4 + 12) % 12 + tr;

        if (sec.ba) {
          var bc = sec.ba.charAt(i % sec.ba.length);
          if (bc !== '.' && bc !== '~') {
            var bl = holdLen(sec.ba, i, steps, i);
            var bm = bRoot + (bc === '5' ? 7 : bc === 'O' ? 12 : bc === 'b' ? 10 : bc === '3' ? (chord.minor ? 3 : 4) : 0);
            push(meta({ lane: 1, k: 'b', midi: bm, dur: bl * sps * 0.92, bl: bl }), true);
          }
        }
        if (sec.gt) {
          var gc = sec.gt.charAt(i % sec.gt.length);
          if (gc !== '.' && gc !== '~') {
            var gl = holdLen(sec.gt, i, steps, i);
            if (gc === '1' || gc === '2' || gc === '3') {
              var tone = gc === '1' ? 12 : gc === '2' ? (chord.minor ? 15 : 16) : 19;
              push(meta({ lane: 2, k: 'g', gt: 'a', midi: gRoot + tone, dur: sps * gl * 1.4, gl: gl }), true);
            } else {
              var d = gc === 'p' ? sps * 0.8 : gl * sps * 0.95;
              push(meta({ lane: 2, k: 'g', gt: gc, midi: gRoot, dur: d, gl: gl, ring: gc === 'L' }), true);
            }
          }
        }
        if (sec.organ && s === 0) {
          var base = 48 + (chord.pc % 12) + tr;
          events.push({ t: t, lane: -1, k: 'pad', midis: [base, base + (chord.minor ? 3 : 4), fifthAbove(base)], dur: len * sps * 0.98 });
        }
      }

      if (sec.me) {
        var tokens = [];
        sec.me.forEach(function (name) {
          var phrase = def.mel[name];
          if (phrase === undefined) throw new Error('missing phrase ' + name);
          phrase.split(/\s+/).forEach(function (tok) { if (tok && tok !== '|') tokens.push(tok); });
        });
        var at = 0, noteN = 0, cycle = VOWEL_CYCLES[sIdx % VOWEL_CYCLES.length];
        tokens.forEach(function (tok) {
          var m = /^([a-g][#b]?\d|r)(~?):(\d+)$/.exec(tok);
          if (!m) throw new Error('bad token ' + tok + ' in ' + def.id);
          var d = +m[3];
          if (m[1] !== 'r') {
            var slide = !!m[2];
            var bp = at % len, bar2 = Math.floor(at / len);
            var e = { t: start + at * sps, lane: 3, k: 'v', midi: noteToMidi(m[1]) + tr, dur: d * sps * 0.96, step: at, bp: bp, bar: barIdx + bar2, int: intensity, sec: sIdx, ml: d, phraseStart: noteN === 0 || (bp === 0), vowel: cycle.charAt(noteN % cycle.length), scoop: slide || (d >= 6 && noteN % 3 === 0) };
            push(e, true);
            noteN++;
          }
          at += d;
        });
        if (at !== steps) errors.push(sec.n + '@' + sIdx + ': melody ' + at + ' steps, section ' + steps);
      }
      now = start + steps * sps;
      barIdx += sec.bars;
    });
    events.sort(function (a, b) { return a.t - b.t || laneOrder(a) - laneOrder(b); });
    return { events: events, cand: cand, beats: beats, sections: sections, tricks: tricks, duration: now, bars: barIdx, errors: errors };
  }
  function laneOrder(e) { return e.lane; }

  /* ---------- deterministic thinning ---------- */
  var DIFFS = {
    hachi: { nps: 0.85, minGap: 0.5, laneGap: 0.55, grid: 4, maxChord: 1, maxChordsPerBar: 0, chordGrid: 16, chordBars: 1, holdBlocks: true, hats: false, holdMin: 0.75, holdCap: 2.2 },
    nana: { nps: 1.9, minGap: 0.26, laneGap: 0.3, grid: 2, maxChord: 2, maxChordsPerBar: 1, chordGrid: 8, chordBars: 2, holdBlocks: false, hats: false, holdMin: 0.4, holdCap: 4 },
    demon: { nps: 4.6, minGap: 0.09, laneGap: 0.14, grid: 1, maxChord: 2, maxChordsPerBar: 2, chordGrid: 8, chordBars: 1, holdBlocks: false, hats: true, holdMin: 0.32, holdCap: 6 }
  };

  function metric(bp) {
    if (bp === 0) return 10;
    if (bp % 8 === 0) return 8;
    if (bp % 4 === 0) return 6;
    if (bp % 2 === 0) return 3;
    return 1;
  }

  function baseScore(e) {
    var s = metric(e.bp);
    if (e.k === 'v') { s += 3; if (e.dur >= 0.4) s += 2.5; if (e.phraseStart) s += 1.5; }
    else if (e.k === 'g') { s += e.ring ? 4 : (e.gt === 'p' ? -0.5 : 1); }
    else if (e.k === 's') { s += e.bp % 8 === 4 ? 3 : 0.5; }
    else if (e.k === 'k') { s += e.bp === 0 ? 1.5 : 0; }
    else if (e.k === 't') { s += 1; }
    else if (e.k === 'h') { s -= 4.5; }
    else if (e.k === 'b') { s += e.bp % 4 === 0 ? 1.5 : -0.3; }
    return s;
  }

  function buildChart(data, name) {
    var cfg = DIFFS[name], chart = [], laneTotals = [0, 0, 0, 0], total = 0;
    var cand = data.cand;
    var byBar = {}, order = [];
    cand.forEach(function (e) {
      if (e.bp % cfg.grid !== 0) return;
      if (e.k === 'h' && !cfg.hats) return;
      if (!byBar[e.bar]) { byBar[e.bar] = []; order.push(e.bar); }
      byBar[e.bar].push(e);
    });
    order.sort(function (a, b) { return a - b; });
    var carry = 0;

    function isHold(e) {
      if (e.k === 'v') return e.dur >= cfg.holdMin;
      return !!e.ring && e.dur >= cfg.holdMin;
    }
    function holdDur(e) {
      if (!isHold(e)) return 0;
      var d = e.dur * (e.k === 'v' ? 0.96 : 0.92);
      return Math.min(cfg.holdCap, d);
    }

    function conflicts(e, dur) {
      var chordCount = 0, active = 0;
      for (var i = 0; i < chart.length; i++) {
        var c = chart[i];
        if (c.t > e.t + 3 + Math.max(dur, 0)) continue;
        var cEnd = c.t + c.dur;
        var dt = Math.abs(c.t - e.t);
        var same = dt < 0.002;
        if (same) {
          chordCount++;
          if (c.lane === e.lane) return true;
        } else if (dt < cfg.minGap) {
          return true;
        }
        if (c.lane === e.lane) {
          if (dt < cfg.laneGap) return true;
          if (e.t >= c.t && e.t < cEnd + cfg.laneGap) return true;
          if (c.t >= e.t && c.t < e.t + dur + cfg.laneGap) return true;
        } else {
          var overlapA = c.dur > 0 && e.t > c.t && e.t < cEnd + 0.02;
          var overlapB = dur > 0 && c.t > e.t && c.t < e.t + dur + 0.02;
          if (overlapA || overlapB) {
            if (cfg.holdBlocks) return true;
            active++;
          }
        }
      }
      if (chordCount + active + 1 > cfg.maxChord) return true;
      return chordCount > 0 && !chordAllowed(e);
    }
    var chordsThisBar = 0;
    function chordAllowed(e) {
      return e.bp % cfg.chordGrid === 0 && e.bar % cfg.chordBars === 0 && chordsThisBar < cfg.maxChordsPerBar;
    }

    order.forEach(function (barNo) {
      var items = byBar[barNo].slice();
      var barSeconds = 0, lo = Infinity, hi = -Infinity;
      items.forEach(function (e) { lo = Math.min(lo, e.t); hi = Math.max(hi, e.t); });
      var meanInt = items[0].int;
      /* bar length: from the song's beats, close enough via the first item's section tempo */
      barSeconds = secondsOfBar(data, items[0]);
      var budget = cfg.nps * barSeconds * meanInt + carry;
      var want = Math.floor(budget);
      carry = budget - want;
      var laneInBar = [0, 0, 0, 0], picked = 0;
      chordsThisBar = 0;
      var scored = items.map(function (e) { return { e: e, s: baseScore(e) }; });
      while (picked < want && scored.length) {
        var bestI = -1, bestS = -Infinity;
        for (var i = 0; i < scored.length; i++) {
          var it = scored[i];
          var share = total ? laneTotals[it.e.lane] / total : 0.25;
          var adj = it.s - 2.6 * laneInBar[it.e.lane] - 30 * Math.max(0, share - 0.28);
          if (adj > bestS || (adj === bestS && bestI >= 0 && it.e.t < scored[bestI].e.t)) { bestS = adj; bestI = i; }
        }
        var chosen = scored.splice(bestI, 1)[0].e;
        var dur = holdDur(chosen);
        var hasChordPartner = chart.some(function (c) { return Math.abs(c.t - chosen.t) < 0.002; });
        if (conflicts(chosen, dur)) continue;
        if (hasChordPartner) chordsThisBar++;
        chart.push({ t: round(chosen.t), lane: chosen.lane, dur: round(dur), bar: barNo });
        laneTotals[chosen.lane]++; total++; laneInBar[chosen.lane]++; picked++;
      }
    });
    chart.sort(function (a, b) { return a.t - b.t || a.lane - b.lane; });
    chart.forEach(function (n, i) { n.id = i; });
    return chart;
  }

  function round(v) { return Math.round(v * 10000) / 10000; }

  function secondsOfBar(data, e) {
    var secDef = data.def.sections[e.sec];
    return (secDef.len || 16) * 15 / (secDef.bpm || data.def.bpm);
  }

  function compileSong(def) {
    var d = compile(def);
    d.def = def;
    var song = {
      id: def.id, title: def.title, subtitle: def.subtitle, bpm: def.bpm, key: def.key, mood: def.mood,
      duration: d.duration + 0.4, events: d.events, beats: d.beats, sections: d.sections, tricks: d.tricks,
      errors: d.errors,
      charts: { hachi: buildChart(d, 'hachi'), nana: buildChart(d, 'nana'), demon: buildChart(d, 'demon') }
    };
    return song;
  }

  function compileMenu(def) {
    var d = compile(def);
    return { bpm: def.bpm, events: d.events, duration: d.duration, errors: d.errors };
  }

  var compiled = {};
  var list = SONGS.map(function (def) {
    var s = compileSong(def);
    compiled[def.id] = s;
    var level = function (name) {
      return Math.max(1, Math.min(20, Math.round(s.charts[name].length / s.duration * 2.2)));
    };
    return {
      id: s.id, title: s.title, subtitle: s.subtitle, bpm: s.bpm,
      duration: Math.round(s.duration), mood: s.mood,
      difficulties: { hachi: level('hachi'), nana: level('nana'), demon: level('demon') },
      noteCounts: { hachi: s.charts.hachi.length, nana: s.charts.nana.length, demon: s.charts.demon.length }
    };
  });

  var menus = {};
  Object.keys(MENUS).forEach(function (id) { menus[id] = compileMenu(MENUS[id]); });

  window.NG.Songs = {
    list: list,
    get: function (id) { return compiled[id] || null; },
    menus: menus
  };
})();
