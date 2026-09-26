import React, { useState, useEffect } from 'react';
import { X, Trophy, Check, ShieldAlert, Swords, Crown, Award } from 'lucide-react';
import { Player, Tournament } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../utils/assets';
import { calculateMatchPoints } from '../utils/points';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  players: Player[];
}

export const AddMatchModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, players }) => {
  const { isIGL, showPermissionDenied } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  // Form states (Tournament only, no practice)
  const [selectedMap, setSelectedMap] = useState<'BERMUDA' | 'NEXTERRA' | 'KALAHARI' | 'ALPINE' | 'PURGATORY'>('BERMUDA');
  const [placement, setPlacement] = useState<number>(1);
  const [tournamentId, setTournamentId] = useState<number | ''>('');
  const [date, setDate] = useState<string>('26 Sept 2026');
  const [time, setTime] = useState<string>('08:40 PM');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Player breakdown states (Kills only - Assist, Damage, Survival removed)
  const [playerStats, setPlayerStats] = useState<Array<{
    player_id: number;
    player_name: string;
    kills: number;
  }>>([]);

  useEffect(() => {
    if (isOpen) {
      if (!isIGL) {
        showPermissionDenied('Add Match');
        onClose();
        return;
      }

      api.getTournaments().then((tList) => {
        setTournaments(tList);
        if (tList.length > 0 && !tournamentId) {
          setTournamentId(tList[0].id);
        }
      }).catch(() => {});

      const initial = players.slice(0, 4).map((p) => ({
        player_id: p.id,
        player_name: p.player_name,
        kills: 0,
      }));
      setPlayerStats(initial);
    }
  }, [isOpen, players, isIGL]);

  if (!isOpen) return null;

  // Auto calculate total team kills
  const totalTeamKills = playerStats.reduce((sum, p) => sum + (Number(p.kills) || 0), 0);
  const points = calculateMatchPoints(placement, totalTeamKills);

  const handleKillsChange = (index: number, value: number) => {
    const updated = [...playerStats];
    updated[index] = { ...updated[index], kills: Math.max(0, value) };
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
        type: 'Tournament',
        map: selectedMap,
        placement: Number(placement),
        date: date,
        time: time,
        tournament_id: tournamentId ? Number(tournamentId) : null,
        team_kills: totalTeamKills,
        notes: notes.trim() || undefined,
        player_stats: playerStats.map((p) => ({
          player_id: p.player_id,
          player_name: p.player_name,
          kills: Number(p.kills) || 0,
          assists: 0,
          deaths: 0,
          survival_percent: placement === 1 ? 100 : Math.max(0, 100 - placement * 8),
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

  const mapsList: Array<{ name: 'BERMUDA' | 'NEXTERRA' | 'KALAHARI' | 'ALPINE' | 'PURGATORY'; img: string }> = [
    { name: 'BERMUDA', img: ASSETS.maps.BERMUDA },
    { name: 'NEXTERRA', img: ASSETS.maps.NEXTERRA },
    { name: 'KALAHARI', img: ASSETS.maps.KALAHARI },
    { name: 'ALPINE', img: ASSETS.maps.ALPINE },
    { name: 'PURGATORY', img: ASSETS.maps.PURGATORY },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in-smooth overflow-y-auto">
      <div className="bg-[#141419] rounded-2xl p-5 max-w-md w-full shadow-2xl border border-[#22222b] relative my-6 text-left max-h-[92vh] overflow-y-auto animate-slide-up-smooth">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#22222b]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
              <Trophy className="w-3 h-3 text-amber-400" />
              Tournament Match Entry
            </span>
            <h2 className="text-lg font-black text-white mt-1">
              Add Tournament Match
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1c1c24] hover:bg-[#282836] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Linked Tournament */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Select Tournament</label>
            <select
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value ? Number(e.target.value) : '')}
              className="w-full py-2 px-3 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-semibold text-white focus:outline-none focus:border-red-500"
            >
              <option value="">-- Standalone Tournament Match --</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.date})</option>
              ))}
            </select>
          </div>

          {/* Map Selection */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1.5">
              Select Map
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {mapsList.map((m) => (
                <button
                  type="button"
                  key={m.name}
                  onClick={() => setSelectedMap(m.name)}
                  className={`p-1 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    selectedMap === m.name
                      ? 'border-red-500 bg-red-500/15 ring-2 ring-red-500/20 shadow-sm'
                      : 'border-[#282836] hover:border-zinc-500 bg-[#1c1c24]'
                  }`}
                >
                  <img src={m.img} alt={m.name} className="w-9 h-7 rounded-lg object-cover" />
                  <span className="text-[8.5px] font-black text-white tracking-tight leading-none truncate max-w-full">
                    {m.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Placement, Date, Time Row */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Placement #</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="12"
                  required
                  value={placement}
                  onChange={(e) => setPlacement(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                  className="w-full py-2 px-3 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-sm font-extrabold text-white text-center focus:border-red-500 focus:outline-none"
                />
                {placement === 1 && (
                  <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-1.5 right-1" />
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Date</label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-2 px-2.5 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-semibold text-white text-center focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Time</label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full py-2 px-2.5 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-semibold text-white text-center focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Live Points Preview Card */}
          <div className="p-3 bg-gradient-to-r from-[#1c1712] to-[#141419] rounded-xl border border-amber-500/25 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-black text-amber-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>Calculated Points</span>
              </div>
              <div className="text-[11px] font-bold text-zinc-300 mt-0.5">
                #{placement} ({points.placementPts} pts) + {points.killPts} kills ({points.killPts} pts)
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-amber-400 leading-none">{points.totalPts}</div>
              <div className="text-[9px] font-extrabold text-zinc-400 uppercase">Match Points</div>
            </div>
          </div>

          {/* Squad Kills Breakdown (Kills Only) */}
          <div className="p-3 bg-[#1c1c24] rounded-xl border border-[#282836]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-white">
                Squad Eliminations (Kills Only)
              </span>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-red-400">
                <Swords className="w-3.5 h-3.5" />
                <span>{totalTeamKills} Total Kills</span>
              </div>
            </div>

            <div className="space-y-1.5">
              {playerStats.map((p, idx) => (
                <div key={p.player_id} className="p-2 bg-[#141419] rounded-lg border border-[#282836] flex items-center justify-between gap-2">
                  <span className="font-extrabold text-xs text-white truncate flex-1">
                    {p.player_name}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Kills</span>
                    <input
                      type="number"
                      min="0"
                      value={p.kills}
                      onChange={(e) => handleKillsChange(idx, parseInt(e.target.value) || 0)}
                      className="w-16 py-1 text-center rounded-lg bg-[#1c1c24] text-xs font-black text-red-400 border border-[#2b2b38] focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              Match Notes & Observations (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Good early fight on Kalahari command post."
              className="w-full p-2.5 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-medium text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Save Tournament Match</span>
          </button>
        </form>
      </div>
    </div>
  );
};
