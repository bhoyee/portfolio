<?php

require_once __DIR__ . '/db.php';

function respond($status, $payload) {
  http_response_code($status);
  echo json_encode($payload);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'GET') {
  respond(405, ['error' => 'Method not allowed']);
}

$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

$limit = max(1, min(200, $limit));
$offset = max(0, $offset);

$pdo = get_pdo();

if ($slug !== '') {
  $stmt = $pdo->prepare('
    SELECT slug, title, excerpt, content, cover_image, tags_json, published, reading_time, created_at
    FROM blog_posts
    WHERE slug = ? AND published = 1
    LIMIT 1
  ');
  $stmt->execute([$slug]);
  $row = $stmt->fetch();
  if (!$row) respond(404, ['error' => 'Not found']);

  $tags = [];
  if (!empty($row['tags_json'])) {
    $decoded = json_decode($row['tags_json'], true);
    if (is_array($decoded)) $tags = $decoded;
  }

  respond(200, [
    'post' => [
      'id' => $row['slug'],
      'slug' => $row['slug'],
      'title' => $row['title'],
      'excerpt' => $row['excerpt'] ?? '',
      'content' => $row['content'],
      'cover_image' => $row['cover_image'] ?? '',
      'tags' => $tags,
      'published' => (bool)$row['published'],
      'reading_time' => $row['reading_time'] !== null ? (float)$row['reading_time'] : null,
      'created_date' => $row['created_at'],
    ],
  ]);
}

$stmt = $pdo->prepare('
  SELECT slug, title, excerpt, content, cover_image, tags_json, published, reading_time, created_at
  FROM blog_posts
  WHERE published = 1
  ORDER BY created_at DESC
  LIMIT ? OFFSET ?
');
$stmt->bindValue(1, $limit, PDO::PARAM_INT);
$stmt->bindValue(2, $offset, PDO::PARAM_INT);
$stmt->execute();
$rows = $stmt->fetchAll();

$posts = array_map(function ($row) {
  $tags = [];
  if (!empty($row['tags_json'])) {
    $decoded = json_decode($row['tags_json'], true);
    if (is_array($decoded)) $tags = $decoded;
  }
  return [
    'id' => $row['slug'],
    'slug' => $row['slug'],
    'title' => $row['title'],
    'excerpt' => $row['excerpt'] ?? '',
    // Keep list response light; Blog page only needs summary fields.
    'cover_image' => $row['cover_image'] ?? '',
    'tags' => $tags,
    'published' => (bool)$row['published'],
    'reading_time' => $row['reading_time'] !== null ? (float)$row['reading_time'] : null,
    'created_date' => $row['created_at'],
  ];
}, $rows);

respond(200, ['posts' => $posts]);

