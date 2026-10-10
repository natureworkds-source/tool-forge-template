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

与主工程联调节奏见 [`docs/host-integration.md`](docs/host-integration.md)：

```bash
pnpm install:host   # build + pack + 安装到本机 appData/tools/<id>/
pnpm smoke:host     # 宿主窗口已开时冒烟
```

## 从模板派生（fork 必改清单）

| 项 | 说明 |
| --- | --- |
| `package.json` → `name` | 源码 zip 与 Release 附件名 = `{name}-source.zip`（脚本按此读取，勿再硬编码模板名） |
| `tool/manifest.json` → `id` | 安装目录名；权限与 effects 对齐 |
| `src/lib/settings.ts` → `SETTINGS_KEY` | 建议 `tools/<id>/settings.json` |
| README / 文案 | 换成你的工具名与说明 |

不必改：`scripts/pack-source-zip.sh`、`release-please.yml` 的 zip 文件名（已参数化 / glob）。

## 架构

- **UI**：Vue 3 + TypeScript（`src/views`）
- **动作**：`src/actions` 响应平台 `invoke`
- **协议 SDK**：`src/lib/toolforge`（含 `host.theme`）
- **主题**：`src/lib/theme.ts` + `src/styles.css`（跟主体 `theme` + `mode`）
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
2. `release-please.yml` 会开/更新 **Release PR**（作者应为 `github-actions[bot]`，带 `autorelease: pending`），自动改：
   - `package.json` 的 `version`
   - `crates/Cargo.toml` 的 `workspace.package.version`
   - `CHANGELOG.md`
   - `.release-please-manifest.json`
3. **合并该 Release PR** 后：打 `vX.Y.Z` tag、创建 GitHub Release，并上传 `{package.name}-source.zip`。

### 仓库 Actions 权限（必查）

Settings → Actions → General → Workflow permissions：

- 选 **Read and write permissions**
- 勾选 **Allow GitHub Actions to create and approve pull requests**

未勾选时，release-please 能建分支但创建 PR 会失败。  
手开的「发版 PR」通常**不会**触发打 tag；请合并 bot 开的 Release PR。

不会回写主体仓的 `template-pin.json`；发版后请你在主体仓手动更新 pin（`tag` + zip `sha256`），再执行 `pnpm template:fetch`。

说明：

- `tool/manifest.json` 的 `version` 是**示例工具**版本，不随模板脚手架自动 bump。
- 已有基线 tag：`v0.1.0`。之后的版本由 Release PR 推进。
- `pnpm pack:tool` 会先执行 `pnpm build`，避免把过期 `dist/` 打进交付物。
