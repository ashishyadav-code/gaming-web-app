import React, { useState, useEffect } from 'react';
import { X, Award, Swords, BarChart2, Crown } from 'lucide-react';
import { WeeklyEvaluation } from '../types';
import { api } from '../api/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [weekly, setWeekly] = useState<WeeklyEvaluation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getWeeklyEvaluation()
        .then((wData) => {
          setWeekly(wData);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#141419] rounded-2xl p-5 max-w-md w-full shadow-2xl border border-[#22222b] text-left relative my-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#22222b] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400">
                Deterministic Engine
              </span>
              <h2 className="text-base font-black text-white leading-tight">
                Team Progress & Insights
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#1c1c24] hover:bg-[#282836] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-zinc-400 text-xs font-bold">
            Computing statistical models...
          </div>
        ) : weekly ? (
          <div className="space-y-3.5">
            {/* Core Question Answer Header */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-900/60 to-[#1e1215] border border-red-500/30 text-white shadow-md">
              <div className="text-[9.5px] uppercase tracking-widest font-extrabold text-red-400">
                IGL Executive Answer
              </div>
              <h3 className="text-sm font-black mt-0.5 leading-snug">
                "Are we actually getting better?"
              </h3>
              <p className="text-xs text-zinc-200 mt-1 leading-relaxed">
                Yes. Team combat kills shifted from {weekly.previous_avg_kills} to {weekly.current_avg_kills} avg frags, and placement improved from #{weekly.previous_avg_placement} to #{weekly.current_avg_placement}.
              </p>
            </div>

            {/* Week 1 vs Week 2 Table */}
            <div className="p-3.5 rounded-xl bg-[#1c1c24] border border-[#282836]">
              <div className="flex items-center justify-between mb-3 text-xs font-black text-white">
                <span className="text-zinc-400">{weekly.previous_week_label}</span>
                <span className="text-zinc-600">&rarr;</span>
                <span className="text-red-400">{weekly.current_week_label}</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Avg Kills */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#141419] border border-[#282836]">
                  <div className="flex items-center gap-2 font-bold text-zinc-300">
                    <Swords className="w-3.5 h-3.5 text-red-400" />
                    <span>Average Kills</span>
                  </div>
                  <div className="font-extrabold text-zinc-200">
                    {weekly.previous_avg_kills} &rarr; <span className="text-red-400">{weekly.current_avg_kills}</span>
                  </div>
                </div>

                {/* Placement */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#141419] border border-[#282836]">
                  <div className="flex items-center gap-2 font-bold text-zinc-300">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Average Placement</span>
                  </div>
                  <div className="font-extrabold text-zinc-200">
                    #{weekly.previous_avg_placement} &rarr; <span className="text-emerald-400">#{weekly.current_avg_placement}</span>
                  </div>
                </div>

                {/* Booyah */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#141419] border border-[#282836]">
                  <div className="flex items-center gap-2 font-bold text-zinc-300">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Booyah Count</span>
                  </div>
                  <div className="font-extrabold text-zinc-200">
                    {weekly.previous_booyah} &rarr; <span className="text-amber-400">{weekly.current_booyah}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Observations */}
            {weekly.insights && weekly.insights.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-black uppercase tracking-wider text-zinc-400 px-1">
                  Tactical Progress Insights
                </div>
                {weekly.insights.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#1c1c24] border border-[#282836] text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-white">{item.title}</span>
                      {item.metric_delta && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/5 text-amber-400 border border-white/5">
                          {item.metric_delta}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-snug">{item.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
