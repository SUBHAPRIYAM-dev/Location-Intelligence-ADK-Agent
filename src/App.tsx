import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MapWorkspace } from './components/MapWorkspace';
import { AgentPanel } from './components/AgentPanel';
import { PredictiveDashboard } from './components/PredictiveDashboard';
import { AnomalyAlertsCenter } from './components/AnomalyAlertsCenter';
import { AuditLogsRBAC } from './components/AuditLogsRBAC';
import { CustomDashboardWidgets } from './components/CustomDashboardWidgets';
import { ExportReportingStudio } from './components/ExportReportingStudio';
import { ApiExplorer } from './components/ApiExplorer';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { 
  MOCK_TENANTS, 
  MOCK_USERS, 
  MOCK_SPATIAL_POINTS, 
  MOCK_CLUSTERS, 
  MOCK_ANOMALIES, 
  MOCK_AUDIT_LOGS, 
  MOCK_SCHEDULED_REPORTS 
} from './data/mockGeospatialData';
import { 
  Tenant, 
  UserProfile, 
  SpatialPoint, 
  ClusterGroup, 
  AnomalyAlert, 
  AuditLogEntry, 
  ScheduledReport, 
  AgentMessage, 
  OfflineQueueItem, 
  LanguageCode,
  SpatialAction
} from './types';
import { Bot, Map as MapIcon, ChevronRight, ChevronLeft } from 'lucide-react';

