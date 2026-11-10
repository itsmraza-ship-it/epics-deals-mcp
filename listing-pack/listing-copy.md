# Listing copy — Claude Connectors Directory (and reusable on every other directory)

Status: DRAFT for Muhammad's approval. Slug is permanent once published — do not submit until he approves this file.

## Identity
- **Name:** Epics Deals — US LLC & Tax Tools
- **Slug:** `epics-deals`
- **Server URL (Phase 2):** https://mcp.epicsdeals.com/mcp
- **Transport:** Streamable HTTP, stateless, no authentication (public data only)
- **Support contact:** info@epicsdeals.com
- **Documentation URL (planned):** https://epicsdeals.com/mcp-tools/
- **Privacy policy URL (planned):** https://epicsdeals.com/mcp-privacy/

## One-liner (≤200 chars)
Form a US LLC from anywhere: exact state-by-state costs, EIN timelines, IRS deadlines and filing prices for non-resident founders — live data from Epics Deals.
(159 chars)

## Description (≤2,000 chars)
Epics Deals helps founders worldwide form and run US companies. This connector puts our most-asked answers inside Claude as free, read-only tools, using the same verified figures our team quotes clients:

• LLC Cost Calculator — the exact total to form an LLC in any of the 50 states + DC: our $130 service fee plus the state's own filing fee, typical approval time, and the yearly cost of staying active.
• Compare LLC States — up to three states side by side: cost, approval time, annual reports and taxes.
• EIN Timeline — instant online for US residents; 12–18 days for non-residents with no SSN, via Form SS-4.
• Compliance Deadlines — your next Form 5472 + 1120 (April 15) or Form 1065 (March 15) date, the $25,000 Form 5472 penalty warning, and your state's annual requirement.
• ITIN Check — whether you actually need an ITIN (you never need one just to form an LLC or get an EIN).
• Tax Filing Estimate — price and deadline by form, from $120.
• Founder Offer — current pricing and live state deals.

No account, no sign-in, no data collected: the tools answer from published fee and deadline data. When you're ready to file, Epics Deals handles formation, EIN, ITIN, annual IRS filings and compliance end-to-end at epicsdeals.com.

(1,318 chars)

## Categories (pick at submission)
Primary: **Business / Productivity** — closest alternatives the portal offers: "Finance", "Business tools". Choose in this order of preference: Business, Finance, Productivity.

## Use cases (portal step — ready to paste)
1. "I'm a freelancer outside the US — how much does a Wyoming LLC cost in total, and what does it cost every year?"
2. "Wyoming vs Delaware vs Montana for a non-resident founder — compare them."
3. "I have no SSN. How long will my LLC's EIN take?"
4. "My single-member LLC was formed in March — when is my Form 5472 due, and what happens if I miss it?"
5. "Do I need an ITIN to open a US LLC and get an EIN?"

## Test notes for reviewers
- No test account needed: the server is unauthenticated and every tool is read-only public data.
- Every tool can be exercised with the use cases above; expected outputs are deterministic fee/deadline answers with sources.
