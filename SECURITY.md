# Security Policy

We take the security of this project seriously. Thank you for helping keep it and its users safe.

## Reporting a vulnerability

**Please do not open a public issue for security vulnerabilities.**

Instead, report it privately by email to **security@example.com** with:

- a description of the issue and its impact,
- the steps to reproduce it (a proof of concept if possible),
- the affected component (client, server/API, infrastructure) and version/commit.

We aim to:

- acknowledge your report within **48 hours**,
- provide an initial assessment within **5 business days**,
- keep you informed until the issue is resolved.

We support coordinated disclosure: please give us reasonable time to ship a fix before any public disclosure.

## Scope

In scope:

- The Express API (`server/`) — authentication, the anti-SSRF guards (`parseSourceUrl`, `assertAllowedMediaUrl`), the media streaming proxy, rate limiting.
- The web client (`client/`) — XSS, CSP bypass, sensitive data exposure.
- The Docker / Nginx configuration shipped in this repository.

Out of scope:

- Vulnerabilities in `yt-dlp` itself or in the upstream platforms (Twitter/X, YouTube, etc.) — report those to their respective maintainers.
- Denial of service from sending traffic that simply exceeds the configured rate limits.
- Findings that require a compromised host or a modified build.

## Security model (summary)

- **Anti-SSRF, two layers**: source URLs are validated against a per-platform host allowlist; the media proxy only streams from an allowlisted set of CDN host suffixes over HTTPS.
- **No content stored**: media is fetched on demand and streamed to the user; nothing is persisted server-side.
- **Auth**: admin access uses bcrypt-hashed credentials and signed JWTs; comparisons are constant-time to avoid user-enumeration via timing.
- **Hardening**: Helmet headers, a strict Content-Security-Policy at the edge (Nginx), request-body size limits, per-route rate limiting, an upstream-fetch timeout and a max media size on the proxy.
- **Secrets**: kept in `server/.env` (git-ignored); never commit `.env` or `cookies.txt`.

## Abuse / content takedown

For copyright or abuse reports (not security vulnerabilities), see the in-app **DMCA & Content Removal** page or email **dmca@example.com**.
