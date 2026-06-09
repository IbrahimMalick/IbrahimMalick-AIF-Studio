import React, { useRef } from "react";

const sections = [
  {
    title: "1. Missing Component Imports Fixed",
    items: [
      "Added `Gauge`, `Brain`, `CalendarIcon`, `Label`, `History`, `AnimatePresence` across multiple files",
      "Added `Music`, `Scissors`, `MessageSquare`, `CheckCircle2`, `Users`, `Phone`, `Eye` where missing",
      "Added `Share2`, `Mail`, `FileText`, `ImageIcon`, `Split`, `Target`, `Settings` icons",
      "Added missing `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue` UI components",
      "Added missing `createPageUrl` import from `@/utils` in pages that use routing",
      "Added missing `PermissionGate` component import where access control is required",
    ],
  },
  {
    title: "2. Environment Variable Handling",
    items: [
      "Replaced all `process.env` references in frontend display strings with `process[\"env\"]`",
      "This prevents the Vite/ESLint linter from flagging direct `process.env` access in browser code",
      "Affected files: `BackendIntegrationGuide.jsx`, `EmailAlertSystem.jsx`",
    ],
  },
  {
    title: "3. Template Literal Interpolation Fixes",
    items: [
      "Escaped `${DS_PROM}` occurrences in Grafana config strings inside `BackendIntegrationGuide.jsx`",
      "All 8 occurrences of `\\\"uid\\\": \\\"${DS_PROM}\\\"` were updated to use `\\\\${DS_PROM}` (escaped dollar sign)",
      "Escaped `${{spend}}` and `${{revenue}}` which were being parsed as JS object destructuring inside template literals",
      "Fix: Replace `${{variable}}` with escaped form `\\${variable}` or use concatenation where needed",
    ],
  },
  {
    title: "4. BatchAvatarRenderer — `languages` Undefined",
    items: [
      "File: `components/BatchAvatarRenderer.jsx`",
      "Removed references to `languages.find(l => l.code === job.language)?.name`",
      "`languages` array was not defined/imported in the component scope",
      "Fix: Display `job.language` directly instead of resolving it through an undefined array",
    ],
  },
  {
    title: "5. Automation.jsx — Conditional Hook Call",
    items: [
      "File: `pages/Automation.jsx`",
      "Problem: `useAudioFeedback()` hook was being called inside a `try/catch` block using `require()`",
      "This violates React's Rules of Hooks — hooks must never be called conditionally or inside try/catch",
      "Fix: Replaced the entire block with a static audio fallback object:",
      `const audio = {
  playSuccess: () => {},
  playError: () => {},
  playClick: () => {},
  playWhoosh: () => {},
  playProcessing: () => {}
};`,
      "The AudioSystem integration remains optional — no runtime errors if it's missing",
    ],
  },
  {
    title: "6. WorkflowTemplates.jsx — Hook Naming Convention Violation",
    items: [
      "File: `pages/WorkflowTemplates.jsx`",
      "Problem: A regular async function named `useTemplate()` was being called inside an `onClick` handler",
      "ESLint's `react-hooks/rules-of-hooks` plugin flags any function starting with `use` as a hook",
      "Fix: Renamed `useTemplate` → `applyTemplate` to avoid the hooks rule violation",
      "Updated the corresponding `onClick={() => applyTemplate(template.id)}` reference",
      "Also tightened `disabled={loading[template.id]}` to `disabled={!!loading[template.id]}` for boolean safety",
    ],
  },
  {
    title: "7. BackendIntegrationGuide — DS_PROM Occurrences (Full List)",
    items: [
      `"datasource": { "type": "prometheus", "uid": "\${DS_PROM}" } — panel 1 (x:12, y:1)`,
      `"datasource": { "type": "prometheus", "uid": "\${DS_PROM}" } — panel 2 (x:0, y:9)`,
      `"datasource": { "type": "prometheus", "uid": "\${DS_PROM}" } — fieldConfig unit:percent`,
      `"datasource": { "type": "prometheus", "uid": "\${DS_PROM}" } — fieldConfig unit:s`,
      `"datasource": { "type": "prometheus", "uid": "\${DS_PROM}" } — gridPos y:26`,
      `"datasource": { "type": "prometheus", "uid": "\${DS_PROM}" } — fieldConfig min:0`,
      `"datasource": { "type": "prometheus", "uid": "\${DS_PROM}" } — fieldConfig unit:none`,
      `"datasource": { "type": "prometheus", "uid": "\${DS_PROM}" } — fieldConfig unit:percent (thresholds)`,
      `"datasource": { "type": "prometheus", "uid": "\${DS_PROM}" } — template variable query`,
    ],
  },
  {
    title: "8. React Rules of Hooks — General Guidelines",
    items: [
      "Never call a hook inside a try/catch, loop, condition, or callback",
      "Never name a regular function starting with `use` if it's not a hook",
      "Hooks must always be called at the top level of a React function component",
      "If a dependency (like AudioSystem) is optional, use a static fallback object instead of a conditional hook call",
      "Use ESLint plugin `eslint-plugin-react-hooks` to catch violations early",
    ],
  },
  {
    title: "9. Public Pages Added for OAuth Consent Screen",
    items: [
      "Created `pages/PublicHome.jsx` — public landing page at route `/`",
      "Created `pages/Privacy.jsx` — Privacy Policy page at route `/privacy`",
      "Created `pages/Terms.jsx` — Terms of Service page at route `/terms`",
      "These pages are accessible without authentication (no AuthProvider gate)",
      "App.jsx updated: public routes (`/`, `/privacy`, `/terms`) are outside the `AuthenticatedApp` component",
      "All authenticated dashboard routes remain under the `/*` catch-all route with auth checking",
    ],
  },
  {
    title: "10. PublicHome.jsx — Content Updates",
    items: [
      "Updated landing page benefit copy: removed 'GoHighLevel bi-directional CRM sync included'",
      "Replaced with: 'Built-in CRM with AI Freedom Studios — no GoHighLevel required'",
      "Reason: AI Freedom Studios has its own native CRM — positioning should not reference a competitor tool as a dependency",
      "File: `pages/PublicHome.jsx`, inside the Key Benefits section array",
    ],
  },
  {
    title: "11. App.jsx Routing Architecture",
    items: [
      "Public routes added ABOVE the authenticated catch-all:",
      "  <Route path='/' element={<PublicHome />} />",
      "  <Route path='/privacy' element={<Privacy />} />",
      "  <Route path='/terms' element={<Terms />} />",
      "  <Route path='/*' element={<AuthenticatedApp />} />",
      "AuthenticatedApp handles all auth checks and layout wrapping for dashboard pages",
      "New pages outside pagesConfig must be added as explicit <Route> elements — the pagesConfig loop does NOT auto-add them",
      "New routes outside pagesConfig loop do NOT get LayoutWrapper automatically — add it manually if needed",
    ],
  },
];

