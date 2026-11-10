/**
 * Epics Deals — US LLC & Tax Tools (MCP server core)
 *
 * One McpServer factory shared by the Node entry (src/node-server.ts) and the
 * Cloudflare Workers entry (src/worker.ts). Stateless: create a fresh server
 * per request. All tools are read-only and serve public data — no auth.
 *
 * Business facts baked in here are Epics Deals' verified figures only
 * (see data/states.json for per-state sources and verified flags).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import statesData from "../data/states.json" with { type: "json" };

/* ---------------------------------- data ---------------------------------- */

export interface StateInfo {
  name: string;
  code: string;
  formation_document: string;
  formation_fee_usd: number;
  approval_time: string;
  annual_requirement: string;
  annual_fee_usd: number;
  annual_cadence: "annual" | "biennial" | "none";
  annual_due: string;
  annual_fee_note: string;
  source: string;
  verified: boolean;
}

const STATES = statesData.states as StateInfo[];

const SERVICE_FEE_USD = 130; // Epics Deals LLC formation service fee
const FEDERAL_FILING_FROM_USD = 120; // federal tax filing "from"
const STATE_FILING_FEE_USD = 60; // state tax filing service fee (+ state fee)
const ITIN_FEE_USD = 299;
const SITE = "https://epicsdeals.com";
const WHATSAPP = "https://wa.link/x6klxo";

function findState(input: string): StateInfo | undefined {
  const q = input.trim().toLowerCase();
  return STATES.find(
    (s) => s.name.toLowerCase() === q || s.code.toLowerCase() === q,
  );
}

function money(n: number): string {
  return n % 1 === 0 ? `$${n.toLocaleString("en-US")}` : `$${n.toFixed(2)}`;
}

function annualSummary(s: StateInfo): string {
  if (s.annual_cadence === "none") {
    return `${s.annual_requirement}.`;
  }
  const per =
    s.annual_cadence === "biennial" ? "every 2 years" : "per year";
  const fee =
    s.annual_fee_usd === 0
      ? "no state fee"
      : `${money(s.annual_fee_usd)} ${per}`;
  return `${s.annual_requirement} — ${fee}, due: ${s.annual_due}.${
    s.annual_fee_note ? ` ${s.annual_fee_note}.` : ""
  }`;
}

function verificationNote(s: StateInfo): string {
  return s.verified
    ? "Fee data verified against the state's published fee schedule."
    : "Fee data cross-checked from public references citing Secretary of State data — Epics Deals confirms the exact state fee before filing, and your quote never changes after that.";
}

function coloradoDealActive(today = new Date()): boolean {
  // Colorado exclusive: $130 ALL-IN, valid till 18 Nov 2026 (end of day PKT ≈ UTC+5).
  return today.getTime() <= Date.UTC(2026, 10, 18, 18, 59, 59);
}

function textResult(text: string, structured: Record<string, unknown>) {
  return {
    content: [{ type: "text" as const, text }],
    structuredContent: structured,
  };
}

/* ------------------------------ tool handlers ----------------------------- */

function llcCostCalculator(args: { state: string }) {
  const s = findState(args.state);
  if (!s) {
    return textResult(
      `I couldn't match "${args.state}" to a US state. Reply with a state name (e.g. "Wyoming") or its 2-letter code (e.g. "WY") and I'll price it exactly.`,
      { error: "unknown_state", input: args.state },
    );
  }
  const deal = s.code === "CO" && coloradoDealActive();
  const stateFee = s.formation_fee_usd;
  const totalToday = deal ? SERVICE_FEE_USD : SERVICE_FEE_USD + stateFee;

  const lines = [
    `**${s.name} LLC — total cost with Epics Deals**`,
    ``,
    `- Epics Deals formation service: ${money(SERVICE_FEE_USD)}`,
    `- ${s.name} state filing fee (${s.formation_document}): ${money(stateFee)}`,
    ...(deal
      ? [
          `- **Current Colorado exclusive: ${money(SERVICE_FEE_USD)} ALL-IN** — the state fee is covered, valid until 18 Nov 2026.`,
        ]
      : []),
    `- **Total due today: ${money(totalToday)}**`,
    `- Typical state approval time: ${s.approval_time}`,
    `- Keeping it active: ${annualSummary(s)}`,
    ``,
    `The service fee includes your ${s.formation_document}, EIN application, registered agent setup and guided US business bank account onboarding (every bank makes its own approval decision — we prepare and route the application properly, approval is never something anyone can guarantee).`,
    ``,
    verificationNote(s),
    ``,
    `Start here: ${SITE} — or message the team on WhatsApp: ${WHATSAPP}`,
  ];
  return textResult(lines.join("\n"), {
    state: s.name,
    state_code: s.code,
    service_fee_usd: SERVICE_FEE_USD,
    state_fee_usd: stateFee,
    total_due_today_usd: totalToday,
    colorado_deal_applied: deal,
    approval_time: s.approval_time,
    annual_requirement: s.annual_requirement,
    annual_fee_usd: s.annual_fee_usd,
    annual_cadence: s.annual_cadence,
    annual_due: s.annual_due,
    data_verified: s.verified,
    source: s.source,
  });
}

