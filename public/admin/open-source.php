<?php

require_once __DIR__ . '/_auth.php';
require_once __DIR__ . '/_layout.php';

admin_require_login();

require_once __DIR__ . '/../api/db.php';
require_once __DIR__ . '/../api/lib/settings.php';

$pdo = get_pdo();

function redirect_self() {
  header('Location: /admin/open-source.php');
  exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
  admin_verify_csrf();
  $action = (string)($_POST['action'] ?? '');

  if ($action === 'toggle_enabled') {
    $enabled = !empty($_POST['enabled']) ? '1' : '0';
    try {
      settings_set($pdo, 'open_source_enabled', $enabled);
      admin_set_flash('ok', $enabled === '1' ? 'Open Source section enabled.' : 'Open Source section hidden.');
    } catch (Exception $e) {
      error_log('[admin-open-source] settings error=' . $e->getMessage());
      admin_set_flash('err', 'Failed to update setting.');
    }
    redirect_self();
  }

  admin_set_flash('err', 'Invalid action.');
  redirect_self();
}

$enabled = settings_get_bool($pdo, 'open_source_enabled', true);

$q = trim((string)($_GET['q'] ?? ''));
$items = [];
$loadError = null;

try {
  if ($q !== '') {
    $stmt = $pdo->prepare('
      SELECT id, name, repo_url, published, sort_order, created_at, updated_at
      FROM open_source_projects
      WHERE name LIKE ? OR repo_url LIKE ?
      ORDER BY sort_order ASC, created_at DESC
      LIMIT 300
    ');
    $like = '%' . $q . '%';
    $stmt->execute([$like, $like]);
    $items = $stmt->fetchAll();
  } else {
    $stmt = $pdo->query('
      SELECT id, name, repo_url, published, sort_order, created_at, updated_at
      FROM open_source_projects
      ORDER BY sort_order ASC, created_at DESC
      LIMIT 300
    ');
    $items = $stmt->fetchAll();
  }
} catch (Exception $e) {
  $loadError = 'Open Source table not available yet. Run `public/api/schema.sql` (or your migrations) to create `open_source_projects` and `site_settings`.';
  error_log('[admin-open-source] load error=' . $e->getMessage());
}

admin_page_header('Open Source');
?>

<div class="row" style="margin-bottom:14px;">
  <div>
    <h1 class="h1" style="margin:0;">Open Source</h1>
    <div class="muted" style="margin-top:4px;">
      Manage projects shown in the Open Source section. You can also hide the section even if items exist.
    </div>
  </div>
  <div class="actions">
    <a class="btn primary" href="/admin/open-source-edit.php">New Item</a>
  </div>
</div>

<div class="card" style="margin-bottom:14px;">
  <form method="post" action="/admin/open-source.php" class="row" style="gap:10px;">
    <input type="hidden" name="csrf" value="<?php echo htmlspecialchars(admin_csrf_token()); ?>" />
    <input type="hidden" name="action" value="toggle_enabled" />
    <label style="margin:0; display:flex; align-items:center; gap:10px;">
      <input type="checkbox" name="enabled" value="1" <?php echo $enabled ? 'checked' : ''; ?> style="width:auto;" />
      <span>Show Open Source section on the portfolio</span>
    </label>
    <button class="btn" type="submit">Save</button>
  </form>
</div>

<?php if ($loadError): ?>
  <div class="card">
    <div class="muted"><?php echo htmlspecialchars($loadError); ?></div>
  </div>
<?php else: ?>
  <div class="card" style="margin-bottom:14px;">
    <form method="get" action="/admin/open-source.php" class="row" style="gap:10px;">
      <input name="q" placeholder="Search name or repo URL..." value="<?php echo htmlspecialchars($q); ?>" />
      <button class="btn" type="submit">Search</button>
      <?php if ($q !== ''): ?>
        <a class="btn" href="/admin/open-source.php">Clear</a>
      <?php endif; ?>
      <div class="muted" style="margin-left:auto;"><?php echo count($items); ?> shown</div>
    </form>
  </div>

  <div class="card">
    <table>
      <thead>
        <tr>
          <th style="width:30%;">Name</th>
          <th>Repo</th>
          <th>Status</th>
          <th>Sort</th>
          <th>Updated</th>
          <th style="width:18%;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($items)): ?>
          <tr><td colspan="6" class="muted">No open source items yet.</td></tr>
        <?php endif; ?>
        <?php foreach ($items as $it): ?>
          <tr>
            <td style="font-weight:700;"><?php echo htmlspecialchars((string)$it['name']); ?></td>
            <td class="muted" style="font-size:13px;">
              <?php echo htmlspecialchars((string)$it['repo_url']); ?>
            </td>
            <td>
              <?php if (!empty($it['published'])): ?>
                <span class="tag">Published</span>
              <?php else: ?>
                <span class="tag">Draft</span>
              <?php endif; ?>
            </td>
            <td class="muted"><?php echo (int)($it['sort_order'] ?? 0); ?></td>
            <td class="muted" style="font-size:13px;"><?php echo htmlspecialchars((string)($it['updated_at'] ?? $it['created_at'] ?? '')); ?></td>
            <td>
              <div class="actions">
                <a class="btn" href="/admin/open-source-edit.php?id=<?php echo (int)$it['id']; ?>">Edit</a>
                <form method="post" action="/admin/open-source-delete.php" onsubmit="return confirm('Delete this item?');" style="margin:0;">
                  <input type="hidden" name="csrf" value="<?php echo htmlspecialchars(admin_csrf_token()); ?>" />
                  <input type="hidden" name="id" value="<?php echo (int)$it['id']; ?>" />
                  <button class="btn danger" type="submit">Delete</button>
                </form>
              </div>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
<?php endif; ?>

<?php
admin_page_footer();
