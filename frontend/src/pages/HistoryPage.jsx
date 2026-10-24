import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  History, 
  Calendar, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  FileText, 
  X,
  Heart,
  Moon,
  ShieldCheck
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function HistoryPage({ onNavigate }) {
  const [historyData, setHistoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getAssessmentHistory();
      setHistoryData(res.assessments || []);
      setTrendData(res.seven_day_trend || []);
    } catch (err) {
      console.error('Failed to fetch assessment history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier) => {
    if (tier === 'High Risk') return 'bg-rose-100 text-rose-800 border-rose-200';
    if (tier === 'Moderate Risk') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  // Mock comparison chart if not enough history
  const sleepVsHrData = trendData.length > 0 ? trendData : [
    { date: 'Mon', sleep_hours: 7.2, resting_heart_rate: 66, wellness_score: 78 },
    { date: 'Tue', sleep_hours: 7.5, resting_heart_rate: 64, wellness_score: 82 },
    { date: 'Wed', sleep_hours: 6.5, resting_heart_rate: 70, wellness_score: 74 },
    { date: 'Thu', sleep_hours: 7.0, resting_heart_rate: 67, wellness_score: 79 },
    { date: 'Fri', sleep_hours: 7.8, resting_heart_rate: 63, wellness_score: 85 },
    { date: 'Sat', sleep_hours: 8.2, resting_heart_rate: 61, wellness_score: 88 },
    { date: 'Sun', sleep_hours: 7.6, resting_heart_rate: 65, wellness_score: 84 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5 text-teal-600" />
            <span>Longitudinal Record</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Assessment History & Trends
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Review your past well-being screenings, score trajectory, and factor correlations over time.
          </p>
        </div>

        <button
          onClick={() => onNavigate('questionnaire')}
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-2xl shadow-xs transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>New Daily Check-In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dual Longitudinal Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: WellSense Score Trajectory */}
        <div className="bg-white rounded-3xl p-6 shadow-subtle border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Well-Being Score Trajectory</h3>
              <p className="text-[11px] text-gray-400">0-100 scale over recorded screenings</p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
              Score Target: &gt;70
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sleepVsHrData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" tickLine={false} stroke="#9CA3AF" fontSize={11} />
                <YAxis domain={[30, 100]} tickLine={false} stroke="#9CA3AF" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '16px', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', 
                    border: '1px solid #E5E7EB',
                    fontSize: '12px'
                  }} 
                />
                <Line type="monotone" dataKey="wellness_score" name="WellSense Score" stroke="#14B8A6" strokeWidth={3} dot={{ r: 4, fill: '#0D9488' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Sleep vs. Resting Heart Rate Correlation */}
        <div className="bg-white rounded-3xl p-6 shadow-subtle border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Physiology: Sleep vs. Heart Rate</h3>
              <p className="text-[11px] text-gray-400">Nightly sleep hours plotted against resting HR</p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-gray-500">
              <span className="flex items-center space-x-1 text-indigo-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>Sleep (hrs)</span>
              </span>
              <span className="flex items-center space-x-1 text-rose-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Resting HR (bpm)</span>
              </span>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepVsHrData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" tickLine={false} stroke="#9CA3AF" fontSize={11} />
                <YAxis yAxisId="left" orientation="left" stroke="#6366F1" fontSize={11} domain={[0, 12]} />
                <YAxis yAxisId="right" orientation="right" stroke="#F43F5E" fontSize={11} domain={[40, 110]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '16px', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', 
                    border: '1px solid #E5E7EB',
                    fontSize: '12px'
                  }} 
                />
                <Bar yAxisId="left" dataKey="sleep_hours" name="Sleep (hrs)" fill="#818CF8" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="resting_heart_rate" name="Resting HR" stroke="#F43F5E" strokeWidth={2} dot={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Historical Assessments Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-subtle border border-gray-100 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Past Screening Records</h2>
          <p className="text-xs text-gray-500">Click any check-in entry to review full XAI contributing factors.</p>
        </div>

        {historyData.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <Calendar className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="text-sm font-semibold text-gray-700">No Check-In History Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Your historical screening records and trend insights will automatically appear here once you complete your first check-in.
            </p>
            <button
              onClick={() => onNavigate('questionnaire')}
              className="mt-2 px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Take Your First Check-In
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Screening Tier</th>
                  <th className="py-3 px-4">WellSense Score</th>
                  <th className="py-3 px-4">Sleep & HR</th>
                  <th className="py-3 px-4">Top Influential Factor</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historyData.map((item) => {
                  const dt = new Date(item.timestamp);
                  const pred = item.prediction_result;
                  const topFactor = pred?.top_contributing_factors?.[0]?.display_name || 'Multi-factor';
                  return (
                    <tr 
                      key={item.id}
                      onClick={() => setSelectedAssessment(item)}
                      className="hover:bg-gray-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        {dt.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        <span className="text-[10px] text-gray-400 block font-normal">
                          {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${getTierBadge(item.tier_label)}`}>
                          {item.tier_label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-base font-bold text-gray-900">{item.wellness_score}</span>
                        <span className="text-gray-400 text-[10px]"> / 100</span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600">
                        <span>{item.raw_inputs?.sleep_hours}h sleep</span>
                        <span className="text-gray-400 block text-[10px]">{item.raw_inputs?.resting_heart_rate} bpm RHR</span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-700">
                        <span className="font-medium">{topFactor}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedAssessment(item); }}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-[11px] transition-colors"
                        >
                          View Breakdown
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Assessment Drawer / Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <span className="text-[11px] text-gray-400 font-medium">Historical Screening Details</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Assessment on {new Date(selectedAssessment.timestamp).toLocaleString()}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Tier Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div>
                <span className="text-xs text-gray-500">Screening Tier:</span>
                <div className="text-lg font-extrabold text-gray-900 mt-0.5">
                  {selectedAssessment.tier_label}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">WellSense Score:</span>
                <div className="text-3xl font-black text-teal-600">
                  {selectedAssessment.wellness_score} <span className="text-xs text-gray-400">/ 100</span>
                </div>
              </div>
            </div>

            {/* Factors list */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Key Contributing Factors (XAI)
              </h4>
              <div className="space-y-2">
                {selectedAssessment.prediction_result?.top_contributing_factors?.map((f, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-900">{f.display_name}</span>
                      <p className="text-gray-500 text-[11px] mt-0.5">{f.insight}</p>
                    </div>
                    <span className="font-bold text-gray-700 ml-4 flex-shrink-0">
                      {f.importance_percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Counsellor Notes (if any) */}
            {selectedAssessment.counsellor_notes && (
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs">
                <span className="font-bold text-teal-950 block mb-1">Counsellor Review Note:</span>
                <p className="text-teal-800 leading-relaxed">{selectedAssessment.counsellor_notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedAssessment(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
