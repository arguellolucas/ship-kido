import { describe, it, expect } from 'vitest';
import { handlePathTraversalTest } from './vulnerabilities';
import path from 'path';

describe('Path Traversal Vulnerability (CWE-22) - Security Tests', () => {
  const baseDir = path.resolve(process.cwd(), 'data', 'invoices');

  describe('Vulnerable mode with mitigation', () => {
    it('should block path traversal using ../ to access parent directory', () => {
      const result = handlePathTraversalTest('../internal_confidential.txt', 'vulnerable');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Access denied');
      expect(result.securityNotice).toBe('Invalid path');
    });

    it('should block path traversal using multiple ../ sequences', () => {
      const result = handlePathTraversalTest('../../etc/passwd', 'vulnerable');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Access denied');
      expect(result.securityNotice).toBe('Invalid path');
    });

    it('should block path traversal using absolute paths', () => {
      const result = handlePathTraversalTest('/etc/passwd', 'vulnerable');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Access denied');
      expect(result.securityNotice).toBe('Invalid path');
    });

    it('should block path traversal with encoded ../ sequences', () => {
      // URL-encoded ../ is %2e%2e%2f
      const result = handlePathTraversalTest('..%2f..%2finternal_confidential.txt', 'vulnerable');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Access denied');
      expect(result.securityNotice).toBe('Invalid path');
    });

    it('should allow access to valid files within the base directory', () => {
      const result = handlePathTraversalTest('inv-1001.txt', 'vulnerable');
      
      expect(result.success).toBe(true);
      expect(result.content).toContain('INVOICE #INV-1001');
      expect(result.resolvedPath).toContain(path.join('data', 'invoices', 'inv-1001.txt'));
    });

    it('should return error for non-existent files within base directory', () => {
      const result = handlePathTraversalTest('non-existent.txt', 'vulnerable');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('File does not exist at requested path');
    });
  });

  describe('Safe mode with path.basename sanitization', () => {
    it('should sanitize path traversal attempts by extracting basename only', () => {
      const result = handlePathTraversalTest('../internal_confidential.txt', 'safe');
      
      // path.basename('../internal_confidential.txt') = 'internal_confidential.txt'
      // This file doesn't exist in the invoices directory, so it should fail safely
      expect(result.success).toBe(false);
      expect(result.error).toBe('File not found in designated directory');
      expect(result.securityNotice).toBe('Path safely resolved to base directory.');
    });

    it('should allow access to valid invoice files', () => {
      const result = handlePathTraversalTest('inv-1002.txt', 'safe');
      
      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.securityNotice).toBe('Aikido AutoFix Applied: Safely served from allowed directory.');
    });

    it('should sanitize complex path traversal attempts', () => {
      const result = handlePathTraversalTest('../../etc/passwd', 'safe');
      
      // path.basename('../../etc/passwd') = 'passwd'
      expect(result.success).toBe(false);
      expect(result.error).toBe('File not found in designated directory');
    });

    it('should handle absolute paths by extracting basename', () => {
      const result = handlePathTraversalTest('/etc/shadow', 'safe');
      
      // path.basename('/etc/shadow') = 'shadow'
      expect(result.success).toBe(false);
      expect(result.error).toBe('File not found in designated directory');
    });
  });

  describe('Path resolution security properties', () => {
    it('should ensure resolved path stays within base directory in vulnerable mode', () => {
      const result = handlePathTraversalTest('inv-1001.txt', 'vulnerable');
      
      expect(result.resolvedPath.startsWith(baseDir)).toBe(true);
    });

    it('should ensure resolved path stays within base directory in safe mode', () => {
      const result = handlePathTraversalTest('inv-1001.txt', 'safe');
      
      expect(result.resolvedPath.startsWith(baseDir)).toBe(true);
    });

    it('should reject paths that resolve outside base directory in vulnerable mode', () => {
      const result = handlePathTraversalTest('../internal_confidential.txt', 'vulnerable');
      
      // The path should be rejected before file access
      expect(result.success).toBe(false);
      expect(result.error).toBe('Access denied');
    });
  });
});
