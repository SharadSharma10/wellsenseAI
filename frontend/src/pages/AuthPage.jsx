import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, ShieldCheck, User, Sparkles, Lock, Mail, ArrowRight, BookOpen } from 'lucide-react';

export default function AuthPage({ onLoginSuccess }) {
  const { login, register, loginAsDemo } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('4th Year');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({ email, password, full_name: fullName, role, department, year });
      } else {
        await login(email, password);
      }
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole) => {
    setError('');
    setLoading(true);
    try {
      await loginAsDemo(demoRole);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-teal-600 to-primary-400 mx-auto flex items-center justify-center text-white shadow-md mb-3">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          WellSense <span className="text-primary-500">AI</span>
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Student Mental Well-Being Screening & Early Support Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-subtle rounded-3xl border border-gray-100">
          
          {/* Quick Demo Evaluation Buttons */}
          <div className="mb-6 p-3 bg-teal-50/70 border border-teal-200/60 rounded-2xl">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-teal-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Instant Evaluator Logins (1-Click)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="py-1.5 px-2 bg-white hover:bg-teal-100 text-teal-800 text-[11px] font-medium rounded-xl border border-teal-200 shadow-xs transition-colors"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('counsellor')}
                className="py-1.5 px-2 bg-white hover:bg-teal-100 text-teal-800 text-[11px] font-medium rounded-xl border border-teal-200 shadow-xs transition-colors"
              >
                🩺 Counsellor
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="py-1.5 px-2 bg-white hover:bg-teal-100 text-teal-800 text-[11px] font-medium rounded-xl border border-teal-200 shadow-xs transition-colors"
              >
                📊 Admin
              </button>
            </div>
          </div>

          {/* Form Tabs: Login vs Register */}
          <div className="flex border-b border-gray-100 mb-6">
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2 text-center text-sm font-semibold transition-all ${
                !isRegister ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2 text-center text-sm font-semibold transition-all ${
                isRegister ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              New Student Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Computer Science"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                      <option>Postgraduate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="counsellor">Campus Counsellor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Campus Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@wellsense.edu"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-2xl shadow-sm transition-colors"
            >
              <span>{loading ? 'Processing...' : isRegister ? 'Create WellSense Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center space-x-2 text-[11px] text-gray-500">
            <ShieldCheck className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <span>Strict confidentiality. Your data is encrypted and never shared without explicit consent.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