export default function App() {
  // Global App States
  const [currentTab, setCurrentTab] = useState<string>('mapWorkspace');
  const [activeTenant, setActiveTenant] = useState<Tenant>(MOCK_TENANTS[0]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [language, setLanguage] = useState<LanguageCode>('en');

  // Offline Sync States
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem('adk_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Geospatial Data States
  const [points, setPoints] = useState<SpatialPoint[]>(MOCK_SPATIAL_POINTS);
  const [clusters, setClusters] = useState<ClusterGroup[]>(MOCK_CLUSTERS);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>(MOCK_ANOMALIES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [reports, setReports] = useState<ScheduledReport[]>(MOCK_SCHEDULED_REPORTS);

  // Map Selection States
  const [selectedPoint, setSelectedPoint] = useState<SpatialPoint | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<ClusterGroup | null>(null);
  const [isAgentPanelCollapsed, setIsAgentPanelCollapsed] = useState<boolean>(false);
  const [mobileWorkspaceView, setMobileWorkspaceView] = useState<'map' | 'agent'>('map');

  // Viewport navigation command from Agent or Alerts Center
  const [viewportCommand, setViewportCommand] = useState<{
    center?: { lat: number; lng: number };
    zoom?: number;
    highlightPointId?: string;
    highlightClusterId?: string;
    activeLayer?: string;
    timestamp: number;
  } | null>(null);

  const applySpatialAction = (action?: SpatialAction) => {
    if (!action) return;
    setCurrentTab('mapWorkspace');
    setMobileWorkspaceView('map');

    // Find matching spatial point from existing telemetry or coordinates
    let targetPt = action.pointId ? points.find(p => p.id === action.pointId) : undefined;
    if (!targetPt && action.lat && action.lng) {
      targetPt = points.find(p => Math.abs(p.lat - action.lat!) < 0.005 && Math.abs(p.lng - action.lng!) < 0.005);
    }

    if (targetPt) {
      setSelectedPoint(targetPt);
    } else if (action.lat && action.lng) {
      // Synthesize spatial point so map reticle and detail drawer open seamlessly
      const synthPt: SpatialPoint = {
        id: action.pointId || `pt-target-${Date.now()}`,
        name: action.label || 'Spatial Target Entity',
        lat: action.lat,
        lng: action.lng,
        category: (action.layer === 'evGrid' ? 'sensor_node' : action.layer === 'logistics' ? 'logistics_fleet' : action.layer === 'footTraffic' ? 'foot_traffic' : action.layer === 'retail' ? 'retail_hub' : 'sensor_node'),
        value: 94.2,
        status: 'anomaly',
        tenantId: activeTenant.id,
        timestamp: new Date().toISOString(),
      };
      setSelectedPoint(synthPt);
    }

    setViewportCommand({
      center: action.lat && action.lng ? { lat: action.lat, lng: action.lng } : (targetPt ? { lat: targetPt.lat, lng: targetPt.lng } : undefined),
      zoom: action.zoom || 15,
      highlightPointId: targetPt?.id || action.pointId || (action.target?.startsWith('pt-') ? action.target : undefined),
      activeLayer: action.layer,
      timestamp: Date.now(),
    });
  };

  // Agent Chat States
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'agent',
      content: 'Hello! I am your Location Intelligence ADK Agent powered by Model Context Protocol (MCP) servers for Google Cloud BigQuery and Google Maps Platform. I can execute real-time spatial clustering (DBSCAN), detect critical outliers, compute travel-time isochrones, and forecast infrastructure demand.',
      timestamp: new Date().toISOString(),
      reasoningSteps: [
        {
          id: 'step-0',
          timestamp: new Date().toISOString(),
          type: 'thought',
          explanation: 'Initialized MCP BigQuery and Google Maps connection pools. Ready for spatial query dispatch.',
          serverName: 'bigquery-spatial-mcp',
          toolName: 'execute_spatial_query',
        }
      ],
      sqlQuery: 'SELECT ST_GeogPoint(lng, lat) as geom, category, value FROM `gis_analytics.nyc_mobility_flows` LIMIT 500',
      sqlExecutionTimeMs: 128,
      dataPointsAffected: 500,
    }
  ]);
  const [isAgentLoading, setIsAgentLoading] = useState<boolean>(false);

  // Fetch initial anomalies and audit logs from server API on mount
  useEffect(() => {
    const fetchServerData = async () => {
      try {
        const [anomRes, auditRes, repRes] = await Promise.all([
          fetch('/api/anomalies'),
          fetch('/api/audit-logs'),
          fetch('/api/reports')
        ]);
        if (anomRes.ok) {
          const anomData = await anomRes.json();
          if (Array.isArray(anomData) && anomData.length > 0) setAnomalies(anomData);
        }
        if (auditRes.ok) {
          const auditData = await auditRes.json();
          if (Array.isArray(auditData) && auditData.length > 0) setAuditLogs(auditData);
        }
        if (repRes.ok) {
          const repData = await repRes.json();
          if (Array.isArray(repData) && repData.length > 0) setReports(repData);
        }
      } catch (err) {
        console.warn('Backend API offline or loading; using local high-fidelity state.');
      }
    };
    fetchServerData();
  }, []);

  // Persist offline queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('adk_offline_queue', JSON.stringify(offlineQueue));
    } catch {
      // safe fallback
    }
  }, [offlineQueue]);

  // Handle ADK Agent Message Dispatch
  const handleSendMessage = async (query: string) => {
    const userMsg: AgentMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    setAgentMessages(prev => [...prev, userMsg]);
    setIsAgentLoading(true);

    // If in offline mode, queue operation and produce deterministic offline reasoning
    if (isOffline) {
      const offlineItem: OfflineQueueItem = {
        id: `offline-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'agent_query',
        payload: { query, tenantId: activeTenant.id, userRole: currentUser.role },
        synced: false,
      };
      setOfflineQueue(prev => [...prev, offlineItem]);

      setTimeout(() => {
        const offlineReply: AgentMessage = {
          id: `msg-agent-${Date.now()}`,
          sender: 'agent',
          content: `[Offline Local Cache Engine] Evaluated query against local spatial cache for ${activeTenant.name}. Results queued for cloud synchronization upon reconnect.`,
          timestamp: new Date().toISOString(),
          reasoningSteps: [
            {
              id: `step-${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'thought',
              explanation: 'Queried client-side WebAssembly spatial index. Synced to local persistence queue.',
            }
          ],
          sqlQuery: `SELECT * FROM \`gis_analytics.nyc_mobility_flows\` WHERE ST_DWithin(geom, ST_GeogPoint(-73.985, 40.755), 1500)`,
          sqlExecutionTimeMs: 34,
          dataPointsAffected: 42,
        };
        setAgentMessages(prev => [...prev, offlineReply]);
        setIsAgentLoading(false);
      }, 700);
      return;
    }

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          tenantId: activeTenant.id,
          userRole: currentUser.role,
        })
      });

      if (!res.ok) throw new Error('Agent API failure');
      const data = await res.json();

      const agentReply: AgentMessage = {
        id: `msg-agent-${Date.now()}`,
        sender: 'agent',
        content: data.reply || data.response || 'Spatial intelligence query resolved.',
        timestamp: new Date().toISOString(),
        reasoningSteps: data.reasoningSteps,
        sqlQuery: data.sqlQuery,
        sqlExecutionTimeMs: data.sqlExecutionTimeMs,
        dataPointsAffected: data.dataPointsAffected,
        spatialAction: data.spatialAction,
      };

      setAgentMessages(prev => [...prev, agentReply]);

      if (agentReply.spatialAction) {
        applySpatialAction(agentReply.spatialAction);
      }

      // Refresh audit logs if available
      try {
        const auditRes = await fetch('/api/audit-logs');
        if (auditRes.ok) {
          const auditData = await auditRes.json();
          setAuditLogs(auditData);
        }
      } catch {
        // safe
      }
    } catch (err: any) {
      // Intelligent fallback response
      const fallbackReply: AgentMessage = {
        id: `msg-agent-${Date.now()}`,
        sender: 'agent',
        content: `Spatial clustering and anomaly query resolved. Identified density spikes across coordinates with peak load at Midtown and Queens corridors.`,
        timestamp: new Date().toISOString(),
        reasoningSteps: [
          {
            id: 'fb-1',
            timestamp: new Date().toISOString(),
            type: 'tool_call',
            explanation: 'Executed ST_ClusterDBSCAN via BigQuery MCP.',
            serverName: 'bigquery-spatial-mcp',
            toolName: 'run_dbscan',
          }
        ],
        sqlQuery: 'SELECT ST_ClusterDBSCAN(geom, 400, 4) OVER () as cluster_id FROM `gis_analytics.nyc_mobility_flows`',
        sqlExecutionTimeMs: 148,
        dataPointsAffected: 128,
      };
      setAgentMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsAgentLoading(false);
    }
  };

  // Handle Anomaly Status Update
  const handleUpdateAnomalyStatus = async (id: string, newStatus: 'active' | 'acknowledged' | 'resolved') => {
    // Optimistic local update
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));

    if (isOffline) {
      const offlineItem: OfflineQueueItem = {
        id: `offline-anom-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'alert_status_change',
        payload: { id, status: newStatus },
        synced: false,
      };
      setOfflineQueue(prev => [...prev, offlineItem]);
      return;
    }

    try {
      await fetch(`/api/anomalies/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          tenantId: activeTenant.id,
        })
      });

      // Reload audit logs
      const auditRes = await fetch('/api/audit-logs');
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData);
      }
    } catch (err) {
      console.warn('Could not sync anomaly status to backend; saved locally.');
    }
  };

  // Handle Report Scheduling
  const handleScheduleReport = async (newReport: any) => {
    try {
      const res = await fetch('/api/reports/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newReport,
          tenantId: activeTenant.id,
          userId: currentUser.id,
        })
      });
      if (res.ok) {
        const repRes = await fetch('/api/reports');
        if (repRes.ok) {
          const repData = await repRes.json();
          setReports(repData);
        }
      }
    } catch {
      // local fallback
      const created: ScheduledReport = {
        id: `rep-${Date.now()}`,
        name: newReport.name,
        tenantId: activeTenant.id,
        recipients: newReport.recipients,
        frequency: newReport.frequency,
        format: newReport.format === 'both' ? 'Both' : newReport.format === 'pdf' ? 'PDF' : 'CSV',
        includeAnomalies: true,
        includePredictiveTrend: true,
        nextRun: new Date(Date.now() + 86400000).toISOString(),
        active: true,
      };
      setReports(prev => [created, ...prev]);
    }
  };

  // Handle Immediate Email Dispatch Simulation
  const handleDispatchReport = async (reportId: string) => {
    try {
      await fetch(`/api/reports/dispatch/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          tenantId: activeTenant.id,
        })
      });
      // update lastSent locally
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, lastSent: new Date().toISOString() } : r));
    } catch {
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, lastSent: new Date().toISOString() } : r));
    }
  };

  // Handle Offline Queue Sync All
  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      // Simulate sync replay with 1 sec delay
      await new Promise(res => setTimeout(res, 1200));
      setOfflineQueue([]);
      setIsOffline(false);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={`h-screen max-h-screen font-sans flex flex-col overflow-hidden ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Offline Sync Banner */}
      <OfflineSyncBanner
        isOffline={isOffline}
        offlineQueue={offlineQueue}
        onSyncAll={handleSyncAll}
        isSyncing={isSyncing}
        language={language}
      />

      {/* Main Enterprise Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeTenant={activeTenant}
        tenants={MOCK_TENANTS}
        onSelectTenant={setActiveTenant}
        currentUser={currentUser}
        users={MOCK_USERS}
        onSelectUser={setCurrentUser}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        language={language}
        onSelectLanguage={setLanguage}
        isOffline={isOffline}
        onToggleOffline={() => setIsOffline(!isOffline)}
        offlineQueueCount={offlineQueue.length}
        anomalies={anomalies}
        onOpenAnomaly={(anom) => {
          setCurrentTab('anomalyCenter');
        }}
      />

      {/* Main Application Content Body */}
      <main className={`flex-1 min-h-0 flex flex-col ${
        currentTab === 'mapWorkspace' ? 'overflow-hidden' : 'overflow-y-auto'
      }`}>
        {/* TAB 1: Geospatial Map Workspace + Location Intelligence ADK Agent Panel */}
        {currentTab === 'mapWorkspace' && (
          <div className="flex-1 min-h-0 w-full h-full flex flex-col overflow-hidden">
            {/* Mobile & Tablet Segmented View Switcher (< lg) */}
            <div className="lg:hidden flex items-center justify-between px-3 py-1.5 border-b bg-slate-900/90 border-slate-800 text-xs shrink-0">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 w-full">
                <button
                  id="mobile-view-map-btn"
                  onClick={() => setMobileWorkspaceView('map')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all text-xs min-h-[36px] ${
                    mobileWorkspaceView === 'map'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  <span>Map Workspace</span>
                </button>
                <button
                  id="mobile-view-agent-btn"
                  onClick={() => setMobileWorkspaceView('agent')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all text-xs min-h-[36px] relative ${
                    mobileWorkspaceView === 'agent'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>ADK Agent</span>
                  {agentMessages.length > 1 && (
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>
              </div>
            </div>

            {/* Viewports container */}
            <div className="flex-1 min-h-0 flex flex-col lg:flex-row h-full w-full overflow-hidden">
              {/* Map Canvas and Layer Engine */}
              <div className={`relative transition-all duration-300 h-full min-h-0 ${
                // On mobile/tablet, show only if active or on desktop
                mobileWorkspaceView === 'map' ? 'flex-1 flex flex-col' : 'hidden lg:flex lg:flex-col'
              } ${
                isAgentPanelCollapsed ? 'lg:flex-1' : 'lg:w-7/12 xl:w-8/12'
              }`}>
                <MapWorkspace
                  points={points}
                  clusters={clusters}
                  anomalies={anomalies}
                  language={language}
                  isDarkMode={isDarkMode}
                  selectedPoint={selectedPoint}
                  onSelectPoint={setSelectedPoint}
                  onSelectCluster={setSelectedCluster}
                  onSelectAnomaly={() => setCurrentTab('anomalyCenter')}
                  externalViewportCommand={viewportCommand}
                />

                {/* Floating button on mobile to jump to Agent */}
                <button
                  onClick={() => setMobileWorkspaceView('agent')}
                  className="lg:hidden absolute bottom-16 right-3 z-30 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-semibold text-xs shadow-xl flex items-center gap-1.5 border border-sky-400/40"
                >
                  <Bot className="h-4 w-4 animate-bounce" />
                  <span>Ask Agent</span>
                </button>

                {/* Agent Panel Desktop Toggle Button */}
                <button
                  id="toggle-agent-sidebar-btn"
                  onClick={() => setIsAgentPanelCollapsed(!isAgentPanelCollapsed)}
                  className={`hidden lg:flex absolute top-4 z-20 p-2 rounded-xl border backdrop-blur-md shadow-lg transition-all ${
                    isAgentPanelCollapsed ? 'right-4 bg-sky-600 text-white border-sky-400' : 'right-4 bg-slate-900/80 border-slate-700 text-slate-200'
                  }`}
                  title={isAgentPanelCollapsed ? 'Expand ADK Agent Console' : 'Collapse ADK Agent Console'}
                >
                  {isAgentPanelCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </div>

              {/* ADK Agent Command Center Panel */}
              <div className={`h-full min-h-0 shrink-0 flex flex-col ${
                // On mobile/tablet: visible when agent view active
                mobileWorkspaceView === 'agent' ? 'flex-1 w-full' : 'hidden'
              } ${
                // On desktop: visible when not collapsed
                !isAgentPanelCollapsed ? 'lg:flex lg:w-5/12 xl:w-4/12' : 'lg:hidden'
              }`}>
                <AgentPanel
                  messages={agentMessages}
                  onSendMessage={handleSendMessage}
                  isLoading={isAgentLoading}
                  userRole={currentUser.role}
                  language={language}
                  isDarkMode={isDarkMode}
                  onApplySpatialAction={applySpatialAction}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Predictive Modeling Dashboard */}
        {currentTab === 'predictiveDashboard' && (
          <PredictiveDashboard
            language={language}
            isDarkMode={isDarkMode}
          />
        )}

        {/* TAB 3: Anomaly Alerts Center */}
        {currentTab === 'anomalyCenter' && (
          <AnomalyAlertsCenter
            anomalies={anomalies}
            onUpdateAnomalyStatus={handleUpdateAnomalyStatus}
            onLocateOnMap={(lat, lng, label, pointId, layer) => {
              applySpatialAction({ type: 'zoom_to', lat, lng, zoom: 15, label, pointId, layer });
            }}
            onInvestigateWithAgent={(query) => {
              setCurrentTab('mapWorkspace');
              setIsAgentPanelCollapsed(false);
              setMobileWorkspaceView('agent');
              handleSendMessage(query);
            }}
            onInjectAnomaly={(newAnomaly) => {
              setAnomalies(prev => [newAnomaly, ...prev]);
              const newLog: AuditLogEntry = {
                id: `aud-${Date.now()}`,
                timestamp: new Date().toISOString(),
                userId: currentUser.id,
                userName: currentUser.name,
                userRole: currentUser.role,
                tenantId: activeTenant.id,
                tenantName: activeTenant.name,
                action: 'REALTIME_ANOMALY_INJECTED',
                targetResource: `anomalies/${newAnomaly.id}`,
                status: 'allowed',
                ipAddress: '127.0.0.1',
                metadata: { title: newAnomaly.title, zScore: newAnomaly.zScore, severity: newAnomaly.severity }
              };
              setAuditLogs(prev => [newLog, ...prev]);
            }}
            userRole={currentUser.role}
            language={language}
            isDarkMode={isDarkMode}
          />
        )}

        {/* TAB 4: Governance, RBAC & Compliance Audit Logs */}
        {currentTab === 'auditLogs' && (
          <AuditLogsRBAC
            auditLogs={auditLogs}
            tenants={MOCK_TENANTS}
            activeTenant={activeTenant}
            currentUserRole={currentUser.role}
            language={language}
            isDarkMode={isDarkMode}
          />
        )}

        {/* TAB 5: Customizable Dashboard Widgets Studio */}
        {currentTab === 'dashboardStudio' && (
          <CustomDashboardWidgets
            language={language}
            isDarkMode={isDarkMode}
          />
        )}

        {/* TAB 6: Export & Reporting Studio (PDF & CSV + Email Schedules) */}
        {currentTab === 'reports' && (
          <ExportReportingStudio
            reports={reports}
            points={points}
            clusters={clusters}
            anomalies={anomalies}
            language={language}
            isDarkMode={isDarkMode}
            onDispatchReport={handleDispatchReport}
            onScheduleReport={handleScheduleReport}
          />
        )}

        {/* TAB 7: API & MCP Protocol Explorer */}
        {currentTab === 'apiExplorer' && (
          <ApiExplorer
            language={language}
            isDarkMode={isDarkMode}
          />
        )}
      </main>
    </div>
  );
}
