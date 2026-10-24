import React, { useState } from 'react';
import { AlertCircle, X, ShieldCheck } from 'lucide-react';

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-primary-50/80 border-b border-primary-100 text-teal-900 px-4 py-2.5 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-1 rounded-full bg-primary-100 text-primary-600 flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="font-normal text-teal-950">
            <strong className="font-semibold text-primary-800">Supportive Screening Aid:</strong> WellSense AI assesses subjective and physiological strain patterns to recommend early wellness care. It is <span className="underline decoration-teal-400 font-medium">not a clinical diagnostic tool</span>.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-teal-700 hover:text-teal-950 p-1 rounded-md transition-colors"
          title="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
