<?php

use PHPUnit\Framework\TestCase;

/**
 * @group integration
 */
final class ApiIntegrationTest extends TestCase
{
    private static $proc = null;
    private static string $baseUrl = '';

    private static function env(string $key): ?string
    {
        $v = getenv($key);
        if ($v === false) return null;
        $v = trim((string)$v);
        return $v === '' ? null : $v;
    }

    private static function requireDbEnvOrSkip(): void
    {
        $required = ['DB_HOST', 'DB_NAME', 'DB_USER'];
        foreach ($required as $k) {
            if (self::env($k) === null) {
                self::markTestSkipped("Missing {$k} env var (set DB_* to run backend integration tests).");
            }
        }

        // Password may be intentionally empty, but the var must exist.
        if (getenv('DB_PASS') === false) {
            self::markTestSkipped('Missing DB_PASS env var (may be empty, but must be set).');
        }
    }

    private static function pdo(): PDO
    {
        $host = self::env('DB_HOST');
        $name = self::env('DB_NAME');
        $user = self::env('DB_USER');
        $passEnv = getenv('DB_PASS');
        $pass = $passEnv === false ? '' : (string)$passEnv;
        $port = (int)(self::env('DB_PORT') ?? '3306');
        $charset = self::env('DB_CHARSET') ?? 'utf8mb4';

        $dsn = "mysql:host={$host};port={$port};dbname={$name};charset={$charset}";
        return new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }

    private static function execSchema(PDO $pdo): void
    {
        $schemaPath = __DIR__ . '/../../public/api/schema.sql';
        $sql = file_get_contents($schemaPath);
        if ($sql === false) {
            throw new RuntimeException('Failed to read schema.sql');
        }

        $pdo->exec('SET FOREIGN_KEY_CHECKS=0');
        $pdo->exec('DROP TABLE IF EXISTS post_comments');
        $pdo->exec('DROP TABLE IF EXISTS post_likes');
        $pdo->exec('DROP TABLE IF EXISTS blog_posts');
        $pdo->exec('DROP TABLE IF EXISTS contact_messages');

        $statements = array_filter(array_map('trim', explode(';', $sql)));
        foreach ($statements as $stmt) {
            if ($stmt === '') continue;
            $pdo->exec($stmt);
        }
    }

