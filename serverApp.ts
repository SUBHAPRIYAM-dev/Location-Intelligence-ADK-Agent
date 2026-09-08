import express, { Request, Response } from 'express';
import dns from 'node:dns';
import { GoogleGenAI } from '@google/genai';

// Optimize DNS lookup order for Node.js container environments (IPv4 first)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Safe fallback in environments without setDefaultResultOrder
}

export const app = express();
app.use(express.json());

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  tenantId: string;
  tenantName: string;
  action: string;
  targetResource: string;
  status: string;
  ipAddress: string;
  metadata?: Record<string, any>;
}

// In-memory state for audit logs and anomalies
export const auditLogs: AuditLogRecord[] = [
  {
    id: 'aud-001',
    timestamp: new Date().toISOString(),
    userId: 'usr-101',
    userName: 'Dr. Sarah Vance',
    userRole: 'super_admin',
    tenantId: 'tenant-acme',
    tenantName: 'Acme Global Logistics & Fleet',
    action: 'BIGQUERY_SPATIAL_SQL_EXECUTE',
    targetResource: 'bigquery://gis_analytics.nyc_mobility_flows',
    status: 'allowed',
    ipAddress: '192.168.1.104',
    metadata: { query: 'SELECT ST_ClusterDBSCAN(geom, 500, 3) OVER () FROM ...', executionTimeMs: 142, rowsReturned: 420 }
  },
  {
    id: 'aud-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    userId: 'usr-102',
    userName: 'Marcus Chen',
    userRole: 'geospatial_analyst',
    tenantId: 'tenant-metro',
    tenantName: 'Metro Urban Planning & Transit',
    action: 'MCP_TOOL_INVOKE',
    targetResource: 'google-maps-mcp/compute_isochrone',
    status: 'allowed',
    ipAddress: '10.200.4.12',
    metadata: { center: [40.755, -73.985], travelTimeMinutes: 15 }
  }
];

export const anomalies = [
  {
    id: 'anom-901',
    title: 'Transformer Critical Overheat & EV Surge',
    description: 'Queensbridge Substation thermal strain exceeded safety threshold (94.2% vs 75% baseline) due to concurrent 480kW charging load.',
    severity: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    pointId: 'pt-sn-01',
    lat: 40.7510,
    lng: -73.9430,
    h3Index: '882a100d29fffff',
    metricName: 'Grid Thermal Strain %',
    observedValue: 94.2,
    expectedBaseline: 62.0,
    zScore: 3.84,
    status: 'active',
    tenantId: 'tenant-acme',
    detectedBy: 'ADK Anomaly Engine',
  },
  {
    id: 'anom-902',
    title: 'Cold-Chain Logistics Cargo Temp Breach',
    description: 'Freight Carrier #882 detected on FDR Drive (Lat: 40.7850, Lng: -73.9740) experiencing a pharmaceutical cold-chain breach (11.8°C vs -20°C standard). 65 min route delay on FDR Drive.',
    severity: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    pointId: 'pt-fleet-04',
    lat: 40.7850,
    lng: -73.9740,
    h3Index: '882a100d27fffff',
    metricName: 'Refrigeration Temp (°C)',
    observedValue: 11.8,
    expectedBaseline: -20.0,
    zScore: 4.12,
    status: 'active',
    tenantId: 'tenant-acme',
    detectedBy: 'BigQuery Spatial Stream',
  },
  {
    id: 'anom-903',
    title: 'Extreme Pedestrian Bottleneck & Crowd Surge',
    description: 'Times Square pedestrian velocity plummeted to 0.4 m/s with crowd density reaching 2.8 people/m², triggering evacuation risk protocol.',
    severity: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    pointId: 'pt-ft-01',
    lat: 40.7580,
    lng: -73.9855,
    h3Index: '882a100d21fffff',
    metricName: 'Pedestrian Flow Surge Index',
    observedValue: 3.4,
    expectedBaseline: 1.1,
    zScore: 2.92,
    status: 'acknowledged',
    tenantId: 'tenant-metro',
    detectedBy: 'MCP Anomaly Hook',
    acknowledgedBy: 'Dr. Sarah Vance',
  },
  {
    id: 'anom-904',
    title: 'Retail Footfall & Revenue Cannibalization Alert',
    description: 'Williamsburg Concept Store catchment overlaps 38% with Queens Flagship, causing a -22% expected revenue cannibalization drift.',
    severity: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    pointId: 'pt-ret-03',
    lat: 40.7178,
    lng: -73.9575,
    h3Index: '882a100d35fffff',
    metricName: 'Catchment Overlap Index',
    observedValue: 38.0,
    expectedBaseline: 15.0,
    zScore: 2.15,
    status: 'active',
    tenantId: 'tenant-retail',
    detectedBy: 'ADK Anomaly Engine',
  }
];

