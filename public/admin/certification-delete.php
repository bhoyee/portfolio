<?php

require_once __DIR__ . '/_auth.php';

admin_require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo "Method not allowed";
  exit;
}

admin_verify_csrf();

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if ($id <= 0) {
  admin_set_flash('err', 'Missing id');
  header('Location: /admin/certifications.php');
  exit;
}

require_once __DIR__ . '/../api/db.php';
$pdo = get_pdo();

try {
  $stmt = $pdo->prepare('DELETE FROM certifications WHERE id = ?');
  $stmt->execute([$id]);
  admin_set_flash('ok', 'Certification deleted');
} catch (Exception $e) {
  admin_set_flash('err', 'Failed to delete certification');
}

header('Location: /admin/certifications.php');
exit;

