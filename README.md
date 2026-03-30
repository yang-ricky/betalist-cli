# betalist-cli

[![npm version](https://img.shields.io/npm/v/betalist-cli.svg)](https://www.npmjs.com/package/betalist-cli)
[![CI](https://github.com/yang-ricky/betalist-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/yang-ricky/betalist-cli/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Unofficial CLI for BetaList — discover tomorrow's startups, today.**

> ⚠️ **Disclaimer**: This is an unofficial tool and is not affiliated with or endorsed by BetaList. Use responsibly and respect BetaList's terms of service.

## Installation

```bash
npm install -g betalist-cli
```

Requires Node.js >= 20.

## Quick Start

```bash
# Get latest startups
bl latest

# View startup details
bl startup dusk-ai

# Browse markets/categories
bl markets

# Health check
bl doctor
```

## Commands

### `bl latest`

Get the latest startups from BetaList.

```bash
bl latest                  # Get 20 latest startups
bl latest --limit 10       # Limit to 10 results
bl latest --page 2         # Get page 2
bl latest --json           # Output as JSON
```

### `bl startup <slug>`

Get details of a specific startup.

```bash
bl startup dusk-ai         # View startup details
bl startup dusk-ai --json  # Output as JSON
```

### `bl markets`

List all markets/categories.

```bash
bl markets                 # List all markets
bl markets --json          # Output as JSON
```

### `bl doctor`

Check CLI health and diagnose issues.

```bash
bl doctor                  # Run health checks
bl doctor --fix            # Attempt to fix local issues
```

### `bl config`

Manage CLI configuration.

```bash
bl config show             # Show current config
bl config set api.token YOUR_TOKEN  # Set API token
bl config cache-clear      # Clear local cache
```

## Output Formats

| Environment | Default Output |
|-------------|----------------|
| TTY (terminal) | Colored table |
| Non-TTY (pipe) | JSON |

Override with flags:
- `--json` — Force JSON output
- `--yaml` — Force YAML output

### JSON Output Schema

```json
{
  "ok": true,
  "schemaVersion": "1",
  "dataSource": "html",
  "providerChain": ["html"],
  "fetchedAt": "2026-03-29T12:00:00.000Z",
  "cacheHit": false,
  "degraded": false,
  "warnings": [],
  "data": [...],
  "error": null
}
```

## Configuration

Configuration file: `~/.betalist-cli/config.yaml`

```yaml
api:
  token: ""                    # Optional: BetaList API token
  baseUrl: "http://api.betalist.com/v1"

cache:
  enabled: true
  dir: ~/.betalist-cli/cache
  ttl:
    list: 300                  # 5 minutes
    startup: 3600              # 1 hour
    markets: 86400             # 24 hours

request:
  delay: 1000                  # Rate limit: 1 request/second
  timeout: 10000
  retries: 3
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `BL_API_TOKEN` | API token (overrides config file) |
| `BL_CACHE_ENABLED` | Enable/disable cache |
| `BL_REQUEST_DELAY` | Request delay in ms |
| `NO_COLOR` | Disable colored output |
| `FORCE_COLOR` | Force colored output |

## API Token (Optional)

This CLI works without an API token using HTML scraping. If you have a BetaList API token, you can configure it for enhanced stability:

```bash
bl config set api.token YOUR_TOKEN
```

API tokens can be requested from `api@betalist.com` (availability not guaranteed).

## Data Sources

| Priority | Source | Authentication |
|----------|--------|----------------|
| 1 | REST API | Token required |
| 2 | HTML Scraping | None |

The CLI automatically falls back to HTML scraping if the API is unavailable.

## Limitations

- **Search**: Best-effort only, not guaranteed to match web search results
- **Jobs**: Not included in v1 (focus is on startup discovery)
- **Selectors**: HTML scraping may break if BetaList updates their site structure

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Authentication error |
| 3 | Parse error (HTML structure changed) |
| 4 | Rate limited |
| 5 | Network error |
| 6 | Configuration error |
| 7 | Invalid arguments |

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT © [Ricky Yang](https://github.com/yang-ricky)

---

**Not affiliated with BetaList. Use at your own risk.**
