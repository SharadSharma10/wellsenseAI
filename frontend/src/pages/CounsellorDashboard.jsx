import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileEdit, 
  Mail, 
  ChevronRight,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export default function CounsellorDashboard() {
  const [queue, setQueue] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All'); // 'All' | 'High Risk' | 'Moderate Risk' | 'Low Risk'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Note editing state
  const [activeNoteModal, setActiveNoteModal] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  useEffect(() => {
    fetchCounsellorData();
  }, []);

  const fetchCounsellorData = async () => {
    try {
      setLoading(true);
      const [queueRes, aptRes] = await Promise.all([
        api.getCounsellorTriageQueue(),
        api.getAppointments()
      ]);
      setQueue(queueRes.students || []);
      setAppointments(aptRes || []);
    } catch (err) {
      console.error('Failed to fetch counsellor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAptStatus = async (aptId, newStatus) => {
    try {
      await api.updateAppointmentStatus(aptId, newStatus);
      await fetchCounsellorData();
    } catch (err) {
      alert(`Error updating appointment: ${err.message}`);
    }
  };

  const handleSaveNote = async () => {
    if (!activeNoteModal) return;
    try {
      setNoteLoading(true);
      await api.saveCounsellorNote(activeNoteModal.assessment_id, noteText);
      setActiveNoteModal(null);
      setNoteText('');
      await fetchCounsellorData();
    } catch (err) {
      alert(`Failed to save note: ${err.message}`);
    } finally {
      setNoteLoading(false);
    }
  };

  // Filter students
  const filteredStudents = queue.filter((s) => {
    const matchesFilter = selectedFilter === 'All' || s.tier_label === selectedFilter;
    const matchesSearch = s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const highRiskCount = queue.filter(s => s.tier_label === 'High Risk').length;
  const modRiskCount = queue.filter(s => s.tier_label === 'Moderate Risk').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>Student Wellness Services Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Counsellor Triage & Care Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Prioritized student queue filtered by AI screening risk tiers. Displays only consented records.
          </p>
        </div>

        {/* Quick Triage Stats Pill */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <div className="px-4 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-xs">
            <span className="font-semibold text-rose-700 block">Priority Triage</span>
            <span className="text-base font-black text-rose-900">{highRiskCount} Students</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
            <span className="font-semibold text-amber-700 block">Moderate Strain</span>
            <span className="text-base font-black text-amber-900">{modRiskCount} Students</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Triage Queue & Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (2 spans): Triage Queue */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-subtle border border-gray-100 space-y-6">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by student name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['All', 'High Risk', 'Moderate Risk', 'Low Risk'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedFilter === filter
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Student Triage Cards List */}
          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <Users className="w-8 h-8 text-gray-400 mx-auto" />
              <h4 className="text-sm font-semibold text-gray-700">No Students in this Filter</h4>
              <p className="text-xs text-gray-400">All students are currently within low risk or have not completed check-ins.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => {
                const isHigh = student.tier_label === 'High Risk';
                const isMod = student.tier_label === 'Moderate Risk';
                const topFactor = student.prediction_result?.top_contributing_factors?.[0]?.display_name || 'Multi-factor strain';
                return (
                  <div
                    key={student.student_id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isHigh 
                        ? 'border-rose-200 bg-rose-50/30 hover:border-rose-300' 
                        : isMod 
                        ? 'border-amber-200 bg-amber-50/20 hover:border-amber-300'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-bold text-gray-900">{student.student_name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isHigh ? 'bg-rose-100 text-rose-800' : isMod ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {student.tier_label}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500">
                          {student.department} • {student.year} • {student.student_email}
                        </p>

                        <div className="pt-2 flex flex-wrap gap-2 text-xs">
                          <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700 font-medium">
                            Score: <strong className="text-teal-700">{student.wellness_score}/100</strong>
                          </span>
                          <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700 font-medium">
                            Key Factor: <strong>{topFactor}</strong>
                          </span>
                          <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 text-[11px]">
                            Checked: {new Date(student.last_assessment_date).toLocaleDateString()}
                          </span>
                        </div>

                        {student.counsellor_notes && (
                          <div className="mt-2 p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-900">
                            <strong>Note:</strong> {student.counsellor_notes}
                          </div>
                        )}
                      </div>

                      {/* Counsellor Action Buttons */}
                      <div className="flex items-center space-x-2 self-start flex-shrink-0">
                        <a
                          href={`mailto:${student.student_email}?subject=WellSense%20Campus%20Wellness%20Support`}
                          className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => {
                            setActiveNoteModal(student);
                            setNoteText(student.counsellor_notes || '');
                          }}
                          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1"
                        >
                          <FileEdit className="w-3.5 h-3.5 text-teal-600" />
                          <span>Clinical Note</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Column: Appointment Schedule */}
        <div className="bg-white rounded-3xl p-6 shadow-subtle border border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-gray-900">Counselling Sessions</h3>
              <p className="text-xs text-gray-400">Student requested consults</p>
            </div>
            <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
              {appointments.length} Active
            </span>
          </div>

          {appointments.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <Calendar className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
              <span>No pending appointment requests.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-900">{apt.student_name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      apt.status === 'completed' ? 'bg-gray-200 text-gray-700' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-gray-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{new Date(apt.scheduled_time).toLocaleString()}</span>
                  </div>

                  {apt.notes && (
                    <p className="text-[11px] text-gray-600 italic">"{apt.notes}"</p>
                  )}

                  <div className="flex items-center space-x-2 pt-1 border-t border-gray-200/50">
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateAptStatus(apt.id, 'confirmed')}
                        className="flex-1 py-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] rounded-lg transition-colors"
                      >
                        Confirm
                      </button>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateAptStatus(apt.id, 'completed')}
                        className="flex-1 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-[11px] rounded-lg transition-colors"
                      >
                        Mark Done
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateAptStatus(apt.id, 'cancelled')}
                      className="px-2 py-1 text-gray-400 hover:text-rose-600 text-[11px] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Privacy Protocol Badge */}
          <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 text-[11px] text-purple-900 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <span>
              All student data is viewed under professional campus psychologist confidentiality guidelines.
            </span>
          </div>

        </div>

      </div>

      {/* Clinical Note Modal */}
      {activeNoteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              Clinical Triage Note for {activeNoteModal.student_name}
            </h3>
            <p className="text-xs text-gray-500">
              Add confidential internal follow-up observations or recommended intervention plans.
            </p>

            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Conducted outreach. Suggested 4-7-8 breathing protocol and scheduled in-person session for academic pacing..."
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            ></textarea>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setActiveNoteModal(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={noteLoading}
                className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition-colors"
              >
                {noteLoading ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
