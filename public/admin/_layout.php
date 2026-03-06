<?php

require_once __DIR__ . '/_auth.php';

function admin_page_header($title) {
  $flash = admin_pop_flash();
  ?>
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><?php echo htmlspecialchars($title); ?> · Admin</title>
    <style>
      :root { color-scheme: light dark; }
      body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background:#0b1220; color:#e5e7eb; }
      a { color: inherit; text-decoration: none; }
      .wrap { max-width: 1050px; margin: 0 auto; padding: 24px; }
      .top { display:flex; align-items:center; justify-content:space-between; gap: 16px; padding: 16px 24px; border-bottom: 1px solid rgba(255,255,255,.08); position: sticky; top:0; background: rgba(11,18,32,.85); backdrop-filter: blur(12px); }
      .brand { font-weight: 700; letter-spacing: -.02em; }
      .nav { display:flex; gap: 14px; align-items:center; }
      .pill { padding: 8px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); }
      .pill:hover { border-color: rgba(16,185,129,.6); }
      .card { border: 1px solid rgba(255,255,255,.10); background: rgba(255,255,255,.04); border-radius: 16px; padding: 16px; }
      .grid { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 14px; }
      @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
      .h1 { font-size: 22px; margin: 0 0 12px; }
      .muted { color: rgba(229,231,235,.75); }
      .btn { display:inline-flex; align-items:center; justify-content:center; gap: 8px; padding: 10px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06); color: #e5e7eb; cursor: pointer; }
      .btn:hover { border-color: rgba(16,185,129,.6); }
      .btn.primary { background: linear-gradient(135deg, rgba(16,185,129,.95), rgba(5,150,105,.9)); border-color: rgba(16,185,129,.8); color: #04110c; font-weight: 700; }
      .btn.danger { border-color: rgba(239,68,68,.55); }
      input, textarea, select { width: 100%; padding: 10px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,.12); background: rgba(17,24,39,.65); color: #e5e7eb; }
      textarea { min-height: 220px; resize: vertical; }
      label { display:block; font-size: 13px; color: rgba(229,231,235,.8); margin: 12px 0 6px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 10px 10px; border-bottom: 1px solid rgba(255,255,255,.08); vertical-align: top; }
      th { text-align:left; color: rgba(229,231,235,.85); font-size: 13px; }
      .tag { font-size: 12px; padding: 4px 8px; border-radius: 999px; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.05); display:inline-block; }
      .flash { margin: 16px 0; padding: 12px 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,.12); }
      .flash.ok { border-color: rgba(16,185,129,.55); }
      .flash.err { border-color: rgba(239,68,68,.55); }
      .row { display:flex; gap: 12px; align-items:center; justify-content: space-between; }
      .actions { display:flex; gap: 10px; align-items:center; }
    </style>
  </head>
  <body>
    <div class="top">
      <div class="row" style="width:100%">
        <div class="brand"><a href="/admin/index.php">Portfolio Admin</a></div>
        <div class="nav">
          <a class="pill" href="/admin/index.php">Dashboard</a>
          <a class="pill" href="/admin/posts.php">Blog Posts</a>
          <?php if (admin_is_logged_in()): ?>
            <a class="pill" href="/admin/logout.php">Logout</a>
          <?php endif; ?>
        </div>
      </div>
    </div>
    <div class="wrap">
      <?php if ($flash): ?>
        <div class="flash <?php echo $flash['type'] === 'ok' ? 'ok' : 'err'; ?>">
          <?php echo htmlspecialchars((string)$flash['message']); ?>
        </div>
      <?php endif; ?>
  <?php
}

function admin_page_footer() {
  ?>
    </div>
  </body>
  </html>
  <?php
}

