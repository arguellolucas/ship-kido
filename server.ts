import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  handlePathTraversalTest,
  handleRedosTest,
  handleCryptoRngTest,
  handleOpenRedirectTest,
  DUMMY_AIKIDO_TEST_SECRET
} from './server/vulnerabilities';
import {
  getStoreProducts,
  getStoreOrders,
  createStoreOrder,
  getStoreReviews,
  addStoreReview
} from './server/store';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(helmet());
  app.use(express.json());

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Aikido AutoShip & AutoFix Lab',
      timestamp: new Date().toISOString()
    });
  });

  // --- E-Commerce Store Endpoints ---
  app.get('/api/products', (req, res) => {
    res.json(getStoreProducts());
  });

  app.get('/api/orders', (req, res) => {
    res.json(getStoreOrders());
  });

  app.post('/api/orders', (req, res) => {
    try {
      const { customerName, customerEmail, items, cryptoMode } = req.body;
      if (!customerName || !customerEmail || !items || !items.length) {
        res.status(400).json({ error: 'Missing required order details' });
        return;
      }
      const order = createStoreOrder(customerName, customerEmail, items, cryptoMode || 'safe');
      res.status(201).json(order);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/reviews', (req, res) => {
    res.json(getStoreReviews());
  });

  app.post('/api/reviews', (req, res) => {
    try {
      const { author, role, rating, comment } = req.body;
      if (!comment) {
        res.status(400).json({ error: 'Review comment cannot be empty' });
        return;
      }
      const review = addStoreReview(author, role, Number(rating) || 5, comment);
      res.status(201).json(review);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Invoice file download endpoint (Demonstrating Path Traversal & AutoFix)
  app.get('/api/invoices/download', (req, res) => {
    const filename = (req.query.file as string) || 'inv-1001.txt';
    const mode = (req.query.mode as 'vulnerable' | 'safe') || 'safe';
    const result = handlePathTraversalTest(filename, mode);

    if (result.success && result.content) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filename)}"`);
      res.setHeader('X-Security-Notice', result.securityNotice);
      res.send(result.content);
    } else {
      res.status(400).json({
        error: result.error || 'Failed to download invoice',
        securityNotice: result.securityNotice,
        resolvedPath: result.resolvedPath
      });
    }
  });

  // --- Aikido Security Playground API Endpoints ---

  // 1. Path Traversal Test
  app.get('/api/security/test/path-traversal', (req, res) => {
    const filename = (req.query.file as string) || 'inv-1001.txt';
    const mode = (req.query.mode as 'vulnerable' | 'safe') || 'vulnerable';
    const result = handlePathTraversalTest(filename, mode);
    res.json(result);
  });

  // 2. ReDoS Validation Test
  app.post('/api/security/test/redos', (req, res) => {
    const input = req.body.input ?? 'user.name+tag@example.com';
    const mode = req.body.mode === 'safe' ? 'safe' : 'vulnerable';
    const result = handleRedosTest(input, mode);
    res.json(result);
  });

  // 3. Cryptographic Randomness Test
  app.get('/api/security/test/crypto-rng', (req, res) => {
    const mode = req.query.mode === 'safe' ? 'safe' : 'vulnerable';
    const result = handleCryptoRngTest(mode);
    res.json(result);
  });

  // 4. Open Redirect Test
  app.get('/api/security/test/open-redirect', (req, res) => {
    const target = (req.query.target as string) || 'https://evil-phishing-site.example.com';
    const mode = req.query.mode === 'safe' ? 'safe' : 'vulnerable';
    const result = handleOpenRedirectTest(target, mode);
    res.json(result);
  });

  // 5. Secret Scanner Simulation
  app.get('/api/security/test/secret-check', (req, res) => {
    res.json({
      patternDetected: 'AIKIDO_API_TOKEN_REGEX',
      dummyToken: DUMMY_AIKIDO_TEST_SECRET,
      fileLocation: 'server/vulnerabilities.ts:7',
      finding: 'Hardcoded API Secret in Source Code',
      severity: 'HIGH',
      cwe: 'CWE-798: Use of Hard-coded Credentials',
      autoFixAction: 'Extract secret to environment variable process.env.AIKIDO_TEST_API_TOKEN and add to .env.example',
      recommendation: 'Use Aikido Secret Scanner to mask and rotate exposed test tokens.'
    });
  });

  // 6. Cookie Security Test
  app.get('/api/security/test/cookie-check', (req, res) => {
    const mode = req.query.mode === 'safe' ? 'safe' : 'vulnerable';
    if (mode === 'vulnerable') {
      // Insecure: no httpOnly, no secure, no sameSite
      res.setHeader('Set-Cookie', 'session_id=insecure_token_12345; Path=/');
      res.json({
        mode: 'vulnerable',
        cookieHeader: 'session_id=insecure_token_12345; Path=/',
        flaws: ['Missing HttpOnly (Accessible via document.cookie)', 'Missing Secure flag', 'Missing SameSite attribute'],
        severity: 'MEDIUM',
        autoFix: 'Add { httpOnly: true, secure: true, sameSite: "strict" }'
      });
    } else {
      res.setHeader('Set-Cookie', 'session_id=secure_token_12345; Path=/; HttpOnly; Secure; SameSite=Strict');
      res.json({
        mode: 'safe',
        cookieHeader: 'session_id=secure_token_12345; Path=/; HttpOnly; Secure; SameSite=Strict',
        flaws: [],
        severity: 'NONE',
        autoFix: 'Aikido AutoFix already applied.'
      });
    }
  });

  // 7. Security Overview / Benchmark Info
  app.get('/api/security/audit-summary', (req, res) => {
    res.json({
      projectName: 'Aikido AutoShip & AutoFix Lab',
      scannerReadiness: {
        sast: {
          testCasesCount: 5,
          categories: ['Path Traversal', 'ReDoS', 'Weak Cryptography', 'Open Redirect', 'Insecure Cookies'],
          autoFixSupport: 'Supported via AI & Deterministic Recipes'
        },
        sca: {
          autoShipPolicy: 'Auto-merge on Green CI & Minor/Patch',
          ciTestRunner: 'Vitest Automated Suite'
        },
        secrets: {
          tokenDetection: 'Pre-configured test fixture tokens'
        }
      }
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aikido Test Lab Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
