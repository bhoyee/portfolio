<?php

header('Content-Type: application/json; charset=utf-8');

function respond($status, $payload) {
  http_response_code($status);
  echo json_encode($payload);
  exit;
}

function db_env($key, $allowEmpty = false) {
  $value = getenv($key);
  if ($value === false) return null;
  $value = (string)$value;
  if ($allowEmpty) return $value;
  $value = trim($value);
  return $value === '' ? null : $value;
}

function load_db_config() {
  $configPath = __DIR__ . '/db-config.php';
  if (file_exists($configPath)) {
    require_once $configPath;
    return [
      'host' => defined('DB_HOST') ? DB_HOST : null,
      'port' => defined('DB_PORT') ? (int)DB_PORT : 3306,
      'name' => defined('DB_NAME') ? DB_NAME : null,
      'user' => defined('DB_USER') ? DB_USER : null,
      'pass' => defined('DB_PASS') ? DB_PASS : null,
      'charset' => defined('DB_CHARSET') ? DB_CHARSET : 'utf8mb4',
    ];
  }

  // CI / local dev fallback: use environment variables (no secrets committed).
  $host = db_env('DB_HOST');
  $name = db_env('DB_NAME');
  $user = db_env('DB_USER');
  $pass = db_env('DB_PASS', true);
  $charset = db_env('DB_CHARSET') ?? 'utf8mb4';
  $portRaw = db_env('DB_PORT');
  $port = $portRaw !== null ? (int)$portRaw : 3306;

  return [
    'host' => $host,
    'port' => $port,
    'name' => $name,
    'user' => $user,
    'pass' => $pass,
    'charset' => $charset,
  ];
}

$cfg = load_db_config();
if (empty($cfg['host']) || empty($cfg['name']) || empty($cfg['user']) || $cfg['pass'] === null) {
  respond(500, [
    'error' => 'Database config missing',
    'hint' => 'Create public/api/db-config.php (copy db-config.sample.php) OR set DB_HOST/DB_NAME/DB_USER/DB_PASS env vars on the server.',
  ]);
}

try {
  $dsn = 'mysql:host=' . $cfg['host'] . ';port=' . (int)$cfg['port'] . ';dbname=' . $cfg['name'] . ';charset=' . $cfg['charset'];
  $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [
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
