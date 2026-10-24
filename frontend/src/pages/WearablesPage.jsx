import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  Activity, 
  Watch, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Heart, 
  Moon, 
  Footprints, 
  Lock, 
  ExternalLink,
  Smartphone
} from 'lucide-react';

export default function WearablesPage() {
  const [wearablesData, setWearablesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'fitbit' | 'google_health' | 'apple_health'
  const [consentGranted, setConsentGranted] = useState(true);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getWearablesStatus();
      setWearablesData(res.wearables || []);
    } catch (err) {
      console.error('Failed to fetch wearables status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider) => {
    try {
      setActionLoading(true);
      await api.connectWearable(provider, consentGranted);
      setActiveModal(null);
      await fetchStatus();
      setSyncStatusMsg(`Successfully linked ${provider} via student research telemetry bridge.`);
      setTimeout(() => setSyncStatusMsg(''), 4000);
    } catch (err) {
      alert(`Connection failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSync = async (provider) => {
    try {
      setActionLoading(true);
      await api.syncWearable(provider);
      await fetchStatus();
      setSyncStatusMsg(`Re-synced telemetry from ${provider}.`);
      setTimeout(() => setSyncStatusMsg(''), 3000);
    } catch (err) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async (provider) => {
    if (!window.confirm(`Disconnect ${provider} and revoke telemetry access?`)) return;
    try {
      setActionLoading(true);
      await api.disconnectWearable(provider);
      await fetchStatus();
      setSyncStatusMsg(`Disconnected ${provider} and purged local sensor telemetry.`);
      setTimeout(() => setSyncStatusMsg(''), 3000);
    } catch (err) {
      alert(`Disconnection failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          <span>Wearable Sensor Telemetry Bridge</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Connect Health & Smartwatch Devices
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Link your wearable to automatically incorporate sleep duration, resting heart rate, and daily activity into your well-being screening.
        </p>
      </div>

      {syncStatusMsg && (
        <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs font-medium text-teal-900 flex items-center justify-between animate-fade-in">
          <span>{syncStatusMsg}</span>
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
        </div>
      )}

      {/* Wearable Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wearablesData.map((device) => {
          const isConnected = device.status === 'connected';
          return (
            <div 
              key={device.provider} 
              className="bg-white rounded-3xl p-6 shadow-subtle border border-gray-100 flex flex-col justify-between space-y-6"
            >
              <div>
                {/* Device Title & Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{device.provider_name}</h3>
                    <p className="text-[11px] text-gray-400">{device.protocol}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                    isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                    <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                  </span>
                </div>

                {/* Telemetry Preview (if connected) */}
                {isConnected && device.telemetry ? (
                  <div className="space-y-2 mb-4 bg-gray-50/70 p-3 rounded-2xl border border-gray-100 text-xs">
                    <div className="flex justify-between items-center text-gray-600">
                      <span className="flex items-center space-x-1 text-rose-600">
                        <Heart className="w-3.5 h-3.5 fill-rose-500" />
                        <span>Resting HR:</span>
                      </span>
                      <span className="font-bold text-gray-900">{device.telemetry.resting_heart_rate} bpm</span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                      <span className="flex items-center space-x-1 text-indigo-600">
                        <Moon className="w-3.5 h-3.5 fill-indigo-500" />
                        <span>Sleep Time:</span>
                      </span>
                      <span className="font-bold text-gray-900">{device.telemetry.sleep_hours} hrs</span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                      <span className="flex items-center space-x-1 text-teal-600">
                        <Footprints className="w-3.5 h-3.5" />
                        <span>Daily Steps:</span>
                      </span>
                      <span className="font-bold text-gray-900">{device.telemetry.daily_steps.toLocaleString()}</span>
                    </div>

                    <div className="pt-2 mt-2 border-t border-gray-200/60 text-[10px] text-gray-400 flex justify-between">
                      <span>Simulated student sensor signal</span>
                      <span>Battery: {device.telemetry.device_battery}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 mb-4">
                    <Smartphone className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                    <span>Device not connected.</span>
                  </div>
                )}

                {/* Required Scopes Breakdown */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Permitted Scopes
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {device.scopes.map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {!isConnected ? (
                  <button
                    onClick={() => setActiveModal(device.provider)}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <span>Connect {device.provider_name.split(' ')[0]}</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSync(device.provider)}
                      disabled={actionLoading}
                      className="py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sync</span>
                    </button>
                    <button
                      onClick={() => handleDisconnect(device.provider)}
                      disabled={actionLoading}
                      className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Transparent Integration Notice Box */}
      <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-subtle space-y-3">
        <div className="flex items-center space-x-2 text-teal-800">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-sm text-gray-900">Academic Project Telemetry Notice</h3>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          In production environments, connecting Google Health Connect or Apple HealthKit requires a companion Android Jetpack or native iOS mobile bridge. For B.Tech academic evaluation, this platform features an interactive simulated telemetry engine that generates realistic biometric patterns with physiological correlations (e.g. sleep hours affecting resting heart rate). The app remains 100% usable without any connected wearable.
        </p>
      </div>

      {/* Simulated Authorization Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center space-x-3 text-teal-700">
              <div className="p-2.5 rounded-2xl bg-teal-50">
                <Lock className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Authorize Health Data Access</h3>
                <p className="text-xs text-gray-500">OAuth 2.0 PKCE / HealthKit Consent Flow</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              WellSense AI is requesting read-only permission to access:
            </p>

            <ul className="space-y-2 text-xs text-gray-700 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Resting Heart Rate (Autonomic baseline)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Sleep Analysis (Duration & sleep cycles)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Step Count & Active Movement</span>
              </li>
            </ul>

            <div className="flex items-center space-x-2 text-xs text-gray-600 pt-1">
              <input
                type="checkbox"
                id="modalConsent"
                checked={consentGranted}
                onChange={(e) => setConsentGranted(e.target.checked)}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="modalConsent">
                I explicitly grant consent for WellSense AI to process these metrics for wellness screening.
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Deny & Cancel
              </button>
              <button
                type="button"
                disabled={!consentGranted || actionLoading}
                onClick={() => handleConnect(activeModal)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-xs transition-colors"
              >
                {actionLoading ? 'Connecting...' : 'Authorize & Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
