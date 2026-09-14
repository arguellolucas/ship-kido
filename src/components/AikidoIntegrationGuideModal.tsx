import React from 'react';
import { X, CheckCircle2, GitPullRequest, ExternalLink, ShieldCheck, Terminal, ArrowRight } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AikidoIntegrationGuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">How to Test Aikido AutoShip & AutoFix</h2>
              <p className="text-xs text-zinc-500">Step-by-step walkthrough for your repository</p>
            </div>
          </div>

          <button
            id="btn-close-guide-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-zinc-700 leading-relaxed">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-bold text-sm text-zinc-900">Export or Push This Repository to GitHub/GitLab</h3>
              <p className="text-zinc-600">
                In AI Studio's top settings menu, select <strong>Export to GitHub</strong> (or download as ZIP and push to your git remote). Ensure <code>package-lock.json</code> is committed for CI caching and Aikido SCA scans.
              </p>
              <div className="bg-zinc-950 text-emerald-300 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto">
                <code>git init && git add . && git commit -m "feat: initial test lab"</code>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-bold text-sm text-zinc-900">Connect Repository in Aikido Security</h3>
              <p className="text-zinc-600">
                Log into <a href="https://aikido.dev" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium inline-flex items-center gap-1">aikido.dev <ExternalLink className="w-3 h-3" /></a>, click <strong>Add Repository</strong>, and select your repository. Aikido will immediately perform an initial scan covering:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 pl-1">
                <li><strong>SAST (Static Code Analysis)</strong>: Flags Path Traversal in <code>server/vulnerabilities.ts</code>, ReDoS regex, and insecure RNG.</li>
                <li><strong>Secret Scanning</strong>: Detects the dummy test secret in <code>server/vulnerabilities.ts</code>.</li>
                <li><strong>SCA (Dependencies)</strong>: Evaluates <code>package.json</code> dependencies.</li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-bold text-sm text-zinc-900">Trigger & Verify Aikido AutoFix</h3>
              <p className="text-zinc-600">
                In the Aikido dashboard:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-zinc-600 pl-1">
                <li>Navigate to the <strong>Issues</strong> tab.</li>
                <li>Click on the <strong>Path Traversal (CWE-22)</strong> finding.</li>
                <li>Click the <strong>Generate AutoFix</strong> button. Aikido will propose the exact <code>path.basename()</code> boundary check and generate a Pull Request to your branch!</li>
              </ol>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              4
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-bold text-sm text-zinc-900">Configure & Watch Aikido AutoShip</h3>
              <p className="text-zinc-600">
                In Aikido under <strong>Settings → AutoShip</strong>:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-zinc-600 pl-1">
                <li>Enable <strong>AutoShip</strong> for your target repository.</li>
                <li>Set the rule to <strong>Auto-merge if CI passes</strong>.</li>
                <li>Because this app includes a fully passing Vitest suite (<code>npm test</code>), your CI check on the AutoFix PR will turn green.</li>
                <li>Aikido AutoShip will automatically merge the PR into <code>main</code> without requiring manual code review!</li>
              </ol>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified Clean Baseline
            </div>
            <p className="text-emerald-800">
              This app builds clean, has zero syntax errors, and runs 9 passing unit tests. It is ready for Aikido's automated remediation lifecycle out of the box.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition"
          >
            Got it, Let's Test!
          </button>
        </div>
      </div>
    </div>
  );
};
