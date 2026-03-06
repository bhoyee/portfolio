<?php

header('Content-Type: application/json; charset=utf-8');

function respond($status, $payload) {
  http_response_code($status);
  echo json_encode($payload);
  exit;
}

$path = __DIR__ . '/../uploads/resume/resume.pdf';
$url = '/uploads/resume/resume.pdf';

if (file_exists($path)) {
  $size = @filesize($path);
  $mtime = @filemtime($path);
  respond(200, [
    'ok' => true,
    'url' => $url,
    'size_bytes' => $size !== false ? (int)$size : null,
    'updated_at' => $mtime !== false ? gmdate('c', (int)$mtime) : null,
  ]);
}

respond(200, [
  'ok' => true,
  'url' => null,
]);

