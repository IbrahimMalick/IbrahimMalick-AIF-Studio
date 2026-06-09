import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";

export default function AGXUniversalGateway() {
  const [pluggedProviders, setPluggedProviders] = useState(['anthropic', 'openai']);
  const [animatingProvider, setAnimatingProvider] = useState(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    requests: 12847,
    tokens: 4521000,
    cost: 127.43,
    latency: 234
  });

  const providers = [
    { id: 'anthropic', name: 'Anthropic', icon: '🧠', models: 6, color: '#D4A574', flagship: 'Claude Opus 4.5' },
    { id: 'openai', name: 'OpenAI', icon: '🤖', models: 12, color: '#10A37F', flagship: 'GPT-4o' },
    { id: 'google', name: 'Google AI', icon: '🔷', models: 4, color: '#4285F4', flagship: 'Gemini 2.0' },
    { id: 'groq', name: 'Groq', icon: '⚡', models: 5, color: '#F55036', flagship: 'Llama 3.3 70B' },
    { id: 'mistral', name: 'Mistral', icon: '🌀', models: 5, color: '#FF7000', flagship: 'Mistral Large' },
    { id: 'together', name: 'Together AI', icon: '🔗', models: 5, color: '#6366F1', flagship: 'Llama 405B' },
    { id: 'perplexity', name: 'Perplexity', icon: '🔍', models: 3, color: '#20B2AA', flagship: 'Sonar Pro' },
    { id: 'cohere', name: 'Cohere', icon: '💠', models: 5, color: '#39FF85', flagship: 'Command R+' },
    { id: 'ollama', name: 'Ollama', icon: '🦙', models: 4, color: '#888', flagship: 'Local Models' },
  ];

  const plugProvider = (id) => {
    if (pluggedProviders.includes(id)) return;
    setAnimatingProvider(id);
    setTimeout(() => {
      setPluggedProviders([...pluggedProviders, id]);
      setAnimatingProvider(null);
    }, 600);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(`// That's it. One line.
await plug('anthropic', 'sk-ant-xxx');

// Or plug multiple
await plug('openai', key);
await plug('groq', key);

// Auto-detect from env
await autoPlug();

// Start chatting!
const r = await chat('Hello!');`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        requests: prev.requests + Math.floor(Math.random() * 5),
        tokens: prev.tokens + Math.floor(Math.random() * 1000),
        cost: parseFloat((prev.cost + Math.random() * 0.01).toFixed(2)),
        latency: 200 + Math.floor(Math.random() * 100)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl">
              ⚡
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
              UNIVERSAL AI GATEWAY
            </h2>
            <p className="text-gray-400 text-sm">Plug ANY Provider in ONE Line</p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {pluggedProviders.length} Active
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Requests', value: stats.requests.toLocaleString(), icon: '📊' },
          { label: 'Tokens', value: `${(stats.tokens / 1000000).toFixed(1)}M`, icon: '🔤' },
          { label: 'Cost', value: `$${stats.cost.toFixed(2)}`, icon: '💰' },
          { label: 'Latency', value: `${stats.latency}ms`, icon: '⏱️' },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl bg-[#111317] border border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs uppercase">{stat.label}</p>
                <p className="text-xl font-bold mt-1 text-white">{stat.value}</p>
              </div>
              <span className="text-2xl opacity-50">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-5 gap-4">
        {/* Provider Grid */}
        <div className="col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2 text-white">
              🌐 AI Providers
            </h3>
            <span className="text-xs text-gray-500">Click to plug</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {providers.map((provider) => {
              const isPlugged = pluggedProviders.includes(provider.id);
              const isAnimating = animatingProvider === provider.id;
              
              return (
                <div
                  key={provider.id}
                  onClick={() => plugProvider(provider.id)}
                  className={`relative overflow-hidden rounded-xl p-3 cursor-pointer transition-all duration-300 ${
                    isPlugged 
                      ? 'bg-gradient-to-br from-[#111317] to-[#0B0B0C] border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
                      : 'bg-[#111317]/50 border border-gray-800 hover:border-indigo-500/50 hover:bg-[#111317]'
                  } ${isAnimating ? 'scale-105 border-indigo-500 animate-pulse' : ''}`}
                >
                  {isPlugged && (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                  )}

                  <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${provider.color}20` }}
                      >
                        {provider.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-white">{provider.name}</h4>
                        <p className="text-xs text-gray-500">{provider.models} models</p>
                      </div>
                    </div>
                    {isPlugged ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs text-white">
                        ✓
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center text-gray-500 text-xs">
                        +
                      </div>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-800">
                    <p className="text-xs text-gray-400 truncate">{provider.flagship}</p>
                  </div>

                  {isPlugged && (
                    <div className="absolute bottom-1 right-2 text-xs text-emerald-400">
                      ● Active
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-3">
            <button 
              onClick={() => {
                providers.forEach((p, i) => {
                  setTimeout(() => plugProvider(p.id), i * 150);
                });
              }}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2 font-medium text-sm text-white"
            >
              ✨ Plug All Providers
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-[#111317] hover:bg-gray-800 transition-all flex items-center gap-2 text-sm text-white border border-gray-800">
              🔍 Auto-Detect
            </button>
          </div>
        </div>

        {/* Code Panel */}
        <div className="col-span-2 space-y-3">
          <div className="rounded-xl bg-[#0B0B0C] border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 bg-[#111317]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-gray-500">plug-and-play.ts</span>
              <button 
                onClick={copyCode}
                className="text-gray-400 hover:text-white transition-colors text-xs"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <pre className="p-3 text-xs overflow-x-auto leading-relaxed">
              <code className="text-gray-300">
                <span className="text-gray-500">// That's it. One line.</span>{'\n'}
                <span className="text-purple-400">await</span> <span className="text-blue-400">plug</span>(<span className="text-amber-300">'anthropic'</span>, <span className="text-amber-300">'sk-ant-xxx'</span>);{'\n\n'}
                <span className="text-gray-500">// Or plug multiple</span>{'\n'}
                <span className="text-purple-400">await</span> <span className="text-blue-400">plug</span>(<span className="text-amber-300">'openai'</span>, key);{'\n'}
                <span className="text-purple-400">await</span> <span className="text-blue-400">plug</span>(<span className="text-amber-300">'groq'</span>, key);{'\n\n'}
                <span className="text-gray-500">// Auto-detect from env</span>{'\n'}
                <span className="text-purple-400">await</span> <span className="text-blue-400">autoPlug</span>();{'\n\n'}
                <span className="text-gray-500">// Start chatting!</span>{'\n'}
                <span className="text-purple-400">const</span> r = <span className="text-purple-400">await</span> <span className="text-blue-400">chat</span>(<span className="text-amber-300">'Hello!'</span>);
              </code>
            </pre>
          </div>

          {/* Features */}
          <div className="rounded-xl bg-[#111317] border border-gray-800 p-3">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-white">
              🛡️ Enterprise Features
            </h4>
            <div className="grid grid-cols-2 gap-1">
              {[
                'Auto failover',
                'Cost routing',
                'Response cache',
                'Health monitor',
                'Rate limiting',
                'Usage analytics'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-300">
                  <span className="text-emerald-400">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Routing */}
          <div className="rounded-xl bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 p-3">
            <h4 className="font-semibold text-sm mb-2 text-white">🎯 Smart Routing</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { name: 'Cost', desc: 'Cheapest', icon: '💰' },
                { name: 'Quality', desc: 'Best', icon: '⭐' },
                { name: 'Speed', desc: 'Fastest', icon: '⚡' },
                { name: 'Balanced', desc: 'Optimal', icon: '⚖️' }
              ].map((s, i) => (
                <div key={i} className="p-2 rounded-lg bg-[#0B0B0C] text-center">
                  <span className="text-base">{s.icon}</span>
                  <p className="text-xs font-medium mt-0.5 text-white">{s.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="text-gray-500">AG-X Command Center v2.0.0</span>
          <Badge className="bg-purple-500/20 text-purple-400">Sovereign</Badge>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <span>13+ Providers</span>
          <span>50+ Models</span>
          <span>One API</span>
        </div>
      </div>
    </div>
  );
}