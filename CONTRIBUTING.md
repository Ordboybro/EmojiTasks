# Contributing to EmojiTasks

Thanks for helping improve EmojiTasks.

## Development principles

- Keep the app client-side and dependency-light.
- Preserve safe DOM rendering with `textContent`.
- Treat localStorage as untrusted input.
- Avoid adding remote runtime dependencies or analytics without a clear requirement.
- Preserve keyboard accessibility, responsive behavior and reduced-motion support.

## Local development

Run a local server for consistent browser behavior:

```bash
python -m http.server 8000
```

Then manually verify task creation/editing/deletion, completion and restore, filters, sorting, XP/levels, streaks, achievements, migration and local persistence.

## Pull requests

Keep changes focused. Describe the behavior changed, tests performed and any browser-compatibility or security implications.
