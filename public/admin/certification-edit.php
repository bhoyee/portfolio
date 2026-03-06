<?php

require_once __DIR__ . '/_auth.php';
require_once __DIR__ . '/_layout.php';

admin_require_login();

require_once __DIR__ . '/../api/db.php';
$pdo = get_pdo();

function upload_dir_absolute() {
  return realpath(__DIR__ . '/..') . '/uploads/certificates';
}

function upload_dir_public_prefix() {
  return app_url('uploads/certificates');
}

function ensure_upload_dir() {
  $dir = upload_dir_absolute();
  if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
  }
  return $dir;
}

function is_allowed_upload($tmpPath, $name) {
  $ext = strtolower(pathinfo((string)$name, PATHINFO_EXTENSION));
  $allowedExt = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];
  if (!in_array($ext, $allowedExt, true)) return [false, 'Unsupported file type'];

  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  $mime = $finfo ? finfo_file($finfo, $tmpPath) : null;
  if ($finfo) finfo_close($finfo);

  $allowedMime = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
  ];
  if (!$mime || !in_array($mime, $allowedMime, true)) return [false, 'Unsupported MIME type'];

  return [true, $ext];
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$isEdit = $id > 0;

$item = [
  'name' => '',
  'issuer' => '',
  'issued' => '',
  'credential_id' => '',
  'verify_url' => '',
  'file_url' => '',
  'published' => 1,
];

