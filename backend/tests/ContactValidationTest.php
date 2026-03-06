<?php

use PHPUnit\Framework\TestCase;

final class ContactValidationTest extends TestCase
{
    public function testHoneypotIsIgnored(): void
    {
        $body = [
            'name' => 'Test',
            'email' => 'test@example.com',
            'message' => 'Hello',
            'website' => 'https://spam.example.com',
        ];

        $this->assertTrue(contact_should_ignore($body));
    }

    public function testMissingFieldsAreRejected(): void
    {
        $result = contact_validate([
            'name' => '',
            'email' => 'test@example.com',
            'message' => 'Hello',
        ]);

        $this->assertFalse($result['ok']);
        $this->assertSame('Missing name, email, or message', $result['error']);
    }

    public function testInvalidEmailIsRejected(): void
    {
        $result = contact_validate([
            'name' => 'Test',
            'email' => 'not-an-email',
            'message' => 'Hello',
        ]);

        $this->assertFalse($result['ok']);
        $this->assertSame('invalid email', $result['error']);
    }

    public function testTooManyLinksIsRejected(): void
    {
        $result = contact_validate([
            'name' => 'Test',
            'email' => 'test@example.com',
            'message' => 'a https://1 a https://2 a https://3 a https://4',
        ]);

        $this->assertFalse($result['ok']);
        $this->assertSame('message contains too many links', $result['error']);
    }

    public function testValidPayloadIsNormalized(): void
    {
        $result = contact_validate([
            'name' => '  Salisu  ',
            'email' => ' test@example.com ',
            'subject' => '  Hello ',
            'message' => '  Message body  ',
        ]);

        $this->assertTrue($result['ok']);
        $this->assertSame('Salisu', $result['data']['name']);
        $this->assertSame('test@example.com', $result['data']['email']);
        $this->assertSame('Hello', $result['data']['subject']);
        $this->assertSame('Message body', $result['data']['message']);
    }
}

