# DS4: the Sloosh V4 design system on one page

Open `index.html` in a browser. It works offline except for the two Google fonts (Bowlby One, Caveat).

What's inside: the rules settled while shipping the pricing page (Oct 2026: type scale, spacing, control heights, savings chip, depth, rules, springs), type, colour, the prototype's grounds and edges, shape, buttons, controls, the twelve ink marks,
handwriting, the 28 doodles, the flock (moods, moves, crew), the pointer, the logo and its motion, motion tokens,
product components, pricing patterns, the rules, and the open questions where the zip and the prototype disagree.

Sources: `sloosh-design-system-v4.zip` (DESIGN.md, tokens, the SlooshInk engine) and the v4 pricing prototype.

## Agents only

- `index.html` is generated. Edit the files in `src/`, then run `python3 build.py`.
- `src/vendor/` holds `tokens.css`, `sloosh-ink.css`, `sloosh-ink.js`, copied unchanged from the zip. To move to a newer
  zip, replace those three files and rebuild.
- `src/specimen.css`, `src/specimen.body.html`, `src/specimen.js` are the page itself. Page classes use the `ds-` prefix;
  engine classes are `sl-` and `ink-`. Every demo calls only the public SlooshInk API.
- Theme: `data-theme="dark|light"` on `<html>`; the switch in the top bar sets it and remembers it per browser.
- Don't wrap the page in `.sl-root`: its `button { font: inherit }` rule overrides the keycap type.
