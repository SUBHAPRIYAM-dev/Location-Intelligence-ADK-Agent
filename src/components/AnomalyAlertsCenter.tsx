import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Eye, 
  Sliders, 
  Plus, 
  Activity, 
  MapPin, 
  Clock, 
  Bot, 
  Cpu, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AnomalyAlert, UserRole, LanguageCode } from '../types';
import { translations } from '../i18n';

interface AnomalyAlertsCenterProps {
  anomalies: AnomalyAlert[];
  onUpdateAnomalyStatus: (id: string, newStatus: 'active' | 'acknowledged' | 'resolved') => void;
  onLocateOnMap?: (lat: number, lng: number) => void;
  userRole: UserRole;
  language: LanguageCode;
  isDarkMode: boolean;
}

export const AnomalyAlertsCenter: React.FC<AnomalyAlertsCenterProps> = ({
  anomalies,
  onUpdateAnomalyStatus,
  onLocateOnMap,
  userRole,
  language,
  isDarkMode,
}) => {
  const t = translations[language];
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyAlert | null>(anomalies[0] || null);
  const [showRuleModal, setShowRuleModal] = useState(false);

  const filtered = anomalies.filter(a => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  const canManage = userRole !== 'viewer';

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto space-y-6 ${
      isDarkMode ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-rose-500" />
            <span>{t.anomalies.title}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical Outlier Stream • Z-Score Surge Detection • Real-time Notification Engine
          </p>
        </div>

        {/* Action Button: Rule Configurator */}
        {canManage && (
          <button
            id="create-alert-rule-btn"
            onClick={() => setShowRuleModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Configure Anomaly Rule</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/60 border border-slate-700">
          {(['all', 'critical', 'warning', 'info'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg font-semibold uppercase text-[11px] transition-all ${
                severityFilter === sev
                  ? sev === 'critical' ? 'bg-rose-600 text-white shadow-sm'
                  : sev === 'warning' ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/60 border border-slate-700">
          {(['all', 'active', 'acknowledged', 'resolved'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-semibold capitalize text-[11px] transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Alert List on Left, Deep Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alerts List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filtered.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-slate-700 text-center text-slate-400 text-xs">
              No anomalies match the selected filters.
            </div>
          ) : (
            filtered.map(anom => {
              const isSelected = selectedAnomaly?.id === anom.id;
              return (
                <div
                  key={anom.id}
                  onClick={() => setSelectedAnomaly(anom)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-sky-500 ring-1 ring-sky-500/40 bg-slate-800/80 shadow-md'
                      : isDarkMode
                      ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/40'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl mt-0.5 ${
                        anom.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                        anom.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-sky-500/20 text-sky-400'
                      }`}>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-100">{anom.title}</h4>
                          <span className={`px-2 py-0.2 rounded-full font-mono text-[9px] font-bold uppercase ${
                            anom.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            anom.severity === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          }`}>
                            {anom.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {anom.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-rose-400">
                        {anom.zScore.toFixed(1)}σ
                      </div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] capitalize font-medium mt-1 ${
                        anom.status === 'active' ? 'bg-rose-500/20 text-rose-400' :
                        anom.status === 'acknowledged' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {anom.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>H3: {anom.h3Index}</span>
                    <span>{new Date(anom.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Deep Anomaly Inspector (5 cols) */}
        <div className="lg:col-span-5">
          {selectedAnomaly ? (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-xl lg:sticky lg:top-24 space-y-4 ${
              isDarkMode ? 'bg-slate-900/90 border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  Anomaly Diagnostics
                </span>
                <span className="font-mono text-xs text-sky-400">{selectedAnomaly.id}</span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-slate-100">{selectedAnomaly.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedAnomaly.description}
                </p>
              </div>

              {/* Statistical Variance Breakdown */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Target Metric:</span>
                  <span className="text-slate-200 font-semibold">{selectedAnomaly.metricName}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Observed Value:</span>
                  <span className="text-rose-400 font-bold">{selectedAnomaly.observedValue}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Baseline Expected:</span>
                  <span className="text-emerald-400 font-semibold">{selectedAnomaly.expectedBaseline}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Statistical Z-Score:</span>
                  <span className="text-amber-400 font-bold">{selectedAnomaly.zScore.toFixed(2)}σ</span>
                </div>
              </div>

              {/* Spatial Coordinates & H3 Hexagon */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/30 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Latitude, Longitude</span>
                  <span className="font-mono font-semibold text-slate-200 text-[11px]">
                    {selectedAnomaly.lat.toFixed(4)}, {selectedAnomaly.lng.toFixed(4)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/30 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">H3 Spatial Index</span>
                  <span className="font-mono font-semibold text-sky-400 text-[11px] truncate block">
                    {selectedAnomaly.h3Index}
                  </span>
                </div>
              </div>

              {/* ADK Agent Root Cause Assessment */}
              <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-800/30 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                  <Bot className="h-3.5 w-3.5" />
                  <span>ADK Agent Assessment & Recommendation</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Correlated with real-time BigQuery spatial stream. Recommend immediate dispatch to route relief corridor and trigger automated email notification to on-duty operations lead.
                </p>
              </div>

              {/* Action Buttons */}
              {canManage && (
                <div className="pt-2 flex items-center gap-2">
                  {selectedAnomaly.status === 'active' && (
                    <button
                      id="ack-anomaly-btn"
                      onClick={() => onUpdateAnomalyStatus(selectedAnomaly.id, 'acknowledged')}
                      className="flex-1 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition-colors text-center"
                    >
                      {t.anomalies.acknowledge}
                    </button>
                  )}
                  {selectedAnomaly.status !== 'resolved' && (
                    <button
                      id="resolve-anomaly-btn"
                      onClick={() => onUpdateAnomalyStatus(selectedAnomaly.id, 'resolved')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md text-center"
                    >
                      {t.anomalies.resolve}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
              Select an anomaly to inspect spatial diagnostic metrics.
            </div>
          )}
        </div>
      </div>

      {/* Rule Creator Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-sky-400" />
              Configure Automated Anomaly Detection Rule
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Rule Name</label>
                <input
                  type="text"
                  defaultValue="Logistics Cold-Chain Critical Deviation"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Spatial Dataset Partition</label>
                <select className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none">
                  <option>gis_analytics.supply_chain_telemetry</option>
                  <option>gis_analytics.ev_charging_infrastructure</option>
                  <option>gis_analytics.foot_traffic_trends</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Threshold Condition</label>
                  <select className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none">
                    <option>Z-Score &gt; 2.5σ</option>
                    <option>Z-Score &gt; 3.0σ</option>
                    <option>Thermal Strain &gt; 85%</option>
                    <option>Speed Drop &gt; 60%</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Alert Severity</label>
                  <select className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none">
                    <option>Critical</option>
                    <option>Warning</option>
                    <option>Info</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowRuleModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowRuleModal(false)}
                className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-md"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
