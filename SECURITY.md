# Security Policy

EmojiTasks is a client-side productivity application. Task data and progression state are stored locally in the browser; the project does not provide a backend or account service.

## Reporting a vulnerability

Please report security-sensitive issues privately through GitHub rather than publishing exploit details in a public issue. Include the affected browser/environment, reproduction steps, impact, and a minimal proof of concept when appropriate.

Never include real credentials, private data, or other secrets in a report.

## Security principles

- Keep user-controlled task text rendered as text, not executable HTML.
- Do not introduce unnecessary third-party runtime scripts.
- Do not transmit task data without an explicit product requirement.
- Treat localStorage as untrusted input and validate state when loading it.
- Prefer browser cryptographic APIs for identifiers where available.
