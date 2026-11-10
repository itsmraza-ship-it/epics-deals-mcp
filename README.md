# Epics Deals — US LLC & Tax Tools (MCP server)

A remote, stateless **Streamable-HTTP MCP server** that turns Epics Deals' most-asked
founder questions into tools AI assistants can call:

| Tool | Answers |
|---|---|
| `llc_cost_calculator` | Total LLC formation cost in any state ($130 service + state fee), approval time, annual cost |
| `compare_llc_states` | 2–3 states side by side |
| `ein_timeline` | EIN timing for US residents (instant) and non-residents (12–18 days, no SSN) |
| `compliance_deadlines` | Next IRS deadline (5472+1120 Apr 15 / 1065 Mar 15), $25k penalty warning, state annual requirement |
| `itin_check` | Whether an ITIN is actually needed |
| `tax_filing_estimate` | Filing price + deadline by form (from $120; B2B $75/filing) |
| `get_founder_offer` | Current pricing and live deals |

All tools are read-only (`title` + `readOnlyHint: true` on each), serve public data, and
need no authentication — the fastest path through every directory review.

## Layout
- `src/server.ts` — the tools (one McpServer factory, shared by both entries)
- `src/node-server.ts` — local/self-host entry (node:http adapter around the Web Standard transport)
- `src/worker.ts` — Cloudflare Workers entry (Phase 2 target: `https://mcp.epicsdeals.com/mcp`)
- `data/states.json` — per-state fees with a **source** and a **verified** flag per row; tools say honestly when a fee is cross-checked rather than schedule-verified. Edit this file to update prices — no code changes needed.
- `listing-pack/` — directory listing copy, docs/privacy page drafts, icon spec
- `server.json` — official MCP Registry manifest (draft; publish in Phase 2)
- `test-results.md` — the latest full local test transcript

## Run it locally
```bash
npm install
npm run build
npm start            # http://localhost:8787/mcp  (PORT env to change)
```

## Test it
```bash
npm run test:local   # builds, boots on :8799, runs initialize + tools/list + every tool, writes test-results.md
```

## Deploy (Phase 2 — needs Muhammad's go)
```bash
npx wrangler deploy  # needs a Cloudflare account; then bind mcp.epicsdeals.com in wrangler.toml
```

## Guardrails baked in
- Verified Epics Deals figures only ($130 formation, filing from $120, state filing $60 + fee, ITIN $299, EIN 12–18 days non-resident, 5472 penalty from $25,000).
- BOI is stated as **not** required for US-formed LLCs.
- Banking is always "guidance — approval is the bank's own decision", never a guarantee.
- No mention of Pakistan anywhere in tool output.
