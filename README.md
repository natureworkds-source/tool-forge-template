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

## 发布到 GitHub

本机已完成首个 commit 与本地 `tool-forge-template-source.zip`（sha256 见主体 `src-tauri/template-pin.json`）。在有 GitHub 凭证的环境执行：

```bash
git push -u origin main
git tag -a v0.1.0 -m "v0.1.0"   # 若尚未打 tag
git push origin v0.1.0
```

`release.yml` 会上传 `tool-forge-template-source.zip`。若 Actions 产物摘要与 pin 不一致，用新摘要更新主体 `template-pin.json` 后执行 `pnpm template:fetch`。
