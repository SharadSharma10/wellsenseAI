import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { 
  User, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Award,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function ProfilePrivacyPage() {
  const { user, refreshProfile, logout } = useAuth();
  
  const [dataCollection, setDataCollection] = useState(user?.consent_data_collection ?? true);
  const [wearableConsent, setWearableConsent] = useState(user?.consent_wearable_telemetry ?? true);
  const [counsellorConsent, setCounsellorConsent] = useState(user?.consent_counsellor_sharing ?? true);
  
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDataCollection(Boolean(user.consent_data_collection));
      setWearableConsent(Boolean(user.consent_wearable_telemetry));
      setCounsellorConsent(Boolean(user.consent_counsellor_sharing));
    }
  }, [user]);

  const handleSaveConsent = async () => {
    try {
      setSaving(true);
      await api.updateConsent({
        consent_data_collection: dataCollection,
        consent_wearable_telemetry: wearableConsent,
        consent_counsellor_sharing: counsellorConsent
      });
      await refreshProfile();
      setSaveMsg('Privacy preferences updated successfully.');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      alert(`Failed to update consent: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      const data = await api.exportUserData();
      
      // Trigger browser download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WellSense_Data_Export_${user?.full_name?.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'Are you sure you want to delete your WellSense account? This will permanently erase your profile, past check-ins, and connected telemetry. Type DELETE to confirm:'
    );
    if (confirmation !== 'DELETE') return;

    try {
      await api.deleteAccount();
      alert('Your account and all associated data have been permanently erased.');
      logout();
    } catch (err) {
      alert(`Failed to delete account: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Security & Data Autonomy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Profile & Privacy Controls
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Manage your student identity, explicit consent permissions, data export, and right to be forgotten.
        </p>
      </div>

      {saveMsg && (
        <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs font-medium text-teal-900 flex items-center justify-between animate-fade-in">
          <span>{saveMsg}</span>
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-subtle border border-gray-100 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-primary-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-gray-900">{user?.full_name || 'Aarav Sharma'}</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {user?.department || 'Computer Science & Engineering'} • {user?.year || '4th Year'}
            </p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Explicit Consent Settings Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-subtle border border-gray-100 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Consent & Telemetry Permissions</h3>
          <p className="text-xs text-gray-500">
            Granular controls over how WellSense AI processes your subjective responses and wearable metrics.
          </p>
        </div>

        <div className="space-y-4 divide-y divide-gray-100">
          {/* Toggle 1: Data Collection */}
          <div className="pt-3 flex items-center justify-between">
            <div className="pr-4">
              <h4 className="text-sm font-bold text-gray-900">Daily Assessment Collection</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Allows WellSense AI to store your check-in questionnaire answers to compute well-being scores.
              </p>
            </div>
            <button
              onClick={() => setDataCollection(!dataCollection)}
              className="text-primary-600 focus:outline-none"
            >
              {dataCollection ? (
                <ToggleRight className="w-8 h-8 text-primary-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-300" />
              )}
            </button>
          </div>

          {/* Toggle 2: Wearable Telemetry */}
          <div className="pt-4 flex items-center justify-between">
            <div className="pr-4">
              <h4 className="text-sm font-bold text-gray-900">Wearable Biometric Telemetry</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Permits reading resting heart rate, sleep duration, and daily steps from authorized devices.
              </p>
            </div>
            <button
              onClick={() => setWearableConsent(!wearableConsent)}
              className="text-primary-600 focus:outline-none"
            >
              {wearableConsent ? (
                <ToggleRight className="w-8 h-8 text-primary-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-300" />
              )}
            </button>
          </div>

          {/* Toggle 3: Counsellor Sharing */}
          <div className="pt-4 flex items-center justify-between">
            <div className="pr-4">
              <h4 className="text-sm font-bold text-gray-900">Campus Counsellor Triage Visibility</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Permits campus psychological services to view elevated stress scores for proactive wellness support.
              </p>
            </div>
            <button
              onClick={() => setCounsellorConsent(!counsellorConsent)}
              className="text-primary-600 focus:outline-none"
            >
              {counsellorConsent ? (
                <ToggleRight className="w-8 h-8 text-primary-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveConsent}
            disabled={saving}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* Data Export & Account Deletion (GDPR & Data Rights) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-subtle border border-gray-100 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Data Portability & Erasure</h3>
          <p className="text-xs text-gray-500">
            Export a machine-readable copy of your data or permanently delete your account.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-sm font-bold text-gray-900">Export Personal Dossier</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Download all your screening assessments, responses, and connected telemetry in JSON format.
              </p>
            </div>
            <button
              onClick={handleExportData}
              disabled={exportLoading}
              className="py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold text-xs rounded-xl border border-gray-200 shadow-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exportLoading ? 'Generating Export...' : 'Download My Data (JSON)'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-sm font-bold text-rose-950">Right to Erasure</h4>
              <p className="text-xs text-rose-800 mt-0.5">
                Permanently purge your account, check-in history, and connected wearable device records.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account & Purge Data</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
