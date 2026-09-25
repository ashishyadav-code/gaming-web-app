import React, { useState, useEffect } from 'react';
import { X, Trophy, Gamepad2, Check, ShieldAlert, Swords } from 'lucide-react';
import { Player, Tournament, PracticeSession } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../utils/assets';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  players: Player[];
}

export const AddMatchModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, players }) => {
  const { isIGL, showPermissionDenied } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [practices, setPractices] = useState<PracticeSession[]>([]);

  // Form states
  const [matchType, setMatchType] = useState<'Practice' | 'Tournament'>('Practice');
  const [selectedMap, setSelectedMap] = useState<'BERMUDA' | 'NEXTERRA' | 'KALAHARI' | 'ALPINE' | 'PURGATORY'>('BERMUDA');
  const [placement, setPlacement] = useState<number>(1);
  const [tournamentId, setTournamentId] = useState<number | ''>('');
  const [practiceId, setPracticeId] = useState<number | ''>('');
  const [date, setDate] = useState<string>('25 Sept 2026');
  const [time, setTime] = useState<string>('08:40 PM');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Player breakdown states (KILLS & ASSISTS ONLY - NO DAMAGE AS REQUESTED)
  const [playerStats, setPlayerStats] = useState<Array<{
    player_id: number;
    player_name: string;
    kills: number;
    assists: number;
    deaths: number;
  }>>([]);

  useEffect(() => {
    if (isOpen) {
      if (!isIGL) {
        showPermissionDenied('Add Match');
        onClose();
        return;
      }

      api.getTournaments().then(setTournaments).catch(() => {});
      api.getPracticeSessions().then(setPractices).catch(() => {});

      const initial = players.slice(0, 4).map((p) => ({
        player_id: p.id,
        player_name: p.player_name,
        kills: 2,
        assists: 1,
        deaths: 1,
      }));
      setPlayerStats(initial);
    }
  }, [isOpen, players, isIGL]);

  if (!isOpen) return null;

  // Auto calculate total team kills
  const totalTeamKills = playerStats.reduce((sum, p) => sum + (Number(p.kills) || 0), 0);

  const handleStatChange = (index: number, field: 'kills' | 'assists' | 'deaths', value: number) => {
    const updated = [...playerStats];
    updated[index] = { ...updated[index], [field]: Math.max(0, value) };
    setPlayerStats(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIGL) {
      showPermissionDenied('Add Match');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        type: matchType,
        map: selectedMap,
        placement: Number(placement),
        date: date,
        time: time,
        tournament_id: matchType === 'Tournament' && tournamentId ? Number(tournamentId) : null,
        practice_session_id: matchType === 'Practice' && practiceId ? Number(practiceId) : null,
        team_kills: totalTeamKills,
        notes: notes.trim() || undefined,
        player_stats: playerStats.map((p) => ({
          player_id: p.player_id,
          player_name: p.player_name,
          kills: Number(p.kills) || 0,
          assists: Number(p.assists) || 0,
          deaths: Number(p.deaths) || 0,
          survival_percent: placement === 1 ? 80.0 : Math.max(30.0, 75.0 - placement * 4),
        })),
      };

      await api.createMatch(payload);
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to save match.');
    }
  };

  // Maps list with KALAHARI added as requested!
  const mapsList: Array<{ name: 'BERMUDA' | 'NEXTERRA' | 'KALAHARI' | 'ALPINE' | 'PURGATORY'; img: string }> = [
    { name: 'BERMUDA', img: ASSETS.maps.BERMUDA },
    { name: 'NEXTERRA', img: ASSETS.maps.NEXTERRA },
    { name: 'KALAHARI', img: ASSETS.maps.KALAHARI },
    { name: 'ALPINE', img: ASSETS.maps.ALPINE },
    { name: 'PURGATORY', img: ASSETS.maps.PURGATORY },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm animate-fade-in-smooth overflow-y-auto">
      <div className="bg-white rounded-[32px] p-5 max-w-md w-full shadow-2xl border border-slate-100 relative my-6 text-left max-h-[92vh] overflow-y-auto animate-slide-up-smooth">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              IGL Match Entry
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Add Match Result
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Match Type Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Match Type</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setMatchType('Practice')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  matchType === 'Practice' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Gamepad2 className="w-4 h-4" /> Practice
              </button>
              <button
                type="button"
                onClick={() => setMatchType('Tournament')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  matchType === 'Tournament' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Trophy className="w-4 h-4" /> Tournament
              </button>
            </div>
          </div>

          {/* Map Selection - Featuring KALAHARI */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select Map (Includes Kalahari)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {mapsList.map((m) => (
                <button
                  type="button"
                  key={m.name}
                  onClick={() => setSelectedMap(m.name)}
                  className={`p-1 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    selectedMap === m.name
                      ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <img src={m.img} alt={m.name} className="w-9 h-7 rounded-lg object-cover" />
                  <span className="text-[9px] font-black text-slate-800 tracking-tight leading-none truncate max-w-full">
                    {m.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Linked Tournament or Practice Session */}
          {matchType === 'Tournament' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Tournament</label>
              <select
                value={tournamentId}
                onChange={(e) => setTournamentId(e.target.value ? Number(e.target.value) : '')}
                className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Standalone Tournament Match --</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.date})</option>
                ))}
              </select>
            </div>
          )}

          {matchType === 'Practice' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Linked Practice Session</label>
              <select
                value={practiceId}
                onChange={(e) => setPracticeId(e.target.value ? Number(e.target.value) : '')}
                className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Standalone Practice Match --</option>
                {practices.map((p) => (
                  <option key={p.id} value={p.id}>{p.date} - {p.focus} ({p.duration_minutes}m)</option>
                ))}
              </select>
            </div>
          )}

          {/* Placement, Date, Time Row */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Placement #</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={placement}
                  onChange={(e) => setPlacement(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full py-2 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-extrabold text-slate-900 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {placement === 1 && (
                  <span className="absolute -top-2 right-1 text-xs">👑</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Date</label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-2 px-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Time</label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full py-2 px-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 4-Player Stats Section (KILLS & ASSISTS ONLY - NO DAMAGE) */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-800">
                Squad Eliminations (Kills Only)
              </span>
              <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600">
                <Swords className="w-3.5 h-3.5" />
                <span>{totalTeamKills} Total Kills</span>
              </div>
            </div>

            <div className="space-y-2">
              {playerStats.map((p, idx) => (
                <div key={p.player_id} className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2">
                  <span className="font-extrabold text-xs text-slate-800 w-20 truncate">
                    {p.player_name}
                  </span>

                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-bold">KILLS</span>
                      <input
                        type="number"
                        min="0"
                        value={p.kills}
                        onChange={(e) => handleStatChange(idx, 'kills', parseInt(e.target.value) || 0)}
                        className="w-12 py-1 text-center rounded-lg bg-slate-100 text-xs font-black text-blue-600 border border-slate-200"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-bold">ASSISTS</span>
                      <input
                        type="number"
                        min="0"
                        value={p.assists}
                        onChange={(e) => handleStatChange(idx, 'assists', parseInt(e.target.value) || 0)}
                        className="w-10 py-1 text-center rounded-lg bg-slate-100 text-xs font-bold border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Match Notes & Observations (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Good early fight on Kalahari command post."
              className="w-full p-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm shadow-btn-glow transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>Save Match Result</span>
          </button>
        </form>
      </div>
    </div>
  );
};
