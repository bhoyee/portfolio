<?php

function contact_should_ignore($body) {
  $website = isset($body['website']) ? trim((string)$body['website']) : '';
  return $website !== '';
}

function contact_validate($body) {
  $name = isset($body['name']) ? trim((string)$body['name']) : '';
  $email = isset($body['email']) ? trim((string)$body['email']) : '';
  $subject = isset($body['subject']) ? trim((string)$body['subject']) : '';
  $message = isset($body['message']) ? trim((string)$body['message']) : '';

  if ($name === '' || $email === '' || $message === '') {
    return ['ok' => false, 'error' => 'Missing name, email, or message'];
  }

  if (mb_strlen($name) > 120) return ['ok' => false, 'error' => 'name too long'];
  if (mb_strlen($email) > 200) return ['ok' => false, 'error' => 'email too long'];
  if (mb_strlen($subject) > 200) return ['ok' => false, 'error' => 'subject too long'];
  if (mb_strlen($message) > 8000) return ['ok' => false, 'error' => 'message too long'];

  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    return ['ok' => false, 'error' => 'invalid email'];
  }

  $lower = mb_strtolower($message);
  $linkCount = substr_count($lower, 'http://') + substr_count($lower, 'https://');
  if ($linkCount > 3) {
    return ['ok' => false, 'error' => 'message contains too many links'];
  }

  return [
    'ok' => true,
    'data' => [
      'name' => $name,
      'email' => $email,
      'subject' => $subject,
      'message' => $message,
    ],
  ];
}

