import { LanguageCode } from './types';

export interface TranslationDict {
  appName: string;
  subtitle: string;
  tabs: {
    mapWorkspace: string;
    predictiveDashboard: string;
    anomalyCenter: string;
    auditLogs: string;
    dashboardStudio: string;
    reports: string;
    apiExplorer: string;
  };
  mcp: {
    servers: string;
    bigqueryStatus: string;
    mapsStatus: string;
    connected: string;
    toolsCount: string;
    runSql: string;
    geocoding: string;
  };
  agent: {
    title: string;
    placeholder: string;
    send: string;
    thinking: string;
    executingMcp: string;
    reasoningTrace: string;
    suggestedPrompts: string;
    sqlGenerated: string;
    spatialInsights: string;
  };
  map: {
    heatmap: string;
    clustering: string;
    telemetry: string;
    anomalies: string;
    isochrones: string;
    layers: string;
    intensity: string;
    radius: string;
    colorScheme: string;
    pointsLoaded: string;
    zoomIn: string;
    zoomOut: string;
    resetView: string;
  };
  anomalies: {
    title: string;
    critical: string;
    warning: string;
    info: string;
    activeAlerts: string;
    acknowledge: string;
    resolve: string;
    zScore: string;
    baseline: string;
    observed: string;
  };
  rbac: {
    title: string;
    role: string;
    tenant: string;
    permissions: string;
    superAdmin: string;
    analyst: string;
    lead: string;
    viewer: string;
    complianceStatus: string;
  };
  reports: {
    title: string;
    exportPdf: string;
    exportCsv: string;
    scheduleReport: string;
    frequency: string;
    recipients: string;
    sendNow: string;
    lastSent: string;
  };
  offline: {
    online: string;
    offlineMode: string;
    queuedSync: string;
    syncNow: string;
    syncedSuccess: string;
  };
}