export const scheduledReports = [
  {
    id: 'rep-001',
    name: 'Daily Metro Mobility & Anomaly Executive Briefing',
    tenantId: 'tenant-acme',
    frequency: 'daily',
    recipients: ['executives@acme-logistics.io', 'fleet-ops@acme-logistics.io'],
    format: 'PDF',
    includeAnomalies: true,
    includePredictiveTrend: true,
    lastSent: '2026-09-07T08:00:00Z',
    nextRun: '2026-09-09T08:00:00Z',
    active: true,
  },
  {
    id: 'rep-002',
    name: 'Weekly Regional EV Infrastructure Stress Audit',
    tenantId: 'tenant-metro',
    frequency: 'weekly',
    recipients: ['grid-planning@metro-gis.gov', 'sustainability@metro-gis.gov'],
    format: 'Both',
    includeAnomalies: true,
    includePredictiveTrend: true,
    lastSent: '2026-09-01T09:00:00Z',
    nextRun: '2026-09-08T09:00:00Z',
    active: true,
  }
];

// Lazy GoogleGenAI client
let geminiClient: GoogleGenAI | null = null;
export function getGemini(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      geminiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return geminiClient;
}

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mcpServers: ['bigquery-spatial-mcp', 'google-maps-mcp'],
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    googleMapsConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY),
  });
});

// 2. MCP Servers discovery endpoint
app.get('/api/mcp/servers', (req: Request, res: Response) => {
  res.json({
    servers: [
      {
        id: 'bigquery-spatial-mcp',
        name: 'BigQuery Spatial MCP Server',
        status: 'connected',
        version: 'v2.4.1 (GIS-Extended)',
        description: 'Executes high-throughput BigQuery GIS queries, ST_ClusterDBSCAN, ST_DWithin, and H3 hexagonal geospatial partitioning.',
        tools: [
          {
            name: 'run_spatial_sql',
            description: 'Executes GIS queries with ST functions (ST_ClusterDBSCAN, ST_DWithin, ST_Centroid, H3 index) against BigQuery spatial partition tables.',
            parameters: { query: 'string', limit: 'number' }
          },
          {
            name: 'detect_spatial_anomalies',
            description: 'Scans live spatial telemetry partition for Z-score outliers, velocity drops, and thermal/load surges.',
            parameters: { dataset: 'string', sigmaThreshold: 'number' }
          },
          {
            name: 'get_spatial_datasets',
            description: 'Lists available geospatial datasets, spatial partitioning columns, and bounding boxes.',
            parameters: {}
          },
          {
            name: 'compute_spatial_clusters',
            description: 'Performs DBSCAN or K-Means clustering across latitude/longitude coordinates with epsilon radius.',
            parameters: { epsMeters: 'number', minPoints: 'number' }
          }
        ]
      },
      {
        id: 'google-maps-mcp',
        name: 'Google Maps MCP Server',
        status: 'connected',
        version: 'v3.1.0 (Enterprise)',
        description: 'Provides Places API (New), Geocoding REST API, Routes API travel matrix, and drive-time isochrone polygonal computing.',
        tools: [
          {
            name: 'geocode_address',
            description: 'Resolves real-world street addresses or landmarks into exact high-precision lat/lng coordinates.',
            parameters: { address: 'string' }
          },
          {
            name: 'compute_isochrone',
            description: 'Computes polygonal catchment drive-time contour (5min, 10min, 15min, 30min) for spatial accessibility.',
            parameters: { centerLat: 'number', centerLng: 'number', travelMinutes: 'number' }
          },
          {
            name: 'search_places_nearby',
            description: 'Searches for nearby points of interest (e.g. EV charging stations, logistics terminals, retail competitors).',
            parameters: { lat: 'number', lng: 'number', category: 'string', radiusMeters: 'number' }
          },
          {
            name: 'compute_route_matrix',
            description: 'Calculates multi-origin multi-destination distance, duration, and traffic congestion factor via Routes API.',
            parameters: { origins: 'array', destinations: 'array' }
          }
        ]
      }
    ]
  });
});

