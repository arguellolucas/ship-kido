import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  RefreshCw,
  GitPullRequest,
  Check,
  Code2,
  Bug,
  Sliders,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { VulnerabilityTestCase, AutoShipPolicy } from '../types';
import { VULNERABILITY_CASES, SAMPLE_AUTOSHIP_POLICIES } from '../data/vulnerabilitiesData';

export const SecurityPlayground: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(VULNERABILITY_CASES[0].id);
  const [activeSubTab, setActiveSubTab] = useState<'sast-autofix' | 'autoship-policy'>('sast-autofix');
  const [testMode, setTestMode] = useState<'vulnerable' | 'safe'>('vulnerable');
  const [testInput, setTestInput] = useState<string>(VULNERABILITY_CASES[0].defaultTestValue);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);

  // AutoShip Policy Simulator state
  const [policies, setPolicies] = useState<AutoShipPolicy[]>(SAMPLE_AUTOSHIP_POLICIES);
  const [simulatedMergeSuccess, setSimulatedMergeSuccess] = useState<boolean>(false);

  const currentCase = VULNERABILITY_CASES.find(c => c.id === selectedCaseId) || VULNERABILITY_CASES[0];

  const handleSelectCase = (caseItem: VulnerabilityTestCase) => {
    setSelectedCaseId(caseItem.id);
    setTestInput(caseItem.defaultTestValue);
    setTestResult(null);
  };

  const handleRunTest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      if (currentCase.id === 'case-path-traversal') {
        const res = await fetch(`/api/security/test/path-traversal?file=${encodeURIComponent(testInput)}&mode=${testMode}`);
        const data = await res.json();
        setTestResult(data);
      } else if (currentCase.id === 'case-redos') {
        const res = await fetch('/api/security/test/redos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: testInput, mode: testMode })
        });
        const data = await res.json();
        setTestResult(data);
      } else if (currentCase.id === 'case-crypto-rng') {
        const res = await fetch(`/api/security/test/crypto-rng?mode=${testMode}`);
        const data = await res.json();
        setTestResult(data);
      } else if (currentCase.id === 'case-open-redirect') {
        const res = await fetch(`/api/security/test/open-redirect?target=${encodeURIComponent(testInput)}&mode=${testMode}`);
        const data = await res.json();
        setTestResult(data);
      } else if (currentCase.id === 'case-insecure-cookies') {
        const res = await fetch(`/api/security/test/cookie-check?mode=${testMode}`);
        const data = await res.json();
        setTestResult(data);
      } else if (currentCase.id === 'case-hardcoded-secret') {
        const res = await fetch('/api/security/test/secret-check');
        const data = await res.json();
        setTestResult(data);
      }
    } catch (err: any) {
      setTestResult({ error: err.message || 'Request failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const severityColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation & Header banner */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Interactive Test Bench
              </span>
              <span className="text-xs text-zinc-500 font-mono">v1.0.0 • AIKIDO COMPLIANT</span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mt-1">Aikido AutoFix & AutoShip Testing Suite</h1>
            <p className="text-zinc-600 text-sm mt-1 max-w-2xl">
              Execute live vulnerability tests against real server handlers. Compare vulnerable patterns with Aikido AutoFix remediations and simulate AutoShip auto-merge criteria.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl border border-zinc-200 self-start md:self-auto">
            <button
              id="subtab-autofix"
              onClick={() => setActiveSubTab('sast-autofix')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeSubTab === 'sast-autofix'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Bug className="w-4 h-4 text-orange-500" />
              <span>AutoFix (SAST & Secrets)</span>
            </button>
            <button
              id="subtab-autoship"
              onClick={() => setActiveSubTab('autoship-policy')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeSubTab === 'autoship-policy'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <GitPullRequest className="w-4 h-4 text-emerald-600" />
              <span>AutoShip (CI & Policies)</span>
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'sast-autofix' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Vulnerability Cases Selection */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">
              Select Vulnerability Case ({VULNERABILITY_CASES.length})
            </h2>
            <div className="space-y-2">
              {VULNERABILITY_CASES.map((item) => {
                const isSelected = item.id === currentCase.id;
                return (
                  <button
                    key={item.id}
                    id={`case-select-${item.id}`}
                    onClick={() => handleSelectCase(item)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                        : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isSelected ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : severityColor(item.severity)
                      }`}>
                        {item.severity}
                      </span>
                      <span className={`text-xs font-mono ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {item.scannerType}
                      </span>
                    </div>
                    <div className="font-semibold text-sm leading-snug">{item.title}</div>
                    <div className={`text-xs mt-1 truncate ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {item.cwe.split(':')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Case Inspector & Live Test Console */}
          <div className="lg:col-span-8 space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${severityColor(currentCase.severity)}`}>
                      {currentCase.severity} SEVERITY
                    </span>
                    <span className="text-xs font-mono text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                      {currentCase.cwe}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">{currentCase.title}</h3>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider mb-1 text-zinc-500">
                    Scanner Detection & Mechanism
                  </h4>
                  <p className="text-zinc-700 leading-relaxed">{currentCase.description}</p>
                </div>
                <div className="bg-red-50/60 border border-red-100 rounded-xl p-3 text-xs text-red-900">
                  <span className="font-semibold text-red-800">Security Impact: </span>
                  {currentCase.impact}
                </div>
              </div>
            </div>

            {/* Code Diff: Vulnerable vs Aikido AutoFix */}
            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
              <div className="border-b border-zinc-200 px-6 py-3.5 bg-zinc-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-zinc-600" />
                  <span className="text-sm font-bold text-zinc-800">Aikido AutoFix Recipe Comparison</span>
                </div>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AutoFix Ready
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
                {/* Vulnerable Code */}
                <div className="p-5 space-y-2 bg-red-50/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> ❌ Vulnerable (Flagged by Aikido)
                    </span>
                  </div>
                  <pre className="text-xs font-mono bg-zinc-950 text-red-300 p-3.5 rounded-xl overflow-x-auto leading-relaxed border border-zinc-800">
                    <code>{currentCase.vulnerableSnippet}</code>
                  </pre>
                </div>

                {/* AutoFix Code */}
                <div className="p-5 space-y-2 bg-emerald-50/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ✅ AutoFix (Automated PR Patch)
                    </span>
                  </div>
                  <pre className="text-xs font-mono bg-zinc-950 text-emerald-300 p-3.5 rounded-xl overflow-x-auto leading-relaxed border border-zinc-800">
                    <code>{currentCase.autoFixSnippet}</code>
                  </pre>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-600 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Remediation Logic: </strong>{currentCase.autoFixExplanation}</span>
              </div>
            </div>

            {/* Live Interactive Test Console */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-zinc-700" />
                  <h3 className="font-bold text-zinc-900 text-base">Live Interactive Test Console</h3>
                </div>
                {currentCase.endpoint && (
                  <span className="text-xs font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                    {currentCase.method || 'GET'} {currentCase.endpoint}
                  </span>
                )}
              </div>

              {/* Controls: Mode Switcher & Preset Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Test Mode Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Execution Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="btn-mode-vulnerable"
                      onClick={() => setTestMode('vulnerable')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition ${
                        testMode === 'vulnerable'
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      ❌ Vulnerable Handler
                    </button>
                    <button
                      id="btn-mode-safe"
                      onClick={() => setTestMode('safe')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition ${
                        testMode === 'safe'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      ✅ AutoFix Safe Handler
                    </button>
                  </div>
                </div>

                {/* Test Payload Quick Selector */}
                {currentCase.testCases.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Preset Payloads</label>
                    <div className="flex flex-wrap gap-1.5">
                      {currentCase.testCases.map((tc, idx) => (
                        <button
                          key={idx}
                          id={`preset-payload-${idx}`}
                          onClick={() => setTestInput(tc.value)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition ${
                            testInput === tc.value
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : tc.isMalicious
                              ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                              : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                          }`}
                        >
                          {tc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Input Payload Value</label>
                <div className="flex gap-2">
                  <input
                    id="input-test-payload"
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-300 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                    placeholder="Enter test payload..."
                  />
                  <button
                    id="btn-run-security-test"
                    onClick={handleRunTest}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 disabled:opacity-50 transition shadow-xs"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>Execute Test</span>
                  </button>
                </div>
              </div>

              {/* Output Result Console */}
              {testResult && (
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
                    <span>Response Output & Security Verdict</span>
                    <span className="font-mono text-[11px]">HTTP Status: {testResult.error ? '400 / Blocked' : '200 OK'}</span>
                  </div>

                  <div className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
                    testResult.securityNotice && testResult.securityNotice.includes('VULNERABILITY')
                      ? 'bg-red-950 text-red-200 border-red-800'
                      : 'bg-zinc-950 text-emerald-300 border-zinc-800'
                  }`}>
                    {testResult.securityNotice && (
                      <div className="font-bold border-b border-zinc-800 pb-1.5 mb-1.5 flex items-center gap-1.5">
                        <span className="text-zinc-400">Notice:</span> {testResult.securityNotice}
                      </div>
                    )}
                    <pre className="overflow-x-auto text-[11px] leading-relaxed max-h-56">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* AutoShip Policy & CI Merging Workbench */
        <div className="space-y-6">
          {/* AutoShip Architecture Flow */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-zinc-900 mb-2">How Aikido AutoShip Works</h3>
            <p className="text-sm text-zinc-600 mb-6">
              Aikido AutoShip automates the lifecycle from vulnerability detection to production release, safely auto-merging PRs that satisfy your risk policies and pass CI.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/70 space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Step 1</span>
                <div className="font-bold text-sm text-zinc-900">Scan & Detect</div>
                <p className="text-xs text-zinc-600">Aikido continuously scans commits & PRs for SCA CVEs, SAST bugs, & secrets.</p>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Step 2</span>
                <div className="font-bold text-sm text-blue-900">AutoFix PR</div>
                <p className="text-xs text-blue-700">Generates code patches or safe non-breaking SemVer dependency bumps.</p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Step 3</span>
                <div className="font-bold text-sm text-emerald-900">CI Vitest Run</div>
                <p className="text-xs text-emerald-700">GitHub Actions runs Vitest suite. Every unit & integration test must pass.</p>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Step 4</span>
                <div className="font-bold text-sm text-amber-900">Policy Evaluation</div>
                <p className="text-xs text-amber-700">Checks branch rules, max severity threshold, and AI confidence score.</p>
              </div>

              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-1">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Step 5</span>
                <div className="font-bold text-sm text-purple-900">AutoShip Merge!</div>
                <p className="text-xs text-purple-700">Automatically merges branch into main with zero manual developer overhead.</p>
              </div>
            </div>
          </div>

          {/* Active AutoShip Policies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies.map((policy) => (
              <div key={policy.id} className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      ● Active Policy
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">Target: {policy.criteria.autoMergeBranch}</span>
                  </div>

                  <h4 className="font-bold text-base text-zinc-900 mb-1">{policy.name}</h4>
                  <p className="text-xs text-zinc-600 mb-4">{policy.description}</p>

                  <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/80 space-y-2 text-xs mb-4">
                    <div className="font-semibold text-zinc-700">Gate Criteria:</div>
                    <div className="flex items-center justify-between text-zinc-600">
                      <span>Require 100% Green CI (Vitest):</span>
                      <span className="font-semibold text-emerald-600">Yes (Enforced)</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-600">
                      <span>Maximum CVE Severity Allowed:</span>
                      <span className="font-semibold text-zinc-900">{policy.criteria.maxSeverity}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-600">
                      <span>SemVer Upgrade Type:</span>
                      <span className="font-semibold text-zinc-900">{policy.criteria.semverType}</span>
                    </div>
                  </div>

                  {/* Sample PR simulation */}
                  <div className="border border-zinc-200 rounded-xl p-3 bg-white text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-800">PR #{policy.samplePR.prNumber}</span>
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {policy.samplePR.status}
                      </span>
                    </div>
                    <p className="text-zinc-700 text-xs font-medium">{policy.samplePR.title}</p>
                    <pre className="text-[11px] font-mono bg-zinc-900 text-zinc-300 p-2.5 rounded-lg overflow-x-auto">
                      {policy.samplePR.diffSnippet}
                    </pre>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                  <span>Confidence Score: {policy.samplePR.confidenceScore}%</span>
                  <span className="text-emerald-600 font-medium">CI: Passing (9/9)</span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive AutoShip Simulator Action */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Run Aikido AutoShip Validation Test
              </h4>
              <p className="text-zinc-300 text-xs mt-1 max-w-xl">
                Verifies that this repository has configured package locks, runnable unit tests, and security fixtures ready for AutoShip automated PR merges.
              </p>
            </div>

            <button
              id="btn-simulate-autoship"
              onClick={() => setSimulatedMergeSuccess(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-xs hover:bg-emerald-400 transition shadow-xs whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulate AutoShip Pipeline</span>
            </button>
          </div>

          {simulatedMergeSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start justify-between gap-3 animate-fade-in">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">AutoShip Check Succeeded!</span>
                  <p className="mt-0.5 text-emerald-800">
                    Repository meets all criteria: 9 unit tests passed with Vitest, clean TypeScript compile, non-breaking dependency bump diff verified. Auto-merged PR #42 into main!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSimulatedMergeSuccess(false)}
                className="text-emerald-700 hover:text-emerald-900 font-bold"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
