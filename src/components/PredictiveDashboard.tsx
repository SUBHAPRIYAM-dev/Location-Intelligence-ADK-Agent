import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sliders, 
  Activity, 
  Clock, 
  ShieldAlert, 
  Zap, 
  Cpu, 
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { PREDICTIVE_SERIES_DATA } from '../data/mockGeospatialData';
import { LanguageCode } from '../types';
import { translations } from '../i18n';

interface PredictiveDashboardProps {
  language: LanguageCode;
  isDarkMode: boolean;
}

export const PredictiveDashboard: React.FC<PredictiveDashboardProps> = ({
  language,
  isDarkMode,
}) => {
  const t = translations[language];
  const [horizon, setHorizon] = useState<'6h' | '12h' | '24h' | '7d'>('12h');
  const [sigmaThreshold, setSigmaThreshold] = useState<number>(2.5);
  const [capacityHeadroom, setCapacityHeadroom] = useState<number>(15);

  const clusterDistributionData = [
    { hour: '00:00', midtown: 1, downtown: 0, queens: 0 },
    { hour: '04:00', midtown: 0, downtown: 0, queens: 0 },
    { hour: '08:00', midtown: 3, downtown: 1, queens: 2 },
    { hour: '12:00', midtown: 4, downtown: 2, queens: 3 },
    { hour: '16:00', midtown: 5, downtown: 3, queens: 4 },
    { hour: '20:00', midtown: 3, downtown: 1, queens: 1 },
  ];

  const dispersionData = [
    { zone: 'Midtown Core', variance: 84, dispersionIndex: 0.82, status: 'High' },
    { zone: 'Downtown Financial', variance: 45, dispersionIndex: 0.48, status: 'Moderate' },
    { zone: 'Queens Logistics Depot', variance: 92, dispersionIndex: 0.89, status: 'Severe' },
    { zone: 'Brooklyn Industrial', variance: 38, dispersionIndex: 0.36, status: 'Normal' },
  ];

  const gridStroke = isDarkMode ? '#334155' : '#e2e8f0';
  const textFill = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto space-y-6 ${
      isDarkMode ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-sky-400" />
            <span>{t.tabs.predictiveDashboard}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Spatial Demand vs Capacity Projections • DBSCAN Density Forecasting • BigQuery ML GIS Regression
          </p>
        </div>

        {/* Horizon Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Horizon:</span>
          <div className="flex items-center rounded-xl p-1 bg-slate-800/80 border border-slate-700">
            {(['6h', '12h', '24h', '7d'] as const).map(hz => (
              <button
                key={hz}
                onClick={() => setHorizon(hz)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                  horizon === hz
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {hz}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border shadow-sm ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Projected Peak Demand</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">980 kW</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-rose-400 font-bold">+12.4%</span> above baseline at 18:00 EST
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Forecast Accuracy (MAPE)</span>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">96.2%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Spatial regression error ±3.8%
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Outlier Spurt Probability</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">78.5%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Queens & Midtown East sectors
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Spatial Dispersion Index</span>
            <Activity className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-sky-400 font-mono">0.74</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Moderate clustering concentration
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spatial Demand vs Predictive Capacity Chart */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border shadow-sm ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-200">
                Spatial Demand vs Predictive Capacity Band
              </h3>
              <p className="text-[11px] text-slate-400">
                Historical observation, forecasted trend, and 95% confidence intervals
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
              <span>BigQuery ML Prophet</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PREDICTIVE_SERIES_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="time" stroke={textFill} fontSize={11} />
                <YAxis stroke={textFill} fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                    borderColor: isDarkMode ? '#334155' : '#cbd5e1', 
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: isDarkMode ? '#f8fafc' : '#0f172a'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="upperBound" stroke="none" fill="url(#bandGrad)" name="Upper Band (95% CI)" />
                <Area type="monotone" dataKey="forecastDemand" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#forecastGrad)" name="Forecast Demand" />
                <Line type="monotone" dataKey="historicalDemand" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Historical Observed" />
                <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#00000000" name="Lower Band" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Parameter Controls */}
        <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sliders className="h-4 w-4 text-sky-400" />
              <h3 className="font-bold text-sm">Model Tuning Parameters</h3>
            </div>

            {/* Sigma Threshold Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Anomaly Sigma Threshold</span>
                <span className="font-mono text-sky-400 font-bold">{sigmaThreshold.toFixed(1)}σ</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="3.5"
                step="0.1"
                value={sigmaThreshold}
                onChange={e => setSigmaThreshold(parseFloat(e.target.value))}
                className="w-full accent-sky-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Higher values reduce false positives; lower values increase anomaly sensitivity.
              </span>
            </div>

            {/* Capacity Headroom Cushion */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Capacity Headroom Buffer</span>
                <span className="font-mono text-amber-400 font-bold">{capacityHeadroom}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={capacityHeadroom}
                onChange={e => setCapacityHeadroom(parseInt(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Trigger alerts when demand breaches threshold minus headroom buffer.
              </span>
            </div>

            {/* Spatial Partition Summary */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-1.5">
              <span className="font-bold text-slate-300 block text-[11px]">BigQuery ML Model Stats</span>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">Model:</span>
                <span className="text-sky-400">ARIMA_PLUS_XREG</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">Features:</span>
                <span className="text-slate-200">H3_Cell, Temp, DayOfWeek</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">AIC Score:</span>
                <span className="text-emerald-400">1,418.2</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Last re-trained: Today, 04:00 UTC
          </div>
        </div>
      </div>

      {/* Secondary Charts: Hourly Outlier Distribution by Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-5 rounded-2xl border shadow-sm ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="font-bold text-sm text-slate-200 mb-1">
            Hourly Outlier Frequency by Spatial Cluster
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">
            Breakdown of detected anomalies across geographic zones
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clusterDistributionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="hour" stroke={textFill} fontSize={11} />
                <YAxis stroke={textFill} fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                    borderColor: isDarkMode ? '#334155' : '#cbd5e1', 
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: isDarkMode ? '#f8fafc' : '#0f172a'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="midtown" fill="#f43f5e" name="Midtown Core" radius={[4, 4, 0, 0]} />
                <Bar dataKey="downtown" fill="#38bdf8" name="Downtown" radius={[4, 4, 0, 0]} />
                <Bar dataKey="queens" fill="#f59e0b" name="Queens Depot" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spatial Dispersion Index Table */}
        <div className={`p-5 rounded-2xl border shadow-sm ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="font-bold text-sm text-slate-200 mb-1">
            Geographic Spatial Dispersion & Variance Matrix
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">
            Zone spatial variance and DBSCAN density clustering risk ratings
          </p>

          <div className="space-y-2.5">
            {dispersionData.map((d, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{d.zone}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Variance: {d.variance} kW² • Dispersion: {d.dispersionIndex}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                  d.status === 'Severe' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  d.status === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {d.status} Risk
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
