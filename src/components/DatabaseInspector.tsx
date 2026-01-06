/**
 * Database Inspector Component
 * 
 * Developer tool for inspecting and managing database stores.
 * Only available in development mode.
 * 
 * Features:
 * - List all object stores/tables
 * - Show record counts per store
 * - Export JSON dumps
 * - Clear/delete operations (dev only)
 */

import React, { useState, useEffect } from 'react';
import { db } from '../services/dexieDB';
import { getDatabaseAdapter, isEncryptionEnabled } from '../services/databaseAdapter';
import { isDatabaseInspectorEnabled } from '../constants/environment';
import { runDeploymentDiagnostics, logDeploymentDiagnostics, exportDiagnostics } from '../utils/deploymentDiagnostics';

interface StoreInfo {
  name: string;
  count: number;
  type: 'indexeddb' | 'sqlite';
  error?: string;
}

export const DatabaseInspector: React.FC = () => {
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<any[]>([]);
  const [exportData, setExportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState<any>(null);

  // Check if inspector is enabled (dev mode only)
  if (!isDatabaseInspectorEnabled()) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Database Inspector Disabled</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">This tool is only available in development mode.</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 italic">
          Development mode only — not available in production.
        </p>
      </div>
    );
  }

  // Load store information
  useEffect(() => {
    loadStoreInfo();
  }, []);

  const loadStoreInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const storeList: StoreInfo[] = [];
      
      // Get all Dexie stores
      const dexieStoreNames = [
        'users',
        'appData',
        'values',
        'goals',
        'feelingLogs',
        'userInteractions',
        'sessions',
        'assessments',
        'reports',
        'resetTokens',
        'metadata',
        'ruleBasedUsageLogs',
      ];

      for (const storeName of dexieStoreNames) {
        try {
          const table = (db as any)[storeName];
          if (table) {
            const count = await table.count();
            storeList.push({
              name: storeName,
              count,
              type: 'indexeddb',
            });
          }
        } catch (err: any) {
          storeList.push({
            name: storeName,
            count: 0,
            type: 'indexeddb',
            error: err.message || 'Error loading store',
          });
        }
      }

      // If encryption is enabled, try to get SQLite table info
      if (isEncryptionEnabled()) {
        try {
          const adapter = getDatabaseAdapter();
          // Note: SQLite table inspection would require additional methods
          // For now, we'll just note that encryption is enabled
          storeList.push({
            name: 'encrypted_sqlite',
            count: -1, // Unknown count
            type: 'sqlite',
          });
        } catch (err) {
          // Ignore SQLite errors for now
        }
      }

      setStores(storeList);
    } catch (err: any) {
      setError(err.message || 'Failed to load store information');
    } finally {
      setLoading(false);
    }
  };

  const loadStoreData = async (storeName: string) => {
    setSelectedStore(storeName);
    setLoading(true);
    setError(null);

    try {
      const table = (db as any)[storeName];
      if (!table) {
        throw new Error(`Store ${storeName} not found`);
      }

      const data = await table.toArray();
      setStoreData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load store data');
      setStoreData([]);
    } finally {
      setLoading(false);
    }
  };

  const clearStore = async (storeName: string) => {
    if (!confirm(`Are you sure you want to clear all data from "${storeName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const table = (db as any)[storeName];
      if (!table) {
        throw new Error(`Store ${storeName} not found`);
      }

      await table.clear();
      await loadStoreInfo();
      if (selectedStore === storeName) {
        setStoreData([]);
      }
      alert(`Store "${storeName}" cleared successfully.`);
    } catch (err: any) {
      setError(err.message || 'Failed to clear store');
    }
  };

  const exportStore = async (storeName: string) => {
    try {
      const table = (db as any)[storeName];
      if (!table) {
        throw new Error(`Store ${storeName} not found`);
      }

      const data = await table.toArray();
      const json = JSON.stringify(data, null, 2);
      
      // Create download link
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${storeName}_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to export store');
    }
  };

  const exportAllData = async () => {
    try {
      const allData: any = {};
      
      for (const store of stores) {
        if (store.type === 'indexeddb' && !store.error) {
          try {
            const table = (db as any)[store.name];
            if (table) {
              allData[store.name] = await table.toArray();
            }
          } catch (err) {
            allData[store.name] = { error: String(err) };
          }
        }
      }

      const json = JSON.stringify(allData, null, 2);
      setExportData(allData);
      
      // Create download link
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grounded_db_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to export all data');
    }
  };

  const deleteDatabase = async () => {
    if (!confirm('Are you sure you want to DELETE THE ENTIRE DATABASE? This cannot be undone and will delete all user data!')) {
      return;
    }

    if (!confirm('This is your LAST WARNING. All data will be permanently deleted. Continue?')) {
      return;
    }

    try {
      await db.delete();
      alert('Database deleted. Please refresh the page.');
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to delete database');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Database Inspector
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Development tool for inspecting and managing database stores
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic">
                ⚠️ Development mode only — not available in production.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={loadStoreInfo}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Refresh
              </button>
              <button
                onClick={exportAllData}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Export All
              </button>
              <button
                onClick={async () => {
                  const result = await runDeploymentDiagnostics();
                  setDiagnosticsResult(result);
                  setShowDiagnostics(true);
                  logDeploymentDiagnostics(result);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              >
                Run Diagnostics
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded">
              {error}
            </div>
          )}

          {loading && stores.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading store information...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((store) => (
                <div
                  key={store.name}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{store.name}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      {store.type}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {store.count === -1 ? '?' : store.count.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">records</span>
                  </div>

                  {store.error && (
                    <div className="mb-2 text-xs text-red-600 dark:text-red-400">
                      Error: {store.error}
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {store.type === 'indexeddb' && !store.error && (
                      <>
                        <button
                          onClick={() => loadStoreData(store.name)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => exportStore(store.name)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          Export
                        </button>
                        <button
                          onClick={() => clearStore(store.name)}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedStore && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Store: {selectedStore}
              </h2>
              <button
                onClick={() => setSelectedStore(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading data...</p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {storeData.length} record{storeData.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="max-h-96 overflow-auto border border-gray-200 dark:border-gray-700 rounded">
                  <pre className="p-4 text-xs bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    {JSON.stringify(storeData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {showDiagnostics && diagnosticsResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Deployment Diagnostics
              </h2>
              <button
                onClick={() => setShowDiagnostics(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Origin</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{diagnosticsResult.origin.current}</code>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Is Production: {diagnosticsResult.origin.isProduction ? '✅' : '❌'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Is Preview: {diagnosticsResult.origin.isPreview ? '⚠️ Yes' : 'No'}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dexie Database</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Expected Version: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{diagnosticsResult.dexie.expectedVersion}</code>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Actual Version: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{diagnosticsResult.dexie.version}</code>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Version Match: {diagnosticsResult.dexie.versionMatch ? '✅' : '❌'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Database Exists: {diagnosticsResult.dexie.databaseExists ? '✅' : '❌'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stores Count: {diagnosticsResult.dexie.storesCount}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Storage</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  IndexedDB Usage: {diagnosticsResult.storage.indexedDBUsage 
                    ? `${(diagnosticsResult.storage.indexedDBUsage / 1024 / 1024).toFixed(2)} MB`
                    : 'Unknown'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  localStorage Keys: {diagnosticsResult.storage.localStorageKeys.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Has Auth Data: {diagnosticsResult.storage.hasAuthData ? '✅' : '❌'}
                </p>
              </div>
              
              {diagnosticsResult.issues.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">Issues</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {diagnosticsResult.issues.map((issue: string, idx: number) => (
                      <li key={idx} className="text-sm text-red-600 dark:text-red-400">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {diagnosticsResult.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {diagnosticsResult.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="text-sm text-blue-600 dark:text-blue-400">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <button
                onClick={async () => {
                  const json = await exportDiagnostics();
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `deployment-diagnostics-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              >
                Export Diagnostics JSON
              </button>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Dangerous Operations
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                Delete Entire Database
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                This will permanently delete all data from the database. This action cannot be undone.
              </p>
              <button
                onClick={deleteDatabase}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Delete Database
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseInspector;

