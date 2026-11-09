# HEY, NANA — Room 707 (fan game) — architecture contract

Unofficial, non-commercial fan tribute to *NANA* by Ai Yazawa. Static site: plain JS + CSS.

## Hard rules (everyone)

- **Must run by double-clicking `index.html` (`file://`) and on GitHub Pages.** Classic `<script>` tags only. NO ES modules, NO `fetch`/XHR, NO build step, NO npm, NO external URLs/CDNs/fonts/images. Use relative paths only.
- All code hangs off one global: `window.NG`. Each file starts with `window.NG = window.NG || {};` and wraps itself in an IIFE.
- All art is original: SVG / CSS / canvas drawn in code. Never copy official artwork, logos or panel layouts.
- All music is original, synthesized with WebAudio. Never reproduce real songs, melodies, or the real titles of real songs (no "Rose", "Glamorous Sky", "Endless Story", "A Little Pain", "Wish", "Zero", "Starless Night", etc.).
- **No lyrics and no dialogue/narration copied from the manga or anime.** All writing is original, in the spirit of the characters. Character names, places and motifs are fine.
- Stay inside the files you own. Do not run git. Do not edit another owner's file; if you need a contract change, say so in your final report.
- Mobile + desktop: playable from 360px wide, touch and keyboard. Honour `settings.reduceFlash` (no strobing when true).
- Script load order: `audio.js, songs.js, rhythm.js, art.js, story.js, minigames.js, main.js`. Do not touch other modules at parse time, only at call time.

## File ownership

| Files | Owner |
| --- | --- |
| `docs/BIBLE.md`, `js/story.js`, `js/art.js`, `css/style.css` | Design/Story agent |
| `js/audio.js`, `js/songs.js`, `js/rhythm.js`, `css/rhythm.css` | Rhythm agent |
| `js/minigames.js`, `css/minigames.css` | Minigames agent |
| `index.html`, `js/main.js`, `README.md`, `.nojekyll` | Lead (integration) |

## Visual language

Punk zine meets shoujo: photocopied black-and-white, halftone screentone, torn paper, tape, safety pins, ransom-note letters. Two worlds collide: **Nana** (black / blood red) and **Hachi** (strawberry pink / cream).

CSS tokens, defined on `:root` in `css/style.css` (other stylesheets may use them, with fallbacks):

```
--ink:#0d0b0c; --ink-2:#1d191b; --paper:#f3ece0; --paper-2:#e4d9c6;
--red:#d3122a; --pink:#ff6fa3; --strawberry:#e8294f; --gold:#f4c430;
--font-punk: Impact, "Haettenschweiler", "Arial Narrow Bold", sans-serif;
--font-serif: Didot, "Bodoni 72", "Bodoni MT", Georgia, serif;
--font-letter: "American Typewriter", "Courier New", monospace;
--font-hand: "Noteworthy", "Segoe Print", "Bradley Hand", cursive;
```

## Game state (owned by main.js)

```js
NG.state = { persona:'black'|'pink', bond:0, fame:0, scandal:0, harmony:0, flags:{}, chapter:0 };
NG.settings = { offsetMs:0, speed:1, reduceFlash:false, music:0.8, sfx:0.8 };
```

`bond` = Nana & Hachi. `fame` = BLAST's rise. `scandal` = tabloid heat (bad if high). `harmony` = band unity.

## Personas

`black` (Nana-type): BLAST meter fills 25% faster. `pink` (Hachi-type): 3 "Puppy Eyes" shields, each cancels one miss.

## Songs (ids fixed)

| id | title | notes |
| --- | --- | --- |
| `last-train` | Last Train, First Snow | easy opener, teaches the game |
| `strawberry-glass` | Strawberry Glass | bright pop-punk, major key |
| `padlock` | Padlock | heavy, slow, gothic, half-time |
| `room-707` | Room 707 | fast, chaotic, the crowd favourite |
| `birdcage` | Birdcage | duel versus Trapnest (AI rival score) |
| `demon-encore` | The Demon Lord's Encore | final boss, tricks mid-song |

## Interfaces

### NG.Audio (`audio.js`)
```js
NG.Audio.unlock()                 // call from a user gesture; safe to repeat
NG.Audio.sfx(name)                // click select perfect good miss blast cheer boo flash thud chime page win lose type
NG.Audio.tone(lane, durSec)       // lane 0-3: one short musical note, for minigames
NG.Audio.menu(id)                 // looping background: 'title' | 'room' | 'tension' | 'sad'; repeat calls with same id are no-ops
NG.Audio.stopMusic()
NG.Audio.setVolumes(music, sfx)   // 0..1
```

