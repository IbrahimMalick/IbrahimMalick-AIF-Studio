import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";

export default function AnalyticsDashboard({ metrics = {} }) {
  const stats = {
    revenue: metrics.revenue || 0,
    revenueChange: metrics.revenueChange || 0,
    users: metrics.users || 0,
    usersChange: metrics.usersChange || 0,
    engagement: metrics.engagement || 0,
    engagementChange: metrics.engagementChange || 0,
    conversions: metrics.conversions || 0,
    conversionsChange: metrics.conversionsChange || 0
  };

  const cards = [
    {
      title: "Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      change: stats.revenueChange,
      icon: TrendingUp,
      color: "text-green-400"
    },
    {
      title: "Active Users",
      value: stats.users.toLocaleString(),
      change: stats.usersChange,
      icon: Activity,
      color: "text-blue-400"
    },
    {
      title: "Engagement Rate",
      value: `${stats.engagement}%`,
      change: stats.engagementChange,
      icon: BarChart3,
      color: "text-purple-400"
    },
    {
      title: "Conversions",
      value: stats.conversions.toLocaleString(),
      change: stats.conversionsChange,
      icon: TrendingUp,
      color: "text-orange-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isPositive = card.change >= 0;
        
        return (
          <Card key={idx} className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {card.title}
              </CardTitle>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-2">
                {card.value}
              </div>
              <div className={`flex items-center text-sm ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                <span>{Math.abs(card.change)}%</span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}