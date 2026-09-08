import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Layers, 
  Flame, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause, 
  AlertTriangle, 
  Navigation, 
  Sliders, 
  Info, 
  MapPin, 
  Activity, 
  Sparkles, 
  X,
  Radio,
  Zap,
  Truck,
  Users,
  Store,
  Compass
} from 'lucide-react';
import { 
  SpatialPoint, 
  ClusterGroup, 
  AnomalyAlert, 
  HeatmapConfig, 
  LayerToggleState, 
  LanguageCode 
} from '../types';
import { translations } from '../i18n';

interface MapWorkspaceProps {
  points: SpatialPoint[];
  clusters: ClusterGroup[];
  anomalies: AnomalyAlert[];
  language: LanguageCode;
  isDarkMode: boolean;
  selectedPoint: SpatialPoint | null;
  onSelectPoint: (pt: SpatialPoint | null) => void;
  onSelectCluster: (cl: ClusterGroup | null) => void;
  onSelectAnomaly: (anom: AnomalyAlert) => void;
  externalViewportCommand?: {
    center?: { lat: number; lng: number };
    zoom?: number;
    highlightPointId?: string;
    highlightClusterId?: string;
    activeLayer?: string;
    timestamp: number;
  } | null;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 19;

export const MapWorkspace: React.FC<MapWorkspaceProps> = ({
  points,
  clusters,
  anomalies,
  language,
  isDarkMode,
  selectedPoint,
  onSelectPoint,
  onSelectCluster,
  onSelectAnomaly,
  externalViewportCommand,
}) => {
  const t = translations[language];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Map viewport states (center lat/lng and zoom level)
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 40.742, lng: -73.978 });
  const [zoom, setZoom] = useState<number>(13);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Heatmap configuration
  const [heatmapConfig, setHeatmapConfig] = useState<HeatmapConfig>({
    enabled: true,
    intensity: 1.2,
    radius: 38,
    opacity: 0.65,
    colorScheme: 'turbo',
  });

  // Layer toggles
  const [layers, setLayers] = useState<LayerToggleState>({
    heatmaps: true,
    clustering: true,
    telemetryStream: true,
    anomaliesOnly: false,
    isochrones: true,
    footTraffic: true,
    logistics: true,
    retail: true,
    evGrid: true,
  });

  // Telemetry stream state
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(1);
  const [telemetryOffsets, setTelemetryOffsets] = useState<Record<string, { lat: number; lng: number; heading: number }>>({});
  const [showConfigDrawer, setShowConfigDrawer] = useState<boolean>(false);
  const [hoveredItem, setHoveredItem] = useState<{ type: 'point' | 'cluster'; data: any; x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Responsive container measurement via ResizeObserver to dynamically adapt canvas to full screen
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Listen to external commands from ADK Agent or Anomaly Alerts Center
  useEffect(() => {
    if (!externalViewportCommand) return;
    if (externalViewportCommand.center) {
      setCenter(externalViewportCommand.center);
    }
    if (externalViewportCommand.zoom) {
      setZoom(externalViewportCommand.zoom);
    }
    if (externalViewportCommand.activeLayer) {
      setLayers(prev => ({
        ...prev,
        [externalViewportCommand.activeLayer!]: true,
      }));
    }
    if (externalViewportCommand.highlightPointId) {
      const pt = points.find(p => p.id === externalViewportCommand.highlightPointId);
      if (pt) {
        onSelectPoint(pt);
      } else {
        const matchingAnom = anomalies.find(a => a.id === externalViewportCommand.highlightPointId || a.pointId === externalViewportCommand.highlightPointId);
        if (matchingAnom && onSelectAnomaly) {
          onSelectAnomaly(matchingAnom);
        }
      }
    }
  }, [externalViewportCommand, points, anomalies, onSelectPoint, onSelectAnomaly]);

  // Simulated live telemetry movement loop
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setTelemetryOffsets(prev => {
        const next = { ...prev };
        points.forEach((p, idx) => {
          if (p.category === 'logistics_fleet') {
            const current = next[p.id] || { lat: 0, lng: 0, heading: (idx * 45) % 360 };
            const speed = 0.00015 * streamSpeed;
            const rad = (current.heading * Math.PI) / 180;
            const newLat = current.lat + Math.cos(rad) * speed;
            const newLng = current.lng + Math.sin(rad) * speed;
            // Wobble heading slightly
            const newHeading = (current.heading + (Math.random() - 0.48) * 10) % 360;
            next[p.id] = { lat: newLat, lng: newLng, heading: newHeading };
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, streamSpeed, points]);

  // Transform coordinates (lat, lng) to canvas (x, y) relative to current center and zoom
  const project = (lat: number, lng: number, width: number, height: number) => {
    // Web Mercator approximation for localized metropolitan area
    const scale = Math.pow(2, zoom) * 80;
    const x = width / 2 + (lng - center.lng) * scale * 1.35;
    const y = height / 2 - (lat - center.lat) * scale;
    return { x, y };
  };

  // Inverse project (canvas x, y) to (lat, lng)
  const unproject = (x: number, y: number, width: number, height: number) => {
    const scale = Math.pow(2, zoom) * 80;
    const lng = center.lng + (x - width / 2) / (scale * 1.35);
    const lat = center.lat - (y - height / 2) / scale;
    return { lat, lng };
  };

  // Filtered points based on active layer toggles
  const activePoints = useMemo(() => {
    return points.filter(p => {
      if (layers.anomaliesOnly && p.status === 'normal') return false;
      if (p.category === 'foot_traffic' && !layers.footTraffic) return false;
      if (p.category === 'logistics_fleet' && !layers.logistics) return false;
      if (p.category === 'retail_hub' && !layers.retail) return false;
      if (p.category === 'ev_charging' && !layers.evGrid) return false;
      if (p.category === 'sensor_node' && !layers.evGrid) return false;
      return true;
    });
  }, [points, layers]);

  // Color ramp generator for heatmaps
  const getColorGradient = (val: number, scheme: string) => {
    // val is 0.0 to 1.0
    if (scheme === 'plasma') {
      if (val < 0.25) return `rgba(13, 8, 135, ${val * 1.2})`;
      if (val < 0.5) return `rgba(156, 23, 158, ${val * 1.1})`;
      if (val < 0.75) return `rgba(237, 121, 83, ${val * 1.1})`;
      return `rgba(240, 249, 33, ${val * 1.2})`;
    }
    if (scheme === 'thermal') {
      if (val < 0.3) return `rgba(24, 60, 180, ${val})`;
      if (val < 0.6) return `rgba(240, 140, 20, ${val * 1.1})`;
      return `rgba(245, 30, 30, ${val * 1.3})`;
    }
    if (scheme === 'emerald') {
      if (val < 0.33) return `rgba(6, 78, 59, ${val})`;
      if (val < 0.66) return `rgba(16, 185, 129, ${val * 1.1})`;
      return `rgba(52, 211, 153, ${val * 1.2})`;
    }
    // Default: turbo
    if (val < 0.2) return `rgba(48, 18, 59, ${val * 0.9})`;
    if (val < 0.4) return `rgba(70, 134, 251, ${val * 1.1})`;
    if (val < 0.6) return `rgba(27, 229, 181, ${val * 1.1})`;
    if (val < 0.8) return `rgba(251, 185, 56, ${val * 1.2})`;
    return `rgba(186, 36, 34, ${val * 1.3})`;
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Background styling
    ctx.fillStyle = isDarkMode ? '#0b1120' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Draw Subtle Metropolitan Geospatial Grid & Road Corridors
    ctx.strokeStyle = isDarkMode ? 'rgba(51, 65, 85, 0.25)' : 'rgba(203, 213, 225, 0.4)';
    ctx.lineWidth = 1;
    const gridSize = 45;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Major Geographic River / Waterway representation (East River & Hudson River approximations)
    const riverScale = Math.max(1.5, Math.min(36, 32 * Math.pow(2, zoom - 13)));
    const hudson1 = project(40.780, -74.015, width, height);
    const hudson2 = project(40.700, -74.025, width, height);
    ctx.strokeStyle = isDarkMode ? 'rgba(30, 58, 138, 0.35)' : 'rgba(186, 230, 253, 0.5)';
    ctx.lineWidth = riverScale;
    ctx.beginPath();
    ctx.moveTo(hudson1.x, hudson1.y);
    ctx.lineTo(hudson2.x, hudson2.y);
    ctx.stroke();

    const eastRiver1 = project(40.770, -73.945, width, height);
    const eastRiver2 = project(40.705, -73.985, width, height);
    ctx.lineWidth = Math.max(1, riverScale * 0.75);
    ctx.beginPath();
    ctx.moveTo(eastRiver1.x, eastRiver1.y);
    ctx.lineTo(eastRiver2.x, eastRiver2.y);
    ctx.stroke();

    // 1. Draw Isochrone Catchment Polygons
    if (layers.isochrones) {
      // Draw 15-min and 5-min drive-time polygons around Midtown
      const centerPt = project(40.7549, -73.9840, width, height);
      const isochroneScale = Math.pow(2, zoom - 13);
      const outerIsochroneRadius = Math.max(3, 110 * isochroneScale);
      const innerIsochroneRadius = Math.max(1.5, 55 * isochroneScale);
      
      // Outer 15m isochrone
      ctx.save();
      ctx.fillStyle = isDarkMode ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.06)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(centerPt.x, centerPt.y, outerIsochroneRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner 5m isochrone
      ctx.fillStyle = isDarkMode ? 'rgba(14, 165, 233, 0.12)' : 'rgba(14, 165, 233, 0.09)';
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.6)';
      ctx.beginPath();
      ctx.arc(centerPt.x, centerPt.y, innerIsochroneRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw Interactive Heatmap Layer
    if (layers.heatmaps && heatmapConfig.enabled) {
      ctx.save();
      ctx.globalAlpha = heatmapConfig.opacity;
      activePoints.forEach(pt => {
        const offset = telemetryOffsets[pt.id] || { lat: 0, lng: 0 };
        const coord = project(pt.lat + offset.lat, pt.lng + offset.lng, width, height);
        
        // Compute relative weight based on point category and value
        let weight = 0.5;
        if (pt.category === 'ev_charging') weight = Math.min(1.0, pt.value / 500);
        else if (pt.category === 'foot_traffic') weight = Math.min(1.0, pt.value / 5000);
        else if (pt.category === 'sensor_node') weight = Math.min(1.0, pt.value / 100);
        else weight = 0.4;

        const radius = Math.max(
          6,
          heatmapConfig.radius * heatmapConfig.intensity * Math.min(1.2, Math.max(0.35, Math.pow(2, (zoom - 13) * 0.3)))
        );
        const grad = ctx.createRadialGradient(coord.x, coord.y, 0, coord.x, coord.y, radius);
        
        grad.addColorStop(0, getColorGradient(weight, heatmapConfig.colorScheme));
        grad.addColorStop(0.5, getColorGradient(weight * 0.6, heatmapConfig.colorScheme));
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // 3. Draw Cluster Polygons & Aggregate Centroids
    if (layers.clustering) {
      clusters.forEach(cl => {
        const centroidPt = project(cl.centroid[0], cl.centroid[1], width, height);

        // Draw cluster hull / polygon if available
        if (cl.polygonBounds && cl.polygonBounds.length > 2) {
          ctx.save();
          ctx.beginPath();
          cl.polygonBounds.forEach((coord, i) => {
            const p = project(coord[0], coord[1], width, height);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.closePath();
          ctx.fillStyle = isDarkMode ? 'rgba(56, 189, 248, 0.06)' : 'rgba(2, 132, 199, 0.05)';
          ctx.strokeStyle = isDarkMode ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fill();
          ctx.restore();
        }

        // Draw Cluster Centroid Badge
        ctx.save();
        const clusterRadius = Math.min(32, 18 + cl.pointCount * 1.8);
        ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff';
        ctx.strokeStyle = cl.anomalyCount > 0 ? '#f43f5e' : '#0ea5e9';
        ctx.lineWidth = 3;
        ctx.shadowColor = cl.anomalyCount > 0 ? 'rgba(244, 63, 94, 0.5)' : 'rgba(14, 165, 233, 0.4)';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.arc(centroidPt.x, centroidPt.y, clusterRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cluster count text
        ctx.shadowBlur = 0;
        ctx.fillStyle = cl.anomalyCount > 0 ? '#f43f5e' : (isDarkMode ? '#38bdf8' : '#0284c7');
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cl.pointCount.toString(), centroidPt.x, centroidPt.y);

        // Anomaly indicator dot
        if (cl.anomalyCount > 0) {
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(centroidPt.x + clusterRadius * 0.7, centroidPt.y - clusterRadius * 0.7, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
    }

    // 4. Draw Individual Spatial Points & Moving Telemetry
    activePoints.forEach(pt => {
      const offset = telemetryOffsets[pt.id] || { lat: 0, lng: 0, heading: 0 };
      const coord = project(pt.lat + offset.lat, pt.lng + offset.lng, width, height);

      const isSelected = selectedPoint?.id === pt.id;
      const isAnomaly = pt.status === 'anomaly';
      const isWarning = pt.status === 'warning';

      // Anomaly pulsing ring
      if (isAnomaly) {
        ctx.save();
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const baseRing = zoom < 8 ? 10 : 16;
        ctx.arc(coord.x, coord.y, baseRing + Math.sin(Date.now() / 250) * (zoom < 8 ? 2 : 3), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Target focus ring if selected by ADK Agent or operator
      if (isSelected) {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const focusRing = (zoom < 8 ? 14 : 22) + Math.sin(Date.now() / 200) * 4;
        ctx.arc(coord.x, coord.y, focusRing, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(coord.x - focusRing - 5, coord.y);
        ctx.lineTo(coord.x - focusRing + 3, coord.y);
        ctx.moveTo(coord.x + focusRing - 3, coord.y);
        ctx.lineTo(coord.x + focusRing + 5, coord.y);
        ctx.moveTo(coord.x, coord.y - focusRing - 5);
        ctx.lineTo(coord.x, coord.y - focusRing + 3);
        ctx.moveTo(coord.x, coord.y + focusRing - 3);
        ctx.lineTo(coord.x, coord.y + focusRing + 5);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      // Category specific icon / color styling
      let fillColor = '#38bdf8';
      if (pt.category === 'ev_charging') fillColor = '#10b981';
      else if (pt.category === 'logistics_fleet') fillColor = '#f59e0b';
      else if (pt.category === 'foot_traffic') fillColor = '#a855f7';
      else if (pt.category === 'retail_hub') fillColor = '#06b6d4';
      else if (pt.category === 'sensor_node') fillColor = '#ec4899';

      if (isAnomaly) fillColor = '#f43f5e';
      else if (isWarning) fillColor = '#f97316';

      // Pin body
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = isDarkMode ? '#0f172a' : '#ffffff';
      ctx.lineWidth = isSelected ? 3 : (zoom < 6 ? 1 : 2);

      const pointRadius = isSelected ? (zoom < 8 ? 6 : 8) : (zoom < 5 ? 3 : zoom < 8 ? 4.5 : 6);
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, pointRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Heading vector for moving logistics fleet
      if (pt.category === 'logistics_fleet' && layers.telemetryStream) {
        const headingRad = (offset.heading * Math.PI) / 180;
        const arrowLen = 14;
        ctx.strokeStyle = fillColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(coord.x, coord.y);
        ctx.lineTo(coord.x + Math.sin(headingRad) * arrowLen, coord.y - Math.cos(headingRad) * arrowLen);
        ctx.stroke();
      }

      ctx.restore();
    });

  }, [
    center, 
    zoom, 
    activePoints, 
    clusters, 
    heatmapConfig, 
    layers, 
    telemetryOffsets, 
    selectedPoint, 
    isDarkMode,
    dimensions
  ]);

  // Handle Pan & Drag on canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setDragStart({ x: e.clientX, y: e.clientY });

      const scale = Math.pow(2, zoom) * 80;
      setCenter(prev => ({
        lat: prev.lat + dy / scale,
        lng: prev.lng - dx / (scale * 1.35),
      }));
      return;
    }

    // Check hit test for hover popover
    let found: { type: 'point' | 'cluster'; data: any; x: number; y: number } | null = null;
    activePoints.forEach(pt => {
      const offset = telemetryOffsets[pt.id] || { lat: 0, lng: 0 };
      const coord = project(pt.lat + offset.lat, pt.lng + offset.lng, rect.width, rect.height);
      const dist = Math.hypot(coord.x - mouseX, coord.y - mouseY);
      if (dist < 12) {
        found = { type: 'point', data: pt, x: coord.x, y: coord.y };
      }
    });

    if (!found && layers.clustering) {
      clusters.forEach(cl => {
        const coord = project(cl.centroid[0], cl.centroid[1], rect.width, rect.height);
        const dist = Math.hypot(coord.x - mouseX, coord.y - mouseY);
        if (dist < 26) {
          found = { type: 'cluster', data: cl, x: coord.x, y: coord.y };
        }
      });
    }

    setHoveredItem(found);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredItem) {
      if (hoveredItem.type === 'point') {
        onSelectPoint(hoveredItem.data);
      } else if (hoveredItem.type === 'cluster') {
        onSelectCluster(hoveredItem.data);
      }
    } else {
      onSelectPoint(null);
      onSelectCluster(null);
    }
  };

  const touchStartRef = useRef<{ x: number; y: number; dist?: number }>({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const clientX = touch.clientX;
      const clientY = touch.clientY;
      setIsDragging(true);
      setDragStart({ x: clientX, y: clientY });
      touchStartRef.current = { x: clientX, y: clientY };
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = { x: 0, y: 0, dist };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const dx = touch.clientX - dragStart.x;
      const dy = touch.clientY - dragStart.y;
      setDragStart({ x: touch.clientX, y: touch.clientY });

      const scale = Math.pow(2, zoom) * 80;
      setCenter(prev => ({
        lat: prev.lat + dy / scale,
        lng: prev.lng - dx / (scale * 1.35),
      }));
    } else if (e.touches.length === 2 && touchStartRef.current.dist) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = currentDist - touchStartRef.current.dist;
      if (Math.abs(diff) > 5) {
        if (diff > 0) {
          setZoom(z => Math.min(MAX_ZOOM, z + 0.15));
        } else {
          setZoom(z => Math.max(MIN_ZOOM, z - 0.15));
        }
        touchStartRef.current.dist = currentDist;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setIsDragging(false);
      const touch = e.changedTouches[0];
      if (touch && touchStartRef.current) {
        const moveDist = Math.hypot(
          touch.clientX - touchStartRef.current.x,
          touch.clientY - touchStartRef.current.y
        );
        if (moveDist < 12) {
          const canvas = canvasRef.current;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = touch.clientX - rect.left;
            const mouseY = touch.clientY - rect.top;
            
            let foundPoint: SpatialPoint | null = null;
            activePoints.forEach(pt => {
              const offset = telemetryOffsets[pt.id] || { lat: 0, lng: 0 };
              const coord = project(pt.lat + offset.lat, pt.lng + offset.lng, rect.width, rect.height);
              if (Math.hypot(coord.x - mouseX, coord.y - mouseY) < 22) {
                foundPoint = pt;
              }
            });

            if (foundPoint) {
              onSelectPoint(foundPoint);
            } else {
              onSelectPoint(null);
            }
          }
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom(z => Math.min(MAX_ZOOM, Math.round((z + 0.5) * 10) / 10));
    } else {
      setZoom(z => Math.max(MIN_ZOOM, Math.round((z - 0.5) * 10) / 10));
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex-1 min-h-0 flex overflow-hidden"
    >
      {/* Map Canvas Viewport */}
      <div className="relative flex-1 min-h-0 w-full h-full select-none touch-none overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          onClick={handleClick}
          className="w-full h-full cursor-grab active:cursor-grabbing block touch-none"
        />

        {/* Floating Top Left: Quick Telemetry Metrics (Responsive) */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 sm:gap-2 pointer-events-none z-10 max-w-[calc(100vw-130px)] sm:max-w-none">
          <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border backdrop-blur-md shadow-lg pointer-events-auto flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono bg-slate-900/80 border-slate-700/80 text-slate-200">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
            <span className="font-semibold text-sky-400">{activePoints.length}</span>
            <span className="text-slate-400 text-[10px] sm:text-[11px]">Points</span>
          </div>

          <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border backdrop-blur-md shadow-lg pointer-events-auto flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono bg-slate-900/80 border-slate-700/80 text-slate-200">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-semibold text-rose-400">
              {activePoints.filter(p => p.status === 'anomaly').length}
            </span>
            <span className="text-slate-400 text-[10px] sm:text-[11px]">Alerts</span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-lg pointer-events-auto text-xs font-mono bg-slate-900/80 border-slate-700/80 text-slate-200">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-300">Telemetry Stream:</span>
            <span className="font-semibold text-emerald-400">12.8 msg/s</span>
          </div>
        </div>

        {/* Floating Top Right: Controls & Layer Switcher */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 sm:gap-2 z-10">
          <button
            id="stream-play-pause-btn"
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-semibold backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-colors min-h-[36px] sm:min-h-[38px] ${
              isStreaming
                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
          >
            {isStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span className="hidden xs:inline">{isStreaming ? 'Streaming' : 'Paused'}</span>
          </button>

          <button
            id="layer-config-btn"
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className={`p-2 rounded-xl border backdrop-blur-md shadow-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
              showConfigDrawer
                ? 'bg-sky-600 text-white border-sky-500'
                : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
            title="Layer & Heatmap Settings"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>

        {/* Floating Bottom Left: Zoom & View Navigation Controls */}
        <div className="absolute bottom-4 left-3 sm:bottom-5 sm:left-4 flex flex-col gap-1.5 z-30">
          <button
            id="map-zoom-in-btn"
            onClick={() => setZoom(z => Math.min(MAX_ZOOM, Math.floor(z + 1)))}
            disabled={zoom >= MAX_ZOOM}
            className={`p-2.5 rounded-xl border backdrop-blur-md shadow-xl bg-slate-900/90 border-slate-700 text-slate-200 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center ${
              zoom >= MAX_ZOOM ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800 hover:text-sky-400'
            }`}
            title={t.map.zoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div 
            className="text-[10px] font-mono font-bold text-center text-sky-400 py-0.5 px-1 bg-slate-950/90 rounded-lg border border-slate-700/80 shadow-md select-none"
            title={`Current zoom: ${zoom.toFixed(1)}x (Range: ${MIN_ZOOM}x - ${MAX_ZOOM}x)`}
          >
            {zoom.toFixed(zoom % 1 === 0 ? 0 : 1)}x
          </div>
          <button
            id="map-zoom-out-btn"
            onClick={() => setZoom(z => Math.max(MIN_ZOOM, Math.ceil(z - 1)))}
            disabled={zoom <= MIN_ZOOM}
            className={`p-2.5 rounded-xl border backdrop-blur-md shadow-xl bg-slate-900/90 border-slate-700 text-slate-200 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center ${
              zoom <= MIN_ZOOM ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800 hover:text-sky-400'
            }`}
            title={t.map.zoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            id="map-reset-view-btn"
            onClick={() => {
              setCenter({ lat: 40.742, lng: -73.978 });
              setZoom(13);
            }}
            className="p-2.5 rounded-xl border backdrop-blur-md shadow-xl bg-slate-900/90 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-sky-400 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
            title={t.map.resetView}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Floating Legend / Attribution Indicator (Desktop & Tablet) */}
        <div className="absolute bottom-4 right-3 sm:bottom-5 sm:right-4 hidden sm:flex items-center gap-2.5 lg:gap-3 px-2.5 sm:px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-xl bg-slate-900/90 border-slate-700/80 text-[10px] text-slate-300 z-30">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>EV Grid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>Fleet</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            <span>Foot Traffic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Outlier</span>
          </div>
          <span className="text-slate-500 font-mono">Zoom: {zoom.toFixed(1)}x</span>
        </div>

        {/* Hover Tooltip */}
        {hoveredItem && (
          <div
            className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-3"
            style={{ left: hoveredItem.x, top: hoveredItem.y }}
          >
            <div className="bg-slate-900/95 border border-slate-700 text-slate-100 rounded-xl shadow-2xl p-2.5 min-w-[200px] text-xs backdrop-blur-md">
              {hoveredItem.type === 'point' ? (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-sky-400 truncate">{hoveredItem.data.name}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold ${
                      hoveredItem.data.status === 'anomaly' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {hoveredItem.data.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    Value: {hoveredItem.data.value} {hoveredItem.data.category === 'ev_charging' ? 'kW' : ''}
                  </div>
                  {hoveredItem.data.anomalyScore && (
                    <div className="text-[10px] text-rose-400 font-mono mt-0.5">
                      Anomaly Score: {(hoveredItem.data.anomalyScore * 100).toFixed(0)}%
                    </div>
                  )}
                  <div className="text-[9px] text-slate-500 mt-1">Click to inspect in panel</div>
                </div>
              ) : (
                <div>
                  <div className="font-bold text-indigo-400">{hoveredItem.data.category}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {hoveredItem.data.pointCount} points in DBSCAN cluster
                  </div>
                  {hoveredItem.data.anomalyCount > 0 && (
                    <div className="text-[10px] text-rose-400 font-semibold mt-0.5">
                      ⚠️ {hoveredItem.data.anomalyCount} critical outlier(s) detected
                    </div>
                  )}
                  <div className="text-[9px] text-slate-500 mt-1">Click to zoom into cluster</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Layer & Heatmap Controls Drawer */}
      {showConfigDrawer && (
        <>
          {/* Mobile backdrop */}
          <div 
            onClick={() => setShowConfigDrawer(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
          />
          <div className={`fixed sm:absolute top-0 right-0 bottom-0 w-full sm:w-80 border-l p-4 overflow-y-auto z-40 flex flex-col justify-between shadow-2xl transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-sky-400" />
                  <h3 className="font-bold text-sm">{t.map.layers} & Visuals</h3>
                </div>
                <button
                  onClick={() => setShowConfigDrawer(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Heatmap Configuration Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-amber-400" />
                    {t.map.heatmap}
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.heatmaps}
                    onChange={e => setLayers({ ...layers, heatmaps: e.target.checked })}
                    className="rounded text-sky-500 focus:ring-sky-400 h-4 w-4"
                  />
                </div>

                {layers.heatmaps && (
                  <div className="space-y-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>{t.map.intensity}</span>
                        <span className="font-mono text-sky-400">{heatmapConfig.intensity.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.4"
                        max="2.5"
                        step="0.1"
                        value={heatmapConfig.intensity}
                        onChange={e => setHeatmapConfig({ ...heatmapConfig, intensity: parseFloat(e.target.value) })}
                        className="w-full accent-sky-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>{t.map.radius}</span>
                        <span className="font-mono text-sky-400">{heatmapConfig.radius}px</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="75"
                        step="5"
                        value={heatmapConfig.radius}
                        onChange={e => setHeatmapConfig({ ...heatmapConfig, radius: parseInt(e.target.value) })}
                        className="w-full accent-sky-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1.5">{t.map.colorScheme}</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['turbo', 'plasma', 'thermal', 'emerald'] as const).map(sch => (
                          <button
                            key={sch}
                            onClick={() => setHeatmapConfig({ ...heatmapConfig, colorScheme: sch })}
                            className={`px-2 py-1.5 rounded-lg capitalize text-[11px] font-semibold border transition-all ${
                              heatmapConfig.colorScheme === sch
                                ? 'bg-sky-600 text-white border-sky-400 shadow-sm'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {sch}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Layer Visibility Toggles */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Spatial Layer Visibility</span>
                
                {[
                  { id: 'clustering', label: t.map.clustering, state: layers.clustering, icon: Layers },
                  { id: 'isochrones', label: t.map.isochrones, state: layers.isochrones, icon: Compass },
                  { id: 'telemetryStream', label: t.map.telemetry, state: layers.telemetryStream, icon: Radio },
                  { id: 'anomaliesOnly', label: 'Filter Critical Anomalies Only', state: layers.anomaliesOnly, icon: AlertTriangle },
                  { id: 'evGrid', label: 'EV Charging & Power Grid', state: layers.evGrid, icon: Zap },
                  { id: 'logistics', label: 'Freight Logistics Fleet', state: layers.logistics, icon: Truck },
                  { id: 'footTraffic', label: 'Pedestrian Density Flows', state: layers.footTraffic, icon: Users },
                  { id: 'retail', label: 'Commercial Retail Hubs', state: layers.retail, icon: Store },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <label
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 border border-slate-800 cursor-pointer text-xs transition-colors min-h-[38px]"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-sky-400" />
                        <span className="text-slate-300">{item.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={item.state}
                        onChange={e => setLayers({ ...layers, [item.id]: e.target.checked })}
                        className="rounded text-sky-500 focus:ring-sky-400 h-4 w-4"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
              CRS: EPSG:4326 (WGS 84)<br />
              Partition: BigQuery Spatial Cache
            </div>
          </div>
        </>
      )}

      {/* Selected Point Details Drawer */}
      {selectedPoint && (
        <div className={`fixed sm:absolute bottom-4 left-3 right-3 sm:bottom-auto sm:top-4 sm:left-4 sm:right-auto sm:w-84 max-h-[75vh] overflow-y-auto rounded-2xl border shadow-2xl p-4 z-40 backdrop-blur-xl ${
          isDarkMode ? 'bg-slate-900/95 border-slate-700 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/50 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-4 w-4 text-sky-400 shrink-0" />
              <h4 className="font-bold text-sm truncate">{selectedPoint.name}</h4>
            </div>
            <button
              onClick={() => onSelectPoint(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800 font-mono">
              <span className="text-slate-400">Coordinates:</span>
              <span className="text-slate-200">{selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800 font-mono">
              <span className="text-slate-400">Category:</span>
              <span className="capitalize text-sky-400 font-semibold">{selectedPoint.category.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800 font-mono">
              <span className="text-slate-400">Metric Value:</span>
              <span className="font-bold text-emerald-400">{selectedPoint.value}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800 font-mono">
              <span className="text-slate-400">Status:</span>
              <span className={`capitalize font-bold ${
                selectedPoint.status === 'anomaly' ? 'text-rose-400' : selectedPoint.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {selectedPoint.status}
              </span>
            </div>

            {selectedPoint.metadata && (
              <div className="mt-3 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1 text-[11px]">
                <span className="font-semibold text-slate-400 block text-[10px] uppercase tracking-wider">Spatial Metadata</span>
                {Object.entries(selectedPoint.metadata).map(([k, v]) => (
                  <div key={k} className="flex justify-between font-mono gap-2">
                    <span className="text-slate-400 truncate">{k}:</span>
                    <span className="text-slate-200 truncate">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