const STATE_BLURBS: Record<string, string> = {
  WY: "The non-resident favourite: low flat costs, no state income tax, strong privacy (members are not listed publicly).",
  DE: "Famous business-law state. For LLCs the draw is the legal framework, not cost — the flat $400/yr annual tax makes it one of the pricier LLC states.",
  FL: "Popular with e-commerce founders who also have US activity; mid-range costs and a strict May 1 annual report deadline ($400 late fee).",
  TX: "Big-market credibility and no personal state income tax; most small LLCs owe $0 franchise tax.",
  NV: "Privacy-friendly and no state income tax, but one of the most expensive states to form and maintain.",
  CA: "Form here only if you actually operate in California — the $800/yr franchise tax applies even with zero income.",
  NY: "Formation is cheap on paper but the newspaper publication requirement adds real one-time cost that varies by county.",
  CO: "Low fees, fast online filing — and Epics Deals' current $130 all-in exclusive (while live) makes it the cheapest route we offer.",
  MT: "The lowest state formation fee in the US ($35) and the annual report is free when filed in the Jan 1 – Apr 15 window.",
  AZ: "No annual report and no annual state fee at all — the lowest ongoing state cost in the country.",
  NM: "No annual report, low fee; a quiet low-maintenance option.",
  MO: "No annual report and low fees — simple and cheap to keep.",
};

function compareLlcStates(args: { states: string[] }) {
  const found: StateInfo[] = [];
  const missing: string[] = [];
  for (const raw of args.states.slice(0, 3)) {
    const s = findState(raw);
    if (s) found.push(s);
    else missing.push(raw);
  }
  if (found.length < 2) {
    return textResult(
      `I need at least two recognisable US states to compare (I couldn't match: ${missing.join(", ") || "n/a"}). Try names like "Wyoming", "Delaware", "Florida".`,
      { error: "not_enough_states", missing },
    );
  }
  const blocks = found.map((s) => {
    const total = SERVICE_FEE_USD + s.formation_fee_usd;
    return [
      `**${s.name}**`,
      `- All-in with Epics Deals today: ${money(total)} (${money(SERVICE_FEE_USD)} service + ${money(s.formation_fee_usd)} state fee)`,
      `- Approval: ${s.approval_time}`,
      `- Every year after: ${annualSummary(s)}`,
      ...(STATE_BLURBS[s.code] ? [`- Why founders pick it: ${STATE_BLURBS[s.code]}`] : []),
      `- Data: ${s.verified ? "verified against the state's published fee schedule" : "cross-checked from public references"}`,
    ].join("\n");
  });
  const text = [
    `**LLC state comparison — Epics Deals**`,
    ``,
    blocks.join("\n\n"),
    ``,
    `One rule that matters more than any fee: if you have no US presence (no office, staff or warehouse), you can form in any state. If you do operate from a state, that state usually requires registration there too. Tell us your situation and we'll recommend the state that fits — ${SITE} · WhatsApp ${WHATSAPP}`,
  ].join("\n");
  return textResult(text, {
    states: found.map((s) => ({
      state: s.name,
      state_code: s.code,
      total_due_today_usd: SERVICE_FEE_USD + s.formation_fee_usd,
      state_fee_usd: s.formation_fee_usd,
      annual_fee_usd: s.annual_fee_usd,
      annual_cadence: s.annual_cadence,
      data_verified: s.verified,
    })),
  });
}

