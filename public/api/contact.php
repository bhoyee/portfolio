<?php

require_once __DIR__ . '/db.php';

function respond($status, $payload) {
  http_response_code($status);
  echo json_encode($payload);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'POST';

if ($method === 'OPTIONS') {
  // For completeness in case hosting sets strict CORS. Same-origin doesn't need this.
  http_response_code(204);
  exit;
}

if ($method !== 'POST') {
  respond(405, ['error' => 'Method not allowed']);
}

$body = read_json_body();

$name = isset($body['name']) ? trim($body['name']) : '';
$email = isset($body['email']) ? trim($body['email']) : '';
$subject = isset($body['subject']) ? trim($body['subject']) : '';
$message = isset($body['message']) ? trim($body['message']) : '';

if ($name === '' || $email === '' || $message === '') {
  respond(400, ['ok' => false, 'error' => 'Missing name, email, or message']);
}

if (mb_strlen($name) > 120) respond(400, ['ok' => false, 'error' => 'name too long']);
if (mb_strlen($email) > 200) respond(400, ['ok' => false, 'error' => 'email too long']);
if (mb_strlen($subject) > 200) respond(400, ['ok' => false, 'error' => 'subject too long']);
if (mb_strlen($message) > 8000) respond(400, ['ok' => false, 'error' => 'message too long']);

$ip = $_SERVER['REMOTE_ADDR'] ?? null;
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

$pdo = get_pdo();
try {
  $stmt = $pdo->prepare('
    INSERT INTO contact_messages (name, email, subject, message, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?)
  ');
  $stmt->execute([$name, $email, $subject !== '' ? $subject : null, $message, $ip, $userAgent]);
  respond(200, ['ok' => true]);
} catch (Exception $e) {
  respond(500, ['ok' => false, 'error' => 'Failed to save message']);
}

