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

const upsertMeta = (html, { title, description, url, image, ogType = "website" }) => {
  const safeTitle = title.replace(/</g, "").replace(/>/g, "");
  const safeDesc = description.replace(/</g, "").replace(/>/g, "");

  const replace = (pattern, replacement) => (html.match(pattern) ? html.replace(pattern, replacement) : html);

  let out = html;
  out = replace(/<title>.*?<\/title>/i, `<title>${safeTitle}</title>`);
  out = replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${safeDesc}" />`);

  out = replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${ogType}" />`);
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

const upsertArticleJsonLd = (html, article) => {
  const payload = JSON.stringify(article);
  const removeExisting = html.replace(/<script\s+type="application\/ld\+json"\s+data-schema="article">[\s\S]*?<\/script>\s*/i, "");

  if (removeExisting.includes("</head>")) {
    return removeExisting.replace(
      /<\/head>/i,
      `  <script type="application/ld+json" data-schema="article">${payload}</script>\n  </head>`
    );
  }
  return removeExisting;
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

  // Pre-render key SPA routes so they get their own metadata when shared on social/search.
  const portfolioHtml = upsertMeta(indexHtml, {
    title: "Salisu Adeboye | Software Engineer",
    description: "Software Engineer with 5+ years of experience building production web applications - clean UI, reliable APIs, and pragmatic architecture.",
    url: `${SITE_URL}/Portfolio`,
    image: DEFAULT_IMAGE,
    ogType: "website",
  });
  await fs.mkdir(path.join(distDir, "Portfolio"), { recursive: true });
  await fs.writeFile(path.join(distDir, "Portfolio", "index.html"), portfolioHtml, "utf8");

  const blogListHtml = upsertMeta(indexHtml, {
    title: "Blog | salisu.dev",
    description: "Technical writings on system design, architecture, and lessons learned from building production systems.",
    url: `${SITE_URL}/Blog`,
    image: DEFAULT_IMAGE,
    ogType: "website",
  });
  await fs.mkdir(path.join(distDir, "Blog"), { recursive: true });
  await fs.writeFile(path.join(distDir, "Blog", "index.html"), blogListHtml, "utf8");

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

    let html = upsertMeta(indexHtml, { title, description: excerpt, url, image, ogType: "article" });

    const datePublished = (frontmatter.date || frontmatter.created_date || "").toString().trim();
    const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
    const articleLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": (frontmatter.title || slug).toString(),
      "description": excerpt,
      "image": image,
      "url": url,
      "author": {
        "@type": "Person",
        "name": "Salisu Adeboye",
        "url": SITE_URL,
      },
      ...(datePublished ? { "datePublished": datePublished } : {}),
      ...(tags.length ? { "keywords": tags.join(", ") } : {}),
    };
    html = upsertArticleJsonLd(html, articleLd);

    const targetDir = path.join(distDir, "blog", sanitized);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(targetDir, "index.html"), html, "utf8");
  }
};

await run();