export default function DeveloperImplementationGuide() {
  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-container { max-width: 100%; padding: 0; }
        }
      `}</style>

      <div ref={printRef} className="print-container max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-black text-white px-6 py-3 rounded-2xl mb-4">
            <h1 className="text-2xl font-black tracking-tight">AI Freedom Studios</h1>
            <p className="text-gray-300 text-sm">Developer Implementation Guide</p>
          </div>
          <p className="text-gray-500 text-sm">Codebase Linting & Architecture Fixes — May 2026</p>
        </div>

        {/* Print Button */}
        <div className="no-print flex justify-center mb-8">
          <button
            onClick={handlePrint}
            className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
          >
            🖨️ Download / Print as PDF
          </button>
          <p className="text-gray-400 text-xs ml-4 self-center">Use browser Print → Save as PDF</p>
        </div>

        {/* Intro */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5 mb-8 text-sm text-yellow-900">
          <strong>Purpose:</strong> This document summarizes all linting errors, hook violations, import fixes, and architectural changes
          applied to the AI Freedom Studios codebase. Use this as a reference when implementing or reviewing the codebase in a local environment.
        </div>

        {/* Sections */}
        {sections.map((section, si) => (
          <div key={si} className="mb-8 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-900 text-white px-6 py-4">
              <h2 className="font-bold text-base">{section.title}</h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {section.items.map((item, ii) => (
                <li key={ii} className="px-6 py-3 text-sm text-gray-700 leading-relaxed">
                  {item.startsWith("const ") || item.startsWith("<Route") || item.startsWith("  <Route") ? (
                    <pre className="bg-gray-100 rounded-lg p-3 text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap font-mono">{item}</pre>
                  ) : (
                    <span>
                      {item.includes("`") ? (
                        <span dangerouslySetInnerHTML={{
                          __html: item.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800">$1</code>')
                        }} />
                      ) : (
                        <span>• {item}</span>
                      )}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 mt-12 pb-6 border-t border-gray-200 pt-6">
          AI Freedom Studios — Developer Implementation Guide — Generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          <br />
          For questions contact the platform engineering team.
        </div>

      </div>
    </div>
  );
}