if ($isEdit) {
  $stmt = $pdo->prepare('
    SELECT id, name, issuer, issued, credential_id, verify_url, file_url, published
    FROM certifications
    WHERE id = ?
    LIMIT 1
  ');
  $stmt->execute([$id]);
  $row = $stmt->fetch();
  if (!$row) {
    admin_set_flash('err', 'Certification not found');
    header('Location: ' . admin_url('certifications.php'));
    exit;
  }
  $item = [
    'name' => (string)$row['name'],
    'issuer' => (string)($row['issuer'] ?? ''),
    'issued' => (string)($row['issued'] ?? ''),
    'credential_id' => (string)($row['credential_id'] ?? ''),
    'verify_url' => (string)($row['verify_url'] ?? ''),
    'file_url' => (string)($row['file_url'] ?? ''),
    'published' => (int)$row['published'] === 1 ? 1 : 0,
  ];
}

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  admin_verify_csrf();

  $name = trim((string)($_POST['name'] ?? ''));
  $issuer = trim((string)($_POST['issuer'] ?? ''));
  $issued = trim((string)($_POST['issued'] ?? ''));
  $credentialId = trim((string)($_POST['credential_id'] ?? ''));
  $verifyUrl = trim((string)($_POST['verify_url'] ?? ''));
  $published = !empty($_POST['published']) ? 1 : 0;
  $removeFile = !empty($_POST['remove_file']) ? 1 : 0;

  if ($name === '') {
    $error = 'Name is required';
  } else {
    $fileUrl = $item['file_url'];
    if ($removeFile) {
      $fileUrl = '';
    }

    if (!empty($_FILES['certificate']) && is_array($_FILES['certificate'])) {
      $f = $_FILES['certificate'];
      if (($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
        if (($f['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
          $error = 'Upload failed';
        } else {
          $tmp = (string)($f['tmp_name'] ?? '');
          $orig = (string)($f['name'] ?? '');
          $size = (int)($f['size'] ?? 0);
          if ($size > 8 * 1024 * 1024) {
            $error = 'File too large (max 8MB)';
          } else {
            [$ok, $extOrErr] = is_allowed_upload($tmp, $orig);
            if (!$ok) {
              $error = (string)$extOrErr;
            } else {
              ensure_upload_dir();
              $ext = (string)$extOrErr;
              $filename = 'cert_' . bin2hex(random_bytes(10)) . '.' . $ext;
              $targetAbs = upload_dir_absolute() . '/' . $filename;
              if (!move_uploaded_file($tmp, $targetAbs)) {
                $error = 'Could not save file';
              } else {
                $fileUrl = upload_dir_public_prefix() . '/' . $filename;
              }
            }
          }
        }
      }
    }

    if ($error === null) {
      try {
        if ($isEdit) {
          $stmt = $pdo->prepare('
            UPDATE certifications
            SET name = ?, issuer = ?, issued = ?, credential_id = ?, verify_url = ?, file_url = ?, published = ?, updated_at = NOW()
            WHERE id = ?
          ');
          $stmt->execute([
            $name,
            $issuer !== '' ? $issuer : null,
            $issued !== '' ? $issued : null,
            $credentialId !== '' ? $credentialId : null,
            $verifyUrl !== '' ? $verifyUrl : null,
            $fileUrl !== '' ? $fileUrl : null,
            $published,
            $id,
          ]);
          admin_set_flash('ok', 'Certification updated');
          header('Location: ' . admin_url('certification-edit.php') . '?id=' . urlencode((string)$id));
          exit;
        }

        $stmt = $pdo->prepare('
          INSERT INTO certifications (name, issuer, issued, credential_id, verify_url, file_url, published, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ');
        $stmt->execute([
          $name,
          $issuer !== '' ? $issuer : null,
          $issued !== '' ? $issued : null,
          $credentialId !== '' ? $credentialId : null,
          $verifyUrl !== '' ? $verifyUrl : null,
          $fileUrl !== '' ? $fileUrl : null,
          $published,
        ]);

        $newId = (int)$pdo->lastInsertId();
        admin_set_flash('ok', 'Certification created');
        header('Location: ' . admin_url('certification-edit.php') . '?id=' . urlencode((string)$newId));
        exit;
      } catch (Exception $e) {
        $error = 'Failed to save certification';
      }
    }
  }

  $item = [
    'name' => $name,
    'issuer' => $issuer,
    'issued' => $issued,
    'credential_id' => $credentialId,
    'verify_url' => $verifyUrl,
    'file_url' => $fileUrl ?? $item['file_url'],
    'published' => $published,
  ];
}

admin_page_header($isEdit ? 'Edit Certification' : 'New Certification');
?>

<div class="row" style="margin-bottom:14px;">
  <div>
    <h1 class="h1" style="margin:0;"><?php echo $isEdit ? 'Edit Certification' : 'New Certification'; ?></h1>
    <div class="muted" style="margin-top:4px;"><?php echo $isEdit ? 'ID ' . htmlspecialchars((string)$id) : 'Add a new certification'; ?></div>
  </div>
  <div class="actions">
    <a class="btn" href="<?php echo htmlspecialchars(admin_url('certifications.php')); ?>">Back</a>
    <?php if (!empty($item['file_url'])): ?>
      <a class="btn" href="<?php echo htmlspecialchars((string)$item['file_url']); ?>" target="_blank" rel="noreferrer">View file</a>
    <?php endif; ?>
  </div>
</div>

<?php if ($error): ?>
  <div class="flash err"><?php echo htmlspecialchars($error); ?></div>
<?php endif; ?>

<div class="card">
  <form method="post" enctype="multipart/form-data" action="<?php echo $isEdit ? (htmlspecialchars(admin_url('certification-edit.php')) . '?id=' . urlencode((string)$id)) : htmlspecialchars(admin_url('certification-edit.php')); ?>">
    <input type="hidden" name="csrf" value="<?php echo htmlspecialchars(admin_csrf_token()); ?>" />

    <label for="name">Name</label>
    <input id="name" name="name" value="<?php echo htmlspecialchars((string)$item['name']); ?>" required />

    <div class="row" style="gap:12px;">
      <div style="flex:1;">
        <label for="issuer">Issuer</label>
        <input id="issuer" name="issuer" value="<?php echo htmlspecialchars((string)$item['issuer']); ?>" />
      </div>
      <div style="flex:1;">
        <label for="issued">Issued (year or date)</label>
        <input id="issued" name="issued" value="<?php echo htmlspecialchars((string)$item['issued']); ?>" placeholder="2026" />
      </div>
    </div>

    <div class="row" style="gap:12px;">
      <div style="flex:1;">
        <label for="credential_id">Credential ID (optional)</label>
        <input id="credential_id" name="credential_id" value="<?php echo htmlspecialchars((string)$item['credential_id']); ?>" />
      </div>
      <div style="flex:1;">
        <label for="verify_url">Verification URL (optional)</label>
        <input id="verify_url" name="verify_url" value="<?php echo htmlspecialchars((string)$item['verify_url']); ?>" placeholder="https://..." />
      </div>
    </div>

    <label for="certificate">Certificate file (PDF/Image, optional)</label>
    <input id="certificate" name="certificate" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*" />
    <div class="help">Max size 8MB. Uploaded files are stored in <code><?php echo htmlspecialchars(app_url('uploads/certificates')); ?></code>.</div>

    <?php if (!empty($item['file_url'])): ?>
      <label style="display:flex; align-items:center; gap:10px; margin-top:12px;">
        <input type="checkbox" name="remove_file" value="1" style="width:auto;" />
        Remove existing file
      </label>
    <?php endif; ?>

    <div class="row" style="margin-top:12px; align-items:flex-end;">
      <div style="flex:1;">
        <label style="display:flex; align-items:center; gap:10px; margin-top:28px;">
          <input type="checkbox" name="published" value="1" <?php echo (int)$item['published'] === 1 ? 'checked' : ''; ?> style="width:auto;" />
          Published
        </label>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn primary" type="submit"><?php echo $isEdit ? 'Save changes' : 'Create certification'; ?></button>
      </div>
    </div>
  </form>
</div>

<?php admin_page_footer(); ?>
