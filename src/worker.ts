/**
 * Cloudflare Workers entry (Phase 2 hosting target: https://mcp.epicsdeals.com).
 *
 * Same stateless Web Standard transport as the Node entry. Deploy with:
 *   npx wrangler deploy
 * (wrangler.toml points at the compiled dist/worker.js; a Cloudflare account
 * and the mcp.epicsdeals.com DNS route are the only external requirements.)
 */

import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createServer } from "./server.js";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({ ok: true, server: "epics-deals-mcp" });
    }
    if (url.pathname !== "/mcp") {
      return Response.json(
        { error: "not_found", hint: "POST JSON-RPC to /mcp" },
        { status: 404 },
      );
    }
    // Stateless: a fresh server + transport per request.
    const mcpServer = createServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await mcpServer.connect(transport);
    return transport.handleRequest(request);
  },
};
