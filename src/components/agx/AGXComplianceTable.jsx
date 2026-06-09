import React from "react";
import { CheckCircle2, Clock, Calendar } from "lucide-react";

const CERTIFICATIONS = [
  { name: "SOC 2 Type II", status: "certified", scope: "Security, Availability, Confidentiality", date: "Oct 2024" },
  { name: "GDPR", status: "certified", scope: "EU Data Protection", date: "Ongoing" },
  { name: "ISO 27001", status: "progress", scope: "Information Security Management", date: "Q1 2025" },
  { name: "HIPAA", status: "roadmap", scope: "Healthcare Data Protection", date: "Q3 2025" },
  { name: "FedRAMP", status: "roadmap", scope: "US Government Cloud", date: "Q4 2025" }
];

export default function AGXComplianceTable() {
  const getStatusBadge = (status) => {
    switch (status) {
      case "certified":
        return <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle2 className="w-3 h-3" /> Certified</span>;
      case "progress":
        return <span className="flex items-center gap-1 text-yellow-400 text-xs"><Clock className="w-3 h-3" /> In Progress</span>;
      default:
        return <span className="flex items-center gap-1 text-gray-500 text-xs"><Calendar className="w-3 h-3" /> Roadmap</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-purple-600/20 to-orange-500/20">
            <th className="text-left p-3 text-purple-300 font-semibold">Certification</th>
            <th className="text-left p-3 text-purple-300 font-semibold">Status</th>
            <th className="text-left p-3 text-purple-300 font-semibold">Scope</th>
            <th className="text-left p-3 text-purple-300 font-semibold">Audit Date</th>
          </tr>
        </thead>
        <tbody>
          {CERTIFICATIONS.map((cert, idx) => (
            <tr key={idx} className="border-b border-gray-800">
              <td className="p-3 text-white">{cert.name}</td>
              <td className="p-3">{getStatusBadge(cert.status)}</td>
              <td className="p-3 text-gray-400">{cert.scope}</td>
              <td className="p-3 text-gray-400">{cert.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}