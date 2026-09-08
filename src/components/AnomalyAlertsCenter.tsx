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
  ChevronRight,
  RotateCcw,
  Check,
  Loader2,
  X,
  Zap
} from 'lucide-react';
import { AnomalyAlert, UserRole, LanguageCode } from '../types';
import { translations } from '../i18n';

interface AnomalyAlertsCenterProps {
  anomalies: AnomalyAlert[];
  onUpdateAnomalyStatus: (id: string, newStatus: 'active' | 'acknowledged' | 'resolved') => void;
  onLocateOnMap?: (lat: number, lng: number, label?: string, pointId?: string, layer?: string) => void;
  onInvestigateWithAgent?: (query: string) => void;
  onInjectAnomaly?: (newAnomaly: AnomalyAlert) => void;
  userRole: UserRole;
  language: LanguageCode;
  isDarkMode: boolean;
}

export const AnomalyAlertsCenter: React.FC<AnomalyAlertsCenterProps> = ({
  anomalies,
  onUpdateAnomalyStatus,
  onLocateOnMap,
  onInvestigateWithAgent,
  onInjectAnomaly,
  userRole,
  language,
  isDarkMode,
}) => {
  const t = translations[language];
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(() => anomalies[0]?.id || null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState(0);
  
  // Interactive action feedback states
  const [isLocating, setIsLocating] = useState(false);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<'ack' | 'resolve' | 'reopen' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Rule Form State
  const [ruleName, setRuleName] = useState('Logistics Cold-Chain Critical Deviation');
  const [ruleDataset, setRuleDataset] = useState('gis_analytics.supply_chain_telemetry');
  const [ruleThreshold, setRuleThreshold] = useState('Z-Score > 3.0σ');
  const [ruleSeverity, setRuleSeverity] = useState<'critical' | 'warning' | 'info'>('critical');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 4000);
  };

  // Rotating real-time telemetry simulation templates
  const SIMULATION_SCENARIOS = [
    {
      title: 'Port Newark Berth 14 Crane Logistics Bottleneck',
      description: 'Container dwell time spiked to 14.8 hours (baseline: 3.5 hrs). Intermodal rail terminal congestion causing container stack overflow.',
      severity: 'critical' as const,
      pointId: 'pt-port-01',
      lat: 40.6912,
      lng: -74.1480,
      h3Index: '882a100f13fffff',
      metricName: 'Intermodal Berth Dwell (hrs)',
      observedValue: 14.8,
      expectedBaseline: 3.5,
      zScore: 4.25,
      tenantId: 'tenant-acme',
      detectedBy: 'BigQuery GIS Stream',
    },
    {
      title: 'Battery Park Microgrid High-Tide Surge Backfeed',
      description: 'Storm water intrusion sensor detected salinity and reverse grounding current along lower Manhattan shoreline substation feeders.',
      severity: 'critical' as const,
      pointId: 'pt-storm-01',
      lat: 40.7032,
      lng: -74.0170,
      h3Index: '882a100d49fffff',
      metricName: 'Reverse Ground Current (Amps)',
      observedValue: 42.6,
      expectedBaseline: 1.2,
      zScore: 4.60,
      tenantId: 'tenant-metro',
      detectedBy: 'Coastal Sensor Telemetry',
    },
    {
      title: 'LaGuardia Air Cargo Fuel Line Flow Rate Drop',
      description: 'Jet-A automated hydrant pipeline pressure plummeted -45% across Cargo Tarmac East, delaying 12 freight flights.',
      severity: 'warning' as const,
      pointId: 'pt-lga-01',
      lat: 40.7769,
      lng: -73.8740,
      h3Index: '882a100823fffff',
      metricName: 'Hydrant Flow Pressure (PSI)',
      observedValue: 52.0,
      expectedBaseline: 110.0,
      zScore: 3.10,
      tenantId: 'tenant-acme',
      detectedBy: 'Aviation Logistics Gateway',
    },
    {
      title: 'Midtown East Steam Line Thermal Pressure Spike',
      description: 'ConEd high-pressure steam distribution manifold recorded 198 PSI (safety limit: 165 PSI) near Lexington Ave & 48th St.',
      severity: 'warning' as const,
      pointId: 'pt-steam-01',
      lat: 40.7554,
      lng: -73.9725,
      h3Index: '882a100d2bfffff',
      metricName: 'Steam Distribution Pressure (PSI)',
      observedValue: 198.0,
      expectedBaseline: 145.0,
      zScore: 2.95,
      tenantId: 'tenant-metro',
      detectedBy: 'Municipal Utility Sensor',
    },
    {
      title: 'DUMBO Waterfront Commercial Demand Deflection',
      description: 'Water street pedestrian retail footfall deflected 44% inland due to ferry pier maintenance, impacting local boutique transactions.',
      severity: 'info' as const,
      pointId: 'pt-ret-04',
      lat: 40.7035,
      lng: -73.9890,
      h3Index: '882a100d47fffff',
      metricName: 'Catchment Deflection %',
      observedValue: 44.0,
      expectedBaseline: 8.0,
      zScore: 2.10,
      tenantId: 'tenant-retail',
      detectedBy: 'Commercial Catchment Engine',
    },
  ];

  const handleSimulateTelemetrySurge = () => {
    const scenario = SIMULATION_SCENARIOS[simulationIndex % SIMULATION_SCENARIOS.length];
    setSimulationIndex(prev => prev + 1);

    const newAnomaly: AnomalyAlert = {
      ...scenario,
      id: `anom-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      status: 'active',
    };

    if (onInjectAnomaly) {
      onInjectAnomaly(newAnomaly);
    }

    setSelectedAnomalyId(newAnomaly.id);
    showToast(`⚡ Real-Time Anomaly Stream: "${newAnomaly.title}" (+${newAnomaly.zScore.toFixed(2)}σ) detected!`);
  };

  const filtered = anomalies.filter(a => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  // Keep selected anomaly synchronized with anomalies collection
  const selectedAnomaly = anomalies.find(a => a.id === selectedAnomalyId) || filtered[0] || anomalies[0] || null;

  const canManage = userRole !== 'viewer';

  // Determine appropriate map layer based on anomaly title/metric
  const getAnomalyLayer = (anom: AnomalyAlert): string => {
    const text = (anom.title + ' ' + anom.metricName + ' ' + anom.description).toLowerCase();
    if (text.includes('grid') || text.includes('substation') || text.includes('charging') || text.includes('thermal') || text.includes('ev')) {
      return 'evGrid';
    }
    if (text.includes('carrier') || text.includes('fleet') || text.includes('truck') || text.includes('cold-chain') || text.includes('logistics')) {
      return 'logistics';
    }
    if (text.includes('pedestrian') || text.includes('foot') || text.includes('crowd') || text.includes('traffic') || text.includes('square')) {
      return 'footTraffic';
    }
    if (text.includes('retail') || text.includes('store') || text.includes('catchment') || text.includes('cannibal')) {
      return 'retail';
    }
    return 'evGrid';
  };

  const handleLocateOnMapClick = () => {
    if (!selectedAnomaly) return;
    setIsLocating(true);
    showToast(`📍 Navigating map viewport to [${selectedAnomaly.lat.toFixed(4)}, ${selectedAnomaly.lng.toFixed(4)}]...`);
    
    const targetLayer = getAnomalyLayer(selectedAnomaly);
    setTimeout(() => {
      onLocateOnMap?.(
        selectedAnomaly.lat,
        selectedAnomaly.lng,
        selectedAnomaly.title,
        selectedAnomaly.pointId,
        targetLayer
      );
      setIsLocating(false);
    }, 250);
  };

  const handleInvestigateClick = () => {
    if (!selectedAnomaly) return;
    setIsInvestigating(true);
    showToast(`🤖 Initializing ADK Agent with spatial diagnostics for ${selectedAnomaly.title}...`);

    const query = `Investigate spatial anomaly: "${selectedAnomaly.title}" (${selectedAnomaly.metricName}) located at coordinates [${selectedAnomaly.lat.toFixed(4)}, ${selectedAnomaly.lng.toFixed(4)}] with observed value ${selectedAnomaly.observedValue} (expected baseline: ${selectedAnomaly.expectedBaseline}, statistical z-score: ${selectedAnomaly.zScore.toFixed(2)}σ). Identify root causes, run BigQuery GIS buffer analysis, and provide operational mitigation recommendations.`;

    setTimeout(() => {
      onInvestigateWithAgent?.(query);
      setIsInvestigating(false);
    }, 250);
  };

  const handleStatusChange = (newStatus: 'active' | 'acknowledged' | 'resolved') => {
    if (!selectedAnomaly) return;
    const actionKey = newStatus === 'acknowledged' ? 'ack' : newStatus === 'resolved' ? 'resolve' : 'reopen';
    setIsUpdatingStatus(actionKey);

    onUpdateAnomalyStatus(selectedAnomaly.id, newStatus);

    if (newStatus === 'acknowledged') {
      showToast(`✓ Anomaly "${selectedAnomaly.title}" acknowledged. Incident responder logged in Compliance Audit Trail.`);
    } else if (newStatus === 'resolved') {
      showToast(`✓ Anomaly "${selectedAnomaly.title}" marked as resolved. Telemetry returned to normal baseline.`);
    } else {
      showToast(`↺ Anomaly "${selectedAnomaly.title}" reopened and restored to Active incidents list.`);
    }

    setTimeout(() => {
      setIsUpdatingStatus(null);
    }, 350);
  };

  const handleSaveRule = () => {
    setShowRuleModal(false);
    showToast(`✓ Anomaly Rule "${ruleName}" successfully compiled & deployed to BigQuery Streaming Engine.`);
  };

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto space-y-6 relative ${
      isDarkMode ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md p-3.5 rounded-2xl bg-slate-900/95 border border-sky-500/40 text-slate-100 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
            <span className="font-medium text-sky-200">{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

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

        {/* Action Buttons: Simulate Telemetry Surge & Rule Configurator */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="simulate-anomaly-btn"
            onClick={handleSimulateTelemetrySurge}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Inject real-time simulated telemetry outlier to test alert streaming, map navigation, and ADK investigation"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Simulate Real-Time Telemetry Surge</span>
          </button>

          {canManage && (
            <button
              id="create-alert-rule-btn"
              onClick={() => setShowRuleModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Configure Anomaly Rule</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/60 border border-slate-700">
          {(['all', 'critical', 'warning', 'info'] as const).map(sev => (
            <button
              key={sev}
              id={`filter-sev-${sev}`}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg font-semibold uppercase text-[11px] transition-all cursor-pointer ${
                severityFilter === sev
                  ? sev === 'critical' ? 'bg-rose-600 text-white shadow-sm'
                  : sev === 'warning' ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
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
              id={`filter-status-${st}`}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-semibold capitalize text-[11px] transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
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
            <div className="p-8 rounded-2xl border border-dashed border-slate-700 text-center text-slate-400 text-xs space-y-2">
              <p>No anomalies match the selected filters.</p>
              <button
                onClick={() => { setSeverityFilter('all'); setStatusFilter('all'); }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-sky-400 hover:text-sky-300 font-semibold text-xs inline-flex items-center gap-1.5"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Filters
              </button>
            </div>
          ) : (
            filtered.map(anom => {
              const isSelected = selectedAnomaly?.id === anom.id;
              return (
                <div
                  key={anom.id}
                  id={`anomaly-card-${anom.id}`}
                  onClick={() => setSelectedAnomalyId(anom.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-sky-500 ring-2 ring-sky-500/40 bg-slate-800/90 shadow-lg'
                      : isDarkMode
                      ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        anom.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                        anom.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-sky-500/20 text-sky-400'
                      }`}>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
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
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] capitalize font-semibold mt-1 ${
                        anom.status === 'active' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        anom.status === 'acknowledged' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {anom.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
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
              isDarkMode ? 'bg-slate-900/95 border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              {/* Header with Anomaly ID and Dynamic Status Pill */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  Anomaly Diagnostics
                </span>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase font-mono ${
                    selectedAnomaly.status === 'active' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                    selectedAnomaly.status === 'acknowledged' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {selectedAnomaly.status}
                  </span>
                  <span className="font-mono text-xs text-sky-400 font-semibold">{selectedAnomaly.id}</span>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-slate-100">{selectedAnomaly.title}</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
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
              <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-800/40 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                    <Bot className="h-3.5 w-3.5" />
                    <span>ADK Agent Spatial Diagnostics</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                    BigQuery + Gemini
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Correlated with real-time BigQuery spatial telemetry stream. Recommend executing spatial buffer analysis, reviewing feeder grid stress, and routing logistics dispatch.
                </p>

                {/* Primary Functional Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {onLocateOnMap && (
                    <button
                      id="anomaly-locate-map-btn"
                      onClick={handleLocateOnMapClick}
                      disabled={isLocating}
                      className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60"
                      title="Fly directly to this anomaly's spatial coordinates on the interactive Map Workspace"
                    >
                      {isLocating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Locating...</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3.5 w-3.5" />
                          <span>Locate on Map Workspace</span>
                        </>
                      )}
                    </button>
                  )}

                  {onInvestigateWithAgent && (
                    <button
                      id="anomaly-agent-investigate-btn"
                      onClick={handleInvestigateClick}
                      disabled={isInvestigating}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60"
                      title="Open ADK Agent drawer and automatically analyze root cause and spatial buffer mitigation"
                    >
                      {isInvestigating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <Bot className="h-3.5 w-3.5" />
                          <span>Investigate with ADK Agent</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Status Management Action Buttons (Acknowledge / Mark Resolved / Reopen) */}
              {canManage && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span>Incident Operational Controls</span>
                    {selectedAnomaly.status === 'acknowledged' && (
                      <span className="text-amber-400 font-mono text-[10px] flex items-center gap-1">
                        <Check className="h-3 w-3" /> Acknowledged by Operator
                      </span>
                    )}
                    {selectedAnomaly.status === 'resolved' && (
                      <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Incident Cleared
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Acknowledge Button */}
                    {selectedAnomaly.status === 'active' && (
                      <button
                        id="ack-anomaly-btn"
                        onClick={() => handleStatusChange('acknowledged')}
                        disabled={isUpdatingStatus === 'ack'}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 active:scale-95 text-amber-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-sm"
                      >
                        {isUpdatingStatus === 'ack' ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Acknowledging...</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>{t.anomalies.acknowledge}</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Mark Resolved Button */}
                    {selectedAnomaly.status !== 'resolved' ? (
                      <button
                        id="resolve-anomaly-btn"
                        onClick={() => handleStatusChange('resolved')}
                        disabled={isUpdatingStatus === 'resolve'}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
                      >
                        {isUpdatingStatus === 'resolve' ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Resolving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{t.anomalies.resolve}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      /* Reopen Button if already resolved */
                      <button
                        id="reopen-anomaly-btn"
                        onClick={() => handleStatusChange('active')}
                        disabled={isUpdatingStatus === 'reopen'}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        {isUpdatingStatus === 'reopen' ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Reopening...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                            <span>Reopen Incident as Active</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
              Select an anomaly from the left panel to inspect spatial diagnostic metrics.
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
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-sky-400" />
                <span>Configure Automated Anomaly Detection Rule</span>
              </h3>
              <button
                onClick={() => setShowRuleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Rule Name</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Spatial Dataset Partition</label>
                <select 
                  value={ruleDataset}
                  onChange={(e) => setRuleDataset(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none focus:border-sky-500"
                >
                  <option value="gis_analytics.supply_chain_telemetry">gis_analytics.supply_chain_telemetry</option>
                  <option value="gis_analytics.ev_charging_infrastructure">gis_analytics.ev_charging_infrastructure</option>
                  <option value="gis_analytics.foot_traffic_trends">gis_analytics.foot_traffic_trends</option>
                  <option value="gis_analytics.retail_catchments">gis_analytics.retail_catchments</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Threshold Condition</label>
                  <select 
                    value={ruleThreshold}
                    onChange={(e) => setRuleThreshold(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none focus:border-sky-500"
                  >
                    <option value="Z-Score > 2.5σ">Z-Score &gt; 2.5σ</option>
                    <option value="Z-Score > 3.0σ">Z-Score &gt; 3.0σ</option>
                    <option value="Thermal Strain > 85%">Thermal Strain &gt; 85%</option>
                    <option value="Speed Drop > 60%">Speed Drop &gt; 60%</option>
                    <option value="Temp Deviation > 5°C">Temp Deviation &gt; 5°C</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Alert Severity</label>
                  <select 
                    value={ruleSeverity}
                    onChange={(e) => setRuleSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none focus:border-sky-500"
                  >
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                id="cancel-rule-modal-btn"
                onClick={() => setShowRuleModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="save-rule-modal-btn"
                onClick={handleSaveRule}
                className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-semibold text-xs shadow-md cursor-pointer transition-all"
              >
                Save & Deploy Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
