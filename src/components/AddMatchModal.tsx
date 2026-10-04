import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Trophy, Check, ShieldAlert, Swords, Crown, Award, UserPlus, Trash2, User } from 'lucide-react';
import { Player, Tournament } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../utils/assets';
import { calculateMatchPoints } from '../utils/points';
import { getTodayDateString } from '../utils/dateUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  players: Player[];
}

interface SquadEntry {
  uid: string;
  player_id: number;
  player_name: string;
  kills: number;
  is_random?: boolean;
}

const DEFAULT_OFFICIAL_NAMES = ['HASHIRAMA', 'ITACHI', 'TUUFAN', 'PANDIT'];

export const AddMatchModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, players }) => {
  const { isIGL, showPermissionDenied } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // Form states (Tournament only, no practice)
  const [selectedMap, setSelectedMap] = useState<'BERMUDA' | 'NEXTERRA' | 'KALAHARI' | 'ALPINE' | 'PURGATORY'>('BERMUDA');
  const [placement, setPlacement] = useState<number>(1);
  const [placementInput, setPlacementInput] = useState<string>("1");
  const [tournamentId, setTournamentId] = useState<number | ''>('');
  const [date, setDate] = useState<string>(() => getTodayDateString());
  const [time, setTime] = useState<string>('08:40 PM');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Squad entries (supports toggling official players and adding random/guest players)
  const [squadEntries, setSquadEntries] = useState<SquadEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setDate(getTodayDateString());
      setPlacement(1);
      setPlacementInput("1");
      setErrorMsg(null);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  // Build the list of official players available
  const officialPlayersList = React.useMemo(() => {
    if (players && players.length > 0) {
      return players.slice(0, 4);
    }
    return DEFAULT_OFFICIAL_NAMES.map((name, idx) => ({
      id: idx + 1,
      player_name: name,
    })) as Player[];
  }, [players]);

  // Initialize squad with 4 official players when modal opens
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

      const initial: SquadEntry[] = officialPlayersList.map((p) => ({
        uid: `official_${p.id}`,
        player_id: p.id,
        player_name: p.player_name,
        kills: 0,
        is_random: false,
      }));
      setSquadEntries(initial);
    }
  }, [isOpen, officialPlayersList, isIGL]);

  if (!isOpen && !shouldRender) return null;

  // Auto calculate total team kills from all currently active players in this match
  const totalTeamKills = squadEntries.reduce((sum, p) => sum + (Number(p.kills) || 0), 0);
  const points = calculateMatchPoints(placement, totalTeamKills);

  // Handle kill count changes
  const handleKillsChange = (index: number, value: number) => {
    const updated = [...squadEntries];
    updated[index] = { ...updated[index], kills: Math.max(0, value) };
    setSquadEntries(updated);
  };

  // Handle custom name change for random/guest player
  const handleNameChange = (index: number, name: string) => {
    const updated = [...squadEntries];
    updated[index] = { ...updated[index], player_name: name };
    setSquadEntries(updated);
  };

  // Remove player (official or random) from this match
  const handleRemovePlayer = (index: number) => {
    setSquadEntries((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Re-add an official player who was removed/benched
  const handleAddOfficialPlayer = (player: Player) => {
    setSquadEntries((prev) => [
      ...prev,
      {
        uid: `official_${player.id}_${Date.now()}`,
        player_id: player.id,
        player_name: player.player_name,
        kills: 0,
        is_random: false,
      },
    ]);
  };

  // Add a new random/guest player slot
  const handleAddRandomPlayer = () => {
    const randomId = Date.now();
    setSquadEntries((prev) => [
      ...prev,
      {
        uid: `random_${randomId}`,
        player_id: randomId,
        player_name: '',
        kills: 0,
        is_random: true,
      },
    ]);
  };

  // Find official players currently sitting out (not in the active squad)
  const benchedOfficialPlayers = officialPlayersList.filter(
    (op) => !squadEntries.some((se) => !se.is_random && (se.player_id === op.id || se.player_name.toUpperCase() === op.player_name.toUpperCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIGL) {
      showPermissionDenied('Add Match');
      return;
    }

    if (squadEntries.length === 0) {
      setErrorMsg('Please include at least 1 player in the squad.');
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
        player_stats: squadEntries.map((p, idx) => ({
          player_id: p.player_id,
          player_name: p.player_name.trim() || (p.is_random ? `Guest ${idx + 1}` : 'Player'),
          kills: Number(p.kills) || 0,
          assists: 0,
          deaths: 0,
          survival_percent: placement === 1 ? 100 : Math.max(0, 100 - placement * 8),
          is_random: !!p.is_random,
        })),
      };

      await api.createMatch(payload);
      setIsSubmitting(false);
      onSuccess();
      triggerClose();
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

  return createPortal(
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}>
      <div className={`glass-sheet rounded-3xl max-w-md w-full shadow-2xl border border-white/10 relative text-left max-h-[92vh] flex flex-col overflow-hidden transition-all ${isClosing ? 'animate-modal-pop-out' : 'animate-modal-pop-in'}`}>
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 pb-3 border-b border-white/10 flex-shrink-0 bg-[#0f0f15]/95 z-10">
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
            onClick={triggerClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 pt-3 space-y-4 pr-3.5 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

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
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Placement #</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={placementInput}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        if (val === '') {
                          setPlacementInput('');
                          return;
                        }
                        if (/^\d+$/.test(val)) {
                          const num = parseInt(val, 10);
                          if (num <= 12) {
                            setPlacementInput(val);
                            if (num >= 1) {
                              setPlacement(num);
                            }
                          }
                        }
                      }}
                      onBlur={() => {
                        const num = parseInt(placementInput, 10);
                        if (isNaN(num) || num < 1) {
                          setPlacement(1);
                          setPlacementInput('1');
                        } else if (num > 12) {
                          setPlacement(12);
                          setPlacementInput('12');
                        } else {
                          setPlacement(num);
                          setPlacementInput(String(num));
                        }
                      }}
                      placeholder="1-12"
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

              {/* Quick 1-12 Placement Rank Chips */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold mb-1 px-0.5">
                  <span>Select Rank (Tap 1-12):</span>
                  <span className="text-amber-400 font-black">Rank #{placement} ({points.placementPts} PP)</span>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setPlacement(r);
                        setPlacementInput(String(r));
                      }}
                      className={`py-1 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-0.5 ${
                        placement === r
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30 ring-1 ring-red-400 scale-105'
                          : 'bg-[#1c1c24] text-zinc-400 hover:text-white hover:bg-[#252532] border border-[#2a2a38]'
                      }`}
                    >
                      {r === 1 && <Crown className="w-2.5 h-2.5 text-amber-400" />}
                      <span>#{r}</span>
                    </button>
                  ))}
                </div>
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

            {/* Squad Roster & Eliminations */}
            <div className="p-3 bg-[#1c1c24] rounded-xl border border-[#282836] space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-white block">
                    Squad Roster & Kills ({squadEntries.length} Active)
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    Remove benched players or add random/guests
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-red-400">
                  <Swords className="w-3.5 h-3.5" />
                  <span>{totalTeamKills} Total Kills</span>
                </div>
              </div>

              {/* Active Player Rows */}
              <div className="space-y-1.5">
                {squadEntries.length === 0 ? (
                  <div className="p-3 text-center text-xs text-zinc-500 border border-dashed border-[#2b2b38] rounded-lg">
                    No players in this match squad. Add players below.
                  </div>
                ) : (
                  squadEntries.map((p, idx) => (
                    <div
                      key={p.uid}
                      className="p-2 bg-[#141419] rounded-lg border border-[#282836] flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {p.is_random ? (
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-500/10 border border-purple-500/30 px-1 py-0.5 rounded flex-shrink-0">
                              Guest
                            </span>
                            <input
                              type="text"
                              value={p.player_name}
                              onChange={(e) => handleNameChange(idx, e.target.value)}
                              placeholder="Guest Name..."
                              className="w-full bg-[#1c1c24] border border-[#2b2b38] rounded-md px-2 py-1 text-xs font-bold text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1 py-0.5 rounded flex-shrink-0">
                              SRK
                            </span>
                            <span className="font-extrabold text-xs text-white truncate">
                              {p.player_name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Kills Counter & Remove Action */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase mr-0.5">Kills</span>
                        <button
                          type="button"
                          onClick={() => handleKillsChange(idx, Math.max(0, p.kills - 1))}
                          className="w-7 h-7 rounded-lg bg-[#1c1c24] hover:bg-[#282836] border border-[#2b2b38] text-zinc-300 font-black text-sm flex items-center justify-center active:scale-95 transition-all"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={p.kills}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            if (val === '' || /^\d+$/.test(val)) {
                              handleKillsChange(idx, val === '' ? 0 : parseInt(val, 10) || 0);
                            }
                          }}
                          className="w-10 py-1 text-center rounded-lg bg-[#1c1c24] text-xs font-black text-red-400 border border-[#2b2b38] focus:border-red-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleKillsChange(idx, p.kills + 1)}
                          className="w-7 h-7 rounded-lg bg-[#1c1c24] hover:bg-[#282836] border border-[#2b2b38] text-zinc-300 font-black text-sm flex items-center justify-center active:scale-95 transition-all"
                        >
                          +
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemovePlayer(idx)}
                          className="w-7 h-7 ml-1 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/25 text-red-400 hover:text-red-300 flex items-center justify-center active:scale-95 transition-all"
                          title="Remove from this match"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Benched official players quick re-add */}
              {benchedOfficialPlayers.length > 0 && (
                <div className="pt-1.5 border-t border-[#282836]/60">
                  <div className="text-[10px] font-bold text-zinc-400 mb-1">
                    Sitting Out (Tap to add back):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {benchedOfficialPlayers.map((op) => (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => handleAddOfficialPlayer(op)}
                        className="py-1 px-2 rounded-lg bg-[#141419] hover:bg-[#1f1f28] border border-amber-500/30 text-amber-300 text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <UserPlus className="w-3 h-3 text-amber-400" />
                        <span>+ {op.player_name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Random / Guest Player Action */}
              <button
                type="button"
                onClick={handleAddRandomPlayer}
                className="w-full py-2 px-3 rounded-lg bg-[#141419] hover:bg-[#1a1a22] border border-dashed border-purple-500/40 text-purple-300 hover:text-purple-200 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-98 mt-1"
              >
                <UserPlus className="w-3.5 h-3.5 text-purple-400" />
                <span>+ Add Random / Guest Player</span>
              </button>
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
          </div>

          {/* Sticky Footer */}
          <div className="p-4 sm:p-5 pt-3 border-t border-white/10 flex-shrink-0 bg-[#0f0f15]/95 z-10">
            <button
              type="submit"
              disabled={isSubmitting || squadEntries.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save Tournament Match ({points.totalPts} Pts)</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
