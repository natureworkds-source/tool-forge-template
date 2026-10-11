# 按职责拆薄与单文件体量

日期：2026-10-11  
来源：与主体仓 `docs/superpowers/specs/2026-10-11-code-modularity-file-size-design.md` 对齐的数字与原则；落点按本模板分层改写。

## 门槛

| 档位 | 约行数 | 要求 |
| --- | --- | --- |
| 舒适 | ≤400 | 默认目标 |
| 软门槛 | >400 | 加功能前评估拆分 |
| 硬门槛 | >800 | 禁止继续堆新职责 |
| 危急 | >1200 | 触碰即拆 |

## 原则

- 按**职责**拆，不为凑行数碎切。
- 先落对层（views / actions / toolforge / crates / scripts），再拆文件。
- 改动驱动 + boy scout；分 PR 搬迁与拆逻辑。

## Agent 规则

always-on：`.cursor/rules/code-modularity.mdc`、`.cursor/rules/directory-structure.mdc`。
