import React from 'react';
import SmartwatchPreview from '../components/SmartwatchPreview';
import { Watch, Sparkles, Activity, ShieldCheck, ArrowRight } from 'lucide-react';

export default function SmartwatchPage({ onNavigate }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold">
          <Watch className="w-3.5 h-3.5 text-teal-600" />
          <span>Wrist Wearable Companion</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Smartwatch Experience Preview
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Interactive digital bezel simulating Apple Watch / Wear OS companion app. Test continuous heart rate pulse and one-tap wrist check-ins.
        </p>
      </div>

      {/* Main Interactive Watch Display */}
      <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-subtle border border-gray-100 flex flex-col items-center justify-center">
        <SmartwatchPreview onLaunchCheckin={() => onNavigate('questionnaire')} />
      </div>

      {/* Capabilities Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-2">
          <div className="text-rose-600 font-bold text-xs flex items-center space-x-1">
            <Activity className="w-4 h-4" />
            <span>Passive Autonomic Sensing</span>
          </div>
          <p className="text-xs text-gray-500">
            Measures continuous resting heart rate baseline to recognize prolonged sympathetic stress elevation.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-2">
          <div className="text-teal-600 font-bold text-xs flex items-center space-x-1">
            <Sparkles className="w-4 h-4" />
            <span>1-Tap Micro Check-Ins</span>
          </div>
          <p className="text-xs text-gray-500">
            Enables instant discrete emotional logging on the wrist without needing to open a smartphone app.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-2">
          <div className="text-indigo-600 font-bold text-xs flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted Synchronization</span>
          </div>
          <p className="text-xs text-gray-500">
            All telemetry is locally staged and encrypted before syncing with the student's personal account.
          </p>
        </div>
      </div>

    </div>
  );
}
