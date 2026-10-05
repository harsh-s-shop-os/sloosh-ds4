# DS4: the Sloosh V4 design system on one page

Open `index.html` in a browser. It works offline except for the two Google fonts (Bowlby One, Caveat).

What's inside, in this order: type, colour, spacing, shape, buttons, controls, ink, icons, critters, the pointer, the logo, motion, product components, pricing patterns, open questions. Every section runs primitives → tokens or components → usage (any part can be skipped; the order never changes).

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

## Colour: two systems (Oct 2026)

- **shadcn** (`src/vendor/tokens.css`): Figma's "Primitives" (every ramp, incl. `creative-gen-accent-50..800`, the Sloosh yellow, and the separate Tailwind-style `yellow-*`) as HSL triples used as `hsl(var(--x))`, plus the shadcn/ui semantic set with shadcn names (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1..5`, `sidebar-*`). Light values are Figma's "Color System"; dark values are the app's shadcn dark (the Figma paste had light only). Extensions follow the same `x` / `x-foreground` / `x-border` pattern: status, `status-yellow`, `violet` (Figma status/brand), `agent`, `agents-*`, `brand-accent*`, `layer-*`, `data-*`.
- **Brand** (in `tokens.css`): every brand colour sits under `brand-*` on the creative-gen-accent ramp: the yellow (`brand-accent*`), the drawn layer (`brand-line*`, `brand-note*`, `brand-eye-*`, `brand-shadow`; neutral so they follow the theme), glows (`brand-glow*`) and filter accents (`brand-filter-accent-1..6`, straight from the Tailwind ramps). There is no separate ink or marks set.
- Also from Figma: `--rounded-*`, `--spacing-*`, typography tokens and one class per text style (`.text-14px-medium` …), not yet applied to the page.

Buttons: seven styles (primary, secondary, outline, ghost, tinted, default, ink) at 24 / 28 / 32 / 36 / 40 / 48 (`data-size`), radius 12; lip 2px up to 36, 4px at 40 and 48; secondary has no lip; every style has its own disabled state. Icon buttons share the sizes.

## Names (Oct 2026)

Token names follow the older app (`Sloosh-design-main`): type `text-caption`, `text-sm`, `text-base`, `text-text-20`, `text-display-*`, `text-hand-*` (each a full `font` shorthand, unlike the app, where they hold sizes); radius `radius-sm/md/lg/xl/2xl/panel/sheet/full/wobble`; shadows `shadow-float/modal/halo/lip`; motion `motion-duration-*`, `motion-ease-*`, `motion-spring-*`. One type scale for every face: 12 14 16 20 24 36 48 60. Spacing and radii always snap to their scales (ties go up, nothing past the top step). Focus is a 2px outline in `ring`. Pills (nav, filter, filled, credit, savings, cost) are one family at radius 12. Fields: filled 36, bordered 32/40/48, text area, each with `aria-invalid` errors.
