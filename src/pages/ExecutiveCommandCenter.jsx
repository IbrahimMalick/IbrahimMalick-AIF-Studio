import React, { useState, useEffect } from 'react';
import { 
  Activity, Film, Globe, Zap, TrendingUp, Users, 
  Play, Settings, Award, BarChart3, Sparkles, 
  Video, DollarSign, Target, Layers, Cpu, 
  Clock, AlertTriangle, CheckCircle2, Gauge
} from 'lucide-react';

export default function ExecutiveCommandCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [liveMetrics, setLiveMetrics] = useState({
    activesCampaigns: 24,
    adsGenerated: 1847,
    globalReach: '2.4M',
    revenue: '$847,293',
    performance: 94
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        ...prev,
        adsGenerated: prev.adsGenerated + Math.floor(Math.random() * 3),
        globalReach: `${(parseFloat(prev.globalReach) + Math.random() * 0.01).toFixed(1)}M`,
        performance: Math.min(100, prev.performance + (Math.random() - 0.3))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const campaigns = [
    { id: 1, name: 'Nike Global Summer', status: 'active', performance: 92, budget: '$500K', reach: '1.2M' },
    { id: 2, name: 'Tesla Cybertruck Launch', status: 'rendering', performance: 88, budget: '$750K', reach: '890K' },
    { id: 3, name: 'Apple Vision Pro', status: 'active', performance: 96, budget: '$1.2M', reach: '2.1M' },
    { id: 4, name: 'Coca-Cola Holiday', status: 'scheduled', performance: 0, budget: '$300K', reach: '0' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20 animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/40 backdrop-blur-xl border-b border-purple-500/20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Film className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    AI FREEDOM STUDIOS
                  </h1>
                  <p className="text-xs text-purple-300 tracking-[0.3em] uppercase">
                    Global Cinematic AI Ad Engine™
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">System Operational</span>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="px-6 flex space-x-1">
          {['overview', 'campaigns', 'generator', 'analytics', 'global'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'generator' && <Sparkles className="w-4 h-4 inline mr-1" />}
              {tab === 'global' && <Globe className="w-4 h-4 inline mr-1" />}
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        {/* Live Metrics Bar */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Active Campaigns', value: liveMetrics.activesCampaigns, icon: Play, color: 'purple' },
            { label: 'Ads Generated', value: liveMetrics.adsGenerated, icon: Video, color: 'pink' },
            { label: 'Global Reach', value: liveMetrics.globalReach, icon: Globe, color: 'blue' },
            { label: 'Revenue Today', value: liveMetrics.revenue, icon: DollarSign, color: 'green' },
            { label: 'Performance', value: `${liveMetrics.performance.toFixed(0)}%`, icon: Gauge, color: 'yellow' }
          ].map((metric, idx) => (
            <div key={idx} className="bg-black/40 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{metric.label}</span>
                <metric.icon className={`w-4 h-4 text-${metric.color}-400`} />
              </div>
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-400 transition-all duration-1000`}
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* AI Engine Status */}
          <div className="col-span-2 bg-black/40 backdrop-blur rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                Cinematic AI Engine Status
              </h2>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                v4.2.1 QUANTUM
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-4">
                <div className="text-gray-300 text-sm mb-1">GPU Clusters</div>
                <div className="text-2xl font-bold text-white">12/16</div>
                <div className="text-green-400 text-xs mt-1">75% Utilized</div>
              </div>
              <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-lg p-4">
                <div className="text-gray-300 text-sm mb-1">Render Queue</div>
                <div className="text-2xl font-bold text-white">247</div>
                <div className="text-yellow-400 text-xs mt-1">~3 min avg</div>
              </div>
              <div className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 rounded-lg p-4">
                <div className="text-gray-300 text-sm mb-1">AI Models</div>
                <div className="text-2xl font-bold text-white">8</div>
                <div className="text-green-400 text-xs mt-1">All Operational</div>
              </div>
            </div>

            {/* Active Campaigns */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Campaigns</h3>
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      campaign.status === 'active' ? 'bg-green-500 animate-pulse' : 
                      campaign.status === 'rendering' ? 'bg-yellow-500 animate-spin' : 
                      'bg-gray-500'
                    }`}></div>
                    <div>
                      <div className="font-medium text-white">{campaign.name}</div>
                      <div className="text-xs text-gray-400">Budget: {campaign.budget} | Reach: {campaign.reach}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {campaign.performance > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-400">Performance</div>
                        <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${campaign.performance}%` }}
                          ></div>
                        </div>
                        <div className="text-sm font-bold text-white">{campaign.performance}%</div>
                      </div>
                    )}
                    <button className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-black/40 backdrop-blur rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg py-3 px-4 font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Generate New Ad
                </button>
                <button className="w-full bg-white/10 text-white rounded-lg py-3 px-4 font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                  <Film className="w-5 h-5" />
                  Browse Templates
                </button>
                <button className="w-full bg-white/10 text-white rounded-lg py-3 px-4 font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                  <Target className="w-5 h-5" />
                  Campaign Builder
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-black/40 backdrop-blur rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { icon: CheckCircle2, text: 'Nike ad completed', time: '2 min ago', color: 'green' },
                  { icon: Activity, text: 'New campaign started', time: '15 min ago', color: 'purple' },
                  { icon: AlertTriangle, text: 'Render queue full', time: '1 hour ago', color: 'yellow' },
                  { icon: Award, text: 'Campaign milestone', time: '3 hours ago', color: 'blue' }
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <activity.icon className={`w-4 h-4 text-${activity.color}-400`} />
                    <div className="flex-1">
                      <div className="text-sm text-gray-300">{activity.text}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Presence */}
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" />
                Global Presence
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">North America</span>
                  <span className="text-white font-medium">42%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Europe</span>
                  <span className="text-white font-medium">28%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Asia Pacific</span>
                  <span className="text-white font-medium">23%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Other Regions</span>
                  <span className="text-white font-medium">7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}