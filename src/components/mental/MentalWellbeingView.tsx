'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { 
  BrainCircuit, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Smile, 
  Lock
} from 'lucide-react';

export const MentalWellbeingView: React.FC = () => {
  const { moodLogs, chatMessages, sendCoachMessage } = useWellness();
  const [inputText, setInputText] = useState('');

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
      <div>
        <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-block mb-2">
          Mental Well-Being & AI Coach
        </span>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          AI Wellness Coach & Mood Check-In Log
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Provides personalized work-life balance advice tailored to your work patterns while keeping individual data anonymous.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mood Log History */}
        <div className="enterprise-card p-6 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Smile className="w-5 h-5 text-blue-600" />
                Mood History
              </h3>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Anonymous
              </span>
            </div>

            <div className="space-y-3">
              {moodLogs.map(log => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="text-2xl">
                    {log.mood === 'thriving' ? '🤩' : log.mood === 'good' ? '😊' : log.mood === 'okay' ? '😐' : log.mood === 'stressed' ? '😰' : '😫'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 capitalize">{log.mood}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{log.timestamp}</span>
                    </div>
                    {log.note && <p className="text-xs text-slate-600 mt-0.5">"{log.note}"</p>}
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] text-slate-400">Energy Level:</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 rounded-full ${i < log.energyLevel ? 'bg-blue-600' : 'bg-slate-200'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 text-center">
            Daily logs build aggregate baseline trends for HR without exposing individual identities.
          </p>
        </div>

        {/* Right Column: AI Wellness Coach Chat Interface */}
        <div className="enterprise-card p-6 border border-slate-200 lg:col-span-2 flex flex-col h-[560px]">
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  AI Haven Wellness Coach
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </h3>
                <p className="text-xs text-slate-500">Personalized guidance based on your work patterns</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 hidden sm:inline">
              Private 1-on-1 Chat
            </span>
          </div>

          {/* Quick Prompt Chips */}
          <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-100">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendCoachMessage(prompt)}
                className="text-xs text-slate-700 bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 px-3 py-1.5 rounded-full shrink-0 transition-all font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {chatMessages.map(msg => (
              <div 
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div 
                  className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium shadow-xs rounded-br-none'
                      : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`text-[10px] mt-1.5 block text-right ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 border border-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSend} className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask your AI Wellness Coach for advice (e.g., 'How can I reduce meeting fatigue?')..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
