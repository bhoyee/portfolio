<?php

function settings_get($pdo, $key, $default = null) {
  try {
    $stmt = $pdo->prepare('SELECT `value` FROM site_settings WHERE `key` = ? LIMIT 1');
    $stmt->execute([(string)$key]);
    $row = $stmt->fetch();
    if (!$row) return $default;
    return $row['value'];
  } catch (Exception $e) {
    return $default;
  }
}

function settings_set($pdo, $key, $value) {
  $stmt = $pdo->prepare('
    INSERT INTO site_settings (`key`, `value`, updated_at)
    VALUES (?, ?, NOW())
    ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), updated_at = NOW()
  ');
  $stmt->execute([(string)$key, $value === null ? null : (string)$value]);
}

function settings_get_bool($pdo, $key, $default = false) {
  $val = settings_get($pdo, $key, null);
  if ($val === null) return $default;
  $val = strtolower(trim((string)$val));
  if ($val === '1' || $val === 'true' || $val === 'yes' || $val === 'on') return true;
  if ($val === '0' || $val === 'false' || $val === 'no' || $val === 'off') return false;
  return $default;
}

