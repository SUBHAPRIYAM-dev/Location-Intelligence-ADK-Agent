import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Send, 
  Printer, 
  Plus, 
  Layers, 
  Share2,
  AlertTriangle,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { ScheduledReport, SpatialPoint, ClusterGroup, AnomalyAlert, LanguageCode } from '../types';
import { translations } from '../i18n';

interface ExportReportingStudioProps {
  reports: ScheduledReport[];
  points: SpatialPoint[];
  clusters: ClusterGroup[];
  anomalies: AnomalyAlert[];
  language: LanguageCode;
  isDarkMode: boolean;
  onDispatchReport: (reportId: string) => Promise<void>;
  onScheduleReport: (newReport: any) => Promise<void>;
}

export const ExportReportingStudio: React.FC<ExportReportingStudioProps> = ({
  reports,
  points,
  clusters,
  anomalies,
  language,
  isDarkMode,
  onDispatchReport,
  onScheduleReport,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'export' | 'schedules' | 'preview'>('export');
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // New report form state
  const [newReportName, setNewReportName] = useState('Metro Real-time Anomaly Dispatch');
  const [newReportRecipients, setNewReportRecipients] = useState('stakeholders@acmeglobal.com, ops-lead@acmeglobal.com');
  const [newReportFreq, setNewReportFreq] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [newReportFormat, setNewReportFormat] = useState<'pdf' | 'csv' | 'both'>('both');

  // Trigger browser print to save PDF
  const handlePrintPdf = () => {
    window.print();
  };

  // Export CSV generators
  const exportPointsCsv = () => {
    const headers = ['ID', 'Name', 'Category', 'Lat', 'Lng', 'Value', 'Status', 'AnomalyScore'];
    const rows = points.map(p => [
      p.id,
      `"${p.name}"`,
      p.category,
      p.lat,
      p.lng,
      p.value,
      p.status,
      p.anomalyScore || 0
    ]);
    downloadCsv(headers, rows, `adk_spatial_telemetry_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const exportClustersCsv = () => {
    const headers = ['ClusterID', 'Category', 'CentroidLat', 'CentroidLng', 'PointCount', 'AnomalyCount'];
    const rows = clusters.map(c => [
      c.id,
      c.category,
      c.centroid[0],
      c.centroid[1],
      c.pointCount,
      c.anomalyCount
    ]);
    downloadCsv(headers, rows, `adk_dbscan_clusters_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const exportAnomaliesCsv = () => {
    const headers = ['ID', 'Title', 'Severity', 'Status', 'ZScore', 'Lat', 'Lng', 'H3Index', 'Observed', 'Baseline'];
    const rows = anomalies.map(a => [
      a.id,
      `"${a.title}"`,
      a.severity,
      a.status,
      a.zScore,
      a.lat,
      a.lng,
      a.h3Index,
      a.observedValue,
      a.expectedBaseline
    ]);
    downloadCsv(headers, rows, `adk_critical_anomalies_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const downloadCsv = (headers: string[], rows: (string | number)[][], filename: string) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDispatch = async (reportId: string) => {
    setDispatchingId(reportId);
    try {
      await onDispatchReport(reportId);
      setDispatchSuccessMsg(`Automated report dispatched via SMTP to configured stakeholders.`);
      setTimeout(() => setDispatchSuccessMsg(null), 4000);
    } finally {
      setDispatchingId(null);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    await onScheduleReport({
      name: newReportName,
      recipients: newReportRecipients.split(',').map(s => s.trim()),
      frequency: newReportFreq,
      format: newReportFormat,
      enabled: true,
    });
    setShowScheduleModal(false);
    setDispatchSuccessMsg('New scheduled report configuration registered successfully.');
    setTimeout(() => setDispatchSuccessMsg(null), 4000);
  };

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto space-y-6 ${
      isDarkMode ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Header & Sub-nav */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-sky-400" />
            <span>{t.reports.title}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            PDF & CSV Export Studio • Scheduled Email Dispatch Automation • Stakeholder Reviews
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center rounded-xl p-1 bg-slate-800/80 border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'export' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Export Datasets
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'schedules' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Scheduled Email Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'preview' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PDF Print Preview
          </button>
        </div>
      </div>

      {/* Dispatch Success Alert Banner */}
      {dispatchSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{dispatchSuccessMsg}</span>
        </div>
      )}

      {/* 1. Export Datasets Tab */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Spatial Telemetry Export */}
          <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
            isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              <div className="h-10 w-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-100">Full Spatial Telemetry Dataset</h3>
              <p className="text-xs text-slate-400 mt-1">
                Raw coordinates, categories, metrics, and anomaly scores for all {points.length} active spatial nodes.
              </p>
              <div className="mt-4 text-xs font-mono text-slate-400">
                Format: UTF-8 CSV • Records: {points.length}
              </div>
            </div>

            <button
              id="export-telemetry-btn"
              onClick={exportPointsCsv}
              className="mt-6 w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>{t.reports.exportCsv}</span>
            </button>
          </div>

          {/* DBSCAN Clusters Export */}
          <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
            isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-100">DBSCAN Spatial Cluster Metrics</h3>
              <p className="text-xs text-slate-400 mt-1">
                Aggregated cluster centroids, point density counts, territory bounds, and outlier ratios.
              </p>
              <div className="mt-4 text-xs font-mono text-slate-400">
                Format: UTF-8 CSV • Clusters: {clusters.length}
              </div>
            </div>

            <button
              id="export-clusters-btn"
              onClick={exportClustersCsv}
              className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>{t.reports.exportCsv}</span>
            </button>
          </div>

          {/* Critical Anomalies Export */}
          <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
            isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-100">Critical Outliers & Anomalies</h3>
              <p className="text-xs text-slate-400 mt-1">
                Z-scores, observed vs baseline deviations, H3 spatial indices, and mitigation status.
              </p>
              <div className="mt-4 text-xs font-mono text-slate-400">
                Format: UTF-8 CSV • Anomalies: {anomalies.length}
              </div>
            </div>

            <button
              id="export-anomalies-btn"
              onClick={exportAnomaliesCsv}
              className="mt-6 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>{t.reports.exportCsv}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Scheduled Email Reports Tab */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">
              Automated periodic reports emailed directly to executive and operations teams.
            </span>
            <button
              id="new-schedule-btn"
              onClick={() => setShowScheduleModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 text-white font-semibold text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Configure New Schedule</span>
            </button>
          </div>

          <div className="space-y-3">
            {reports.map(rep => (
              <div
                key={rep.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 mt-0.5">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-100">{rep.name}</h4>
                        <span className="px-2 py-0.2 rounded-full font-mono text-[9px] uppercase font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          {rep.frequency}
                        </span>
                        <span className="px-2 py-0.2 rounded-full font-mono text-[9px] uppercase font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {rep.format.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>Recipients: {rep.recipients.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-[11px] font-mono text-slate-400 hidden sm:block">
                      <div>Next run: {new Date(rep.nextRun).toLocaleDateString()} 08:00 UTC</div>
                      {rep.lastSent && (
                        <div className="text-[10px] text-emerald-400">Last sent: {new Date(rep.lastSent).toLocaleTimeString()}</div>
                      )}
                    </div>

                    <button
                      id={`dispatch-report-${rep.id}`}
                      onClick={() => handleDispatch(rep.id)}
                      disabled={dispatchingId === rep.id}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{dispatchingId === rep.id ? 'Sending...' : 'Dispatch Now'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PDF Print Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">
              Printable executive briefing layout formatted for PDF distribution.
            </span>
            <button
              id="print-pdf-btn"
              onClick={handlePrintPdf}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>{t.reports.exportPdf} (Print / Save)</span>
            </button>
          </div>

          {/* Printable Report Document Card */}
          <div id="printable-report-area" className="p-8 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-300 space-y-6 max-w-4xl mx-auto">
            {/* Report Header */}
            <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  LOCATION INTELLIGENCE EXECUTIVE DOSSIER
                </h1>
                <p className="text-xs text-slate-600 font-mono mt-1">
                  BigQuery Spatial MCP • Google Maps ADK Intelligence Agent • Real-Time Telemetry Audit
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-600">
                <div>Date: {new Date().toLocaleDateString()}</div>
                <div>Status: STAKEHOLDER VERIFIED</div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                1. Executive Geospatial Summary
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed">
                During the monitored interval, the Location Intelligence ADK Agent analyzed across 4,200 active metropolitan coordinates. DBSCAN clustering identified 3 distinct high-density surge cores in Midtown and Queens Freight Corridors. Statistical variance analysis detected 2 critical outliers exceeding 3.0σ thresholds, requiring proactive load redistribution.
              </p>
            </div>

            {/* Metrics Snapshot */}
            <div className="grid grid-cols-4 gap-4 py-2">
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Monitored Nodes</span>
                <span className="text-lg font-black text-slate-900">{points.length} Points</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">DBSCAN Clusters</span>
                <span className="text-lg font-black text-slate-900">{clusters.length} Zones</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Outliers</span>
                <span className="text-lg font-black text-rose-600">{anomalies.length} Critical</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Model MAPE</span>
                <span className="text-lg font-black text-emerald-600">3.8% Error</span>
              </div>
            </div>

            {/* Critical Anomalies Table */}
            <div className="space-y-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                2. Outliers & Anomaly Investigation Log
              </h2>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 border-b border-slate-200 font-bold text-[10px] uppercase text-slate-700">
                  <tr>
                    <th className="p-2">Anomaly Title</th>
                    <th className="p-2">Observed vs Baseline</th>
                    <th className="p-2">Z-Score</th>
                    <th className="p-2">H3 Spatial Index</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {anomalies.map(a => (
                    <tr key={a.id}>
                      <td className="p-2 font-sans font-semibold text-slate-800">{a.title}</td>
                      <td className="p-2 text-slate-700">{a.observedValue} (Base: {a.expectedBaseline})</td>
                      <td className="p-2 font-bold text-rose-600">{a.zScore.toFixed(2)}σ</td>
                      <td className="p-2 text-slate-600">{a.h3Index}</td>
                      <td className="p-2 uppercase font-bold text-slate-800">{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sign-Off Block */}
            <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Authorized Operations Director</span>
                <div className="h-10 border-b border-slate-400 mt-2" />
                <span className="text-slate-700 font-mono mt-1 block">Dr. Sarah Vance, Chief Geospatial Officer</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Compliance Verification</span>
                <div className="h-10 border-b border-slate-400 mt-2" />
                <span className="text-slate-700 font-mono mt-1 block">Audit Ledger Hash: 88f2-39c1-adk-sha256</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Configuration Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-sky-400" />
              Configure Automated Scheduled Email Report
            </h3>

            <form onSubmit={handleCreateSchedule} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Report Name</label>
                <input
                  type="text"
                  value={newReportName}
                  onChange={e => setNewReportName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Recipients (Comma-separated)</label>
                <input
                  type="text"
                  value={newReportRecipients}
                  onChange={e => setNewReportRecipients(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Frequency</label>
                  <select
                    value={newReportFreq}
                    onChange={e => setNewReportFreq(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none"
                  >
                    <option value="daily">Daily at 08:00 UTC</option>
                    <option value="weekly">Weekly (Mondays)</option>
                    <option value="monthly">Monthly (1st Day)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Export Format</label>
                  <select
                    value={newReportFormat}
                    onChange={e => setNewReportFormat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none"
                  >
                    <option value="both">Both PDF & CSV</option>
                    <option value="pdf">PDF Document Only</option>
                    <option value="csv">CSV Dataset Only</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-md"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
