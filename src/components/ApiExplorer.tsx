import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Server, 
  Database, 
  Layers, 
  Code,
  Globe,
  Key,
  ChevronRight
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n';

interface ApiExplorerProps {
  language: LanguageCode;
  isDarkMode: boolean;
}

export const ApiExplorer: React.FC<ApiExplorerProps> = ({
  language,
  isDarkMode,
}) => {
  const t = translations[language];

  const endpoints = [
    {
      id: 'mcp-bq',
      name: 'MCP BigQuery Spatial Execute',
      method: 'POST',
      url: '/api/mcp/execute',
      server: 'bigquery-spatial-mcp',
      tool: 'execute_spatial_query',
      defaultPayload: JSON.stringify({
        serverName: 'bigquery-spatial-mcp',
        toolName: 'execute_spatial_query',
        arguments: {
          query: 'SELECT point_id, ST_GeogPoint(lng, lat) as geom, category, value FROM `gis_analytics.nyc_mobility_flows` WHERE status = "anomaly" LIMIT 10',
          useLegacySql: false
        }
      }, null, 2)
    },
    {
      id: 'mcp-maps',
      name: 'MCP Google Maps Isochrone',
      method: 'POST',
      url: '/api/mcp/execute',
      server: 'google-maps-mcp',
      tool: 'compute_isochrone',
      defaultPayload: JSON.stringify({
        serverName: 'google-maps-mcp',
        toolName: 'compute_isochrone',
        arguments: {
          center: [40.7549, -73.9840],
          travelTimeMinutes: 15,
          mode: 'driving'
        }
      }, null, 2)
    },
    {
      id: 'agent-chat',
      name: 'ADK Agent Spatial Reasoning',
      method: 'POST',
      url: '/api/agent/chat',
      server: 'adk-agent-core',
      tool: 'chat',
      defaultPayload: JSON.stringify({
        message: 'Analyze EV charging station load vs power grid stress in midtown Manhattan',
        tenantId: 'tenant-acme',
        userRole: 'super_admin'
      }, null, 2)
    },
    {
      id: 'anomalies-list',
      name: 'Fetch Real-Time Anomalies',
      method: 'GET',
      url: '/api/anomalies',
      server: 'anomaly-engine',
      tool: 'list',
      defaultPayload: ''
    }
  ];

  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0]);
  const [requestBody, setRequestBody] = useState(selectedEndpoint.defaultPayload);
  const [responseOutput, setResponseOutput] = useState<string>('// Click "Send Request" to invoke endpoint...');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectEndpoint = (ep: typeof endpoints[0]) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.defaultPayload);
    setResponseOutput('// Click "Send Request" to invoke endpoint...');
  };

  const handleExecute = async () => {
    setIsLoading(true);
    try {
      let res;
      if (selectedEndpoint.method === 'GET') {
        res = await fetch(selectedEndpoint.url);
      } else {
        res = await fetch(selectedEndpoint.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody
        });
      }
      const data = await res.json();
      setResponseOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const curlCommand = selectedEndpoint.method === 'GET'
    ? `curl -X GET "${window.location.origin}${selectedEndpoint.url}"`
    : `curl -X POST "${window.location.origin}${selectedEndpoint.url}" \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBody.replace(/'/g, "'\\''")}'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto space-y-6 ${
      isDarkMode ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Terminal className="h-6 w-6 text-sky-400" />
            <span>{t.tabs.apiExplorer}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Model Context Protocol (MCP) Server Testbed • REST API Console • Microservice Hooks
          </p>
        </div>

        <button
          onClick={copyCurl}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>Copy cURL Command</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Endpoint Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Available Endpoints & MCP Tools
          </span>
          {endpoints.map(ep => {
            const isSelected = selectedEndpoint.id === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => handleSelectEndpoint(ep)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 shadow-md ring-1 ring-sky-500/30'
                    : isDarkMode
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{ep.name}</span>
                  <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold ${
                    ep.method === 'POST' ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {ep.method}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">{ep.url}</div>
                <div className="text-[10px] text-indigo-400 font-mono mt-1">
                  MCP Server: {ep.server}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Request & Response Workbench (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Request Header */}
          <div className={`p-4 rounded-2xl border shadow-sm space-y-3 ${
            isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className={`px-2 py-0.5 rounded font-bold ${
                  selectedEndpoint.method === 'POST' ? 'bg-sky-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {selectedEndpoint.method}
                </span>
                <span className="text-slate-200 font-bold">{selectedEndpoint.url}</span>
              </div>

              <button
                id="api-execute-btn"
                onClick={handleExecute}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isLoading ? 'Executing...' : 'Send Request'}</span>
              </button>
            </div>

            {selectedEndpoint.method === 'POST' && (
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-mono">JSON Body Payload:</label>
                <textarea
                  value={requestBody}
                  onChange={e => setRequestBody(e.target.value)}
                  rows={6}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-sky-300 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            )}
          </div>

          {/* Response Block */}
          <div className={`p-4 rounded-2xl border shadow-sm space-y-2 ${
            isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Response Output:</span>
              <span className="text-emerald-400">HTTP 200 OK</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-80 whitespace-pre-wrap">
              <code>{responseOutput}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
