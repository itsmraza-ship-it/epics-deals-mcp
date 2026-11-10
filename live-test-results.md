# Live test — Cloudflare Workers deployment (2026-11-09)

Base URL: https://epics-deals-mcp.epicsdeals.workers.dev
MCP endpoint: https://epics-deals-mcp.epicsdeals.workers.dev/mcp

```
--- GET /health
{"ok":true,"server":"epics-deals-mcp"}
HTTP 200

--- POST /mcp initialize
event: message
data: {"result":{"protocolVersion":"2025-03-26","capabilities":{"tools":{"listChanged":true}},"serverInfo":{"name":"epics-deals-us-llc-tax-tools","version":"1.0.0"}},"jsonrpc":"2.0","id":1}


HTTP 200

--- POST /mcp tools/list
event: message
data: {"result":{"tools":[{"name":"llc_cost_calculator","title":"LLC Cost Calculator — total price to form a US LLC in any state","description":"How much does it cost to form an LLC? Give a US state and get the exact total: Epics Deals' $130 formation service + that state's government filing fee, the typical state approval time, and the yearly cost of keeping the LLC active. Use for questions like 'how much is a Wyoming LLC', 'cost of forming an LLC in Delaware/Florida/Texas for a non-resident', or any state LLC price question.","inputSchema":{"type":"object","properties":{"state":{"type":"string","description":"US state name or 2-letter code, e.g. 'Wyoming' or 'WY'"}},"required":["state"],"additionalProperties":false,"$schema":"http://json-schema.org/draft-07/schema#"},"annotations":{"readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false},"execution":{"taskSupport":"forbidden"}},{"name":"compare_llc_states","title":"Compare LLC States — fees, approval times and annual costs side by side","description":"Compare 2–3 US states for LLC formation: all-in formation cost, state approval time, annual report/tax cost, and why founders pick each. Use for 'Wyoming vs Delaware', 'which state is best/cheapest for a non-resident LLC', and similar comparisons.","inputSchema":{"type":"object","properties":{"states":{"type":"array","items":{"type":"string"},"minItems":2,"maxItems":3,"description":"2–3 US state names or codes to compare"}},"required":["states"],"additionalProperties":false,"$schema":"http://json-schema.org/draft-07/schema#"},"annotations":{"readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false},"execution":{"taskSupport":"forbidden"}},{"name":"ein_timeline","title":"EIN Timeline — how long an EIN takes, with or without an SSN","description":"How long does it take to get an EIN (US tax ID for an LLC)? Different answers for US residents (instant online with an SSN) and non-residents / foreign founders with no SSN (Form SS-4 by fax, 12–18 days through Epics Deals). Use for 'EIN without SSN', 'how long does EIN take for a foreign-owned LLC', and similar questions.","inputSchema":{"type"

--- POST /mcp tools/call llc_cost_calculator (Colorado)
event: message
data: {"result":{"content":[{"type":"text","text":"**Colorado LLC — total cost with Epics Deals**\n\n- Epics Deals formation service: $130\n- Colorado state filing fee (Articles of Organization): $50\n- **Current Colorado exclusive: $130 ALL-IN** — the state fee is covered, valid until 18 Nov 2026.\n- **Total due today: $130**\n- Typical state approval time: 1–3 business days online\n- Keeping it active: Periodic Report — $25 per year, due: During the periodic report month each year.\n\nThe service fee includes your Articles of Organization, EIN application, registered agent setup and guided US business bank account onboarding (every bank makes its own approval decision — we prepare and route the application properly, approval is never something anyone can guarantee).\n\nFee data verified against the state's published fee schedule.\n\nStart here: https://epicsdeals.com — or message the team on WhatsApp: https://wa.link/x6klxo"}],"structuredContent":{"state":"Colorado","state_code":"CO","service_fee_usd":130,"state_fee_usd":50,"total_due_today_usd":130,"colorado_deal_applied":true,"approval_time":"1–3 business days online","annual_requirement":"Periodic Report","annual_fee_usd":25,"annual_cadence":"annual","annual_due":"During the periodic report month each year","data_verified":true,"source":"Epics Deals verified state facts, 2026-11-08 (Colorado Secretary of State)"}},"jsonrpc":"2.0","id":3}


HTTP 200

--- POST /mcp tools/call compliance_deadlines
event: message
data: {"result":{"content":[{"type":"text","text":"MCP error -32602: Input validation error: Invalid arguments for tool compliance_deadlines: Required at entity_type\nRequired at state\nRequired at formation_date"}],"isError":true},"jsonrpc":"2.0","id":4}


HTTP 200

check: health ok:true -> PASS
check: tools/list has 7 tools -> PASS
check: llc_cost_calculator answered -> PASS
check: compliance_deadlines answered -> PASS
RESULT: PASS
```

## Correction — compliance_deadlines with valid arguments

The first transcript call passed `{}` and correctly received a validation
error: the tool requires entity_type, state and formation_date. Re-run with
valid arguments:

---
POST /mcp tools/call compliance_deadlines (single_member, Wyoming, formed 2026-06-15) -> HTTP 200

Result text: Federal (single-member): Form 5472 + pro-forma Form 1120 due
April 15 every year, next deadline April 15, 2027. Form 5472 penalty starts
at $25,000. State (Wyoming): Annual Report License Tax $60/year, due first
day of the anniversary month. BOI note: BOI filing is NOT required for
US-formed LLCs.

structuredContent: {"entity_type":"single_member","state":"Wyoming",
"next_federal_deadline":"2027-04-15","federal_form":"5472 + pro-forma 1120",
"form_5472_penalty_from_usd":25000,"boi_required_for_us_llcs":false,
"state_annual_requirement":"Annual Report License Tax",
"state_annual_fee_usd":60}

check: compliance_deadlines answered with valid args -> PASS
