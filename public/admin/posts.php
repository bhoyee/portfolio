<?php

require_once __DIR__ . '/_auth.php';
require_once __DIR__ . '/_layout.php';

admin_require_login();

require_once __DIR__ . '/../api/db.php';
$pdo = get_pdo();

$q = trim((string)($_GET['q'] ?? ''));

if ($q !== '') {
  $stmt = $pdo->prepare('
    SELECT slug, title, excerpt, published, created_at, updated_at
    FROM blog_posts
    WHERE slug LIKE ? OR title LIKE ?
    ORDER BY created_at DESC
    LIMIT 300
  ');
  $like = '%' . $q . '%';
  $stmt->execute([$like, $like]);
  $posts = $stmt->fetchAll();
} else {
  $stmt = $pdo->query('
    SELECT slug, title, excerpt, published, created_at, updated_at
    FROM blog_posts
    ORDER BY created_at DESC
    LIMIT 300
  ');
  $posts = $stmt->fetchAll();
}

admin_page_header('Blog Posts');
?>

<div class="row" style="margin-bottom:14px;">
  <div>
    <h1 class="h1" style="margin:0;">Blog Posts</h1>
    <div class="muted" style="margin-top:4px;"><?php echo count($posts); ?> shown</div>
  </div>
  <div class="actions">
    <a class="btn primary" href="<?php echo htmlspecialchars(admin_url('post-edit.php')); ?>">New Post</a>
  </div>
</div>

<div class="card" style="margin-bottom:14px;">
  <form method="get" action="<?php echo htmlspecialchars(admin_url('posts.php')); ?>" class="row" style="gap:10px;">
    <input name="q" placeholder="Search title or slug…" value="<?php echo htmlspecialchars($q); ?>" />
    <button class="btn" type="submit">Search</button>
    <?php if ($q !== ''): ?>
      <a class="btn" href="<?php echo htmlspecialchars(admin_url('posts.php')); ?>">Clear</a>
    <?php endif; ?>
  </form>
</div>

<div class="card">
  <table>
    <thead>
      <tr>
        <th style="width:34%;">Title</th>
        <th>Slug</th>
        <th>Status</th>
        <th>Created</th>
        <th>Updated</th>
        <th style="width:18%;">Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php if (empty($posts)): ?>
        <tr><td colspan="6" class="muted">No posts found.</td></tr>
      <?php endif; ?>
      <?php foreach ($posts as $p): ?>
        <tr>
          <td>
            <div style="font-weight:700;"><?php echo htmlspecialchars((string)$p['title']); ?></div>
            <?php if (!empty($p['excerpt'])): ?>
              <div class="muted" style="margin-top:4px; font-size:13px;">
                <?php echo htmlspecialchars(mb_strimwidth((string)$p['excerpt'], 0, 120, '…')); ?>
              </div>
            <?php endif; ?>
          </td>
          <td class="muted"><?php echo htmlspecialchars((string)$p['slug']); ?></td>
          <td>
            <?php if ((int)$p['published'] === 1): ?>
              <span class="tag">Published</span>
            <?php else: ?>
              <span class="tag">Draft</span>
            <?php endif; ?>
          </td>
          <td class="muted"><?php echo htmlspecialchars((string)$p['created_at']); ?></td>
          <td class="muted"><?php echo htmlspecialchars((string)($p['updated_at'] ?? '')); ?></td>
          <td>
            <div class="actions">
              <a class="btn" href="<?php echo htmlspecialchars(admin_url('post-edit.php')) . '?slug=' . urlencode((string)$p['slug']); ?>">Edit</a>
              <form method="post" action="<?php echo htmlspecialchars(admin_url('post-delete.php')); ?>" onsubmit="return confirm('Delete this post?');" style="margin:0;">
                <input type="hidden" name="csrf" value="<?php echo htmlspecialchars(admin_csrf_token()); ?>" />
                <input type="hidden" name="slug" value="<?php echo htmlspecialchars((string)$p['slug']); ?>" />
                <button class="btn danger" type="submit">Delete</button>
              </form>
            </div>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>

<?php admin_page_footer(); ?>
