<div align="center">
  <h1>betalist-cli</h1>
  <p><strong>在终端里浏览 BetaList。</strong></p>
  <p>默认无需登录 · 开箱即用读取公开页面 · 可选 API Token · 支持 JSON/YAML 输出</p>
  <p>
    <a href="./README.md">English</a> ·
    <a href="https://www.npmjs.com/package/betalist-cli">npm</a>
  </p>
  <p>
    <img alt="npm version" src="https://img.shields.io/npm/v/betalist-cli">
    <img alt="node version" src="https://img.shields.io/node/v/betalist-cli">
    <img alt="license" src="https://img.shields.io/npm/l/betalist-cli">
  </p>
</div>

一个面向公开 [BetaList](https://betalist.com) 发现流程的命令行工具。

你可以直接在 shell 里读取最新 startup、按 slug 查看单个项目详情、列出 markets，并输出为终端友好的文本、JSON 或 YAML。

默认的 HTML 路径不需要登录。API Token 不是必需项，只是在可用时作为增强能力使用。

当前 `v0.1` 范围包含：`latest`、`startup`、`markets`、`doctor`、`config`。

## 安装

```bash
npm install -g betalist-cli
```

需要 **Node.js >= 20**。

安装后可以这样用：

```bash
bl --help
betalist --help
```

## 快速开始

```bash
bl latest
bl latest --limit 5 --json
bl startup dusk-ai
bl startup dusk-ai --yaml
bl markets
bl doctor
bl config show
```

## 命令

| 命令 | 说明 |
|---|---|
| `bl latest` | 查看最新 startup，支持分页 |
| `bl startup <slug>` | 查看某个 startup 页面详情 |
| `bl markets` | 列出 BetaList 的 markets / browse categories |
| `bl doctor` | 检查网站连通性、选择器状态、可选 API 访问能力和缓存状态 |
| `bl config show` | 显示当前生效的配置 |
| `bl config set <key> <value>` | 更新一个字符串类型的配置值 |
| `bl config cache-clear` | 清空本地缓存 |

## 输出格式

`latest`、`startup`、`markets` 这几个数据命令遵循以下输出规则：

| 场景 | 默认输出 |
|---|---|
| 交互式终端 | 人类可读的表格 / 文本 |
| 管道 / 重定向 | JSON |
| `--json` | JSON |
| `--yaml` | YAML |

CLI 会遵守 `NO_COLOR` 和 `FORCE_COLOR`。

结构化输出会包含这些元信息：

- `ok`
- `schemaVersion`
- `dataSource`
- `providerChain`
- `fetchedAt`
- `cacheHit`
- `degraded`
- `warnings`
- `error`

## Startup Slug

`bl startup <slug>` 目前只接受 BetaList 的 slug：

```bash
bl startup dusk-ai
```

例如：

```text
https://betalist.com/startups/dusk-ai -> dusk-ai
```

当前还不支持直接把完整的 BetaList URL 作为命令参数传入。

## 配置

配置不是必需的，默认即可直接使用。

如果你想调整行为：

```bash
bl config show
bl config set api.token YOUR_TOKEN
bl config set api.baseUrl http://api.betalist.com/v1
bl config cache-clear
```

配置文件路径：

```bash
~/.betalist-cli/config.yaml
```

也可以通过环境变量覆盖，例如：

- `BL_API_TOKEN=...`
- `BL_API_BASE_URL=http://api.betalist.com/v1`
- `BL_CACHE_ENABLED=false`
- `BL_CACHE_DIR=/tmp/betalist-cli-cache`
- `BL_REQUEST_DELAY=2500`
- `BL_REQUEST_TIMEOUT=15000`

`config set` 当前会把写入值当作字符串处理。布尔值和数字更适合直接编辑 YAML 文件，或者使用环境变量覆盖。

## 数据来源

- 默认模式使用 BetaList 的公开 HTML 页面，不需要认证。
- 配置 `api.token` 或 `BL_API_TOKEN` 后，`latest` 和 `markets` 会优先尝试 BetaList API，失败时回退到 HTML。
- `startup` 详情目前即使配置了 token，也仍然使用 HTML 解析。
- `doctor` 只有在存在 token 时才会检查可选 API。

## 说明

- 这是一个非官方项目，与 BetaList 没有官方关联。
- 通过 HTML 解析得到的字段都属于 best-effort，BetaList 页面结构变化时可能需要更新。
- `doctor --fix` 目前的修复动作主要是清空本地缓存。
- 搜索、regions，以及按 market / region 继续浏览的能力还没有作为 `v0.1` 的 CLI 命令暴露出来。

## License

[MIT](LICENSE)
