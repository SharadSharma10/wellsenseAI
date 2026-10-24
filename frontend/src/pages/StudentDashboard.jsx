import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { 
  Sparkles, 
  ClipboardCheck, 
  Activity, 
  Moon, 
  Heart, 
  TrendingUp, 
  ArrowRight, 
  Calendar, 
  ShieldCheck, 
  Wind,
  Footprints,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart 
} from 'recharts';

export default function StudentDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [historySummary, setHistorySummary] = useState(null);
  const [wearablesStatus, setWearablesStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [historyRes, wearRes] = await Promise.all([
        api.getAssessmentHistory(),
        api.getWearablesStatus()
      ]);
      setHistorySummary(historyRes);
      if (historyRes.assessments && historyRes.assessments.length > 0) {
        setLatestAssessment(historyRes.assessments[0]);
      }
      setWearablesStatus(wearRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    if (tier === 'High Risk') return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' };
    if (tier === 'Moderate Risk') return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' };
    return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' };
  };

  // Mock 7-day trend if student has not taken checks yet
  const chartData = (historySummary?.seven_day_trend && historySummary.seven_day_trend.length > 0)
    ? historySummary.seven_day_trend
    : [
        { date: 'Mon', wellness_score: 78, sleep_hours: 7.2, resting_heart_rate: 66 },
        { date: 'Tue', wellness_score: 82, sleep_hours: 7.5, resting_heart_rate: 64 },
        { date: 'Wed', wellness_score: 74, sleep_hours: 6.5, resting_heart_rate: 70 },
        { date: 'Thu', wellness_score: 79, sleep_hours: 7.0, resting_heart_rate: 67 },
        { date: 'Fri', wellness_score: 85, sleep_hours: 7.8, resting_heart_rate: 63 },
        { date: 'Sat', wellness_score: 88, sleep_hours: 8.2, resting_heart_rate: 61 },
        { date: 'Sun', wellness_score: 84, sleep_hours: 7.6, resting_heart_rate: 65 },
      ];

  const currentScore = latestAssessment?.wellness_score ?? 84;
  const currentTier = latestAssessment?.tier_label ?? 'Low Risk';
  const tierStyle = getTierColor(currentTier);

  // Active connected wearable telemetry
  const connectedWearable = wearablesStatus?.wearables?.find(w => w.status === 'connected');
  const telemetry = connectedWearable?.telemetry || {
    resting_heart_rate: 66.0,
    sleep_hours: 7.4,
    sleep_efficiency: 88.0,
    daily_steps: 8420
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Welcome & Primary CTA Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-primary-500 rounded-3xl p-6 sm:p-8 text-white shadow-elevated relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-l-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-medium backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              <span>Campus Wellness Companion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Hello, {user?.full_name?.split(' ')[0] || 'Aarav'}
            </h1>
            <p className="text-teal-100 text-sm max-w-xl">
              Take 2 minutes to check in with your mind and body. Your screening is private, supportive, and non-judgmental.
            </p>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() => onNavigate('questionnaire')}
              className="flex items-center space-x-2 px-6 py-3.5 bg-white text-teal-800 hover:bg-teal-50 font-bold text-sm rounded-2xl shadow-lg transition-transform hover:scale-105"
            >
              <ClipboardCheck className="w-5 h-5 text-teal-600" />
              <span>Take Today's Check-In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. WellSense Score Card */}
        <div className="bg-white rounded-3xl p-6 shadow-subtle border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Current WellSense Score</span>
              <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                <span className={`w-2 h-2 rounded-full ${tierStyle.dot}`}></span>
                <span>{currentTier}</span>
              </span>
            </div>
            
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-5xl font-black text-gray-900">{currentScore}</span>
              <span className="text-sm font-semibold text-gray-400">/ 100</span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Derived from calibrated multi-factor risk inference. High scores represent healthy resilience and balanced autonomic regulation.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Last checked: {latestAssessment ? new Date(latestAssessment.timestamp).toLocaleDateString() : 'Today'}</span>
            </span>
            <button 
              onClick={() => onNavigate('history')} 
              className="text-primary-600 font-semibold hover:underline"
            >
              Details &rarr;
            </button>
          </div>
        </div>

        {/* 2. Wearable Telemetry Signal Card */}
        <div className="bg-white rounded-3xl p-6 shadow-subtle border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Wrist Telemetry Signals</span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {connectedWearable ? 'Live Connected' : 'Simulated Sample'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center space-x-1.5 text-rose-600 text-xs font-medium mb-1">
                  <Heart className="w-4 h-4 fill-rose-500" />
                  <span>Resting HR</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {telemetry.resting_heart_rate} <span className="text-xs font-normal text-gray-500">bpm</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center space-x-1.5 text-indigo-600 text-xs font-medium mb-1">
                  <Moon className="w-4 h-4 fill-indigo-500" />
                  <span>Sleep</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {telemetry.sleep_hours} <span className="text-xs font-normal text-gray-500">hrs</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center space-x-1.5 text-teal-600 text-xs font-medium mb-1">
                  <Footprints className="w-4 h-4" />
                  <span>Daily Steps</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {telemetry.daily_steps.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center space-x-1.5 text-amber-600 text-xs font-medium mb-1">
                  <Activity className="w-4 h-4" />
                  <span>Sleep Quality</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {telemetry.sleep_efficiency}%
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <span className="text-gray-400 text-[11px]">Synced via {connectedWearable?.provider_name || 'Fitbit/Apple Bridge'}</span>
            <button onClick={() => onNavigate('wearables')} className="text-primary-600 font-semibold hover:underline">
              Manage &rarr;
            </button>
          </div>
        </div>

        {/* 3. Mindful Recharge & Quick Actions */}
        <div className="bg-white rounded-3xl p-6 shadow-subtle border border-gray-100 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 block">Wellness Interventions</span>
            <h3 className="text-base font-bold text-gray-900 mb-1.5">Micro-Break: Vagus Reset</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              A 3-minute 4-7-8 breathing sequence lowers cortisol and slows sympathetic pulse during exam deadlines.
            </p>

            <button
              onClick={() => onNavigate('resources')}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-2xl text-xs font-bold border border-teal-200 transition-colors"
            >
              <Wind className="w-4 h-4 text-teal-600" />
              <span>Launch Guided Breathing</span>
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Confidential campus counsellors</span>
            <button onClick={() => onNavigate('resources')} className="text-primary-600 font-semibold hover:underline">
              Book session &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* 7-Day Trend Chart Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-subtle border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">7-Day Well-Being Trend</h2>
            <p className="text-xs text-gray-500">Tracking longitudinal stability in screening score and physiological recovery</p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-medium">
            <span className="flex items-center space-x-1.5 text-teal-700">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-500"></span>
              <span>WellSense Score (0-100)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              <span>Resting HR (bpm)</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="date" tickLine={false} stroke="#9CA3AF" fontSize={11} />
              <YAxis domain={[40, 100]} tickLine={false} stroke="#9CA3AF" fontSize={11} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '16px', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', 
                  border: '1px solid #E5E7EB',
                  fontSize: '12px'
                }} 
              />
              <Area type="monotone" dataKey="wellness_score" name="WellSense Score" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#scoreGradient)" />
              <Line type="monotone" dataKey="resting_heart_rate" name="Resting HR" stroke="#FB7185" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
