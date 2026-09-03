# Tampa Bay home services directory

One useful page at a time. Public business info only.

## Live pages
- https://sachio222.github.io/tampa-bay-directory/
- https://sachio222.github.io/tampa-bay-directory/tampa-plumbers.html — 20 independent plumbers (2026-08-29)

## WebMCP (agent tools)

This static GitHub Pages site exposes thin read-only [WebMCP](https://developer.chrome.com/docs/ai/webmcp) tools on the plumbers page so AI agents can list, search, and fetch shop details from `tampa-plumbers.json` without scraping the DOM.

See **[WEBMCP.md](./WEBMCP.md)** for tools, demo URL, and judge verification steps.

Tools: `list_plumbers` · `search_plumbers` · `get_plumber`

## Add tomorrow’s page
1. Collect listings the same way: name, city, own-site URL, phone only if on that site.
2. Save JSON next to `tampa-plumbers.json`.
3. Copy `tampa-plumbers.html`, swap the table.
4. Link it from `index.html`.

No fake reviews. No emails on the public page.

## License

MIT — see [LICENSE](./LICENSE).
