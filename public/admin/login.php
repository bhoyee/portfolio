<?php

require_once __DIR__ . '/_auth.php';
require_once __DIR__ . '/_layout.php';

admin_session_start();

if (admin_is_logged_in()) {
  header('Location: ' . admin_url('index.php'));
  exit;
}

$cfg = admin_load_config_or_null();

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  admin_verify_csrf();
  $username = trim((string)($_POST['username'] ?? ''));
  $password = (string)($_POST['password'] ?? '');
  $next = (string)($_POST['next'] ?? admin_url('index.php'));

  $res = admin_login($username, $password);
  if ($res['ok']) {
    header('Location: ' . ($next !== '' ? $next : admin_url('index.php')));
    exit;
  }
  $error = $res['error'] ?? 'Login failed';
}

$next = (string)($_GET['next'] ?? admin_url('index.php'));

admin_page_header('Login');
?>

<div class="card" style="max-width:520px;margin:0 auto;">
  <h1 class="h1">Admin Login</h1>
  <p class="muted" style="margin:0 0 14px;">Sign in to manage blog posts.</p>

  <?php if (!$cfg): ?>
    <div class="flash err">
      Admin config is missing. Create <code>public/admin/admin-config.php</code> on the server (copy from <code>admin-config.sample.php</code>).
    </div>
  <?php endif; ?>

  <?php if ($error): ?>
    <div class="flash err"><?php echo htmlspecialchars($error); ?></div>
  <?php endif; ?>

  <form method="post" action="<?php echo htmlspecialchars(admin_url('login.php')); ?>">
    <input type="hidden" name="csrf" value="<?php echo htmlspecialchars(admin_csrf_token()); ?>" />
    <input type="hidden" name="next" value="<?php echo htmlspecialchars($next); ?>" />

    <label for="username">Username</label>
    <input id="username" name="username" autocomplete="username" required />

    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required />

    <div style="margin-top:14px;display:flex;justify-content:flex-end;">
      <button class="btn primary" type="submit">Login</button>
    </div>
  </form>
</div>

<?php admin_page_footer(); ?>
