<?php

require_once __DIR__ . '/_auth.php';

admin_require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo "Method not allowed";
  exit;
}

admin_verify_csrf();

$slug = trim((string)($_POST['slug'] ?? ''));
if ($slug === '') {
  admin_set_flash('err', 'Missing slug');
  header('Location: /admin/posts.php');
  exit;
}

require_once __DIR__ . '/../api/db.php';
$pdo = get_pdo();

try {
  $stmt = $pdo->prepare('DELETE FROM blog_posts WHERE slug = ?');
  $stmt->execute([$slug]);
  admin_set_flash('ok', 'Post deleted');
} catch (Exception $e) {
  admin_set_flash('err', 'Failed to delete post');
}

header('Location: /admin/posts.php');
exit;

