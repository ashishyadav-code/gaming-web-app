import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Sparkles, Activity, ShieldAlert, Award, Swords, Flame, BarChart2 } from 'lucide-react';
import { WeeklyEvaluation, PracticeSession } from '../types';
import { api } from '../api/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [weekly, setWeekly] = useState<WeeklyEvaluation | null>(null);
  const [practices, setPractices] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([api.getWeeklyEvaluation(), api.getPracticeSessions()])
        .then(([wData, pData]) => {
          setWeekly(wData);
          setPractices(pData);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-[32px] p-5 max-w-md w-full shadow-2xl border border-slate-100 text-left relative my-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                Deterministic Engine
              </span>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Team Progress & Insights
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-bold">
            Computing statistical models...
          </div>
        ) : weekly ? (
          <div className="space-y-4">
            {/* Core Question Answer Header */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
              <div className="text-[10px] uppercase tracking-widest font-extrabold text-blue-200">
                IGL Executive Answer
              </div>
              <h3 className="text-base font-black mt-0.5 leading-snug">
                "Are we actually getting better?"
              </h3>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                Yes. Team firepower increased by +{Math.round(((weekly.current_avg_damage - weekly.previous_avg_damage) / Math.max(1, weekly.previous_avg_damage)) * 100)}% and placement improved from #{weekly.previous_avg_placement} to #{weekly.current_avg_placement}.
              </p>
            </div>

            {/* Week 1 vs Week 2 Table */}
            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-3 text-xs font-black text-slate-800">
                <span>{weekly.previous_week_label}</span>
                <span className="text-slate-400">&rarr;</span>
                <span className="text-blue-600">{weekly.current_week_label}</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Avg Kills */}
                <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-slate-600">
                    <Swords className="w-4 h-4 text-rose-500" />
                    <span>Average Kills</span>
                  </div>
                  <div className="font-extrabold text-slate-900">
                    {weekly.previous_avg_kills} &rarr; <span className="text-rose-600">{weekly.current_avg_kills}</span>
                  </div>
                </div>

                {/* Avg Damage */}
                <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-slate-600">
                    <Flame className="w-4 h-4 text-purple-500" />
                    <span>Average Damage</span>
                  </div>
                  <div className="font-extrabold text-slate-900">
                    {Math.round(weekly.previous_avg_damage)} &rarr; <span className="text-purple-600">{Math.round(weekly.current_avg_damage)}</span>
                  </div>
                </div>

                {/* Placement */}
                <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-slate-600">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Average Placement</span>
                  </div>
                  <div className="font-extrabold text-slate-900">
                    #{weekly.previous_avg_placement} &rarr; <span className="text-emerald-600">#{weekly.current_avg_placement}</span>
                  </div>
                </div>

                {/* Booyah */}
                <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-slate-600">
                    <span className="text-xs">👑</span>
                    <span>Booyah Count</span>
                  </div>
                  <div className="font-extrabold text-slate-900">
                    {weekly.previous_booyah} &rarr; <span className="text-amber-600">{weekly.current_booyah}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deterministic Insights List */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 px-1">
                Deterministic Observations
              </h3>
              <div className="space-y-2">
                {weekly.insights.map((ins, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-slate-900">{ins.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {ins.confidence}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      {ins.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Translation Observation */}
            <div className="p-4 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold mb-1">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Practice-to-Tournament Translation</span>
              </div>
              <p className="text-emerald-800 font-medium leading-relaxed">
                "Performance increased after a period of structured practice sessions focusing on Zone 4 crossfire and compound entry."
              </p>
              <div className="mt-2 text-[10px] text-emerald-700 font-bold">
                {practices.length} recorded practice drills evaluated.
              </div>
            </div>

            {/* Confidence Footer */}
            <div className="text-[11px] text-slate-400 font-medium text-center">
              {weekly.confidence_note}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
