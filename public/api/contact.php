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
$website = isset($body['website']) ? trim($body['website']) : '';

// Honeypot field (spam trap): silently accept but do nothing.
if ($website !== '') {
  respond(200, ['ok' => true]);
}

if ($name === '' || $email === '' || $message === '') {
  respond(400, ['ok' => false, 'error' => 'Missing name, email, or message']);
}

if (mb_strlen($name) > 120) respond(400, ['ok' => false, 'error' => 'name too long']);
if (mb_strlen($email) > 200) respond(400, ['ok' => false, 'error' => 'email too long']);
if (mb_strlen($subject) > 200) respond(400, ['ok' => false, 'error' => 'subject too long']);
if (mb_strlen($message) > 8000) respond(400, ['ok' => false, 'error' => 'message too long']);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  respond(400, ['ok' => false, 'error' => 'invalid email']);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? null;
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

$pdo = get_pdo();
try {
  // Basic rate limiting per IP to reduce spam.
  if ($ip) {
    $rate = $pdo->prepare('
      SELECT COUNT(*) AS cnt, MAX(created_at) AS last_at
      FROM contact_messages
      WHERE ip_address = ? AND created_at > (NOW() - INTERVAL 10 MINUTE)
    ');
    $rate->execute([$ip]);
    $row = $rate->fetch();
    $cnt = (int)($row['cnt'] ?? 0);
    $lastAt = $row['last_at'] ?? null;

    if ($cnt >= 5) {
      respond(429, ['ok' => false, 'error' => 'too many requests']);
    }
    if ($lastAt) {
      $lastTs = strtotime($lastAt);
      if ($lastTs && (time() - $lastTs) < 15) {
        respond(429, ['ok' => false, 'error' => 'please wait before sending again']);
      }
    }
  }

  $stmt = $pdo->prepare('
    INSERT INTO contact_messages (name, email, subject, message, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?)
  ');
  $stmt->execute([$name, $email, $subject !== '' ? $subject : null, $message, $ip, $userAgent]);

  // Send a copy to site owner email, but still save to DB even if mail fails.
  $to = 'hello@salisu.dev';
  $mailSubject = $subject !== '' ? "[Portfolio] {$subject}" : "[Portfolio] New contact message";
  $bodyLines = [
    "New contact message from your portfolio site:",
    "",
    "Name: {$name}",
    "Email: {$email}",
    "Subject: " . ($subject !== '' ? $subject : '(none)'),
    "",
    "Message:",
    $message,
    "",
    "IP: " . ($ip ?: '(unknown)'),
    "User-Agent: " . ($userAgent ?: '(unknown)'),
  ];
  $mailBody = implode("\r\n", $bodyLines);
  $headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'From: Portfolio Contact <hello@salisu.dev>',
    "Reply-To: {$email}",
  ];
  $mailSent = @mail($to, $mailSubject, $mailBody, implode("\r\n", $headers));

  respond(200, ['ok' => true, 'mail_sent' => $mailSent ? true : false]);
} catch (Exception $e) {
  respond(500, ['ok' => false, 'error' => 'Failed to save message']);
}
