# dsh-reply-typography (字体设置)

Typography plugin for the DSH Web GUI. A sidebar-foot **字体设置** (font settings)
button opens a novel-reader style popup to tune the **AI reply body** and the
**left sidebar**: font size, line height, letter spacing, paragraph gap, tool-row
gap, reasoning-row gap, typeface — with live preview, per-target profiles, and
localStorage persistence.

![Font settings popup](docs/screenshot-popup.png)

The sidebar-foot entry (arrow):

![Sidebar entry](docs/screenshot-process.png)

Spacing sliders (paragraph gap / tool-row gap) are **ratio-based**: one step
scales every element family (paragraphs, lists, headings, tool rows,
sub-call stacks) from its own stock spacing, so the whole reply tightens or
loosens evenly. A separate **reasoning-row gap** slider is additive (-8..+24px, 0 = the harness's own spacing) and controls the gap between each reasoning row and its neighbouring content.

Stock metrics track the current harness build (body 14/24, headings 21/30 · 19/28 · 18/26 · 14/24, secondary 13px, reasoning 20px, code 11/16, bubble 14/22), so the defaults render exactly like a plugin-free install.

See [README.md](./README.md) for the full documentation (Chinese).

## How it works

- Size / line-height / family ride the theme override layer (`theme.overrideTokens`)
  over the `--dsw-font-markdown-*` token family; product stylesheets keep their defaults.
- Letter/paragraph/tool-row/reasoning-row spacing flow through custom properties
  (`--rt-gap` / `--rt-row-scale` / `--rt-think-gap`) consumed by an owned static
  stylesheet; everything is removed exactly on dispose.
- A single document-wide MutationObserver with requestAnimationFrame coalescing and
  result caching keeps the sidebar-pane stamp at one small query per frame with zero
  DOM writes during streaming.
- The sidebar column is hooked via `data-pane="sidebar"`, stamped by the plugin's
  own idempotent shim — no web-ui-all dependency.

## Install

```bash
pnpm --dir <profile dir> add github:linchenlan/dsh-reply-typography
```

## License

MIT
