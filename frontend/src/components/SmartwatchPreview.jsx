import React, { useState, useEffect } from 'react';
import { Heart, Moon, Footprints, BatteryCharging, Sparkles, Smile, Frown, Meh, RefreshCw, AlertCircle } from 'lucide-react';

export default function SmartwatchPreview({ onLaunchCheckin }) {
  const [currentTime, setCurrentTime] = useState('');
  const [pulseBpm, setPulseBpm] = useState(72);
  const [watchView, setWatchView] = useState('home'); // 'home' | 'quick_check' | 'done'
  const [selectedMood, setSelectedMood] = useState(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate subtle real-time heart rate fluctuation
  useEffect(() => {
    const bpmInterval = setInterval(() => {
      setPulseBpm((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.min(Math.max(prev + delta, 65), 84);
      });
    }, 2500);
    return () => clearInterval(bpmInterval);
  }, []);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setWatchView('done');
    setTimeout(() => {
      setWatchView('home');
      setSelectedMood(null);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Smartwatch Outer Case Frame */}
      <div className="relative">
        
        {/* Watch Straps */}
        <div className="w-36 h-8 bg-zinc-800 rounded-t-xl mx-auto -mb-2 shadow-inner border-t border-zinc-700"></div>

        {/* Watch Body (Hardware Bezel) */}
        <div className="w-72 h-88 bg-gradient-to-b from-zinc-900 to-black rounded-[48px] p-4 shadow-2xl border-4 border-zinc-700/80 relative overflow-hidden flex flex-col justify-between">
          
          {/* Digital Screen Edge Gloss */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-[44px] pointer-events-none"></div>

          {/* Watch Status Bar */}
          <div className="flex justify-between items-center text-[11px] text-zinc-400 px-2 pt-1 z-10">
            <span className="font-semibold text-zinc-300">{currentTime || '10:42'}</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px]">88%</span>
            </div>
          </div>

          {/* Screen Content by View */}
          <div className="flex-1 flex flex-col justify-center px-1 py-2 z-10">
            {watchView === 'home' && (
              <div className="space-y-2.5 animate-fade-in">
                
                {/* Heart Rate Metric */}
                <div className="bg-zinc-900/90 rounded-2xl p-2.5 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400">
                      <Heart className="w-4 h-4 fill-rose-500 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400">Resting HR</div>
                      <div className="text-sm font-bold text-white leading-tight">
                        {pulseBpm} <span className="text-[10px] font-normal text-zinc-400">bpm</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Normal
                  </span>
                </div>

                {/* Sleep & Step Glance Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-900/90 rounded-2xl p-2.5 border border-zinc-800">
                    <div className="flex items-center space-x-1.5 text-indigo-400 mb-1">
                      <Moon className="w-3.5 h-3.5" />
                      <span className="text-[10px] text-zinc-400">Sleep</span>
                    </div>
                    <div className="text-sm font-bold text-white">7.4h</div>
                    <div className="text-[9px] text-zinc-400">89% Quality</div>
                  </div>

                  <div className="bg-zinc-900/90 rounded-2xl p-2.5 border border-zinc-800">
                    <div className="flex items-center space-x-1.5 text-teal-400 mb-1">
                      <Footprints className="w-3.5 h-3.5" />
                      <span className="text-[10px] text-zinc-400">Steps</span>
                    </div>
                    <div className="text-sm font-bold text-white">8,420</div>
                    <div className="text-[9px] text-teal-400">84% Goal</div>
                  </div>
                </div>

                {/* Quick Check-in CTA on Wrist */}
                <button
                  onClick={() => setWatchView('quick_check')}
                  className="w-full py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Wrist Check-In</span>
                </button>
              </div>
            )}

            {watchView === 'quick_check' && (
              <div className="text-center space-y-2.5 animate-fade-in">
                <div className="text-[11px] text-zinc-300 font-medium">How are you feeling right now?</div>
                <div className="grid grid-cols-3 gap-2 py-1">
                  <button
                    onClick={() => handleMoodSelect('Calm')}
                    className="flex flex-col items-center p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 transition-colors"
                  >
                    <Smile className="w-5 h-5 mb-1" />
                    <span className="text-[10px] text-zinc-200">Calm</span>
                  </button>
                  <button
                    onClick={() => handleMoodSelect('Okay')}
                    className="flex flex-col items-center p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition-colors"
                  >
                    <Meh className="w-5 h-5 mb-1" />
                    <span className="text-[10px] text-zinc-200">Okay</span>
                  </button>
                  <button
                    onClick={() => handleMoodSelect('Stressed')}
                    className="flex flex-col items-center p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 transition-colors"
                  >
                    <Frown className="w-5 h-5 mb-1" />
                    <span className="text-[10px] text-zinc-200">Strained</span>
                  </button>
                </div>
                <button
                  onClick={() => setWatchView('home')}
                  className="text-[10px] text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}

            {watchView === 'done' && (
              <div className="text-center space-y-2 animate-fade-in py-4">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-white">Logged: {selectedMood}</div>
                <div className="text-[10px] text-zinc-400">Synced to WellSense AI</div>
              </div>
            )}
          </div>

          {/* Watch Bottom Bar */}
          <div className="text-center text-[9px] text-zinc-400 pb-1 z-10 flex items-center justify-center space-x-1">
            <span className="w-1 h-1 rounded-full bg-zinc-500"></span>
            <span>WellSense Companion v1.0</span>
          </div>

          {/* Watch Digital Crown Dial */}
          <div className="absolute -right-5 top-20 w-3 h-10 bg-zinc-600 rounded-r-md border-l border-zinc-800 shadow-md"></div>
          {/* Watch Side Button */}
          <div className="absolute -right-4.5 top-34 w-2 h-8 bg-zinc-700 rounded-r-xs border-l border-zinc-800"></div>
        </div>

        {/* Watch Bottom Strap */}
        <div className="w-36 h-8 bg-zinc-800 rounded-b-xl mx-auto -mt-2 shadow-inner border-b border-zinc-700"></div>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center max-w-xs">
        Simulated Wearable OS Preview: Displays live biometrics and offers 1-tap rapid check-ins.
      </p>
    </div>
  );
}