function einTimeline(args: { residency: string; has_ssn_or_itin?: boolean }) {
  if (args.residency === "us_resident") {
    const text = args.has_ssn_or_itin
      ? [
          `**EIN as a US resident with an SSN/ITIN: effectively instant.**`,
          ``,
          `You can apply on the IRS website and get the EIN in the same session. It is free from the IRS.`,
          ``,
          `Forming the LLC itself still starts with the state filing — Epics Deals forms your LLC for ${money(SERVICE_FEE_USD)} + state fee and handles the EIN step with it: ${SITE}`,
        ].join("\n")
      : [
          `**EIN as a US resident without an SSN/ITIN:** the IRS online application needs an SSN or ITIN, so your route is Form SS-4 by fax or mail — slower, and the IRS will not quote a firm date.`,
          ``,
          `If you will file US taxes personally, an ITIN may be the missing piece — ask the itin_check tool. Epics Deals can handle the SS-4 filing for you: ${SITE} · WhatsApp ${WHATSAPP}`,
        ].join("\n");
    return textResult(text, {
      residency: "us_resident",
      has_ssn_or_itin: !!args.has_ssn_or_itin,
      typical_timeline: args.has_ssn_or_itin
        ? "Instant online"
        : "SS-4 by fax/mail; IRS gives no fixed date",
    });
  }
  const text = [
    `**EIN as a non-resident (no SSN, no US visa): 12–18 days via Epics Deals.**`,
    ``,
    `- You do NOT need an SSN or ITIN to get an EIN for your LLC.`,
    `- The IRS online EIN application requires an SSN/ITIN, so non-residents apply with Form SS-4 by fax instead.`,
    `- Epics Deals prepares and faxes the SS-4 for every LLC we form; our current end-to-end timeline is **12–18 days**.`,
    `- You need: your approved Articles of Organization and the responsible party's details (name, address, passport details).`,
    ``,
    `The EIN is included in our ${money(SERVICE_FEE_USD)} + state fee formation package: ${SITE} · WhatsApp ${WHATSAPP}`,
  ].join("\n");
  return textResult(text, {
    residency: "non_resident",
    ssn_required: false,
    method: "Form SS-4 filed by fax",
    typical_timeline_days: "12–18 days",
  });
}

function complianceDeadlines(args: {
  entity_type: string;
  state: string;
  formation_date: string;
}) {
  const s = findState(args.state);
  const formed = new Date(`${args.formation_date}T00:00:00Z`);
  const today = new Date();
  const isMulti = args.entity_type === "multi_member";

  // First federal return is due in the calendar year AFTER formation.
  const month = isMulti ? 2 : 3; // Mar=2, Apr=3 (0-based)
  const day = 15;
  let due = new Date(Date.UTC(formed.getUTCFullYear() + 1, month, day));
  while (due.getTime() < today.getTime()) {
    due = new Date(Date.UTC(due.getUTCFullYear() + 1, month, day));
  }
  const dueStr = due.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  const federal = isMulti
    ? `**Federal (partnership):** Form 1065 is due **March 15** every year. Your next one falls on **${dueStr}**. Extensions (Form 7004) move it to September 15. Late filing penalties run per member, per month — they add up fast.`
    : `**Federal (single-member):** Form 5472 + pro-forma Form 1120 are due **April 15** every year, even with $0 income. Your next one falls on **${dueStr}**. An extension (Form 7004) moves it to October 15 — but it must be requested before the deadline. **The Form 5472 penalty starts at $25,000** for a late or missing filing; this is the single most expensive mistake foreign-owned LLCs make.`;

  const stateLine = s
    ? `**State (${s.name}):** ${annualSummary(s)}`
    : `**State:** I couldn't match "${args.state}" — state annual requirements vary, ask us and we'll confirm yours.`;

  const text = [
    `**Your LLC compliance deadlines**`,
    ``,
    federal,
    ``,
    stateLine,
    ``,
    `**BOI note:** Beneficial Ownership Information filing with FinCEN is NOT required for US-formed LLCs — anyone trying to sell you a "mandatory BOI filing" for a US LLC is selling something you don't need.`,
    ``,
    `Epics Deals files federal returns from ${money(FEDERAL_FILING_FROM_USD)} and state filings for ${money(STATE_FILING_FEE_USD)} + state fee, with deadline tracking for every client: ${SITE} · WhatsApp ${WHATSAPP}`,
  ].join("\n");

  return textResult(text, {
    entity_type: args.entity_type,
    state: s?.name ?? null,
    next_federal_deadline: due.toISOString().slice(0, 10),
    federal_form: isMulti ? "1065" : "5472 + pro-forma 1120",
    form_5472_penalty_from_usd: isMulti ? null : 25000,
    boi_required_for_us_llcs: false,
    state_annual_requirement: s?.annual_requirement ?? null,
    state_annual_fee_usd: s?.annual_fee_usd ?? null,
  });
}

