import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { exec } from 'child_process';

// Sample dummy token formatted to match standard secret scanner patterns
// (This is intentionally a dummy pattern for Aikido Secret Detection testing)
export const DUMMY_AIKIDO_TEST_SECRET = "aikido_sec_test_live_abc1234567890sample";

/**
 * 1. Path Traversal Test Handler (CWE-22)
 * Demonstrates the exact pattern flagged by Aikido SAST:
 * Vulnerable: directly joining user-supplied filename without boundary check.
 * AutoFix: resolving path, verifying it starts with the base directory, or using path.basename().
 */
export function handlePathTraversalTest(filename: string, mode: 'vulnerable' | 'safe'): {
  success: boolean;
  resolvedPath: string;
  content?: string;
  error?: string;
  securityNotice: string;
} {
  const baseDir = path.resolve(process.cwd(), 'data', 'invoices');

  if (mode === 'vulnerable') {
    // Flagged by Aikido SAST as Potential Path Traversal:
    const insecurePath = path.join(baseDir, filename);
    try {
      if (fs.existsSync(insecurePath)) {
        const fileContent = fs.readFileSync(insecurePath, 'utf8');
        return {
          success: true,
          resolvedPath: insecurePath,
          content: fileContent,
          securityNotice: insecurePath.startsWith(baseDir)
              ? 'Access permitted within invoice directory.'
              : 'VULNERABILITY TRIGGERED: Read file outside safe boundary!'
        };
      }
      return {
        success: false,
        resolvedPath: insecurePath,
        error: 'File does not exist at requested path',
        securityNotice: 'Insecure join allowed traversal attempt.'
      };
    } catch (err: any) {
      return {
        success: false,
        resolvedPath: insecurePath,
        error: err.message,
        securityNotice: 'Insecure path read failed.'
      };
    }
  } else {
    // Aikido AutoFix Remediation:
    // 1. Sanitize to filename only or verify strict directory boundary
    const safeFilename = path.basename(filename);
    const safePath = path.resolve(baseDir, safeFilename);

    if (!safePath.startsWith(baseDir)) {
      return {
        success: false,
        resolvedPath: safePath,
        error: 'Access Denied: Path Traversal Detected and Blocked.',
        securityNotice: 'Aikido AutoFix Guard: Boundary check prevented traversal.'
      };
    }

    try {
      if (fs.existsSync(safePath)) {
        const fileContent = fs.readFileSync(safePath, 'utf8');
        return {
          success: true,
          resolvedPath: safePath,
          content: fileContent,
          securityNotice: 'Aikido AutoFix Applied: Safely served from allowed directory.'
        };
      }
      return {
        success: false,
        resolvedPath: safePath,
        error: 'File not found in designated directory',
        securityNotice: 'Path safely resolved to base directory.'
      };
    } catch (err: any) {
      return {
        success: false,
        resolvedPath: safePath,
        error: err.message,
        securityNotice: 'Safe read failed.'
      };
    }
  }
}

/**
 * 2. ReDoS (Regular Expression Denial of Service - CWE-1333)
 * Vulnerable: Nested quantifiers like ([a-zA-Z0-9]+)+ causing polynomial/exponential backtracking.
 * AutoFix: Replaced with linear regex pattern: ^[a-zA-Z0-9_-]+$
 */
export function handleRedosTest(input: string, mode: 'vulnerable' | 'safe'): {
  isValid: boolean;
  durationMs: number;
  patternUsed: string;
  securityNotice: string;
} {
  const start = performance.now();
  let isValid = false;
  let patternUsed = '';

  if (mode === 'vulnerable') {
    // Aikido SAST flags polynomial catastrophic backtracking:
    patternUsed = '^([a-zA-Z0-9_.-]+)+@([a-zA-Z0-9_.-]+)+$';
    const vulnerableRegex = new RegExp(patternUsed);
    isValid = vulnerableRegex.test(input);
  } else {
    // Aikido AutoFix replaces nested quantifiers with atomic/non-backtracking linear regex:
    patternUsed = '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$';
    const safeRegex = new RegExp(patternUsed);
    isValid = safeRegex.test(input);
  }

  const durationMs = +(performance.now() - start).toFixed(4);

  return {
    isValid,
    durationMs,
    patternUsed,
    securityNotice: mode === 'vulnerable'
        ? 'Vulnerable regex with nested quantifiers (causes exponential evaluation time on crafted inputs).'
        : 'Aikido AutoFix linear regular expression (guaranteed O(N) evaluation time).'
  };
}