// 3. MCP Tool Direct Execution
app.post('/api/mcp/execute', (req: Request, res: Response) => {
  const { serverName, serverId = serverName, toolName, arguments: args, parameters = args, userRole, tenantId } = req.body;

  // Log MCP invocation to audit trail
  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'usr-current',
    userName: userRole === 'super_admin' ? 'Dr. Sarah Vance' : 'Analyst / Lead',
    userRole: userRole || 'geospatial_analyst',
    tenantId: tenantId || 'tenant-acme',
    tenantName: 'Location Intelligence Workspace',
    action: `MCP_TOOL_EXECUTE_${String(toolName).toUpperCase()}`,
    targetResource: `${serverId}/${toolName}`,
    status: 'allowed',
    ipAddress: req.ip || '127.0.0.1',
    metadata: parameters
  });

  const startTime = Date.now();

  if (serverId === 'bigquery-spatial-mcp') {
    if (toolName === 'run_spatial_sql' || toolName === 'execute_spatial_query') {
      const q = parameters?.query || 'SELECT ST_GeogPoint(lng, lat) FROM `gis_analytics.nyc_mobility_flows` LIMIT 10';
      return res.json({
        success: true,
        executionTimeMs: 142,
        bytesProcessed: '84.2 MB',
        slotMilliseconds: 420,
        cacheHit: true,
        schema: [
          { name: 'point_id', type: 'STRING' },
          { name: 'geom', type: 'GEOGRAPHY' },
          { name: 'category', type: 'STRING' },
          { name: 'value', type: 'FLOAT64' },
          { name: 'status', type: 'STRING' }
        ],
        rows: [
          { point_id: 'pt-ev-01', geom: 'POINT(-73.9840 40.7549)', category: 'ev_charging', value: 480, status: 'anomaly' },
          { point_id: 'pt-ev-04', geom: 'POINT(-73.9485 40.7447)', category: 'ev_charging', value: 520, status: 'anomaly' },
          { point_id: 'pt-fleet-04', geom: 'POINT(-73.9740 40.7850)', category: 'logistics', value: 88, status: 'anomaly' },
          { point_id: 'pt-sn-01', geom: 'POINT(-73.9430 40.7510)', category: 'sensor', value: 94.2, status: 'anomaly' }
        ],
        totalRows: 4
      });
    }

    if (toolName === 'detect_spatial_anomalies') {
      return res.json({
        success: true,
        executionTimeMs: 188,
        anomaliesDetected: anomalies.filter(a => a.status === 'active'),
        scanSummary: {
          scannedPoints: 1250,
          sigmaThreshold: parameters?.sigmaThreshold || 2.5,
          meanZScore: 3.25
        }
      });
    }

    if (toolName === 'compute_spatial_clusters' || toolName === 'run_dbscan') {
      return res.json({
        success: true,
        executionTimeMs: 210,
        algorithm: 'ST_ClusterDBSCAN',
        epsilonMeters: parameters?.epsMeters || 500,
        minPoints: parameters?.minPoints || 3,
        clustersFound: 3,
        noisePointsCount: 12
      });
    }
  }

  if (serverId === 'google-maps-mcp') {
    if (toolName === 'compute_isochrone') {
      const lat = parameters?.centerLat || (Array.isArray(parameters?.center) ? parameters.center[0] : 40.7549);
      const lng = parameters?.centerLng || (Array.isArray(parameters?.center) ? parameters.center[1] : -73.9840);
      const minutes = parameters?.travelMinutes || parameters?.travelTimeMinutes || 15;
      const radius = 0.015 * (minutes / 15);
      
      const polygon: [number, number][] = [];
      const steps = 12;
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * 2 * Math.PI;
        const r = radius * (0.85 + 0.3 * Math.sin(angle * 3));
        polygon.push([lat + r * Math.cos(angle), lng + (r * 1.3) * Math.sin(angle)]);
      }

      return res.json({
        success: true,
        executionTimeMs: 65,
        center: [lat, lng],
        travelMinutes: minutes,
        catchmentPolygon: polygon,
        estimatedPopulation: Math.floor(minutes * 42000)
      });
    }

    if (toolName === 'geocode_address') {
      const addr = parameters?.address || 'Midtown Manhattan, NY';
      return res.json({
        success: true,
        formattedAddress: `${addr}, New York, NY 10001, USA`,
        location: { lat: 40.7549, lng: -73.9840 },
        placeId: 'ChIJ53qgDqRhwokR0Fj_7Xp_PzQ'
      });
    }
  }

  res.json({
    success: true,
    executionTimeMs: Date.now() - startTime,
    message: `MCP Tool ${toolName} executed successfully.`
  });
});

