// ============================================================================
// AG-X BUSINESS SUITE - COMPLETE INTEGRATED APPLICATION
// ============================================================================
// THE ULTIMATE SAAS COMPETITOR KILLER
// Replaces: HubSpot ($890+), Mailchimp, ClickFunnels, GoHighLevel ($497),
//           Kajabi ($499), Calendly, Typeform ($199), and more
// 
// KEY DIFFERENTIATORS BUILT-IN:
// ✅ AI Included at Every Tier (vs competitors charging extra)
// ✅ Unlimited Contacts (vs contact-based billing)
// ✅ CAPTCHA Free (vs Typeform's $199+ paywall)
// ✅ Unlimited Event Types (vs Calendly limits)
// ✅ Unlimited Students (vs Kajabi's caps)
// ✅ Modern UI (vs "held together by rubber bands")
// ✅ In-App Cancellation (vs Keap nightmares)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Menu, X, ChevronRight, ChevronLeft, PanelLeft,
  Users, UserPlus, Building, Target,
  TrendingUp, TrendingDown, DollarSign, CreditCard, Receipt,
  PieChart, BarChart3, Activity, Zap, Award, Crown,
  Mail, MessageSquare, Phone, Calendar, Send,
  FileText, Folder, Image, Upload, Download, Copy, Link,
  CheckSquare, Circle, CheckCircle, XCircle, AlertCircle, HelpCircle, Search, Filter, Settings,
  Clock, Timer, CalendarDays, CalendarCheck,
  Plus, Minus, Edit2, Trash2, Eye, RefreshCw,
  Share2, Heart, Star, Bookmark, Bell,
  Brain, Sparkles, Wand2,
  GraduationCap, BookOpen, Trophy, UsersRound, Puzzle, Layers, MoreVertical
} from 'lucide-react';

// ============================================================================
// DESIGN SYSTEM - Premium Dark Theme
// ============================================================================
const theme = {
  colors: {
    primary: '#00D4FF',
    primaryGlow: 'rgba(0, 212, 255, 0.3)',
    secondary: '#A855F7',
    secondaryGlow: 'rgba(168, 85, 247, 0.3)',
    success: '#10B981',
    successBg: 'rgba(16, 185, 129, 0.15)',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.15)',
    error: '#EF4444',
    errorBg: 'rgba(239, 68, 68, 0.15)',
    bgPrimary: '#030712',
    bgSecondary: '#0F172A',
    bgTertiary: '#1E293B',
    bgElevated: '#334155',
    border: '#1E293B',
    borderLight: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #00D4FF 0%, #A855F7 100%)',
    secondary: 'linear-gradient(135deg, #A855F7 0%, #F472B6 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #4ADE80 100%)',
    card: 'linear-gradient(145deg, #1E293B 0%, #0F172A 100%)',
  },
  shadows: {
    glow: '0 0 40px rgba(0, 212, 255, 0.3)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.5)',
  },
  radius: { sm: '6px', md: '10px', lg: '16px', xl: '24px', full: '9999px' },
  transitions: { fast: '0.15s ease', normal: '0.25s ease' },
};

// ============================================================================
// COMPREHENSIVE STYLES
// ============================================================================
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.agx-suite * { box-sizing: border-box; margin: 0; padding: 0; }