    private static function seed(PDO $pdo): void
    {
        $stmt = $pdo->prepare('
          INSERT INTO blog_posts (slug, title, excerpt, content, cover_image, tags_json, published, reading_time, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, ?, NOW())
        ');
        $stmt->execute([
            'hello-world',
            'Hello World',
            'A short excerpt',
            '<p>Test post content</p>',
            '',
            json_encode(['testing', 'portfolio']),
            2.5,
        ]);
    }

    private static function pickFreePort(): int
    {
        $server = @stream_socket_server('tcp://127.0.0.1:0', $errno, $errstr);
        if ($server === false) {
            throw new RuntimeException("Failed to allocate port: {$errstr}");
        }
        $name = stream_socket_get_name($server, false);
        fclose($server);
        $parts = explode(':', (string)$name);
        return (int)($parts[count($parts) - 1] ?? 0);
    }

    private static function startServer(): void
    {
        $port = self::pickFreePort();
        $docroot = realpath(__DIR__ . '/../../public');
        if ($docroot === false) throw new RuntimeException('Missing public/ directory');

        $cmd = 'php -S 127.0.0.1:' . $port . ' -t ' . escapeshellarg($docroot);
        $descriptors = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $env = array_merge($_ENV, $_SERVER);

        // Ensure the server process gets DB_* vars even if PHP doesn't populate $_ENV.
        foreach (['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'DB_PORT', 'DB_CHARSET'] as $k) {
            $v = getenv($k);
            if ($v !== false) $env[$k] = (string)$v;
        }

        // Ensure contact endpoint uses a testable mail transport.
        $mailLog = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'portfolio-mail-integration.log';
        putenv('MAIL_TRANSPORT=log');
        putenv('MAIL_LOG_PATH=' . $mailLog);
        $env['MAIL_TRANSPORT'] = 'log';
        $env['MAIL_LOG_PATH'] = $mailLog;

        self::$proc = proc_open($cmd, $descriptors, $pipes, realpath(__DIR__ . '/../../'), $env);
        if (!is_resource(self::$proc)) throw new RuntimeException('Failed to start PHP built-in server');

        self::$baseUrl = 'http://127.0.0.1:' . $port;

        // Wait until server responds.
        $ready = false;
        for ($i = 0; $i < 40; $i++) {
            $ctx = stream_context_create(['http' => ['ignore_errors' => true]]);
            $resp = @file_get_contents(self::$baseUrl . '/api/posts.php?limit=1', false, $ctx);
            if ($resp !== false) {
                $ready = true;
                break;
            }
            usleep(100_000);
        }
        if (!$ready) throw new RuntimeException('PHP built-in server did not become ready');
    }

    private static function stopServer(): void
    {
        if (is_resource(self::$proc)) {
            @proc_terminate(self::$proc);
            @proc_close(self::$proc);
        }
        self::$proc = null;
    }

    private static function request(string $method, string $path, ?array $jsonBody = null): array
    {
        $headers = "Accept: application/json\r\n";
        $content = null;
        if ($jsonBody !== null) {
            $headers .= "Content-Type: application/json\r\n";
            $content = json_encode($jsonBody);
        }

        $opts = [
            'http' => [
                'method' => $method,
                'ignore_errors' => true,
                'header' => $headers,
            ],
        ];
        if ($content !== null) {
            $opts['http']['content'] = $content;
        }

        $ctx = stream_context_create($opts);
        $body = file_get_contents(self::$baseUrl . $path, false, $ctx);
        $status = 0;
        $respHeaders = $http_response_header ?? [];
        foreach ($respHeaders as $h) {
            if (preg_match('#^HTTP/\\S+\\s+(\\d+)#', $h, $m)) {
                $status = (int)$m[1];
                break;
            }
        }

        $json = null;
        if (is_string($body)) {
            $decoded = json_decode($body, true);
            if (is_array($decoded)) $json = $decoded;
        }

        return ['status' => $status, 'body' => $body, 'json' => $json];
    }

    public static function setUpBeforeClass(): void
    {
        self::requireDbEnvOrSkip();

        $pdo = self::pdo();
        self::execSchema($pdo);
        self::seed($pdo);

        self::startServer();
    }

    public static function tearDownAfterClass(): void
    {
        self::stopServer();
    }

    public function testPostsListReturnsSeededPost(): void
    {
        $res = self::request('GET', '/api/posts.php?limit=10');
        $this->assertSame(200, $res['status']);
        $this->assertIsArray($res['json']);
        $this->assertArrayHasKey('posts', $res['json']);

        $slugs = array_map(fn ($p) => $p['slug'] ?? null, $res['json']['posts']);
        $this->assertContains('hello-world', $slugs);
    }

    public function testPostsSingleReturnsContent(): void
    {
        $res = self::request('GET', '/api/posts.php?slug=hello-world');
        $this->assertSame(200, $res['status']);
        $this->assertSame('hello-world', $res['json']['post']['slug']);
        $this->assertStringContainsString('Test post content', $res['json']['post']['content']);
    }

    public function testLikesToggleFlow(): void
    {
        $res0 = self::request('GET', '/api/likes.php?slug=hello-world&user_id=test-user');
        $this->assertSame(200, $res0['status']);
        $this->assertSame(0, $res0['json']['count']);
        $this->assertFalse($res0['json']['liked']);

        $res1 = self::request('POST', '/api/likes.php', ['slug' => 'hello-world', 'user_id' => 'test-user']);
        $this->assertSame(200, $res1['status']);
        $this->assertSame(1, $res1['json']['count']);
        $this->assertTrue($res1['json']['liked']);

        $res2 = self::request('POST', '/api/likes.php', ['slug' => 'hello-world', 'user_id' => 'test-user']);
        $this->assertSame(200, $res2['status']);
        $this->assertSame(0, $res2['json']['count']);
        $this->assertFalse($res2['json']['liked']);
    }

    public function testCommentsAddAndList(): void
    {
        $list0 = self::request('GET', '/api/comments.php?slug=hello-world');
        $this->assertSame(200, $list0['status']);
        $this->assertSame([], $list0['json']['comments']);

        $add = self::request('POST', '/api/comments.php', [
            'slug' => 'hello-world',
            'author_name' => 'Test User',
            'author_email' => 'test@example.com',
            'content' => 'Nice post!',
        ]);
        $this->assertSame(200, $add['status']);
        $this->assertSame('hello-world', $add['json']['comment']['slug']);
        $this->assertSame('Test User', $add['json']['comment']['author_name']);
        $this->assertSame('Nice post!', $add['json']['comment']['content']);

        $list1 = self::request('GET', '/api/comments.php?slug=hello-world');
        $this->assertSame(200, $list1['status']);
        $this->assertCount(1, $list1['json']['comments']);
        $this->assertSame('Nice post!', $list1['json']['comments'][0]['content']);
    }

    public function testContactSavesToDbAndLogsEmail(): void
    {
        $logPath = self::env('MAIL_LOG_PATH') ?? (sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'portfolio-mail-integration.log');
        @unlink($logPath);

        $res = self::request('POST', '/api/contact.php', [
            'name' => 'Salisu',
            'email' => 'sender@example.com',
            'subject' => 'Hello',
            'message' => 'This is a test message',
            'website' => '',
        ]);
        $this->assertSame(200, $res['status']);
        $this->assertTrue($res['json']['ok']);

        $pdo = self::pdo();
        $stmt = $pdo->query('SELECT COUNT(*) AS cnt FROM contact_messages');
        $cnt = (int)($stmt->fetch()['cnt'] ?? 0);
        $this->assertSame(1, $cnt);

        $this->assertFileExists($logPath);
        $lines = file($logPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $this->assertNotEmpty($lines);
        $last = json_decode($lines[count($lines) - 1], true);
        $this->assertSame('hello@salisu.dev', $last['to']);
        $this->assertStringContainsString('[Portfolio]', $last['subject']);
        $this->assertStringContainsString('sender@example.com', $last['body']);
    }
}
