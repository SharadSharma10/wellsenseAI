import React, { useState } from 'react';
import BreathingExercise from '../components/BreathingExercise';
import { api } from '../api/client';
import { 
  PhoneCall, 
  Calendar, 
  ShieldCheck, 
  HeartHandshake, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function SupportResourcesPage() {
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!scheduledTime) {
      setBookingError('Please select a date and preferred time.');
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    try {
      await api.bookAppointment(scheduledTime, notes, urgency);
      setBookingSuccess(true);
      setNotes('');
    } catch (err) {
      setBookingError(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold">
          <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
          <span>Compassionate Support Services</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Support Resources & Guided Care
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Take a deep breath with our vagus-nerve reset exercises, book a confidential session with campus psychological services, or access 24/7 helplines.
        </p>
      </div>

      {/* Grid: Breathing Tool & Counsellor Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left: Guided Breathing Exercise Component */}
        <div>
          <BreathingExercise />
        </div>

        {/* Right: Book Confidential Counsellor Consultation */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-subtle border border-gray-100 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-rose-600">
              <Calendar className="w-5 h-5" />
              <h3 className="font-bold text-lg text-gray-900">Campus Counsellor Consultation</h3>
            </div>
            <p className="text-xs text-gray-500">
              Free, confidential 1-on-1 session with Student Wellness & Psychological Services.
            </p>
          </div>

          {bookingSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-emerald-900">Appointment Request Submitted</h4>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Your consultation request has been forwarded to Dr. Meenakshi Rao at Campus Wellness Services. You will receive an appointment invite on your campus email.
              </p>
              <button
                onClick={() => setBookingSuccess(false)}
                className="mt-2 text-xs font-semibold text-emerald-800 underline hover:text-emerald-950"
              >
                Schedule another consult
              </button>
            </div>
          ) : (
            <form onSubmit={handleBookSession} className="space-y-4">
              {bookingError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {bookingError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Preferred Date & Time Window
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Consultation Urgency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgency('normal')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      urgency === 'normal' 
                        ? 'border-teal-500 bg-teal-50 text-teal-800' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Routine Check
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('elevated')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      urgency === 'elevated' 
                        ? 'border-amber-500 bg-amber-50 text-amber-800' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Moderate Stress
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('urgent')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      urgency === 'urgent' 
                        ? 'border-rose-500 bg-rose-50 text-rose-800' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Priority Support
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Notes or topics you'd like to talk through (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Managing final semester thesis anxiety, sleep trouble, or academic balance..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{bookingLoading ? 'Requesting...' : 'Request Confidential Consultation'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-gray-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>Protected by campus healthcare confidentiality protocols.</span>
              </div>
            </form>
          )}

        </div>

      </div>

      {/* 24/7 Verified Crisis Helplines Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-subtle border border-gray-100 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Verified 24/7 National Mental Health Helplines</h2>
          <p className="text-xs text-gray-500">
            Free, confidential support available at any hour if you need someone to talk to.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/60 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                National Helpline (India)
              </span>
              <h3 className="text-sm font-bold text-rose-950 mt-2">Tele-MANAS</h3>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                Ministry of Health & Family Welfare. Toll-free 24/7 mental health counseling across 20+ languages.
              </p>
            </div>
            <a 
              href="tel:14416"
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl text-center shadow-xs transition-colors flex items-center justify-center space-x-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Dial 14416 (or 1800-891-4416)</span>
            </a>
          </div>

          <div className="p-4 rounded-2xl border border-teal-200 bg-teal-50/60 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                Psychological First Aid
              </span>
              <h3 className="text-sm font-bold text-teal-950 mt-2">Vandrevala Foundation</h3>
              <p className="text-xs text-teal-800 mt-1 leading-relaxed">
                24/7 free emotional distress and suicide prevention hotline run by experienced clinical psychologists.
              </p>
            </div>
            <a 
              href="tel:9999666555"
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl text-center shadow-xs transition-colors flex items-center justify-center space-x-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call +91 9999 666 555</span>
            </a>
          </div>

          <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/60 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                Toll-Free Support Line
              </span>
              <h3 className="text-sm font-bold text-purple-950 mt-2">KIRAN Helpline</h3>
              <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                Department of Empowerment of Persons with Disabilities. Dedicated mental health rehabilitation helpline.
              </p>
            </div>
            <a 
              href="tel:18005990019"
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl text-center shadow-xs transition-colors flex items-center justify-center space-x-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 1800-599-0019</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
