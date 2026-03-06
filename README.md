# portfolio

## Run locally (Windows / PowerShell)

1) Install dependencies:

- `npm.cmd install`

2) Start dev server:

- `npm.cmd run dev`

If PowerShell blocks `npm` because `npm.ps1` isn't digitally signed, use:

- `npm.cmd ...` (as shown above), or
- `.\dev.cmd`

## Blog content (no Base44)

Blog posts can come from either:

- **PHP + MySQL** (recommended for shared hosting), via `public/api/posts.php`, or
- Local Markdown files in `src/content/blog/*.md` (fallback if the backend isn't available).

Note: `entities/*.json` are **schemas** (they describe fields), not blog post content.

## Likes, comments, contact (shared hosting PHP + MySQL)

The frontend calls these endpoints:

- `public/api/posts.php`
- `public/api/likes.php`
- `public/api/comments.php`
- `public/api/contact.php`

Setup:

1) Create a MySQL database and user on your hosting.
2) Import `public/api/schema.sql` (or create equivalent tables via your migrations).
3) Copy `public/api/db-config.sample.php` to `public/api/db-config.php` and set credentials (do this on the server).
4) Deploy `dist/` to your web root (e.g. `public_html/`). Make sure `dist/api/*.php` is deployed too (it comes from `public/api`).

If the PHP API isn't available, the UI falls back to local-only demo storage in the browser (so likes/comments won't be shared across visitors).

## Base44 (optional)

Base44 is disabled by default. To enable the Base44 Vite plugin, start Vite with:

- `USE_BASE44=true npm.cmd run dev`

