import React, { useState } from 'react';
import { api } from '../api/client';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Heart, 
  Moon, 
  Clock, 
  HelpCircle,
  Activity,
  Smile,
  Meh,
  Frown,
  BookOpen
} from 'lucide-react';

export default function QuestionnairePage({ onCompleted, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Questionnaire form state corresponding to the 12 model features
  const [formData, setFormData] = useState({
    // Mood / PHQ-9 composite
    phq9_score: 4,
    // Anxiety / GAD-7 composite
    gad7_score: 3,
    // Perceived Stress (0-16)
    perceived_stress: 5,
    // Academic Pressure (1-5)
    academic_pressure: 3,
    // Study Hours (1-14)
    study_hours_per_day: 6.0,
    // Sleep Duration
    sleep_hours: 7.2,
    // Sleep Efficiency
    sleep_efficiency: 85.0,
    // Resting Heart Rate (bpm)
    resting_heart_rate: 68.0,
    // Daily Steps
    daily_steps: 8000,
    // Active minutes
    physical_activity_minutes: 35,
    // Social Support (1-5)
    social_support_score: 4,
    // Financial Stress (1-5)
    financial_stress: 2,
  });

  const steps = [
    {
      id: 'mood_energy',
      title: 'Mood & Vitality',
      subtitle: 'Over the last 2 weeks, how often have you been bothered by feeling down, fatigued, or having little interest in activities?',
      field: 'phq9_score',
      type: 'options',
      options: [
        { label: 'Not at all', value: 2, desc: 'Energized and engaged in daily studies' },
        { label: 'Several days', value: 7, desc: 'Mild fatigue or occasional sluggishness' },
        { label: 'More than half the days', value: 14, desc: 'Persistent low energy or difficulty feeling motivated' },
        { label: 'Nearly every day', value: 21, desc: 'Significant exhaustion impacting daily functioning' },
      ]
    },
    {
      id: 'anxiety',
      title: 'Anxiety & Restlessness',
      subtitle: 'Over the past 2 weeks, how often have you felt nervous, anxious, or unable to stop worrying about exams or responsibilities?',
      field: 'gad7_score',
      type: 'options',
      options: [
        { label: 'Not at all', value: 2, desc: 'Calm and steady focus' },
        { label: 'Several days', value: 6, desc: 'Occasional worry during deadlines' },
        { label: 'More than half the days', value: 12, desc: 'Frequent tension and difficulty unwinding' },
        { label: 'Nearly every day', value: 18, desc: 'Persistent acute anxiety or restless agitation' },
      ]
    },
    {
      id: 'perceived_stress',
      title: 'Perceived Overwhelm & Control',
      subtitle: 'In the past month, how often have you felt that difficulties were piling up so high that you could not overcome them?',
      field: 'perceived_stress',
      type: 'options',
      options: [
        { label: 'Never or rarely', value: 3, desc: 'Confident in my coping mechanisms' },
        { label: 'Sometimes', value: 7, desc: 'Manageable pressure during peak assignments' },
        { label: 'Fairly often', value: 11, desc: 'Feeling stretched thin across demands' },
        { label: 'Very often', value: 15, desc: 'Completely overwhelmed by obligations' },
      ]
    },
    {
      id: 'academic',
      title: 'Academic Pressure & Workload',
      subtitle: 'How intense is your current academic load and performance expectation?',
      field: 'academic_pressure',
      type: 'options',
      options: [
        { label: 'Light / Relaxed', value: 1, desc: 'Comfortable pace, ample study flexibility' },
        { label: 'Moderate', value: 2, desc: 'Standard syllabus pacing and manageable tests' },
        { label: 'Demanding', value: 3, desc: 'Heavy assignment schedule requiring dedicated focus' },
        { label: 'Very High', value: 4, desc: 'Intense project deadlines and continuous exams' },
        { label: 'Extremely Severe', value: 5, desc: 'Unsustainable workload causing severe strain' },
      ]
    },
    {
      id: 'study_hours',
      title: 'Daily Study & Screen Workload',
      subtitle: 'On average, how many hours per day do you spend in academic study, classes, and lab assignments?',
      field: 'study_hours_per_day',
      type: 'slider',
      min: 1.0,
      max: 14.0,
      step: 0.5,
      unit: 'hours / day'
    },
    {
      id: 'sleep_lifestyle',
      title: 'Nightly Sleep Duration',
      subtitle: 'How many hours of sleep do you typically get per night this week?',
      field: 'sleep_hours',
      type: 'slider',
      min: 3.5,
      max: 11.0,
      step: 0.5,
      unit: 'hours / night'
    },
    {
      id: 'sleep_efficiency',
      title: 'Sleep Quality & Efficiency',
      subtitle: 'How rested do you feel when waking up? (Estimated sleep quality percentage)',
      field: 'sleep_efficiency',
      type: 'slider',
      min: 40.0,
      max: 100.0,
      step: 5.0,
      unit: '% quality'
    },
    {
      id: 'wearable_telemetry',
      title: 'Resting Heart Rate (RHR)',
      subtitle: 'Your wearable resting heart rate baseline or your typical resting pulse in bpm:',
      field: 'resting_heart_rate',
      type: 'slider',
      min: 52.0,
      max: 108.0,
      step: 1.0,
      unit: 'bpm'
    },
    {
      id: 'activity_steps',
      title: 'Daily Physical Movement',
      subtitle: 'Estimated average daily steps or movement around campus:',
      field: 'daily_steps',
      type: 'slider',
      min: 1000,
      max: 20000,
      step: 500,
      unit: 'steps / day'
    },
    {
      id: 'social_support',
      title: 'Social Support & Peer Connection',
      subtitle: 'Do you feel you have trusted friends, family, or mentors you can confide in when stressed?',
      field: 'social_support_score',
      type: 'options',
      options: [
        { label: 'Very Isolated', value: 1, desc: 'No one to turn to on campus' },
        { label: 'Limited', value: 2, desc: 'Few acquaintances, rarely share feelings' },
        { label: 'Moderate', value: 3, desc: 'A couple of friends I talk to occasionally' },
        { label: 'Strong', value: 4, desc: 'Reliable peer network and supportive friends' },
        { label: 'Very Strong', value: 5, desc: 'Deeply supportive network always available' },
      ]
    },
    {
      id: 'financial',
      title: 'Financial & Resource Strain',
      subtitle: 'Are financial obligations (tuition, living costs) currently creating noticeable worry for you?',
      field: 'financial_stress',
      type: 'options',
      options: [
        { label: 'None / Minimal', value: 1, desc: 'Finances are stable and comfortable' },
        { label: 'Mild', value: 2, desc: 'Occasional budgeting mindfulness' },
        { label: 'Moderate', value: 3, desc: 'Noticeable concern regarding expenses' },
        { label: 'High', value: 4, desc: 'Frequent financial pressure affecting studies' },
        { label: 'Critical', value: 5, desc: 'Severe financial distress impacting daily living' },
      ]
    }
  ];

  const currentQ = steps[currentStep];
  const totalSteps = steps.length;
  const progressPct = Math.round(((currentStep + 1) / totalSteps) * 100);

  const handleSelectOption = (val) => {
    setFormData((prev) => ({ ...prev, [currentQ.field]: val }));
    // Auto advance on options selection for smooth UX
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await api.submitAssessment(formData);
      if (onCompleted) {
        onCompleted(res.result, res.assessment_id);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit check-in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Top Header & Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <button
            onClick={onCancel}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
          <span className="font-semibold text-primary-700">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="font-medium text-gray-400">{progressPct}% Complete</span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-subtle border border-gray-100">
        
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-1 block">
            {currentQ.title}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            {currentQ.subtitle}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Options Selection */}
        {currentQ.type === 'options' && (
          <div className="space-y-3 my-6">
            {currentQ.options.map((opt) => {
              const isSelected = formData[currentQ.field] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start justify-between ${
                    isSelected 
                      ? 'border-primary-500 bg-primary-50/60 shadow-xs' 
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/70'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Continuous Slider Selection */}
        {currentQ.type === 'slider' && (
          <div className="my-8 space-y-6">
            <div className="text-center">
              <div className="text-4xl font-black text-primary-600">
                {formData[currentQ.field]} <span className="text-sm font-semibold text-gray-400">{currentQ.unit}</span>
              </div>
            </div>

            <div className="px-2">
              <input
                type="range"
                min={currentQ.min}
                max={currentQ.max}
                step={currentQ.step}
                value={formData[currentQ.field]}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFormData((prev) => ({ ...prev, [currentQ.field]: val }));
                }}
                className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{currentQ.min} {currentQ.unit}</span>
                <span>{currentQ.max} {currentQ.unit}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
              currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            className="flex items-center space-x-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all"
          >
            <span>{currentStep === totalSteps - 1 ? (submitting ? 'Analyzing Responses...' : 'Calculate Results') : 'Next Question'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Reassurance Footer */}
      <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-400 text-center">
        <ShieldCheck className="w-4 h-4 text-primary-500" />
        <span>Confidential screening assessment. No answers are published or shared publicly.</span>
      </div>

    </div>
  );
}
