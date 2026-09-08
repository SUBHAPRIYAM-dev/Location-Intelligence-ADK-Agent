export type UserRole = 'super_admin' | 'geospatial_analyst' | 'operations_lead' | 'viewer';

export interface Tenant {
  id: string;
  name: string;
  code: string;
  region: string;
  allowedDatasets: string[];
  maxDailyQueries: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  avatar: string;
}

export type Permission = 
  | 'view_maps'
  | 'run_bigquery_mcp'
  | 'run_maps_mcp'
  | 'execute_agent'
  | 'manage_anomalies'
  | 'export_reports'
  | 'manage_scheduled_reports'
  | 'manage_tenants_rbac'
  | 'view_audit_logs';

export interface SpatialPoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
  category: 'ev_charging' | 'logistics_fleet' | 'foot_traffic' | 'retail_hub' | 'sensor_node';
  value: number; // weight or metric, e.g. kW demand, traffic count, speed (km/h)
  status: 'normal' | 'warning' | 'anomaly';
  anomalyScore?: number; // 0.0 - 1.0 (or z-score)
  tenantId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ClusterGroup {
  id: string;
  centroid: [number, number]; // [lat, lng]
  pointCount: number;
  avgValue: number;
  radiusMeters: number;
  anomalyCount: number;
  category: string;
  points: SpatialPoint[];
  polygonBounds?: [number, number][];
}

export interface AnomalyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  pointId?: string;
  lat: number;
  lng: number;
  h3Index?: string;
  metricName: string;
  observedValue: number;
  expectedBaseline: number;
  zScore: number;
  status: 'active' | 'acknowledged' | 'resolved';
  tenantId: string;
  detectedBy: 'ADK Anomaly Engine' | 'BigQuery Spatial Stream' | 'MCP Anomaly Hook';
  acknowledgedBy?: string;
}

export interface HeatmapConfig {
  enabled: boolean;
  intensity: number; // 0.1 - 2.0
  radius: number; // 10 - 80px
  opacity: number; // 0.1 - 1.0
  colorScheme: 'turbo' | 'plasma' | 'thermal' | 'emerald';
}

export interface LayerToggleState {
  heatmaps: boolean;
  clustering: boolean;
  telemetryStream: boolean;
  anomaliesOnly: boolean;
  isochrones: boolean;
  footTraffic: boolean;
  logistics: boolean;
  retail: boolean;
  evGrid: boolean;
}

export interface MCPServer {
  id: string;
  name: string;
  status: 'connected' | 'busy' | 'disconnected' | 'error';
  version: string;
  description: string;
  toolsCount: number;
  lastPingMs: number;
}

export interface MCPTool {
  name: string;
  server: 'bigquery-spatial-mcp' | 'google-maps-mcp';
  description: string;
  parameters: Record<string, any>;
}

export interface AgentReasoningStep {
  id: string;
  timestamp: string;
  type: 'thought' | 'tool_call' | 'tool_result' | 'spatial_insight';
  toolName?: string;
  serverName?: string;
  input?: any;
  output?: any;
  explanation: string;
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  reasoningSteps?: AgentReasoningStep[];
  sqlQuery?: string;
  sqlExecutionTimeMs?: number;
  dataPointsAffected?: number;
  spatialAction?: {
    type: 'zoom_to' | 'filter_layer' | 'highlight_anomalies' | 'toggle_heatmap';
    target?: any;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  tenantId: string;
  tenantName: string;
  action: string;
  targetResource: string;
  status: 'allowed' | 'denied' | 'flagged';
  ipAddress: string;
  metadata?: Record<string, any>;
}

export interface ScheduledReport {
  id: string;
  name: string;
  tenantId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'PDF' | 'CSV' | 'Both';
  includeAnomalies: boolean;
  includePredictiveTrend: boolean;
  lastSent?: string;
  nextRun: string;
  active: boolean;
}

export interface OfflineQueueItem {
  id: string;
  timestamp: string;
  type: 'agent_query' | 'alert_status_change' | 'report_schedule';
  payload: any;
  synced: boolean;
}

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  enabled: boolean;
  width: 'half' | 'full';
  order: number;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: string;
  isVisible: boolean;
  position: number;
}