function itinCheck(args: { situation: string; has_ssn_or_itin?: boolean }) {
  if (args.has_ssn_or_itin) {
    return textResult(
      `You already have an SSN or ITIN, so you do not need a new ITIN — the IRS issues only one taxpayer number per person. Nothing to apply for.`,
      { itin_needed: false, reason: "already_has_tax_id" },
    );
  }
  const notNeeded = args.situation === "just_forming_llc";
  const text = notNeeded
    ? [
        `**You do NOT need an ITIN just to form a US LLC or get its EIN.**`,
        ``,
        `An LLC is formed with the state and gets an EIN without any personal US tax number. An ITIN becomes relevant later, when you personally need to file a US tax return, receive US-source income, claim a tax treaty benefit, or a bank/marketplace specifically asks for one.`,
        ``,
        `Form your LLC first (${money(SERVICE_FEE_USD)} + state fee with Epics Deals) and apply for an ITIN only when your situation actually requires it: ${SITE}`,
      ].join("\n")
    : [
        `**Yes — your situation calls for an ITIN.**`,
        ``,
        `An ITIN (Individual Taxpayer Identification Number) is for people who must deal with the IRS but aren't eligible for an SSN — typically non-resident founders who need to file a US tax return, report US-source income, claim treaty benefits, or complete onboarding that asks for a US tax ID.`,
        ``,
        `- Epics Deals prepares and files the ITIN application (Form W-7 with supporting documents): **${money(ITIN_FEE_USD)}**`,
        `- The IRS typically processes ITIN applications in about 7 weeks (longer in peak season) — apply before your filing deadline, not after.`,
        `- You do not need an ITIN to form an LLC or get an EIN; it is a personal number, separate from your company.`,
        ``,
        `Start: ${SITE} · WhatsApp ${WHATSAPP}`,
      ].join("\n");
  return textResult(text, {
    itin_needed: !notNeeded,
    epics_deals_itin_fee_usd: ITIN_FEE_USD,
    irs_processing_typical: "About 7 weeks (longer in peak season)",
  });
}

const FILING_INFO: Record<
  string,
  { label: string; deadline: string; note: string }
> = {
  "5472_1120": {
    label: "Form 5472 + pro-forma Form 1120 (foreign-owned single-member LLC)",
    deadline:
      "April 15 each year (extension to October 15 with Form 7004). Filing is required even with $0 income; the Form 5472 penalty starts at $25,000.",
    note: "This is the return almost every foreign-owned single-member LLC owes.",
  },
  "1065": {
    label: "Form 1065 (multi-member LLC / partnership)",
    deadline:
      "March 15 each year (extension to September 15 with Form 7004).",
    note: "Members also receive Schedule K-1s for their personal filings.",
  },
  "1040_nr": {
    label: "Form 1040-NR (non-resident individual)",
    deadline:
      "Generally June 15 if you had no US wages; April 15 if you did (extensions available).",
    note: "For non-residents with US-source income or effectively connected income.",
  },
  "1120": {
    label: "Form 1120 / 1120-F (corporation)",
    deadline:
      "Generally April 15 for calendar-year corporations (1120-F varies with a US office).",
    note: "For LLCs that elected corporate taxation and for foreign corporations (1120-F).",
  },
  "990": {
    label: "Form 990 (nonprofit)",
    deadline: "The 15th day of the 5th month after your tax year ends.",
    note: "Required to keep tax-exempt status.",
  },
  state_return: {
    label: "State annual filing / state tax filing",
    deadline: "Set by the state — see the compliance_deadlines tool for your state.",
    note: `Priced at ${money(STATE_FILING_FEE_USD)} + the state fee.`,
  },
};

