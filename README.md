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

- Node.js ≥22.12 / pnpm 10
- Rust **stable**（仓库根 `rust-toolchain.toml` 钉死 channel；edition 2024）
- 目标 `wasm32-unknown-unknown`（`pnpm build:wasm` 会尝试安装）
- `wasm-bindgen` CLI **0.2.129**（与 crate pin 一致；版本不符时脚本会重装）

## 发版（release-please）

本仓用 [release-please](https://github.com/googleapis/release-please) 自动维护版本与 changelog：

1. 向 `main` 提交 **Conventional Commits**（如 `feat:` / `fix:` / `docs:`）。
2. `release-please.yml` 会开/更新 **Release PR**，自动改：
   - `package.json` 的 `version`
   - `crates/Cargo.toml` 的 `workspace.package.version`
   - `CHANGELOG.md`
   - `.release-please-manifest.json`
3. **合并该 Release PR** 后：打 `vX.Y.Z` tag、创建 GitHub Release，并上传 `tool-forge-template-source.zip`。

不会回写主体仓的 `template-pin.json`；发版后请你在主体仓手动更新 pin（`tag` + zip `sha256`），再执行 `pnpm template:fetch`。

说明：

- `tool/manifest.json` 的 `version` 是**示例工具**版本，不随模板脚手架自动 bump。
- 已有基线 tag：`v0.1.0`。之后的版本由 Release PR 推进。
