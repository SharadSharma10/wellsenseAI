import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HeartHandshake, 
  LayoutDashboard, 
  ClipboardCheck, 
  Activity, 
  History, 
  Wind, 
  Watch, 
  Users, 
  BarChart3, 
  User, 
  LogOut, 
  PhoneCall, 
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout, loginAsDemo, isStudent, isCounsellor, isAdmin } = useAuth();
  const [showHelplineModal, setShowHelplineModal] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const handleRoleSwitch = async (role) => {
    setShowRoleDropdown(false);
    await loginAsDemo(role);
    if (role === 'student') setActivePage('student_dashboard');
    else if (role === 'counsellor') setActivePage('counsellor_dashboard');
    else if (role === 'admin') setActivePage('admin_analytics');
  };

  const navItems = [
    // Student items
    ...(isStudent ? [
      { id: 'student_dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'questionnaire', label: 'Check-In', icon: ClipboardCheck },
      { id: 'history', label: 'Trends & History', icon: History },
      { id: 'wearables', label: 'Wearables', icon: Activity },
      { id: 'smartwatch', label: 'Watch Preview', icon: Watch },
      { id: 'resources', label: 'Breathing & Care', icon: Wind },
    ] : []),

    // Counsellor items
    ...(isCounsellor ? [
      { id: 'counsellor_dashboard', label: 'Triage Queue', icon: Users },
      { id: 'resources', label: 'Wellness Resources', icon: Wind },
    ] : []),

    // Admin items
    ...(isAdmin ? [
      { id: 'admin_analytics', label: 'Campus Analytics', icon: BarChart3 },
      { id: 'counsellor_dashboard', label: 'Student Triage View', icon: Users },
    ] : []),

    // Shared items
    { id: 'profile', label: 'Profile & Privacy', icon: User },
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div 
              onClick={() => setActivePage(isStudent ? 'student_dashboard' : isCounsellor ? 'counsellor_dashboard' : 'admin_analytics')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-teal-800 to-primary-600 bg-clip-text text-transparent">
                  WellSense <span className="font-semibold text-primary-500 text-sm tracking-wide uppercase px-1.5 py-0.5 bg-primary-50 rounded-md border border-primary-200/60 ml-1">AI</span>
                </span>
                <p className="text-[10px] text-gray-500 leading-none">Student Well-Being Screening</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs lg:text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-primary-500 text-white shadow-xs font-semibold' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Quick Role Switcher, Crisis Button, User Info */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Immediate Crisis Support Helpline Pill */}
              <button
                onClick={() => setShowHelplineModal(true)}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-medium border border-rose-200 transition-colors"
                title="Get immediate 24/7 confidential help"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">24/7 Helpline</span>
              </button>

              {/* Demo Role Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-medium border border-gray-200 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="capitalize">{user?.role || 'Switch Role'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-elevated border border-gray-100 py-2 z-50">
                    <div className="px-3 py-1.5 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Demo Role Switcher
                    </div>
                    <button
                      onClick={() => handleRoleSwitch('student')}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 ${user?.role === 'student' ? 'text-primary-700 font-semibold bg-primary-50/50' : 'text-gray-700'}`}
                    >
                      <span>Aarav (Student)</span>
                      <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">Student</span>
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('counsellor')}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 ${user?.role === 'counsellor' ? 'text-primary-700 font-semibold bg-primary-50/50' : 'text-gray-700'}`}
                    >
                      <span>Dr. Meenakshi (Counsellor)</span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Staff</span>
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 ${user?.role === 'admin' ? 'text-primary-700 font-semibold bg-primary-50/50' : 'text-gray-700'}`}
                    >
                      <span>Dean Office (Admin)</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Admin</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Bar */}
        <div className="md:hidden overflow-x-auto flex space-x-1 px-4 py-2 border-t border-gray-100 bg-gray-50/50 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap ${
                  isActive 
                    ? 'bg-primary-500 text-white font-semibold shadow-xs' 
                    : 'text-gray-600 hover:bg-gray-200/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Verified 24/7 Helpline Modal */}
      {showHelplineModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center space-x-3 text-rose-600 mb-4">
              <div className="p-2.5 rounded-2xl bg-rose-100">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Immediate Supportive Resources</h3>
                <p className="text-xs text-gray-500">Confidential, toll-free, 24/7 crisis helplines</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              If you or someone you know is feeling overwhelmed, hopeless, or in immediate distress, trained counsellors are standing by to listen without judgment:
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-rose-950">Tele-MANAS (National Mental Health)</h4>
                    <p className="text-xs text-rose-800">Govt of India, 24/7 multi-lingual mental health support</p>
                  </div>
                  <a href="tel:14416" className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-xl text-xs shadow-xs hover:bg-rose-700">
                    Call 14416
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-teal-950">Vandrevala Foundation</h4>
                    <p className="text-xs text-teal-800">24/7 Free crisis counselling helpline</p>
                  </div>
                  <a href="tel:9999666555" className="px-3 py-1.5 bg-teal-600 text-white font-bold rounded-xl text-xs shadow-xs hover:bg-teal-700">
                    +91 9999 666 555
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-purple-950">KIRAN Mental Health Line</h4>
                    <p className="text-xs text-purple-800">MoSJE 24/7 toll-free psychological support</p>
                  </div>
                  <a href="tel:18005990019" className="px-3 py-1.5 bg-purple-600 text-white font-bold rounded-xl text-xs shadow-xs hover:bg-purple-700">
                    1800-599-0019
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowHelplineModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
