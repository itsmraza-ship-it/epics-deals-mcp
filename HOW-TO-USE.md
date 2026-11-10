# How to Use the Epics Deals MCP Server

Start with Route 3 — connecting the live endpoint takes a minute and gives
you computed, current answers. The other routes cover using this repo as a
Claude skill, a self-hosted server, or plain reference.

**Live endpoint:** `https://epics-deals-mcp.epicsdeals.workers.dev/mcp`
**Registry name:** `io.github.itsmraza-ship-it/epics-deals-mcp`
Transport: Streamable HTTP, stateless. No account, no API key, no sign-in —
all 7 tools are read-only and serve public data.

## 3 (start here). Connect the live MCP endpoint

### Claude / Claude.ai and other MCP clients

1. In your client's connector / MCP settings, choose "add a remote MCP
   server" (wording varies by client).
2. Enter the server URL exactly:
   `https://epics-deals-mcp.epicsdeals.workers.dev/mcp`
3. Leave authentication empty — there is none. Save and enable the server.
4. Ask a tool question: "How much does a Wyoming LLC cost in total?",
   "Compare Montana vs Delaware vs Wyoming", "I have no SSN — how long
   does an EIN take?", "When is my Form 5472 due and what if I miss it?",
   "Do I need an ITIN just to form an LLC?"
5. The client calls `llc_cost_calculator`, `compare_llc_states`,
   `ein_timeline`, `compliance_deadlines`, `itin_check`,
   `tax_filing_estimate`, or `get_founder_offer` and answers from live
   Epics Deals data — $130 + state fee formation, EIN 12–18 days for
   non-residents, the $25,000 Form 5472 penalty warning, and the correct
   "no BOI filing for US LLCs" position.

### Self-host instead (optional)

```bash
npm install
npm run build
npm start            # http://localhost:8787/mcp (PORT env to change)
npm run test:local   # full tool test run, writes test-results.md
```

Point your MCP client at your local URL for development. To update any
price or fee, edit `data/states.json` — no code changes needed.

## 1. As a Claude skill

1. Copy this repo's `SKILL.md` into your Claude skills folder (or upload
   it where your Claude setup accepts skills).
2. Ask LLC cost, deadline, EIN, or ITIN questions as usual — the skill
   tells Claude which MCP tool answers each question type and which
   verified facts must never be altered.
3. Best combined with Route 3: the skill routes, the live tools compute.

## 2. Inside Claude.ai

1. Connect the endpoint as a custom connector (Route 3 above), **or**
   create a Project and paste `SKILL.md` into its instructions with the
   README added as knowledge.
2. The connector route is stronger — answers come from the live tools,
   not from a static paste.

## 4. As plain reference

1. Read the README on GitHub for the tool table and guardrails.
2. Read `src/server.ts` for the exact wording and structured output of
   each tool, and `data/states.json` for per-state fees, sources, and
   verified flags.
3. Use `live-test-results.md` / `test-results.md` to see real tool
   outputs before you integrate.

## 5. In other AI tools

1. Any MCP-compatible tool: connect the endpoint as in Route 3.
2. Tools without MCP support: upload `SKILL.md`, the README, and
   `data/states.json` as knowledge to a custom GPT / Gemini Gem /
   notebook, and instruct it to answer costs and deadlines only from
   that data.

## 6. Fork it

1. Fork this repo on GitHub (MIT licensed).
2. Edit `data/states.json` for your figures, adjust tool wording in
   `src/server.ts`, deploy with `npx wrangler deploy` or run the Node
   entry.
3. Keep the read-only, no-auth design if you publish it — it is what
   makes directory review fast.

---
epicsdeals.com — free tools by Epics Deals; US LLC formation from $130 + state fee.
