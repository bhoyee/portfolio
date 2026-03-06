<?php

require_once __DIR__ . '/_auth.php';
require_once __DIR__ . '/_layout.php';

admin_require_login();

require_once __DIR__ . '/../api/db.php';
$pdo = get_pdo();

$total = (int)($pdo->query('SELECT COUNT(*) AS c FROM blog_posts')->fetch()['c'] ?? 0);
$published = (int)($pdo->query('SELECT COUNT(*) AS c FROM blog_posts WHERE published = 1')->fetch()['c'] ?? 0);
$drafts = (int)($pdo->query('SELECT COUNT(*) AS c FROM blog_posts WHERE published = 0')->fetch()['c'] ?? 0);

admin_page_header('Dashboard');
?>

<div class="row" style="margin-bottom:14px;">
  <h1 class="h1" style="margin:0;">Dashboard</h1>
  <div class="actions">
    <a class="btn primary" href="/admin/post-edit.php">New Post</a>
  </div>
</div>

<div class="grid">
  <div class="card">
    <div class="muted">Total blog posts</div>
    <div style="font-size:32px;font-weight:800;margin-top:6px;"><?php echo $total; ?></div>
  </div>
  <div class="card">
    <div class="muted">Published</div>
    <div style="font-size:32px;font-weight:800;margin-top:6px;"><?php echo $published; ?></div>
  </div>
  <div class="card">
    <div class="muted">Drafts</div>
    <div style="font-size:32px;font-weight:800;margin-top:6px;"><?php echo $drafts; ?></div>
  </div>
</div>

<div style="margin-top:14px;" class="card">
  <div class="row">
    <div>
      <div style="font-weight:700;">Quick links</div>
      <div class="muted" style="margin-top:4px;">Manage your content from one place.</div>
    </div>
    <div class="actions">
      <a class="btn" href="/admin/posts.php">Manage Posts</a>
      <a class="btn" href="/" target="_blank" rel="noreferrer">View site</a>
    </div>
  </div>
</div>

<?php admin_page_footer(); ?>

