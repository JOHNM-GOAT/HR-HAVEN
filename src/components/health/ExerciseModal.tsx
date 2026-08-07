'use client';

import React, { useState, useEffect } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { X, Play, Pause, RefreshCw } from 'lucide-react';

export const ExerciseModal: React.FC = () => {
  const { activeExercise, setActiveExercise, setToastNotification } = useWellness();
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [isPlaying, setIsPlaying] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = activeExercise === 'stretch' ? [
    { title: 'Neck & Spine Alignment', desc: 'Slowly tilt your head to the right shoulder for 15 seconds, then left.', icon: '🧘' },
    { title: 'Shoulder Blade Squeeze', desc: 'Roll shoulders back and squeeze shoulder blades together.', icon: '💪' },
    { title: 'Wrist & Forearm Release', desc: 'Extend arms forward and gently pull fingers back.', icon: '🙌' },
    { title: 'Deep Diaphragmatic Breath', desc: 'Inhale deeply for 4s, hold 4s, exhale slowly for 6s.', icon: '🌬️' }
  ] : activeExercise === 'eye_rest' ? [
    { title: 'Focus 20 Feet Away', desc: 'Look out the window or across the room at an object 20 feet away.', icon: '👁️' },
    { title: 'Gentle Eye Palming', desc: 'Warm your palms together and place softly over closed eyes.', icon: '🤲' },
    { title: 'Blink & Rehydrate', desc: 'Blink slowly 10 times to re-moisturize your eyes.', icon: '✨' }
  ] : [
    { title: 'Inhale Slowly (4s)', desc: 'Breathe in deep through your nose.', icon: '🌸' },
    { title: 'Hold Breath (4s)', desc: 'Keep your body relaxed and lungs filled.', icon: '⏸️' },
    { title: 'Exhale Slowly (6s)', desc: 'Release tension through your mouth.', icon: '💨' }
  ];

  useEffect(() => {
    if (!activeExercise || !isPlaying) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setToastNotification('Great job! 2-minute micro-wellness session complete. Body & mind refreshed!');
          setActiveExercise(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeExercise, isPlaying, setActiveExercise, setToastNotification]);

  useEffect(() => {
    const elapsed = 120 - secondsLeft;
    const newStep = Math.min(steps.length - 1, Math.floor((elapsed / 120) * steps.length));
    setStepIndex(newStep);
  }, [secondsLeft, steps.length]);

  if (!activeExercise) return null;

  const currentStep = steps[stepIndex];
  const progressPercent = ((120 - secondsLeft) / 120) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 text-slate-900 shadow-2xl relative">
        <button 
          onClick={() => setActiveExercise(null)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-block mb-2">
            Interactive Guided Session
          </span>
          <h2 className="text-2xl font-bold text-slate-900 capitalize">
            {activeExercise.replace('_', ' ')} Break
          </h2>
          <p className="text-xs text-slate-500 mt-1">2-Minute Wellness Reset for Peak Focus</p>
        </div>

        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full border-4 border-blue-500 ${isPlaying ? 'animate-breathe' : ''} bg-blue-50`} />
            <div className="text-center z-10">
              <span className="text-3xl mb-1 block">{currentStep.icon}</span>
              <span className="text-3xl font-extrabold tracking-tight text-blue-600">
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="mt-6 text-center bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full">
            <p className="text-xs font-bold uppercase text-blue-700 tracking-wider">
              Step {stepIndex + 1} of {steps.length}
            </p>
            <h4 className="text-base font-bold text-slate-900 mt-1">{currentStep.title}</h4>
            <p className="text-xs text-slate-600 mt-1">{currentStep.desc}</p>
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-6">
          <div 
            className="bg-blue-600 h-full transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>
          <button
            onClick={() => {
              setSecondsLeft(120);
              setStepIndex(0);
            }}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
            title="Restart Session"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
