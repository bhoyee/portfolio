<?php

use PHPUnit\Framework\TestCase;

final class MailTransportTest extends TestCase
{
    public function testLogTransportWritesToFile(): void
    {
        require_once __DIR__ . '/../../public/api/lib/mail.php';

        $tmp = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'portfolio-mail-test.log';
        @unlink($tmp);

        putenv('MAIL_TRANSPORT=log');
        putenv('MAIL_LOG_PATH=' . $tmp);

        $ok = portfolio_send_mail(
            'hello@salisu.dev',
            'Test Subject',
            "Test Body\nLine 2",
            ['From: test@example.com']
        );

        $this->assertTrue($ok);
        $this->assertFileExists($tmp);

        $lines = file($tmp, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $this->assertNotEmpty($lines);

        $last = json_decode($lines[count($lines) - 1], true);
        $this->assertIsArray($last);
        $this->assertSame('hello@salisu.dev', $last['to']);
        $this->assertSame('Test Subject', $last['subject']);
        $this->assertStringContainsString('Test Body', $last['body']);
    }
}

