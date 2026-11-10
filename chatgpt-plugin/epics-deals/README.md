# Epics Deals — ChatGPT plugin package (v1.0.0)

Submission-ready package for the ChatGPT / Codex Plugins directory, built to
OpenAI's Agent Plugins format (developers.openai.com/plugins).

## Contents
- `plugin.json` — portable manifest + OpenAI listing metadata
  (extensions.com.openai.interface)
- `mcp.json` — the one connected MCP server (streamable-http, auth: none)
  → https://epics-deals-mcp.epicsdeals.workers.dev/mcp
- `assets/icon.png` (1024), `assets/icon-512.png`, `assets/logo.png`
  — ED monogram exported from the brand master
- `review/test-cases.md` — 5 positive + 3 negative review test cases
- `pages/` — privacy page draft, support page draft, terms of service draft

## Before you submit (checklist)
1. **Publish the terms page.** plugin.json points termsOfServiceURL at
   https://epicsdeals.com/terms-of-service/ — that URL is currently 404.
   Publish `pages/terms-of-service.md` there first (privacy policy is already
   live at /privacy-policy/, support maps to /contact-us/).
2. **Verify your OpenAI identity** (organization settings, platform.openai.com)
   — organization owners submit; this step is Muhammad's own click.
3. **Upload this ZIP** at platform.openai.com → Plugins → "Upload new or
   existing plugin", choose the verified developer identity.
4. **Connect the MCP server** in the portal (MCPs tab) and complete the
   domain-verification challenge: serve the exact token the portal shows, as
   plain text, at the challenge URL it gives (host on the MCP hostname or an
   eligible parent domain, e.g. epicsdeals.com/.well-known/openai-apps-challenge).
5. **Review details:** paste the test cases from `review/test-cases.md`
   (5 positive, 3 negative); no reviewer credentials needed (no sign-in).
   A short demo video URL is also required by the review form.
6. Resolve any automated findings, then **Submit for review**. After approval,
   choose **Publish plugin**.

## Notes
- Only ONE MCP server can be connected per plugin — this package has exactly one.
- Server changes are picked up automatically after publication (daily scans);
  metadata changes need a new ZIP upload.
- Do not rename the plugin `name` ("epics-deals") after publication.
