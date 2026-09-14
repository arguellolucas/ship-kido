import React, { useState } from 'react';
import { Terminal, CheckCircle2, Play, RefreshCw, GitMerge, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

interface TestItem {
  name: string;
  file: string;
  suite: string;
  durationMs: number;
  status: 'passed' | 'failed';
  cweTested?: string;
}

export const CiTestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<string>('Just now');
  const [tests, setTests] = useState<TestItem[]>([
    {
      name: 'should safely block attempts to read outside designated directory in safe mode',
      file: 'tests/security.test.ts',
      suite: 'Path Traversal (CWE-22)',
      durationMs: 4.2,
      status: 'passed',
      cweTested: 'CWE-22'
    },
    {
      name: 'should read valid invoice files in safe mode',
      file: 'tests/security.test.ts',
      suite: 'Path Traversal (CWE-22)',
      durationMs: 2.1,
      status: 'passed',
      cweTested: 'CWE-22'
    },
    {
      name: 'should evaluate regular expressions in linear O(N) time under safe mode',
      file: 'tests/security.test.ts',
      suite: 'ReDoS Evaluation (CWE-1333)',
      durationMs: 1.8,
      status: 'passed',
      cweTested: 'CWE-1333'
    },
    {
      name: 'should produce CSPRNG random tokens in safe mode',
      file: 'tests/security.test.ts',
      suite: 'Cryptographic Randomness (CWE-330)',
      durationMs: 3.5,
      status: 'passed',
      cweTested: 'CWE-330'
    },
    {
      name: 'should reject unauthorized external phishing domains in safe mode',
      file: 'tests/security.test.ts',
      suite: 'Open Redirect (CWE-601)',
      durationMs: 1.6,
      status: 'passed',
      cweTested: 'CWE-601'
    },
    {
      name: 'should allow whitelisted domains or relative paths in safe mode',
      file: 'tests/security.test.ts',
      suite: 'Open Redirect (CWE-601)',
      durationMs: 1.1,
      status: 'passed',
      cweTested: 'CWE-601'
    },
    {
      name: 'should return initial product catalog with valid pricing and stock',
      file: 'tests/store.test.ts',
      suite: 'E-Commerce Store & Order Hub',
      durationMs: 3.9,
      status: 'passed'
    },
    {
      name: 'should create an order with calculated total and tracking ID',
      file: 'tests/store.test.ts',
      suite: 'E-Commerce Store & Order Hub',
      durationMs: 2.7,
      status: 'passed'
    },
    {
      name: 'should add customer reviews and maintain list integrity',
      file: 'tests/store.test.ts',
      suite: 'E-Commerce Store & Order Hub',
      durationMs: 1.9,
      status: 'passed'
    }
  ]);

  const handleRerun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setLastRunTime(new Date().toLocaleTimeString());
    }, 600);
  };

  const totalPassed = tests.filter(t => t.status === 'passed').length;

  return (
    <div className="space-y-6">
      {/* CI Overview Banner */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All 9 Tests Passing (100%)
              </span>
              <span className="text-xs text-zinc-500 font-mono">Runner: Vitest v5.0</span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">AutoShip Continuous Integration Gate</h1>
            <p className="text-zinc-600 text-sm mt-1 max-w-2xl">
              Aikido AutoShip requires passing CI before any automated PR is merged into production. These Vitest suites validate both core application functions and security boundaries.
            </p>
          </div>

          <button
            id="btn-run-ci-tests"
            onClick={handleRerun}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition disabled:opacity-50 shadow-xs self-start md:self-auto"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>Re-Run Vitest Suite</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <span className="text-xs text-zinc-500 font-mono">Test Status</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1 flex items-center gap-2">
            <span>{totalPassed}/{tests.length} Passed</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Green gate for AutoShip auto-merge</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <span className="text-xs text-zinc-500 font-mono">Execution Speed</span>
          <div className="text-2xl font-bold text-zinc-900 mt-1 flex items-center gap-2 font-mono">
            <span>22.8 ms</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Ultra-low latency CI pipeline</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <span className="text-xs text-zinc-500 font-mono">AutoShip Policy Readiness</span>
          <div className="text-2xl font-bold text-blue-600 mt-1 flex items-center gap-2">
            <span>Approved</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Satisfies branch protection rule</span>
        </div>
      </div>

      {/* Test List Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
            <Terminal className="w-4 h-4 text-zinc-500" />
            <span>Vitest Test Executions</span>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Last run: {lastRunTime}</span>
        </div>

        <div className="divide-y divide-zinc-100 font-mono text-xs">
          {tests.map((test, index) => (
            <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-50/70 transition">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-zinc-900 font-sans text-xs">{test.name}</div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span>{test.file}</span>
                    <span>•</span>
                    <span>{test.suite}</span>
                    {test.cweTested && (
                      <>
                        <span>•</span>
                        <span className="text-zinc-600 bg-zinc-100 px-1.5 py-0.2 rounded">{test.cweTested}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <span className="text-zinc-400 text-[11px]">{test.durationMs}ms</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  PASS
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AutoShip Command Line Reference */}
      <div className="bg-zinc-950 text-zinc-300 rounded-2xl p-6 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">CI Command Reference (GitHub Actions / GitLab CI)</span>
          <span className="text-[10px] font-mono text-emerald-400">Exit Code: 0</span>
        </div>
        <pre className="text-xs font-mono bg-zinc-900 p-3.5 rounded-xl overflow-x-auto text-emerald-300">
          <code>$ npm test
✓ tests/security.test.ts (6 tests) 10ms
✓ tests/store.test.ts (3 tests) 8ms
Test Files  2 passed (2)
Tests  9 passed (9)
Duration  624ms</code>
        </pre>
        <p className="text-xs text-zinc-400">
          When connected to your repository, Aikido AutoFix generates pull requests, GitHub Actions executes this command, and upon receiving code 0, Aikido AutoShip automatically merges the patch into your target branch.
        </p>
      </div>
    </div>
  );
};
