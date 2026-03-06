<?php

require_once __DIR__ . '/_auth.php';

admin_require_login();

require_once __DIR__ . '/../api/db.php';
$pdo = get_pdo();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo "Method not allowed";
  exit;
}

admin_verify_csrf();

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if ($id <= 0) {
  admin_set_flash('err', 'Missing id');
  header('Location: /admin/open-source.php');
  exit;
}

try {
  $stmt = $pdo->prepare('DELETE FROM open_source_projects WHERE id = ?');
  $stmt->execute([$id]);
  admin_set_flash('ok', 'Item deleted.');
} catch (Exception $e) {
  error_log('[admin-open-source-delete] error=' . $e->getMessage());
  admin_set_flash('err', 'Failed to delete item.');
}

header('Location: /admin/open-source.php');
exit;
