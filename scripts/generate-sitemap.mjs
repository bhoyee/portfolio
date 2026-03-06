import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = process.env.SITE_URL?.replace(/\/+$/, "") || "https://salisu.dev";

const workspaceRoot = process.cwd();
const blogDir = path.join(workspaceRoot, "src", "content", "blog");
const publicDir = path.join(workspaceRoot, "public");

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

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

const getBlogSlugs = async () => {
  try {
    const entries = await fs.readdir(blogDir, { withFileTypes: true });
    const mdFiles = entries.filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".md")).map((e) => e.name);
    const slugs = [];
    for (const file of mdFiles) {
      const fullPath = path.join(blogDir, file);
      const raw = await fs.readFile(fullPath, "utf8");
      const { frontmatter } = parseFrontmatter(raw);
      if (frontmatter.published === false) continue;
      const defaultSlug = file.replace(/\.md$/i, "");
      const slug = (frontmatter.slug || defaultSlug).toString().trim();
      if (slug) slugs.push(slug);
    }
    return slugs;
  } catch {
    return [];
  }
};

const buildUrlEntry = (urlPath) => {
  const loc = `${SITE_URL}${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}`;
  return `  <url><loc>${escapeXml(loc)}</loc></url>`;
};

const run = async () => {
  const blogSlugs = await getBlogSlugs();

  const paths = [
    "/",
    "/Portfolio",
    "/Blog",
    ...blogSlugs.map((s) => `/blog/${encodeURIComponent(s)}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${paths.map(buildUrlEntry).join("\n")}\n` +
    `</urlset>\n`;

  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, "sitemap.xml"), xml, "utf8");
};

await run();