/**
 * 3. Weak Cryptography / Token Generation (CWE-330)
 * Vulnerable: Math.random() is predictable and PRNG seeded.
 * AutoFix: crypto.randomBytes() or crypto.randomUUID().
 */
export function handleCryptoRngTest(mode: 'vulnerable' | 'safe'): {
  token: string;
  method: string;
  entropyBits: number;
  isCryptographicallySecure: boolean;
  securityNotice: string;
} {
  if (mode === 'vulnerable') {
    // Aikido SAST flags Math.random for security tokens
    const weakToken = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    return {
      token: weakToken,
      method: 'Math.random() (Vulnerable Pseudo-RNG)',
      entropyBits: 32,
      isCryptographicallySecure: false,
      securityNotice: 'Math.random() is non-cryptographic and predictable. Aikido AutoFix replaces this with Node crypto.'
    };
  } else {
    // Aikido AutoFix replaces with crypto.randomBytes
    const secureToken = 'ORD-' + crypto.randomBytes(8).toString('hex').toUpperCase();
    return {
      token: secureToken,
      method: 'crypto.randomBytes() (CSPRNG)',
      entropyBits: 128,
      isCryptographicallySecure: true,
      securityNotice: 'Aikido AutoFix applied: Cryptographically secure random bytes generated with high entropy.'
    };
  }
}

/**
 * 4. Open Redirect (CWE-601)
 * Vulnerable: res.redirect(targetUrl) without verifying domain or relative path.
 * AutoFix: Whitelist check or relative-only enforce.
 */
export function handleOpenRedirectTest(target: string, mode: 'vulnerable' | 'safe'): {
  redirectUrl: string;
  status: 'allowed' | 'blocked';
  securityNotice: string;
} {
  if (mode === 'vulnerable') {
    return {
      redirectUrl: target,
      status: 'allowed',
      securityNotice: 'Insecure redirect permitted without validation. Attackers can phish users via your domain.'
    };
  } else {
    // Aikido AutoFix safe URL verification
    const isRelative = target.startsWith('/') && !target.startsWith('//');
    const isWhitelisted = target.startsWith('https://aikido.dev') || target.startsWith('https://github.com');

    if (isRelative || isWhitelisted) {
      return {
        redirectUrl: target,
        status: 'allowed',
        securityNotice: 'Aikido AutoFix applied: Destination validated against safe relative paths and allowlisted domains.'
      };
    }

    return {
      redirectUrl: '/dashboard?error=unauthorized_redirect',
      status: 'blocked',
      securityNotice: 'Aikido AutoFix Guard: Untrusted external target blocked. Falling back to local route.'
    };
  }
}

/**
 * 5. OS Command Injection (CWE-78) - CRITICAL SEVERITY
 * Vulnerable: Direct interpolation of user-supplied parameter into child_process.exec()
 * AutoFix: Strict character allowlist and parameterized execution
 */
export function handleCommandInjectionTest(host: string, mode: 'vulnerable' | 'safe'): Promise<{
  success: boolean;
  command: string;
  output?: string;
  error?: string;
  securityNotice: string;
}> {
  return new Promise((resolve) => {
    if (mode === 'vulnerable') {
      // ❌ CRITICAL SAST Finding (CWE-78: OS Command Injection)
      // Aikido SAST flags unescaped concatenation into child_process.exec()
      const cmd = `echo "Ping check: ${host}"`;
      exec(cmd, (error, stdout) => {
        if (error) {
          resolve({
            success: false,
            command: cmd,
            error: error.message,
            securityNotice: 'CRITICAL VULNERABILITY: Shell command injection executed unvalidated user input.'
          });
        } else {
          resolve({
            success: true,
            command: cmd,
            output: stdout.trim(),
            securityNotice: 'CRITICAL VULNERABILITY: User input concatenated directly into shell.'
          });
        }
      });
    } else {
      // ✅ Aikido AutoFix Remediation:
      // Strictly validate hostname / IP format to block shell metacharacters and invalid commands
      const trimmed = host.trim();
      const isValidHost = /^[a-zA-Z0-9.-]+$/.test(trimmed);

      if (!isValidHost) {
        resolve({
          success: false,
          command: 'echo "Ping check: blocked"',
          error: 'Security Guard: Invalid host syntax. Shell metacharacters or spaces detected.',
          securityNotice: 'Aikido AutoFix Guard: Blocked invalid host syntax and prevented command injection.'
        });
        return;
      }

      const cmd = `echo "Ping check: ${trimmed}"`;
      resolve({
        success: true,
        command: cmd,
        output: `Ping check: ${trimmed}`,
        securityNotice: 'Aikido AutoFix Guard: Validated hostname and safely executed without shell expansion.'
      });
    }
  });
}

