<?php

function portfolio_mail_headers_from_array($headers) {
  $lines = [];
  foreach ($headers as $h) {
    $h = trim((string)$h);
    if ($h !== '') $lines[] = $h;
  }
  return implode("\r\n", $lines);
}

function portfolio_send_mail($to, $subject, $body, $headers = []) {
  $transport = getenv('MAIL_TRANSPORT');
  $transport = $transport !== false ? trim((string)$transport) : '';
  if ($transport === '') $transport = 'php_mail';

  if ($transport === 'log') {
    $path = getenv('MAIL_LOG_PATH');
    $path = $path !== false ? trim((string)$path) : '';
    if ($path === '') {
      $path = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'portfolio-mail.log';
    }

    $entry = [
      'ts' => gmdate('c'),
      'to' => (string)$to,
      'subject' => (string)$subject,
      'body' => (string)$body,
      'headers' => is_array($headers) ? array_values($headers) : [],
    ];

    @file_put_contents($path, json_encode($entry) . "\n", FILE_APPEND);
    return true;
  }

  if ($transport !== 'php_mail') {
    // Unknown transport: fail closed.
    return false;
  }

  $headerString = is_array($headers) ? portfolio_mail_headers_from_array($headers) : (string)$headers;
  return @mail((string)$to, (string)$subject, (string)$body, $headerString) ? true : false;
}

