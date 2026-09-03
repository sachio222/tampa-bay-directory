# WebMCP on Tampa Bay Directory

Thin [WebMCP](https://developer.chrome.com/docs/ai/webmcp) tools on the static plumbers page so agents can query public shop data without scraping the table.

## Demo URL

https://sachio222.github.io/tampa-bay-directory/tampa-plumbers.html

Data file: https://sachio222.github.io/tampa-bay-directory/tampa-plumbers.json

## Tools

| Tool | Purpose | Inputs |
|------|---------|--------|
| `list_plumbers` | Return every shop in the directory | *(none)* |
| `search_plumbers` | Filter by city and/or name substring | `city?`, `name?` (at least one) |
| `get_plumber` | Full record for one shop | `name` (required) |

All tools are **read-only** (`readOnlyHint: true`). They only expose fields already published on this site (name, city, website, phone, source_url).

## Implementation

- Imperative API: `document.modelContext.registerTool` (fallback: `navigator.modelContext`)
- Script: [`webmcp-plumbers.js`](./webmcp-plumbers.js) loaded from [`tampa-plumbers.html`](./tampa-plumbers.html)
- Reads [`tampa-plumbers.json`](./tampa-plumbers.json) via `fetch`
- Progressive enhancement: without WebMCP, the HTML table still works

## How judges verify

1. Open the demo URL in **ChatGPT’s in-app browser** (WebMCP supported out of the box), **or** Google Chrome with `chrome://flags/#enable-webmcp-testing` set to **Enabled**, then relaunch.
2. Optional: install Chrome’s **Model Context Tool Inspector** extension to list/call tools.
3. Confirm tools appear: `list_plumbers`, `search_plumbers`, `get_plumber`.
4. Example checks:
   - `list_plumbers` → ~20 shops
   - `search_plumbers` with `{ "city": "Clearwater" }` → On Tap Plumbing
   - `get_plumber` with `{ "name": "Titan Plumbing" }` → full Titan record
5. Human UI: the existing table must still render; WebMCP is additive only.

## Notes

- Hosted on GitHub Pages (HTTPS). No private data; phones come from each shop’s own public site.
- Origin isolation: do not set `document.domain`. GitHub Pages default responses are fine for this static site; ChatGPT’s browser is the primary judge path.
