/**
 * Local / self-hosted Node entry.
 *
 * Serves the stateless Streamable-HTTP MCP endpoint at POST /mcp
 * (plus GET /health). Uses the Web Standard transport — the exact same code
 * path that runs on Cloudflare Workers (src/worker.ts) — with a thin
 * node:http adapter around it.
 *
 * Run: npm run build && npm start   (PORT env, default 8787)
 */

import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createServer } from "./server.js";

const PORT = Number(process.env.PORT ?? 8787);

async function toFetchRequest(req: IncomingMessage): Promise<Request> {
  const url = `http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else if (value) headers.set(key, value);
  }
  let body: Buffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    body = Buffer.concat(chunks);
  }
  return new Request(url, { method: req.method, headers, body });
}

async function sendFetchResponse(res: ServerResponse, response: Response) {
  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  if (response.body) {
    Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
  } else {
    res.end();
  }
}

const httpServer = createHttpServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    if (url.pathname === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, server: "epics-deals-mcp" }));
      return;
    }
    if (url.pathname !== "/mcp") {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "not_found", hint: "POST JSON-RPC to /mcp" }));
      return;
    }
    // Stateless: a fresh server + transport per request.
    const mcpServer = createServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await mcpServer.connect(transport);
    const response = await transport.handleRequest(await toFetchRequest(req));
    await sendFetchResponse(res, response);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "internal_error" }));
  }
});

httpServer.listen(PORT, () => {
  console.log(`epics-deals-mcp listening on http://localhost:${PORT}/mcp`);
});
