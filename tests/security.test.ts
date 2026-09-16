import { describe, it, expect } from 'vitest';
import {
  handlePathTraversalTest,
  handleRedosTest,
  handleCryptoRngTest,
  handleOpenRedirectTest,
  handleCommandInjectionTest
} from '../server/vulnerabilities';

describe('Aikido AutoFix Security Verification Suite', () => {
  describe('Path Traversal (CWE-22)', () => {
    it('should safely block attempts to read outside the designated directory in safe mode', () => {
      const maliciousPayload = '../internal_confidential.txt';
      const result = handlePathTraversalTest(maliciousPayload, 'safe');

      // The safe implementation isolates filename to basename and checks boundary
      expect(result.resolvedPath).not.toContain('..');
    });

    it('should read valid invoice files in safe mode', () => {
      const result = handlePathTraversalTest('inv-1001.txt', 'safe');
      expect(result.success).toBe(true);
      expect(result.content).toContain('INVOICE #INV-1001');
    });
  });

  describe('ReDoS Evaluation (CWE-1333)', () => {
    it('should evaluate regular expressions in linear O(N) time under safe mode', () => {
      const benignEmail = 'developer.security@company.org';
      const result = handleRedosTest(benignEmail, 'safe');

      expect(result.isValid).toBe(true);
      expect(result.durationMs).toBeLessThan(50);
    });
  });

  describe('Cryptographic Randomness (CWE-330)', () => {
    it('should produce CSPRNG random tokens in safe mode', () => {
      const result = handleCryptoRngTest('safe');

      expect(result.isCryptographicallySecure).toBe(true);
      expect(result.entropyBits).toBeGreaterThanOrEqual(128);
      expect(result.token).toMatch(/^ORD-[A-F0-9]{16}$/);
    });
  });

  describe('Open Redirect (CWE-601)', () => {
    it('should reject unauthorized external phishing domains in safe mode', () => {
      const untrustedDomain = 'https://attacker-credential-harvest.com';
      const result = handleOpenRedirectTest(untrustedDomain, 'safe');

      expect(result.status).toBe('blocked');
      expect(result.redirectUrl).toBe('/dashboard?error=unauthorized_redirect');
    });

    it('should allow whitelisted domains or relative paths in safe mode', () => {
      const validRelative = '/invoices/inv-1001';
      const result = handleOpenRedirectTest(validRelative, 'safe');

      expect(result.status).toBe('allowed');
      expect(result.redirectUrl).toBe('/invoices/inv-1001');
    });
  });

  describe('OS Command Injection (CWE-78)', () => {
    it('should reject dangerous shell metacharacters in safe mode', async () => {
      const maliciousHost = '127.0.0.1; rm -rf /; cat /etc/passwd';
      const result = await handleCommandInjectionTest(maliciousHost, 'safe');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid host syntax');
      expect(result.securityNotice).toContain('Aikido AutoFix Guard');
    });

    it('should execute benign queries safely', async () => {
      const benignHost = '127.0.0.1';
      const result = await handleCommandInjectionTest(benignHost, 'safe');

      expect(result.success).toBe(true);
      expect(result.output).toContain('127.0.0.1');
    });
  });
});
