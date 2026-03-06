<?php

header('Content-Type: application/json; charset=utf-8');

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

$pdo = get_pdo();

try {
  $stmt = $pdo->query('
    SELECT id, name, issuer, issued, credential_id, verify_url, file_url, published, created_at
    FROM certifications
    WHERE published = 1
    ORDER BY created_at DESC
    LIMIT 200
  ');
  $rows = $stmt->fetchAll();

  $items = array_map(function ($r) {
    return [
      'id' => (string)$r['id'],
      'name' => $r['name'],
      'issuer' => $r['issuer'] ?? '',
      'issued' => $r['issued'] ?? '',
      'credentialId' => $r['credential_id'] ?? '',
      'verifyUrl' => $r['verify_url'] ?? '',
      'fileUrl' => $r['file_url'] ?? '',
      'published' => (bool)$r['published'],
      'created_date' => $r['created_at'],
    ];
  }, $rows);

  respond(200, ['certifications' => $items]);
} catch (Exception $e) {
  respond(500, ['error' => 'Failed to load certifications']);
}