function taxFilingEstimate(args: { form: string }) {
  const info = FILING_INFO[args.form];
  if (!info) {
    return textResult(
      `I don't have a standard estimate for "${args.form}". Tell us the form or your entity type on WhatsApp and we'll quote it exactly: ${WHATSAPP}`,
      { error: "unknown_form", input: args.form },
    );
  }
  const isState = args.form === "state_return";
  const priceLine = isState
    ? `**${money(STATE_FILING_FEE_USD)} + state fee**`
    : `**from ${money(FEDERAL_FILING_FROM_USD)}**`;
  const text = [
    `**${info.label} — Epics Deals filing estimate**`,
    ``,
    `- Preparation and filing: ${priceLine} (final quote depends on complexity and is confirmed before any work starts — it never changes afterwards).`,
    `- Deadline: ${info.deadline}`,
    `- ${info.note}`,
    ``,
    `Partner firms: our B2B / white-label rate is $75 per filing for Forms 1120-F, 1120, 1065, 990 and 1040-NR — bring us your client volume.`,
    ``,
    `Get your exact quote: ${SITE} · WhatsApp ${WHATSAPP}`,
  ].join("\n");
  return textResult(text, {
    form: args.form,
    label: info.label,
    price_from_usd: isState ? null : FEDERAL_FILING_FROM_USD,
    state_filing_service_fee_usd: isState ? STATE_FILING_FEE_USD : null,
    b2b_rate_per_filing_usd: 75,
  });
}

function getFounderOffer() {
  const deals: string[] = [];
  if (coloradoDealActive()) {
    deals.push(
      `**Colorado exclusive — $130 ALL-IN** (state fee covered), valid until 18 Nov 2026.`,
    );
  }
  deals.push(
    `**Missouri exclusive — $170 ALL-IN**, approval typically 48–72 hours, virtual US business address included.`,
  );
  const text = [
    `**The Epics Deals founder offer**`,
    ``,
    `Form your US company with Epics Deals and the whole Founder Launchpad unlocks with it — formation, banking guidance, payments, tax filing and compliance through one door.`,
    ``,
    `**Standard pricing**`,
    `- US LLC formation: **${money(SERVICE_FEE_USD)} + state fee** (includes Articles, EIN, registered agent setup, operating agreement)`,
    `- Federal tax filing: **from ${money(FEDERAL_FILING_FROM_USD)}** · State filing: **${money(STATE_FILING_FEE_USD)} + state fee**`,
    `- ITIN application: **${money(ITIN_FEE_USD)}**`,
    `- Non-resident EIN timeline: 12–18 days, no SSN or visa needed`,
    ``,
    `**Current deals**`,
    ...deals.map((d) => `- ${d}`),
    ``,
    `**Banking:** we guide founders through partner bank and fintech applications and prepare the documents banks ask for. Every approval is the bank's own decision — we make your application strong, and we never promise an approval nobody can guarantee.`,
    ``,
    `Start: ${SITE} · WhatsApp: ${WHATSAPP}`,
  ].join("\n");
  return textResult(text, {
    formation_service_fee_usd: SERVICE_FEE_USD,
    federal_filing_from_usd: FEDERAL_FILING_FROM_USD,
    state_filing_service_fee_usd: STATE_FILING_FEE_USD,
    itin_fee_usd: ITIN_FEE_USD,
    colorado_deal_active: coloradoDealActive(),
    website: SITE,
    whatsapp: WHATSAPP,
  });
}