### NG.Songs (`songs.js`)
```js
NG.Songs.list   // [{id,title,subtitle,bpm,duration,mood,difficulties:{hachi:n,nana:n,demon:n}}]
NG.Songs.get(id)
```

### NG.Rhythm (`rhythm.js`)
```js
NG.Curses = [{id,name,desc,mult}]   // Demon Lord deals, e.g. speed-up, hidden notes, mirrored lanes, no BLAST, one-strike
const ctl = NG.Rhythm.start(containerEl, {
  songId, difficulty:'hachi'|'nana'|'demon', persona, curses:[ids],
  mode:'normal'|'duel'|'boss', settings:NG.settings, onFinish(result)
});
ctl.destroy();
// result: {songId, difficulty, score, accuracy(0..1), maxCombo, perfect, good, miss,
//          rank:'S'|'A'|'B'|'C'|'D', cleared:bool, quit:bool, duelWon?:bool, bossDefeated?:bool}
```
Four lanes, one per BLAST member, left to right: Yasu (drums), Shin (bass), Nobu (guitar), Nana (vocals). Keys D F J K and arrow keys, plus tap. Space = trigger BLAST mode.

### NG.Minigames (`minigames.js`)
Ids fixed: `shortcake`, `redflag`, `scandal`, `crowdsurf`, `padlock`.
```js
NG.Minigames[id] = { id, title, howto, start(containerEl, {persona, settings, onFinish}) } // start returns {destroy()}
// onFinish({score, stars:0..3, effects:{bond?,fame?,scandal?,harmony?}, headline?:string, quit:bool})
```

### NG.Art (`art.js`)
```js
NG.Art.portrait(charId, expr)  // returns an SVG string
// charId: hachi nana ren nobu shin yasu reira takumi junko misato demon
// expr: neutral happy sad angry smirk shock
NG.Art.scene(sceneId)          // returns HTML string for a full-bleed background layer
NG.Art.icon(name)              // SVG string: glass padlock key strawberry mic pin star demon
```

### NG.Story (`story.js`)
```js
NG.Story = {
  quiz: { intro, questions:[{q, answers:[{label, persona}]}], results:{black:{title,text}, pink:{title,text}} },
  chapters: [{ id, title, steps:[...] }],
  endings: [{ id, title, when:{bond:n, fame:n, harmony:n, maxScandal:n, flag:'x', bossDefeated:bool}, steps:[...] }], // first match wins; last has no `when`
  polaroids: { id: {title, caption, art:{chars:[...], scene:'...'} } },
};
```
Steps, run in order by main.js:
```js
{type:'scene', id}
{type:'letter', text}                       // a "Hey, Nana..." letter on paper
{type:'narrate', text}
{type:'say', who, expr, text, side:'left'|'right'}
{type:'choice', prompt, options:[{label, effects:{bond:1}, flag:'x', reply:[steps]}]}
{type:'label', name}
{type:'jump', to, if:{bond:n,fame:n,harmony:n,maxScandal:n,flag:'x',notFlag:'x'}}   // no `if` = always
{type:'quiz'}
{type:'minigame', id}
{type:'deal'}                               // Demon Lord offers curses for score multipliers
{type:'gig', song, mode, venue}             // mode optional, default 'normal'
{type:'polaroid', id}
{type:'stat', effects:{...}}
{type:'music', id}                          // 'title'|'room'|'tension'|'sad'|'stop'
{type:'ending'}                             // evaluates NG.Story.endings
```

## Shell DOM (written by main.js, styled by `css/style.css`)

```
#app > .screen.active
.btn, .btn.primary, .btn.ghost
Title:   .title > .title-art, .ransom > span (one per letter), .title-sub, .title-menu
VN:      .vn > .vn-bg, .vn-portraits > .portrait.left|.right(.active), .vn-hud > .stat[data-stat],
         .vn-box > .vn-name + .vn-text + .vn-next; .vn-choices > .choice
Letter:  .letter-wrap > .letter > .letter-text + .btn
Quiz:    .quiz > .quiz-q + .quiz-answers > .choice; .quiz-result > .glass-card
Deal:    .deal > .deal-title + .deal-portrait + .deal-cards > .curse-card(.selected) > .curse-name + .curse-desc + .curse-mult; .deal-actions
Songs:   .list-screen > .list-header + .song-list > .song-card(.locked) > .song-title + .song-sub + .song-best
Results: .results > .results-rank + .results-title + .results-stats > div + .results-actions
Scrapbook: .scrapbook > .polaroid-grid > .polaroid(.locked) > .polaroid-art + .polaroid-caption
Polaroid popup: .polaroid-pop > .polaroid
Settings: .settings > .setting > label + input
Disclaimer: .disclaimer
```
Rhythm and minigames render into the given container and prefix their own classes `.rg-` and `.mg-`.
