# HEY, NANA — Room 707

An unofficial, non-commercial fan game tribute to *NANA* by Ai Yazawa. Play punk gigs with BLAST, survive the tabloids, and take on the Demon Lord for the ending we never got.

## Play

Open `index.html` in a browser. There is no server, build step or install.

## Deploy

Every file is static and uses relative paths, so any static host works.

**GitHub Pages:** push this folder to a repository, then under Settings → Pages choose "Deploy from a branch" and select your branch with the `/ (root)` folder.

**Netlify, Cloudflare Pages, Vercel and similar:** point them at this folder with no build command.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Hit lanes | D F J K or arrow keys | Tap the lanes |
| BLAST mode | Space | BLAST button |
| Advance story | Space or Enter | Tap |
| Pick a choice | 1–4 | Tap |

## Project layout

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the modules fit together.

## Audio

Gig music and sound effects are synthesized in the browser. Menu music and voice clips load from a local `assets` folder that is deliberately not part of this repository, so the hosted version plays without them.

## Legal

This is fan work with no affiliation to or endorsement from Ai Yazawa, the rights holders of *NANA*, or Vivienne Westwood, whose name is a trademark of its owner and is used here only to refer to the fashion in the series. Character names and story references belong to their owners. All artwork, music and writing in this project are original, generated in code, and no assets from the manga or anime are included. If you are a rights holder and would like it changed or removed, please open an issue.
