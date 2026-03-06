const parseFrontmatter = (raw) => {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }

  const frontmatterBlock = match[1];
  const body = raw.slice(match[0].length);
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
    else if (/^-?\d+(\.\d+)?$/.test(value)) value = Number(value);
    else if (value.startsWith("[") && value.endsWith("]")) {
      const inner = value.slice(1, -1).trim();
      value = inner
        ? inner.split(",").map((t) => t.trim()).filter(Boolean).map((t) => t.replace(/^['"]|['"]$/g, ""))
        : [];
    }

    frontmatter[key] = value;
  }

  return { frontmatter, body };
};

const contentModules = import.meta.glob("/src/content/blog/*.md", { as: "raw", eager: true });

export const getAllPosts = () => {
  const posts = Object.entries(contentModules).map(([path, raw]) => {
    const { frontmatter, body } = parseFrontmatter(raw);

    const slugFromFilename = path.split("/").pop().replace(/\.md$/, "");
    const slug = frontmatter.slug || slugFromFilename;

    return {
      id: slug,
      slug,
      title: frontmatter.title || slug,
      excerpt: frontmatter.excerpt || "",
      content: body,
      cover_image: frontmatter.cover_image || "",
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      published: frontmatter.published !== false,
      reading_time: typeof frontmatter.reading_time === "number" ? frontmatter.reading_time : undefined,
      created_date: frontmatter.date || frontmatter.created_date || "",
    };
  });

  return posts
    .filter((p) => p.published)
    .sort((a, b) => {
      const aTime = a.created_date ? new Date(a.created_date).getTime() : 0;
      const bTime = b.created_date ? new Date(b.created_date).getTime() : 0;
      return bTime - aTime;
    });
};

export const getPostBySlug = (slug) => {
  return getAllPosts().find((p) => p.slug === slug || p.id === slug);
};

