<?php

require_once __DIR__ . '/db.php';

function respond($status, $payload) {
  http_response_code($status);
  echo json_encode($payload);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
  $slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
  if ($slug === '') respond(400, ['error' => 'Missing slug']);

  $pdo = get_pdo();
  $stmt = $pdo->prepare('
    SELECT id, slug, author_name, content, approved, created_at
    FROM post_comments
    WHERE slug = ? AND approved = 1
    ORDER BY created_at DESC
    LIMIT 200
  ');
  $stmt->execute([$slug]);
  $rows = $stmt->fetchAll();

  $comments = array_map(function ($r) {
    return [
      'id' => (string)$r['id'],
      'slug' => $r['slug'],
      'author_name' => $r['author_name'],
      'content' => $r['content'],
      'approved' => (bool)$r['approved'],
      'created_date' => $r['created_at'],
    ];
  }, $rows);

  respond(200, ['comments' => $comments]);
}

if ($method === 'POST') {
  $body = read_json_body();

  $slug = isset($body['slug']) ? trim($body['slug']) : '';
  $authorName = isset($body['author_name']) ? trim($body['author_name']) : '';
  $authorEmail = isset($body['author_email']) ? trim($body['author_email']) : '';
  $content = isset($body['content']) ? trim($body['content']) : '';

  if ($slug === '' || $authorName === '' || $content === '') {
    respond(400, ['error' => 'Missing slug, author_name, or content']);
  }

  if (mb_strlen($authorName) > 120) respond(400, ['error' => 'author_name too long']);
  if ($authorEmail !== '' && mb_strlen($authorEmail) > 200) respond(400, ['error' => 'author_email too long']);
  if (mb_strlen($content) > 5000) respond(400, ['error' => 'content too long']);

  $pdo = get_pdo();
  try {
    $stmt = $pdo->prepare('
      INSERT INTO post_comments (slug, author_name, author_email, content, approved)
      VALUES (?, ?, ?, ?, 1)
    ');
    $stmt->execute([$slug, $authorName, $authorEmail !== '' ? $authorEmail : null, $content]);

    $id = $pdo->lastInsertId();
    respond(200, [
      'comment' => [
        'id' => (string)$id,
        'slug' => $slug,
        'author_name' => $authorName,
        'author_email' => $authorEmail,
        'content' => $content,
        'approved' => true,
        'created_date' => gmdate('c'),
      ],
    ]);
  } catch (Exception $e) {
    respond(500, ['error' => 'Failed to add comment']);
  }
}

respond(405, ['error' => 'Method not allowed']);

