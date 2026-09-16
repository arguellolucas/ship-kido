import { VulnerabilityTestCase, AutoShipPolicy } from '../types';

export const VULNERABILITY_CASES: VulnerabilityTestCase[] = [
  {
    id: 'case-path-traversal',
    title: 'Path Traversal via Filename Parameter',
    category: 'SAST',
    severity: 'HIGH',
    cwe: 'CWE-22: Improper Limitation of a Pathname to a Restricted Directory',
    scannerType: 'Code (SAST)',
    description: 'User-provided filename in the invoice download controller is concatenated directly with the base directory without canonicalization or boundary checking.',
    impact: 'An attacker can supply directory traversal sequences (e.g. "../internal_confidential.txt") to read arbitrary files from the server filesystem.',
    vulnerableSnippet: `// ❌ Vulnerable (server/vulnerabilities.ts)
const baseDir = path.resolve(process.cwd(), 'data', 'invoices');
const insecurePath = path.join(baseDir, req.query.file);
const fileContent = fs.readFileSync(insecurePath, 'utf8');
res.send(fileContent);`,
    autoFixSnippet: `// ✅ Aikido AutoFix Remediation
const baseDir = path.resolve(process.cwd(), 'data', 'invoices');
const safeFilename = path.basename(req.query.file); // strip traversal elements
const safePath = path.resolve(baseDir, safeFilename);

if (!safePath.startsWith(baseDir)) {
  return res.status(403).json({ error: 'Access Denied: Path Traversal' });
}
const fileContent = fs.readFileSync(safePath, 'utf8');
res.send(fileContent);`,
    autoFixExplanation: 'Aikido AutoFix isolates the file to its basename and validates that the resolved absolute path starts strictly with the designated invoice root directory before reading.',
    endpoint: '/api/security/test/path-traversal',
    defaultTestValue: 'inv-1001.txt',
    testCases: [
      { label: 'Normal: Valid Invoice', value: 'inv-1001.txt', isMalicious: false },
      { label: 'Normal: Another Invoice', value: 'inv-1002.txt', isMalicious: false },
      { label: 'Attack: Parent Directory Traversal', value: '../internal_confidential.txt', isMalicious: true },
      { label: 'Attack: Deep Traversal Attempt', value: '../../package.json', isMalicious: true }
    ]
  },
  {
    id: 'case-redos',
    title: 'Catastrophic ReDoS in Email/Coupon Regex',
    category: 'SAST',
    severity: 'MEDIUM',
    cwe: 'CWE-1333: Inefficient Regular Expression Complexity',
    scannerType: 'Code (SAST)',
    description: 'Nested quantifiers inside email or coupon verification regex can force catastrophic polynomial/exponential backtracking when given crafted non-matching input strings.',
    impact: 'A single crafted HTTP request locks the Node.js single-threaded event loop, triggering Denial of Service for all active users.',
    vulnerableSnippet: `// ❌ Vulnerable (server/vulnerabilities.ts)
// Nested quantifiers ([a-zA-Z0-9_.-]+)+ cause catastrophic backtracking
const regex = /^([a-zA-Z0-9_.-]+)+@([a-zA-Z0-9_.-]+)+$/;
const isValid = regex.test(userEmail);`,
    autoFixSnippet: `// ✅ Aikido AutoFix Remediation
// Linear non-backtracking pattern with strict character classes
const safeRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$/;
const isValid = safeRegex.test(userEmail);`,
    autoFixExplanation: 'Aikido AutoFix detects the nested repeat groupings and replaces them with an atomic linear regular expression guaranteeing O(N) evaluation time regardless of input.',
    endpoint: '/api/security/test/redos',
    method: 'POST',
    defaultTestValue: 'developer.security@testlab.io',
    testCases: [
      { label: 'Normal: Standard Email', value: 'developer.security@testlab.io', isMalicious: false },
      { label: 'Normal: Subdomain Email', value: 'support@cloud.services.acme.co', isMalicious: false },
      { label: 'Attack: ReDoS Trigger String', value: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!', isMalicious: true }
    ]
  },
  {
    id: 'case-crypto-rng',
    title: 'Predictable Pseudo-RNG for Order & Security Tokens',
    category: 'SAST',
    severity: 'MEDIUM',
    cwe: 'CWE-330: Use of Insufficiently Random Values',
    scannerType: 'Code (SAST)',
    description: 'Order tracking numbers, session IDs, and password reset tokens generated via Math.random() can be predicted using standard linear PRNG state recovery.',
    impact: 'Attackers can brute-force or predict subsequent tracking IDs and private customer order receipts.',
    vulnerableSnippet: `// ❌ Vulnerable (server/vulnerabilities.ts)
const orderToken = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();`,
    autoFixSnippet: `// ✅ Aikido AutoFix Remediation
import crypto from 'crypto';
const orderToken = 'ORD-' + crypto.randomBytes(8).toString('hex').toUpperCase();`,
    autoFixExplanation: 'Aikido AutoFix swaps non-cryptographic Math.random() with Node.js crypto.randomBytes (or Web Crypto API crypto.getRandomValues) providing 128 bits of cryptographically secure entropy.',
    endpoint: '/api/security/test/crypto-rng',
    defaultTestValue: 'test',
    testCases: [
      { label: 'Test Default Generator', value: 'generate', isMalicious: false }
    ]
  },
  {
    id: 'case-open-redirect',
    title: 'Unvalidated External Redirect',
    category: 'SAST',
    severity: 'MEDIUM',
    cwe: 'CWE-601: URL Redirection to Untrusted Site (Open Redirect)',
    scannerType: 'Code (SAST)',
    description: 'Post-login or post-checkout redirect parameter takes arbitrary user input and passes it straight to res.redirect().',
    impact: 'Attackers craft legitimate-looking links from your domain that silently bounce victims to credential harvesting or phishing domains.',
    vulnerableSnippet: `// ❌ Vulnerable (server/vulnerabilities.ts)
app.get('/auth/callback', (req, res) => {
  res.redirect(req.query.targetUrl);
});`,
    autoFixSnippet: `// ✅ Aikido AutoFix Remediation
app.get('/auth/callback', (req, res) => {
  const target = req.query.targetUrl as string;
  const isSafe = target.startsWith('/') && !target.startsWith('//');
  res.redirect(isSafe ? target : '/dashboard');
});`,
    autoFixExplanation: 'Aikido AutoFix adds domain allowlist validation or enforces relative-only URL paths to stop open redirection.',
    endpoint: '/api/security/test/open-redirect',
    defaultTestValue: 'https://evil-phishing-site.example.com',
    testCases: [
      { label: 'Normal: Relative Dashboard Route', value: '/orders/summary', isMalicious: false },
      { label: 'Attack: External Phishing Domain', value: 'https://evil-phishing-site.example.com', isMalicious: true }
    ]
  },
  {
    id: 'case-insecure-cookies',
    title: 'Missing HttpOnly, Secure, and SameSite Cookie Flags',
    category: 'SAST',
    severity: 'LOW',
    cwe: 'CWE-1004: Sensitive Cookie Without HttpOnly Flag',
    scannerType: 'Code (SAST)',
    description: 'Session cookie is dispatched without HttpOnly, SameSite, or Secure attributes, exposing it to document.cookie theft via XSS.',
    impact: 'Session tokens can be exfiltrated by any cross-site scripting payload executing in the browser.',
    vulnerableSnippet: `// ❌ Vulnerable (server.ts)
res.setHeader('Set-Cookie', 'session_id=' + token + '; Path=/');`,
    autoFixSnippet: `// ✅ Aikido AutoFix Remediation
res.setHeader('Set-Cookie', 'session_id=' + token + '; Path=/; HttpOnly; Secure; SameSite=Strict');`,
    autoFixExplanation: 'Aikido AutoFix ensures sensitive cookies include HttpOnly (blocks JS access), Secure (HTTPS only), and SameSite=Strict (prevents CSRF).',
    endpoint: '/api/security/test/cookie-check',
    defaultTestValue: 'session_token',
    testCases: [
      { label: 'Check Cookie Header Flags', value: 'inspect', isMalicious: false }
    ]
  },
  {
    id: 'case-hardcoded-secret',
    title: 'Hardcoded API Token in Source File',
    category: 'SECRETS',
    severity: 'HIGH',
    cwe: 'CWE-798: Use of Hard-coded Credentials',
    scannerType: 'Secret Detection',
    description: 'A mock live secret matching API key entropy patterns is defined directly inside server/vulnerabilities.ts.',
    impact: 'Leaked secrets in Git history give unauthorized third parties access to external services or cloud APIs.',
    vulnerableSnippet: `// ❌ Vulnerable (server/vulnerabilities.ts:7)
export const DUMMY_AIKIDO_TEST_SECRET = "aikido_sec_test_live_abc1234567890sample";`,
    autoFixSnippet: `// ✅ Aikido AutoFix Remediation
// 1. In server/vulnerabilities.ts:
export const AIKIDO_TEST_SECRET = process.env.AIKIDO_TEST_API_TOKEN;

// 2. Automatically updated in .env.example:
AIKIDO_TEST_API_TOKEN="your_key_here"`,
    autoFixExplanation: 'Aikido detects the secret pattern, prompts for immediate revocation, and automates extracting the value into an environment variable configuration.',
    endpoint: '/api/security/test/secret-check',
    defaultTestValue: 'scan',
    testCases: [
      { label: 'Scan Codebase Secrets', value: 'scan', isMalicious: false }
    ]
  },
  {
    id: 'case-critical-sca',
    title: 'Critical Prototype Pollution in Dependency (minimist)',
    category: 'SCA',
    severity: 'CRITICAL',
    cwe: 'CWE-1321: Improperly Controlled Modification of Dynamically Determined Object Attributes',
    scannerType: 'Dependency (SCA)',
    description: 'The pinned dependency minimist (version 1.2.5) contains a Critical CVSS 9.8 vulnerability (CVE-2021-44906 / GHSA-xvch-5gv4-984h) allowing attackers to inject properties onto Object.prototype via __proto__ parameters.',
    impact: 'Attackers can bypass security checks, alter application logic, or cause Denial of Service across the entire Node.js runtime process.',
    vulnerableSnippet: `// ❌ Vulnerable (package.json & package-lock.json)
"dependencies": {
  "minimist": "1.2.5",      // Critical CVSS 9.8 (CVE-2021-44906)
  "jsonwebtoken": "8.5.1"   // High/Critical (CVE-2022-23529)
}`,
    autoFixSnippet: `// ✅ Aikido AutoFix / AutoShip Remediation
"dependencies": {
  "minimist": "^1.2.8",     // Patched version cleanly merged by AutoShip
  "jsonwebtoken": "^9.0.2"
}`,
    autoFixExplanation: 'Aikido SCA scans lockfiles on every commit, flags the Critical CVE, and generates an automated non-breaking dependency bump PR that AutoShip merges once CI passes.',
    endpoint: '/api/security/test/secret-check',
    defaultTestValue: 'scan',
    testCases: [
      { label: 'Inspect SCA Dependencies', value: 'scan', isMalicious: false }
    ]
  },
  {
    id: 'case-critical-sca',
    title: 'Critical Prototype Pollution in Dependency (minimist)',
    category: 'SCA',
    severity: 'CRITICAL',
    cwe: 'CWE-1321: Improperly Controlled Modification of Dynamically Determined Object Attributes',
    scannerType: 'Dependency (SCA)',
    description: 'The pinned dependency minimist (version 1.2.5) contains a Critical CVSS 9.8 vulnerability (CVE-2021-44906 / GHSA-xvch-5gv4-984h) allowing attackers to inject properties onto Object.prototype via __proto__ parameters.',
    impact: 'Attackers can bypass security checks, alter application logic, or cause Denial of Service across the entire Node.js runtime process.',
    vulnerableSnippet: `// ❌ Vulnerable (package.json & package-lock.json)
"dependencies": {
  "minimist": "1.2.5",      // Critical CVSS 9.8 (CVE-2021-44906)
  "jsonwebtoken": "8.5.1"   // High/Critical (CVE-2022-23529)
}`,
    autoFixSnippet: `// ✅ Aikido AutoFix / AutoShip Remediation
"dependencies": {
  "minimist": "^1.2.8",     // Patched version cleanly merged by AutoShip
  "jsonwebtoken": "^9.0.2"
}`,
    autoFixExplanation: 'Aikido SCA scans lockfiles on every commit, flags the Critical CVE, and generates an automated non-breaking dependency bump PR that AutoShip merges once CI passes.',
    endpoint: '/api/security/test/secret-check',
    defaultTestValue: 'scan',
    testCases: [
      { label: 'Inspect SCA Dependencies', value: 'scan', isMalicious: false }
    ]
  },
  {
    id: 'case-command-injection',
    title: 'OS Command Injection in Network Diagnostic Handler',
    category: 'SAST',
    severity: 'CRITICAL',
    cwe: 'CWE-78: Improper Neutralization of Special Elements used in an OS Command',
    scannerType: 'Code (SAST)',
    description: 'User-provided host parameter is passed directly into a shell execution string inside child_process.exec() without escaping or argument binding.',
    impact: 'Attackers can append shell metacharacters (; && || | ` $) to execute arbitrary operating system commands with server privileges.',
    vulnerableSnippet: `// ❌ CRITICAL SAST Finding (server/vulnerabilities.ts)
const cmd = \`echo "Ping check: \${req.query.host}"\`;
exec(cmd, (err, stdout) => {
  res.send(stdout);
});`,
    autoFixSnippet: `// ✅ Aikido AutoFix Remediation
// 1. Enforce strict allowlist on allowed host characters:
const safeHost = req.query.host.replace(/[^a-zA-Z0-9.-]/g, '');
const cmd = \`echo "Ping check: \${safeHost}"\`;
exec(cmd, (err, stdout) => { ... });`,
    autoFixExplanation: 'Aikido SAST flags child_process.exec with untrusted variables as Critical, proposing strict character validation or spawn with argument vectors.',
    endpoint: '/api/security/test/command-injection',
    defaultTestValue: '127.0.0.1; id; cat /etc/passwd',
    testCases: [
      { label: 'Benign Host', value: '127.0.0.1', isMalicious: false },
      { label: 'Attack: Command Chaining (; id)', value: '127.0.0.1; id', isMalicious: true },
      { label: 'Attack: Subshell ($(...))', value: '127.0.0.1 && whoami', isMalicious: true }
    ]
  }
];

export const SAMPLE_AUTOSHIP_POLICIES: AutoShipPolicy[] = [
  {
    id: 'policy-1',
    name: 'Patch & Minor AutoShip Policy',
    description: 'Automatically merge dependency vulnerability updates (SCA) and AutoFix PRs if severity is Medium or lower and CI test suite is 100% green.',
    active: true,
    criteria: {
      requireGreenCI: true,
      maxSeverity: 'MEDIUM',
      semverType: 'minor',
      requireAiAutoFixHighConfidence: true,
      autoMergeBranch: 'main'
    },
    samplePR: {
      prNumber: 42,
      title: 'chore(deps): [Aikido AutoFix] Update path traversal boundary check in invoice controller',
      branch: 'aikido/autofix-cwe-22-invoices',
      diffSnippet: `+ const safeFilename = path.basename(req.query.file);
+ const safePath = path.resolve(baseDir, safeFilename);
+ if (!safePath.startsWith(baseDir)) return res.status(403);`,
      ciStatus: 'passed',
      confidenceScore: 98,
      status: 'Merged Automatically'
    }
  },
  {
    id: 'policy-2',
    name: 'SCA Transitive Security Bumps',
    description: 'Direct auto-merge of low-risk npm package minor updates with no API breaking changes.',
    active: true,
    criteria: {
      requireGreenCI: true,
      maxSeverity: 'LOW',
      semverType: 'patch',
      requireAiAutoFixHighConfidence: false,
      autoMergeBranch: 'main'
    },
    samplePR: {
      prNumber: 43,
      title: 'fix(security): [Aikido AutoShip] Bump express from 4.21.0 to 4.21.2',
      branch: 'aikido/bump-express-4-21-2',
      diffSnippet: `- "express": "4.21.0"
+ "express": "4.21.2"`,
      ciStatus: 'passed',
      confidenceScore: 100,
      status: 'Merged Automatically'
    }
  }
];
