import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Server, 
  Activity, 
  Zap, 
  Truck, 
  Users, 
  AlertTriangle, 
  Clock, 
  Database, 
  CheckCircle2, 
  Sliders, 
  RefreshCw,
  Gauge
} from 'lucide-react';
import { DashboardWidget, LanguageCode } from '../types';
import { translations } from '../i18n';

interface CustomDashboardWidgetsProps {
  language: LanguageCode;
  isDarkMode: boolean;
}

export const CustomDashboardWidgets: React.FC<CustomDashboardWidgetsProps> = ({
  language,
  isDarkMode,
}) => {
  const t = translations[language];

  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: 'w-1', title: 'BigQuery & Maps MCP Health', type: 'mcp_health', isVisible: true, position: 0 },
    { id: 'w-2', title: 'Live Spatial Telemetry Stream', type: 'telemetry_stream', isVisible: true, position: 1 },
    { id: 'w-3', title: 'Critical Outlier Z-Score Radar', type: 'anomaly_radar', isVisible: true, position: 2 },
    { id: 'w-4', title: 'Spatial Demand & Forecast Variance', type: 'predictive_gauge', isVisible: true, position: 3 },
    { id: 'w-5', title: 'Fleet Freight Real-time Transit', type: 'telemetry_stream', isVisible: true, position: 4 },
    { id: 'w-6', title: 'BigQuery GIS Spatial Query IO', type: 'mcp_health', isVisible: true, position: 5 },
  ]);

  const [refreshInterval, setRefreshInterval] = useState<number>(3);

  const toggleWidget = (id: string) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, isVisible: !w.isVisible } : w));
  };

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto space-y-6 ${
      isDarkMode ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Header & Customization Studio Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-sky-400" />
            <span>{t.tabs.dashboardStudio}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Modular KPI Cards • MCP Engine Status • Real-Time Spatial Gauges
          </p>
        </div>

        {/* Refresh Rate & Widget Toggles */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5 text-slate-400 animate-spin-slow" />
            <span className="text-slate-400">Rate:</span>
            <select
              value={refreshInterval}
              onChange={e => setRefreshInterval(Number(e.target.value))}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 outline-none"
            >
              <option value={1}>1s Live</option>
              <option value={3}>3s Polling</option>
              <option value={10}>10s Relaxed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Widget Customizer Strip */}
      <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
          <Sliders className="h-3.5 w-3.5" />
          Toggle Widgets:
        </span>
        {widgets.map(w => (
          <button
            key={w.id}
            onClick={() => toggleWidget(w.id)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              w.isVisible
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
            }`}
          >
            {w.title} {w.isVisible ? '✓' : '+'}
          </button>
        ))}
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Widget 1: MCP Server Health */}
        {widgets.find(w => w.id === 'w-1')?.isVisible && (
          <div className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
            isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-emerald-400" />
                <h4 className="font-bold text-xs text-slate-200">MCP Servers Protocol Health</h4>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">bigquery-spatial-mcp</div>
                  <div className="text-[10px] text-slate-400">Tools: execute_spatial_query, run_dbscan</div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold">ONLINE</span>
                  <div className="text-[10px] text-slate-400">14ms latency</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">google-maps-mcp</div>
                  <div className="text-[10px] text-slate-400">Tools: compute_isochrone, snap_to_roads</div>
                </div>
                <div className="text-right">
                  <span className="text-sky-400 font-bold">ONLINE</span>
                  <div className="text-[10px] text-slate-400">38ms latency</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Widget 2: Live Spatial Telemetry Stream */}
        {widgets.find(w => w.id === 'w-2')?.isVisible && (
          <div className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
            isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-sky-400" />
                <h4 className="font-bold text-xs text-slate-200">Live Spatial Telemetry Feed</h4>
              </div>
              <span className="text-[10px] font-mono text-sky-400">12.4 msg/s</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {[
                { time: '14:24:02', id: 'EV-302', val: '482 kW', loc: 'Midtown Hub', status: 'Optimal' },
                { time: '14:24:01', id: 'TRUCK-104', val: '42 mph', loc: 'I-278 Corridor', status: 'In-Transit' },
                { time: '14:23:59', id: 'GRID-09', val: '94.2°C', loc: 'Substation B', status: 'High Temp' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px]">
                  <span className="text-slate-400">{item.time}</span>
                  <span className="font-semibold text-slate-200">{item.id}</span>
                  <span className="text-sky-400">{item.val}</span>
                  <span className="text-slate-400 text-[10px] truncate max-w-[80px]">{item.loc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Widget 3: Critical Outlier Z-Score Radar */}
        {widgets.find(w => w.id === 'w-3')?.isVisible && (
          <div className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
            isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <h4 className="font-bold text-xs text-slate-200">Outlier Z-Score Radar</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">
                Active: 3
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">Substation Thermal Surge</span>
                  <span className="text-rose-400 font-bold">3.84σ</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">Cold-Chain Temperature Breach</span>
                  <span className="text-rose-400 font-bold">3.12σ</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">Pedestrian Flash Surge</span>
                  <span className="text-amber-400 font-bold">2.45σ</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: '62%' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Widget 4: Spatial Demand & Forecast Variance */}
        {widgets.find(w => w.id === 'w-4')?.isVisible && (
          <div className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
            isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-amber-400" />
                <h4 className="font-bold text-xs text-slate-200">Grid Load Headroom Gauge</h4>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">84.6%</span>
            </div>

            <div className="flex items-center justify-center py-2">
              <div className="relative w-36 h-36 rounded-full border-8 border-slate-800 border-t-amber-400 border-r-amber-400 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-amber-400 font-mono">84%</span>
                <span className="text-[10px] text-slate-400">Strain Level</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center font-mono">
              Safe operating ceiling: 90.0%
            </div>
          </div>
        )}

        {/* Widget 5: Fleet Freight Real-Time Transit */}
        {widgets.find(w => w.id === 'w-5')?.isVisible && (
          <div className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
            isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-indigo-400" />
                <h4 className="font-bold text-xs text-slate-200">Fleet Dispatch Spatial Health</h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">38 Active</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">On-Time Rate</span>
                <span className="text-lg font-bold text-emerald-400">97.4%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Route Delay</span>
                <span className="text-lg font-bold text-amber-400">+4.2m</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/30 border border-slate-800 text-[11px] text-slate-300">
              Google Maps Routes MCP active for real-time corridor congestion avoidance.
            </div>
          </div>
        )}

        {/* Widget 6: BigQuery GIS Query Throughput */}
        {widgets.find(w => w.id === 'w-6')?.isVisible && (
          <div className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
            isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <h4 className="font-bold text-xs text-slate-200">BigQuery GIS Query Engine</h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Slot Avg: 18</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Data Scanned (Last 1h):</span>
                <span className="text-slate-200 font-bold">14.8 GB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Spatial Partitions Read:</span>
                <span className="text-slate-200 font-bold">96 Partitions</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Avg Spatial Latency:</span>
                <span className="text-emerald-400 font-bold">124 ms</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
