<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

function respond($status, $payload) {
  http_response_code($status);
  echo json_encode($payload);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
  $slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
  $userId = isset($_GET['user_id']) ? trim($_GET['user_id']) : '';
  if ($slug === '') respond(400, ['error' => 'Missing slug']);

  $pdo = get_pdo();

  $stmt = $pdo->prepare('SELECT COUNT(*) AS cnt FROM post_likes WHERE slug = ?');
  $stmt->execute([$slug]);
  $count = (int)($stmt->fetch()['cnt'] ?? 0);

  $liked = false;
  if ($userId !== '') {
    $stmt2 = $pdo->prepare('SELECT 1 FROM post_likes WHERE slug = ? AND user_id = ? LIMIT 1');
    $stmt2->execute([$slug, $userId]);
    $liked = (bool)$stmt2->fetch();
  }

  respond(200, ['count' => $count, 'liked' => $liked]);
}

if ($method === 'POST') {
  $body = read_json_body();
  $slug = isset($body['slug']) ? trim($body['slug']) : '';
  $userId = isset($body['user_id']) ? trim($body['user_id']) : '';
  if ($slug === '' || $userId === '') respond(400, ['error' => 'Missing slug or user_id']);

  $pdo = get_pdo();

  $pdo->beginTransaction();
  try {
    $stmt = $pdo->prepare('SELECT 1 FROM post_likes WHERE slug = ? AND user_id = ? LIMIT 1');
    $stmt->execute([$slug, $userId]);
    $exists = (bool)$stmt->fetch();

    if ($exists) {
      $del = $pdo->prepare('DELETE FROM post_likes WHERE slug = ? AND user_id = ?');
      $del->execute([$slug, $userId]);
      $liked = false;
    } else {
      $ins = $pdo->prepare('INSERT INTO post_likes (slug, user_id) VALUES (?, ?)');
      $ins->execute([$slug, $userId]);
      $liked = true;
    }

    $stmt2 = $pdo->prepare('SELECT COUNT(*) AS cnt FROM post_likes WHERE slug = ?');
    $stmt2->execute([$slug]);
    $count = (int)($stmt2->fetch()['cnt'] ?? 0);

    $pdo->commit();
    respond(200, ['count' => $count, 'liked' => $liked]);
  } catch (Exception $e) {
    $pdo->rollBack();
    respond(500, ['error' => 'Failed to toggle like']);
  }
}

respond(405, ['error' => 'Method not allowed']);
