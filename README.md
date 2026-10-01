# 字体设置 dsh-reply-typography

> DSH Web GUI 的阅读排版外挂插件：字号、行距、字距、段距、工具行距、思考行距、字体全部可调，滑杆以官方默认值为中点对称可调，随时一键恢复默认。

![字体设置弹窗](docs/screenshot-popup.png)

侧栏底部的「字体设置」入口（下图箭头处）：

![侧栏入口](docs/screenshot-process.png)

English: [README.en.md](./README.en.md)

## 为什么做这个插件

- **排版硬编码，不合阅读习惯。** 正文字号、行距、段距、字体全部写死在产品里，长回复读起来费劲；有人喜欢大字号宽行距，有人喜欢紧凑密排，官方没有暴露任何入口。本插件把官方默认值做成滑杆中点，向两边对称可调，随时一键恢复默认。
- **间距滑杆「牵一发而动一身」的通病。** 常见做法是把某个 margin 改成固定 px——结果段落压扁了、列表和标题纹丝不动，越调越乱。本插件的段距/工具行距是**等比滑杆**：段落、列表、标题、工具行各自按**自己的官方间距**同步缩放，整体均匀收紧或放松，不会出现局部挤压。
- **思考行与上下内容挤在一起。** 界面更新后过程行被收进分组，思考行与其上下内容的空档由宿主统一控制，个人无法微调。本插件单独给思考行留了一个滑杆。
- **回复区和侧栏需求不同，却只能共用一套样式。** 本插件两个目标各自记忆一套参数，底部一键切换。

## 功能

| | 回复（AI 正文） | 左侧边栏 |
|---|---|---|
| 字号 | 6–26px（官方 16px 居中） | 6–22px（官方 14px 居中） |
| 小字字号 | 6–22px（官方 14px 居中，控制「Think」思考块与工具卡片小字/行首图标） | — |
| 行距 | 0.50–3.00x（官方 1.75x 居中） | 0.50–2.90x（官方 1.70x 居中） |
| 字距 | -6 – 6px（标准居中） | 同左 |
| 段距 | ×0.00 – ×3.00 等比（×1.00 = 官方） | — |
| 工具行距 | ×0.00 – ×2.00 等比（×1.00 = 官方） | — |
| 思考行距 | -8 – +24px（0 = 官方；「思考」行与上下内容之间的空档） | — |
| 字体 | 系统默认 / 微软雅黑 / 思源黑体 / 思源宋体 / 宋体 / 楷体 / 苹方 | 同左 |

> 所有滑杆以**官方原生值**为中点对称可调——缩小与放大的空间对等，「恢复默认」即回到中点。**段距与工具行距是等比滑杆**：一格之内，段落、列表、标题、hr/引用/代码块、工具行、子调用栈各自按**自己的官方间距**同步伸缩（官方间距逐项取自实际下发的产品样式），不会出现"段落压扁了、列表纹丝不动"的局部挤压。用户发送的气泡消息也跟随「字号」与「行距」；思考块小字的行距/字距跟随回复比例。

### 其它特性

- 弹窗底部「作用于」切换目标，**两个目标各自记一套参数**；
- 预览框随目标切换（回复模式显示正文+思考小字样例，侧栏模式显示侧栏文字样例）；
- 「恢复默认」只重置当前选中的目标；
- 设置存 localStorage（键 `reply-typography.v2`，自动迁移旧键），跨会话记忆；
- 弹窗不透明实色配色，跟随系统明暗主题，Esc 关闭；字体下拉为自绘圆角菜单，portal 渲染不被容器裁剪，空间不足自动向上弹开；标题栏可拖拽移动位置，双击复位；
- **自带侧栏列标记 shim**（给核心布局的侧边栏列打 `data-pane="sidebar"` 标记），无需 web-ui-all 也能适配左侧边栏——桌面版 / 纯 Web 版（`dsh web`）均可使用。

## 安装

### 前置要求

- DSH Desktop 2.0.x（自带 `theme` 客户端服务与 `sidebar.footer.action` / `shell.overlay` 插槽）；
- pnpm（DSH 自带环境即可）。

### 方式一：git 仓库直装（推荐）

