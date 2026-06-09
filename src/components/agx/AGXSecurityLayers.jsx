import React from "react";
import { Shield, Lock, Globe, Key, UserCheck, Database, FileText } from "lucide-react";

const SECURITY_LAYERS = [
  { layer: "Network", protection: "DDoS Protection, WAF", implementation: "Cloudflare Enterprise, Rate Limiting", icon: Globe },
  { layer: "Transport", protection: "TLS 1.3, Certificate Pinning", implementation: "End-to-end encryption, HSTS", icon: Lock },
  { layer: "Application", protection: "OWASP Top 10 Mitigation", implementation: "Input validation, CSP, CSRF tokens", icon: Shield },
  { layer: "Authentication", protection: "Multi-Factor, Biometric", implementation: "Passphrase + Voice + Device Trust", icon: Key },
  { layer: "Authorization", protection: "RBAC + ABAC", implementation: "Tier-based access, hasAgentAccess()", icon: UserCheck },
  { layer: "Data", protection: "AES-256, Field-Level Encryption", implementation: "Encryption at rest and in transit", icon: Database },
  { layer: "Audit", protection: "Immutable Logging", implementation: "30+ event types, 7-year retention", icon: FileText }
];

export default function AGXSecurityLayers() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-purple-600/20 to-orange-500/20">
            <th className="text-left p-3 text-purple-300 font-semibold">Layer</th>
            <th className="text-left p-3 text-purple-300 font-semibold">Protection</th>
            <th className="text-left p-3 text-purple-300 font-semibold">Implementation</th>
          </tr>
        </thead>
        <tbody>
          {SECURITY_LAYERS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <tr key={idx} className="border-b border-gray-800">
                <td className="p-3 text-white flex items-center gap-2">
                  <Icon className="w-4 h-4 text-purple-400" />
                  {item.layer}
                </td>
                <td className="p-3 text-gray-300">{item.protection}</td>
                <td className="p-3 text-gray-400">{item.implementation}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}