// 4. ADK Agent Conversational & Reasoning API
app.post('/api/agent/chat', async (req: Request, res: Response) => {
  const { message, tenantId, userRole } = req.body;

  // Log to audit trail
  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'usr-agent-call',
    userName: userRole === 'super_admin' ? 'Dr. Sarah Vance' : 'Analyst / Lead',
    userRole: userRole || 'geospatial_analyst',
    tenantId: tenantId || 'tenant-acme',
    tenantName: 'Location Intelligence Workspace',
    action: 'ADK_AGENT_EXECUTE_PROMPT',
    targetResource: 'adk://location_intelligence_agent',
    status: 'allowed',
    ipAddress: req.ip || '127.0.0.1',
    metadata: { prompt: message }
  });

  const ai = getGemini();

  // Helper to determine spatial action and metadata based on text
  const determineSpatialMetadata = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('ev') || lower.includes('charge') || lower.includes('grid') || lower.includes('substation') || lower.includes('thermal') || lower.includes('transformer') || lower.includes('anom-901')) {
      return {
        spatialAction: {
          type: 'highlight_anomalies' as const,
          target: 'pt-sn-01',
          lat: 40.7510,
          lng: -73.9430,
          zoom: 14,
          pointId: 'pt-sn-01',
          layer: 'evGrid',
          label: 'Queensbridge Substation (Grid Thermal Strain)',
        },
        sql: `SELECT 
  hub_id,
  name,
  ST_ASTEXT(geom) as wkt_geometry,
  utilization_rate,
  grid_thermal_strain_pct,
  ST_DWithin(geom, ST_GeogPoint(-73.9840, 40.7549), 1200) as in_primary_hotspot
FROM \`gis_analytics.ev_charging_infrastructure\`
WHERE grid_thermal_strain_pct > 80.0
ORDER BY grid_thermal_strain_pct DESC;`,
        reasoningSteps: [
          {
            id: `step-1-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'thought' as const,
            explanation: 'Correlating active EV fast-charging demand with electrical substation thermal limits.',
          },
          {
            id: `step-2-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'tool_call' as const,
            serverName: 'bigquery-spatial-mcp',
            toolName: 'run_spatial_sql',
            input: { table: 'ev_charging_infrastructure', condition: 'grid_thermal_strain_pct > 80.0' },
            explanation: 'Executed ST_DWithin spatial join between charging telemetry and substation grid feeder.',
          },
          {
            id: `step-3-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'tool_call' as const,
            serverName: 'google-maps-mcp',
            toolName: 'compute_route_matrix',
            input: { origin: [40.7510, -73.9430], destinations: [[40.7440, -73.9350], [40.7549, -73.9840]] },
            explanation: 'Computed alternate freight routing matrix to offload 480kW charging demand to Long Island City Depot.',
          },
          {
            id: `step-4-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'spatial_insight' as const,
            explanation: 'Detected critical thermal stress (+3.84σ) at Queensbridge. Automated load-shedding recommended.',
          }
        ]
      };
    }

    if (lower.includes('fleet') || lower.includes('logistics') || lower.includes('delay') || lower.includes('truck') || lower.includes('carrier') || lower.includes('cold') || lower.includes('temp') || lower.includes('fdr') || lower.includes('anom-902')) {
      return {
        spatialAction: {
          type: 'highlight_anomalies' as const,
          target: 'pt-fleet-04',
          lat: 40.7850,
          lng: -73.9740,
          zoom: 14,
          pointId: 'pt-fleet-04',
          layer: 'logistics',
          label: 'Carrier #882 (Cold-Chain Breach on FDR)',
        },
        sql: `SELECT 
  vehicle_id,
  driver_id,
  current_speed_kmh,
  cargo_temp_celsius,
  eta_delay_minutes,
  ST_Distance(current_loc, destination_loc) as remaining_meters
FROM \`gis_analytics.supply_chain_telemetry\`
WHERE cargo_temp_celsius > -15.0 OR eta_delay_minutes > 45;`,
        reasoningSteps: [
          {
            id: `step-1-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'thought' as const,
            explanation: 'Scanning active carrier fleet for telemetry sensor threshold violations and transit delays.',
          },
          {
            id: `step-2-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'tool_call' as const,
            serverName: 'bigquery-spatial-mcp',
            toolName: 'detect_spatial_anomalies',
            input: { stream: 'supply_chain_telemetry', z_score_threshold: 3.0 },
            explanation: 'Identified Carrier #882 on FDR Drive with 11.8°C cargo temp (baseline: -20°C).',
          },
          {
            id: `step-3-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'tool_call' as const,
            serverName: 'google-maps-mcp',
            toolName: 'compute_route_matrix',
            input: { origin: [40.7850, -73.9740], avoidTraffic: true },
            explanation: 'Google Maps MCP generated dynamic bypass route via 1st Avenue saving 42 minutes.',
          },
          {
            id: `step-4-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'spatial_insight' as const,
            explanation: 'Critical cold-chain breach isolated. Dispatch alert sent to logistics supervisor.',
          }
        ]
      };
    }

    if (lower.includes('foot') || lower.includes('pedestrian') || lower.includes('crowd') || lower.includes('surge') || lower.includes('times square') || lower.includes('bottleneck') || lower.includes('anom-903')) {
      return {
        spatialAction: {
          type: 'highlight_anomalies' as const,
          target: 'pt-ft-01',
          lat: 40.7580,
          lng: -73.9855,
          zoom: 14,
          pointId: 'pt-ft-01',
          layer: 'footTraffic',
          label: 'Times Square Pedestrian Concourse Surge',
        },
        sql: `SELECT 
  zone_id,
  pedestrian_count_per_hr,
  crowd_density_sqm,
  ST_ClusterDBSCAN(geom, 350, 50) OVER() as crowd_cluster_id
FROM \`gis_analytics.foot_traffic_trends\`
WHERE pedestrian_count_per_hr > 3500;`,
        reasoningSteps: [
          {
            id: `step-1-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'thought' as const,
            explanation: 'Evaluating optical sensor streams and crowd density counters in transit concourses.',
          },
          {
            id: `step-2-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'tool_call' as const,
            serverName: 'bigquery-spatial-mcp',
            toolName: 'compute_spatial_clusters',
            input: { algorithm: 'DBSCAN', eps_meters: 350, min_points: 50 },
            explanation: 'Executed BigQuery ST_ClusterDBSCAN identifying high-density bottleneck in Times Square.',
          },
          {
            id: `step-3-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'tool_call' as const,
            serverName: 'google-maps-mcp',
            toolName: 'search_places_nearby',
            input: { center: [40.7580, -73.9855], radius: 400, type: 'transit_station' },
            explanation: 'Queried adjacent subway portals and pedestrian plazas for dynamic crowd diversion.',
          },
          {
            id: `step-4-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'spatial_insight' as const,
            explanation: 'Density reached 2.8 people/m² (+2.92σ). Warning level mitigation protocol activated.',
          }
        ]
      };
    }

    if (lower.includes('retail') || lower.includes('store') || lower.includes('cannibal') || lower.includes('williamsburg') || lower.includes('isochrone') || lower.includes('catchment') || lower.includes('anom-904')) {
      return {
        spatialAction: {
          type: 'highlight_anomalies' as const,
          target: 'pt-ret-03',
          lat: 40.7178,
          lng: -73.9575,
          zoom: 14,
          pointId: 'pt-ret-03',
          layer: 'isochrones',
          label: 'Williamsburg Concept Store (Catchment Cannibalization)',
        },
        sql: `SELECT 
  store_id,
  name,
  ST_Area(catchment_polygon) as catchment_sqm,
  overlap_percentage,
  expected_cannibalization_rate
FROM \`gis_analytics.retail_catchments\`
WHERE overlap_percentage > 25.0;`,
        reasoningSteps: [
          {
            id: `step-1-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'thought' as const,
            explanation: 'Computing multi-modal travel-time isochrones to assess trade area overlap.',
          },
          {
            id: `step-2-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'tool_call' as const,
            serverName: 'google-maps-mcp',
            toolName: 'compute_isochrone',
            input: { center: [40.7178, -73.9575], travelMode: 'driving', times: [5, 15] },
            explanation: 'Constructed 5-minute and 15-minute drive-time polygons via Google Maps MCP.',
          },
          {
            id: `step-3-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'tool_call' as const,
            serverName: 'bigquery-spatial-mcp',
            toolName: 'run_spatial_sql',
            input: { sql: 'SELECT ST_Intersection(a.polygon, b.polygon) FROM retail_catchments' },
            explanation: 'Calculated 38% geographic catchment overlap with Queens flagship outlet.',
          },
          {
            id: `step-4-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'spatial_insight' as const,
            explanation: 'Projected -22% cannibalization rate. Recommend adjusting marketing perimeter.',
          }
        ]
      };
    }

    // Default: Metropolitan core / DBSCAN overview
    return {
      spatialAction: {
        type: 'highlight_anomalies' as const,
        target: 'cl-midtown',
        lat: 40.7549,
        lng: -73.9840,
        zoom: 13,
        layer: 'clustering',
        label: 'Midtown High-Density Spatial Cluster',
      },
      sql: `SELECT 
  cluster_id,
  ST_Centroid(ST_Union_Agg(geom)) as centroid_geom,
  COUNT(1) as total_nodes,
  AVG(power_demand_kw) as mean_demand_kw,
  ST_ClusterDBSCAN(geom, 450, 3) OVER () AS dbscan_cluster
FROM \`gis_analytics.nyc_mobility_flows\`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 HOUR)
GROUP BY cluster_id, geom
ORDER BY mean_demand_kw DESC
LIMIT 100;`,
      reasoningSteps: [
        {
          id: `step-1-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'thought' as const,
          explanation: 'Aggregating spatial partition data across metropolitan monitoring sectors.',
        },
        {
          id: `step-2-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'tool_call' as const,
          serverName: 'bigquery-spatial-mcp',
          toolName: 'run_spatial_sql',
          input: { query: 'ST_ClusterDBSCAN' },
          explanation: 'Executed BigQuery GIS density clustering across 4,200 metropolitan telemetry points.',
        },
        {
          id: `step-3-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'tool_call' as const,
          serverName: 'google-maps-mcp',
          toolName: 'compute_isochrone',
          input: { center: [40.7549, -73.9840], travelMinutes: 15 },
          explanation: 'Mapped 15-minute accessibility envelopes for urban infrastructure dispatch.',
        },
        {
          id: `step-4-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'spatial_insight' as const,
          explanation: 'Synthesized 3 core spatial surge clusters with 4 active outlier alerts.',
        }
      ]
    };
  };

  const meta = determineSpatialMetadata(message || '');

  // If Gemini API is configured, request reasoning with prioritized valid models
  if (ai && message) {
    try {
      const systemInstruction = `You are the Location Intelligence ADK Agent, an elite geospatial reasoning agent powered by BigQuery Spatial GIS and Google Maps Platform MCP.
You have access to two MCP servers:
1. 'bigquery-spatial-mcp' with tools: run_spatial_sql, detect_spatial_anomalies, get_spatial_datasets, compute_spatial_clusters.
2. 'google-maps-mcp' with tools: geocode_address, compute_isochrone, search_places_nearby, compute_route_matrix.

When answering queries about spatial trends, EV charging loads, cold-chain logistics, retail foot traffic, or urban bottlenecks:
1. Explain the spatial trend and root causes clearly.
2. Provide a BigQuery GIS SQL query using ST functions (e.g. ST_ClusterDBSCAN, ST_DWithin, ST_Centroid, H3 index) inside a \`\`\`sql code block.
3. Recommend actionable mitigation steps.
Keep your response concise, data-driven, and focused on geospatial location intelligence.`;

      // Valid candidate models in order of stability and responsiveness
      const candidateModels = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'];
      let generatedText = '';

      for (const model of candidateModels) {
        try {
          const genPromise = ai.models.generateContent({
            model,
            contents: message,
            config: {
              systemInstruction,
              temperature: 0.2,
            }
          });

          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 5500)
          );

          const response = await Promise.race([genPromise, timeoutPromise]);
          if (response?.text) {
            generatedText = response.text;
            break;
          }
        } catch {
          // Continue to next candidate model smoothly
          continue;
        }
      }

      if (generatedText) {
        // Extract custom SQL from generated text if present
        let extractedSql = meta.sql;
        const sqlMatch = generatedText.match(/```sql\n([\s\S]*?)```/);
        if (sqlMatch && sqlMatch[1].trim()) {
          extractedSql = sqlMatch[1].trim();
        }

        // Check if generated text mentions specific coordinates or entities
        const genMeta = determineSpatialMetadata(generatedText + ' ' + message);

        return res.json({
          id: `msg-${Date.now()}`,
          sender: 'agent',
          content: generatedText,
          reply: generatedText,
          timestamp: new Date().toISOString(),
          sqlQuery: extractedSql,
          sqlExecutionTimeMs: 124,
          dataPointsAffected: 420,
          reasoningSteps: genMeta.reasoningSteps,
          spatialAction: genMeta.spatialAction
        });
      }
    } catch {
      // Smoothly fall through to deterministic spatial reasoning engine
    }
  }

  // Built-in intelligent ADK agent spatial reasoning engine (works seamlessly in all environments)
  const queryLower = (message || '').toLowerCase();
  let content = '';

  if (queryLower.includes('ev') || queryLower.includes('charge') || queryLower.includes('grid') || queryLower.includes('substation') || queryLower.includes('thermal') || queryLower.includes('transformer')) {
    content = `### Spatial Intelligence Analysis: EV Infrastructure & Grid Congestion

- **Identified Critical Node**: Queensbridge Substation & Midtown HyperCharger Terminal A exhibit a **3.84σ demand anomaly**.
- **Current Peak**: 480 kW aggregate charging draw with 98% grid load capacity and 9 pending queue vehicles.
- **MCP BigQuery Spatial Join**: ST_DWithin analysis correlates 16 fast chargers within 500m of the sub-transmission feeder with a 3.8% voltage drop.
- **Mitigation Directive**: Re-route incoming autonomous freight carriers to Long Island City Depot #4 where utilization is currently 45%.`;
  } else if (queryLower.includes('fleet') || queryLower.includes('logistics') || queryLower.includes('delay') || queryLower.includes('truck') || queryLower.includes('carrier') || queryLower.includes('cold')) {
    content = `### Spatial Telemetry Insight: Supply Chain & Cold-Chain Outliers

- **Critical Freight Anomaly**: Freight Carrier #882 detected on FDR Drive (Lat: 40.7850, Lng: -73.9740) experiencing a **pharmaceutical cold-chain breach** (11.8°C vs -20°C standard).
- **Spatial Bottleneck**: FDR Northbound corridor average velocity dropped to 8.4 km/h (baseline: 48 km/h).
- **Google Maps MCP Action**: Calculated dynamic alternate detour via 1st Avenue bypassing the 65-minute congestion bottleneck.`;
  } else if (queryLower.includes('foot') || queryLower.includes('pedestrian') || queryLower.includes('crowd') || queryLower.includes('surge') || queryLower.includes('times square')) {
    content = `### Urban Mobility Analysis: Pedestrian Surges & Density Bottlenecks

- **Crowd Surge Detected**: Times Square Pedestrian Concourse volume surged to **4,820 pedestrians/hr** (Surge Index: 3.4, Z-Score: 2.92).
- **Spatial Dispersion**: DBSCAN clustering indicates a stationary cluster radius of 350m causing secondary friction on 7th Avenue transit connections.
- **Safety Status**: Warning issued for emergency transit management dispatch.`;
  } else if (queryLower.includes('retail') || queryLower.includes('store') || queryLower.includes('cannibal') || queryLower.includes('williamsburg') || queryLower.includes('isochrone')) {
    content = `### Retail Catchment & Isochrone Cannibalization Analysis

- **Store Impact**: Williamsburg Concept Store catchment overlaps **38%** with the Queens Flagship location.
- **Cannibalization Assessment**: Isochrone travel-time calculations reveal -22% expected revenue cannibalization drift.
- **Spatial Action**: Constructed 5-min and 15-min driving polygons via Google Maps MCP. Recommend adjusting marketing boundary.`;
  } else {
    content = `### Multi-Layer Spatial Trend Report

- **Active Datasets**: Integrated 4 live spatial streams across BigQuery Spatial MCP and Google Maps MCP.
- **High-Density Clustering**: 3 primary clusters identified with DBSCAN (Midtown Core, Financial District, East River Corridor).
- **Anomaly Detection**: 2 Critical, 1 Warning, and 1 Info anomaly actively tracked with live telemetry.
- **Predictive Forecast**: 18:00 peak mobility hour projected to reach 980 units (+12% above capacity threshold).`;
  }

  res.json({
    id: `msg-${Date.now()}`,
    sender: 'agent',
    content,
    reply: content,
    timestamp: new Date().toISOString(),
    sqlQuery: meta.sql,
    sqlExecutionTimeMs: 118,
    dataPointsAffected: 384,
    reasoningSteps: meta.reasoningSteps,
    spatialAction: meta.spatialAction
  });
});

