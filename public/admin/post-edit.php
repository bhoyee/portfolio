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
    header('Location: /admin/posts.php');
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
        header('Location: /admin/post-edit.php?slug=' . urlencode($post['slug']));
        exit;
      }

      $stmt = $pdo->prepare('
        INSERT INTO blog_posts (slug, title, excerpt, content, cover_image, tags_json, published, reading_time, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ');
      $stmt->execute([$newSlug, $title, $excerpt !== '' ? $excerpt : null, $content, $cover !== '' ? $cover : null, $tagsJson, $published, $rt]);

      admin_set_flash('ok', 'Post created');
      header('Location: /admin/post-edit.php?slug=' . urlencode($newSlug));
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
    <a class="btn" href="/admin/posts.php">Back</a>
    <?php if ($isEdit): ?>
      <a class="btn" href="/blog/<?php echo urlencode($post['slug']); ?>" target="_blank" rel="noreferrer">Preview</a>
    <?php endif; ?>
  </div>
</div>

<?php if ($error): ?>
  <div class="flash err"><?php echo htmlspecialchars($error); ?></div>
<?php endif; ?>

<div class="card">
  <form method="post" action="<?php echo $isEdit ? '/admin/post-edit.php?slug=' . urlencode($post['slug']) : '/admin/post-edit.php'; ?>">
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

    <label for="content">Content (HTML or Markdown)</label>
    <textarea id="content" name="content" required><?php echo htmlspecialchars($post['content']); ?></textarea>

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

