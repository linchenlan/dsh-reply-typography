window.__ModuleLoader__.load({
	id: "dsh-reply-typography",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		const React = require("react");
		const ReactDOM = require("react-dom");
		//#region src/client/index.ts
		/**
		 * 阅读排版 — reply & sidebar typography settings for the dsh web GUI.
		 *
		 * Sidebar-foot "字体设置" action (sidebar.footer.action) toggling a
		 * novel-reader style popup (shell.overlay) with a target switch at the
		 * bottom: 「回复」(AI reply markdown) and 「侧边栏」(left column). Each
		 * target keeps its own font size / line height / letter spacing /
		 * paragraph gap / typeface profile.
		 *
		 * All values ride the theme override layer (theme.overrideTokens); the
		 * owned static stylesheet maps them onto the markdown surface and onto
		 * the sidebar column via the data-pane="sidebar" shim attribute. Choices
		 * persist through localStorage.
		 */

		const SOURCE = "dsh-reply-typography";
		const VERSION = "0.4.0";
		const STORE_KEY = "reply-typography.v2";
		// Pre-v0.3.1 state key — migrated once, then removed.
		const STORE_KEY_LEGACY = "reply-typography.v1";
		// `small` = the reasoning ("Think") block's own font size; it shares the
		// reply line-height ratio and letter spacing. `rows` = dedicated vertical
		// spacing between stacked tool-call cards. `tgap` = extra vertical space
		// above/below every reasoning row (0 = the harness's own flow gap).
		// STOCK = the OFFICIAL product metrics of the 2026-09 harness build
		// (assistant 14/24, secondary small text 13px in a 24px row box,
		// reasoning 13/20, code 11/16, sidebar 14) — slider midpoints sit
		// exactly here, so ×1.00 renders identically to a plugin-free install.
		const STOCK_LH = 24 / 14;
		const REPLY_STOCK = { px: 14, lh: STOCK_LH, fam: 0, ls: 0, pgap: 16, small: 13, rows: 0, tgap: 0 };
		const SIDE_STOCK = { px: 14, lh: 1.7, fam: 0, ls: 0 };
		const SIDE_DEFAULT = { px: 14, lh: 1.7, fam: 0, ls: 0 };

		const FAMILIES = [
			{ label: "系统默认", value: "var(--dsw-font-family)" },
			{ label: "微软雅黑", value: "'Microsoft YaHei', 'PingFang SC', sans-serif" },
			{ label: "思源黑体", value: "'Noto Sans SC', 'Source Han Sans SC', 'Microsoft YaHei', sans-serif" },
			{ label: "思源宋体", value: "'Noto Serif SC', 'Source Han Serif SC', 'SimSun', serif" },
			{ label: "宋体", value: "'SimSun', 'Songti SC', serif" },
			{ label: "楷体", value: "'KaiTi', 'STKaiti', serif" },
			{ label: "苹方", value: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif" }
		];

		/** Opaque popup palette per color scheme — skins render alias surfaces translucent. */
		const PALETTE = {
			light: { card: "#ffffff", border: "#e2e4e9", field: "#f5f6f7", fieldBorder: "#c9ccd4", title: "#111318", text: "#2f3237", sub: "#697077" },
			dark: { card: "#1b1b1f", border: "#34353b", field: "#26262b", fieldBorder: "#45464e", title: "#f2f3f5", text: "#d6d8dd", sub: "#9aa0a8" }
		};

		function clamp(value, min, max, fallback) {
			const n = Number(value);
			if (!Number.isFinite(n)) return fallback;
			return Math.min(max, Math.max(min, n));
		}

		function normalizeProfile(raw, stock, defaults) {
			if (raw === null || typeof raw !== "object") raw = {};
			const out = {};
			for (const key in stock) {
				const range = RANGES[key] || [-1e9, 1e9];
				const roundIt = key === "px" || key === "pgap" || key === "fam" || key === "small" || key === "rows" || key === "tgap";
				let v = clamp(raw[key], range[0], range[1], defaults ? defaults[key] : stock[key]);
				out[key] = roundIt ? Math.round(v) : v;
			}
			return out;
		}

		// Every range is symmetric around the OFFICIAL stock value: the product
		// default sits at the slider midpoint, giving equal room to shrink and
		// to grow. Reply body 16px (ratio 1.75 → 28px), think & tool small text
		// 14px, sidebar 14px (ratio 1.7 → ~24px).
		const RANGES = {
			px: [6, 22],
			lh: [0.5, 3.0],
			fam: [0, FAMILIES.length - 1],
			ls: [-6, 6],
			pgap: [-16, 48],
			small: [6, 20],
			rows: [-16, 16],
			tgap: [-8, 24]
		};
		/** Slider ranges per target; keys not listed reuse RANGES.
		 * Reply px 6–22 centers on stock 14; sidebar px 6–22 centers on 14;
		 * reply lh 0.5–3.0 centers on stock 24/14 ≈ 1.71; sidebar lh centers 1.7. */
		const TARGET_RANGES = {
			reply: { px: [6, 22], lh: [0.5, 3.0] },
			sidebar: { px: [6, 22], lh: [0.5, 2.9] }
		};

		function loadSaved() {
			const defaults = { target: "reply", reply: { ...REPLY_STOCK, px: 16 }, sidebar: { ...SIDE_DEFAULT } };
			try {
				let raw = window.localStorage.getItem(STORE_KEY);
				let migrated = false;
				if (!raw) {
					raw = window.localStorage.getItem(STORE_KEY_LEGACY);
					migrated = typeof raw === "string" && raw.length > 0;
				}
				if (raw) {
					const o = JSON.parse(raw);
					if (o !== null && typeof o === "object") {
						let out;
						if (o.reply || o.sidebar) {
							out = {
								target: o.target === "sidebar" ? "sidebar" : "reply",
								reply: normalizeProfile(o.reply, REPLY_STOCK),
								sidebar: normalizeProfile(o.sidebar, SIDE_STOCK, SIDE_DEFAULT)
							};
						} else if (o.px !== undefined) {
							// Legacy flat layout: treat it as the reply profile.
							out = {
								target: "reply",
								reply: normalizeProfile(o, REPLY_STOCK),
								sidebar: { ...SIDE_DEFAULT }
							};
						}
						if (out !== undefined) {
							if (migrated === true) {
								try {
									window.localStorage.setItem(STORE_KEY, JSON.stringify({ target: out.target, reply: out.reply, sidebar: out.sidebar }));
									window.localStorage.removeItem(STORE_KEY_LEGACY);
								} catch { /* best effort */ }
							}
							return out;
						}
					}
				}
			} catch {
				// localStorage unavailable (privacy mode, file origin) — defaults only.
			}
			return defaults;
		}

		function save(s) {
			try {
				window.localStorage.setItem(STORE_KEY, JSON.stringify({ target: s.target, reply: s.reply, sidebar: s.sidebar }));
			} catch {
				// Best-effort persistence only.
			}
		}

		/** The theme service face, captured in apply() (declared via exports.inject). */
		let ctxTheme = null;

		// Shared settings store: every seat renders from this one object.
		const state = { open: false, scheme: "light", ...loadSaved() };
		const subs = new Set();
		function notify() {
			subs.forEach((fn) => fn());
		}
		function setState(patch) {
			let changed = false;
			for (const k in patch) {
				if (state[k] !== patch[k]) {
					state[k] = patch[k];
					changed = true;
				}
			}
			if (!changed) return;
			save(state);
			pushTokens();
			notify();
		}
		/** Patch the active target's profile and refresh. */
		function setProfile(patch) {
			setState({ [state.target]: { ...state[state.target], ...patch } });
		}
		function subscribe(fn) {
			subs.add(fn);
			return () => subs.delete(fn);
		}
		function useSettings() {
			const st = React.useState(0);
			React.useEffect(function () {
				return subscribe(function () {
					st[1](function (x) {
						return x + 1;
					});
				});
			}, []);
			return state;
		}

		function readScheme() {
			try {
				const snap = ctxTheme !== null ? ctxTheme.getTheme() : undefined;
				const active = snap && snap.active;
				const id = active && (active.id || active.activeId);
				return id === "dark" ? "dark" : "light";
			} catch {
				return "light";
			}
		}

		const pair = (v) => ({ light: v, dark: v });

		function fontTokens() {
			const r = state.reply;
			const sd = state.sidebar;
			const size = r.px + "px";
			const line = Math.round(r.px * r.lh) + "px";
			const fam = FAMILIES[r.fam].value;
			const t = {};
			t["--dsw-font-markdown-base"] = pair(size + "/" + line + " " + fam);
			t["--dsw-font-markdown-base-strong"] = pair("600 " + size + "/" + line + " " + fam);
			t["--dsw-font-markdown-base-italic"] = pair("italic " + size + "/" + line + " " + fam);
			t["--dsw-font-markdown-base-strong-italic"] = pair("italic 600 " + size + "/" + line + " " + fam);
			t["--dsw-font-markdown-base-font-size"] = pair(size);
			t["--dsw-font-markdown-base-line-height"] = pair(line);
			t["--dsw-font-markdown-base-strong-font-size"] = pair(size);
			t["--dsw-font-markdown-base-strong-line-height"] = pair(line);
			t["--dsw-font-markdown-base-italic-font-size"] = pair(size);
			t["--dsw-font-markdown-base-italic-line-height"] = pair(line);
			t["--dsw-font-markdown-base-strong-italic-font-size"] = pair(size);
			t["--dsw-font-markdown-base-strong-italic-line-height"] = pair(line);
			t["--dsw-font-markdown-base-font-family"] = pair(fam);
			// Headings keep the OFFICIAL 2026-09 metrics (21/30, 19/28, 18/26,
			// 14/24); only the typeface swaps when a custom family is picked.
			const heads = [
				["--dsw-font-markdown-h1", "700", 21, 30],
				["--dsw-font-markdown-h2", "700", 19, 28],
				["--dsw-font-markdown-h3", "700", 18, 26],
				["--dsw-font-markdown-h4", "600", 14, 24]
			];
			heads.forEach(function (h) {
				t[h[0]] = pair(h[1] + " " + h[2] + "px/" + h[3] + "px " + fam);
				t[h[0] + "-font-family"] = pair(fam);
			});
			// Letter/paragraph spacing ride our own variables (no stock token exists);
			// the owned stylesheet below consumes them with stock-matching fallbacks.
			t["--reply-typography-letter-spacing"] = pair(r.ls === 0 ? "normal" : r.ls + "px");
			// 段距 slider is a RATIO around the official vertical rhythm (16 →
			// ×1.00). Every markdown gap — paragraphs, list items, headings,
			// hr / quote / pre — scales from its OWN stock value (extracted from
			// the served bundle), so one slider step tightens the whole reply
			// evenly instead of squashing paragraphs while lists stay put.
			t["--rt-gap"] = pair(String(Math.round((r.pgap / 16) * 1000) / 1000));
			// Sidebar target profile (consumed by the owned stylesheet).
			t["--rt-side-size"] = pair(sd.px + "px");
			t["--rt-side-line"] = pair(Math.round(sd.px * sd.lh) + "px");
			t["--rt-side-ls"] = pair(sd.ls === 0 ? "normal" : sd.ls + "px");
			t["--rt-side-family"] = pair(FAMILIES[sd.fam].value);
			// Small text ladder: the 2026-09 harness separates the ROW line
			// (24px), the REASONING line (20px), the CODE line (16px) and the
			// user BUBBLE line (22px) from the body line. Each is derived from
			// the same 行距 ratio, so ×1.00 reproduces the official rendering
			// exactly while one slider still scales the whole reply evenly.
			const lhRatio = r.lh / STOCK_LH;
			const smallLine = Math.round(24 * lhRatio) + "px";
			const thinkLine = Math.round(20 * lhRatio) + "px";
			const codeLine = Math.round(16 * lhRatio) + "px";
			const bubbleLine = Math.round(22 * lhRatio) + "px";
			t["--reply-typography-small-size"] = pair(r.small + "px");
			t["--reply-typography-small-line"] = pair(smallLine);
			t["--reply-typography-think-line"] = pair(thinkLine);
			t["--reply-typography-code-line"] = pair(codeLine);
			t["--reply-typography-bubble-line"] = pair(bubbleLine);
			// 工具行距 slider is a RATIO as well: 0 → ×1.00 (stock flush rows).
			// Stacked call rows, sub-call stacks and expanded bodies each scale
			// from their own stock spacing (decoupled from 段距 — the old
			// sub-call rule wrongly derived from the paragraph-gap variable).
			t["--rt-row-scale"] = pair(String(Math.round((1 + r.rows / 16) * 1000) / 1000));
			// 思考行距: additive px around every reasoning row. The harness
			// groups a turn's process (think + tools) into one `turn-process`
			// node whose inner rows are spaced by --dsh-chat-flow-gap; our
			// margins add to (or pull from) that rhythm, 0 = untouched.
			t["--rt-think-gap"] = pair(r.tgap + "px");
			return t;
		}

		/**
		 * Static plumbing that maps our variables onto the reading surfaces.
		 * The sidebar column carries data-pane="sidebar" — stamped by the
		 * web-ui-all column shim when present, and by our own shim below
		 * otherwise, so plain installs get the same hook.
		 */
		const SURFACE_CSS = [
			'[class*="_markdown_"]{letter-spacing:var(--reply-typography-letter-spacing,normal)}',
			// ---------- 段距: proportional gap family ----------
			// One ratio (--rt-gap, 16 → ×1.00) scales EVERY markdown vertical
			// gap from its own stock value (extracted from the served bundle):
			// p 16 · ul/ol 16 · li+6 · nested list 4 · li>p 8 · h1-3 32/16 ·
			// h4-6 16 · hr 32 · blockquote 16 · pre 16. Specificity stays above
			// the stock rules (double [class*] ≥ their single class) WITHOUT
			// !important, so the stock first/last-child trims (which DO use
			// !important) keep winning. Order matters for the equal-specificity
			// adjacent/has refinements — they must follow the general rules.
			'[class*="_markdown_"][class*="_markdown_"] p{margin:calc(16px*var(--rt-gap,1)) 0}',
			'[class*="_markdown_"][class*="_markdown_"] :where(ul,ol){margin:calc(16px*var(--rt-gap,1)) 0}',
			'[class*="_markdown_"][class*="_markdown_"] li:not(:first-child){margin-top:calc(6px*var(--rt-gap,1))}',
			'[class*="_markdown_"][class*="_markdown_"] li>:where(ul,ol){margin-top:calc(4px*var(--rt-gap,1))}',
			'[class*="_markdown_"][class*="_markdown_"] li>p{margin:calc(8px*var(--rt-gap,1)) 0}',
			'[class*="_markdown_"][class*="_markdown_"] :where(h1,h2,h3){margin:calc(32px*var(--rt-gap,1)) 0 calc(16px*var(--rt-gap,1))}',
			'[class*="_markdown_"][class*="_markdown_"] :where(h4,h5,h6){margin:calc(16px*var(--rt-gap,1)) 0}',
			'[class*="_markdown_"][class*="_markdown_"] :where(h4,h5,h6)+:where(ul,ol){margin-top:calc(8px*var(--rt-gap,1))}',
			'[class*="_markdown_"][class*="_markdown_"] :where(h4,h5,h6):has(+ :where(ul,ol)){margin-bottom:calc(8px*var(--rt-gap,1))}',
			'[class*="_markdown_"][class*="_markdown_"] hr{margin:calc(32px*var(--rt-gap,1)) 0}',
			'[class*="_markdown_"][class*="_markdown_"] blockquote{margin:calc(16px*var(--rt-gap,1)) 0 0}',
			'[class*="_markdown_"][class*="_markdown_"] pre{margin:calc(16px*var(--rt-gap,1)) 0}',
			// Sidebar target: the size is set on the COLUMN so text inherits, and
			// forced only on plain text containers. Spans/buttons are deliberately
			// left alone — the 2026-09 sidebar carries chrome with its own
			// explicit sizes (brand name 18px/24px, build-version badge ~6px in a
			// 10px box) which the old blanket descendant rule out-specified and
			// mangled.
			'[data-pane="sidebar"]{font-family:var(--rt-side-family,var(--dsw-font-family));font-size:var(--rt-side-size,13px);line-height:var(--rt-side-line,18px);letter-spacing:var(--rt-side-ls,normal)}',
			[
				'[data-pane="sidebar"] p',
				'[data-pane="sidebar"] a',
				'[data-pane="sidebar"] label',
				'[data-pane="sidebar"] input',
				'[data-pane="sidebar"] div'
			].join(",") + '{font-size:var(--rt-side-size,13px);line-height:var(--rt-side-line,18px);letter-spacing:var(--rt-side-ls,normal)}',
			// Rounded custom dropdown option hover highlight.
			'[data-reply-typography-option]{border-radius:8px;margin:3px 4px;padding:7px 10px;font-size:13px;cursor:pointer}',
			'[data-reply-typography-option]:hover{background:rgba(127,127,127,.14)}',
			// Reasoning ("Think") text: same treatment as the tool rows. The
			// 2026-09 build renders the body as MarkdownText variant="compact",
			// whose OWN root rule (`._compact_…{font-size:…secondary;line-height:
			// calc(20px + delta-secondary)}`) beats an inherited value — so the
			// wrapper rule alone silently stopped controlling the text. Both
			// selectors are kept: the wrapper (padding/letter-spacing) and the
			// compact markdown child (the actual text).
			'[class*="thinkBody"],[data-variant="think"] [class*="_markdown_"]{font-size:var(--reply-typography-small-size,13px)!important;line-height:var(--reply-typography-think-line,20px)!important;letter-spacing:var(--reply-typography-letter-spacing,normal)!important}',
			// Tool-call row small text (Read/Edit/Pwsh summaries, file links,
			// error lines): own size, reply-driven line height and letter
			// spacing. Semantic suffixes survive css-module hashing.
			[
				'[class*="_summary"]',
				'[class*="summarySuffix"]',
				'[class*="fileLink"]',
				'[class*="errorSummary"]'
			].join(",") + '{font-size:var(--reply-typography-small-size,13px)!important;line-height:var(--reply-typography-small-line,24px)!important;letter-spacing:var(--reply-typography-letter-spacing,normal)!important}',
			// The user's own sent messages (chat bubble): follow the MAIN 字号 and
			// the official bubble line (22px at stock, not the body line).
			// Scoped to the chat user row — the 2026-09 build also has `_bubble`
			// classes in the question-reply view and in the tooltip primitive,
			// which must keep their own sizes.
			'[class*="_userRow"] [class*="_bubble"]{font-size:var(--dsw-font-markdown-base-font-size,14px)!important;line-height:var(--reply-typography-bubble-line,22px)!important;letter-spacing:var(--reply-typography-letter-spacing,normal)!important;font-family:var(--dsw-font-markdown-base-font-family,var(--ds-font-family-sans))!important}',
			// The tool-name label ("Read" / "Edit" / …): a _title that has a
			// _summary sibling after it — :has() keeps page-level titles out.
			[
				'[class*="_title"]:has(~ [class*="_summary"])',
				'[class*="_title"]:has(~ [class*="fileLink"])'
			].join(",") + '{font-size:var(--reply-typography-small-size,13px)!important;line-height:var(--reply-typography-small-line,24px)!important;letter-spacing:var(--reply-typography-letter-spacing,normal)!important}',
			// Row-leading icons scale with the small text (svg sized in em).
			'[class*="_leading"],[class*="_iconIdle"]{font-size:var(--reply-typography-small-size,13px)!important;line-height:1!important}',
			'[class*="_leading"] svg,[class*="_iconIdle"] svg{width:1em!important;height:1em!important}',
			// NOTE: the old `[class*="_root"]:has([class*="_summary"]){height:auto}`
			// unlock was REMOVED in v0.3.1. The 2026-09 build locks the collapsed
			// reasoning row with `contain:size layout;height:calc(24px + delta)`
			// — the ONLY `contain:size` in the whole build — and forcing
			// `height:auto` on a size-contained box resolves it to 0 height, so
			// the collapsed Think row could vanish. The row box the plugin meant
			// to unlock is no longer `_root` either, so the rule bought nothing.
			'[class*="_leading"]{width:auto!important;height:auto!important;min-width:1em}',
			// 思考行距: the reasoning row's own root carries data-variant="think"
			// (stable across the 2026-09 harness rewrite, which now groups a
			// turn's process into a `turn-process` node spaced by
			// --dsh-chat-flow-gap). Margins on the row itself widen or tighten
			// the gap between the Think row and its neighbours, leaving the
			// harness's global flow rhythm untouched at 0.
			'[data-variant="think"]{margin-top:var(--rt-think-gap,0px)!important;margin-bottom:var(--rt-think-gap,0px)!important}',
			// Sub-call stack spacing: stock gap 4px / margin 4-0-2-22, scaled by
			// the 工具行距 ratio (was wrongly derived from 段距 before v0.6.0).
			'[class*="_subCalls"]{gap:calc(4px*var(--rt-row-scale,1))!important;margin:calc(4px*var(--rt-row-scale,1)) 0 calc(2px*var(--rt-row-scale,1)) 22px!important}',
			// Stacked tool rows: stock sits flush (margin-top 0); the ratio adds
			// breathing room around that — ×0.00 pulls rows tight, ×2.00 gives
			// 8px between rows.
			'[class*="_callRow"]{margin-top:calc(8px*(var(--rt-row-scale,1) - 1))!important}',
			// Expanded bodies (io cards, code/terminal/diff/read/search/web
			// output) keep their stock 4px vertical rhythm and scale with the
			// same ratio; the 4px left indent stays fixed. The body variants
			// below were split out by the 2026-09 build — they all share the
			// harness's `margin:4px 0 4px 4px`, so they scale here too.
			// (`recovery` is gone from the new build: only `searchRecovery`
			// remains, which is already covered.)
			[
				'[class*="ioCard"]',
				'[class*="codeBody"]',
				'[class*="terminalBody"]',
				'[class*="diffBody"]',
				'[class*="readBody"]',
				'[class*="searchBody"]',
				'[class*="webBody"]',
				'[class*="imageBody"]',
				'[class*="_terminal"]:not([class*="terminalBody"])',
				'[class*="searchRecovery"]'
			].join(",") + '{margin:calc(4px*var(--rt-row-scale,1)) 0 calc(4px*var(--rt-row-scale,1)) 4px!important}',
			// Expandable bodies — code output, io card text, terminal, search
			// notes — follow the small-text size / line height / letter spacing.
			[
				'[class*="ioCard"]',
				'[class*="ioText"]',
				'[class*="ioLabel"]',
				'[class*="codeBody"]',
				'[class*="terminalBody"]',
				'[class*="diffBody"]',
				'[class*="readBody"]',
				'[class*="searchBody"]',
				'[class*="webBody"]',
				'[class*="imageBody"]',
				'[class*="_terminal"]:not([class*="terminalBody"])',
				'[class*="searchRecovery"]'
			].join(",") + '{font-size:calc(var(--reply-typography-small-size,13px) - 2px)!important;line-height:var(--reply-typography-code-line,16px)!important;letter-spacing:var(--reply-typography-letter-spacing,normal)!important}',
			// The terminal component reads its own line-height custom property.
			'[class*="terminalBody"],[class*="_terminal"]:not([class*="terminalBody"]){--dsl-terminal-line-height:var(--reply-typography-code-line,16px)!important}'
		].join("\n");

		let styleEl = null;
		function ensureSurfaceCss() {
			if (styleEl !== null && styleEl.isConnected) return;
			styleEl = document.createElement("style");
			styleEl.setAttribute("data-reply-typography", "");
			styleEl.textContent = SURFACE_CSS;
			document.head.appendChild(styleEl);
		}

		// ---------- data-pane="sidebar" shim ----------
		// The sidebar stylesheet hooks [data-pane="sidebar"], which the
		// web-ui-all family stamps onto the core layout's sidebar column.
		// Stamp it ourselves too, so the sidebar target also works on plain
		// installs (e.g. a bare `web` profile without that family); idempotent
		// when their shim is already present. Owned: the observer disconnects
		// and our attributes are removed on dispose.
		let stampedPanes = [];
		let paneCache = [];
		function stampSidebarPane() {
			const cols = document.querySelectorAll('[class*="sidebarCol"]');
			// Identity compare against the previous scan: when the column set is
			// unchanged (the common case — including every streaming frame) this
			// costs two small queries and ZERO DOM writes.
			let same = cols.length === paneCache.length;
			if (same) {
				for (let i = 0; i < cols.length; i++) {
					if (cols[i] !== paneCache[i]) { same = false; break; }
				}
			}
			if (same) return;
			paneCache = [];
			for (let i = 0; i < cols.length; i++) {
				const el = cols[i];
				if (el.getAttribute("data-pane") !== "sidebar") {
					el.setAttribute("data-pane", "sidebar");
					stampedPanes.push(el);
				}
				paneCache.push(el);
			}
		}
		// ---------- shared DOM watch ----------
		// ONE document-wide MutationObserver drives the sidebar pane stamp.
		// Mutation bursts — streaming churns the DOM constantly — coalesce
		// into at most one scan per animation frame, and the scan early-exits
		// on an unchanged result, so steady-state streaming costs one small
		// query per frame with zero DOM writes and zero style invalidation.
		let domObserver = null;
		let domRaf = 0;
		function scheduleDomScan() {
			if (domRaf !== 0) return;
			domRaf = requestAnimationFrame(function () {
				domRaf = 0;
				stampSidebarPane();
			});
		}
		function startDomWatch() {
			stampSidebarPane();
			if (domObserver === null && typeof MutationObserver === "function") {
				domObserver = new MutationObserver(scheduleDomScan);
				domObserver.observe(document.documentElement, { childList: true, subtree: true });
			}
		}
		function stopDomWatch() {
			if (domRaf !== 0) { cancelAnimationFrame(domRaf); domRaf = 0; }
			if (domObserver !== null) {
				domObserver.disconnect();
				domObserver = null;
			}
			stampedPanes.forEach(function (el) {
				if (el.getAttribute("data-pane") === "sidebar") el.removeAttribute("data-pane");
			});
			stampedPanes = [];
			paneCache = [];
		}

		let disposeOverride = null;
		function pushTokens() {
			if (disposeOverride !== null) {
				disposeOverride();
				disposeOverride = null;
			}
			if (ctxTheme === null) return;
			disposeOverride = ctxTheme.overrideTokens(SOURCE, fontTokens());
		}

		// ---------- shared small pieces ----------
		const rowStyle = { marginBottom: 14 };

		function SliderRow(props) {
			return React.createElement("div", { style: rowStyle },
				React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
					React.createElement("span", { style: { fontSize: 12, color: props.palette.sub } }, props.label),
					React.createElement("span", { style: { fontSize: 12, color: props.palette.text, fontVariantNumeric: "tabular-nums" } }, props.text)
				),
				React.createElement("input", { type: "range", min: props.min, max: props.max, step: props.step, value: props.value, onChange: props.onChange, style: { width: "100%", accentColor: "#3964fe" } })
			);
		}

		/**
		 * Rounded custom dropdown for the typeface — rendered through a portal
		 * into document.body with fixed positioning, so the popup's scroll
		 * container never clips it. Flips upward when the space below is tight.
		 */
		function FamilyRow(props) {
			const openSt = React.useState(false);
			const open = openSt[0];
			const setOpen = openSt[1];
			const posSt = React.useState(null);
			const pos = posSt[0];
			const setPos = posSt[1];
			const rootRef = React.useRef(null);
			const btnRef = React.useRef(null);
			const menuRef = React.useRef(null);
			React.useEffect(function () {
				if (!open) return undefined;
				function onDoc(e) {
					const inRoot = rootRef.current !== null && rootRef.current.contains(e.target) === true;
					const inMenu = menuRef.current !== null && menuRef.current.contains(e.target) === true;
					if (inRoot === false && inMenu === false) setOpen(false);
				}
				function onReposition() { setOpen(false); }
				document.addEventListener("pointerdown", onDoc);
				window.addEventListener("scroll", onReposition, true);
				window.addEventListener("resize", onReposition);
				return function () {
					document.removeEventListener("pointerdown", onDoc);
					window.removeEventListener("scroll", onReposition, true);
					window.removeEventListener("resize", onReposition);
				};
			}, [open]);
			const pal = props.palette;
			function toggle() {
				if (open) {
					setOpen(false);
					return;
				}
				const rect = btnRef.current.getBoundingClientRect();
				const below = window.innerHeight - rect.bottom > 268;
				setPos({
					left: rect.left,
					width: Math.max(rect.width, 200),
					top: below ? rect.bottom + 4 : undefined,
					bottom: below ? undefined : window.innerHeight - rect.top + 4
				});
				setOpen(true);
			}
			return React.createElement("div", { style: rowStyle, ref: rootRef },
				React.createElement("div", { style: { fontSize: 12, color: pal.sub, marginBottom: 4 } }, "字体"),
				React.createElement("button", {
					type: "button",
					ref: btnRef,
					onClick: toggle,
					style: {
						width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
						padding: "5px 10px", borderRadius: 8,
						border: "1px solid " + (open ? "#3964fe" : pal.fieldBorder),
						background: pal.field, color: pal.text, fontSize: 13, cursor: "pointer", outline: "none"
					}
				},
					React.createElement("span", null, FAMILIES[props.value].label),
					React.createElement("span", { style: { fontSize: 9, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" } }, "▼")
				),
				open && pos !== null ? ReactDOM.createPortal(
					React.createElement("div", {
						ref: menuRef,
						style: {
							position: "fixed", left: pos.left, width: pos.width,
							top: pos.top, bottom: pos.bottom,
							background: pal.card, border: "1px solid " + pal.fieldBorder,
							borderRadius: 10, overflowY: "auto", maxHeight: 260, padding: 2,
							boxShadow: "0 8px 24px rgba(0,0,0,.22)", zIndex: 10000
						}
					}, FAMILIES.map(function (f, i) {
						const selected = i === props.value;
						const optionStyle = { color: pal.text };
						if (selected) {
							optionStyle.color = "#3964fe";
							optionStyle.fontWeight = 600;
							optionStyle.background = "rgba(57,100,254,.10)";
						}
						return React.createElement("div", {
							key: i,
							"data-reply-typography-option": "",
							style: optionStyle,
							onClick: function () { setOpen(false); props.onChange(i); }
						}, f.label, selected ? React.createElement("span", { style: { float: "right" } }, "✓") : null);
					})),
					document.body
				) : null
			);
		}

		function PreviewBox(props) {
			const s = useSettings();
			const prof = s[s.target];
			const kids = ["春风得意马蹄疾，一日看尽长安花。The quick brown fox jumps over the lazy dog."];
			if (s.target === "reply") {
				kids.push(React.createElement("div", {
					key: "small",
					style: {
						marginTop: Math.max(4, Math.round(prof.pgap / 2)),
						fontSize: prof.small,
						// Same derivation as the real reasoning text: the official
						// think line is 20px, scaled by the 行距 ratio.
						lineHeight: Math.round(20 * (prof.lh / (24 / 14))) + "px",
						letterSpacing: prof.ls === 0 ? "normal" : prof.ls + "px",
						opacity: 0.72
					}
				}, "思考小字预览 Reasoning small text."));
			}
			return React.createElement("div", {
				style: {
					border: "1px solid " + props.palette.border, borderRadius: 8,
					padding: "8px 10px", marginTop: 4, marginBottom: 14,
					fontFamily: FAMILIES[prof.fam].value === "var(--dsw-font-family)" ? undefined : FAMILIES[prof.fam].value,
					fontSize: prof.px, lineHeight: Math.round(prof.px * prof.lh) + "px",
					letterSpacing: prof.ls === 0 ? "normal" : prof.ls + "px",
					color: props.palette.text, overflowWrap: "break-word"
				}
			}, kids);
		}

		function Controls() {
			const s = useSettings();
			const pal = PALETTE[s.scheme] || PALETTE.light;
			const prof = s[s.target];
			const ranges = TARGET_RANGES[s.target] || {};
			const rangeOf = function (key) { return ranges[key] || RANGES[key]; };
			const isReply = s.target === "reply";
			return React.createElement("div", null,
				React.createElement(PreviewBox, { palette: pal }),
				React.createElement(SliderRow, { palette: pal, label: "字号", min: rangeOf("px")[0], max: rangeOf("px")[1], step: 1, value: prof.px, text: prof.px + "px", onChange: function (e) { setProfile({ px: Number(e.target.value) }); } }),
				isReply ? React.createElement(SliderRow, { palette: pal, label: "小字字号", min: RANGES.small[0], max: RANGES.small[1], step: 1, value: prof.small, text: prof.small + "px", onChange: function (e) { setProfile({ small: Number(e.target.value) }); } }) : null,
				React.createElement(SliderRow, { palette: pal, label: "行距", min: rangeOf("lh")[0], max: rangeOf("lh")[1], step: 0.05, value: prof.lh, text: Math.round(prof.px * prof.lh) + "px (" + prof.lh.toFixed(2) + "x)", onChange: function (e) { setProfile({ lh: Number(e.target.value) }); } }),
				React.createElement(SliderRow, { palette: pal, label: "字距", min: RANGES.ls[0], max: RANGES.ls[1], step: 0.25, value: prof.ls, text: prof.ls === 0 ? "标准" : prof.ls + "px", onChange: function (e) { setProfile({ ls: Number(e.target.value) }); } }),
				isReply ? React.createElement(SliderRow, { palette: pal, label: "段距(整体等比)", min: RANGES.pgap[0], max: RANGES.pgap[1], step: 1, value: prof.pgap, text: "×" + (prof.pgap / 16).toFixed(2), onChange: function (e) { setProfile({ pgap: Number(e.target.value) }); } }) : null,
				isReply ? React.createElement(SliderRow, { palette: pal, label: "工具行距(整体等比)", min: RANGES.rows[0], max: RANGES.rows[1], step: 1, value: prof.rows, text: "×" + (1 + prof.rows / 16).toFixed(2), onChange: function (e) { setProfile({ rows: Number(e.target.value) }); } }) : null,
				isReply ? React.createElement(SliderRow, { palette: pal, label: "思考行距", min: RANGES.tgap[0], max: RANGES.tgap[1], step: 1, value: prof.tgap, text: prof.tgap === 0 ? "官方" : (prof.tgap > 0 ? "+" + prof.tgap + "px" : prof.tgap + "px"), onChange: function (e) { setProfile({ tgap: Number(e.target.value) }); } }) : null,
				React.createElement(FamilyRow, { palette: pal, value: prof.fam, onChange: function (i) { setProfile({ fam: i }); } }),
				React.createElement("div", { style: { display: "flex", gap: 8 } },
					React.createElement("button", {
						onClick: function () { setProfile({ ...(isReply ? REPLY_STOCK : SIDE_STOCK) }); },
						style: { appearance: "none", border: "1px solid " + pal.fieldBorder, cursor: "pointer", background: pal.field, color: pal.text, borderRadius: 6, padding: "4px 12px", fontSize: 12, lineHeight: "18px" }
					}, "恢复默认")
				)
			);
		}

		/** Bottom scope switch: which surface the sliders edit. */
		function TargetSwitch(props) {
			const s = useSettings();
			const pal = props.palette;
			function seg(id, label) {
				const active = s.target === id;
				return React.createElement("button", {
					key: id,
					onClick: function () { setState({ target: id }); },
					style: {
						flex: 1, padding: "5px 0", borderRadius: 8, cursor: "pointer", fontSize: 12,
						border: "1px solid " + (active ? "#3964fe" : pal.fieldBorder),
						background: active ? "rgba(57,100,254,.14)" : pal.field,
						color: active ? "#3964fe" : pal.text
					}
				}, label);
			}
			return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 4, borderTop: "1px solid " + pal.border, paddingTop: 12 } },
				React.createElement("span", { style: { flex: "none", fontSize: 12, color: pal.sub } }, "作用于"),
				seg("reply", "回复"),
				seg("sidebar", "左侧边栏")
			);
		}

		// ---------- shell.overlay popup (novel-reader style, draggable header) ----------
		const POS_KEY = "reply-typography.pos.v1";
		function loadPopupPos() {
			try {
				const raw = window.localStorage.getItem(POS_KEY);
				if (raw) {
					const o = JSON.parse(raw);
					if (o !== null && typeof o === "object" && Number.isFinite(o.left) && Number.isFinite(o.top)) {
						return { left: o.left, top: o.top };
					}
				}
			} catch {
				// Best-effort persistence only.
			}
			return null;
		}
		function TypographyPopup() {
			const s = useSettings();
			const pal = PALETTE[s.scheme] || PALETTE.light;
			const rootRef = React.useRef(null);
			const posSt = React.useState(loadPopupPos);
			const pos = posSt[0];
			const setPos = posSt[1];
			// Escape closes the popup.
			React.useEffect(function () {
				function onKey(e) {
					if (e.key === "Escape") setState({ open: false });
				}
				window.addEventListener("keydown", onKey);
				return function () { window.removeEventListener("keydown", onKey); };
			}, []);
			if (!s.open) return null;
			/** Drag by the header. Coordinates are relative to the overlay layer
			 * (the positioned ancestor), not the viewport — otherwise the panel
			 * jumps by the app-chrome offset on the first move. Double-click resets. */
			function startDrag(e) {
				if (e.button !== undefined && e.button !== 0) return;
				if (e.target !== null && typeof e.target.closest === "function" && e.target.closest("button") !== null) return;
				const el = rootRef.current;
				if (el === null) return;
				e.preventDefault();
				const host = el.offsetParent || document.documentElement;
				const hostRect = host.getBoundingClientRect();
				const rect = el.getBoundingClientRect();
				const offX = e.clientX - rect.left;
				const offY = e.clientY - rect.top;
				document.body.style.userSelect = "none";
				function onMove(ev) {
					const left = Math.round(Math.min(Math.max(ev.clientX - hostRect.left - offX, 0), Math.max(0, hostRect.width - rect.width)));
					const top = Math.round(Math.min(Math.max(ev.clientY - hostRect.top - offY, 0), Math.max(0, hostRect.height - rect.height)));
					setPos({ left: left, top: top });
				}
				function onUp() {
					window.removeEventListener("pointermove", onMove);
					window.removeEventListener("pointerup", onUp);
					document.body.style.userSelect = "";
					setPos(function (p) {
						try { window.localStorage.setItem(POS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
						return p;
					});
				}
				window.addEventListener("pointermove", onMove);
				window.addEventListener("pointerup", onUp);
			}
			function resetPos() {
				try { window.localStorage.removeItem(POS_KEY); } catch { /* ignore */ }
				setPos(null);
			}
			const rootStyle = {
				position: "absolute", width: 296, maxWidth: "calc(100% - 32px)",
				maxHeight: "calc(100% - 32px)", overflowY: "auto", boxSizing: "border-box",
				background: pal.card, border: "1px solid " + pal.border,
				borderRadius: 12, boxShadow: "0 12px 32px rgba(0,0,0,.18)", padding: 14,
				color: pal.text
			};
			if (pos !== null) {
				rootStyle.left = pos.left;
				rootStyle.top = pos.top;
			} else {
				rootStyle.left = 16;
				rootStyle.bottom = 16;
			}
			return React.createElement("div", { ref: rootRef, style: rootStyle },
				React.createElement("div", {
					onPointerDown: startDrag,
					onDoubleClick: resetPos,
					title: "拖动移动位置 · 双击复位",
					style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, cursor: "grab", touchAction: "none", userSelect: "none" }
				},
					React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: pal.title } }, "字体设置 · v" + VERSION),
					React.createElement("button", {
						onClick: function () { setState({ open: false }); },
						"aria-label": "关闭",
						style: { appearance: "none", border: "none", background: "transparent", cursor: "pointer", color: pal.sub, fontSize: 16, lineHeight: 1, padding: 4 }
					}, "×")
				),
				React.createElement(Controls, null),
				React.createElement(TargetSwitch, { palette: pal })
			);
		}

		// ---------- sidebar footer action button ----------
		// Geometry mirrors the core settings trigger (.VOzbGW_trigger / .rail);
		// the default sits flush on top of 「设置」 (bottom margin cancels the
		// trigger's own 4px top margin). No badge — plain text row.
		const ACTIVE_TINT = "rgba(57,100,254,.12)";
		function TypographyFooterAction(props) {
			const s = useSettings();
			const wide = props.wide === true;
			return React.createElement("button", {
				type: "button",
				title: "字体设置",
				"aria-pressed": s.open === true,
				onClick: function () { setState({ open: !s.open }); },
				style: wide ? {
					appearance: "none", border: "none", cursor: "pointer", boxSizing: "border-box",
					width: "calc(100% + 4px)", height: 42,
					display: "flex", alignItems: "center", gap: 8,
					borderRadius: 12, margin: "2px -2px -2px -2px", padding: "0 10px 0 8px",
					background: s.open ? ACTIVE_TINT : "transparent",
					color: s.open ? "#3964fe" : "var(--dsw-alias-label-primary)",
					fontFamily: "inherit", fontSize: 14, lineHeight: "22px", overflow: "hidden"
				} : {
					appearance: "none", border: "none", cursor: "pointer", boxSizing: "border-box",
					width: 36, height: 36, borderRadius: "50%",
					justifyContent: "center", alignItems: "center", gap: 0, display: "flex",
					margin: "0px 0 2px", padding: 0,
					background: s.open ? ACTIVE_TINT : "transparent",
					color: s.open ? "#3964fe" : "var(--dsw-alias-label-primary)",
					fontFamily: "inherit", overflow: "hidden"
				},
				onMouseEnter: function (e) { if (s.open === false) e.currentTarget.style.background = "var(--dsw-alias-interactive-bg-hover)"; },
				onMouseLeave: function (e) { e.currentTarget.style.background = s.open ? ACTIVE_TINT : "transparent"; }
			},
				wide ? React.createElement("span", { style: { whiteSpace: "nowrap", overflow: "hidden" } }, "字体设置") : React.createElement("span", { style: { fontWeight: 600 } }, "字")
			);
		}

		/**
		 * Register the popup and the sidebar-foot toggle for the page lifetime,
		 * own the typography override layer plus the surface stylesheet, and follow
		 * color-scheme flips so the popup stays opaque in both palettes.
		 * @param ctx - client root context (theme declared via exports.inject).
		 */
		function apply(ctx) {
			ctxTheme = ctx.theme;
			state.scheme = readScheme();

			// Own the override layer, the surface stylesheet and the pane shim
			// for the plugin's lifetime; disposal restores product defaults
			// exactly.
			ctx.effect(function () {
				ensureSurfaceCss();
				pushTokens();
				startDomWatch();
				return function () {
					stopDomWatch();
					if (disposeOverride !== null) {
						disposeOverride();
						disposeOverride = null;
					}
					if (styleEl !== null && styleEl.parentNode !== null) styleEl.parentNode.removeChild(styleEl);
					styleEl = null;
				};
			});

			// Follow color-scheme flips so the opaque card tracks light/dark.
			// The event carries the fresh snapshot — read the scheme from it.
			ctx.on("theme/change", function (snap) {
				const a = snap && snap.active;
				const id = a && (a.id || a.activeId);
				setState({ scheme: id === "dark" || id === "light" ? id : readScheme() });
			});

			const slots = ctx.get("slots");
			if (slots === undefined) return;

			slots.inject("shell.overlay", function () {
				return slots.register(
					{ name: "shell.overlay", id: "dsh-reply-typography-popup", order: 50, label: "字体设置" },
					function () { return React.createElement(TypographyPopup); }
				);
			});

			slots.inject("sidebar.footer.action", function () {
				return slots.register(
					{ name: "sidebar.footer.action", id: "dsh-reply-typography", order: 10, label: "字体设置" },
					function (props) { return React.createElement(TypographyFooterAction, props); }
				);
			});
		}

		//#endregion
		/** Required services: the theme registry owns the override layer. */
		const inject = ["theme"];
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
