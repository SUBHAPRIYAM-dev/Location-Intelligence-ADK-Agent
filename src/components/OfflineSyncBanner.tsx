import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { OfflineQueueItem, LanguageCode } from '../types';
import { translations } from '../i18n';

interface OfflineSyncBannerProps {
  isOffline: boolean;
  offlineQueue: OfflineQueueItem[];
  onSyncAll: () => Promise<void>;
  isSyncing: boolean;
  language: LanguageCode;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({
  isOffline,
  offlineQueue,
  onSyncAll,
  isSyncing,
  language,
}) => {
  const t = translations[language];

  if (!isOffline && offlineQueue.length === 0) return null;

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-amber-200">
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
        <div>
          <span className="font-bold text-amber-300">
            {isOffline ? t.offline.offlineMode : 'Pending Offline Operations'}:
          </span>{' '}
          <span className="text-slate-300">
            {offlineQueue.length > 0 
              ? `${offlineQueue.length} ${t.offline.pendingOperations}` 
              : 'App is running in offline cache mode. Queries will be queued locally.'}
          </span>
        </div>
      </div>

      {offlineQueue.length > 0 && (
        <button
          onClick={onSyncAll}
          disabled={isSyncing}
          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? t.offline.syncing : t.offline.syncNow}</span>
        </button>
      )}
    </div>
  );
};
