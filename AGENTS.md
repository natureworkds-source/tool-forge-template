# Agent 编程入口（外部工具推荐模板）

本仓库是天工智钥 / NatureWork Tool Forge 的**推荐外部工具脚手架**，不是平台本体。

## 开场清单

1. 读 `docs/agent/error-memory.md`
2. 确认改动落在正确分层（views / actions / toolforge SDK / crates）
3. 再改代码 / 跑 `pnpm test`、`pnpm build`、`pnpm pack:tool`

## 分层

| 层 | 路径 | 职责 |
| --- | --- | --- |
| UI | `src/views/` | 展示；不直接拼裸 postMessage |
| Actions | `src/actions/` | 实现 manifest.actions；收 input 回 result |
| Protocol | `src/lib/toolforge/` | invoke/result/request 封装 |
| Domain | `crates/tool-core` | 纯 Rust 逻辑 |
| WASM | `crates/tool-wasm` | 导出给前端的边界 |
| 契约 | `tool/manifest.json` | 清单真源；不写 origin |
| 交付 | `pnpm pack:tool` | `dist-tool/<id>/{manifest.json,ui/**}` |

## 硬约束

- 平台不编译、不执行包内原生 exe/dll；逻辑默认 WASM 进 `ui/`。
- 与 host 交互仅 `type: toolforge` 消息；文件/设置走壳层授权 API。
- 不要把 sidecar 当作默认架构。
- 错误记忆：同类失败第 2 次起更新同一条目；禁止写入密钥/token/个人信息。
