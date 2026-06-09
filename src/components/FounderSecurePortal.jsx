import React, { useState, useEffect } from 'react';
import { createPageUrl } from "@/utils";

export default function FounderSecurePortal({ onAccessGranted }) {
  const [step, setStep] = useState('identity');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [scanProgress, setScanProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [securityChecks, setSecurityChecks] = useState([
    { id: 1, name: 'TLS 1.3 Encryption', status: 'active', icon: '🔐' },
    { id: 2, name: 'Device Fingerprint', status: 'checking', icon: '📱' },
    { id: 3, name: 'IP Geolocation', status: 'pending', icon: '🌍' },
    { id: 4, name: 'Threat Analysis', status: 'pending', icon: '🛡️' },
  ]);

  // Animate security checks
  useEffect(() => {
    const timers = [
      setTimeout(() => setSecurityChecks(prev => prev.map(c => c.id === 2 ? {...c, status: 'active'} : c)), 1000),
      setTimeout(() => setSecurityChecks(prev => prev.map(c => c.id === 3 ? {...c, status: 'active'} : c)), 2000),
      setTimeout(() => setSecurityChecks(prev => prev.map(c => c.id === 4 ? {...c, status: 'active'} : c)), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleIdentitySubmit = () => {
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setStep('password'); }, 1500);
  };

  const handlePasswordSubmit = () => {
    if (!password) return;
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setStep('2fa'); }, 1500);
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) document.getElementById(`code-${index + 1}`)?.focus();
    if (newCode.every(c => c !== '')) {
      setIsLoading(true);
      setTimeout(() => { setIsLoading(false); setStep('biometric'); }, 1000);
    }
  };

  const startBiometricScan = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setStep('granted'), 500);
      }
    }, 50);
  };

  useEffect(() => {
    if (step === 'biometric') startBiometricScan();
  }, [step]);

  const handleEnterCommandCenter = () => {
    if (onAccessGranted) {
      onAccessGranted();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        
        {/* Security Status Bar */}
        <div className="mb-4 p-3 rounded-xl bg-slate-900/80 border border-slate-700/50 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">SECURITY STATUS</span>
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SECURE
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {securityChecks.map(check => (
              <div key={check.id} className="text-center">
                <div className={`text-lg mb-1 ${check.status === 'active' ? '' : 'opacity-30'}`}>
                  {check.icon}
                </div>
                <div className={`w-full h-1 rounded-full ${
                  check.status === 'active' ? 'bg-emerald-500' : 
                  check.status === 'checking' ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl p-6 shadow-2xl">
          
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30">
              <span className="text-3xl">🔒</span>
            </div>
            <h1 className="text-xl font-bold text-white">AG-X FOUNDER PORTAL</h1>
            <p className="text-slate-400 text-sm">Quantum-Grade Security</p>
          </div>

          {/* ACCESS GRANTED */}
          {step === 'granted' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center animate-pulse">
                <span className="text-4xl">✓</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-400">ACCESS GRANTED</h2>
                <p className="text-slate-400 text-sm mt-2">Welcome back, Founder</p>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-6">
                {['Identity', '2FA', 'Biometric'].map((v, i) => (
                  <div key={i} className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-emerald-400 text-lg">✓</div>
                    <div className="text-xs text-slate-400">{v}</div>
                  </div>
                ))}
              </div>
              <button 
                onClick={handleEnterCommandCenter}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-medium text-white hover:from-emerald-500 hover:to-teal-500 transition-all"
              >
                🚀 Enter Command Center
              </button>
            </div>
          )}

          {/* IDENTITY STEP */}
          {step === 'identity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs">
                  ⚡ FOUNDER ACCESS ONLY
                </span>
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Founder Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@aifreedomstudios.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 outline-none text-white placeholder-slate-500"
                />
              </div>
              
              <button
                onClick={handleIdentitySubmit}
                disabled={!email || isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 font-medium flex items-center justify-center gap-2 text-white"
              >
                {isLoading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                ) : 'Continue →'}
              </button>
              
              <p className="text-center text-xs text-slate-500">Step 1 of 4 • Identity Verification</p>
            </div>
          )}

          {/* PASSWORD STEP */}
          {step === 'password' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">🔑</div>
                <h2 className="text-lg font-bold text-white">Master Password</h2>
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 outline-none text-white pr-12"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              
              {/* Strength indicator */}
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${
                    password.length >= i * 3 
                      ? i <= 2 ? 'bg-red-500' : i <= 4 ? 'bg-amber-500' : 'bg-emerald-500'
                      : 'bg-slate-700'
                  }`} />
                ))}
              </div>
              
              <button
                onClick={handlePasswordSubmit}
                disabled={!password || isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 disabled:opacity-50 font-medium flex items-center justify-center gap-2 text-white"
              >
                {isLoading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authenticating...</>
                ) : 'Continue →'}
              </button>
              
              <p className="text-center text-xs text-slate-500">Step 2 of 4 • Password Verification</p>
            </div>
          )}

          {/* 2FA STEP */}
          {step === '2fa' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">📱</div>
                <h2 className="text-lg font-bold text-white">Two-Factor Code</h2>
                <p className="text-slate-400 text-sm">Enter the 6-digit code from your authenticator</p>
              </div>
              
              <div className="flex justify-center gap-2">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={`code-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    className="w-11 h-14 text-center text-xl font-bold rounded-lg bg-slate-800/50 border border-slate-700 focus:border-indigo-500 outline-none text-white"
                  />
                ))}
              </div>
              
              <p className="text-center text-xs text-slate-500">Step 3 of 4 • 2FA Verification</p>
            </div>
          )}

          {/* BIOMETRIC STEP */}
          {step === 'biometric' && (
            <div className="space-y-4 text-center py-4">
              <div className="text-3xl mb-2">🔬</div>
              <h2 className="text-lg font-bold text-white">Biometric Scan</h2>
              
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
                <div 
                  className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"
                  style={{ animationDuration: '1s' }}
                />
                <div className="absolute inset-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <span className="text-4xl">👆</span>
                </div>
              </div>
              
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              
              <p className="text-slate-400 text-sm">{scanProgress}% Complete</p>
              <p className="text-center text-xs text-slate-500">Step 4 of 4 • Biometric Verification</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-slate-500">
          <p>🔒 256-bit AES Encryption • Zero-Trust Architecture</p>
          <p className="mt-1">AG-X Command Center v2.0.0 Sovereign</p>
        </div>
      </div>
    </div>
  );
}