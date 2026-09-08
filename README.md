# Location Intelligence ADK Agent

An enterprise-grade Location Intelligence Agent built with Google Agent Development Kit (ADK), Model Context Protocol (MCP) servers for BigQuery GIS and Google Maps, real-time spatial heatmaps, multi-layer DBSCAN clustering, automated anomaly detection, role-based access control (RBAC), predictive modeling, and exportable stakeholder analytics.

---

## Deploy to Vercel via GitHub

This project is configured with full-stack support for Vercel (Vite frontend + Vercel Serverless Function API via `/api/index.ts` and `vercel.json`).

### Step 1: Push to your GitHub Repository

```bash
# Initialize git (if not already initialized)
git init

# Add all project files
git add .

# Commit changes
git commit -m "Initial commit: Location Intelligence ADK Agent"

# Link to your remote GitHub repository (replace with your repo URL)
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# Push to GitHub
git push -u origin main
```

### Step 2: Import into Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository from the list and click **"Import"**.
4. Vercel automatically detects Vite settings through `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `GOOGLE_MAPS_API_KEY`: (Optional) Your Google Maps API Key or Maps Demo Key.
   - `VITE_GOOGLE_MAPS_API_KEY`: (Optional) Same as above for client-side maps.
6. Click **Deploy**. Vercel will build the frontend assets and provision the serverless API routes (`/api/*`) in seconds.

---

## Local Development & Container Run

```bash
# Install dependencies
npm install

# Start development server (serves on http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

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