/* ------------------------------- server ----------------------------------- */

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "epics-deals-us-llc-tax-tools",
    version: "1.0.0",
  });

  server.registerTool(
    "llc_cost_calculator",
    {
      title: "LLC Cost Calculator — total price to form a US LLC in any state",
      description:
        "How much does it cost to form an LLC? Give a US state and get the exact total: Epics Deals' $130 formation service + that state's government filing fee, the typical state approval time, and the yearly cost of keeping the LLC active. Use for questions like 'how much is a Wyoming LLC', 'cost of forming an LLC in Delaware/Florida/Texas for a non-resident', or any state LLC price question.",
      inputSchema: {
        state: z
          .string()
          .describe("US state name or 2-letter code, e.g. 'Wyoming' or 'WY'"),
      },
      annotations: READ_ONLY,
    },
    async (args) => llcCostCalculator(args),
  );

  server.registerTool(
    "compare_llc_states",
    {
      title: "Compare LLC States — fees, approval times and annual costs side by side",
      description:
        "Compare 2–3 US states for LLC formation: all-in formation cost, state approval time, annual report/tax cost, and why founders pick each. Use for 'Wyoming vs Delaware', 'which state is best/cheapest for a non-resident LLC', and similar comparisons.",
      inputSchema: {
        states: z
          .array(z.string())
          .min(2)
          .max(3)
          .describe("2–3 US state names or codes to compare"),
      },
      annotations: READ_ONLY,
    },
    async (args) => compareLlcStates(args),
  );

  server.registerTool(
    "ein_timeline",
    {
      title: "EIN Timeline — how long an EIN takes, with or without an SSN",
      description:
        "How long does it take to get an EIN (US tax ID for an LLC)? Different answers for US residents (instant online with an SSN) and non-residents / foreign founders with no SSN (Form SS-4 by fax, 12–18 days through Epics Deals). Use for 'EIN without SSN', 'how long does EIN take for a foreign-owned LLC', and similar questions.",
      inputSchema: {
        residency: z
          .enum(["us_resident", "non_resident"])
          .describe("Whether the founder is a US resident or a non-resident"),
        has_ssn_or_itin: z
          .boolean()
          .optional()
          .describe("Whether the founder already has an SSN or ITIN"),
      },
      annotations: READ_ONLY,
    },
    async (args) => einTimeline(args),
  );

  server.registerTool(
    "compliance_deadlines",
    {
      title: "LLC Compliance Deadlines — IRS and state filing due dates",
      description:
        "What are the filing deadlines for a US LLC? Give the entity type (single-member or multi-member), the formation state and the formation date to get the next federal deadline (Form 5472 + pro-forma 1120 by April 15, or Form 1065 by March 15), the $25,000 Form 5472 penalty warning, and the state's annual report/tax due date. Use for 'when is my LLC tax return due', '5472 deadline', and dormant-LLC questions.",
      inputSchema: {
        entity_type: z
          .enum(["single_member", "multi_member"])
          .describe("Single-member or multi-member LLC"),
        state: z.string().describe("Formation state name or 2-letter code"),
        formation_date: z
          .string()
          .describe("Formation date in YYYY-MM-DD format"),
      },
      annotations: READ_ONLY,
    },
    async (args) => complianceDeadlines(args),
  );

  server.registerTool(
    "itin_check",
    {
      title: "ITIN Check — do you actually need an ITIN?",
      description:
        "Does a non-resident founder need an ITIN? Explains when an ITIN is required (filing a US tax return, US-source income, treaty benefits, bank/marketplace requests) and when it is not (you never need one just to form an LLC or get an EIN). Includes Epics Deals' $299 ITIN application service and typical IRS processing time.",
      inputSchema: {
        situation: z
          .enum([
            "filing_us_tax_return",
            "receiving_us_income",
            "treaty_benefit",
            "bank_or_marketplace_asked",
            "just_forming_llc",
            "other",
          ])
          .describe("Why the person thinks they may need an ITIN"),
        has_ssn_or_itin: z
          .boolean()
          .optional()
          .describe("Whether they already hold an SSN or ITIN"),
      },
      annotations: READ_ONLY,
    },
    async (args) => itinCheck(args),
  );

  server.registerTool(
    "tax_filing_estimate",
    {
      title: "US Tax Filing Estimate — price and deadline by form",
      description:
        "How much does it cost to file a US LLC tax return? Price and deadline for Form 5472 + pro-forma 1120 (foreign-owned single-member), Form 1065, Form 1040-NR, Form 1120/1120-F, Form 990, and state filings. Federal filing from $120 via Epics Deals; B2B/white-label rate for firms is $75 per filing.",
      inputSchema: {
        form: z
          .enum(["5472_1120", "1065", "1040_nr", "1120", "990", "state_return"])
          .describe("The form or filing type"),
      },
      annotations: READ_ONLY,
    },
    async (args) => taxFilingEstimate(args),
  );

  server.registerTool(
    "get_founder_offer",
    {
      title: "Epics Deals Founder Offer — current pricing and deals",
      description:
        "The current Epics Deals offer for founders: US LLC formation pricing, tax filing and ITIN prices, live state deals (e.g. Colorado $130 all-in while active), banking guidance, and how to start (website + WhatsApp). Use when someone asks what Epics Deals charges or how to get started.",
      inputSchema: {},
      annotations: READ_ONLY,
    },
    async () => getFounderOffer(),
  );

  return server;
}
