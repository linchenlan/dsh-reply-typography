# 字体设置 reply-typography

DSH Web GUI 的阅读排版外挂插件：侧栏底部「字体设置」按钮弹出小说阅读器式设置窗口，实时调整 **AI 回复正文**与**左侧边栏**的字号、行距、字距、段距、字体；自带**简洁模式**——回复过程完整可见，回复完成后自动折叠工具卡片与思考过程，只保留每轮最终回答。带实时预览、恢复默认、本地记忆。

## 功能

| | 回复（AI 正文） | 左侧边栏 |
|---|---|---|
| 字号 | 6–26px（官方 16px 居中） | 6–22px（官方 14px 居中） |
| 小字字号 | 6–22px（官方 14px 居中，控制「Think」思考块与工具卡片小字/行首图标） | — |
| 行距 | 0.50–3.00x（官方 1.75x 居中） | 0.50–2.90x（官方 1.70x 居中） |
| 字距 | -6 – 6px（标准居中） | 同左 |
| 段距 | ×0.00 – ×3.00 等比（×1.00 = 官方） | — |
| 工具行距 | ×0.00 – ×2.00 等比（×1.00 = 官方） | — |
| 字体 | 系统默认 / 微软雅黑 / 思源黑体 / 思源宋体 / 宋体 / 楷体 / 苹方 | 同左 |

> 所有滑杆以**官方原生值**为中点对称可调——缩小与放大的空间对等，「恢复默认」即回到中点。**段距与工具行距是等比滑杆**：一格之内，段落、列表、标题、hr/引用/代码块、工具行、子调用栈各自按**自己的官方间距**同步伸缩（官方间距逐项取自实际下发的产品样式），不会出现"段落压扁了、列表纹丝不动"的局部挤压。用户发送的气泡消息也跟随「字号」与「行距」；思考块小字的行距/字距跟随回复比例。

### 简洁模式

- **默认开启**，弹窗内一键关闭；
- 回复进行中：工具卡片、思考过程、中间叙述**全部完整可见**，实时进度不遮挡；
- 回合结束瞬间自动折叠以上过程，**只保留每轮最终回答**与你发送的消息；
- 模型重试、上下文压缩等中间事件按"回合中"处理，不会被误当成最终回答保留。

### 其它

- 弹窗底部「作用于」切换目标，**两个目标各自记一套参数**；
- 预览框随目标切换（回复模式显示正文+思考小字样例，侧栏模式显示侧栏文字样例）；
- 「恢复默认」只重置当前选中的目标；
- 设置存 localStorage（键 `reply-typography.v2`，自动迁移旧键），跨会话记忆；
- 弹窗不透明实色配色，跟随系统明暗主题，Esc 关闭；字体下拉为自绘圆角菜单，portal 渲染不被容器裁剪，空间不足自动向上弹开；标题栏可拖拽移动位置，双击复位；
- **自带侧栏列标记 shim**（给核心布局的侧边栏列打 `data-pane="sidebar"` 标记），无需 web-ui-all 也能适配左侧边栏——桌面版 / 纯 Web 版（`dsh web`）均可使用；
- 多 profile 实例：每个 profile 需各自添加依赖与 insert 行（如 `profiles/desktop` 与 `profiles/web`）。

## 实现原理

- **字号/行距/字体**走主题令牌覆盖层：`theme.overrideTokens("reply-typography", …)` 覆盖 `--dsw-font-markdown-*` 系列（正文四态 + h1–h4 家族替换），产品样式表保持默认值，插件卸载即精确还原；
- **字距/段距/工具行距**没有现成令牌，通过同一覆盖层下发自定义变量（`--reply-typography-letter-spacing` / `--rt-gap` / `--rt-row-scale`），由插件自持的一条静态样式表消费——段距与工具行距以 `calc(官方间距 × 倍率)` 作用于每一类元素；
- **简洁模式**：聊天流是 `[data-chat-flow]` 下的扁平节点列表（tool-call / tool-result / reasoning / assistant-step / turn-tail …）。折叠样式要求每个过程节点之后存在 turn-tail 兄弟节点——进行中的回合没有 turn-tail，因此全程可见；回合落定瞬间整体折叠。一个观察器为每个已落定回合的最后一条 assistant-step 打 `data-rt-final` 标记，折叠后只放行最终回答；
- **性能**：单一全文档 MutationObserver + requestAnimationFrame 帧级合并扫描；侧栏标记与折叠标记两处扫描均带结果缓存，流式输出期间每帧只有两次小查询、零 DOM 写入；
- **侧边栏**挂在 `data-pane="sidebar"` 锚点上注入字号/行距/字距/字体；该标记由插件自带 shim 打到核心布局的侧栏列（幂等，可与其它列 shim 共存），因此不依赖 web-ui-all；
- 明暗主题跟随 `theme/change` 事件快照。

## 安装

### 方式一：本地开发链接

```bash
# 克隆到任意目录
git clone https://github.com/linchenlan/reply-typography.git
cd reply-typography
pnpm install

# 在 profile 的 package.json 里加依赖
pnpm --dir <profile 目录> add file:<本仓库绝对路径>
```

重启 DSH 后，在「设置 → 插件管理」即可看到 `reply-typography`。

### 方式二：git 仓库直装

```bash
pnpm --dir <profile 目录> add github:linchenlan/reply-typography
```

> 兼容性：需要宿主提供 `theme` 客户端服务与 `sidebar.footer.action` / `shell.overlay` 插槽（DSH Desktop 2.0.x 自带）。

## 仓库结构

```
reply-typography/
├── package.json          # dsh.client 声明（platform web, inject runtime）
├── cordis.patch.yml      # bundle patch：insert 行 reply-typography
└── lib/
    ├── index.js          # Host 半（占位，无宿主逻辑）
    └── client.js         # Client 半（__ModuleLoader__ 工厂格式打包产物）
```

## License

MIT
