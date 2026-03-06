<?php

header('Content-Type: application/json; charset=utf-8');

function respond($status, $payload) {
  http_response_code($status);
  echo json_encode($payload);
  exit;
}

$configPath = __DIR__ . '/db-config.php';
if (!file_exists($configPath)) {
  respond(500, [
    'error' => 'Database config missing',
    'hint' => 'Copy backend/api/db-config.sample.php to backend/api/db-config.php and set your MySQL credentials.',
  ]);
}

require_once $configPath;

try {
  $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
  $pdo = new PDO($dsn, DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
} catch (Exception $e) {
  respond(500, ['error' => 'Database connection failed']);
}

function get_pdo() {
  global $pdo;
  return $pdo;
}

function read_json_body() {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

