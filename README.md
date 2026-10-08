# Tool Forge 外部工具推荐模板

公开脚手架：[natureworkds-source/tool-forge-template](https://github.com/natureworkds-source/tool-forge-template)。

从天工智钥应用内下载的 zip 是**完整工程源码包**（不是已安装的 `ui/` 运行时包）。解压后：

```bash
pnpm install
pnpm test
pnpm build
pnpm pack:tool
```

将 `dist-tool/<id>/` 拷贝到平台数据目录的 `tools/<id>/`，重新打开首页即可看到工具。

## 架构

- **UI**：Vue 3 + TypeScript（`src/views`）
- **动作**：`src/actions` 响应平台 `invoke`
- **协议 SDK**：`src/lib/toolforge`
- **逻辑**：Rust `crates/tool-core` → WASM `crates/tool-wasm` → 打进 `ui/`
- **Agent**：`AGENTS.md` + `docs/agent/error-memory.md`

平台不执行包内原生程序。其他自建工程只要最终 `manifest.json` + `ui/**` 通过主体校验即可，不必使用本模板。

## 前置

- Node 20+ / pnpm
- Rust toolchain + `wasm32-unknown-unknown`（`pnpm build:wasm` 会尝试安装目标）
- `wasm-bindgen` CLI（脚本在缺失时尝试 `cargo install`）

## Release

打 `v*` tag 后 GitHub Actions 发布 `tool-forge-template-source.zip`，供主体仓 `template-pin.json` 钉死拉取。