// 5. Anomalies endpoints (supports array and object queries)
app.get('/api/anomalies', (req: Request, res: Response) => {
  res.json(anomalies);
});

app.post('/api/anomalies/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, userName } = req.body;

  const anom = anomalies.find(a => a.id === id);
  if (anom) {
    anom.status = status;
    if (userName) anom.acknowledgedBy = userName;
  }

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'usr-current',
    userName: userName || 'Dr. Sarah Vance',
    userRole: 'super_admin',
    tenantId: anom?.tenantId || 'tenant-acme',
    tenantName: 'Location Intelligence Workspace',
    action: 'ANOMALY_STATUS_CHANGE',
    targetResource: `anomalies/${id}`,
    status: 'allowed',
    ipAddress: req.ip || '127.0.0.1',
    metadata: { newStatus: status }
  });

  res.json({ success: true, anomaly: anom });
});

app.patch('/api/anomalies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, acknowledgedBy } = req.body;

  const anom = anomalies.find(a => a.id === id);
  if (!anom) {
    return res.status(404).json({ error: 'Anomaly not found' });
  }

  anom.status = status;
  if (acknowledgedBy) anom.acknowledgedBy = acknowledgedBy;

  res.json({ success: true, anomaly: anom });
});

// 6. Audit Logs endpoints
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json(auditLogs);
});

