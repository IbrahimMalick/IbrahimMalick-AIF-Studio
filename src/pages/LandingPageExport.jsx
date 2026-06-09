// This page renders the raw HTML export of the landing page for copy-paste to Hostinger
// Visit /LandingPageExport in your app to see and copy the full HTML

import React, { useState } from "react";

const HTML_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Freedom Studios – AI-Powered Cinematic Ads & Intelligent Automation</title>
  <meta name="description" content="Transform your brand with cinematic AI video campaigns, autonomous content systems, and intelligent marketing workflows. Join the waitlist today." />
  <meta property="og:title" content="AI Freedom Studios – The Future of Content Creation" />
  <meta property="og:description" content="AI-Powered Cinematic Ads. Intelligent Automation. Limitless Growth." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://aifreedomstudios.com" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', sans-serif;
      background: #050505;
      color: #fff;
      -webkit-font-smoothing: antialiased;
    }
    a { text-decoration: none; color: inherit; }

    /* ── HEADER ── */
    header {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(5,5,5,0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding: 16px 24px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .logo { display: flex; align-items: center; gap: 12px; }
    .logo-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: linear-gradient(135deg, #00D9FF, #8338EC);
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 14px; color: #fff; flex-shrink: 0;
    }
    .logo-text .name { font-weight: 900; font-size: 15px; letter-spacing: -0.5px; }
    .logo-text .sub { font-size: 9px; color: #555; letter-spacing: 2px; text-transform: uppercase; }
    .header-nav { display: flex; align-items: center; gap: 24px; }
    .header-nav a { font-size: 13px; color: #666; transition: color .2s; }
    .header-nav a:hover { color: #fff; }
    .btn-signin {
      padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;
      color: #fff; border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.05); cursor: pointer;
      transition: background .2s;
    }
    .btn-signin:hover { background: rgba(255,255,255,0.1); }

    /* ── HERO ── */
    .hero {
      position: relative; min-height: 100vh;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; padding: 100px 24px 80px;
      overflow: hidden;
    }
    canvas#particles { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
    .grid-overlay {
      position: absolute; inset: 0; pointer-events: none; opacity: .04;
      background-image: linear-gradient(#00D9FF 1px, transparent 1px),
                        linear-gradient(90deg, #00D9FF 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .glow-blob {
      position: absolute; border-radius: 50%; pointer-events: none; filter: blur(120px);
    }
    .glow1 { width: 700px; height: 400px; background: rgba(131,56,236,0.2); top: 25%; left: 50%; transform: translateX(-50%); }
    .glow2 { width: 300px; height: 300px; background: rgba(0,217,255,0.15); top: 30%; left: 20%; }
    .glow3 { width: 300px; height: 300px; background: rgba(255,0,110,0.1); top: 30%; right: 20%; }
    .hero-content { position: relative; z-index: 2; max-width: 900px; margin: 0 auto; }
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 16px; border-radius: 999px;
      border: 1px solid rgba(0,217,255,0.3); background: rgba(0,217,255,0.05);
      color: #00D9FF; font-size: 13px; font-weight: 500; margin-bottom: 32px;
      backdrop-filter: blur(4px);
    }
    .hero h1 { font-size: clamp(40px, 8vw, 88px); font-weight: 900; line-height: .95; letter-spacing: -2px; margin-bottom: 32px; }
    .hero h1 .line1 { display: block; color: #fff; }
    .hero h1 .line2 {
      display: block;
      background: linear-gradient(135deg, #00D9FF 0%, #8338EC 50%, #FF006E 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .hero h1 .line3 { display: block; color: rgba(255,255,255,0.9); font-size: clamp(24px, 4.5vw, 56px); margin-top: 8px; }
    .hero-desc { font-size: 18px; color: #888; max-width: 680px; margin: 0 auto 24px; line-height: 1.7; }
    .hero-tagline { color: #555; font-size: 15px; margin-bottom: 8px; font-style: italic; }
    .hero-tagline2 { color: #fff; font-size: 18px; font-weight: 600; margin-bottom: 48px; }
    .hero-tagline2 span { color: #00D9FF; }
    .cta-group { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 18px 36px; border-radius: 12px; font-size: 17px; font-weight: 700;
      color: #fff; background: linear-gradient(135deg, #00D9FF, #8338EC);
      box-shadow: 0 0 40px rgba(0,217,255,0.4), 0 0 80px rgba(131,56,236,0.2);
      border: none; cursor: pointer; transition: transform .3s, opacity .2s;
      text-decoration: none;
    }
    .btn-primary:hover { transform: scale(1.05); opacity: .95; }
    .btn-secondary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 18px 36px; border-radius: 12px; font-size: 17px; font-weight: 700;
      color: #fff; border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.05); backdrop-filter: blur(4px);
      cursor: pointer; transition: background .2s, border-color .2s;
      text-decoration: none;
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); }
    .scroll-hint {
      position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      color: #333; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
    }
    .scroll-line { width: 1px; height: 32px; background: linear-gradient(to bottom, #333, transparent); }

    /* ── SECTIONS SHARED ── */
    section { padding: 112px 24px; }
    .section-inner { max-width: 1200px; margin: 0 auto; }
    .section-label { font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 20px; }
    .section-title { font-size: clamp(32px, 5vw, 56px); font-weight: 900; line-height: 1.05; margin-bottom: 20px; }
    .section-sub { font-size: 17px; color: #666; max-width: 640px; line-height: 1.7; }
    .grad-cyan { background: linear-gradient(135deg, #00D9FF, #8338EC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .grad-gold { background: linear-gradient(135deg, #FFB703, #FF006E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .text-center { text-align: center; }
    .mx-auto { margin-left: auto; margin-right: auto; }

    /* ── WHY SECTION ── */
    .why-section { background: #07070A; }
    .why-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-top: 48px; }
    .why-card {
      padding: 28px; border-radius: 16px;
      background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
      transition: border-color .3s;
    }
    .why-card:hover { border-color: rgba(255,255,255,0.12); }
    .why-card .emoji { font-size: 32px; margin-bottom: 16px; }
    .why-card p { color: #fff; font-size: 16px; font-weight: 600; line-height: 1.4; }
    .why-footer { margin-top: 40px; color: #555; font-size: 15px; }
    .why-footer span { color: #fff; font-weight: 600; }

    /* ── PROBLEM SECTION ── */
    .problem-section { background: #07070A; }
    .problem-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 48px 0; }
    .problem-card {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 20px; border-radius: 12px;
      background: rgba(255,0,110,0.04); border: 1px solid rgba(255,0,110,0.12);
    }
    .x-icon { color: #FF006E; font-size: 18px; flex-shrink: 0; margin-top: 2px; }
    .problem-card span { color: #ccc; font-size: 14px; }
    .problem-statement { margin-top: 48px; text-align: center; }
    .problem-statement p { color: #666; font-size: 17px; margin-bottom: 8px; }
    .problem-statement .dominant { color: #fff; font-size: 20px; font-weight: 700; }
    .problem-statement .dominant span { color: #00D9FF; }
    .problem-statement .bridge { color: #666; margin-top: 16px; max-width: 640px; margin-left: auto; margin-right: auto; font-size: 15px; line-height: 1.7; }
    .problem-statement .bridge strong { color: #fff; }

    /* ── BENEFITS SECTION ── */
    .benefits-section { background: #050505; position: relative; overflow: hidden; }
    .benefits-glow { position: absolute; top: 0; right: 0; width: 400px; height: 400px; background: rgba(0,217,255,0.06); border-radius: 50%; filter: blur(120px); pointer-events: none; }
    .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 48px; }
    .benefit-card {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 20px; border-radius: 12px;
      background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
      transition: border-color .3s;
    }
    .benefit-card:hover { border-color: rgba(0,217,255,0.2); }
    .check-icon { color: #00D9FF; font-size: 18px; flex-shrink: 0; margin-top: 2px; }
    .benefit-card span { color: #ccc; font-size: 14px; font-weight: 500; }
    .benefits-footer { margin-top: 40px; text-align: center; color: #555; font-size: 15px; }
    .benefits-footer strong { color: #fff; }

    /* ── AGENTS SECTION ── */
    .agents-section { background: #050505; position: relative; overflow: hidden; }
    .agents-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 800px; height: 400px; background: rgba(131,56,236,0.1); border-radius: 50%; filter: blur(150px); pointer-events: none; }
    .agents-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 48px; }
    .agent-card {
      padding: 24px; border-radius: 16px;
      background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
      transition: border-color .3s, transform .3s;
    }
    .agent-card:hover { border-color: rgba(255,255,255,0.15); transform: translateY(-4px); }
    .agent-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; margin-bottom: 16px;
    }
    .agent-card h3 { color: #fff; font-size: 13px; font-weight: 700; margin-bottom: 8px; line-height: 1.3; }
    .agent-card p { color: #555; font-size: 12px; line-height: 1.6; }
    .agents-footer { text-align: center; margin-top: 56px; }
    .agents-footer .line1 { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 4px; }
    .agents-footer .line2 { font-size: 26px; font-weight: 900; background: linear-gradient(135deg, #00D9FF, #FF006E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    /* ── MISSION SECTION ── */
    .mission-section { background: #07070A; position: relative; overflow: hidden; }
    .mission-grid-bg { position: absolute; inset: 0; pointer-events: none; opacity: .03; background-image: linear-gradient(#8338EC 1px, transparent 1px), linear-gradient(90deg, #8338EC 1px, transparent 1px); background-size: 80px 80px; }
    .mission-glow { position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 500px; height: 500px; background: rgba(131,56,236,0.08); border-radius: 50%; filter: blur(150px); pointer-events: none; }
    .mission-body { max-width: 760px; margin: 32px auto 0; }
    .mission-body p { color: #666; font-size: 17px; line-height: 1.8; margin-bottom: 16px; }
    .mission-body .highlight { color: #fff; font-size: 18px; font-weight: 500; }
    .mission-body .highlight span.cyan { color: #00D9FF; }
    .mission-body .highlight span.pink { color: #FF006E; }
    .mission-body .highlight span.gold { color: #FFB703; }
    .mission-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 56px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 56px; }
    .mission-card { padding: 32px; border-radius: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); }
    .mission-card .m-emoji { font-size: 36px; margin-bottom: 16px; }
    .mission-card h3 { color: #fff; font-size: 18px; font-weight: 700; margin-bottom: 12px; }
    .mission-card p { color: #555; font-size: 14px; line-height: 1.7; }

    /* ── FINAL CTA ── */
    .cta-section { background: #050505; position: relative; overflow: hidden; }
    .cta-glow1 { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 600px; height: 400px; background: rgba(131,56,236,0.18); border-radius: 50%; filter: blur(120px); pointer-events: none; }
    .cta-glow2 { position: absolute; top: 20%; right: 20%; width: 300px; height: 300px; background: rgba(0,217,255,0.1); border-radius: 50%; filter: blur(100px); pointer-events: none; }
    .cta-section .section-title { font-size: clamp(36px, 6vw, 72px); }
    .coming-soon-pill {
      display: inline-flex; align-items: center; gap: 12px;
      padding: 12px 24px; border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02);
      backdrop-filter: blur(4px); margin-top: 56px;
    }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #00D9FF; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
    .coming-soon-pill span { color: #555; font-size: 13px; }
    .coming-soon-pill .label { color: #999; font-weight: 600; letter-spacing: 1px; font-size: 12px; text-transform: uppercase; }
    .sep { color: #333; }

    /* ── FOOTER ── */
    footer { background: #030303; border-top: 1px solid rgba(255,255,255,0.04); padding: 40px 24px; }
    .footer-inner { max-width: 1200px; margin: 0 auto; }
    .footer-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
    .footer-nav { display: flex; flex-wrap: wrap; gap: 24px; }
    .footer-nav a, .footer-nav button { color: #555; font-size: 13px; transition: color .2s; background: none; border: none; cursor: pointer; }
    .footer-nav a:hover, .footer-nav button:hover { color: #fff; }
    .footer-bottom { text-align: center; font-size: 12px; color: #333; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 24px; }
    .footer-bottom a { color: #333; transition: color .2s; }
    .footer-bottom a:hover { color: #666; }

    /* ── RESPONSIVE ── */
    @media (max-width: 768px) {
      header { padding: 12px 16px; }
      .header-nav .nav-links { display: none; }
      .mission-cards { grid-template-columns: 1fr; }
      .cta-group { flex-direction: column; align-items: center; }
      .btn-primary, .btn-secondary { width: 100%; max-width: 320px; justify-content: center; }
      .coming-soon-pill { flex-wrap: wrap; justify-content: center; gap: 8px; }
    }

    /* ── SCROLL REVEAL ── */
    .reveal { opacity: 0; transform: translateY(40px); transition: opacity .7s ease, transform .7s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }
  </style>
</head>
<body>

<!-- HEADER -->
<header>
  <div class="logo">
    <div class="logo-icon">AF</div>
    <div class="logo-text">
      <div class="name">AIFREEDOMSTUDIOS</div>
      <div class="sub">Intelligent Growth Ecosystem</div>
    </div>
  </div>
  <nav class="header-nav">
    <span class="nav-links">
      <a href="#agents">Agents</a>
      <a href="#mission">Mission</a>
      <a href="mailto:hello@aifreedomstudios.com">Contact</a>
    </span>
    <a href="#waitlist" class="btn-signin">Join Waitlist</a>
  </nav>
</header>

<!-- HERO -->
<section class="hero">
  <canvas id="particles"></canvas>
  <div class="grid-overlay"></div>
  <div class="glow-blob glow1"></div>
  <div class="glow-blob glow2"></div>
  <div class="glow-blob glow3"></div>
  <div class="hero-content">
    <div class="badge">✦ The Future of Content Creation Has Arrived</div>
    <h1>
      <span class="line1">AI-Powered</span>
      <span class="line2">Cinematic Ads.</span>
      <span class="line3">Intelligent Automation. Limitless Growth.</span>
    </h1>
    <p class="hero-desc">
      Transform your brand with cinematic AI video campaigns, autonomous content systems,
      and intelligent marketing workflows designed to capture attention, generate leads,
      and scale faster than ever before.
    </p>
    <p class="hero-tagline">The future doesn't belong to businesses with the biggest teams.</p>
    <p class="hero-tagline2">It belongs to businesses with the <span>smartest systems.</span></p>
    <div class="cta-group">
      <a href="#waitlist" class="btn-primary">✦ Join the Waitlist →</a>
      <a href="https://calendly.com/aifreedomstudios" target="_blank" class="btn-secondary">📅 Book a Strategy Call</a>
    </div>
  </div>
  <div class="scroll-hint">
    <span>Scroll</span>
    <div class="scroll-line"></div>
  </div>
</section>

<!-- WHY -->
<section class="why-section">
  <div class="section-inner text-center reveal">
    <p class="section-label" style="color:#FFB703;">Why AIFREEDOMSTUDIOS?</p>
    <h2 class="section-title">Because <span style="color:#FFB703;">Attention</span> Is the<br>Most Valuable Asset in Today's Economy.</h2>
    <div class="why-cards">
      <div class="why-card">
        <div class="emoji">🎯</div>
        <p>The brands that capture attention win.</p>
      </div>
      <div class="why-card">
        <div class="emoji">⚡</div>
        <p>The businesses that adapt win.</p>
      </div>
      <div class="why-card">
        <div class="emoji">🚀</div>
        <p>Entrepreneurs who leverage AI gain an unfair advantage.</p>
      </div>
    </div>
    <p class="why-footer" style="margin-top:40px;">
      We're building the systems that make that advantage <span>accessible to everyone.</span>
    </p>
  </div>
</section>

<!-- PROBLEM -->
<section class="problem-section">
  <div class="section-inner reveal">
    <div class="text-center">
      <p class="section-label" style="color:#FF006E;">The Problem</p>
      <h2 class="section-title">Stop Creating Content.<br><span style="color:#555;">Start Building Attention.</span></h2>
      <p class="section-sub mx-auto">Most businesses struggle with the same obstacles standing between them and real growth.</p>
    </div>
    <div class="problem-grid" style="margin-top:48px; display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px;">
      <div class="problem-card"><span class="x-icon">✕</span><span>Inconsistent content creation</span></div>
      <div class="problem-card"><span class="x-icon">✕</span><span>Expensive production costs</span></div>
      <div class="problem-card"><span class="x-icon">✕</span><span>Low engagement and visibility</span></div>
      <div class="problem-card"><span class="x-icon">✕</span><span>Time-consuming marketing workflows</span></div>
      <div class="problem-card"><span class="x-icon">✕</span><span>Falling behind competitors embracing AI</span></div>
    </div>
    <div class="problem-statement">
      <p>The digital landscape is evolving faster than ever.</p>
      <p class="dominant">Businesses that leverage AI will <span>dominate.</span></p>
      <p style="color:#555;margin-bottom:16px;">Businesses that don't will struggle to compete.</p>
      <p class="bridge"><strong>AIFreedomStudios</strong> bridges that gap by combining cinematic storytelling, intelligent automation, and autonomous AI agents into one powerful growth ecosystem.</p>
    </div>
  </div>
</section>

<!-- BENEFITS -->
<section class="benefits-section">
  <div class="benefits-glow"></div>
  <div class="section-inner reveal" style="position:relative;z-index:1;">
    <div class="text-center">
      <p class="section-label" style="color:#00D9FF;">The Solution</p>
      <h2 class="section-title">More Than Content.<br><span class="grad-cyan">A Complete AI Growth Ecosystem.</span></h2>
      <p class="section-sub mx-auto" style="text-align:center;">This isn't simply automation. It's intelligent business acceleration.</p>
    </div>
    <div class="benefits-grid">
      <div class="benefit-card"><span class="check-icon">✓</span><span>Create cinematic advertisements</span></div>
      <div class="benefit-card"><span class="check-icon">✓</span><span>Scale content production</span></div>
      <div class="benefit-card"><span class="check-icon">✓</span><span>Increase brand awareness</span></div>
      <div class="benefit-card"><span class="check-icon">✓</span><span>Automate repetitive marketing tasks</span></div>
      <div class="benefit-card"><span class="check-icon">✓</span><span>Generate more leads</span></div>
      <div class="benefit-card"><span class="check-icon">✓</span><span>Improve customer engagement</span></div>
      <div class="benefit-card"><span class="check-icon">✓</span><span>Build authority in your industry</span></div>
      <div class="benefit-card"><span class="check-icon">✓</span><span>Operate with greater efficiency</span></div>
    </div>
  </div>
</section>

<!-- AGENTS -->
<section class="agents-section" id="agents">
  <div class="agents-glow"></div>
  <div class="section-inner reveal" style="position:relative;z-index:1;">
    <div class="text-center">
      <p class="section-label" style="color:#00D9FF;">The Agent Network</p>
      <h2 class="section-title">Meet The Agents<br><span class="grad-cyan">Working For You 24/7</span></h2>
      <p class="section-sub mx-auto" style="text-align:center;">Not just one AI tool — an entire ecosystem of intelligent agents collaborating to create, optimize, publish, and scale your content.</p>
    </div>
    <div class="agents-grid">
      <div class="agent-card">
        <div class="agent-icon" style="background:rgba(0,217,255,0.1);border:1px solid rgba(0,217,255,0.2);">🔍</div>
        <h3>Research Agent</h3>
        <p>Analyzes markets, competitors, trends, and opportunities.</p>
      </div>
      <div class="agent-card">
        <div class="agent-icon" style="background:rgba(131,56,236,0.1);border:1px solid rgba(131,56,236,0.2);">🗺️</div>
        <h3>Strategy Agent</h3>
        <p>Develops campaign direction, positioning, and growth plans.</p>
      </div>
      <div class="agent-card">
        <div class="agent-icon" style="background:rgba(255,0,110,0.1);border:1px solid rgba(255,0,110,0.2);">📝</div>
        <h3>Script Agent</h3>
        <p>Creates compelling ad copy, storytelling, and content frameworks.</p>
      </div>
      <div class="agent-card">
        <div class="agent-icon" style="background:rgba(255,183,3,0.1);border:1px solid rgba(255,183,3,0.2);">🎬</div>
        <h3>Cinematic Director Agent</h3>
        <p>Designs scenes, visual concepts, camera movements, and creative direction.</p>
      </div>
      <div class="agent-card">
        <div class="agent-icon" style="background:rgba(0,217,255,0.1);border:1px solid rgba(0,217,255,0.2);">🎥</div>
        <h3>Video Production Agent</h3>
        <p>Generates cinematic AI-powered video assets and campaigns.</p>
      </div>
      <div class="agent-card">
        <div class="agent-icon" style="background:rgba(131,56,236,0.1);border:1px solid rgba(131,56,236,0.2);">✂️</div>
        <h3>Editing Agent</h3>
        <p>Optimizes pacing, subtitles, formatting, and audience retention.</p>
      </div>
      <div class="agent-card">
        <div class="agent-icon" style="background:rgba(255,0,110,0.1);border:1px solid rgba(255,0,110,0.2);">📡</div>
        <h3>Distribution Agent</h3>
        <p>Publishes content across multiple platforms automatically.</p>
      </div>
      <div class="agent-card">
        <div class="agent-icon" style="background:rgba(255,183,3,0.1);border:1px solid rgba(255,183,3,0.2);">📊</div>
        <h3>Analytics Agent</h3>
        <p>Measures engagement, conversions, and campaign performance.</p>
      </div>
      <div class="agent-card">
        <div class="agent-icon" style="background:rgba(0,217,255,0.1);border:1px solid rgba(0,217,255,0.2);">🧠</div>
        <h3>Memory Agent</h3>
        <p>Learns your brand, audience, and customer preferences over time.</p>
      </div>
      <div class="agent-card">
        <div class="agent-icon" style="background:rgba(131,56,236,0.1);border:1px solid rgba(131,56,236,0.2);">⚙️</div>
        <h3>Orchestrator Agent</h3>
        <p>Coordinates the entire system, ensuring every component works together seamlessly.</p>
      </div>
    </div>
    <div class="agents-footer">
      <p class="line1">Ten intelligent agents.</p>
      <p class="line2">One unified growth engine.</p>
    </div>
  </div>
</section>

<!-- MISSION -->
<section class="mission-section" id="mission">
  <div class="mission-grid-bg"></div>
  <div class="mission-glow"></div>
  <div class="section-inner text-center reveal" style="position:relative;z-index:1;">
    <p class="section-label" style="color:#FFB703;">Our Mission</p>
    <h2 class="section-title">We Exist to Help Businesses<br><span class="grad-gold">Unlock the Power of AI.</span></h2>
    <div class="mission-body">
      <p>We believe every entrepreneur, creator, and organization should have access to the same advanced tools once reserved for large corporations and enterprise teams.</p>
      <p class="highlight">Our mission is simple: To make powerful AI systems <span class="cyan">accessible</span>, <span class="pink">practical</span>, and <span class="gold">transformational</span> for anyone looking to grow their brand, expand their reach, and create more freedom in their business.</p>
    </div>
    <div class="mission-cards">
      <div class="mission-card">
        <div class="m-emoji">🧠</div>
        <h3>Not to replace human creativity.</h3>
        <p>AI Freedom Studios augments what humans do best — it handles the volume, the repetition, and the complexity, so you can focus on vision.</p>
      </div>
      <div class="mission-card">
        <div class="m-emoji">🚀</div>
        <h3>To amplify it.</h3>
        <p>When intelligent systems handle the heavy lifting, human creativity is freed to do what only humans can — imagine, innovate, and inspire.</p>
      </div>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="cta-section" id="waitlist">
  <div class="cta-glow1"></div>
  <div class="cta-glow2"></div>
  <div class="section-inner text-center reveal" style="position:relative;z-index:1;">
    <p class="section-label" style="color:#00D9FF;">Join the Movement</p>
    <h2 class="section-title">The Future Belongs to<br><span class="grad-cyan">Intelligent Brands.</span></h2>
    <p class="section-sub mx-auto" style="text-align:center;margin-bottom:16px;">Be among the first to experience the future of AI-powered cinematic content creation and autonomous business growth.</p>
    <p style="color:#333;margin-bottom:56px;">The future isn't coming. <strong style="color:#fff;">It's already here.</strong></p>
    <div class="cta-group">
      <a href="mailto:hello@aifreedomstudios.com?subject=Waitlist%20Request" class="btn-primary">✦ Join the Waitlist →</a>
      <a href="https://calendly.com/aifreedomstudios" target="_blank" class="btn-secondary">📅 Book a Strategy Call</a>
    </div>
    <div class="coming-soon-pill">
      <div class="pulse-dot"></div>
      <span class="label">Coming Soon</span>
      <span class="sep">·</span>
      <span>AI Cinematic Ads</span>
      <span class="sep">·</span>
      <span>Intelligent Automation</span>
      <span class="sep">·</span>
      <span>Creative Freedom</span>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-inner">
    <div class="footer-top">
      <div class="logo">
        <div class="logo-icon" style="width:32px;height:32px;font-size:12px;">AF</div>
        <div class="logo-text">
          <div class="name" style="font-size:13px;">AIFREEDOMSTUDIOS</div>
          <div class="sub">Intelligent Growth Ecosystem</div>
        </div>
      </div>
      <nav class="footer-nav">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="mailto:hello@aifreedomstudios.com">Contact</a>
      </nav>
    </div>
    <div class="footer-bottom">
      &copy; <span id="year"></span> AI Freedom Studios. All Rights Reserved. &nbsp;|&nbsp;
      <a href="/privacy">Privacy</a> &nbsp;|&nbsp; <a href="/terms">Terms</a>
    </div>
  </div>
</footer>

<script>
  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Particle canvas
  (function() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    const colors = ['#00D9FF','#8338EC','#FF006E','#FFB703'];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      particles.forEach((p, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = '#00D9FF';
            ctx.globalAlpha = (1 - dist/100) * 0.08;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
    draw();
  })();

  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
</script>
</body>
</html>`;

export default function LandingPageExport() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(HTML_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black mb-2 text-white">Hostinger Landing Page — HTML Export</h1>
        <p className="text-gray-400 mb-6 text-sm font-sans">
          Copy the code below and save it as <code className="text-cyan-400">index.html</code> on your Hostinger VPS at{" "}
          <code className="text-cyan-400">/var/www/html/index.html</code> (or your web root).
        </p>

        <div className="mb-4 flex gap-3">
          <button
            onClick={copy}
            className="px-6 py-3 rounded-lg font-bold text-sm text-white transition-all"
            style={{ background: copied ? "#22c55e" : "linear-gradient(135deg,#00D9FF,#8338EC)" }}
          >
            {copied ? "✓ Copied!" : "Copy Full HTML"}
          </button>
          <a
            href={`data:text/html;charset=utf-8,${encodeURIComponent(HTML_CODE)}`}
            download="index.html"
            className="px-6 py-3 rounded-lg font-bold text-sm text-white border border-white/20 bg-white/5 hover:bg-white/10 transition-all"
          >
            ↓ Download index.html
          </a>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 overflow-auto max-h-[60vh] text-xs text-gray-400 leading-relaxed whitespace-pre">
          {HTML_CODE}
        </div>

        <div className="mt-6 p-5 rounded-xl bg-[#00D9FF]/5 border border-[#00D9FF]/20">
          <p className="text-[#00D9FF] font-bold text-sm mb-2">🚀 Hostinger Deployment Steps</p>
          <ol className="text-gray-400 text-sm space-y-1 list-decimal list-inside font-sans">
            <li>Download <code className="text-cyan-400">index.html</code> using the button above</li>
            <li>SSH into your VPS: <code className="text-cyan-400">ssh user@your-server-ip</code></li>
            <li>Upload the file: <code className="text-cyan-400">scp index.html user@your-server-ip:/var/www/html/</code></li>
            <li>Or use Hostinger File Manager in hPanel to upload directly</li>
            <li>Update <code className="text-cyan-400">hello@aifreedomstudios.com</code> and Calendly links with your real URLs</li>
            <li>Add your privacy & terms pages at <code className="text-cyan-400">/privacy</code> and <code className="text-cyan-400">/terms</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}