import React, { useState, useEffect } from 'react';
import { Wind, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

export default function BreathingExercise() {
  const [technique, setTechnique] = useState('478'); // '478' | 'box'
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('ready'); // 'inhale' | 'hold' | 'exhale' | 'hold2' | 'ready'
  const [countdown, setCountdown] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  // Phase configs in seconds
  const configs = {
    '478': [
      { name: 'Inhale through nose', duration: 4, type: 'inhale', color: 'text-teal-600', scale: 'scale-125' },
      { name: 'Hold gently', duration: 7, type: 'hold', color: 'text-indigo-600', scale: 'scale-125' },
      { name: 'Slow whoosh exhale', duration: 8, type: 'exhale', color: 'text-amber-600', scale: 'scale-90' },
    ],
    'box': [
      { name: 'Inhale', duration: 4, type: 'inhale', color: 'text-teal-600', scale: 'scale-120' },
      { name: 'Hold breath', duration: 4, type: 'hold', color: 'text-indigo-600', scale: 'scale-120' },
      { name: 'Exhale smoothly', duration: 4, type: 'exhale', color: 'text-amber-600', scale: 'scale-90' },
      { name: 'Rest empty', duration: 4, type: 'hold2', color: 'text-purple-600', scale: 'scale-90' },
    ]
  };

  const currentPhases = configs[technique];
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  useEffect(() => {
    let timer = null;

    if (isActive) {
      if (countdown > 1) {
        timer = setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        // Move to next phase
        const nextIndex = (currentPhaseIndex + 1) % currentPhases.length;
        if (nextIndex === 0) {
          setCycleCount((c) => c + 1);
        }
        setCurrentPhaseIndex(nextIndex);
        setCountdown(currentPhases[nextIndex].duration);
      }
    }

    return () => clearTimeout(timer);
  }, [isActive, countdown, currentPhaseIndex, currentPhases]);

  const handleStart = () => {
    setIsActive(true);
    setCurrentPhaseIndex(0);
    setCountdown(currentPhases[0].duration);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setCountdown(currentPhases[0].duration);
    setCycleCount(0);
  };

  const activePhaseInfo = currentPhases[currentPhaseIndex];

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-subtle border border-gray-100 flex flex-col items-center max-w-xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center space-x-2 text-teal-700 mb-2">
        <Wind className="w-5 h-5" />
        <h3 className="font-bold text-lg text-gray-900">Guided Mindful Breathing</h3>
      </div>
      <p className="text-xs text-gray-500 text-center mb-6">
        Stimulate the vagus nerve to down-regulate acute physiological arousal and heart rate.
      </p>

      {/* Technique Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-2xl mb-8 space-x-1">
        <button
          onClick={() => { setTechnique('478'); handleReset(); }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            technique === '478' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          4-7-8 Sleep & Anxiety Relaxer
        </button>
        <button
          onClick={() => { setTechnique('box'); handleReset(); }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            technique === 'box' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          4-4-4 Box Breathing
        </button>
      </div>

      {/* Interactive Breathing Visualizer Circle */}
      <div className="relative w-64 h-64 flex items-center justify-center my-4">
        {/* Soft background pulse rings */}
        <div 
          className={`absolute inset-0 rounded-full bg-teal-100/40 transition-transform duration-1000 ease-in-out ${
            isActive ? activePhaseInfo.scale : 'scale-100'
          }`}
        ></div>
        
        <div 
          className={`absolute w-48 h-48 rounded-full bg-teal-200/50 transition-transform duration-1000 ease-in-out ${
            isActive ? activePhaseInfo.scale : 'scale-100'
          }`}
        ></div>

        {/* Core animated circle */}
        <div 
          className={`w-36 h-36 rounded-full bg-gradient-to-tr from-teal-500 to-teal-400 text-white shadow-xl flex flex-col items-center justify-center z-10 transition-transform duration-1000 ease-in-out ${
            isActive ? activePhaseInfo.scale : 'scale-100'
          }`}
        >
          <span className="text-3xl font-extrabold tracking-tight">
            {isActive ? countdown : <Wind className="w-8 h-8" />}
          </span>
          <span className="text-[11px] font-medium opacity-90 mt-0.5 uppercase tracking-wider">
            {isActive ? activePhaseInfo.type : 'Ready'}
          </span>
        </div>
      </div>

      {/* Phase Prompt */}
      <div className="text-center my-4 min-h-[44px]">
        {isActive ? (
          <div>
            <div className={`text-base font-bold ${activePhaseInfo.color}`}>
              {activePhaseInfo.name}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              Cycle {cycleCount + 1} completed
            </div>
          </div>
        ) : (
          <div className="text-sm font-medium text-gray-500">
            Press Start to begin a guided calming rhythm
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-3 mt-2">
        {!isActive ? (
          <button
            onClick={handleStart}
            className="flex items-center space-x-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-2xl shadow-sm transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Session</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center space-x-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-2xl shadow-sm transition-all"
          >
            <Pause className="w-4 h-4 fill-white" />
            <span>Pause</span>
          </button>
        )}

        <button
          onClick={handleReset}
          className="p-2.5 rounded-2xl border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