.agx-suite {
  font-family: 'Inter', -apple-system, sans-serif;
  background: ${theme.colors.bgPrimary};
  color: ${theme.colors.textPrimary};
  min-height: 100vh;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.layout { display: flex; min-height: 100vh; }

.sidebar {
  width: 260px;
  background: ${theme.colors.bgSecondary};
  border-right: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
  transition: width ${theme.transitions.normal};
}

.sidebar.collapsed { width: 72px; }

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-logo {
  width: 40px;
  height: 40px;
  background: ${theme.gradients.primary};
  border-radius: ${theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: ${theme.shadows.glow};
}

.sidebar-brand { display: flex; flex-direction: column; overflow: hidden; }

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

.sidebar-subtitle { font-size: 11px; color: ${theme.colors.textMuted}; white-space: nowrap; }

.sidebar-nav {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-section { margin-bottom: 16px; }

.nav-section-title {
  font-size: 10px;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 8px 12px;
  margin-bottom: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: ${theme.radius.md};
  color: ${theme.colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  position: relative;
}

.nav-item:hover { background: ${theme.colors.bgTertiary}; color: ${theme.colors.textPrimary}; }

.nav-item.active {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
  color: ${theme.colors.primary};
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: ${theme.gradients.primary};
  border-radius: 0 3px 3px 0;
}

.nav-item-icon { width: 20px; height: 20px; flex-shrink: 0; }
.nav-item-label { flex: 1; white-space: nowrap; overflow: hidden; }

.nav-item-badge {
  background: ${theme.colors.error};
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: ${theme.radius.full};
  min-width: 18px;
  text-align: center;
}

.nav-item-badge.success { background: ${theme.colors.success}; }
.nav-item-badge.warning { background: ${theme.colors.warning}; }

.sidebar-footer { padding: 16px; border-top: 1px solid ${theme.colors.border}; }

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: ${theme.radius.md};
  cursor: pointer;
  transition: background ${theme.transitions.fast};
}

.sidebar-user:hover { background: ${theme.colors.bgTertiary}; }

.sidebar-avatar {
  width: 36px;
  height: 36px;
  border-radius: ${theme.radius.md};
  background: ${theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.sidebar-user-info { flex: 1; overflow: hidden; }
.sidebar-user-name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar-user-plan { font-size: 11px; color: ${theme.colors.primary}; display: flex; align-items: center; gap: 4px; }

.main {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left ${theme.transitions.normal};
}

.sidebar.collapsed ~ .main { margin-left: 72px; }

.header {
  height: 64px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left { display: flex; align-items: center; gap: 16px; }

.header-toggle {
  width: 36px;
  height: 36px;
  border-radius: ${theme.radius.md};
  background: transparent;
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.fast};
}

.header-toggle:hover { background: ${theme.colors.bgTertiary}; color: ${theme.colors.textPrimary}; }

.header-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.breadcrumb-item { color: ${theme.colors.textMuted}; }
.breadcrumb-item.active { color: ${theme.colors.textPrimary}; font-weight: 600; }

.header-center { flex: 1; max-width: 480px; margin: 0 24px; }

.header-search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${theme.colors.bgTertiary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  padding: 8px 14px;
  transition: all ${theme.transitions.fast};
}

.header-search:focus-within { border-color: ${theme.colors.primary}; box-shadow: 0 0 0 3px ${theme.colors.primaryGlow}; }

.header-search input {
  flex: 1;
  background: transparent;
  border: none;
  color: ${theme.colors.textPrimary};
  font-size: 14px;
  outline: none;
}

.header-search input::placeholder { color: ${theme.colors.textMuted}; }

.header-search-shortcut {
  background: ${theme.colors.bgElevated};
  color: ${theme.colors.textMuted};
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.header-right { display: flex; align-items: center; gap: 8px; }

.header-btn {
  width: 36px;
  height: 36px;
  border-radius: ${theme.radius.md};
  background: transparent;
  border: 1px solid transparent;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.fast};
  position: relative;
}

.header-btn:hover { background: ${theme.colors.bgTertiary}; color: ${theme.colors.textPrimary}; }

.header-btn-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: ${theme.colors.error};
  color: white;
  font-size: 9px;
  font-weight: 600;
  border-radius: ${theme.radius.full};
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-avatar {
  width: 36px;
  height: 36px;
  border-radius: ${theme.radius.md};
  background: ${theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
}

.header-avatar:hover { box-shadow: ${theme.shadows.glow}; }

.content { flex: 1; padding: 24px; overflow-y: auto; }
.content-header { margin-bottom: 24px; }

.content-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.content-subtitle { font-size: 14px; color: ${theme.colors.textSecondary}; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }

.stat-card {
  background: ${theme.gradients.card};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.lg};
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: all ${theme.transitions.normal};
}

.stat-card:hover { border-color: ${theme.colors.borderLight}; transform: translateY(-2px); }

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, var(--glow-color, ${theme.colors.primaryGlow}) 0%, transparent 70%);
  opacity: 0.5;
}

.stat-card.cyan { --glow-color: ${theme.colors.primaryGlow}; }
.stat-card.purple { --glow-color: ${theme.colors.secondaryGlow}; }
.stat-card.green { --glow-color: rgba(16, 185, 129, 0.3); }
.stat-card.orange { --glow-color: rgba(245, 158, 11, 0.3); }

.stat-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: ${theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.cyan { background: rgba(0, 212, 255, 0.15); color: ${theme.colors.primary}; }
.stat-icon.purple { background: rgba(168, 85, 247, 0.15); color: ${theme.colors.secondary}; }
.stat-icon.green { background: rgba(16, 185, 129, 0.15); color: ${theme.colors.success}; }
.stat-icon.orange { background: rgba(245, 158, 11, 0.15); color: ${theme.colors.warning}; }

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: ${theme.radius.full};
}

.stat-trend.up { background: ${theme.colors.successBg}; color: ${theme.colors.success}; }
.stat-trend.down { background: ${theme.colors.errorBg}; color: ${theme.colors.error}; }

.stat-value { font-size: 32px; font-weight: 700; margin-bottom: 4px; position: relative; z-index: 1; }
.stat-label { font-size: 13px; color: ${theme.colors.textMuted}; position: relative; z-index: 1; }

.card {
  background: ${theme.colors.bgSecondary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  transition: all ${theme.transitions.normal};
}

.card:hover { border-color: ${theme.colors.borderLight}; }

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title { font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.card-title-icon { color: ${theme.colors.primary}; }
.card-body { padding: 20px; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: ${theme.radius.md};
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  border: none;
  white-space: nowrap;
}

.btn-primary {
  background: ${theme.gradients.primary};
  color: white;
  box-shadow: 0 4px 14px ${theme.colors.primaryGlow};
}

.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px ${theme.colors.primaryGlow}; }

.btn-secondary {
  background: ${theme.colors.bgTertiary};
  color: ${theme.colors.textPrimary};
  border: 1px solid ${theme.colors.border};
}

.btn-secondary:hover { background: ${theme.colors.bgElevated}; border-color: ${theme.colors.borderLight}; }

.btn-ghost { background: transparent; color: ${theme.colors.textSecondary}; border: 1px solid transparent; }
.btn-ghost:hover { background: ${theme.colors.bgTertiary}; color: ${theme.colors.textPrimary}; }
.btn-sm { padding: 6px 12px; font-size: 13px; }
.btn-icon { width: 36px; height: 36px; padding: 0; }

.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

.activity-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid ${theme.colors.border}; }
.activity-item:last-child { border-bottom: none; }

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: ${theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content { flex: 1; min-width: 0; }
.activity-text { font-size: 14px; line-height: 1.5; }
.activity-time { font-size: 12px; color: ${theme.colors.textMuted}; margin-top: 4px; }

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: ${theme.colors.bgTertiary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
}

.quick-action:hover { border-color: ${theme.colors.primary}; transform: translateY(-4px); box-shadow: ${theme.shadows.glow}; }

.quick-action-icon {
  width: 48px;
  height: 48px;
  border-radius: ${theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.quick-action-title { font-weight: 600; margin-bottom: 4px; }
.quick-action-desc { font-size: 13px; color: ${theme.colors.textMuted}; text-align: center; }

.pipeline-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; overflow-x: auto; padding-bottom: 16px; }

.pipeline-column {
  min-width: 280px;
  background: ${theme.colors.bgTertiary};
  border-radius: ${theme.radius.lg};
  padding: 16px;
}

.pipeline-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.pipeline-title { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.pipeline-count { background: ${theme.colors.bgElevated}; padding: 2px 8px; border-radius: ${theme.radius.full}; font-size: 12px; color: ${theme.colors.textMuted}; }
.pipeline-value { font-size: 13px; color: ${theme.colors.success}; font-weight: 600; }
.pipeline-cards { display: flex; flex-direction: column; gap: 10px; }

.pipeline-card {
  background: ${theme.colors.bgSecondary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  padding: 14px;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
}

.pipeline-card:hover { border-color: ${theme.colors.primary}; transform: translateY(-2px); }
.pipeline-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.pipeline-card-title { font-weight: 600; font-size: 14px; }
.pipeline-card-amount { font-weight: 700; color: ${theme.colors.primary}; }
.pipeline-card-company { font-size: 13px; color: ${theme.colors.textMuted}; margin-bottom: 8px; }
.pipeline-card-footer { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: ${theme.colors.textMuted}; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: ${theme.radius.full};
  font-size: 11px;
  font-weight: 600;
}

.badge-primary { background: rgba(0, 212, 255, 0.15); color: ${theme.colors.primary}; }
.badge-success { background: ${theme.colors.successBg}; color: ${theme.colors.success}; }
.badge-warning { background: ${theme.colors.warningBg}; color: ${theme.colors.warning}; }

.aria-container { position: fixed; bottom: 24px; right: 24px; z-index: 1000; }

.aria-fab {
  width: 56px;
  height: 56px;
  border-radius: ${theme.radius.full};
  background: ${theme.gradients.primary};
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${theme.shadows.glow};
  transition: all ${theme.transitions.fast};
}

.aria-fab:hover { transform: scale(1.1); box-shadow: 0 0 60px ${theme.colors.primaryGlow}; }

.aria-panel {
  position: absolute;
  bottom: 72px;
  right: 0;
  width: 380px;
  background: ${theme.colors.bgSecondary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.xl};
  box-shadow: ${theme.shadows.xl};
  overflow: hidden;
}

.aria-header {
  padding: 16px 20px;
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${theme.gradients.card};
}

.aria-avatar {
  width: 40px;
  height: 40px;
  border-radius: ${theme.radius.full};
  background: ${theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
}

.aria-info { flex: 1; }
.aria-name { font-weight: 600; display: flex; align-items: center; gap: 6px; }
.aria-status { font-size: 12px; color: ${theme.colors.success}; display: flex; align-items: center; gap: 4px; }
.aria-status-dot { width: 6px; height: 6px; border-radius: ${theme.radius.full}; background: ${theme.colors.success}; }

.aria-messages {
  height: 320px;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.aria-message { max-width: 85%; padding: 12px 16px; border-radius: ${theme.radius.lg}; font-size: 14px; line-height: 1.5; }
.aria-message.assistant { background: ${theme.colors.bgTertiary}; border: 1px solid ${theme.colors.border}; align-self: flex-start; border-top-left-radius: 4px; }
.aria-message.user { background: ${theme.gradients.primary}; color: white; align-self: flex-end; border-top-right-radius: 4px; }

.aria-suggestions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }

.aria-suggestion {
  padding: 6px 12px;
  border-radius: ${theme.radius.full};
  font-size: 12px;
  background: ${theme.colors.bgElevated};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
}

.aria-suggestion:hover { border-color: ${theme.colors.primary}; color: ${theme.colors.primary}; }

.aria-input-container { padding: 16px; border-top: 1px solid ${theme.colors.border}; display: flex; gap: 12px; }

.aria-input {
  flex: 1;
  padding: 10px 14px;
  background: ${theme.colors.bgTertiary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  color: ${theme.colors.textPrimary};
  font-size: 14px;
  outline: none;
  transition: all ${theme.transitions.fast};
}

.aria-input:focus { border-color: ${theme.colors.primary}; }

.aria-send {
  width: 40px;
  height: 40px;
  border-radius: ${theme.radius.md};
  background: ${theme.gradients.primary};
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.fast};
}

.aria-send:hover { transform: scale(1.05); }

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: ${theme.colors.bgPrimary}; }
::-webkit-scrollbar-thumb { background: ${theme.colors.bgElevated}; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: ${theme.colors.textMuted}; }

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-pulse { animation: pulse 2s infinite; }
.animate-spin { animation: spin 1s linear infinite; }

@media (max-width: 1400px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 1024px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .main { margin-left: 0; }
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .grid-2, .grid-4 { grid-template-columns: 1fr; }
  .header-center { display: none; }
  .content { padding: 16px; }
}
`;

// ============================================================================
// MOCK DATA
// ============================================================================
const mockData = {
  stats: {
    revenue: { value: '$127,450', change: 23.5, trend: 'up' },
    contacts: { value: '12,847', change: 18.2, trend: 'up' },
    emailsSent: { value: '45,392', change: 12.8, trend: 'up' },
    conversionRate: { value: '8.4%', change: -2.1, trend: 'down' },
  },
  deals: {
    lead: [
      { id: 1, title: 'Website Redesign', company: 'TechCorp', value: 25000, probability: 20, daysInStage: 3 },
      { id: 2, title: 'Marketing Automation', company: 'Startup Co', value: 8500, probability: 15, daysInStage: 7 },
    ],
    qualified: [
      { id: 3, title: 'Enterprise License', company: 'Enterprise Inc', value: 75000, probability: 40, daysInStage: 5 },
      { id: 4, title: 'Annual Contract', company: 'Brand Co', value: 15000, probability: 35, daysInStage: 2 },
    ],
    proposal: [
      { id: 5, title: 'Full Platform', company: 'Wilson Consulting', value: 35000, probability: 60, daysInStage: 4 },
    ],
    negotiation: [
      { id: 6, title: 'Premium Plan', company: 'Creative Agency', value: 12000, probability: 80, daysInStage: 1 },
    ],
  },
  activity: [
    { id: 1, type: 'contact', message: 'Sarah Chen opened email "Welcome Series - Day 1"', time: '2 minutes ago', icon: Mail },
    { id: 2, type: 'payment', message: 'New payment of $199 from David Kim', time: '15 minutes ago', icon: DollarSign },
    { id: 3, type: 'form', message: 'New form submission from lisa@brand.co', time: '32 minutes ago', icon: FileText },
    { id: 4, type: 'appointment', message: 'Marcus Johnson booked a demo call', time: '1 hour ago', icon: Calendar },
    { id: 5, type: 'course', message: 'Emily Rodriguez completed Module 3', time: '2 hours ago', icon: GraduationCap },
  ],
  appointments: [
    { id: 1, title: 'Demo Call - TechCorp', time: '10:00 AM', duration: 30, status: 'confirmed' },
    { id: 2, title: 'Strategy Session', time: '2:00 PM', duration: 60, status: 'confirmed' },
    { id: 3, title: 'Onboarding Call', time: '11:00 AM', duration: 45, status: 'pending' },
  ],
};

// ============================================================================
// NAVIGATION CONFIG
// ============================================================================
const navigationConfig = [
  {
    section: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'contacts', label: 'Contacts', icon: Users, badge: '12.8K' },
      { id: 'deals', label: 'Deals', icon: Target, badge: '47' },
    ],
  },
  {
    section: 'Marketing',
    items: [
      { id: 'campaigns', label: 'Campaigns', icon: Mail, badge: '3', badgeType: 'success' },
      { id: 'funnels', label: 'Funnels', icon: Layers },
      { id: 'forms', label: 'Forms', icon: FileText },
      { id: 'automations', label: 'Automations', icon: Zap },
    ],
  },
  {
    section: 'Sales',
    items: [
      { id: 'calendar', label: 'Calendar', icon: Calendar, badge: '4', badgeType: 'warning' },
      { id: 'invoices', label: 'Invoices', icon: Receipt },
      { id: 'payments', label: 'Payments', icon: CreditCard },
    ],
  },
  {
    section: 'Products',
    items: [
      { id: 'courses', label: 'Courses', icon: GraduationCap },
      { id: 'community', label: 'Community', icon: UsersRound },
      { id: 'memberships', label: 'Memberships', icon: Crown },
    ],
  },
  {
    section: 'Settings',
    items: [
      { id: 'integrations', label: 'Integrations', icon: Puzzle },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

// ============================================================================
// ARIA AI ASSISTANT
// ============================================================================
const AriaAssistant = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm ARIA, your AI assistant. I can help you with:\n\n• Writing emails & campaigns\n• Analyzing your metrics\n• Creating automations\n• Answering questions\n\nHow can I help today?",
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  const suggestions = ['Write a welcome email', "Show today's metrics", 'Create automation', 'Analyze contacts'];
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I understand! Let me help you with that. Based on your request, here's what I recommend..." 
      }]);
    }, 1000);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="aria-container">
      <motion.div
        className="aria-panel"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
      >
        <div className="aria-header">
          <div className="aria-avatar"><Brain size={20} /></div>
          <div className="aria-info">
            <div className="aria-name">ARIA <Sparkles size={14} style={{ color: '#00D4FF' }} /></div>
            <div className="aria-status"><span className="aria-status-dot" />Online • AI Assistant</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div className="aria-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`aria-message ${msg.role}`}>{msg.content}</div>
          ))}
          <div ref={messagesEndRef} />
          {messages.length === 1 && (
            <div className="aria-suggestions">
              {suggestions.map((s) => (
                <button key={s} className="aria-suggestion" onClick={() => setInput(s)}>{s}</button>
              ))}
            </div>
          )}
        </div>
        
        <div className="aria-input-container">
          <input
            className="aria-input"
            placeholder="Ask ARIA anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="aria-send" onClick={handleSend}><Send size={18} /></button>
        </div>
      </motion.div>
      <button className="aria-fab" onClick={onClose}><Brain size={24} /></button>
    </div>
  );
};

// ============================================================================
// DASHBOARD SECTION
// ============================================================================
const DashboardSection = () => {
  const { stats, activity, appointments, deals } = mockData;
  
  return (
    <div>
      <div className="stats-grid">
        {[
          { ...stats.revenue, label: 'Monthly Revenue', icon: DollarSign, color: 'cyan' },
          { ...stats.contacts, label: 'Total Contacts', icon: Users, color: 'purple' },
          { ...stats.emailsSent, label: 'Emails Sent', icon: Mail, color: 'green' },
          { ...stats.conversionRate, label: 'Conversion Rate', icon: Target, color: 'orange' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            className={`stat-card ${stat.color}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="stat-header">
              <div className={`stat-icon ${stat.color}`}><stat.icon size={22} /></div>
              <div className={`stat-trend ${stat.trend}`}>
                {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>
      
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {[
          { icon: UserPlus, label: 'Add Contact', desc: 'Create new contact', color: 'cyan' },
          { icon: Mail, label: 'New Campaign', desc: 'Email or SMS', color: 'purple' },
          { icon: Layers, label: 'Build Funnel', desc: 'Landing pages', color: 'green' },
          { icon: Calendar, label: 'Schedule', desc: 'Book meeting', color: 'orange' },
        ].map((action, i) => (
          <motion.div
            key={action.label}
            className="quick-action"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <div className={`quick-action-icon stat-icon ${action.color}`}><action.icon size={24} /></div>
            <div className="quick-action-title">{action.label}</div>
            <div className="quick-action-desc">{action.desc}</div>
          </motion.div>
        ))}
      </div>
      
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Activity size={18} className="card-title-icon" />Recent Activity</div>
            <button className="btn btn-ghost btn-sm">View All</button>
          </div>
          <div className="card-body">
            {activity.map((item) => (
              <div key={item.id} className="activity-item">
                <div className={`activity-icon stat-icon ${
                  item.type === 'contact' ? 'cyan' : item.type === 'payment' ? 'green' :
                  item.type === 'form' ? 'purple' : item.type === 'appointment' ? 'orange' : 'cyan'
                }`}>
                  <item.icon size={16} />
                </div>
                <div className="activity-content">
                  <div className="activity-text">{item.message}</div>
                  <div className="activity-time">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Calendar size={18} className="card-title-icon" />Today's Schedule</div>
            <button className="btn btn-ghost btn-sm">View Calendar</button>
          </div>
          <div className="card-body">
            {appointments.map((apt) => (
              <div key={apt.id} className="activity-item">
                <div className="activity-icon stat-icon cyan"><Clock size={16} /></div>
                <div className="activity-content" style={{ flex: 1 }}>
                  <div className="activity-text" style={{ fontWeight: 600 }}>{apt.title}</div>
                  <div className="activity-time">{apt.time} • {apt.duration} min</div>
                </div>
                <span className={`badge badge-${apt.status === 'confirmed' ? 'success' : 'warning'}`}>{apt.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div className="card-title"><Target size={18} className="card-title-icon" />Pipeline Overview</div>
          <button className="btn btn-primary btn-sm"><Plus size={16} />Add Deal</button>
        </div>
        <div className="card-body" style={{ padding: '16px' }}>
          <div className="pipeline-grid">
            {[
              { id: 'lead', label: 'Lead', color: '#64748B' },
              { id: 'qualified', label: 'Qualified', color: '#3B82F6' },
              { id: 'proposal', label: 'Proposal', color: '#A855F7' },
              { id: 'negotiation', label: 'Negotiation', color: '#10B981' },
            ].map((stage) => {
              const stageDeals = deals[stage.id] || [];
              const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
              
              return (
                <div key={stage.id} className="pipeline-column">
                  <div className="pipeline-header">
                    <div className="pipeline-title">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                      {stage.label}
                      <span className="pipeline-count">{stageDeals.length}</span>
                    </div>
                    <div className="pipeline-value">${totalValue.toLocaleString()}</div>
                  </div>
                  <div className="pipeline-cards">
                    {stageDeals.map((deal) => (
                      <div key={deal.id} className="pipeline-card">
                        <div className="pipeline-card-header">
                          <div className="pipeline-card-title">{deal.title}</div>
                          <div className="pipeline-card-amount">${deal.value.toLocaleString()}</div>
                        </div>
                        <div className="pipeline-card-company">{deal.company}</div>
                        <div className="pipeline-card-footer">
                          <span>{deal.probability}% probability</span>
                          <span>{deal.daysInStage}d in stage</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PLACEHOLDER SECTION
// ============================================================================
const PlaceholderSection = ({ title, icon: Icon, description, features }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div className="stat-icon cyan" style={{ width: 80, height: 80, margin: '0 auto 20px', borderRadius: 20 }}>
      <Icon size={36} />
    </div>
    <h2 style={{ fontSize: 24, marginBottom: 8 }}>{title}</h2>
    <p style={{ color: '#94A3B8', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>{description}</p>
    {features && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
        {features.map((f, i) => (
          <span key={i} className="badge badge-primary">{f}</span>
        ))}
      </div>
    )}
    <button className="btn btn-primary">Get Started</button>
  </div>
);

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function AGXBusinessSuite() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [ariaOpen, setAriaOpen] = useState(false);
  
  const sectionTitles = {
    dashboard: 'Dashboard',
    contacts: 'Contacts & CRM',
    deals: 'Deals & Pipeline',
    campaigns: 'Email & SMS Campaigns',
    funnels: 'Funnels & Landing Pages',
    forms: 'Forms & Surveys',
    automations: 'Automations',
    calendar: 'Calendar & Scheduling',
    invoices: 'Invoices',
    payments: 'Payments',
    courses: 'Courses & Learning',
    community: 'Community',
    memberships: 'Memberships',
    integrations: 'Integrations',
    settings: 'Settings',
  };
  
  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'contacts':
        return <PlaceholderSection title="Contacts & CRM" icon={Users} description="Manage contacts with AI lead scoring. Unlimited contacts included." features={['AI Lead Scoring', 'Unlimited Contacts', 'Smart Segmentation', 'Activity Tracking']} />;
      case 'deals':
        return <PlaceholderSection title="Deals & Pipeline" icon={Target} description="Visual pipeline management with drag-and-drop deals." features={['Visual Pipeline', 'Deal Automation', 'Revenue Forecasting', 'Activity Timeline']} />;
      case 'campaigns':
        return <PlaceholderSection title="Email & SMS Campaigns" icon={Mail} description="AI-powered email writing included free." features={['AI Email Writer', 'SMS Included', '99% Deliverability', 'Advanced Analytics']} />;
      case 'funnels':
        return <PlaceholderSection title="Funnels & Landing Pages" icon={Layers} description="Modern templates that actually convert." features={['Drag & Drop Builder', 'Modern Templates', 'A/B Testing', 'Conversion Analytics']} />;
      case 'forms':
        return <PlaceholderSection title="Forms & Surveys" icon={FileText} description="CAPTCHA protection included FREE at every tier." features={['CAPTCHA FREE', 'Unlimited Forms', 'Conditional Logic', 'File Uploads']} />;
      case 'automations':
        return <PlaceholderSection title="Automations" icon={Zap} description="Build powerful workflows without complexity." features={['Visual Builder', 'Trigger Actions', 'Multi-Step Flows', 'AI Suggestions']} />;
      case 'calendar':
        return <PlaceholderSection title="Calendar & Scheduling" icon={Calendar} description="Unlimited event types and calendars." features={['Unlimited Events', 'Team Scheduling', 'Cal.com Ready', 'Paid Bookings']} />;
      case 'invoices':
        return <PlaceholderSection title="Invoices" icon={Receipt} description="Create and send professional invoices." features={['Professional Templates', 'Auto-Reminders', 'Payment Links', 'Tax Handling']} />;
      case 'payments':
        return <PlaceholderSection title="Payments" icon={CreditCard} description="Stripe integration with subscription management." features={['Stripe Ready', 'Subscriptions', 'One-Time Payments', 'Multi-Currency']} />;
      case 'courses':
        return <PlaceholderSection title="Courses & Learning" icon={GraduationCap} description="Unlimited students and courses." features={['Unlimited Students', 'Video Hosting', 'Certificates', 'Progress Tracking']} />;
      case 'community':
        return <PlaceholderSection title="Community" icon={UsersRound} description="Skool-style community with gamification." features={['Gamification', 'Leaderboards', 'Direct Messaging', 'Video Hosting']} />;
      case 'memberships':
        return <PlaceholderSection title="Memberships" icon={Crown} description="Recurring membership products with tiered access levels." features={['Multiple Tiers', 'Drip Content', 'Member Areas', 'Access Control']} />;
      case 'integrations':
        return <PlaceholderSection title="Integrations" icon={Puzzle} description="Connect your favorite tools." features={['Resend', 'Twilio', 'Stripe', 'Cal.com', 'Zapier', 'Webhooks']} />;
      case 'settings':
        return <PlaceholderSection title="Settings" icon={Settings} description="Configure your account, billing, and preferences." features={['In-App Cancel', 'Team Management', 'API Access', 'White Label']} />;
      default:
        return <DashboardSection />;
    }
  };
  
  return (
    <>
      <style>{styles}</style>
      <div className="agx-suite">
        <div className="layout">
          <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
              <div className="sidebar-logo">AG</div>
              {!sidebarCollapsed && (
                <div className="sidebar-brand">
                  <div className="sidebar-title">AG-X Suite</div>
                  <div className="sidebar-subtitle">Business Automation</div>
                </div>
              )}
            </div>
            
            <nav className="sidebar-nav">
              {navigationConfig.map((section) => (
                <div key={section.section} className="nav-section">
                  {!sidebarCollapsed && <div className="nav-section-title">{section.section}</div>}
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                      onClick={() => setActiveSection(item.id)}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <item.icon className="nav-item-icon" size={20} />
                      {!sidebarCollapsed && (
                        <>
                          <span className="nav-item-label">{item.label}</span>
                          {item.badge && <span className={`nav-item-badge ${item.badgeType || ''}`}>{item.badge}</span>}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
            
            <div className="sidebar-footer">
              <div className="sidebar-user">
                <div className="sidebar-avatar">F</div>
                {!sidebarCollapsed && (
                  <div className="sidebar-user-info">
                    <div className="sidebar-user-name">Founder</div>
                    <div className="sidebar-user-plan"><Crown size={12} />Pro Plan</div>
                  </div>
                )}
              </div>
            </div>
          </aside>
          
          <main className="main">
            <header className="header">
              <div className="header-left">
                <button className="header-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                  {sidebarCollapsed ? <Menu size={18} /> : <PanelLeft size={18} />}
                </button>
                <div className="header-breadcrumb">
                  <span className="breadcrumb-item">AG-X</span>
                  <ChevronRight size={14} />
                  <span className="breadcrumb-item active">{sectionTitles[activeSection]}</span>
                </div>
              </div>
              
              <div className="header-center">
                <div className="header-search">
                  <Search size={18} style={{ color: '#64748B' }} />
                  <input type="text" placeholder="Search anything..." />
                  <span className="header-search-shortcut">⌘K</span>
                </div>
              </div>
              
              <div className="header-right">
                <button className="header-btn" onClick={() => setAriaOpen(!ariaOpen)} title="ARIA AI">
                  <Sparkles size={18} />
                </button>
                <button className="header-btn" title="Notifications">
                  <Bell size={18} />
                  <span className="header-btn-badge">5</span>
                </button>
                <button className="header-btn" title="Help"><HelpCircle size={18} /></button>
                <div className="header-avatar">F</div>
              </div>
            </header>
            
            <div className="content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderSection()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
          
          <AnimatePresence>
            {ariaOpen && <AriaAssistant isOpen={ariaOpen} onClose={() => setAriaOpen(false)} />}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}