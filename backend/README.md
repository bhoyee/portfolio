# Backend (shared hosting)

This project is primarily a static Vite site (built into `dist/`).

For shared hosting with PHP + MySQL, the backend endpoints live under `public/api/` so they are copied into `dist/api/` during `vite build`.

If you prefer a separate backend deploy, you can copy `public/api/` to your server and point the frontend to it (same-origin recommended).

Tables/columns are documented in `public/api/schema.sql` and roughly match the `entities/*.json` field structures.

