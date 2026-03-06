<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/lib/settings.php';

function respond($status, $payload) {
  http_response_code($status);
  echo json_encode($payload);
  exit;
}

$pdo = get_pdo();

// Default to enabled unless explicitly disabled in settings.
$enabled = settings_get_bool($pdo, 'open_source_enabled', true);

if (!$enabled) {
  respond(200, ['ok' => true, 'enabled' => false, 'items' => []]);
}

$limitRaw = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
$limit = $limitRaw > 0 ? min($limitRaw, 200) : 50;

try {
  $stmt = $pdo->prepare('
    SELECT id, name, description, repo_url, stars, forks, language, contribution, tags_json
    FROM open_source_projects
    WHERE published = 1
    ORDER BY sort_order ASC, created_at DESC
    LIMIT ?
  ');
  $stmt->bindValue(1, $limit, PDO::PARAM_INT);
  $stmt->execute();
  $rows = $stmt->fetchAll();

  $items = [];
  foreach ($rows as $r) {
    $tags = [];
    if (!empty($r['tags_json'])) {
      $decoded = json_decode((string)$r['tags_json'], true);
      if (is_array($decoded)) {
        foreach ($decoded as $t) {
          if (is_string($t) && trim($t) !== '') $tags[] = trim($t);
        }
      }
    }

    $items[] = [
      'id' => (int)$r['id'],
      'name' => (string)$r['name'],
      'description' => $r['description'] !== null ? (string)$r['description'] : '',
      'repoUrl' => (string)$r['repo_url'],
      'stars' => $r['stars'] !== null ? (int)$r['stars'] : null,
      'forks' => $r['forks'] !== null ? (int)$r['forks'] : null,
      'language' => $r['language'] !== null ? (string)$r['language'] : null,
      'contribution' => $r['contribution'] !== null ? (string)$r['contribution'] : null,
      'tags' => $tags,
    ];
  }

  respond(200, [
    'ok' => true,
    'enabled' => true,
    'items' => $items,
  ]);
} catch (Exception $e) {
  error_log('[portfolio-open-source] error=' . $e->getMessage());
  respond(200, [
    'ok' => true,
    'enabled' => true,
    'items' => [],
  ]);
}

