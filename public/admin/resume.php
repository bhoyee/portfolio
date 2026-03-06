<?php

require_once __DIR__ . '/_auth.php';
require_once __DIR__ . '/_layout.php';

admin_require_login();

$uploadsDir = realpath(__DIR__ . '/../uploads');
if ($uploadsDir === false) {
  // In case uploads folder doesn't exist in a fresh deploy, fall back to a relative path.
  $uploadsDir = __DIR__ . '/../uploads';
}

$resumeDir = rtrim($uploadsDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'resume';
$resumeFile = $resumeDir . DIRECTORY_SEPARATOR . 'resume.pdf';
$resumeUrl = '/uploads/resume/resume.pdf';

function resume_flash_ok($msg) {
  admin_set_flash('ok', $msg);
  header('Location: /admin/resume.php');
  exit;
}

function resume_flash_err($msg) {
  admin_set_flash('err', $msg);
  header('Location: /admin/resume.php');
  exit;
}

function resume_is_pdf($tmpPath) {
  if (!is_string($tmpPath) || $tmpPath === '' || !file_exists($tmpPath)) return false;
  if (!function_exists('finfo_open')) return true; // best-effort in limited hosting envs
  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  if (!$finfo) return true;
  $mime = finfo_file($finfo, $tmpPath);
  finfo_close($finfo);
  return $mime === 'application/pdf';
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
  admin_verify_csrf();

  $action = (string)($_POST['action'] ?? '');

  if ($action === 'delete') {
    if (file_exists($resumeFile)) {
      @unlink($resumeFile);
      resume_flash_ok('Resume deleted.');
    }
    resume_flash_ok('No resume found to delete.');
  }

  if ($action !== 'upload') {
    resume_flash_err('Invalid action.');
  }

  if (empty($_FILES['resume']) || !is_array($_FILES['resume'])) {
    resume_flash_err('Please choose a PDF to upload.');
  }

  $file = $_FILES['resume'];
  $error = (int)($file['error'] ?? UPLOAD_ERR_NO_FILE);
  if ($error !== UPLOAD_ERR_OK) {
    resume_flash_err('Upload failed. Please try again.');
  }

  $tmp = (string)($file['tmp_name'] ?? '');
  $name = (string)($file['name'] ?? '');
  $size = (int)($file['size'] ?? 0);

  if ($size <= 0) {
    resume_flash_err('Uploaded file is empty.');
  }
  if ($size > (8 * 1024 * 1024)) {
    resume_flash_err('Resume must be 8MB or less.');
  }

  $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
  if ($ext !== 'pdf') {
    resume_flash_err('Only PDF files are allowed.');
  }
  if (!resume_is_pdf($tmp)) {
    resume_flash_err('File does not look like a valid PDF.');
  }

  if (!is_dir($resumeDir)) {
    if (!@mkdir($resumeDir, 0755, true) && !is_dir($resumeDir)) {
      resume_flash_err('Failed to create uploads directory.');
    }
  }

  if (!@move_uploaded_file($tmp, $resumeFile)) {
    resume_flash_err('Failed to save uploaded file.');
  }

  resume_flash_ok('Resume uploaded.');
}

$exists = file_exists($resumeFile);
$sizeBytes = $exists ? @filesize($resumeFile) : null;
$updatedAt = $exists ? @filemtime($resumeFile) : null;

admin_page_header('Resume');
?>

<div class="row" style="margin-bottom:14px;">
  <div>
    <h1 class="h1" style="margin:0;">Resume</h1>
    <div class="muted" style="margin-top:4px;">Upload a PDF to enable the “Download Resume” button on the portfolio.</div>
  </div>
</div>

<div class="grid" style="grid-template-columns: 1fr 1fr;">
  <div class="card">
    <h2 class="h1" style="margin-top:0;">Current</h2>
    <?php if (!$exists): ?>
      <div class="muted">No resume uploaded yet.</div>
    <?php else: ?>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <div><span class="tag">PDF</span> <span class="muted">Stored at</span> <code><?php echo htmlspecialchars($resumeUrl); ?></code></div>
        <?php if ($sizeBytes): ?>
          <div class="muted">Size: <?php echo number_format($sizeBytes / 1024, 1); ?> KB</div>
        <?php endif; ?>
        <?php if ($updatedAt): ?>
          <div class="muted">Updated: <?php echo htmlspecialchars(gmdate('Y-m-d H:i:s', (int)$updatedAt)); ?> UTC</div>
        <?php endif; ?>
        <div class="actions" style="margin-top:6px;">
          <a class="btn" href="<?php echo htmlspecialchars($resumeUrl); ?>" target="_blank" rel="noreferrer">View</a>
          <a class="btn" href="<?php echo htmlspecialchars($resumeUrl); ?>" download>Download</a>
        </div>

        <form method="post" action="/admin/resume.php" onsubmit="return confirm('Delete the current resume?');" style="margin-top:10px;">
          <input type="hidden" name="csrf" value="<?php echo htmlspecialchars(admin_csrf_token()); ?>" />
          <input type="hidden" name="action" value="delete" />
          <button class="btn danger" type="submit">Delete</button>
        </form>
      </div>
    <?php endif; ?>
  </div>

  <div class="card">
    <h2 class="h1" style="margin-top:0;">Upload</h2>
    <form method="post" action="/admin/resume.php" enctype="multipart/form-data">
      <input type="hidden" name="csrf" value="<?php echo htmlspecialchars(admin_csrf_token()); ?>" />
      <input type="hidden" name="action" value="upload" />

      <label for="resume">Resume PDF</label>
      <input id="resume" name="resume" type="file" accept="application/pdf,.pdf" required />
      <div class="help">PDF only. Max 8MB. Uploading replaces the existing file.</div>

      <div class="actions" style="margin-top:12px;">
        <button class="btn primary" type="submit">Upload Resume</button>
      </div>
    </form>
  </div>
</div>

<?php
admin_page_footer();

