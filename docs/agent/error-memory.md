# Agent 错误记忆

## 用途

记录可复现的工程错误和修正经验。只记录工程教训，不写入密钥、token 或个人信息。

## 条目模板

```markdown
### EM-YYYYMMDD-short-id

- 症状：
- 根因：
- 正确做法：
- 错误做法：
- 出现次数：
- 关联路径/命令：
- 最后更新：YYYY-MM-DD
```

## 记忆条目

### EM-20261010-external-theme-mode

- 症状：外部工具视觉只跟了品牌色，未跟随主框架浅色/深色
- 根因：`theme.get` 只取了色板，或工具侧写死 `applyTheme(..., 'auto')` / 跟系统 `prefers-color-scheme`
- 正确做法：宿主返回 `{ theme, mode }`；工具按 `mode` 应用；处理 `host.theme` invoke 并回 `result`
- 错误做法：只同步主题色、用系统明暗冒充平台明暗、把 `host.theme` 当业务 action
- 出现次数：1
- 关联路径/命令：`src/lib/theme.ts`；`src/lib/toolforge/index.ts`；`docs/host-integration.md`
- 最后更新：2026-10-10

### EM-20261010-settings-structuredclone-proxy

- 症状：设置弹层空白（容器内仅为 Vue 注释节点）
- 根因：对 props 的响应式 Proxy 调用 `structuredClone`，浏览器抛 `DataCloneError`
- 正确做法：先 `toRaw` 再 `normalizeSettings` / JSON 深拷贝（见 `src/lib/settings.ts` 的 `cloneSettings`）
- 错误做法：直接 `structuredClone(props.modelValue)` / `structuredClone(reactiveObj)`
- 出现次数：1
- 关联路径/命令：`src/lib/settings.ts`；`docs/host-integration.md` §3.4
- 最后更新：2026-10-10

### EM-20261010-pack-without-build

- 症状：`pack:tool` / 安装到宿主后 iframe 仍是旧 UI 或缺少 WASM
- 根因：只复制了过期/空的 `dist/`，未先 `pnpm build`
- 正确做法：使用模板的 `pnpm pack:tool`（已前置 build）或 `pnpm install:host`
- 错误做法：手工只跑 pack 脚本拷贝旧产物
- 出现次数：1
- 关联路径/命令：`package.json` scripts；`scripts/install-to-host.sh`
- 最后更新：2026-10-10

### EM-20261010-release-please-actions-pr

- 症状：release-please 建了分支但创建 PR 失败：`GitHub Actions is not permitted to create or approve pull requests`
- 根因：仓库未勾选 Actions「允许创建/批准 PR」，或手开的发版 PR 不带 `autorelease: pending` 导致合并后不打 tag
- 正确做法：Settings → Actions → General 勾选该选项；合并 **bot** 开的 Release PR；勿用手工代开替代
- 错误做法：忽略权限开关；手开 chore(release) PR 并期望自动发版
- 出现次数：1
- 关联路径/命令：`.github/workflows/release-please.yml`；README「发版」
- 最后更新：2026-10-10
