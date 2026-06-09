import React from "react";
import { CreditCard, Users, BarChart3, MessageSquare, Mail, Server, Zap } from "lucide-react";

const INTEGRATIONS = [
  { category: "Payments", platforms: "Stripe, PayPal, Braintree", dataFlow: "MRR, Churn, LTV, Transactions", icon: CreditCard },
  { category: "CRM", platforms: "HubSpot, Salesforce, Pipedrive", dataFlow: "Leads, Deals, Customer Health", icon: Users },
  { category: "Analytics", platforms: "Mixpanel, Amplitude, GA4", dataFlow: "Events, Funnels, Cohorts", icon: BarChart3 },
  { category: "Communication", platforms: "Slack, Teams, Discord", dataFlow: "Alerts, Reports, Commands", icon: MessageSquare },
  { category: "Marketing", platforms: "Mailchimp, Klaviyo, Sendgrid", dataFlow: "Campaigns, Opens, Conversions", icon: Mail },
  { category: "Infrastructure", platforms: "AWS, GCP, Vercel, Datadog", dataFlow: "Metrics, Logs, Incidents", icon: Server },
  { category: "Automation", platforms: "n8n, Zapier, Make", dataFlow: "Workflows, Triggers, Actions", icon: Zap }
];

export default function AGXIntegrations() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-purple-600/20 to-orange-500/20">
            <th className="text-left p-3 text-purple-300 font-semibold">Category</th>
            <th className="text-left p-3 text-purple-300 font-semibold">Platforms</th>
            <th className="text-left p-3 text-purple-300 font-semibold">Data Flow</th>
          </tr>
        </thead>
        <tbody>
          {INTEGRATIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <tr key={idx} className="border-b border-gray-800">
                <td className="p-3 text-white flex items-center gap-2">
                  <Icon className="w-4 h-4 text-purple-400" />
                  {item.category}
                </td>
                <td className="p-3 text-gray-300">{item.platforms}</td>
                <td className="p-3 text-gray-400">{item.dataFlow}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}