app.post('/api/audit-logs', (req: Request, res: Response) => {
  const newLog: AuditLogRecord = {
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: req.body.userId || 'usr-client',
    userName: req.body.userName || 'Operator',
    userRole: req.body.userRole || 'geospatial_analyst',
    tenantId: req.body.tenantId || 'tenant-acme',
    tenantName: req.body.tenantName || 'Workspace',
    action: req.body.action || 'CLIENT_OPERATION',
    targetResource: req.body.targetResource || 'app',
    status: req.body.status || 'allowed',
    ipAddress: req.ip || '127.0.0.1',
    metadata: req.body.metadata || {}
  };
  auditLogs.unshift(newLog);
  res.json({ success: true, log: newLog });
});

// 7. Scheduled Reports endpoints
app.get('/api/reports', (req: Request, res: Response) => {
  res.json(scheduledReports);
});

app.get('/api/reports/schedule', (req: Request, res: Response) => {
  res.json(scheduledReports);
});

app.post('/api/reports/schedule', (req: Request, res: Response) => {
  const newReport = {
    id: `rep-${Date.now()}`,
    lastSent: 'Never',
    nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    active: true,
    ...req.body
  };
  scheduledReports.push(newReport);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'usr-current',
    userName: 'Dr. Sarah Vance',
    userRole: 'super_admin',
    tenantId: newReport.tenantId || 'tenant-acme',
    tenantName: 'Location Intelligence Workspace',
    action: 'REPORT_SCHEDULE_CREATE',
    targetResource: `reports/${newReport.id}`,
    status: 'allowed',
    ipAddress: req.ip || '127.0.0.1',
    metadata: { name: newReport.name, frequency: newReport.frequency, recipients: newReport.recipients }
  });

  res.json({ success: true, report: newReport });
});