在 profile 目录里把本仓库加为依赖：

```bash
pnpm --dir <profile 目录> add github:linchenlan/dsh-reply-typography
```

`<profile 目录>` 说明：桌面版默认是 `%USERPROFILE%\.dsh\profiles\desktop`；纯 Web 版（`dsh web`）是 `profiles\web`。执行后 pnpm 会把 `dsh-reply-typography` 写入该 profile 的 package.json 依赖。

### 方式二：本地开发链接（想改代码调试用）

```bash
git clone https://github.com/linchenlan/dsh-reply-typography.git
cd dsh-reply-typography
pnpm install
pnpm --dir <profile 目录> add file:<本仓库绝对路径>
```

`file:` 链接的好处：之后改 `lib/client.js` 重启 DSH 即生效，不用重新发版。

### 注册 bundle patch

在 profile 目录的 `cordis.patch.yml` 末尾追加（已有则跳过）：

```yaml
- insert:
    - id: dsh-reply-typography
      name: 'dsh-reply-typography'
```

### 启用与验证

1. 重启 DSH（或重启对应 profile 实例）；
2. 打开「设置 → 插件管理」，确认列表出现 `dsh-reply-typography`；
3. 侧栏底部出现「字体设置」按钮、点击能弹出设置窗，即安装成功。

> 多 profile 实例（如同时开 desktop 与 web）：每个 profile 需各自添加依赖与 insert 行。

## 使用

- **打开设置**：点侧栏底部「字体设置」；弹窗标题栏可拖动移动位置，双击标题栏复位，Esc 或右上角 × 关闭；
- **选目标**：弹窗底部「作用于」切换「回复 / 左侧边栏」，滑杆只调当前目标，两套参数互不影响；
- **调参**：字号 / 小字字号 / 行距 / 字距 / 段距 / 工具行距 / 思考行距 / 字体，顶部预览框实时反映效果；「恢复默认」只重置当前目标；
- **段距、工具行距怎么调**：显示的是倍率，×1.00 = 官方默认；想整体更紧凑拉到 ×0.6–×0.8，想更疏朗拉到 ×1.2–×1.5，段落/列表/标题/工具行会一起均匀变化；
- **思考行距怎么调**：显示的是像素增量，0 = 官方（显示为「官方」）；想让思考行与上下内容分开一点拉到 +8 ~ +16px，想更紧凑可拉到负值（最小 -8px）；
- **记忆**：所有参数存 localStorage，重启浏览器/DSH 后保持。

## 实现原理

- **字号/行距/字体**走主题令牌覆盖层：`theme.overrideTokens("dsh-reply-typography", …)` 覆盖 `--dsw-font-markdown-*` 系列（正文四态 + h1–h4 家族替换），产品样式表保持默认值，插件卸载即精确还原；
- **字距/段距/工具行距/思考行距**没有现成令牌，通过同一覆盖层下发自定义变量（`--reply-typography-letter-spacing` / `--rt-gap` / `--rt-row-scale` / `--rt-think-gap`），由插件自持的一条静态样式表消费——段距与工具行距以 `calc(官方间距 × 倍率)` 作用于每一类元素，思考行距以增量外边距作用于思考行（`[data-variant="think"]`），不干扰宿主统一的过程行间距；
- **性能**：单一全文档 MutationObserver + requestAnimationFrame 帧级合并扫描，侧栏标记扫描带结果缓存，流式输出期间每帧只有一次小查询、零 DOM 写入；
- **侧边栏**挂在 `data-pane="sidebar"` 锚点上注入字号/行距/字距/字体；该标记由插件自带 shim 打到核心布局的侧栏列（幂等，可与其它列 shim 共存），因此不依赖 web-ui-all；
- 明暗主题跟随 `theme/change` 事件快照。

## 仓库结构

```
dsh-reply-typography/
├── package.json          # dsh.client 声明（platform web, inject runtime）
├── cordis.patch.yml      # bundle patch：insert 行 dsh-reply-typography
├── docs/                 # 截图
└── lib/
    ├── index.js          # Host 半（占位，无宿主逻辑）
    └── client.js         # Client 半（__ModuleLoader__ 工厂格式打包产物）
```

## License

MIT
