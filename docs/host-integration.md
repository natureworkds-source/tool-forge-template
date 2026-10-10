# 与主工程（天工智钥）联调

本仓库是**外部工具脚手架**。改 UI / actions 后需打包安装到主体 `tools/`，由壳层 iframe 加载。

主工程惯例路径：`../nature-batch-geocoding-tool`（或你本机的 Tool Forge 主体仓）。

## 1. 交付形态

| 项 | 要求 |
| --- | --- |
| 工具 id | `tool/manifest.json` 的 `id`（= 安装目录名） |
| 清单 | **不要**写 `origin`；不要用保留 id `shell` |
| 入口 | `entry` 必须以 `ui/` 开头 |
| 产出 | `pnpm pack:tool` → `dist-tool/<id>/{manifest.json,ui/**}` |
| 安装位置 | `{appData}/tools/<id>/` |

macOS 默认 `appData`：

```text
~/Library/Application Support/cn.natureworkds.toolforge
```

可用 `TOOLFORGE_APP_DATA` 覆盖。

## 2. 推荐联调流程

```bash
pnpm test
pnpm install:host   # 内部 = build + pack:tool + rsync 到 appData/tools/<id>/
```

主体：

```bash
cd ../nature-batch-geocoding-tool   # 按本机路径调整
pnpm tauri dev
```

就绪：Vite `http://localhost:1420/`，桥 `http://127.0.0.1:17321`。

打开工具箱中对应工具；iframe 地址类似  
`http://127.0.0.1:17321/tools/<id>/ui/index.html`。

冒烟（宿主窗口已开）：

```bash
pnpm smoke:host
```

桥 API 校验 Origin；裸 curl 无 `Origin: http://localhost:1420` 常会 403。

> `install:host` 会 `--delete` 目标目录多余文件。

## 3. 协议与授权要点

### 3.1 消息

- 一律 `type: toolforge`，非空 `requestId`，合法 `direction`
- 壳 → 工具：`invoke`；工具必须回 `result`
- 工具 → 壳：`request`（`settings.*` / `files.*` / `theme.get` 等）
- `postMessage` 目标优先 `http://127.0.0.1:17321`

### 3.2 主题

- 启动时 `requestShell('theme.get')`，期望 `{ theme, mode }`
- 按 **mode**（`light` / `dark` / `auto`）应用，不要写死跟系统
- 运行时切换：宿主 `invoke` `host.theme`；模板在 `startToolforgeHostBridge(..., onHostTheme)` 单独处理并 `replyResult`
- 实现：`src/lib/theme.ts`、`src/styles.css`

### 3.3 settings / files

- 设置键建议：`tools/<manifest.id>/...`，与主体全局配置隔离
- `manifest.permissions` 须覆盖 effects 用到的能力（`settings` / `files` / `network` 等）
- `files.*`：路径须为**绝对路径**，且出现在 invoke **input 顶层**，才能进授权 grant

### 3.4 设置 UI 草稿克隆

```ts
import { toRaw } from 'vue'
import { normalizeSettings } from './lib/settings'

// ✅
const draft = normalizeSettings(toRaw(props.modelValue))

// ❌ structuredClone(props.modelValue)  // Vue Proxy → DataCloneError，弹层空白
```

模板提供 `src/lib/settings.ts` 的 `cloneSettings` 范例。

## 4. 常见问题

| 现象 | 排查 |
| --- | --- |
| catalog 无工具 / rejected | 看 `/api/tools` 的 `rejected[].reason`；确认 `tools/<id>/manifest.json` 与 `ui/index.html` |
| 安装后白屏 / 旧 UI | 是否只跑了旧 `dist`；现在 `pack:tool` 会先 `build` |
| 主题色对了但明暗不对 | 是否忽略了 `mode` / 是否未处理 `host.theme` |
| settings 弹层空白 | 是否对 Proxy 用了 `structuredClone` |
| smoke 403 | 请求是否带 `Origin: http://localhost:1420` |
