import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Terminal, 
  Layers, 
  Database, 
  Copy, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  Cpu, 
  Code, 
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { AgentMessage, UserRole, LanguageCode } from '../types';
import { translations } from '../i18n';

interface AgentPanelProps {
  messages: AgentMessage[];
  onSendMessage: (query: string) => Promise<void>;
  isLoading: boolean;
  userRole: UserRole;
  language: LanguageCode;
  isDarkMode: boolean;
  onApplySpatialAction?: (action: any) => void;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({
  messages,
  onSendMessage,
  isLoading,
  userRole,
  language,
  isDarkMode,
  onApplySpatialAction,
}) => {
  const t = translations[language];
  const [inputQuery, setInputQuery] = useState('');
  const [copiedSqlId, setCopiedSqlId] = useState<string | null>(null);

  const canExecute = userRole !== 'viewer';

  const suggestedScenarios = [
    {
      title: 'EV Charging Grid Stress',
      prompt: 'Analyze EV charging station demand hotspots vs power grid stress in the metro area',
      icon: '⚡'
    },
    {
      title: 'Logistics Outlier Scan',
      prompt: 'Detect logistics delivery delay anomalies and cold-chain temperature violations in freight corridors',
      icon: '🚚'
    },
    {
      title: 'Pedestrian Density DBSCAN',
      prompt: 'Run DBSCAN spatial clustering on pedestrian foot-traffic surges in transit hubs',
      icon: '👥'
    },
    {
      title: 'Retail Store Cannibalization',
      prompt: 'Identify spatial cannibalization in retail locations and evaluate catchment coverage isochrones',
      icon: '🏬'
    }
  ];

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;
    const query = inputQuery;
    setInputQuery('');
    await onSendMessage(query);
  };

  const handleCopySql = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedSqlId(id);
    setTimeout(() => setCopiedSqlId(null), 2000);
  };

  return (
    <div className={`flex flex-col h-full border-t lg:border-t-0 lg:border-l ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs tracking-tight flex items-center gap-1.5">
              <span>{t.agent.title}</span>
              <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20">
                MCP ADK
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Gemini 3.8 Flash • BigQuery & Maps MCP</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active</span>
        </div>
      </div>

      {/* Suggested Prompt Scenarios */}
      <div className="p-2.5 bg-slate-800/30 border-b border-slate-800/60">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          {t.agent.suggestedPrompts}
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {suggestedScenarios.map((sc, i) => (
            <button
              key={i}
              id={`scenario-btn-${i}`}
              onClick={() => onSendMessage(sc.prompt)}
              disabled={isLoading || !canExecute}
              className={`p-2 rounded-lg text-left text-xs border transition-all flex items-start gap-1.5 ${
                isDarkMode 
                  ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-700 text-slate-200' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
              } disabled:opacity-50`}
            >
              <span className="text-sm">{sc.icon}</span>
              <span className="text-[11px] font-medium leading-tight truncate">{sc.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[92%] rounded-2xl p-3.5 text-xs ${
              msg.sender === 'user'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                : isDarkMode
                ? 'bg-slate-800/80 border border-slate-700/70 text-slate-100'
                : 'bg-slate-100 border border-slate-200 text-slate-800'
            }`}>
              {/* Message Header */}
              <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-white/10">
                <span className="font-bold text-[10px] uppercase tracking-wider opacity-80">
                  {msg.sender === 'user' ? 'Operator' : 'ADK Agent'}
                </span>
                <span className="text-[9px] opacity-60 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message Content */}
              <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>

              {/* Step-by-Step Reasoning & MCP Tool Execution Trace */}
              {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-2">
                  <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                    <Cpu className="h-3 w-3" />
                    <span>{t.agent.reasoningTrace}</span>
                  </div>

                  <div className="space-y-1.5">
                    {msg.reasoningSteps.map((step, sidx) => (
                      <div
                        key={step.id || sidx}
                        className="p-2 rounded-lg bg-black/30 border border-slate-700/40 text-[11px] font-mono text-slate-300"
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-indigo-300 font-semibold mb-0.5">
                          {step.serverName ? (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-900/50 text-indigo-300 border border-indigo-700/40">
                              MCP: {step.serverName} ➔ {step.toolName}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-sky-900/50 text-sky-300 border border-sky-700/40">
                              Cognitive Step {sidx + 1}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 font-sans">{step.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated BigQuery Spatial SQL Block */}
              {msg.sqlQuery && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/60">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                    <div className="flex items-center gap-1">
                      <Database className="h-3 w-3 text-emerald-400" />
                      <span>{t.agent.sqlGenerated}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {msg.sqlExecutionTimeMs && (
                        <span className="font-mono text-[9px] text-slate-400 font-normal">
                          {msg.sqlExecutionTimeMs}ms • {msg.dataPointsAffected} pts
                        </span>
                      )}
                      <button
                        onClick={() => handleCopySql(msg.id, msg.sqlQuery!)}
                        className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                        title="Copy SQL Query"
                      >
                        {copiedSqlId === msg.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  <pre className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-300 overflow-x-auto">
                    <code>{msg.sqlQuery}</code>
                  </pre>
                </div>
              )}

              {/* Actionable Trigger */}
              {msg.spatialAction && onApplySpatialAction && (
                <div className="mt-2.5 pt-2 flex justify-end">
                  <button
                    onClick={() => onApplySpatialAction(msg.spatialAction)}
                    className="flex items-center gap-1 text-[10px] font-bold text-sky-400 hover:text-sky-300 bg-sky-500/10 px-2 py-1 rounded-lg border border-sky-500/20"
                  >
                    <span>Highlight On Map</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-sky-400 animate-pulse">
            <Bot className="h-4 w-4 animate-spin-slow" />
            <span>{t.agent.thinking}</span>
          </div>
        )}
      </div>

      {/* Role Notice if Viewer */}
      {!canExecute && (
        <div className="px-3 py-1.5 bg-amber-500/10 border-t border-amber-500/20 text-amber-400 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>Viewer Role: Read-only access. Switch role to Analyst or Super Admin to execute AI prompts.</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <input
            id="agent-query-input"
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            disabled={isLoading || !canExecute}
            placeholder={canExecute ? t.agent.placeholder : 'Read-only mode active'}
            className={`flex-1 px-3 py-2 rounded-xl text-xs border transition-colors outline-none focus:ring-1 focus:ring-sky-500 ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
            } disabled:opacity-50`}
          />
          <button
            id="agent-send-btn"
            type="submit"
            disabled={isLoading || !inputQuery.trim() || !canExecute}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-sky-500/20 disabled:opacity-50 flex items-center gap-1.5 transition-all"
          >
            <span>{t.agent.send}</span>
            <Send className="h-3 w-3" />
          </button>
        </div>
      </form>
    </div>
  );
};
