'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { MoodHistoryScrollWheel } from './MoodHistoryScrollWheel';
import {
  BrainCircuit,
  Sparkles,
  Send,
  Bot,
  User,
  Smile,
  Lock,
  HelpCircle,
  Info
} from 'lucide-react';

export const MentalWellbeingView: React.FC = () => {
  const { chatMessages, sendCoachMessage, isDarkMode } = useWellness();
  const [inputText, setInputText] = useState('');

  const MentalTooltip: React.FC<{
    icon?: 'info' | 'help';
    content: React.ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
  }> = ({ icon = 'help', content, align = 'center', className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div
        className={`relative inline-flex items-center group ${className}`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(prev => !prev);
          }}
          aria-label="More information"
          className="p-1 rounded-full text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          {icon === 'info' ? (
            <Info className="w-3.5 h-3.5" />
          ) : (
            <HelpCircle className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Tooltip Floating Card */}
        <div
          role="tooltip"
          className={`absolute top-full mt-2 w-64 sm:w-72 p-3.5 rounded-2xl border shadow-2xl z-40 text-left transition-all duration-200 transform origin-top ${
            align === 'left'
              ? 'left-0'
              : align === 'right'
              ? 'right-0'
              : 'left-1/2 -translate-x-1/2'
          } ${
            isOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
          } ${
            isDarkMode
              ? 'bg-[#181a24]/95 backdrop-blur-md border-[#2d3242] text-slate-200 shadow-black/80'
              : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-700 shadow-slate-200/80'
          }`}
        >
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
            {content}
          </p>
        </div>
      </div>
    );
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendCoachMessage(inputText);
    setInputText('');
  };

  const quickPrompts = [
    'How do I handle 24+ meeting hours this week?',
    'What is a 2-minute posture stretch for back pain?',
    'How can I disconnect after 6:30 PM?',
    'Give me a strategy to lower my Burnout Risk score.'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          AI Wellness Coach & Mood Check-In Log
        </h2>
        <MentalTooltip
          icon="help"
          align="left"
          content="Consult with your AI Haven Wellness Coach for proactive workplace recovery advice, and record daily mood & energy check-ins."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): AI Wellness Coach Chat Interface */}
        <div className={`enterprise-card p-6 border lg:col-span-2 flex flex-col h-[560px] ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
          {/* Chat Header */}
          <div className={`flex items-center justify-between pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className={`text-base font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  AI Haven Wellness Coach
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </h3>
                <MentalTooltip
                  icon="help"
                  align="left"
                  content="Personalized conversational wellness guidance providing restorative strategies based on your work patterns."
                />
              </div>
            </div>

          </div>

          {/* Quick Prompt Chips */}
          <div className={`relative border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar pr-6">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendCoachMessage(prompt)}
                  className={`text-xs px-3 py-1.5 rounded-full shrink-0 whitespace-nowrap transition-all font-medium border cursor-pointer ${isDarkMode
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-blue-500 hover:text-white'
                    : 'text-slate-700 bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                >
                  {prompt}
                </button>
              ))}
            </div>
            {/* Fade hint that the row scrolls - chips were clipping with no scroll affordance */}
            <div className={`pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l ${isDarkMode ? 'from-slate-900' : 'from-white'} to-transparent`} />
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${isDarkMode ? 'bg-blue-950/60 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-600 border-blue-200'
                    }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user'
                    ? 'bg-blue-600 text-white font-medium shadow-xs rounded-br-none'
                    : isDarkMode
                      ? 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                      : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                >
                  <p>{msg.text}</p>
                  <span className={`text-[10px] mt-1.5 block text-right ${msg.sender === 'user' ? 'text-blue-100' : isDarkMode ? 'text-slate-400' : 'text-slate-400'
                    }`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}>
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSend} className={`pt-3 border-t flex items-center gap-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask your AI Wellness Coach for advice (e.g., 'How can I reduce meeting fatigue?')..."
              className={`flex-1 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-600 border transition-all ${isDarkMode
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-800/90'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                }`}
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column (1 Col): Interactive 3D Mood History Scroll Wheel */}
        <MoodHistoryScrollWheel />
      </div>
    </div>
  );
};
