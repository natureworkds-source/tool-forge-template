# Agent 编程入口（外部工具推荐模板）

本仓库是天工智钥 / NatureWork Tool Forge 的**推荐外部工具脚手架**，不是平台本体。

## 开场清单

1. 读 `docs/agent/error-memory.md`
2. 确认改动落在正确分层（views / actions / toolforge SDK / crates），且不会加厚超过体量硬门槛的巨石文件
3. 再改代码 / 跑 `pnpm test`、`pnpm build`、`pnpm pack:tool`
4. 需要验证宿主行为时：读 `docs/host-integration.md`，再 `pnpm install:host` + 主工程 `pnpm tauri dev`

## 分层

| 层 | 路径 | 职责 |
| --- | --- | --- |
| UI | `src/views/` | 展示；不直接拼裸 postMessage |
| Actions | `src/actions/` | 实现 manifest.actions；收 input 回 result |
| Protocol | `src/lib/toolforge/` | invoke/result/request 封装（含 `host.theme`） |
| Theme | `src/lib/theme.ts` | 跟主体品牌色与浅/深 mode |
| Domain | `crates/tool-core` | 纯 Rust 逻辑 |
| WASM | `crates/tool-wasm` | 导出给前端的边界 |
| 契约 | `tool/manifest.json` | 清单真源；不写 origin |
| 交付 | `pnpm pack:tool` | `dist-tool/<id>/{manifest.json,ui/**}`（会先 build） |
| 商店包 | `pnpm pack:store` | `dist-store/<id>-<ver>-universal.tfpkg` + `.artifact.json` |
| 联调 | `docs/host-integration.md` | 安装到主体 `tools/`、桥 API、授权与主题 |

目录纪律见 `.cursor/rules/directory-structure.mdc`；体量与拆薄见 `.cursor/rules/code-modularity.mdc` 与 `docs/agent/code-modularity.md`。

## 与主体壳层的边界（勿抄错层）

主体前端壳按 `home` / `runtime` / `theme` / `ads` 分域。外部工具**只**通过 `toolforge` 协议与授权 API 交互，不要依赖主体 `shell/home` 内部模块。联调节奏见 `docs/host-integration.md`。

## 硬约束

- 平台不编译、不执行包内原生 exe/dll；逻辑默认 WASM 进 `ui/`。
- 与 host 交互仅 `type: toolforge` 消息；文件/设置走壳层授权 API。
- 不要把 sidecar 当作默认架构。
- 单文件体量约 400 / 800 / 1200（软/硬/危急）；按职责拆薄，禁止堆巨石文件交付功能。
- 错误记忆：同类失败第 2 次起更新同一条目；禁止写入密钥/token/个人信息。
- 发版走 release-please：`main` 上用 Conventional Commits；合并 **bot** 开的 Release PR 后自动 bump + changelog + 上传源码 zip。不要手工改版本号抢跑；不要回写主体 `template-pin.json`（由主体维护者升 pin）。
- Fork 派生工具时：改 `package.json` 的 `name`、`tool/manifest.json` 的 `id`；源码 zip 名随 `name` 自动生成。
