<div align="center">
  <h1>betalist-cli</h1>
  <p><strong>Browse BetaList from your terminal.</strong></p>
  <p>No login required by default · Public pages out of the box · Optional API token · JSON/YAML output</p>
  <p>
    <a href="./README.zh-CN.md">中文文档</a> ·
    <a href="https://www.npmjs.com/package/betalist-cli">npm</a>
  </p>
  <p>
    <img alt="npm version" src="https://img.shields.io/npm/v/betalist-cli">
    <img alt="node version" src="https://img.shields.io/node/v/betalist-cli">
    <img alt="license" src="https://img.shields.io/npm/l/betalist-cli">
  </p>
</div>

A CLI for public [BetaList](https://betalist.com) discovery workflows.

Read the latest startups, inspect a startup page by slug, list markets, and work with machine-readable JSON or YAML directly from your shell.

No login is required for the default HTML path. An API token is optional and used as an enhancement where available.

Current `v0.1` scope: `latest`, `startup`, `markets`, `doctor`, and `config`.

## Install

```bash
npm install -g betalist-cli
```

Requires **Node.js >= 20**.

After installation:

```bash
bl --help
betalist --help
```

## Quick Start

```bash
bl latest
bl latest --limit 5 --json
bl startup dusk-ai
bl startup dusk-ai --yaml
bl markets
bl doctor
bl config show
```

## Commands

| Command | Description |
|---|---|
| `bl latest` | Show the latest startups with pagination support |
| `bl startup <slug>` | Show details for a startup page |
| `bl markets` | List BetaList markets / browse categories |
| `bl doctor` | Check website reachability, selector health, optional API access, and cache |
| `bl config show` | Show resolved config values |
| `bl config set <key> <value>` | Update a string config value |
| `bl config cache-clear` | Clear local cache |

## Output

`latest`, `startup`, and `markets` follow these output rules:

| Scenario | Default |
|---|---|
| Interactive terminal | Human-readable table / text |
| Pipe / redirect | JSON |
| `--json` | JSON |
| `--yaml` | YAML |

The CLI respects `NO_COLOR` and `FORCE_COLOR`.

Structured output includes metadata such as:

- `ok`
- `schemaVersion`
- `dataSource`
- `providerChain`
- `fetchedAt`
- `cacheHit`
- `degraded`
- `warnings`
- `error`

## Startup Slugs

`bl startup <slug>` currently accepts a BetaList slug only:

```bash
bl startup dusk-ai
```

Example:

```text
https://betalist.com/startups/dusk-ai -> dusk-ai
```

Full BetaList URLs are not accepted as command input yet.

## Configuration

Configuration is optional. The default setup works out of the box.

If you want to tweak behavior:

```bash
bl config show
bl config set api.token YOUR_TOKEN
bl config set api.baseUrl http://api.betalist.com/v1
bl config cache-clear
```

The config file lives at:

```bash
~/.betalist-cli/config.yaml
```

You can also override settings with environment variables such as:

- `BL_API_TOKEN=...`
- `BL_API_BASE_URL=http://api.betalist.com/v1`
- `BL_CACHE_ENABLED=false`
- `BL_CACHE_DIR=/tmp/betalist-cli-cache`
- `BL_REQUEST_DELAY=2500`
- `BL_REQUEST_TIMEOUT=15000`

`config set` currently writes string values. For booleans or numbers, prefer editing the YAML file directly or using environment variables.

## Data Sources

- Default mode uses public BetaList HTML pages and does not require authentication.
- When `api.token` or `BL_API_TOKEN` is configured, `latest` and `markets` try the BetaList API first and fall back to HTML.
- `startup` details currently use HTML parsing even when a token is configured.
- `doctor` checks the optional API only when a token is present.

## Notes

- This is an unofficial project and is not affiliated with BetaList.
- HTML-derived fields are best-effort and may change if BetaList updates its markup.
- `doctor --fix` currently clears local cache as the first repair step.
- Search, regions, and market/region-specific browsing are not exposed as CLI commands in `v0.1`.

## License

[MIT](LICENSE)
