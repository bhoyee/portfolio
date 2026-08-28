<?php

function admin_base_path() {
  $script = $_SERVER['SCRIPT_NAME'] ?? '/admin/index.php';
  $dir = str_replace('\\', '/', dirname((string)$script));
  $dir = rtrim($dir, '/');
  if ($dir === '' || $dir === '.') return '/admin';
  return $dir;
}

function admin_url($path) {
  $base = admin_base_path();
  $path = ltrim((string)$path, '/');
  return $base . '/' . $path;
}

function admin_app_base_path() {
  $adminBase = admin_base_path();
  $appBase = preg_replace('#/admin$#', '', $adminBase);
  return $appBase === null ? '' : (string)$appBase;
}

function app_url($path) {
  $base = admin_app_base_path();
  $path = ltrim((string)$path, '/');
  $full = ($base !== '' ? $base : '') . '/' . $path;
  return '/' . ltrim($full, '/');
}

function admin_session_start() {
  if (session_status() === PHP_SESSION_ACTIVE) return;

  $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
  session_set_cookie_params([
    'lifetime' => 0,
    'path' => admin_base_path(),
    'secure' => $secure,
    'httponly' => true,
    'samesite' => 'Strict',
  ]);
  session_start();
}

function admin_config_path() {
  return __DIR__ . '/admin-config.php';
}

function admin_load_config_or_null() {
  $path = admin_config_path();
  if (!file_exists($path)) return null;
  require_once $path;
  if (!defined('ADMIN_USERNAME') || !defined('ADMIN_PASSWORD_HASH')) return null;
  return [
    'username' => (string)ADMIN_USERNAME,
    'password_hash' => (string)ADMIN_PASSWORD_HASH,
  ];
}

function admin_is_logged_in() {
  admin_session_start();
  return !empty($_SESSION['admin_logged_in']);
}

function admin_require_login() {
  if (admin_is_logged_in()) return;
  $next = $_SERVER['REQUEST_URI'] ?? admin_url('index.php');
  header('Location: ' . admin_url('login.php') . '?next=' . urlencode($next));
  exit;
}

function admin_csrf_token() {
  admin_session_start();
  if (empty($_SESSION['admin_csrf'])) {
    $_SESSION['admin_csrf'] = bin2hex(random_bytes(32));
  }
  return $_SESSION['admin_csrf'];
}

function admin_verify_csrf() {
  admin_session_start();
  $token = $_POST['csrf'] ?? '';
  if (!is_string($token) || $token === '' || empty($_SESSION['admin_csrf']) || !hash_equals($_SESSION['admin_csrf'], $token)) {
    http_response_code(403);
    echo "Invalid CSRF token";
    exit;
  }
}

function admin_set_flash($type, $message) {
  admin_session_start();
  $_SESSION['admin_flash'] = ['type' => $type, 'message' => $message];
}

function admin_pop_flash() {
  admin_session_start();
  $flash = $_SESSION['admin_flash'] ?? null;
  unset($_SESSION['admin_flash']);
  return $flash;
}

function admin_login($username, $password) {
  admin_session_start();

  $cfg = admin_load_config_or_null();
  if (!$cfg) return ['ok' => false, 'error' => 'Admin config missing'];

  if (!hash_equals($cfg['username'], (string)$username)) {
    return ['ok' => false, 'error' => 'Invalid credentials'];
  }
  if (!password_verify((string)$password, $cfg['password_hash'])) {
    return ['ok' => false, 'error' => 'Invalid credentials'];
  }

  $_SESSION['admin_logged_in'] = true;
  $_SESSION['admin_username'] = $cfg['username'];
  return ['ok' => true];
}

function admin_logout() {
  admin_session_start();
  $_SESSION = [];
  if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', $params['secure'] ?? false, $params['httponly'] ?? true);
  }
  session_destroy();
}
