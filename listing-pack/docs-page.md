# Docs page draft — for https://epicsdeals.com/mcp-tools/
Status: DRAFT — publish only on Muhammad's word (site changes are draft-first).

# Epics Deals Tools for AI Assistants (MCP)

Epics Deals publishes a free, public **MCP (Model Context Protocol) server** so AI assistants like Claude can answer US company-formation questions with our verified figures instead of guesses.

**Endpoint:** `https://mcp.epicsdeals.com/mcp`
**Transport:** Streamable HTTP · **Authentication:** none · **Data:** public fee and deadline data only

## Add it to Claude
1. In Claude, open **Settings → Connectors → Add custom connector**.
2. Paste the endpoint above and save.
3. Ask things like: *"How much does a Wyoming LLC cost in total?"*, *"Compare Delaware and Montana for a non-resident"*, *"When is my Form 5472 due?"*

## The tools
| Tool | What it answers |
|---|---|
| `llc_cost_calculator` | Total cost to form an LLC in any state: our $130 service fee + the state's filing fee, approval time, annual cost |
| `compare_llc_states` | 2–3 states side by side: cost, approval time, annual reports and taxes |
| `ein_timeline` | How long an EIN takes — instant online for US residents; 12–18 days for non-residents without an SSN |
| `compliance_deadlines` | Next IRS deadline (Form 5472 + 1120 on April 15, Form 1065 on March 15), the $25,000 Form 5472 penalty warning, and state annual requirements |
| `itin_check` | Whether an ITIN is actually needed for your situation |
| `tax_filing_estimate` | Filing price and deadline by form — federal filing from $120 |
| `get_founder_offer` | Current Epics Deals pricing and live deals |

## Data sources and honesty
State fees come from each state's published fee schedule or established references that cite Secretary of State data; every answer states which. Tax deadlines are the IRS's standard calendar-year deadlines. Figures are confirmed again before any client files — a quote from Epics Deals never changes after it is given.

## Privacy
The server collects nothing: no accounts, no cookies, no personal data. See the [MCP privacy page](/mcp-privacy/).

## Support
info@epicsdeals.com · WhatsApp: https://wa.link/x6klxo