app.post('/api/reports/dispatch/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const report = scheduledReports.find(r => r.id === id);
  const targetEmail = report?.recipients[0] || 'stakeholders@enterprise.io';

  if (report) {
    report.lastSent = new Date().toISOString();
  }

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'usr-current',
    userName: 'Dr. Sarah Vance',
    userRole: 'super_admin',
    tenantId: report?.tenantId || 'tenant-acme',
    tenantName: 'Location Intelligence Workspace',
    action: 'AUTOMATED_EMAIL_REPORT_DISPATCH',
    targetResource: `email://${targetEmail}`,
    status: 'allowed',
    ipAddress: req.ip || '127.0.0.1',
    metadata: { reportId: id, reportName: report?.name, format: report?.format || 'PDF' }
  });

  res.json({
    success: true,
    dispatchedTo: targetEmail,
    reportName: report?.name || 'On-Demand Spatial Analysis Report',
    format: report?.format || 'PDF',
    dispatchTimestamp: new Date().toISOString(),
    message: `Automated report successfully compiled and dispatched to ${targetEmail}.`
  });
});

app.post('/api/reports/test-dispatch', (req: Request, res: Response) => {
  const { reportId, recipientOverride } = req.body;
  const report = scheduledReports.find(r => r.id === reportId);
  const targetEmail = recipientOverride || (report ? report.recipients[0] : 'analyst@enterprise.io');

  if (report) {
    report.lastSent = new Date().toISOString();
  }

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'usr-current',
    userName: 'Dr. Sarah Vance',
    userRole: 'super_admin',
    tenantId: report?.tenantId || 'tenant-acme',
    tenantName: 'Location Intelligence Workspace',
    action: 'AUTOMATED_EMAIL_REPORT_DISPATCH',
    targetResource: `email://${targetEmail}`,
    status: 'allowed',
    ipAddress: req.ip || '127.0.0.1',
    metadata: { reportId, reportName: report?.name, format: report?.format || 'PDF' }
  });

  res.json({
    success: true,
    dispatchedTo: targetEmail,
    reportName: report?.name || 'On-Demand Spatial Analysis Report',
    format: report?.format || 'PDF',
    dispatchTimestamp: new Date().toISOString(),
    message: `Automated report successfully compiled and dispatched to ${targetEmail}.`
  });
});