export const translations: Record<LanguageCode, TranslationDict> = {
  en: {
    appName: 'Location Intelligence ADK Agent',
    subtitle: 'BigQuery & Google Maps MCP Geospatial Intelligence Core',
    tabs: {
      mapWorkspace: 'Map & ADK Agent',
      predictiveDashboard: 'Predictive Modeling',
      anomalyCenter: 'Anomaly Alerts',
      auditLogs: 'Audit Logs & RBAC',
      dashboardStudio: 'Custom Widgets',
      reports: 'Reports & Scheduled Exports',
      apiExplorer: 'API & MCP Explorer',
    },
    mcp: {
      servers: 'MCP Servers',
      bigqueryStatus: 'BigQuery Spatial MCP',
      mapsStatus: 'Google Maps MCP',
      connected: 'Operational',
      toolsCount: 'active tools',
      runSql: 'Run Spatial SQL',
      geocoding: 'Geocoding & Isochrones',
    },
    agent: {
      title: 'Location Intelligence Agent',
      placeholder: 'Ask the ADK Agent (e.g. "Identify EV charging stress anomalies in metro zone")',
      send: 'Execute',
      thinking: 'ADK Agent reasoning across MCP servers...',
      executingMcp: 'Invoking MCP tool',
      reasoningTrace: 'Reasoning & Execution Trace',
      suggestedPrompts: 'Suggested Analysis Scenarios',
      sqlGenerated: 'BigQuery Spatial SQL',
      spatialInsights: 'Spatial Intelligence Findings',
    },
    map: {
      heatmap: 'Interactive Heatmap',
      clustering: 'Multi-layer Clustering',
      telemetry: 'Real-time Telemetry Stream',
      anomalies: 'Critical Outliers',
      isochrones: 'Drive-Time Catchment',
      layers: 'Geospatial Layers',
      intensity: 'Heatmap Intensity',
      radius: 'Blur Radius',
      colorScheme: 'Palette',
      pointsLoaded: 'Points Active',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      resetView: 'Reset View',
    },
    anomalies: {
      title: 'Automated Anomaly Detection Stream',
      critical: 'Critical Alert',
      warning: 'Warning',
      info: 'Information',
      activeAlerts: 'Active Anomalies',
      acknowledge: 'Acknowledge',
      resolve: 'Mark Resolved',
      zScore: 'Anomaly Z-Score',
      baseline: 'Baseline Value',
      observed: 'Observed Spurt',
    },
    rbac: {
      title: 'Role-Based Access Control & Compliance',
      role: 'Active Role',
      tenant: 'Active Tenant',
      permissions: 'Role Permissions Matrix',
      superAdmin: 'Super Admin',
      analyst: 'Geospatial Analyst',
      lead: 'Operations Lead',
      viewer: 'Stakeholder Viewer',
      complianceStatus: 'Compliance Status',
    },
    reports: {
      title: 'Spatial Intelligence Reports',
      exportPdf: 'Export to PDF',
      exportCsv: 'Export Dataset CSV',
      scheduleReport: 'Schedule Email Dispatch',
      frequency: 'Schedule Frequency',
      recipients: 'Recipients (Email)',
      sendNow: 'Simulate Immediate Dispatch',
      lastSent: 'Last Dispatched',
    },
    offline: {
      online: 'Cloud Synchronized',
      offlineMode: 'Offline Simulation Mode',
      queuedSync: 'Mutations Queued',
      syncNow: 'Sync Queued Operations',
      syncedSuccess: 'All changes synchronized to BigQuery warehouse',
    },
  },
  es: {
    appName: 'Agente ADK de Inteligencia de Ubicación',
    subtitle: 'Núcleo Geoespacial con Servidores MCP de BigQuery y Google Maps',
    tabs: {
      mapWorkspace: 'Mapa y Agente ADK',
      predictiveDashboard: 'Modelado Predictivo',
      anomalyCenter: 'Alertas de Anomalías',
      auditLogs: 'Auditoría y RBAC',
      dashboardStudio: 'Widgets Personalizados',
      reports: 'Informes y Exportación',
      apiExplorer: 'API y MCP Explorer',
    },
    mcp: {
      servers: 'Servidores MCP',
      bigqueryStatus: 'BigQuery Espacial MCP',
      mapsStatus: 'Google Maps MCP',
      connected: 'Operativo',
      toolsCount: 'herramientas activas',
      runSql: 'Ejecutar SQL Espacial',
      geocoding: 'Geocodificación e Isócronas',
    },
    agent: {
      title: 'Agente de Inteligencia de Ubicación',
      placeholder: 'Pregunte al Agente (ej. "Identificar anomalías de demanda de carga")',
      send: 'Ejecutar',
      thinking: 'Razonamiento en curso a través de MCP...',
      executingMcp: 'Invocando herramienta MCP',
      reasoningTrace: 'Traza de Razonamiento',
      suggestedPrompts: 'Escenarios Sugeridos',
      sqlGenerated: 'SQL Espacial BigQuery',
      spatialInsights: 'Hallazgos de Inteligencia',
    },
    map: {
      heatmap: 'Mapa de Calor Interactivo',
      clustering: 'Agrupamiento Multicapa',
      telemetry: 'Flujo de Telemetría en Vivo',
      anomalies: 'Valores Atípicos Críticos',
      isochrones: 'Áreas de Cobertura Isócrona',
      layers: 'Capas Geoespaciales',
      intensity: 'Intensidad de Calor',
      radius: 'Radio de Desenfoque',
      colorScheme: 'Paleta de Color',
      pointsLoaded: 'Puntos Cargados',
      zoomIn: 'Acercar',
      zoomOut: 'Alejar',
      resetView: 'Restablecer',
    },
    anomalies: {
      title: 'Detección Automatizada de Anomalías',
      critical: 'Alerta Crítica',
      warning: 'Advertencia',
      info: 'Información',
      activeAlerts: 'Anomalías Activas',
      acknowledge: 'Reconocer',
      resolve: 'Resolver',
      zScore: 'Puntuación Z',
      baseline: 'Línea Base',
      observed: 'Valor Observado',
    },
    rbac: {
      title: 'Control de Acceso (RBAC) y Auditoría',
      role: 'Rol Activo',
      tenant: 'Inquilino / Organización',
      permissions: 'Matriz de Permisos',
      superAdmin: 'Super Administrador',
      analyst: 'Analista Geoespacial',
      lead: 'Líder de Operaciones',
      viewer: 'Visualizador Externo',
      complianceStatus: 'Cumplimiento Normativo',
    },
    reports: {
      title: 'Informes Geoespaciales',
      exportPdf: 'Descargar PDF',
      exportCsv: 'Exportar CSV',
      scheduleReport: 'Programar Envío por Correo',
      frequency: 'Frecuencia',
      recipients: 'Destinatarios',
      sendNow: 'Simular Envío Inmediato',
      lastSent: 'Último Envío',
    },
    offline: {
      online: 'Sincronizado en la Nube',
      offlineMode: 'Modo Offline',
      queuedSync: 'Operaciones en Cola',
      syncNow: 'Sincronizar Cola',
      syncedSuccess: 'Cambios sincronizados correctamente',
    },
  },
  fr: {
    appName: 'Agent ADK d\'Intelligence Spatiale',
    subtitle: 'Noyau Géospatial avec Serveurs MCP BigQuery et Google Maps',
    tabs: {
      mapWorkspace: 'Carte & Agent ADK',
      predictiveDashboard: 'Modélisation Prédictive',
      anomalyCenter: 'Alertes d\'Anomalies',
      auditLogs: 'Journaux d\'Audit & RBAC',
      dashboardStudio: 'Widgets Personnalisés',
      reports: 'Rapports & Exports',
      apiExplorer: 'API & MCP Explorer',
    },
    mcp: {
      servers: 'Serveurs MCP',
      bigqueryStatus: 'BigQuery Spatial MCP',
      mapsStatus: 'Google Maps MCP',
      connected: 'Opérationnel',
      toolsCount: 'outils actifs',
      runSql: 'Exécuter SQL Spatial',
      geocoding: 'Géocodage & Isochrones',
    },
    agent: {
      title: 'Agent d\'Intelligence de Localisation',
      placeholder: 'Interroger l\'agent (ex: "Détecter les anomalies de trafic")',
      send: 'Lancer',
      thinking: 'Raisonnement de l\'agent en cours...',
      executingMcp: 'Exécution de l\'outil MCP',
      reasoningTrace: 'Trace de Raisonnement',
      suggestedPrompts: 'Scénarios Suggérés',
      sqlGenerated: 'BigQuery Spatial SQL',
      spatialInsights: 'Conclusions Géospatiales',
    },
    map: {
      heatmap: 'Carte Thermique Interactive',
      clustering: 'Regroupement Multi-niveaux',
      telemetry: 'Flux Télémétrique en Temps Réel',
      anomalies: 'Valeurs Aberrantes',
      isochrones: 'Courbes Isochrones',
      layers: 'Couches Géographiques',
      intensity: 'Intensité',
      radius: 'Rayon',
      colorScheme: 'Palette',
      pointsLoaded: 'Points Actifs',
      zoomIn: 'Zoomer',
      zoomOut: 'Dézoomer',
      resetView: 'Réinitialiser',
    },
    anomalies: {
      title: 'Flux de Détection d\'Anomalies',
      critical: 'Alerte Critique',
      warning: 'Avertissement',
      info: 'Information',
      activeAlerts: 'Anomalies Actives',
      acknowledge: 'Prendre en compte',
      resolve: 'Résoudre',
      zScore: 'Score Z',
      baseline: 'Référence Normale',
      observed: 'Valeur Observée',
    },
    rbac: {
      title: 'Contrôle d\'Accès (RBAC) & Conformité',
      role: 'Rôle Actif',
      tenant: 'Organisation',
      permissions: 'Matrice des Autorisations',
      superAdmin: 'Super Administrateur',
      analyst: 'Analyste Spatial',
      lead: 'Responsable des Opérations',
      viewer: 'Lecteur Invité',
      complianceStatus: 'Statut de Conformité',
    },
    reports: {
      title: 'Rapports d\'Analyse Spatiale',
      exportPdf: 'Exporter en PDF',
      exportCsv: 'Exporter en CSV',
      scheduleReport: 'Programmer Rapport Email',
      frequency: 'Périodicité',
      recipients: 'Destinataires',
      sendNow: 'Simuler l\'Envoi Immédiat',
      lastSent: 'Dernier Envoi',
    },
    offline: {
      online: 'Connecté au Cloud',
      offlineMode: 'Mode Hors-ligne',
      queuedSync: 'Requêtes en File d\'Attente',
      syncNow: 'Synchroniser',
      syncedSuccess: 'Toutes les données sont synchronisées',
    },
  },
  de: {
    appName: 'Standort-Intelligenz ADK Agent',
    subtitle: 'Geodaten-Analyse mit BigQuery & Google Maps MCP Servern',
    tabs: {
      mapWorkspace: 'Karte & ADK-Agent',
      predictiveDashboard: 'Prädiktive Analysen',
      anomalyCenter: 'Anomalie-Warnungen',
      auditLogs: 'Audit-Protokolle & RBAC',
      dashboardStudio: 'Widgets anpassen',
      reports: 'Berichte & Exporte',
      apiExplorer: 'API & MCP Explorer',
    },
    mcp: {
      servers: 'MCP-Server',
      bigqueryStatus: 'BigQuery Geodaten MCP',
      mapsStatus: 'Google Maps MCP',
      connected: 'Betriebsbereit',
      toolsCount: 'aktive Werkzeuge',
      runSql: 'Räumliches SQL ausführen',
      geocoding: 'Geokodierung & Isochronen',
    },
    agent: {
      title: 'Standort-Intelligenz Agent',
      placeholder: 'Frage an Agenten stellen (z.B. "Ladestationen-Ausreißer analysieren")',
      send: 'Ausführen',
      thinking: 'Agent analysiert räumliche MCP-Daten...',
      executingMcp: 'MCP-Tool wird aufgerufen',
      reasoningTrace: 'Argumentations-Verlauf',
      suggestedPrompts: 'Vorgeschlagene Szenarien',
      sqlGenerated: 'BigQuery Spatial SQL',
      spatialInsights: 'Erkenntnisse & Muster',
    },
    map: {
      heatmap: 'Interaktive Heatmap',
      clustering: 'Mehrschichtiges Clustering',
      telemetry: 'Echtzeit-Telemetrie-Stream',
      anomalies: 'Kritische Ausreißer',
      isochrones: 'Fahrzeit-Einzugsgebiete',
      layers: 'Kartenebenen',
      intensity: 'Intensität',
      radius: 'Radius',
      colorScheme: 'Farbschema',
      pointsLoaded: 'Aktive Punkte',
      zoomIn: 'Vergrößern',
      zoomOut: 'Verkleinern',
      resetView: 'Ansicht zurücksetzen',
    },
    anomalies: {
      title: 'Automatisierte Anomalie-Erkennung',
      critical: 'Kritische Warnung',
      warning: 'Warnung',
      info: 'Information',
      activeAlerts: 'Aktive Anomalien',
      acknowledge: 'Bestätigen',
      resolve: 'Als behoben markieren',
      zScore: 'Z-Wert',
      baseline: 'Basiswert',
      observed: 'Beobachteter Wert',
    },
    rbac: {
      title: 'Rollenbasierte Zugriffskontrolle (RBAC)',
      role: 'Aktuelle Rolle',
      tenant: 'Mandant / Organisation',
      permissions: 'Berechtigungsmatrix',
      superAdmin: 'Hauptadministrator',
      analyst: 'Geodaten-Analyst',
      lead: 'Betriebsleiter',
      viewer: 'Beobachter',
      complianceStatus: 'Compliance-Status',
    },
    reports: {
      title: 'Standort-Berichte',
      exportPdf: 'PDF generieren',
      exportCsv: 'CSV exportieren',
      scheduleReport: 'E-Mail-Bericht planen',
      frequency: 'Häufigkeit',
      recipients: 'Empfänger',
      sendNow: 'Sofort senden (Test)',
      lastSent: 'Zuletzt gesendet',
    },
    offline: {
      online: 'Mit Cloud synchronisiert',
      offlineMode: 'Offline-Modus',
      queuedSync: 'Wartende Aktionen',
      syncNow: 'Jetzt synchronisieren',
      syncedSuccess: 'Erfolgreich mit Data Warehouse synchronisiert',
    },
  },
  ja: {
    appName: '位置情報インテリジェンス ADK エージェント',
    subtitle: 'BigQuery & Google Maps MCP 空間トレンドリアルタイム分析基盤',
    tabs: {
      mapWorkspace: '地図 & ADKエージェント',
      predictiveDashboard: '予測モデリング',
      anomalyCenter: '異常検知アラート',
      auditLogs: '監査ログ & RBAC',
      dashboardStudio: 'カスタムウィジェット',
      reports: 'レポート & 定期配信',
      apiExplorer: 'API & MCP 連携',
    },
    mcp: {
      servers: 'MCP サーバー連携',
      bigqueryStatus: 'BigQuery 空間 MCP',
      mapsStatus: 'Google Maps MCP',
      connected: '正常稼働中',
      toolsCount: '稼働ツール数',
      runSql: '空間SQL実行',
      geocoding: 'ジオコーディング・等時線',
    },
    agent: {
      title: 'ADK 位置情報エージェント',
      placeholder: 'エージェントに指示を入力 (例: EV充電需要と送電網の負荷異常を分析)',
      send: '実行',
      thinking: 'MCPサーバー経由でエージェントが推論中...',
      executingMcp: 'MCPツール実行中',
      reasoningTrace: '推論・実行トレース',
      suggestedPrompts: 'おすすめの分析シナリオ',
      sqlGenerated: 'BigQuery 空間 SQL',
      spatialInsights: '空間インサイトの発見',
    },
    map: {
      heatmap: 'インタラクティブ ヒートマップ',
      clustering: '多層クラスタリング',
      telemetry: 'リアルタイム テレメトリ配信',
      anomalies: '重大な外れ値・異常',
      isochrones: '到達圏ポリゴン (等時線)',
      layers: '地理空間レイヤー',
      intensity: 'ヒートマップ強度',
      radius: 'ブラー半径',
      colorScheme: 'カラーパレット',
      pointsLoaded: 'アクティブ地点数',
      zoomIn: '拡大',
      zoomOut: '縮小',
      resetView: '表示リセット',
    },
    anomalies: {
      title: '自動異常検知ストリーム',
      critical: '重大アラート',
      warning: '警告',
      info: '情報',
      activeAlerts: '発生中の異常',
      acknowledge: '認知済みにする',
      resolve: '解決済みにする',
      zScore: 'Zスコア',
      baseline: '基準ベースライン',
      observed: '観測値',
    },
    rbac: {
      title: 'ロールベース アクセス制御 (RBAC) & 監査',
      role: '現在のロール',
      tenant: 'テナント企業',
      permissions: '権限マトリクス',
      superAdmin: '特権管理者 (Super Admin)',
      analyst: '空間データアナリスト',
      lead: '運用リーダー (Operations)',
      viewer: '閲覧者 (Stakeholder)',
      complianceStatus: 'コンプライアンス適合状況',
    },
    reports: {
      title: '空間インテリジェンス レポート',
      exportPdf: 'PDF エクスポート',
      exportCsv: 'CSV エクスポート',
      scheduleReport: '定期メール配信設定',
      frequency: '配信頻度',
      recipients: '宛先メールアドレス',
      sendNow: 'テスト即時送信',
      lastSent: '最終送信日時',
    },
    offline: {
      online: 'クラウド同期完了',
      offlineMode: 'オフライン シミュレーション',
      queuedSync: '保留中キュー',
      syncNow: '今すぐ同期',
      syncedSuccess: 'BigQueryへの同期が正常に完了しました',
    },
  },
  zh: {
    appName: '位置智能 ADK 智能体',
    subtitle: 'BigQuery 与 Google Maps MCP 实时空间态势与趋势分析核心',
    tabs: {
      mapWorkspace: '地图与 ADK 智能体',
      predictiveDashboard: '预测建模仪表盘',
      anomalyCenter: '异常实时告警',
      auditLogs: '合规审计与 RBAC',
      dashboardStudio: '自定义微件',
      reports: '报表与定时分发',
      apiExplorer: 'API 与 MCP 调试',
    },
    mcp: {
      servers: 'MCP 服务矩阵',
      bigqueryStatus: 'BigQuery 空间 MCP',
      mapsStatus: 'Google Maps MCP',
      connected: '运行正常',
      toolsCount: '可用工具',
      runSql: '执行空间 SQL',
      geocoding: '地理编码与等时线',
    },
    agent: {
      title: '位置智能 ADK 智能体',
      placeholder: '输入分析指令（例如：“分析城市核心区充电负荷与电网承载异常”）',
      send: '立即执行',
      thinking: '智能体正在跨 MCP 服务链式推演...',
      executingMcp: '调用 MCP 空间工具',
      reasoningTrace: '推演与执行轨迹',
      suggestedPrompts: '推荐分析场景',
      sqlGenerated: 'BigQuery 空间 SQL',
      spatialInsights: '空间智能洞察结论',
    },
    map: {
      heatmap: '交互式热力图',
      clustering: '多层聚类分析',
      telemetry: '实时遥测数据流',
      anomalies: '突发关键异常点',
      isochrones: '通行时间等时圈',
      layers: '空间图层控制',
      intensity: '热力图强度',
      radius: '扩散半径',
      colorScheme: '配色方案',
      pointsLoaded: '在载数据点',
      zoomIn: '放大',
      zoomOut: '缩小',
      resetView: '居中复位',
    },
    anomalies: {
      title: '自动化异常监测告警流',
      critical: '紧急告警',
      warning: '高危预警',
      info: '提示信息',
      activeAlerts: '当前活跃异常',
      acknowledge: '确认告警',
      resolve: '标记解决',
      zScore: '异常 Z 分数',
      baseline: '历史基准',
      observed: '实测突增',
    },
    rbac: {
      title: '基于角色的权限控制 (RBAC) 与合规审计',
      role: '当前角色',
      tenant: '所属租户',
      permissions: '权限矩阵配置',
      superAdmin: '超级管理员',
      analyst: '空间分析师',
      lead: '运营总监',
      viewer: '业务观察员',
      complianceStatus: '合规安全状态',
    },
    reports: {
      title: '空间态势分析研报',
      exportPdf: '导出 PDF 简报',
      exportCsv: '导出原始数据 CSV',
      scheduleReport: '配置定时邮件递送',
      frequency: '调度周期',
      recipients: '接收人邮箱',
      sendNow: '立即模拟发送',
      lastSent: '最后投递时间',
    },
    offline: {
      online: '云端实时同步',
      offlineMode: '离线作业模拟',
      queuedSync: '待同步队列',
      syncNow: '立即提交同步',
      syncedSuccess: '离线变更已成功提交至 BigQuery 仓库',
    },
  },
};
