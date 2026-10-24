import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';

import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import QuestionnairePage from './pages/QuestionnairePage';
import ScreeningResultPage from './pages/ScreeningResultPage';
import SupportResourcesPage from './pages/SupportResourcesPage';
import WearablesPage from './pages/WearablesPage';
import HistoryPage from './pages/HistoryPage';
import SmartwatchPage from './pages/SmartwatchPage';
import CounsellorDashboard from './pages/CounsellorDashboard';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import ProfilePrivacyPage from './pages/ProfilePrivacyPage';

function AppContent() {
  const { user, isAuthenticated, loading, isStudent, isCounsellor, isAdmin } = useAuth();
  const [activePage, setActivePage] = useState('student_dashboard');
  const [latestResult, setLatestResult] = useState(null);

  // Set default page based on role when user logs in
  useEffect(() => {
    if (user) {
      if (user.role === 'counsellor') {
        setActivePage('counsellor_dashboard');
      } else if (user.role === 'admin') {
        setActivePage('admin_analytics');
      } else {
        setActivePage('student_dashboard');
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 font-medium">Loading WellSense AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={() => {}} />;
  }

  const handleAssessmentCompleted = (result, assessmentId) => {
    setLatestResult(result);
    setActivePage('result');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col font-sans text-gray-900">
      <DisclaimerBanner />
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 pb-16">
        {activePage === 'student_dashboard' && (
          <StudentDashboard onNavigate={(page) => setActivePage(page)} />
        )}

        {activePage === 'questionnaire' && (
          <QuestionnairePage
            onCompleted={handleAssessmentCompleted}
            onCancel={() => setActivePage('student_dashboard')}
          />
        )}

        {activePage === 'result' && (
          <ScreeningResultPage
            result={latestResult}
            onNavigate={(page) => setActivePage(page)}
          />
        )}

        {activePage === 'history' && (
          <HistoryPage onNavigate={(page) => setActivePage(page)} />
        )}

        {activePage === 'wearables' && (
          <WearablesPage />
        )}

        {activePage === 'smartwatch' && (
          <SmartwatchPage onNavigate={(page) => setActivePage(page)} />
        )}

        {activePage === 'resources' && (
          <SupportResourcesPage />
        )}

        {activePage === 'counsellor_dashboard' && (
          <CounsellorDashboard />
        )}

        {activePage === 'admin_analytics' && (
          <AdminAnalyticsPage />
        )}

        {activePage === 'profile' && (
          <ProfilePrivacyPage />
        )}
      </main>

      {/* Global Minimal Footer */}
      <footer className="border-t border-gray-100 bg-white py-6 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>WellSense AI — Final Year B.Tech Project • Student Mental Well-Being Screening Platform</span>
          <span className="text-[11px] text-gray-400">Screening Aid • Not a Medical Diagnostic Instrument</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
