/**
 * Minimal MCP Streamable-HTTP test client (no SDK dependency).
 * Runs initialize -> tools/list -> tools/call for EVERY tool and prints a
 * Markdown transcript to stdout.
 *
 * Usage: MCP_URL=http://localhost:8799/mcp node scripts/test-client.mjs
 */
const URL_ = process.env.MCP_URL ?? "http://localhost:8787/mcp";
let id = 0;

async function rpc(method, params) {
  const res = await fetch(URL_, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
  });
  const raw = await res.text();
  // Streamable HTTP may answer with SSE framing — extract the JSON payload.
  let payload = raw;
  if (raw.includes("data:")) {
    const lines = raw
      .split("\n")
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).trim());
    payload = lines[lines.length - 1] ?? "";
  }
  try {
    return { status: res.status, json: JSON.parse(payload) };
  } catch {
    return { status: res.status, json: null, raw };
  }
}

async function notify(method) {
  await fetch(URL_, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", method }),
  });
}

const out = [];
const log = (s = "") => out.push(s);

log(`# MCP local test transcript`);
log(`Endpoint: ${URL_}`);
log(`Date: ${new Date().toISOString()}`);
log();

const init = await rpc("initialize", {
  protocolVersion: "2025-03-26",
  capabilities: {},
  clientInfo: { name: "epics-deals-test-client", version: "1.0.0" },
});
log(`## initialize -> HTTP ${init.status}`);
log("```json");
log(JSON.stringify(init.json?.result ?? init.json, null, 2));
log("```");
log();
await notify("notifications/initialized");

const list = await rpc("tools/list", {});
const tools = list.json?.result?.tools ?? [];
log(`## tools/list -> HTTP ${list.status} (${tools.length} tools)`);
for (const t of tools) {
  log(
    `- **${t.name}** — title: "${t.title ?? ""}" — annotations: ${JSON.stringify(t.annotations)}`,
  );
}
log();

const calls = [
  ["llc_cost_calculator", { state: "Wyoming" }],
  ["llc_cost_calculator", { state: "Colorado" }],
  ["compare_llc_states", { states: ["Wyoming", "Delaware", "Montana"] }],
  ["ein_timeline", { residency: "non_resident" }],
  [
    "compliance_deadlines",
    { entity_type: "single_member", state: "Wyoming", formation_date: "2026-03-10" },
  ],
  ["itin_check", { situation: "just_forming_llc" }],
  ["tax_filing_estimate", { form: "5472_1120" }],
  ["get_founder_offer", {}],
];

let failures = 0;
for (const [name, args] of calls) {
  const r = await rpc("tools/call", { name, arguments: args });
  const text = r.json?.result?.content?.map((c) => c.text ?? "").join("\n") ?? "";
  const isError = r.json?.result?.isError || r.json?.error;
  if (isError || !text) failures++;
  log(`## tools/call ${name} ${JSON.stringify(args)} -> HTTP ${r.status}${isError ? " (ERROR)" : ""}`);
  log("```");
  log(text || JSON.stringify(r.json ?? r.raw, null, 2));
  log("```");
  log();
}

log(`---`);
log(
  failures === 0
    ? `RESULT: PASS — initialize, tools/list and all ${calls.length} tools/call invocations succeeded.`
    : `RESULT: FAIL — ${failures} call(s) failed.`,
);
console.log(out.join("\n"));
process.exit(failures === 0 ? 0 : 1);
