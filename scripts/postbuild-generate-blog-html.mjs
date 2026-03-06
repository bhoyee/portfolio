import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = process.env.SITE_URL?.replace(/\/+$/, "") || "https://salisu.dev";
const DEFAULT_IMAGE = `${SITE_URL}/salisu.png`;

const workspaceRoot = process.cwd();
const blogDir = path.join(workspaceRoot, "src", "content", "blog");
const distDir = path.join(workspaceRoot, "dist");

const parseFrontmatter = (raw) => {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
  if (!match) return { frontmatter: {}, body: raw };
  const frontmatterBlock = match[1];
  const frontmatter = {};
  for (const line of frontmatterBlock.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;
    const key = trimmed.slice(0, colonIndex).trim();
    let value = trimmed.slice(colonIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value === "true") value = true;
    else if (value === "false") value = false;
    frontmatter[key] = value;
  }
  return { frontmatter, body: raw.slice(match[0].length) };
};

const sanitizeSlugForPath = (slug) => {
  if (slug.includes("/") || slug.includes("\\") || slug.includes("..")) return null;
  return slug;
};

const upsertMeta = (html, { title, description, url, image }) => {
  const safeTitle = title.replace(/</g, "").replace(/>/g, "");
  const safeDesc = description.replace(/</g, "").replace(/>/g, "");

  const replace = (pattern, replacement) => (html.match(pattern) ? html.replace(pattern, replacement) : html);

  let out = html;
  out = replace(/<title>.*?<\/title>/i, `<title>${safeTitle}</title>`);
  out = replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${safeDesc}" />`);

  out = replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${safeTitle}" />`);
  out = replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${safeDesc}" />`);
  out = replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${url}" />`);
  out = replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${image}" />`);

  out = replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${safeTitle}" />`);
  out = replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${safeDesc}" />`);
  out = replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${image}" />`);

  out = replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${url}" />`);

  return out;
};

const run = async () => {
  const indexHtmlPath = path.join(distDir, "index.html");
  let indexHtml;
  try {
    indexHtml = await fs.readFile(indexHtmlPath, "utf8");
  } catch {
    // No dist yet.
    return;
  }

  let entries = [];
  try {
    entries = await fs.readdir(blogDir, { withFileTypes: true });
  } catch {
    return;
  }

  const mdFiles = entries.filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".md")).map((e) => e.name);
  for (const file of mdFiles) {
    const raw = await fs.readFile(path.join(blogDir, file), "utf8");
    const { frontmatter, body } = parseFrontmatter(raw);
    if (frontmatter.published === false) continue;

    const defaultSlug = file.replace(/\.md$/i, "");
    const slug = (frontmatter.slug || defaultSlug).toString().trim();
    const sanitized = sanitizeSlugForPath(slug);
    if (!sanitized) continue;

    const title = frontmatter.title ? `${frontmatter.title} | salisu.dev` : `${slug} | salisu.dev`;
    const excerpt =
      (frontmatter.excerpt || "").toString().trim() ||
      body.split(/\r?\n\r?\n/).find((p) => p.trim() && !p.trim().startsWith("#"))?.trim().slice(0, 180) ||
      "Read the latest post on salisu.dev.";

    const url = `${SITE_URL}/blog/${encodeURIComponent(slug)}`;
    const image = (frontmatter.cover_image || "").toString().trim() || DEFAULT_IMAGE;

    const html = upsertMeta(indexHtml, { title, description: excerpt, url, image });

    const targetDir = path.join(distDir, "blog", sanitized);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(targetDir, "index.html"), html, "utf8");
  }
};

await run();

