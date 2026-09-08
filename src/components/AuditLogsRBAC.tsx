import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { AuditLogEntry, Tenant, UserRole, LanguageCode } from '../types';
import { translations } from '../i18n';

interface AuditLogsRBACProps {
  auditLogs: AuditLogEntry[];
  tenants: Tenant[];
  activeTenant: Tenant;
  currentUserRole: UserRole;
  language: LanguageCode;
  isDarkMode: boolean;
}

export const AuditLogsRBAC: React.FC<AuditLogsRBACProps> = ({
  auditLogs,
  tenants,
  activeTenant,
  currentUserRole,
  language,
  isDarkMode,
}) => {
  const t = translations[language];
  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'rbac' | 'tenants'>('logs');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'allowed' | 'denied'>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Filtered audit logs
  const filteredLogs = auditLogs.filter(log => {
    if (statusFilter !== 'all' && log.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.userName.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        log.targetResource.toLowerCase().includes(term) ||
        log.tenantName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Export audit logs to CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Tenant', 'Action', 'Target Resource', 'Status', 'IP'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      `"${l.tenantName}"`,
      l.action,
      `"${l.targetResource}"`,
      l.status,
      l.ipAddress
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `adk_audit_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rbacPermissions = [
    { name: 'View Geospatial Maps & Telemetry', super_admin: true, geospatial_analyst: true, operations_lead: true, viewer: true },
    { name: 'Execute BigQuery Spatial SQL', super_admin: true, geospatial_analyst: true, operations_lead: false, viewer: false },
    { name: 'Invoke Google Maps MCP Tools', super_admin: true, geospatial_analyst: true, operations_lead: true, viewer: false },
    { name: 'Run ADK Conversational Agent Queries', super_admin: true, geospatial_analyst: true, operations_lead: true, viewer: false },
    { name: 'Acknowledge & Resolve Anomalies', super_admin: true, geospatial_analyst: true, operations_lead: true, viewer: false },
    { name: 'Export Reports (PDF / CSV)', super_admin: true, geospatial_analyst: true, operations_lead: true, viewer: true },
    { name: 'Configure Automated Scheduled Reports', super_admin: true, geospatial_analyst: false, operations_lead: true, viewer: false },
    { name: 'Multi-Tenant Partition Administration', super_admin: true, geospatial_analyst: false, operations_lead: false, viewer: false },
  ];

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto space-y-6 ${
      isDarkMode ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Header & Sub-tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
            <span>Governance, RBAC & Compliance Audit</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable Activity Ledger • Role Matrix Enforcement • Multi-Tenant Isolation
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center rounded-xl p-1 bg-slate-800/80 border border-slate-700 text-xs">
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubTab === 'logs' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('rbac')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubTab === 'rbac' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RBAC Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('tenants')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubTab === 'tenants' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tenants ({tenants.length})
          </button>
        </div>
      </div>

      {/* 1. Audit Logs Sub-tab */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user, action, resource, or tenant..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border outline-none ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className={`px-3 py-2 rounded-xl text-xs border outline-none ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <option value="all">All Statuses</option>
                <option value="allowed">Allowed</option>
                <option value="denied">Denied</option>
              </select>

              <button
                id="export-audit-csv-btn"
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className={`rounded-2xl border overflow-hidden shadow-sm ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-[11px] uppercase tracking-wider font-semibold ${
                  isDarkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">User & Role</th>
                    <th className="p-3.5">Tenant</th>
                    <th className="p-3.5">Action Executed</th>
                    <th className="p-3.5">Target Resource</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLogs.map(log => (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        selectedLog?.id === log.id ? 'bg-slate-800/60' : ''
                      }`}
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="p-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{log.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono capitalize">{log.userRole.replace('_', ' ')}</div>
                      </td>
                      <td className="p-3.5 text-slate-300 font-medium whitespace-nowrap">
                        {log.tenantName}
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-[11px] text-sky-400 font-medium">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400 max-w-[220px] truncate">
                        {log.targetResource}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          log.status === 'allowed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Audit Log Details Drawer */}
          {selectedLog && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-sky-400" />
                  Audit Event Inspector: {selectedLog.id}
                </span>
                <span className="font-mono text-xs text-slate-400">IP: {selectedLog.ipAddress}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Action</span>
                  <span className="font-semibold text-slate-200">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Caller</span>
                  <span className="font-semibold text-slate-200">{selectedLog.userName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Tenant</span>
                  <span className="font-semibold text-slate-200">{selectedLog.tenantName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Decision</span>
                  <span className="font-bold text-emerald-400 uppercase">{selectedLog.status}</span>
                </div>
              </div>

              {selectedLog.metadata && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block mb-1">Payload & Execution Metadata</span>
                  <pre className="text-[11px] font-mono text-sky-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. RBAC Matrix Sub-tab */}
      {activeSubTab === 'rbac' && (
        <div className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <h3 className="font-bold text-sm text-slate-200">
              Role-Based Access Control (RBAC) Permission Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Granular access policies enforced at the API gateway, BigQuery MCP, and frontend views
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b text-[11px] uppercase tracking-wider font-semibold ${
                isDarkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <tr>
                  <th className="p-3.5">Capability / Operation</th>
                  <th className="p-3.5 text-center">Super Admin</th>
                  <th className="p-3.5 text-center">Geospatial Analyst</th>
                  <th className="p-3.5 text-center">Operations Lead</th>
                  <th className="p-3.5 text-center">Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rbacPermissions.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-medium text-slate-200">{p.name}</td>
                    <td className="p-3.5 text-center">
                      {p.super_admin ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /> : <XCircle className="h-4 w-4 text-slate-600 mx-auto" />}
                    </td>
                    <td className="p-3.5 text-center">
                      {p.geospatial_analyst ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /> : <XCircle className="h-4 w-4 text-slate-600 mx-auto" />}
                    </td>
                    <td className="p-3.5 text-center">
                      {p.operations_lead ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /> : <XCircle className="h-4 w-4 text-slate-600 mx-auto" />}
                    </td>
                    <td className="p-3.5 text-center">
                      {p.viewer ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /> : <XCircle className="h-4 w-4 text-slate-600 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Tenants Sub-tab */}
      {activeSubTab === 'tenants' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tenants.map(ten => {
            const isCurrent = ten.id === activeTenant.id;
            return (
              <div
                key={ten.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'border-indigo-500 ring-1 ring-indigo-500/40 bg-slate-800/80 shadow-md'
                    : isDarkMode
                    ? 'bg-slate-900/60 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <Building2 className="h-5 w-5" />
                  </div>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      Active Partition
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-sm text-slate-100">{ten.name}</h4>
                <div className="text-xs text-slate-400 font-mono mt-1">Region: {ten.region}</div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dataset Isolation:</span>
                    <span className="font-mono text-emerald-400">Enforced (Row-Level)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">BigQuery Project:</span>
                    <span className="font-mono text-slate-200">adk-prod-{ten.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Nodes:</span>
                    <span className="font-mono text-sky-400">2,480 points</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
