# Staging guide for writers

The visual novel now moves on its own. You do not need to add anything for a scene to feel alive; the cues below are for the moments that deserve more. Code: `js/stage.js` and `css/stage.css`. Steps are run by `main.js`.

## What happens automatically

- **Entrances and exits.** A character slides in from their side the first time they speak in a scene. If someone new takes their side, the old one slides out. On a scene change the cast leaves with the old scene.
- **Expressions move.** When a speaker's expression changes: `shock` jumps with speed lines and a "!", `angry` shakes with a vein mark, `sad` droops and breathes slowly with gloom lines, `happy` bounces with sparkles, `smirk` leans back with a glint.
- **Turn-taking.** The speaker steps forward and brightens, the listener settles back. Everyone breathes a little.
- **Nobody is in two places.** If a character is already on the other side, they speak from there.
- **Scene transitions follow the mood** (the place's mood, or a `music` step placed just before the scene): `sad` is a slow fade, `tension` is a slash wipe, `room` is a bouncy halftone pop.
- **Ambience per place.** Snow on train-snow, hometown and platform; rain and distant lightning on rain-rift; dust in a light shaft in room-707, inn, backstage and studio; stage-light flicker and haze in live-house; neon glow and passing cars on tokyo-night; steam and warm light in jackson-hole; embers on demon-realm; city lights in penthouse and arena; petals on rooftop; paparazzi flashes on newsstand; passing streetlights on road-van.
- **Letters** slide in like paper and get taped down. **Keepsakes** drop in with light rays and sparkles. **Polaroids** pop out with a camera flash and develop.

Skip fast-forwards all of it. "Reduce flashing" removes every flash and flicker and halves the motion. The system's reduced-motion setting removes motion and keeps simple fades.

## Explicit steps

None of these wait for a tap, except a prop with a caption (which reads like a line). They flow straight into the next step, so put them just before the line they belong to. Unknown steps, characters, moves or ids are skipped safely.

### `{type:'act', who, move, expr?, side?}`

Moves a character. If they are not on stage yet, they enter first (on `side`, or their usual side). `expr` optionally changes their face at the same time.

| move | use it for |
| --- | --- |
| `enter-left`, `enter-right` | Someone arrives before they speak, or crosses to the other side. |
| `exit` | Someone walks out mid-scene. Their next line brings them back. |
| `jump` | Surprise, delight, a fright. One beat. |
| `shake` | Trembling, refusing, a head shake. One beat. |
| `nod` | Agreement, a silent yes. |
| `sob` | Crying hard. Pairs well with `expr:'sad'`. |
| `laugh` | Laughing out loud. Adds a small "HA!". |
| `lean-in` | Pressing a point, flirting, a secret. Holds until changed. |
| `turn-away` | Hiding a face, refusing to look. Holds until changed. |
| `collapse` | Legs giving way, sinking to the floor. Holds until changed. |
| `reset` | Ends a held pose (`lean-in`, `turn-away`, `collapse`). Held poses also end on a scene change. |
| `hug` | Both characters on stage move together, with hearts. Either name works for `who`. |

### `{type:'prop', id, caption?}`

A big close-up of an object on a starburst, then it shrinks to the top of the screen and stays there through the next line. With a `caption`, the caption shows in the narration box and waits for a tap. Without one, the close-up holds for about 1.4 seconds (a tap moves on sooner).

Props drawn for the game: `ring` (Nana's knuckle-armour ring, on a hand), `strawberry-glasses`, `cracked-glass`, `lighter` (orb lighter, lit), `padlock`, `key` (with a 707 tag), `cake` (strawberry shortcake), `cigarettes`, `pick` (guitar pick), `mic`, `phone` (flip phone, ringing), `letter`, `nail-polish`, `nail-brush`, `paw-print` (Yuki's trail), `ticket` (BLAST tour ticket), `demo-cd`, `tabloid`.

Also usable, from the game's icon set: `glass`, `strawberry`, `pin`, `cups`, `shoes`, `tartan`, `door707`, `guitar`, `bass`, `drumsticks`, `shades`, `star`, `demon`.

Aliases: `glasses`, `cd`, `polish`, `brush`, `paw`, `cigs`, `guitar-pick`, `tour-ticket`, `newspaper`, `strawberry-cake`, `broken-glass`.

### `{type:'fx', id}`

| id | what it does | when to use it |
| --- | --- | --- |
| `shake` | The scene shakes (never the text box). | An impact, a crowd, a shock. |
| `flash` | A white flash (focus lines instead when flashing is reduced). | A camera, a realisation, lightning. |
| `zoom-in` | The camera pushes in on the current speaker and stays. | A confession, a threat, the key line. |
| `zoom-out` | Pulls back to normal. | After the moment passes. |
| `fade-black` | Fades the scene to black and holds about 0.7 s. Stays black until the next `scene`, which fades back in. | Time passing, a door closing on a memory. Narration reads well on black. |
| `door-slam` | Thud, jolt, dust. | Someone storms out or in. |
| `phone-buzz` | A ringing flip phone in the corner for about 2.5 s. | A call or text arrives. |
| `rain`, `snow` | Adds weather in front of the characters until the scene changes. | Weather that is not part of the place. |
| `heartbeat` | Two heartbeats: a red pulse at the edges. | Fear, nerves, falling in love. |
| `spotlight` | Darkens everything but the speaker, and follows whoever speaks. | A solo moment, a stage, an interrogation. |
| `clear` | Ends zoom, spotlight, black and added weather. | Back to normal without changing scene. |

### `{type:'wait', ms}`

A dramatic pause, 600 ms by default, at most 5000. A tap ends it early (taps in the first third of a second are ignored, so a double tap cannot swallow it). Use after an `act` or `fx` that needs a moment to land, or before a line that should hang.

## Example

```js
{ type: 'act', who: 'nana', move: 'turn-away', expr: 'sad' },
{ type: 'prop', id: 'ring', caption: 'She twists the ring off, then puts it straight back on.' },
say('nana', 'neutral', 'It does not come off. That is the point of it.'),
{ type: 'act', who: 'nana', move: 'reset' },
{ type: 'fx', id: 'heartbeat' },
say('hachi', 'shock', 'Nana...'),
{ type: 'act', who: 'hachi', move: 'hug' },
{ type: 'wait', ms: 900 },
```

## Taste

- One cue per beat. Most lines need nothing: the automatic staging already reacts to expressions.
- Save `zoom-in`, `spotlight` and `fade-black` for the biggest moments of a chapter.
- Props work best when the dialogue mentions the object in the next line or two.
- Do not stack `flash`, `shake` and `door-slam` together; pick the one that fits.
