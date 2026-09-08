import React, { useState } from 'react';
import { 
  Compass, 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  LayoutGrid, 
  FileText, 
  Terminal, 
  Moon, 
  Sun, 
  Globe, 
  Wifi, 
  WifiOff, 
  Server, 
  CheckCircle2, 
  UserCheck, 
  Building2,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { Tenant, UserProfile, UserRole, LanguageCode, AnomalyAlert } from '../types';
import { translations } from '../i18n';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  activeTenant: Tenant;
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  currentUser: UserProfile;
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  language: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  offlineQueueCount: number;
  anomalies: AnomalyAlert[];
  onOpenAnomaly: (anomaly: AnomalyAlert) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeTenant,
  tenants,
  onSelectTenant,
  currentUser,
  users,
  onSelectUser,
  isDarkMode,
  onToggleDarkMode,
  language,
  onSelectLanguage,
  isOffline,
  onToggleOffline,
  offlineQueueCount,
  anomalies,
  onOpenAnomaly,
}) => {
  const t = translations[language];
  const [showTenantMenu, setShowTenantMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const activeAnomalies = anomalies.filter(a => a.status === 'active');
  const criticalCount = activeAnomalies.filter(a => a.severity === 'critical').length;

  const tabs = [
    { id: 'mapWorkspace', label: t.tabs.mapWorkspace, icon: Compass },
    { id: 'predictiveDashboard', label: t.tabs.predictiveDashboard, icon: TrendingUp },
    { id: 'anomalyCenter', label: t.tabs.anomalyCenter, icon: AlertTriangle, badge: activeAnomalies.length },
    { id: 'auditLogs', label: t.tabs.auditLogs, icon: ShieldCheck },
    { id: 'dashboardStudio', label: t.tabs.dashboardStudio, icon: LayoutGrid },
    { id: 'reports', label: t.tabs.reports, icon: FileText },
    { id: 'apiExplorer', label: t.tabs.apiExplorer, icon: Terminal },
  ];

  const roleLabels: Record<UserRole, string> = {
    super_admin: t.rbac.superAdmin,
    geospatial_analyst: t.rbac.analyst,
    operations_lead: t.rbac.lead,
    viewer: t.rbac.viewer,
  };

  const languageOptions: { code: LanguageCode; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  return (
    <header className={`border-b sticky top-0 z-50 transition-colors ${
      isDarkMode ? 'bg-slate-900/95 backdrop-blur-md border-slate-800 text-slate-100' : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-900'
    }`}>
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-3 text-xs">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Compass className="h-5 w-5 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight truncate bg-gradient-to-r from-sky-400 via-indigo-300 to-teal-400 bg-clip-text text-transparent">
                {t.appName}
              </span>
              <span className="shrink-0 px-1.5 sm:px-2 py-0.5 rounded-full font-mono text-[9px] sm:text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                ADK v2.4
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block truncate">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Center: MCP Status Indicators (Desktop & Tablet landscape) */}
        <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-lg border bg-slate-800/40 border-slate-700/60">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <Server className="h-3.5 w-3.5 text-emerald-400" />
            <span>BigQuery MCP</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-sky-400">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            <Layers className="h-3.5 w-3.5 text-sky-400" />
            <span>Google Maps MCP</span>
          </div>
        </div>

        {/* Right Controls: Desktop/Tablet view */}
        <div className="hidden md:flex items-center gap-2 sm:gap-2.5">
          {/* Multi-Tenant Switcher */}
          <div className="relative">
            <button
              id="tenant-switcher-btn"
              onClick={() => {
                setShowTenantMenu(!showTenantMenu);
                setShowUserMenu(false);
                setShowLangMenu(false);
                setShowAlertMenu(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' 
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <Building2 className="h-3.5 w-3.5 text-indigo-400" />
              <span className="max-w-[100px] lg:max-w-[130px] truncate">{activeTenant.name}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showTenantMenu && (
              <div className={`absolute right-0 mt-2 w-64 rounded-xl border shadow-xl p-2 z-50 ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {t.rbac.tenant}
                </div>
                {tenants.map(ten => (
                  <button
                    key={ten.id}
                    onClick={() => {
                      onSelectTenant(ten);
                      setShowTenantMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      ten.id === activeTenant.id
                        ? 'bg-indigo-600/15 text-indigo-400 font-semibold'
                        : isDarkMode ? 'hover:bg-slate-700/60 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{ten.name}</div>
                      <div className="text-[10px] text-slate-400">{ten.region}</div>
                    </div>
                    {ten.id === activeTenant.id && <CheckCircle2 className="h-4 w-4 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active User / Role Switcher (RBAC Tester) */}
          <div className="relative">
            <button
              id="role-switcher-btn"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowTenantMenu(false);
                setShowLangMenu(false);
                setShowAlertMenu(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' 
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-semibold text-emerald-400 uppercase text-[10px] max-w-[90px] lg:max-w-none truncate">
                {currentUser.role.replace('_', ' ')}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className={`absolute right-0 mt-2 w-72 rounded-xl border shadow-xl p-2 z-50 ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {t.rbac.role} & Active Persona
                </div>
                {users.map(usr => (
                  <button
                    key={usr.id}
                    onClick={() => {
                      onSelectUser(usr);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 text-xs transition-colors ${
                      usr.id === currentUser.id
                        ? 'bg-emerald-600/15 text-emerald-400 font-semibold'
                        : isDarkMode ? 'hover:bg-slate-700/60 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <img src={usr.avatar} alt={usr.name} className="h-6 w-6 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{usr.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{roleLabels[usr.role]}</div>
                    </div>
                    {usr.id === currentUser.id && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Anomaly Notification Bell */}
          <div className="relative">
            <button
              id="anomaly-bell-btn"
              onClick={() => {
                setShowAlertMenu(!showAlertMenu);
                setShowTenantMenu(false);
                setShowUserMenu(false);
                setShowLangMenu(false);
              }}
              className={`relative p-2 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' 
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
              }`}
              title="Real-time Anomaly Stream"
            >
              <AlertTriangle className={`h-4 w-4 ${criticalCount > 0 ? 'text-rose-500 animate-bounce' : 'text-amber-400'}`} />
              {activeAnomalies.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-slate-900">
                  {activeAnomalies.length}
                </span>
              )}
            </button>

            {showAlertMenu && (
              <div className={`absolute right-0 mt-2 w-80 rounded-xl border shadow-xl p-3 z-50 ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/50 mb-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                    {t.anomalies.activeAlerts} ({activeAnomalies.length})
                  </span>
                  <button 
                    onClick={() => {
                      onSelectTab('anomalyCenter');
                      setShowAlertMenu(false);
                    }}
                    className="text-[11px] text-sky-400 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {activeAnomalies.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No active anomalies detected.</p>
                  ) : (
                    activeAnomalies.slice(0, 4).map(anom => (
                      <div
                        key={anom.id}
                        onClick={() => {
                          onOpenAnomaly(anom);
                          setShowAlertMenu(false);
                        }}
                        className={`p-2 rounded-lg cursor-pointer transition-colors text-xs border ${
                          anom.severity === 'critical'
                            ? 'bg-rose-950/30 border-rose-800/50 hover:bg-rose-900/40 text-rose-200'
                            : 'bg-amber-950/30 border-amber-800/50 hover:bg-amber-900/40 text-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-[11px]">
                          <span className="truncate">{anom.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40">
                            {anom.zScore.toFixed(1)}σ
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{anom.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Offline Mode Toggle with Queue Counter */}
          <button
            id="offline-toggle-btn"
            onClick={onToggleOffline}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isOffline
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : isDarkMode
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
            title={isOffline ? t.offline.offlineMode : t.offline.online}
          >
            {isOffline ? (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[10px] font-mono">Offline ({offlineQueueCount})</span>
              </>
            ) : (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400">Sync</span>
              </>
            )}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              id="lang-dropdown-btn"
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowTenantMenu(false);
                setShowUserMenu(false);
                setShowAlertMenu(false);
              }}
              className={`p-2 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' 
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
              }`}
              title="Change Language"
            >
              <Globe className="h-3.5 w-3.5 text-sky-400" />
            </button>

            {showLangMenu && (
              <div className={`absolute right-0 mt-2 w-36 rounded-xl border shadow-xl p-1.5 z-50 ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                {languageOptions.map(opt => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      onSelectLanguage(opt.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      language === opt.code
                        ? 'bg-sky-600/20 text-sky-400 font-bold'
                        : isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{opt.flag} {opt.name}</span>
                    {language === opt.code && <CheckCircle2 className="h-3 w-3 text-sky-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleDarkMode}
            className={`p-2 rounded-lg border transition-colors ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-amber-300' 
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Mobile Actions: Bell, Theme, and Drawer Hamburger Button */}
        <div className="flex md:hidden items-center gap-1.5">
          {/* Anomaly Quick Bell for Mobile */}
          <button
            id="mobile-anomaly-btn"
            onClick={() => onSelectTab('anomalyCenter')}
            className={`relative p-2 rounded-xl border transition-colors ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <AlertTriangle className={`h-4 w-4 ${criticalCount > 0 ? 'text-rose-500 animate-bounce' : 'text-amber-400'}`} />
            {activeAnomalies.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
                {activeAnomalies.length}
              </span>
            )}
          </button>

          {/* Theme Toggle Mobile */}
          <button
            id="mobile-theme-btn"
            onClick={onToggleDarkMode}
            className={`p-2 rounded-xl border transition-colors ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-amber-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Mobile Drawer Hamburger Button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setShowMobileDrawer(!showMobileDrawer)}
            className={`p-2 rounded-xl border font-medium text-xs flex items-center gap-1 transition-colors ${
              showMobileDrawer
                ? 'bg-sky-600 text-white border-sky-500'
                : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
            aria-label="Open Mobile System Menu"
          >
            {showMobileDrawer ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Slide-down modal for phone/tablet) */}
      {showMobileDrawer && (
        <div className={`md:hidden border-t px-4 py-3 space-y-3.5 shadow-xl transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          {/* Tenant and User Switcher Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {t.rbac.tenant}
              </label>
              <select
                value={activeTenant.id}
                onChange={e => {
                  const found = tenants.find(ten => ten.id === e.target.value);
                  if (found) onSelectTenant(found);
                }}
                className={`w-full p-2 rounded-xl text-xs border outline-none font-medium ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-100 border-slate-200 text-slate-900'
                }`}
              >
                {tenants.map(ten => (
                  <option key={ten.id} value={ten.id}>
                    {ten.name} ({ten.region})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {t.rbac.role} & Persona
              </label>
              <select
                value={currentUser.id}
                onChange={e => {
                  const found = users.find(u => u.id === e.target.value);
                  if (found) onSelectUser(found);
                }}
                className={`w-full p-2 rounded-xl text-xs border outline-none font-medium ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-100 border-slate-200 text-slate-900'
                }`}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {roleLabels[u.role]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Language & Offline Controls */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/50">
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-sky-400 shrink-0" />
              <select
                value={language}
                onChange={e => onSelectLanguage(e.target.value as LanguageCode)}
                className={`p-1.5 rounded-lg text-xs border outline-none font-medium ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                {languageOptions.map(opt => (
                  <option key={opt.code} value={opt.code}>
                    {opt.flag} {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onToggleOffline}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                isOffline 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isOffline ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
              <span>{isOffline ? `Offline (${offlineQueueCount})` : 'Online Synced'}</span>
            </button>
          </div>

          {/* MCP Health Indicators in Mobile Drawer */}
          <div className="flex items-center justify-around p-2 rounded-xl bg-slate-800/40 border border-slate-700/60 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>BigQuery MCP: Connected</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-400">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
              <span>Maps MCP: Ready</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Navigation Bar with Touch-Friendly Horizontal Scroll */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 overflow-x-auto touch-scroll no-scrollbar">
        <nav className="flex items-center space-x-1 sm:space-x-1.5 border-t border-slate-800/50 py-1 sm:py-1.5 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => {
                  onSelectTab(tab.id);
                  setShowMobileDrawer(false);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[42px] touch-manipulation ${
                  isActive
                    ? isDarkMode
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10'
                      : 'bg-sky-50 text-sky-600 border border-sky-200 shadow-sm'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`ml-0.5 sm:ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
