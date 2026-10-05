# DS4: the Sloosh V4 design system on one page

Open `index.html` in a browser. It works offline except for the two Google fonts (Bowlby One, Caveat).

What's inside: the rules settled while shipping the pricing page (Oct 2026: type scale, spacing, control heights, savings chip, depth, rules, springs), type, colour, the prototype's grounds and edges, shape, buttons, controls, the eleven ink marks (no drawn underlines),
handwriting, icons (Hugeicons, link to come), the flock (moods, moves, crew), the pointer, the logo and its motion, motion tokens,
product components, pricing patterns, the rules, and the open questions where the zip and the prototype disagree.

Sources: `sloosh-design-system-v4.zip` (DESIGN.md, tokens, the SlooshInk engine) and the v4 pricing prototype.

## Agents only

- `index.html` is generated. Edit the files in `src/`, then run `python3 build.py`.
- `src/vendor/` holds `tokens.css`, `sloosh-ink.css`, `sloosh-ink.js` from the zip, with one local change (Oct 2026):
  critters default to a reduced hand (`hand: 'low'`: flat fill, one outline, no boil); `hand: 'full'` gives the original.
  Search for "DS4 change" in both files. Moving to a newer zip means re-applying that change.
- The 28 doodles are retired from the page; icons will come from Hugeicons.
- `src/specimen.css`, `src/specimen.body.html`, `src/specimen.js` are the page itself. Page classes use the `ds-` prefix;
  engine classes are `sl-` and `ink-`. Every demo calls only the public SlooshInk API.
- Theme: `data-theme="dark|light"` on `<html>`; the switch in the top bar sets it and remembers it per browser.
- Don't wrap the page in `.sl-root`: its `button { font: inherit }` rule overrides the keycap type.

## Colour tokens follow the Sloosh app (Oct 2026)

`src/vendor/tokens.css` now uses the app's names and values (packages/ui `primitive-tokens.css`, `semantic-tokens.css`, the `[data-brand="sloosh"]` block): HSL triples used as `hsl(var(--x))` (`--neutral-*`, `--yellow-*`, `--background`, `--card`, `--muted`, `--foreground`, `--muted-foreground`, `--border`, `--brand-accent*`, status) and full colours used as `var(--x)` (`--layer-*`, `--brand-accent-subtle`, `--brand-accent-chip`, overlays). The old `--sl-*` colour names are gone. DS4-only tokens, not in the app yet: `--yellow-600` (#D9AA0A, card shadow on yellow), `--orange-400`, `--glow-*`, `--brand-accent-glow`, `--data-*`, `--sticker-*`, `--ink-*`. Non-colour tokens (type, motion, radius, space, shadows) keep their `--sl-` names for now.

Buttons: one size scale for every style, 24 / 28 / 32 / 36 / 40 / 48 (`data-size`), radius 12 at every size. Tabs outside the top nav: a dark well with equal-width segments, the selected one muted.
