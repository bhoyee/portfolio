<?php

require_once __DIR__ . '/_auth.php';
require_once __DIR__ . '/_layout.php';

admin_require_login();

require_once __DIR__ . '/../api/db.php';
$pdo = get_pdo();

function slugify($s) {
  $s = mb_strtolower(trim((string)$s));
  $s = preg_replace('/[^a-z0-9]+/i', '-', $s);
  $s = trim((string)$s, '-');
  return $s;
}

$slug = trim((string)($_GET['slug'] ?? ''));
$isEdit = $slug !== '';
$post = [
  'slug' => '',
  'title' => '',
  'excerpt' => '',
  'content' => '',
  'cover_image' => '',
  'tags' => '',
  'published' => 1,
  'reading_time' => '',
];

if ($isEdit) {
  $stmt = $pdo->prepare('SELECT slug, title, excerpt, content, cover_image, tags_json, published, reading_time FROM blog_posts WHERE slug = ? LIMIT 1');
  $stmt->execute([$slug]);
  $row = $stmt->fetch();
  if (!$row) {
    admin_set_flash('err', 'Post not found');
    header('Location: ' . admin_url('posts.php'));
    exit;
  }

  $tags = '';
  if (!empty($row['tags_json'])) {
    $decoded = json_decode($row['tags_json'], true);
    if (is_array($decoded)) $tags = implode(', ', array_map('strval', $decoded));
  }

  $post = [
    'slug' => (string)$row['slug'],
    'title' => (string)$row['title'],
    'excerpt' => (string)($row['excerpt'] ?? ''),
    'content' => (string)$row['content'],
    'cover_image' => (string)($row['cover_image'] ?? ''),
    'tags' => $tags,
    'published' => (int)$row['published'] === 1 ? 1 : 0,
    'reading_time' => $row['reading_time'] !== null ? (string)$row['reading_time'] : '',
  ];
}

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  admin_verify_csrf();

  $title = trim((string)($_POST['title'] ?? ''));
  $excerpt = trim((string)($_POST['excerpt'] ?? ''));
  $content = trim((string)($_POST['content'] ?? ''));
  $cover = trim((string)($_POST['cover_image'] ?? ''));
  $tagsRaw = trim((string)($_POST['tags'] ?? ''));
  $published = !empty($_POST['published']) ? 1 : 0;
  $readingTime = trim((string)($_POST['reading_time'] ?? ''));

  $newSlug = $isEdit ? $post['slug'] : trim((string)($_POST['slug'] ?? ''));
  if ($newSlug === '') $newSlug = slugify($title);

  if ($title === '' || $content === '') {
    $error = 'Title and content are required';
  } elseif ($newSlug === '') {
    $error = 'Slug is required';
  } elseif (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $newSlug)) {
    $error = 'Slug must be lowercase letters/numbers with dashes only';
  } else {
    $tags = array_values(array_filter(array_map(function ($t) {
      $t = trim((string)$t);
      return $t !== '' ? $t : null;
    }, preg_split('/,/', $tagsRaw) ?: [])));

    $tagsJson = !empty($tags) ? json_encode($tags) : null;
    $rt = $readingTime !== '' ? (float)$readingTime : null;

    try {
      if ($isEdit) {
        $stmt = $pdo->prepare('
          UPDATE blog_posts
          SET title = ?, excerpt = ?, content = ?, cover_image = ?, tags_json = ?, published = ?, reading_time = ?, updated_at = NOW()
          WHERE slug = ?
        ');
        $stmt->execute([$title, $excerpt !== '' ? $excerpt : null, $content, $cover !== '' ? $cover : null, $tagsJson, $published, $rt, $post['slug']]);
        admin_set_flash('ok', 'Post updated');
        header('Location: ' . admin_url('post-edit.php') . '?slug=' . urlencode($post['slug']));
        exit;
      }

      $stmt = $pdo->prepare('
        INSERT INTO blog_posts (slug, title, excerpt, content, cover_image, tags_json, published, reading_time, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ');
      $stmt->execute([$newSlug, $title, $excerpt !== '' ? $excerpt : null, $content, $cover !== '' ? $cover : null, $tagsJson, $published, $rt]);

      admin_set_flash('ok', 'Post created');
      header('Location: ' . admin_url('post-edit.php') . '?slug=' . urlencode($newSlug));
      exit;
    } catch (Exception $e) {
      $error = 'Failed to save post';
    }
  }

  $post = [
    'slug' => $newSlug,
    'title' => $title,
    'excerpt' => $excerpt,
    'content' => $content,
    'cover_image' => $cover,
    'tags' => $tagsRaw,
    'published' => $published,
    'reading_time' => $readingTime,
  ];
}

admin_page_header($isEdit ? 'Edit Post' : 'New Post');
?>

<div class="row" style="margin-bottom:14px;">
  <div>
    <h1 class="h1" style="margin:0;"><?php echo $isEdit ? 'Edit Post' : 'New Post'; ?></h1>
    <div class="muted" style="margin-top:4px;"><?php echo $isEdit ? htmlspecialchars($post['slug']) : 'Create a new blog post'; ?></div>
  </div>
  <div class="actions">
    <a class="btn" href="<?php echo htmlspecialchars(admin_url('posts.php')); ?>">Back</a>
    <?php if ($isEdit): ?>
      <a class="btn" href="<?php echo htmlspecialchars(app_url('blog/' . urlencode($post['slug']))); ?>" target="_blank" rel="noreferrer">Preview</a>
    <?php endif; ?>
  </div>
</div>

<?php if ($error): ?>
  <div class="flash err"><?php echo htmlspecialchars($error); ?></div>
<?php endif; ?>

<div class="card">
  <form method="post" action="<?php echo $isEdit ? (htmlspecialchars(admin_url('post-edit.php')) . '?slug=' . urlencode($post['slug'])) : htmlspecialchars(admin_url('post-edit.php')); ?>">
    <input type="hidden" name="csrf" value="<?php echo htmlspecialchars(admin_csrf_token()); ?>" />

    <?php if (!$isEdit): ?>
      <label for="slug">Slug (optional)</label>
      <input id="slug" name="slug" value="<?php echo htmlspecialchars($post['slug']); ?>" placeholder="my-post-slug" />
      <div class="muted" style="margin-top:6px;font-size:13px;">Leave blank to auto-generate from the title.</div>
    <?php else: ?>
      <label>Slug</label>
      <div class="tag"><?php echo htmlspecialchars($post['slug']); ?></div>
    <?php endif; ?>

    <label for="title">Title</label>
    <input id="title" name="title" value="<?php echo htmlspecialchars($post['title']); ?>" required />

    <label for="excerpt">Excerpt</label>
    <textarea id="excerpt" name="excerpt" style="min-height:120px;"><?php echo htmlspecialchars($post['excerpt']); ?></textarea>
    <div class="help">Short summary shown on the blog list card (1–3 sentences).</div>

    <label for="content">Content (HTML or Markdown)</label>
    <div class="toolbar" role="toolbar" aria-label="Content formatting">
      <button type="button" class="toolbtn" data-md="h1">H1</button>
      <button type="button" class="toolbtn" data-md="h2">H2</button>
      <button type="button" class="toolbtn" data-md="bold"><b>B</b></button>
      <button type="button" class="toolbtn" data-md="italic"><i>I</i></button>
      <button type="button" class="toolbtn" data-md="quote">Quote</button>
      <button type="button" class="toolbtn" data-md="ul">Bullets</button>
      <button type="button" class="toolbtn" data-md="ol">Numbered</button>
      <button type="button" class="toolbtn" data-md="link">Link</button>
      <button type="button" class="toolbtn" data-md="code">Inline code</button>
      <button type="button" class="toolbtn" data-md="codeblock">Code block</button>
    </div>
    <textarea id="content" class="editor" name="content" required><?php echo htmlspecialchars($post['content']); ?></textarea>
    <div class="help">This field is rendered with Markdown on the site. Use the buttons above to format.</div>

    <label for="cover_image">Cover image URL</label>
    <input id="cover_image" name="cover_image" value="<?php echo htmlspecialchars($post['cover_image']); ?>" placeholder="https://..." />

    <label for="tags">Tags (comma-separated)</label>
    <input id="tags" name="tags" value="<?php echo htmlspecialchars($post['tags']); ?>" placeholder="react, php, mysql" />

    <div class="row" style="margin-top:12px; align-items:flex-end;">
      <div style="flex:1;">
        <label for="reading_time">Reading time (minutes, optional)</label>
        <input id="reading_time" name="reading_time" value="<?php echo htmlspecialchars((string)$post['reading_time']); ?>" placeholder="5" />
      </div>
      <div style="flex:1;">
        <label style="display:flex; align-items:center; gap:10px; margin-top:28px;">
          <input type="checkbox" name="published" value="1" <?php echo (int)$post['published'] === 1 ? 'checked' : ''; ?> style="width:auto;" />
          Published
        </label>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn primary" type="submit"><?php echo $isEdit ? 'Save changes' : 'Create post'; ?></button>
      </div>
    </div>
  </form>
</div>

<?php admin_page_footer(); ?>

<script>
  (function () {
    const textarea = document.getElementById("content");
    if (!textarea) return;

    function getSelectionRange(el) {
      return { start: el.selectionStart || 0, end: el.selectionEnd || 0 };
    }

    function setSelection(el, start, end) {
      el.focus();
      el.setSelectionRange(start, end);
    }

    function wrapSelection(el, before, after, placeholder) {
      const { start, end } = getSelectionRange(el);
      const value = el.value;
      const selected = value.slice(start, end);
      const inner = selected || placeholder || "";
      const next = value.slice(0, start) + before + inner + after + value.slice(end);
      el.value = next;
      const cursorStart = start + before.length;
      const cursorEnd = cursorStart + inner.length;
      setSelection(el, cursorStart, cursorEnd);
    }

    function prefixLines(el, prefix) {
      const { start, end } = getSelectionRange(el);
      const value = el.value;
      const selStart = value.lastIndexOf("\n", start - 1) + 1;
      const selEnd = end;
      const block = value.slice(selStart, selEnd);
      const nextBlock = block.split("\n").map(line => (line.trim() === "" ? line : prefix + line)).join("\n");
      el.value = value.slice(0, selStart) + nextBlock + value.slice(selEnd);
      setSelection(el, selStart, selStart + nextBlock.length);
    }

    function insertAtCursor(el, text) {
      const { start, end } = getSelectionRange(el);
      const value = el.value;
      el.value = value.slice(0, start) + text + value.slice(end);
      const pos = start + text.length;
      setSelection(el, pos, pos);
    }

    function heading(level) {
      const hashes = "#".repeat(level) + " ";
      prefixLines(textarea, hashes);
    }

    function link() {
      const { start, end } = getSelectionRange(textarea);
      const value = textarea.value;
      const selected = value.slice(start, end) || "link text";
      const url = prompt("Paste URL", "https://");
      if (!url) return;
      wrapSelection(textarea, "[", `](${url})`, selected);
    }

    function codeBlock() {
      const lang = prompt("Code language (optional)", "js");
      const language = lang ? String(lang).trim() : "";
      const fence = "```" + language + "\n";
      wrapSelection(textarea, fence, "\n```", "code here");
    }

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-md]");
      if (!btn) return;
      const action = btn.getAttribute("data-md");
      if (!action) return;
      e.preventDefault();

      switch (action) {
        case "h1": heading(1); break;
        case "h2": heading(2); break;
        case "bold": wrapSelection(textarea, "**", "**", "bold text"); break;
        case "italic": wrapSelection(textarea, "_", "_", "italic text"); break;
        case "quote": prefixLines(textarea, "> "); break;
        case "ul": prefixLines(textarea, "- "); break;
        case "ol": prefixLines(textarea, "1. "); break;
        case "link": link(); break;
        case "code": wrapSelection(textarea, "`", "`", "code"); break;
        case "codeblock": codeBlock(); break;
        default: break;
      }
    });

    // Nice-to-have: Tab inserts spaces instead of changing focus.
    textarea.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      e.preventDefault();
      insertAtCursor(textarea, "  ");
    });
  })();
</script>
