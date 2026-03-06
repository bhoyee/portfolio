<?php

require_once __DIR__ . '/_auth.php';
require_once __DIR__ . '/_layout.php';

admin_require_login();

require_once __DIR__ . '/../api/db.php';
$pdo = get_pdo();

$q = trim((string)($_GET['q'] ?? ''));

if ($q !== '') {
  $stmt = $pdo->prepare('
    SELECT id, name, issuer, issued, credential_id, verify_url, file_url, published, created_at, updated_at
    FROM certifications
    WHERE name LIKE ? OR issuer LIKE ?
    ORDER BY created_at DESC
    LIMIT 300
  ');
  $like = '%' . $q . '%';
  $stmt->execute([$like, $like]);
  $rows = $stmt->fetchAll();
} else {
  $stmt = $pdo->query('
    SELECT id, name, issuer, issued, credential_id, verify_url, file_url, published, created_at, updated_at
    FROM certifications
    ORDER BY created_at DESC
    LIMIT 300
  ');
  $rows = $stmt->fetchAll();
}

admin_page_header('Certifications');
?>

<div class="row" style="margin-bottom:14px;">
  <div>
    <h1 class="h1" style="margin:0;">Certifications</h1>
    <div class="muted" style="margin-top:4px;"><?php echo count($rows); ?> shown</div>
  </div>
  <div class="actions">
    <a class="btn primary" href="<?php echo htmlspecialchars(admin_url('certification-edit.php')); ?>">New Certification</a>
  </div>
</div>

<div class="card" style="margin-bottom:14px;">
  <form method="get" action="<?php echo htmlspecialchars(admin_url('certifications.php')); ?>" class="row" style="gap:10px;">
    <input name="q" placeholder="Search name or issuer…" value="<?php echo htmlspecialchars($q); ?>" />
    <button class="btn" type="submit">Search</button>
    <?php if ($q !== ''): ?>
      <a class="btn" href="<?php echo htmlspecialchars(admin_url('certifications.php')); ?>">Clear</a>
    <?php endif; ?>
  </form>
</div>

<div class="card">
  <table>
    <thead>
      <tr>
        <th style="width:30%;">Name</th>
        <th>Issuer</th>
        <th>Issued</th>
        <th>Status</th>
        <th>Certificate</th>
        <th style="width:18%;">Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php if (empty($rows)): ?>
        <tr><td colspan="6" class="muted">No certifications found.</td></tr>
      <?php endif; ?>
      <?php foreach ($rows as $c): ?>
        <tr>
          <td>
            <div style="font-weight:700;"><?php echo htmlspecialchars((string)$c['name']); ?></div>
            <?php if (!empty($c['credential_id'])): ?>
              <div class="muted" style="margin-top:4px; font-size:13px;">
                ID: <span class="tag"><?php echo htmlspecialchars((string)$c['credential_id']); ?></span>
              </div>
            <?php endif; ?>
          </td>
          <td class="muted"><?php echo htmlspecialchars((string)($c['issuer'] ?? '')); ?></td>
          <td class="muted"><?php echo htmlspecialchars((string)($c['issued'] ?? '')); ?></td>
          <td>
            <?php if ((int)$c['published'] === 1): ?>
              <span class="tag">Published</span>
            <?php else: ?>
              <span class="tag">Hidden</span>
            <?php endif; ?>
          </td>
          <td>
            <?php if (!empty($c['file_url'])): ?>
              <a class="btn" href="<?php echo htmlspecialchars((string)$c['file_url']); ?>" target="_blank" rel="noreferrer">View</a>
            <?php else: ?>
              <span class="muted">—</span>
            <?php endif; ?>
          </td>
          <td>
            <div class="actions">
              <a class="btn" href="<?php echo htmlspecialchars(admin_url('certification-edit.php')) . '?id=' . urlencode((string)$c['id']); ?>">Edit</a>
              <form method="post" action="<?php echo htmlspecialchars(admin_url('certification-delete.php')); ?>" onsubmit="return confirm('Delete this certification?');" style="margin:0;">
                <input type="hidden" name="csrf" value="<?php echo htmlspecialchars(admin_csrf_token()); ?>" />
                <input type="hidden" name="id" value="<?php echo htmlspecialchars((string)$c['id']); ?>" />
                <button class="btn danger" type="submit">Delete</button>
              </form>
            </div>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>

<?php admin_page_footer(); ?>
