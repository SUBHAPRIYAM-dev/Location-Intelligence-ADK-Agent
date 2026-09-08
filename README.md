# Location Intelligence ADK Agent

An enterprise-grade Location Intelligence Agent built with Google Agent Development Kit (ADK), Model Context Protocol (MCP) servers for BigQuery GIS and Google Maps, real-time spatial heatmaps, multi-layer DBSCAN clustering, automated anomaly detection, role-based access control (RBAC), predictive modeling, and exportable stakeholder analytics.

---



## Architecture & Features

- **ADK Spatial Reasoning Agent**: Conversational spatial analysis leveraging `@google/genai` (Gemini Flash) with deterministic spatial reasoning engine fallbacks.
- **MCP Server Orchestration**:
  - `bigquery-spatial-mcp`: `run_spatial_sql`, `detect_spatial_anomalies`, `compute_spatial_clusters`, and H3 spatial partition tables.
  - `google-maps-mcp`: `compute_isochrone`, `geocode_address`, `search_places_nearby`, and `compute_route_matrix`.
- **Interactive Spatial Visualizer**: High-contrast dark mode map with dynamic heatmaps, DBSCAN cluster centroid overlays, isochrone catchment polygons, and telemetry markers.
- **Predictive Analytics**: Multi-series forecasting dashboard with confidence intervals, capacity bounds, and anomaly thresholds.
- **Multi-Tenant RBAC**: Strict role enforcement (`Super Admin`, `Geospatial Analyst`, `Operations Lead`, `Viewer/Auditor`) with tenant switching.
- **Immutable Audit Logging**: Comprehensive audit trail capturing user identities, MCP tool calls, GIS SQL queries, and export events.
- **Export & Automated Reporting**: High-fidelity PDF print engine, CSV exports, and scheduled automated email reports.
