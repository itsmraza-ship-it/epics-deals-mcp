# MCP local test transcript
Endpoint: http://localhost:8799/mcp
Date: 2026-11-09T00:22:11.541Z

## initialize -> HTTP 200
```json
{
  "protocolVersion": "2025-03-26",
  "capabilities": {
    "tools": {
      "listChanged": true
    }
  },
  "serverInfo": {
    "name": "epics-deals-us-llc-tax-tools",
    "version": "1.0.0"
  }
}
```

## tools/list -> HTTP 200 (7 tools)
- **llc_cost_calculator** — title: "LLC Cost Calculator — total price to form a US LLC in any state" — annotations: {"readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}
- **compare_llc_states** — title: "Compare LLC States — fees, approval times and annual costs side by side" — annotations: {"readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}
- **ein_timeline** — title: "EIN Timeline — how long an EIN takes, with or without an SSN" — annotations: {"readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}
- **compliance_deadlines** — title: "LLC Compliance Deadlines — IRS and state filing due dates" — annotations: {"readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}
- **itin_check** — title: "ITIN Check — do you actually need an ITIN?" — annotations: {"readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}
- **tax_filing_estimate** — title: "US Tax Filing Estimate — price and deadline by form" — annotations: {"readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}
- **get_founder_offer** — title: "Epics Deals Founder Offer — current pricing and deals" — annotations: {"readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}

## tools/call llc_cost_calculator {"state":"Wyoming"} -> HTTP 200
```
**Wyoming LLC — total cost with Epics Deals**

- Epics Deals formation service: $130
- Wyoming state filing fee (Articles of Organization): $100
- **Total due today: $230**
- Typical state approval time: Online filings are typically approved the same day
- Keeping it active: Annual Report License Tax — $60 per year, due: First day of the anniversary month. Minimum; the tax is the greater of $60 or $0.0002 per $1 of Wyoming-located assets.

The service fee includes your Articles of Organization, EIN application, registered agent setup and guided US business bank account onboarding (every bank makes its own approval decision — we prepare and route the application properly, approval is never something anyone can guarantee).

Fee data verified against the state's published fee schedule.

Start here: https://epicsdeals.com — or message the team on WhatsApp: https://wa.link/x6klxo
```

## tools/call llc_cost_calculator {"state":"Colorado"} -> HTTP 200
```
**Colorado LLC — total cost with Epics Deals**

- Epics Deals formation service: $130
- Colorado state filing fee (Articles of Organization): $50
- **Current Colorado exclusive: $130 ALL-IN** — the state fee is covered, valid until 18 Nov 2026.
- **Total due today: $130**
- Typical state approval time: 1–3 business days online
- Keeping it active: Periodic Report — $25 per year, due: During the periodic report month each year.

The service fee includes your Articles of Organization, EIN application, registered agent setup and guided US business bank account onboarding (every bank makes its own approval decision — we prepare and route the application properly, approval is never something anyone can guarantee).

Fee data verified against the state's published fee schedule.

Start here: https://epicsdeals.com — or message the team on WhatsApp: https://wa.link/x6klxo
```

## tools/call compare_llc_states {"states":["Wyoming","Delaware","Montana"]} -> HTTP 200
```
**LLC state comparison — Epics Deals**

**Wyoming**
- All-in with Epics Deals today: $230 ($130 service + $100 state fee)
- Approval: Online filings are typically approved the same day
- Every year after: Annual Report License Tax — $60 per year, due: First day of the anniversary month. Minimum; the tax is the greater of $60 or $0.0002 per $1 of Wyoming-located assets.
- Why founders pick it: The non-resident favourite: low flat costs, no state income tax, strong privacy (members are not listed publicly).
- Data: verified against the state's published fee schedule

**Delaware**
- All-in with Epics Deals today: $240 ($130 service + $110 state fee)
- Approval: Typically a few business days standard; expedited available
- Every year after: Annual LLC tax (no annual report) — $400 per year, due: June 1. Flat annual tax; late payment adds a $200 penalty plus 1.5%/month interest.
- Why founders pick it: Famous business-law state. For LLCs the draw is the legal framework, not cost — the flat $400/yr annual tax makes it one of the pricier LLC states.
- Data: verified against the state's published fee schedule

**Montana**
- All-in with Epics Deals today: $165 ($130 service + $35 state fee)
- Approval: Typically a few business days online
- Every year after: Annual Report — $20 per year, due: April 15. Fee waived ($0) when filed January 1 – April 15; $35 if filed late.
- Why founders pick it: The lowest state formation fee in the US ($35) and the annual report is free when filed in the Jan 1 – Apr 15 window.
- Data: verified against the state's published fee schedule

One rule that matters more than any fee: if you have no US presence (no office, staff or warehouse), you can form in any state. If you do operate from a state, that state usually requires registration there too. Tell us your situation and we'll recommend the state that fits — https://epicsdeals.com · WhatsApp https://wa.link/x6klxo
```

## tools/call ein_timeline {"residency":"non_resident"} -> HTTP 200
```
**EIN as a non-resident (no SSN, no US visa): 12–18 days via Epics Deals.**

- You do NOT need an SSN or ITIN to get an EIN for your LLC.
- The IRS online EIN application requires an SSN/ITIN, so non-residents apply with Form SS-4 by fax instead.
- Epics Deals prepares and faxes the SS-4 for every LLC we form; our current end-to-end timeline is **12–18 days**.
- You need: your approved Articles of Organization and the responsible party's details (name, address, passport details).

The EIN is included in our $130 + state fee formation package: https://epicsdeals.com · WhatsApp https://wa.link/x6klxo
```

## tools/call compliance_deadlines {"entity_type":"single_member","state":"Wyoming","formation_date":"2026-03-10"} -> HTTP 200
```
**Your LLC compliance deadlines**

**Federal (single-member):** Form 5472 + pro-forma Form 1120 are due **April 15** every year, even with $0 income. Your next one falls on **April 15, 2027**. An extension (Form 7004) moves it to October 15 — but it must be requested before the deadline. **The Form 5472 penalty starts at $25,000** for a late or missing filing; this is the single most expensive mistake foreign-owned LLCs make.

**State (Wyoming):** Annual Report License Tax — $60 per year, due: First day of the anniversary month. Minimum; the tax is the greater of $60 or $0.0002 per $1 of Wyoming-located assets.

**BOI note:** Beneficial Ownership Information filing with FinCEN is NOT required for US-formed LLCs — anyone trying to sell you a "mandatory BOI filing" for a US LLC is selling something you don't need.

Epics Deals files federal returns from $120 and state filings for $60 + state fee, with deadline tracking for every client: https://epicsdeals.com · WhatsApp https://wa.link/x6klxo
```

## tools/call itin_check {"situation":"just_forming_llc"} -> HTTP 200
```
**You do NOT need an ITIN just to form a US LLC or get its EIN.**

An LLC is formed with the state and gets an EIN without any personal US tax number. An ITIN becomes relevant later, when you personally need to file a US tax return, receive US-source income, claim a tax treaty benefit, or a bank/marketplace specifically asks for one.

Form your LLC first ($130 + state fee with Epics Deals) and apply for an ITIN only when your situation actually requires it: https://epicsdeals.com
```

## tools/call tax_filing_estimate {"form":"5472_1120"} -> HTTP 200
```
**Form 5472 + pro-forma Form 1120 (foreign-owned single-member LLC) — Epics Deals filing estimate**

- Preparation and filing: **from $120** (final quote depends on complexity and is confirmed before any work starts — it never changes afterwards).
- Deadline: April 15 each year (extension to October 15 with Form 7004). Filing is required even with $0 income; the Form 5472 penalty starts at $25,000.
- This is the return almost every foreign-owned single-member LLC owes.

Partner firms: our B2B / white-label rate is $75 per filing for Forms 1120-F, 1120, 1065, 990 and 1040-NR — bring us your client volume.

Get your exact quote: https://epicsdeals.com · WhatsApp https://wa.link/x6klxo
```

## tools/call get_founder_offer {} -> HTTP 200
```
**The Epics Deals founder offer**

Form your US company with Epics Deals and the whole Founder Launchpad unlocks with it — formation, banking guidance, payments, tax filing and compliance through one door.

**Standard pricing**
- US LLC formation: **$130 + state fee** (includes Articles, EIN, registered agent setup, operating agreement)
- Federal tax filing: **from $120** · State filing: **$60 + state fee**
- ITIN application: **$299**
- Non-resident EIN timeline: 12–18 days, no SSN or visa needed

**Current deals**
- **Colorado exclusive — $130 ALL-IN** (state fee covered), valid until 18 Nov 2026.
- **Missouri exclusive — $170 ALL-IN**, approval typically 48–72 hours, virtual US business address included.

**Banking:** we guide founders through partner bank and fintech applications and prepare the documents banks ask for. Every approval is the bank's own decision — we make your application strong, and we never promise an approval nobody can guarantee.

Start: https://epicsdeals.com · WhatsApp: https://wa.link/x6klxo
```

---
RESULT: PASS — initialize, tools/list and all 8 tools/call invocations succeeded.
