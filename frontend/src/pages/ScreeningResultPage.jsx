import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Wind, 
  Calendar, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  HelpCircle,
  HeartHandshake,
  Share2
} from 'lucide-react';

export default function ScreeningResultPage({ result, onNavigate }) {
  if (!result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">No recent screening result found.</p>
        <button
          onClick={() => onNavigate('student_dashboard')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const {
    tier_label,
    tier_color,
    tier_severity,
    wellness_score,
    class_probabilities,
    top_contributing_factors,
    recommendations,
    requires_counsellor_outreach,
    disclaimer
  } = result;

  const isLow = tier_severity === 'low';
  const isMod = tier_severity === 'moderate';
  const isHigh = tier_severity === 'high';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Banner: Score & Screening Tier */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-subtle border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Screening Triage Result</span>
            <span 
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
              style={{ 
                backgroundColor: isLow ? '#ECFDF5' : isMod ? '#FFFBEB' : '#FFF1F2',
                color: isLow ? '#065F46' : isMod ? '#92400E' : '#9F1239',
                borderColor: isLow ? '#A7F3D0' : isMod ? '#FDE68A' : '#FECDD3'
              }}
            >
              {tier_label}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {isLow && "Resilient & Balanced Well-Being"}
            {isMod && "Moderate Strain & Fatigue Detected"}
            {isHigh && "Elevated Emotional & Physical Strain"}
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 max-w-xl leading-relaxed">
            {isLow && "Your autonomic markers and questionnaire responses reflect positive cognitive functioning and healthy stress buffers."}
            {isMod && "Your inputs indicate noticeable academic pressure or sleep deficit. Proactive decompression can prevent progression to burnout."}
            {isHigh && "Your responses indicate heightened distress or prolonged autonomic strain. Supportive campus wellness guidance is strongly encouraged."}
          </p>
        </div>

        {/* 0-100 Score Dial */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 rounded-3xl bg-gray-50 border border-gray-100 min-w-[170px]">
          <span className="text-xs font-semibold text-gray-400 uppercase mb-1">WellSense Score</span>
          <div className="flex items-baseline space-x-1">
            <span 
              className="text-5xl font-black"
              style={{ color: tier_color }}
            >
              {wellness_score}
            </span>
            <span className="text-sm font-semibold text-gray-400">/ 100</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1">Calibrated Wellness Index</span>
        </div>
      </div>

      {/* Model Probability Breakdown & Disclaimer */}
      <div className="bg-primary-50/50 rounded-2xl p-4 border border-primary-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-primary-950 gap-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-primary-600 flex-shrink-0" />
          <span>
            <strong>Screening Disclaimer:</strong> {disclaimer}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-medium text-gray-600 whitespace-nowrap">
          <span>Low: {(class_probabilities.low_risk * 100).toFixed(0)}%</span>
          <span>Mod: {(class_probabilities.moderate_risk * 100).toFixed(0)}%</span>
          <span>High: {(class_probabilities.high_risk * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Explainable AI (XAI): Contributing Factors */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-subtle border border-gray-100 space-y-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Explainable AI (XAI) Attribution</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">What Factors Influenced This Screening?</h2>
          <p className="text-xs text-gray-500">
            Our machine learning model calculates local feature contributions to communicate why your score was categorized into this tier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {top_contributing_factors.map((factor, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-gray-900">{factor.display_name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    factor.is_risk_factor ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {factor.is_risk_factor ? 'Strain Factor' : 'Protective Buffer'}
                  </span>
                </div>

                {/* Progress attribution bar */}
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden my-2">
                  <div 
                    className={`h-full rounded-full ${factor.is_risk_factor ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(factor.importance_percentage * 2, 100)}%` }}
                  ></div>
                </div>

                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {factor.insight}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-200/60 flex justify-between items-center text-[11px] text-gray-400">
                <span>Weight: {factor.importance_percentage}% contribution</span>
                <span>Reported: {factor.raw_value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Wellness Recommendations */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-subtle border border-gray-100 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Personalized Wellness Recommendations</h2>
          <p className="text-xs text-gray-500">
            Supportive steps customized to your current physiological and academic inputs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="p-5 rounded-2xl border border-gray-100 bg-white shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
                    {rec.category}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400">{rec.badge}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">{rec.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{rec.description}</p>
              </div>

              {rec.action_type === 'breathing_tool' && (
                <button
                  onClick={() => onNavigate('resources')}
                  className="w-full py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1"
                >
                  <Wind className="w-3.5 h-3.5 text-teal-600" />
                  <span>Launch Breathing Exercise</span>
                </button>
              )}

              {rec.action_type === 'counsellor_booking' && (
                <button
                  onClick={() => onNavigate('resources')}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1"
                >
                  <Calendar className="w-3.5 h-3.5 text-rose-600" />
                  <span>Book Counsellor Consult</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <button
          onClick={() => onNavigate('history')}
          className="text-xs font-semibold text-gray-600 hover:text-gray-900 hover:underline"
        >
          &larr; View Historical Assessment Trends
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('resources')}
            className="px-5 py-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-colors"
          >
            Guided Breathing & Resources
          </button>
          <button
            onClick={() => onNavigate('student_dashboard')}
            className="px-6 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Done & Return to Dashboard
          </button>
        </div>
      </div>

    </div>
  );
}
