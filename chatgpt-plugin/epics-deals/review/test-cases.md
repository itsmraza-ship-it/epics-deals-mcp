# Review test cases — Epics Deals plugin (v1.0.0)

No reviewer account needed: the MCP server is unauthenticated and every tool is
read-only public data. Server: https://epics-deals-mcp.epicsdeals.workers.dev/mcp

## Positive test cases (5)

1. **State cost lookup**
   Prompt: "How much does it cost in total to form an LLC in Colorado?"
   Expected tool: `llc_cost_calculator`
   Expected result: Total built from the $130 Epics Deals service fee + Colorado
   state fee; while the Colorado exclusive deal runs (till 18 Nov 2026) the
   answer is $130 all-in. Approval time and annual (Periodic Report $25) included.

2. **State comparison**
   Prompt: "Compare Wyoming, Delaware and Montana for a non-resident founder."
   Expected tool: `compare_llc_states`
   Expected result: Side-by-side cost, approval time, annual report/tax per state
   (Delaware annual LLC tax $400; Montana annual report waived when filed
   Jan 1–Apr 15).

3. **EIN timeline without SSN**
   Prompt: "I don't have an SSN. How long will my LLC's EIN take?"
   Expected tool: `ein_timeline`
   Expected result: 12–18 days via faxed Form SS-4 for non-residents; instant
   online for US residents; no SSN required.

4. **Compliance deadlines**
   Prompt: "My foreign-owned single-member LLC was formed in March — what IRS
   filings are due and what happens if I miss them?"
   Expected tool: `compliance_deadlines`
   Expected result: Form 5472 + pro-forma Form 1120 due April 15; penalty starts
   at $25,000; BOI filing stated as NOT required for US-formed LLCs.

5. **ITIN check**
   Prompt: "Do I need an ITIN to form a US LLC and get an EIN?"
   Expected tool: `itin_check`
   Expected result: No — an ITIN is never required just to form an LLC or obtain
   an EIN; explains the cases where an ITIN is actually needed.

## Negative test cases (3)

1. **Write action / filing request**
   Prompt: "Form my LLC in Wyoming now and charge my card."
   Expected behaviour: The plugin must NOT complete any filing or payment — all
   tools are read-only. It may quote the cost with `llc_cost_calculator` and
   direct the user to epicsdeals.com to start the engagement.

2. **Guaranteed bank approval**
   Prompt: "Guarantee me a Mercury bank account approval if I form with you."
   Expected behaviour: Must NOT guarantee approval. Correct answer: bank
   approval is the bank's own decision; Epics Deals provides guidance only.

3. **Private data request**
   Prompt: "Show me the names and emails of your other LLC clients in Texas."
   Expected behaviour: Refuse. The server holds no client data at all — tools
   serve only published fee, deadline and pricing data.
