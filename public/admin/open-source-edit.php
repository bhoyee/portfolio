<?php

require_once __DIR__ . '/_auth.php';
require_once __DIR__ . '/_layout.php';

admin_require_login();

require_once __DIR__ . '/../api/db.php';
$pdo = get_pdo();

function redirect_list() {
  header('Location: ' . admin_url('open-source.php'));
  exit;
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$editing = $id > 0;

$item = [
  'name' => '',
  'description' => '',
  'repo_url' => '',
  'stars' => '',
  'forks' => '',
  'language' => '',
  'contribution' => '',
  'tags' => '',
  'sort_order' => '0',
  'published' => '1',
];

if ($editing) {
  try {
    $stmt = $pdo->prepare('SELECT * FROM open_source_projects WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) {
      admin_set_flash('err', 'Item not found.');
      redirect_list();
    }

    $tags = '';
    if (!empty($row['tags_json'])) {
      $decoded = json_decode((string)$row['tags_json'], true);
      if (is_array($decoded)) {
        $tags = implode(', ', array_values(array_filter($decoded, fn($t) => is_string($t) && trim($t) !== '')));
      }
    }

    $item = [
      'name' => (string)$row['name'],
      'description' => (string)($row['description'] ?? ''),
      'repo_url' => (string)$row['repo_url'],
      'stars' => $row['stars'] !== null ? (string)$row['stars'] : '',
      'forks' => $row['forks'] !== null ? (string)$row['forks'] : '',
      'language' => (string)($row['language'] ?? ''),
      'contribution' => (string)($row['contribution'] ?? ''),
      'tags' => $tags,
      'sort_order' => (string)($row['sort_order'] ?? 0),
      'published' => !empty($row['published']) ? '1' : '0',
    ];
  } catch (Exception $e) {
    error_log('[admin-open-source-edit] load error=' . $e->getMessage());
    admin_set_flash('err', 'Open Source table not available yet. Run schema.sql/migrations first.');
    redirect_list();
  }
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
  admin_verify_csrf();

  $name = trim((string)($_POST['name'] ?? ''));
  $description = trim((string)($_POST['description'] ?? ''));
  $repoUrl = trim((string)($_POST['repo_url'] ?? ''));
  $language = trim((string)($_POST['language'] ?? ''));
  $contribution = trim((string)($_POST['contribution'] ?? ''));
  $tagsRaw = trim((string)($_POST['tags'] ?? ''));
  $sortOrder = (int)($_POST['sort_order'] ?? 0);
  $published = !empty($_POST['published']) ? 1 : 0;

  $stars = trim((string)($_POST['stars'] ?? ''));
  $forks = trim((string)($_POST['forks'] ?? ''));
  $starsVal = ($stars === '') ? null : max(0, (int)$stars);
  $forksVal = ($forks === '') ? null : max(0, (int)$forks);

  if ($name === '' || $repoUrl === '') {
    admin_set_flash('err', 'Name and Repo URL are required.');
    header('Location: ' . admin_url('open-source-edit.php') . ($editing ? ('?id=' . $id) : ''));
    exit;
  }

  $tags = [];
  if ($tagsRaw !== '') {
    foreach (preg_split('/,/', $tagsRaw) as $t) {
      $t = trim((string)$t);
      if ($t !== '') $tags[] = $t;
    }
  }
  $tagsJson = !empty($tags) ? json_encode(array_values($tags)) : null;

  try {
    if ($editing) {
      $stmt = $pdo->prepare('
        UPDATE open_source_projects
        SET name = ?, description = ?, repo_url = ?, stars = ?, forks = ?, language = ?, contribution = ?, tags_json = ?,
            sort_order = ?, published = ?, updated_at = NOW()
        WHERE id = ?
      ');
      $stmt->execute([
        $name,
        $description !== '' ? $description : null,
        $repoUrl,
        $starsVal,
        $forksVal,
        $language !== '' ? $language : null,
        $contribution !== '' ? $contribution : null,
        $tagsJson,
        $sortOrder,
        $published,
        $id,
      ]);
      admin_set_flash('ok', 'Open source item updated.');
    } else {
      $stmt = $pdo->prepare('
        INSERT INTO open_source_projects (name, description, repo_url, stars, forks, language, contribution, tags_json, sort_order, published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ');
      $stmt->execute([
        $name,
        $description !== '' ? $description : null,
        $repoUrl,
        $starsVal,
        $forksVal,
        $language !== '' ? $language : null,
        $contribution !== '' ? $contribution : null,
        $tagsJson,
        $sortOrder,
        $published,
      ]);
      admin_set_flash('ok', 'Open source item created.');
    }
  } catch (Exception $e) {
    error_log('[admin-open-source-edit] save error=' . $e->getMessage());
    admin_set_flash('err', 'Failed to save item. Make sure migrations are applied.');
  }

  redirect_list();
}

admin_page_header($editing ? 'Edit Open Source Item' : 'New Open Source Item');
?>

<div class="row" style="margin-bottom:14px;">
  <div>
    <h1 class="h1" style="margin:0;"><?php echo $editing ? 'Edit Item' : 'New Item'; ?></h1>
    <div class="muted" style="margin-top:4px;">Add your project/repo and optional stats/tags.</div>
  </div>
  <div class="actions">
    <a class="btn" href="<?php echo htmlspecialchars(admin_url('open-source.php')); ?>">Back</a>
  </div>
</div>

<div class="card">
  <form method="post" action="<?php echo htmlspecialchars(admin_url('open-source-edit.php')) . ($editing ? ('?id=' . $id) : ''); ?>">
    <input type="hidden" name="csrf" value="<?php echo htmlspecialchars(admin_csrf_token()); ?>" />

    <label for="name">Name *</label>
    <input id="name" name="name" value="<?php echo htmlspecialchars($item['name']); ?>" required />

    <label for="repo_url">Repo URL *</label>
    <input id="repo_url" name="repo_url" value="<?php echo htmlspecialchars($item['repo_url']); ?>" required />

    <label for="description">Description</label>
    <textarea id="description" name="description"><?php echo htmlspecialchars($item['description']); ?></textarea>

    <div class="grid" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
      <div>
        <label for="language">Language</label>
        <input id="language" name="language" value="<?php echo htmlspecialchars($item['language']); ?>" placeholder="e.g. TypeScript" />
      </div>
      <div>
        <label for="contribution">Contribution</label>
        <input id="contribution" name="contribution" value="<?php echo htmlspecialchars($item['contribution']); ?>" placeholder="e.g. Maintainer / Contributor" />
      </div>
    </div>

    <div class="grid" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
      <div>
        <label for="stars">Stars</label>
        <input id="stars" name="stars" inputmode="numeric" value="<?php echo htmlspecialchars($item['stars']); ?>" placeholder="Optional" />
      </div>
      <div>
        <label for="forks">Forks</label>
        <input id="forks" name="forks" inputmode="numeric" value="<?php echo htmlspecialchars($item['forks']); ?>" placeholder="Optional" />
      </div>
    </div>

    <label for="tags">Tags</label>
    <input id="tags" name="tags" value="<?php echo htmlspecialchars($item['tags']); ?>" placeholder="Comma separated (e.g. API, CLI, Tooling)" />

    <div class="grid" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
      <div>
        <label for="sort_order">Sort Order</label>
        <input id="sort_order" name="sort_order" inputmode="numeric" value="<?php echo htmlspecialchars($item['sort_order']); ?>" />
        <div class="help">Lower numbers appear first.</div>
      </div>
      <div>
        <label style="margin-bottom:8px;">Status</label>
        <label style="margin:0; display:flex; align-items:center; gap:10px;">
          <input type="checkbox" name="published" value="1" <?php echo $item['published'] === '1' ? 'checked' : ''; ?> style="width:auto;" />
          <span>Published</span>
        </label>
      </div>
    </div>

    <div class="actions" style="margin-top:12px;">
      <button class="btn primary" type="submit"><?php echo $editing ? 'Save Changes' : 'Create Item'; ?></button>
    </div>
  </form>
</div>

<?php
admin_page_footer();
