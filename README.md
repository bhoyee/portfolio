# Salisu Abdulhamid — Portfolio

Software Engineer with 5+ years of experience building and shipping production web applications. I focus on clean UI, reliable APIs, and pragmatic architecture that scales with real-world requirements.

This repo contains my portfolio site (React + Vite) with a blog, likes, comments, and a contact form designed to run on typical shared hosting (PHP + MySQL).

## Highlights

- Modern, responsive portfolio layout with smooth navigation
- Blog list + blog detail pages
- Like + share + comments on blog posts
- Contact form that saves messages server-side
- Works as a static site with optional PHP APIs

## Tech stack

- Frontend: React, Vite, Tailwind CSS, TanStack Query, Framer Motion
- Backend (shared hosting): PHP + MySQL (in `public/api`)

## Run locally (Windows / PowerShell)

- Install: `npm.cmd install`
- Dev server: `npm.cmd run dev`

If PowerShell blocks `npm` because `npm.ps1` isn't digitally signed:

- Use `npm.cmd ...` (as shown above), or
- Run `.\dev.cmd`

## Blog content

Blog posts can come from either:

- **PHP + MySQL** (recommended for shared hosting), via `public/api/posts.php`
- Local Markdown files in `src/content/blog/*.md` (fallback if the backend isn't available)

Note: `entities/*.json` are schemas (they describe fields), not blog post content.

## Shared hosting setup (PHP + MySQL)

The frontend calls:

- `public/api/posts.php` (blog posts)
- `public/api/likes.php` (likes + count)
- `public/api/comments.php` (comments)
- `public/api/contact.php` (contact messages)

Steps:

1) Create a MySQL database and user on your hosting.
2) Import `public/api/schema.sql` (or create equivalent tables via your migrations).
3) Copy `public/api/db-config.sample.php` → `public/api/db-config.php` and set credentials (on the server).
4) Deploy `dist/` to your web root (e.g. `public_html/`). Ensure `dist/api/*.php` exists (it comes from `public/api`).

If the PHP API isn't available, likes/comments fall back to local-only demo storage in the browser (so they won't be shared across visitors).

## CI/CD (GitHub Actions → shared hosting)

This repo includes a workflow that builds the site and deploys `dist/` to shared hosting when you push to the `staging` branch:

- `.github/workflows/deploy-staging.yml`

Configure these GitHub repo secrets:

- `SSH_HOST` — your hosting SSH hostname (or IP)
- `SSH_PORT` — usually `22`
- `SSH_USER` — SSH username
- `SSH_PRIVATE_KEY` — private key for the SSH user (no passphrase recommended for Actions)
- `SSH_TARGET_DIR` — web root directory (example: `/home/<user>/public_html`)
- `DEPLOY_CLEAN` — optional: set to `true` to delete target folder contents before upload

The workflow runs `npm ci`, `npm run build`, then uploads `dist/*` to `SSH_TARGET_DIR`.
