import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useAuth } from '../../context/AuthContext'
import {
    adminGetMembers, adminUpdateStats, adminDeleteMember,
    getTournaments, adminManageTournament, loadDemoData,
    getScrims, adminManageScrim, adminUpdateRole,
    getSettings, adminUpdateSettings, adminUpdateMemberUuid, adminSendNotification
} from '../../utils/api'
import { getAIHomePanelContent, getAITournamentPrediction } from '../../utils/aiService'

import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'

export default function AdminDashboard() {
    const { adminToken, logoutAdmin } = useAuth()
    const [activeTab, setActiveTab] = useState('players')
    const [members, setMembers] = useState([])
    const [tournaments, setTournaments] = useState({ upcoming: [], running: [], past: [] })
    const [scrims, setScrims] = useState([])
    const [status, setStatus] = useState('loading')

    // UI State
    const [editingStatsId, setEditingStatsId] = useState(null)
    const [statsForm, setStatsForm] = useState({
        kills: 0, matches: 0, wins: 0, runnerUps: 0, kd: '0.0', ace: 0,
        prevKills: 0, prevWins: 0, prevRunnerUps: 0
    })
    const [saving, setSaving] = useState(false)

    // Scrim Modal State
    const [showScrimForm, setShowScrimForm] = useState(false)
    const [scrimForm, setScrimForm] = useState({
        title: '', date: new Date().toLocaleDateString(), opponent: '',
        players: [{ uid: '', name: '', kills: 0, aces: 0 }]
    })

    // Tournament Modal State
    const [showTourneyForm, setShowTourneyForm] = useState(false)
    const [isEditingTourney, setIsEditingTourney] = useState(false)
    const [tourneyForm, setTourneyForm] = useState({
        id: '', title: '', date: '', prize: '', type: 'Squad', section: 'upcoming',
        teamSize: 4, entryFee: '', description: '',
        prizes: { winner: '', runner: '', mvp: '', third: '' },
        pointsPerKill: 1, maxSlots: 24, placementPoints: ''
    })

    // Custom Confirm Dialog State
    const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null })

    // Views
    const [managingTourney, setManagingTourney] = useState(null)
    const [managingPoints, setManagingPoints] = useState(null) // tourney object
    const [managingKills, setManagingKills] = useState(null) // tourney object
    const [editingMatch, setEditingMatch] = useState(null) // { tourney, index }
    const [syncReport, setSyncReport] = useState(null)

    useEffect(() => {
        fetchData()
    }, [])

    async function triggerPredictionRefresh(mems = members, tours = tournaments) {
        const upcoming = tours.upcoming || [];
        for (const t of upcoming) {
            if (t.participants?.length >= 2) {
                try {
                    console.log(`Refreshing predictions for: ${t.title}`);
                    const prediction = await getAITournamentPrediction(t, mems);
                    if (prediction) {
                        await adminManageTournament('update', { id: t._id, prediction }, adminToken);
                    }
                } catch (err) {
                    console.error(`Prediction refresh failed for ${t.title}`, err);
                }
            }
        }
    }

    async function fetchData() {
        setStatus('loading')
        try {
            const [mems, tours, scrs] = await Promise.all([
                adminGetMembers(adminToken),
                getTournaments(),
                getScrims()
            ])
            setMembers(mems)
            setTournaments(tours)
            setScrims(scrs)
            setStatus('success')
        } catch {
            setStatus('error')
        }
    }

    async function handleSeedData() {
        if (!window.confirm('Add demo players and tournaments to test?')) return
        setSaving(true)
        try {
            await loadDemoData(adminToken)
            toast.success('Demo data loaded!')
            fetchData()
        } catch {
            toast.error('Failed to load demo data.')
        } finally {
            setSaving(false)
        }
    }

    async function handleUpdateStats(id, category = 'tourney') {
        setSaving(true)
        try {
            await adminUpdateStats(id, statsForm, adminToken, category)
            toast.success('Stats updated!')

            // Trigger prediction refresh in background
            const freshMembers = await adminGetMembers(adminToken);
            setMembers(freshMembers);
            triggerPredictionRefresh(freshMembers, tournaments);

            setEditingStatsId(null)
        } catch {
            toast.error('Failed to update stats.')
        } finally {
            setSaving(false)
        }
    }

    async function handleUpdateRole(id, role) {
        setSaving(true)
        try {
            await adminUpdateRole(id, role, adminToken)
            toast.success('Role updated!')
            fetchData()
        } catch {
            toast.error('Failed to update role.')
        } finally {
            setSaving(false)
        }
    }



    async function handleAddOrUpdateTournament() {
        setSaving(true)
        const action = isEditingTourney ? 'update' : 'add'
        try {
            const payload = {
                ...tourneyForm,
                pointsPerKill: Number(tourneyForm.pointsPerKill) || 0,
                maxSlots: Number(tourneyForm.maxSlots) || 0,
                id: isEditingTourney ? tourneyForm._id : undefined
            }
            await adminManageTournament(action, payload, adminToken)
            toast.success(isEditingTourney ? 'Tournament updated!' : 'Tournament added!')
            setShowTourneyForm(false)
            setIsEditingTourney(false)

            // Refresh data and predictions
            const [mems, tours] = await Promise.all([
                adminGetMembers(adminToken),
                getTournaments()
            ]);
            setMembers(mems);
            setTournaments(tours);
            triggerPredictionRefresh(mems, tours);
        } catch {
            toast.error(`Failed to ${action} tournament.`)
        } finally {
            setSaving(false)
        }
    }

    async function handleDeleteTournament(id, title) {
        setConfirmDialog({
            show: true,
            title: 'DELETE TOURNAMENT?',
            message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
            onConfirm: async () => {
                setSaving(true)
                try {
                    await adminManageTournament('delete', { id }, adminToken)
                    toast.success('Tournament deleted.')
                    fetchData()
                } catch {
                    toast.error('Failed to delete tournament.')
                } finally {
                    setSaving(false)
                }
            }
        })
    }

    async function handleStartTournament(tourney) {
        setConfirmDialog({
            show: true,
            title: 'START TOURNAMENT?',
            message: `Move "${tourney.title}" to LIVE status? Registration will close.`,
            onConfirm: async () => {
                setSaving(true)
                try {
                    await adminManageTournament('update', { id: tourney._id, section: 'running' }, adminToken)
                    toast.success('Tournament is now live!')
                    fetchData()
                } catch {
                    toast.error('Failed to start tournament.')
                } finally {
                    setSaving(false)
                }
            }
        })
    }

    async function handleFinalize(tourney) {
        const unlocked = tourney.matches?.some(m => !m.isLocked)

        setConfirmDialog({
            show: true,
            title: 'FINALIZE TOURNAMENT?',
            message: unlocked
                ? 'Some matches are NOT locked. Their stats will be skipped. Proceed anyway?'
                : 'This will sync all kills/aces to player profiles and move this to PAST. Cannot be undone.',
            onConfirm: async () => {
                setSaving(true)
                try {
                    const res = await adminManageTournament('finalize', { id: tourney._id }, adminToken)
                    if (res.report) {
                        setSyncReport(res.report)
                    } else {
                        toast.success('Tournament finalized & stats synced!')
                    }
                    fetchData()
                } catch {
                    toast.error('Failed to finalize tournament.')
                } finally {
                    setSaving(false)
                }
            }
        })
    }

    async function handleDeleteMember(id, name) {
        if (!window.confirm(`Delete player "${name}"? This cannot be undone.`)) return
        setSaving(true)
        try {
            await adminDeleteMember(id, adminToken)
            toast.success('Member deleted.')
            fetchData()
        } catch {
            toast.error('Failed to delete member.')
        } finally {
            setSaving(false)
        }
    }

    async function handleSaveScrim() {
        if (!scrimForm.title || !scrimForm.opponent) return toast.error('Fill title and opponent')
        setSaving(true)
        try {
            await adminManageScrim('add', scrimForm, adminToken)
            toast.success('International Match recorded!')
            setShowScrimForm(false)
            setScrimForm({
                title: '', date: new Date().toLocaleDateString(), opponent: '',
                players: [{ uid: '', name: '', kills: 0, aces: 0 }]
            })
            fetchData()
        } catch {
            toast.error('Failed to save match.')
        } finally {
            setSaving(false)
        }
    }

    async function handleDeleteScrim(id) {
        if (!confirm('Delete this record?')) return
        try {
            await adminManageScrim('delete', { id }, adminToken)
            toast.success('Record deleted.')
            fetchData()
        } catch {
            toast.error('Failed to delete record.')
        }
    }

    const onDragEnd = async (result, tourney) => {
        if (!result.destination) return

        const { source, destination } = result
        const newGroups = [...(tourney.groups || [])].map(g => ({ ...g, players: [...g.players] }))
        const participants = [...(tourney.participants || [])]

        let movedPlayer = null

        // Remove from source
        if (source.droppableId === 'unassigned') {
            movedPlayer = participants[source.index] // Don't remove from participants as per user "drop hone ka matalab ye nhi ki total participants me se hat jaye"
            // Actually, if we keep them in both, we need to handle duplicates in groups. 
            // The user says "ham bata rhe he ye vala is team me rahega... drop hone ka matalab ye nhi ki total participants me se hat jaye"
            // Wait, if I don't remove, then it's like a Copy. 
        } else {
            const groupIdx = parseInt(source.droppableId)
            movedPlayer = newGroups[groupIdx].players.splice(source.index, 1)[0]
        }

        // Add to destination
        if (destination.droppableId === 'unassigned') {
            // If dropping back to unassigned, just remove from group (already done above)
        } else {
            const groupIdx = parseInt(destination.droppableId)
            // Prevent duplicate in same group
            if (!newGroups[groupIdx].players.find(p => p.uid === movedPlayer.uid)) {
                newGroups[groupIdx].players.push(movedPlayer)
            }
        }

        // Update DB
        try {
            await adminManageTournament('update', {
                id: tourney._id,
                groups: newGroups
            }, adminToken)
            fetchData()
        } catch {
            toast.error('Failed to save grouping.')
        }
    }

    if (status === 'loading') return <LoadingState />
    if (status === 'error') return <ErrorState />

    return (
        <div style={{ padding: '20px 16px 120px', maxWidth: '600px', margin: '0 auto', minHeight: '100dvh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 className="text-display" style={{ fontSize: '1.4rem', marginBottom: '4px' }}>SARKAR ADMIN</h2>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>GUILD DASHBOARD</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-ghost" onClick={handleSeedData} disabled={saving} style={{ fontSize: '0.65rem' }}>Seed Test Data</button>
                    <button className="btn-ghost" onClick={logoutAdmin} style={{ fontSize: '0.7rem' }}>Exit</button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '14px', overflowX: 'auto', position: 'relative' }}>
                {['players', 'tournaments', 'scrims', 'settings'].map(tab => (
                    <button key={tab} onClick={() => { setActiveTab(tab); setManagingTourney(null); setManagingPoints(null); setEditingMatch(null); setManagingKills(null); }} style={{ flex: 1, minWidth: '72px', padding: '12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, background: activeTab === tab ? 'rgba(192,57,43,0.25)' : 'transparent', color: activeTab === tab ? 'var(--accent)' : 'rgba(255,255,255,0.35)', border: 'none', cursor: 'pointer', transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)', transform: activeTab === tab ? 'scale(1.02)' : 'scale(1)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{tab === 'tournaments' ? 'TOURNEYS' : tab === 'scrims' ? 'INTL' : tab.toUpperCase()}</button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'players' ? (
                    <PlayersTab members={members} editingStatsId={editingStatsId} setEditingStatsId={setEditingStatsId} statsForm={statsForm} setStatsForm={setStatsForm} handleUpdateStats={handleUpdateStats} handleDeleteMember={handleDeleteMember} saving={saving} handleUpdateRole={handleUpdateRole} adminToken={adminToken} />
                ) : activeTab === 'scrims' ? (
                    <ScrimsTab
                        scrims={scrims}
                        members={members}
                        showForm={showScrimForm} setShowForm={setShowScrimForm}
                        form={scrimForm} setForm={setScrimForm}
                        handleSave={handleSaveScrim}
                        handleDelete={handleDeleteScrim}
                        saving={saving}
                    />
                ) : activeTab === 'settings' ? (
                    <SettingsTab adminToken={adminToken} adminSendNotification={adminSendNotification} />
                ) : managingTourney ? (
                    <GroupingView tourney={managingTourney} setManaging={setManagingTourney} adminToken={adminToken} fetchData={fetchData} />
                ) : managingPoints ? (
                    <PointsTableView tourney={managingPoints} setManaging={setManagingPoints} adminToken={adminToken} fetchData={fetchData} adminManageTournament={adminManageTournament} />
                ) : managingKills ? (
                    <TournamentKillsView tourney={managingKills} setManaging={setManagingKills} adminToken={adminToken} fetchData={fetchData} adminManageTournament={adminManageTournament} />
                ) : editingMatch ? (
                    <MatchScorecard tourney={editingMatch.tourney} matchIndex={editingMatch.index} setEditing={setEditingMatch} adminToken={adminToken} fetchData={fetchData} />
                ) : (
                    <TournamentsTab
                        tournaments={tournaments}
                        showForm={showTourneyForm} setShowForm={setShowTourneyForm}
                        isEditing={isEditingTourney} setIsEditing={setIsEditingTourney}
                        form={tourneyForm} setForm={setTourneyForm}
                        handleSave={handleAddOrUpdateTournament}
                        handleDelete={handleDeleteTournament}
                        handleStart={handleStartTournament}
                        setManaging={setManagingTourney}
                        setMatchEditing={(tourney, index) => setEditingMatch({ tourney, index })}
                        handleFinalize={handleFinalize}
                        saving={saving}
                        setSaving={setSaving}
                        adminToken={adminToken}
                        fetchData={fetchData}
                        adminManageTournament={adminManageTournament}
                        setConfirmDialog={setConfirmDialog}
                        setManagingPoints={setManagingPoints}
                        setManagingKills={setManagingKills}
                    />
                )}
            </AnimatePresence>

            {/* Premium Confirm Modal */}
            <AnimatePresence>
                {confirmDialog.show && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="glass-card" style={{ width: '100%', maxWidth: '360px', padding: '32px', textAlign: 'center', border: '1px solid rgba(192, 57, 43, 0.3)' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(192, 57, 43, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.5rem', border: '2px solid rgba(192, 57, 43, 0.2)' }}>!</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '12px', letterSpacing: '0.05em' }}>{confirmDialog.title}</h3>
                            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '28px', lineHeight: 1.5 }}>{confirmDialog.message}</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn-ghost" style={{ flex: 1, padding: '12px' }} onClick={() => setConfirmDialog({ ...confirmDialog, show: false })}>CANCEL</button>
                                <button className="btn-primary" style={{ flex: 1, padding: '12px' }} onClick={() => { confirmDialog.onConfirm(); setConfirmDialog({ ...confirmDialog, show: false }) }}>CONFIRM</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sync Report Modal */}
            <AnimatePresence>
                {syncReport && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setSyncReport(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '28px', maxHeight: '80vh', overflowY: 'auto' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', color: 'var(--accent)' }}>SYNC REPORT</h3>

                            {syncReport.winners?.length > 0 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ffeb3b', marginBottom: '12px' }}>🏆 TOURNAMENT WINNERS (+1 WIN)</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {syncReport.winners.map((name, i) => (
                                            <span key={i} style={{ fontSize: '0.65rem', padding: '4px 8px', background: 'rgba(255, 235, 59, 0.1)', color: '#ffeb3b', borderRadius: '4px', border: '1px solid rgba(255, 235, 59, 0.2)' }}>{name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {syncReport.runners?.length > 0 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 900, color: '#3498db', marginBottom: '12px' }}>🥈 RUNNER UPS (+1 RUNNER-UP)</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {syncReport.runners.map((name, i) => (
                                            <span key={i} style={{ fontSize: '0.65rem', padding: '4px 8px', background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', borderRadius: '4px', border: '1px solid rgba(52, 152, 219, 0.2)' }}>{name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {syncReport.success.length > 0 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 900, color: '#2ecc71', marginBottom: '12px' }}>PER MATCH STATS SYNCED ({syncReport.success.length})</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {syncReport.success.map((s, i) => (
                                            <div key={i} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.75rem', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                                                <span>{s.name}</span>
                                                <span style={{ fontWeight: 800 }}>+{s.kills} KILLS</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {syncReport.failed.length > 0 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 900, color: '#e74c3c', marginBottom: '12px' }}>FAILED SYNC ({syncReport.failed.length})</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {syncReport.failed.map((s, i) => (
                                            <div key={i} style={{ fontSize: '0.75rem', padding: '8px', background: 'rgba(231, 76, 60, 0.05)', borderRadius: '6px', border: '1px solid rgba(231, 76, 60, 0.1)' }}>
                                                <p style={{ fontWeight: 700 }}>{s.name}</p>
                                                <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>UID: {s.uid}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setSyncReport(null)}>CLOSE REPORT</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function PlayersTab({ members, editingStatsId, setEditingStatsId, statsForm, setStatsForm, handleUpdateStats, handleDeleteMember, saving, handleUpdateRole, adminToken }) {
    const [editCategory, setEditCategory] = useState('tourney') // 'tourney' or 'scrim'
    const [uidEditing, setUidEditing] = useState(null) // member._id
    const [uidValue, setUidValue] = useState('')
    const [uidSaving, setUidSaving] = useState(false)

    async function handleSaveUuid(memberId) {
        if (!uidValue.trim()) return toast.error('UUID cannot be empty')
        setUidSaving(true)
        try {
            await adminUpdateMemberUuid(memberId, uidValue.trim(), adminToken)
            toast.success('UUID saved! Member can now login with this secret UUID.')
            setUidEditing(null)
            setUidValue('')
        } catch {
            toast.error('Failed to save UUID')
        } finally {
            setUidSaving(false)
        }
    }

    return (
        <motion.div key="players" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {members.map(m => (
                    <div key={m._id} className="glass-card" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: editingStatsId === m._id ? '16px' : '0' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.name}</p>
                                    {editingStatsId === m._id ? (
                                        <select
                                            value={m.role || 'Player'}
                                            onChange={e => handleUpdateRole(m._id, e.target.value)}
                                            className="glass-input"
                                            style={{ padding: '2px 6px', fontSize: '0.65rem', height: 'auto', background: 'rgba(255,255,255,0.1)', cursor: 'pointer' }}
                                            disabled={saving}
                                        >
                                            <option value="Player" style={{ color: 'black' }}>Player</option>
                                            <option value="Recruit" style={{ color: 'black' }}>Recruit</option>
                                            <option value="Leader" style={{ color: 'black' }}>Leader</option>
                                            <option value="Co-Leader" style={{ color: 'black' }}>Co-Leader</option>
                                        </select>
                                    ) : (
                                        <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', fontWeight: 600 }}>{m.role || 'Player'}</span>
                                    )}
                                </div>
                                {/* UID row */}
                                {uidEditing === m._id ? (
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                        <input
                                            className="glass-input"
                                            placeholder="Enter secret UUID..."
                                            value={uidValue}
                                            onChange={e => setUidValue(e.target.value)}
                                            style={{ fontSize: '0.75rem', padding: '6px 10px', flex: 1 }}
                                            autoFocus
                                        />
                                        <button className="btn-primary" style={{ fontSize: '0.65rem', padding: '6px 12px' }} disabled={uidSaving} onClick={() => handleSaveUuid(m._id)}>{uidSaving ? '...' : 'SAVE'}</button>
                                        <button className="btn-ghost" style={{ fontSize: '0.65rem', padding: '6px 10px' }} onClick={() => { setUidEditing(null); setUidValue('') }}>✕</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                        <p style={{ opacity: 0.3, fontSize: '0.65rem' }}>UID: {m.uid || '—'}</p>
                                        <button onClick={() => { setUidEditing(m._id); setUidValue('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.6rem', color: 'var(--accent)', opacity: 0.6, padding: 0 }}>SET UUID</button>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {editingStatsId !== m._id && (
                                    <>
                                        <button className="btn-ghost" style={{ fontSize: '0.65rem', padding: '6px 12px' }} onClick={() => {
                                            setEditingStatsId(m._id)
                                            const s = m.stats?.[editCategory] || {}
                                            setStatsForm({ kills: s.kills || 0, matches: s.matches || 0, wins: s.wins || 0, runnerUps: s.runnerUps || 0, kd: s.kd || '0.0', ace: s.ace || 0, prevKills: s.prevKills || 0, prevWins: s.prevWins || 0, prevRunnerUps: s.prevRunnerUps || 0 })
                                        }}>EDIT STATS</button>
                                        <button onClick={() => handleDeleteMember(m._id, m.name)} style={{ padding: '8px', background: 'rgba(231, 76, 60, 0.1)', border: 'none', color: '#e74c3c', borderRadius: '8px', cursor: 'pointer' }}>✕</button>
                                    </>
                                )}
                            </div>
                        </div>
                        {editingStatsId === m._id && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px' }}>
                                    {['tourney', 'scrim'].map(cat => (
                                        <button key={cat} onClick={() => {
                                            setEditCategory(cat)
                                            const s = m.stats?.[cat] || {}
                                            setStatsForm({ kills: s.kills || 0, matches: s.matches || 0, wins: s.wins || 0, runnerUps: s.runnerUps || 0, kd: s.kd || '0.0', ace: s.ace || 0, prevKills: s.prevKills || 0, prevWins: s.prevWins || 0, prevRunnerUps: s.prevRunnerUps || 0 })
                                        }} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', background: editCategory === cat ? 'rgba(192,57,43,0.3)' : 'transparent', color: editCategory === cat ? 'var(--accent)' : 'rgba(255,255,255,0.4)' }}>{cat.toUpperCase()}</button>
                                    ))}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                    <StatInput label="Kills" val={statsForm.kills} set={v => setStatsForm({ ...statsForm, kills: v })} />
                                    <StatInput label="Matches" val={statsForm.matches} set={v => setStatsForm({ ...statsForm, matches: v })} />
                                    <StatInput label="Aces" val={statsForm.ace} set={v => setStatsForm({ ...statsForm, ace: v })} />
                                    <StatInput label="Wins" val={statsForm.wins} set={v => setStatsForm({ ...statsForm, wins: v })} />
                                    <StatInput label="Runner Ups" val={statsForm.runnerUps} set={v => setStatsForm({ ...statsForm, runnerUps: v })} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn-primary" style={{ flex: 1 }} disabled={saving} onClick={() => handleUpdateStats(m._id, editCategory)}>SAVE {editCategory.toUpperCase()}</button>
                                    <button className="btn-ghost" onClick={() => setEditingStatsId(null)}>CANCEL</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    )
}



function GroupingView({ tourney, setManaging, adminToken, fetchData }) {
    const [tempGroups, setTempGroups] = useState(tourney.groups || [])
    const [hasChanges, setHasChanges] = useState(false)
    const [saving, setSaving] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')

    const onDragEndLocal = (result) => {
        if (!result.destination) return

        const { source, destination } = result
        const newGroups = [...tempGroups].map(g => ({ ...g, players: [...g.players] }))
        let movedPlayer = null

        // Remove from source
        if (source.droppableId === 'unassigned') {
            movedPlayer = tourney.participants[source.index]
        } else {
            const groupIdx = parseInt(source.droppableId)
            movedPlayer = newGroups[groupIdx].players.splice(source.index, 1)[0]
        }

        // Add to destination
        if (destination.droppableId === 'unassigned') {
            // Already removed above
        } else {
            const groupIdx = parseInt(destination.droppableId)
            // Prevent duplicate in same group
            if (!newGroups[groupIdx].players.find(p => p.uid === movedPlayer.uid)) {
                newGroups[groupIdx].players.push(movedPlayer)
            }
        }

        setTempGroups(newGroups)
        setHasChanges(true)
    }

    async function handleSaveGroups() {
        setSaving(true)
        try {
            await adminManageTournament('update', {
                id: tourney._id,
                groups: tempGroups
            }, adminToken)
            setHasChanges(false)
            toast.success('Squad arrangement saved!')

            // Refresh data and predictions
            const [mems, tours] = await Promise.all([
                adminGetMembers(adminToken),
                getTournaments()
            ]);
            setMembers(mems);
            setTournaments(tours);
            triggerPredictionRefresh(mems, tours);

        } catch {
            toast.error('Failed to save arrangement.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <motion.div key="manage" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn-ghost" onClick={() => setManaging(null)}>Back</button>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Squad Management: {tourney.title}</h3>
                </div>
                {hasChanges && (
                    <button className="btn-primary" onClick={handleSaveGroups} disabled={saving} style={{ background: '#2ecc71', fontSize: '0.7rem', padding: '8px 16px' }}>
                        {saving ? 'SAVING...' : 'SAVE SQUAD CHANGES'}
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <input
                    className="glass-input"
                    placeholder="Enter Team Name (e.g. ABEYANS)"
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    style={{ flex: 1 }}
                />
                <button
                    className="btn-primary"
                    disabled={!newGroupName.trim() || saving}
                    style={{ padding: '12px 20px', fontSize: '0.75rem', opacity: newGroupName.trim() ? 1 : 0.5 }}
                    onClick={() => {
                        const updatedGroups = [...tempGroups, { name: newGroupName.trim(), players: [] }]
                        setTempGroups(updatedGroups)
                        setHasChanges(true)
                        setNewGroupName('')
                    }}
                >
                    + ADD TEAM
                </button>
            </div>

            <DragDropContext onDragEnd={onDragEndLocal}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    {/* Unassigned Pool */}
                    <Droppable droppableId="unassigned">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <p style={{ fontSize: '0.6rem', opacity: 0.3, textTransform: 'uppercase', marginBottom: '12px', fontWeight: 800 }}>Registration Pool ({tourney.participants?.length || 0})</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {tourney.participants?.map((p, idx) => (
                                        <Draggable key={`${p.uid}-${idx}`} draggableId={`pool-${p.uid}`} index={idx}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="glass-card" style={{ padding: '8px 12px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', ...provided.draggableProps.style }}>
                                                    {p.name}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>

                    {/* Groups */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                        {tempGroups.map((group, gIdx) => (
                            <Droppable key={gIdx} droppableId={gIdx.toString()}>
                                {(provided, snapshot) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="glass-card" style={{
                                        padding: '16px', minHeight: '140px',
                                        border: snapshot.isDraggingOver ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)',
                                        background: snapshot.isDraggingOver ? 'rgba(192, 57, 43, 0.1)' : 'rgba(255,255,255,0.02)',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffeb3b' }}>{group.name}</p>
                                            <button className="btn-ghost" style={{ fontSize: '0.6rem', padding: '2px 6px' }} onClick={() => {
                                                if (!confirm('Remove this team?')) return
                                                const newGroups = tempGroups.filter((_, i) => i !== gIdx)
                                                setTempGroups(newGroups)
                                                setHasChanges(true)
                                            }}>✕</button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {group.players?.map((p, pIdx) => (
                                                <Draggable key={`${p.uid}-${gIdx}`} draggableId={`group-${gIdx}-${p.uid}`} index={pIdx}>
                                                    {(provided) => (
                                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{
                                                            padding: '8px 12px', background: 'rgba(255,255,255,0.04)',
                                                            borderRadius: '8px', fontSize: '0.75rem',
                                                            display: 'flex', justifyContent: 'space-between',
                                                            ...provided.draggableProps.style
                                                        }}>
                                                            <span>{p.name}</span>
                                                            <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>{p.uid}</span>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </div>
            </DragDropContext>
        </motion.div>
    )
}

function MatchScorecard({ tourney, matchIndex, setEditing, adminToken, fetchData }) {
    const isNew = matchIndex === -1
    const match = isNew ? {
        winnerTeamIdx: -1,
        stats: [],
        isLocked: false,
        date: new Date().toLocaleDateString()
    } : tourney.matches[matchIndex]

    // Stats is a flat list of player stats for this match: { uid, kills, ace }
    const [stats, setStats] = useState(match.stats || [])
    const [winnerIdx, setWinnerIdx] = useState(match.winnerTeamIdx)
    const [saving, setSaving] = useState(false)

    // For >2 teams, we allow selecting which two teams are playing
    const hasManyTeams = tourney.groups?.length > 2
    // If we're editing an existing match with stats, figure out which teams are involved based on player stats
    const getInvolvedTeams = () => {
        if (!hasManyTeams) return [0, 1]

        if (!isNew && match.stats?.length > 0) {
            const uids = new Set(match.stats.map(s => s.uid))
            const involved = []
            tourney.groups.forEach((g, idx) => {
                if (g.players.some(p => uids.has(p.uid))) {
                    involved.push(idx)
                }
            })
            // If we found the 2 teams, return them, else defaults
            if (involved.length >= 2) return [involved[0], involved[1]]
            if (involved.length === 1) return [involved[0], involved[0] === 0 ? 1 : 0]
        }
        return [0, 1] // Default to first two
    }

    const [teamAIdx, setTeamAIdx] = useState(getInvolvedTeams()[0])
    const [teamBIdx, setTeamBIdx] = useState(getInvolvedTeams()[1])

    const groupsToShow = hasManyTeams
        ? [{ ...tourney.groups[teamAIdx], _originalIdx: teamAIdx }, { ...tourney.groups[teamBIdx], _originalIdx: teamBIdx }]
        : tourney.groups?.map((g, idx) => ({ ...g, _originalIdx: idx })) || []

    // Helper to find/update stats
    const updatePlayerStat = (uid, field, val) => {
        const existing = stats.find(s => s.uid === uid)
        if (existing) {
            setStats(stats.map(s => s.uid === uid ? { ...s, [field]: val } : s))
        } else {
            setStats([...stats, { uid, [field]: val }])
        }
    }

    async function handleAction(lock = false) {
        if (lock && !confirm('LOCK IN? No more changes allowed.')) return
        setSaving(true)
        try {
            const matchData = {
                winnerTeamIdx: winnerIdx,
                stats,
                isLocked: lock,
                date: match.date
            }
            const idx = isNew ? (tourney.matches?.length || 0) : matchIndex

            // We need to pass the full tournament so the backend can recalculate points table
            // Or just use the existing update logic because we update the tournament object. 
            // The `updateMatch` endpoint handles adding to match array. We also need it to 
            // update pointsTable, which we can either do on backend or frontend. Let's send a flag
            // to the backend to let it know it should auto-calculate if needed, or we just calculate here
            // and send the whole `pointsTable` under the `update` action if it's easier.
            // Since we are using updateMatch, let's keep it simple and update points table here, then send full update.

            let updatedPointsTable = tourney.pointsTable ? [...tourney.pointsTable] : []
            if (hasManyTeams && lock && winnerIdx !== -1) {
                // Initialize if empty
                if (updatedPointsTable.length === 0) {
                    updatedPointsTable = tourney.groups.map((g, i) => ({
                        teamIdx: i, teamName: g.name, matches: 0, wins: 0, pts: 0
                    }))
                }

                // Increment Matches
                [teamAIdx, teamBIdx].forEach(tIdx => {
                    const pt = updatedPointsTable.find(p => p.teamIdx === tIdx)
                    if (pt) pt.matches += 1
                })

                // Increment Wins
                const winPt = updatedPointsTable.find(p => p.teamIdx === winnerIdx)
                if (winPt) winPt.wins += 1

                // Calculate Placement -> Winner gets flat +2 per win as requested "jeeti to only 2 point bade". Kills points separated from team points to fix team win logic.
                if (winPt) winPt.pts += 2
            }



            // If we modified points table and locking, we update whole tournament
            if (lock && hasManyTeams) {
                const newMatches = [...(tourney.matches || [])]
                if (isNew) newMatches.push(matchData)
                else newMatches[matchIndex] = matchData

                await adminManageTournament('update', {
                    id: tourney._id,
                    matches: newMatches,
                    pointsTable: updatedPointsTable
                }, adminToken)
            } else {
                await adminManageTournament('updateMatch', {
                    id: tourney._id,
                    matchIndex: idx,
                    matchData
                }, adminToken)
            }

            toast.success(lock ? 'Match Finalized!' : 'Match Saved!')
            setEditing(null)
            fetchData()
        } catch {
            toast.error('Failed to save match.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <motion.div key="match" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{isNew ? 'New Match Scorecard' : `Match ${matchIndex + 1} Stats`}</h3>
            </div>

            {hasManyTeams && !match.isLocked && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px' }}>
                    <div>
                        <label style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>TEAM A</label>
                        <select className="glass-input" value={teamAIdx} onChange={e => setTeamAIdx(parseInt(e.target.value))}>
                            {tourney.groups.map((g, i) => (
                                <option key={i} value={i} disabled={i === teamBIdx}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.5, marginTop: '20px' }}>VS</span>
                    <div>
                        <label style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>TEAM B</label>
                        <select className="glass-input" value={teamBIdx} onChange={e => setTeamBIdx(parseInt(e.target.value))}>
                            {tourney.groups.map((g, i) => (
                                <option key={i} value={i} disabled={i === teamAIdx}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <motion.div
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
                }}
                key={`${teamAIdx}-${teamBIdx}`} // Forces re-animation when selection changes
            >
                {groupsToShow.map((group, uiIdx) => {
                    const gIdx = group._originalIdx
                    return (
                        <motion.div
                            key={gIdx}
                            className="glass-card"
                            variants={{
                                hidden: { opacity: 0, x: -20 },
                                visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                            }}
                            style={{ padding: '20px', border: winnerIdx === gIdx ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: winnerIdx === gIdx ? 'var(--accent)' : 'white' }}>{group.name}</h4>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={winnerIdx === gIdx} onChange={() => setWinnerIdx(winnerIdx === gIdx ? -1 : gIdx)} disabled={match.isLocked} />
                                    MATCH WINNER
                                </label>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {group.players?.map(p => {
                                    const pStat = stats.find(s => s.uid === p.uid) || { kills: 0, ace: false }
                                    return (
                                        <div key={p.uid} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 50px', alignItems: 'center', gap: '12px' }}>
                                            <p style={{ fontSize: '0.8rem' }}>{p.name}</p>
                                            <input type="number" className="glass-input" style={{ padding: '4px 8px', fontSize: '0.75rem' }} value={pStat.kills} onChange={e => updatePlayerStat(p.uid, 'kills', parseInt(e.target.value) || 0)} disabled={match.isLocked} />
                                            <label style={{ fontSize: '0.55rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                <input type="checkbox" checked={pStat.ace} onChange={e => updatePlayerStat(p.uid, 'ace', e.target.checked)} disabled={match.isLocked} />
                                                ACE
                                            </label>
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>

            {!match.isLocked && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                    <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleAction(false)} disabled={saving}>SAVE PROGRESS</button>
                    <button className="btn-primary" style={{ flex: 1, background: '#e74c3c' }} onClick={() => handleAction(true)} disabled={saving}>LOCK IN RESULTS</button>
                </div>
            )}
        </motion.div>
    )
}

function TournamentsTab({ tournaments, showForm, setShowForm, isEditing, setIsEditing, form, setForm, handleSave, handleDelete, handleStart, handleFinalize, setManaging, setMatchEditing, saving, setSaving, adminToken, fetchData, adminManageTournament, setConfirmDialog, setManagingPoints, setManagingKills }) {
    const [showAdvance, setShowAdvance] = useState(false)

    return (
        <motion.div key="tournaments" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button className="btn-primary" style={{ width: '100%', marginBottom: '20px' }} onClick={() => { setIsEditing(false); setShowForm(!showForm) }}>{showForm ? 'CANCEL' : '+ ADD TOURNAMENT'}</button>

            {showForm && (
                <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', border: '1px solid var(--accent)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>TOURNAMENT TITLE</label>
                            <input className="glass-input" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>DATE / SEASON</label>
                                <input className="glass-input" placeholder="e.g. 28 Feb" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>ENTRY FEE (INR / FREE)</label>
                                <input className="glass-input" placeholder="e.g. 100" value={form.entryFee} onChange={e => setForm({ ...form, entryFee: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>FORMAT</label>
                                <select className="glass-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value, teamSize: e.target.value === 'Solo' ? 1 : e.target.value === 'Duo' ? 2 : 4 })}>
                                    <option value="Solo">Solo (1)</option>
                                    <option value="Duo">Duo (2)</option>
                                    <option value="Squad">Squad (4)</option>
                                    <option value="Custom">Custom</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>SECTION</label>
                                <select className="glass-input" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="running">Running</option>
                                    <option value="past">Past</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="btn-ghost"
                            style={{ fontSize: '0.7rem', padding: '10px', background: 'rgba(255,255,255,0.02)' }}
                            onClick={() => setShowAdvance(!showAdvance)}
                        >
                            {showAdvance ? '↑ HIDE ADVANCE CONFIG' : '↓ SHOW ADVANCE CONFIG (PRIZES, POINTS)'}
                        </button>

                        <AnimatePresence>
                            {showAdvance && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}
                                >
                                    <p style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent)' }}>PRIZE POOL BREAKDOWN (INR)</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <input className="glass-input" placeholder="1st Place" value={form.prizes?.winner || ''} onChange={e => setForm({ ...form, prizes: { ...form.prizes, winner: e.target.value } })} />
                                        <input className="glass-input" placeholder="2nd Place" value={form.prizes?.runner || ''} onChange={e => setForm({ ...form, prizes: { ...form.prizes, runner: e.target.value } })} />
                                        <input className="glass-input" placeholder="3rd Place" value={form.prizes?.third || ''} onChange={e => setForm({ ...form, prizes: { ...form.prizes, third: e.target.value } })} />
                                        <input className="glass-input" placeholder="Top Fragger" value={form.prizes?.mvp || ''} onChange={e => setForm({ ...form, prizes: { ...form.prizes, mvp: e.target.value } })} />
                                    </div>

                                    <p style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent)', marginTop: '8px' }}>POINT SYSTEM & SLOTS</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <input type="number" className="glass-input" placeholder="Points per Kill" value={form.pointsPerKill || 1} onChange={e => setForm({ ...form, pointsPerKill: parseInt(e.target.value) || 0 })} />
                                        <input type="number" className="glass-input" placeholder="Max Slots" value={form.maxSlots || 24} onChange={e => setForm({ ...form, maxSlots: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <input className="glass-input" placeholder="Placement Points (e.g. 12,9,8,7...)" value={form.placementPoints || ''} onChange={e => setForm({ ...form, placementPoints: e.target.value })} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <textarea className="glass-input" placeholder="Description/Rules" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'none' }} />
                        <button className="btn-primary" style={{ padding: '16px' }} onClick={handleSave}>{saving ? 'Saving...' : (isEditing ? 'UPDATE TOURNAMENT' : 'CREATE TOURNAMENT')}</button>
                    </div>
                </div>
            )}

            {['upcoming', 'running', 'past'].map(sec => (
                <div key={sec} style={{ marginBottom: '32px' }}>
                    <p style={{ fontSize: '0.65rem', opacity: 0.3, letterSpacing: '0.12em', marginBottom: '12px', textTransform: 'uppercase', fontWeight: 800 }}>{sec} events</p>
                    {tournaments[sec]?.map(t => (
                        <div key={t._id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div onClick={() => {
                                    setIsEditing(true);
                                    setShowForm(true);
                                    setForm({
                                        ...t,
                                        prizes: t.prizes || { winner: '', runner: '', mvp: '', third: '' },
                                        pointsPerKill: t.pointsPerKill || 1,
                                        maxSlots: t.maxSlots || 24,
                                        placementPoints: t.placementPoints || ''
                                    })
                                }} style={{ cursor: 'pointer' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>{t.title}</h4>
                                    <p style={{ fontSize: '0.7rem', opacity: 0.4 }}>{t.date} • {t.participants?.length || 0} Registered</p>
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => handleDelete(t._id, t.title)} style={{ padding: '8px', background: 'rgba(231, 76, 60, 0.1)', border: 'none', color: '#e74c3c', borderRadius: '8px', cursor: 'pointer' }}>✕</button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {sec === 'upcoming' && (
                                    <>
                                        <button className="btn-primary" style={{ fontSize: '0.7rem', padding: '8px 16px' }} onClick={() => handleStart(t)}>START LIVE</button>
                                        <button className="btn-ghost" style={{ fontSize: '0.7rem', padding: '8px 16px' }} onClick={() => setManaging(t)}>Manage Teams</button>
                                    </>
                                )}
                                {sec === 'running' && (
                                    <>
                                        <button className="btn-primary" style={{ fontSize: '0.7rem', padding: '8px 16px' }} onClick={() => setMatchEditing(t, -1)}>+ Add Match Result</button>
                                        <button className="btn-primary" style={{ fontSize: '0.7rem', padding: '8px 16px', background: '#27ae60' }} onClick={() => handleFinalize(t)}>FINAL FINALIZE & SYNC</button>
                                        {t.groups?.length > 2 && (
                                            <button className="btn-ghost" style={{ fontSize: '0.7rem', padding: '8px 16px', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => setManagingPoints?.(t)}>Manage Points Table</button>
                                        )}
                                        <button className="btn-ghost" style={{ fontSize: '0.7rem', padding: '8px 16px', border: '1px solid rgba(192,57,43,0.3)', color: 'var(--accent)' }} onClick={() => setManagingKills?.(t)}>Manage Kills Override</button>
                                        <div style={{ display: 'flex', gap: '4px', width: '100%', marginTop: '8px' }}>
                                            {t.matches?.map((m, idx) => (
                                                <button key={idx} className="btn-ghost" style={{ fontSize: '0.65rem', flex: 1, padding: '6px' }} onClick={() => setMatchEditing(t, idx)}>
                                                    M{idx + 1} {m.isLocked ? '🔒' : '📝'}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {sec === 'past' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <button className="btn-ghost" style={{ fontSize: '0.7rem', padding: '8px 16px' }}>View Results</button>
                                        <span style={{ fontSize: '0.6rem', color: '#2ecc71', fontWeight: 900, background: 'rgba(46, 204, 113, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>SYNCED ✓</span>
                                    </div>
                                )}
                            </div>

                            {/* Pending Approvals Section */}
                            {t.pendingUnits && t.pendingUnits.length > 0 && (
                                <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255, 193, 7, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 193, 7, 0.1)' }}>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ffc107', marginBottom: '12px', letterSpacing: '0.05em' }}>PENDING APPROVALS ({t.pendingUnits.length})</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {t.pendingUnits.map((p, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>{p.name}</p>
                                                    <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>UID: {p.uid}</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => {
                                                            setConfirmDialog({
                                                                show: true,
                                                                title: 'APPROVE PLAYER?',
                                                                message: `Allow ${p.name} to join the tournament roster?`,
                                                                onConfirm: async () => {
                                                                    try {
                                                                        await adminManageTournament('approveMember', { id: t._id, participant: p }, adminToken)
                                                                        toast.success('Player Approved!')
                                                                        fetchData()
                                                                    } catch { toast.error('Failed to approve') }
                                                                }
                                                            })
                                                        }}
                                                        style={{ padding: '6px 12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
                                                    >APPROVE</button>
                                                    <button
                                                        onClick={() => {
                                                            setConfirmDialog({
                                                                show: true,
                                                                title: 'REJECT PLAYER?',
                                                                message: `Remove ${p.name}'s application?`,
                                                                onConfirm: async () => {
                                                                    try {
                                                                        await adminManageTournament('rejectMember', { id: t._id, uid: p.uid }, adminToken)
                                                                        toast.success('Player Rejected')
                                                                        fetchData()
                                                                    } catch { toast.error('Failed to reject') }
                                                                }
                                                            })
                                                        }}
                                                        style={{ padding: '6px 12px', background: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.3)', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
                                                    >REJECT</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ))}
            <div style={{ marginTop: '32px', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '0.65rem', opacity: 0.4, marginBottom: '12px', textAlign: 'center' }}>DATABASE MAINTENANCE</p>
                <button 
                    className="btn-ghost" 
                    style={{ width: '100%', color: 'var(--accent)', borderColor: 'rgba(192,57,43,0.3)', fontSize: '0.75rem' }}
                    onClick={async () => {
                        if (!confirm('This will recalculate EVERY player\'s wins/runner-ups from all past synced tournaments. Continue?')) return;
                        setSaving(true);
                        try {
                            const res = await adminManageTournament('rebuildStats', {}, adminToken);
                            toast.success(`Success! Recalculated stats for ${res.count} players.`);
                            fetchData();
                        } catch {
                            toast.error('Rebuild failed.');
                        } finally {
                            setSaving(false);
                        }
                    }}
                    disabled={saving}
                >
                    {saving ? 'REBUILDING...' : 'REBUILD ALL PLAYER WINS FROM HISTORY'}
                </button>
            </div>
        </motion.div>
    )
}

function ScrimsTab({ scrims, members, showForm, setShowForm, form, setForm, handleSave, handleDelete, saving }) {
    const addPlayer = () => {
        setForm({ ...form, players: [...form.players, { uid: '', name: '', kills: 0, aces: 0 }] })
    }

    const removePlayer = (idx) => {
        setForm({ ...form, players: form.players.filter((_, i) => i !== idx) })
    }

    const updatePlayer = (idx, field, val) => {
        const newPlayers = [...form.players]
        newPlayers[idx] = { ...newPlayers[idx], [field]: val }
        setForm({ ...form, players: newPlayers })
    }

    const handlePlayerSelect = (idx, val) => {
        if (val === 'CUSTOM') {
            updatePlayer(idx, 'name', '')
            updatePlayer(idx, 'uid', `CUSTOM_${Date.now()}_${idx}`)
        } else {
            const mem = members.find(m => m.name === val)
            if (mem) {
                const newPlayers = [...form.players]
                newPlayers[idx] = { ...newPlayers[idx], name: mem.name, uid: mem.uid }
                setForm({ ...form, players: newPlayers })
            }
        }
    }

    return (
        <motion.div key="scrims" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button className="btn-primary" style={{ width: '100%', marginBottom: '20px' }} onClick={() => setShowForm(!showForm)}>{showForm ? 'CANCEL' : '+ RECORD INTL MATCH'}</button>

            {showForm && (
                <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', border: '1px solid var(--accent)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>TITLE</label>
                                <input className="glass-input" placeholder="e.g. Guild War V1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>OPPONENT</label>
                                <input className="glass-input" placeholder="Opponent Guild" value={form.opponent} onChange={e => setForm({ ...form, opponent: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 800 }}>PLAYERS & STATS</p>
                                <button className="btn-ghost" style={{ fontSize: '0.65rem' }} onClick={addPlayer}>+ Add Slot</button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {form.players.map((p, idx) => (
                                    <div key={idx} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <select
                                                className="glass-input"
                                                style={{ flex: 1, fontSize: '0.75rem' }}
                                                value={p.uid.startsWith('CUSTOM_') ? 'CUSTOM' : p.name}
                                                onChange={(e) => handlePlayerSelect(idx, e.target.value)}
                                            >
                                                <option value="" disabled>-- Select Player --</option>
                                                {members.map(m => <option key={m.uid} value={m.name}>{m.name}</option>)}
                                                <option value="CUSTOM">+ CUSTOM PLAYER</option>
                                            </select>
                                            <button className="btn-ghost" onClick={() => removePlayer(idx)}>✕</button>
                                        </div>

                                        {p.uid.startsWith('CUSTOM_') && (
                                            <input
                                                className="glass-input"
                                                placeholder="Custom Name"
                                                value={p.name}
                                                onChange={e => updatePlayer(idx, 'name', e.target.value)}
                                                style={{ marginBottom: '12px', fontSize: '0.75rem' }}
                                            />
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontSize: '0.6rem', opacity: 0.4, display: 'block' }}>KILLS</label>
                                                <input type="number" className="glass-input" value={p.kills} onChange={e => updatePlayer(idx, 'kills', parseInt(e.target.value) || 0)} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.6rem', opacity: 0.4, display: 'block' }}>ACES</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => updatePlayer(idx, 'aces', Math.max(0, p.aces - 1))}>-</button>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{p.aces}</span>
                                                    <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => updatePlayer(idx, 'aces', p.aces + 1)}>+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="btn-primary" style={{ padding: '16px' }} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'SAVE INTERNATIONAL MATCH'}</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {scrims.map(s => (
                    <div key={s._id} className="glass-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{s.title}</h4>
                                <p style={{ fontSize: '0.7rem', opacity: 0.4 }}>vs {s.opponent} • {s.date}</p>
                            </div>
                            <button onClick={() => handleDelete(s._id)} style={{ padding: '8px', background: 'rgba(231, 76, 60, 0.1)', border: 'none', color: '#e74c3c', borderRadius: '8px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                            {s.players?.map((p, pIdx) => (
                                <div key={pIdx} style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.7rem' }}>
                                    <p style={{ fontWeight: 700 }}>{p.name}</p>
                                    <p style={{ opacity: 0.4 }}>{p.kills} Kills • {p.aces} Aces</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

function StatInput({ label, val, set, type = 'number' }) {
    return (
        <div>
            <label style={{ fontSize: '0.6rem', opacity: 0.3, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>{label}</label>
            <input type={type} className="glass-input" value={val} onChange={e => set(type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)} style={{ fontSize: '0.85rem', padding: '8px 10px' }} />
        </div>
    )
}

function PointsTableView({ tourney, setManaging, adminToken, fetchData, adminManageTournament }) {
    // initialize from DB points table or create a default array from groups
    const defaultPointsTable = tourney.groups?.map((g, i) => ({
        teamIdx: i,
        teamName: g.name,
        matches: 0,
        wins: 0,
        pts: 0,
        nrr: '0.000'
    })) || []

    // Merge existing points table into default (in case new teams added)
    const existingTable = tourney.pointsTable || []
    const initialTable = defaultPointsTable.map(def => {
        const found = existingTable.find(t => t.teamIdx === def.teamIdx)
        return found ? { ...def, ...found } : def
    })

    const [table, setTable] = useState(initialTable)
    const [saving, setSaving] = useState(false)

    const updateRow = (idx, field, value) => {
        const newTable = [...table]
        newTable[idx] = { ...newTable[idx], [field]: value }
        setTable(newTable)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await adminManageTournament('update', {
                id: tourney._id,
                pointsTable: table
            }, adminToken)
            toast.success('Points table updated!')
            fetchData()
        } catch {
            toast.error('Failed to update points table.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <motion.div key="points" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn-ghost" onClick={() => setManaging(null)}>Back</button>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Points Table</h3>
                </div>
                <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ background: '#2ecc71', fontSize: '0.7rem', padding: '8px 16px' }}>
                    {saving ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 50px 50px 60px', gap: '8px', padding: '0 12px', fontSize: '0.65rem', opacity: 0.5 }}>
                    <span>TEAM NAME</span>
                    <span style={{ textAlign: 'center' }}>MATCHES</span>
                    <span style={{ textAlign: 'center' }}>WINS</span>
                    <span style={{ textAlign: 'center' }}>POINTS</span>
                    <span style={{ textAlign: 'center' }}>NRR</span>
                </div>

                {table.map((row, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 50px 50px 50px 60px', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{row.teamName}</span>
                        <input
                            type="number"
                            className="glass-input"
                            style={{ padding: '6px', textAlign: 'center', fontSize: '0.8rem' }}
                            value={row.matches}
                            onChange={(e) => updateRow(idx, 'matches', parseInt(e.target.value) || 0)}
                        />
                        <input
                            type="number"
                            className="glass-input"
                            style={{ padding: '6px', textAlign: 'center', fontSize: '0.8rem' }}
                            value={row.wins}
                            onChange={(e) => updateRow(idx, 'wins', parseInt(e.target.value) || 0)}
                        />
                        <input
                            type="number"
                            className="glass-input"
                            style={{ padding: '6px', textAlign: 'center', fontSize: '0.8rem' }}
                            value={row.pts}
                            onChange={(e) => updateRow(idx, 'pts', parseInt(e.target.value) || 0)}
                        />
                        <input
                            className="glass-input"
                            style={{ padding: '6px', textAlign: 'center', fontSize: '0.8rem', color: '#3498db' }}
                            value={row.nrr}
                            placeholder="0.000"
                            onChange={(e) => updateRow(idx, 'nrr', e.target.value)}
                        />
                    </div>
                ))}
            </div>
            <p style={{ fontSize: '0.65rem', opacity: 0.4, marginTop: '20px', lineHeight: 1.5 }}>
                Note: Updating matches from the Scorecard will automatically update this table. You can use this view to manually override points and placement scores.
            </p>
        </motion.div>
    )
}

function TournamentKillsView({ tourney, setManaging, adminToken, fetchData, adminManageTournament }) {
    // We will store manual overrides natively in tourney.specifictournamentkills
    // This maps player ID to their manual kills count.
    const [overrideMap, setOverrideMap] = useState(tourney.specifictournamentkills || {})
    const [saving, setSaving] = useState(false)

    // Flat list of all registered participants & those in groups
    const participants = tourney.participants || []

    const updateKill = (uid, val) => {
        setOverrideMap({ ...overrideMap, [uid]: val })
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await adminManageTournament('update', {
                id: tourney._id,
                specifictournamentkills: overrideMap
            }, adminToken)
            toast.success('Kills override saved!')
            fetchData()
        } catch {
            toast.error('Failed to save manual kills.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <motion.div key="kills" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn-ghost" onClick={() => setManaging(null)}>Back</button>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Manage Kills Override</h3>
                </div>
                <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ background: '#e74c3c', fontSize: '0.7rem', padding: '8px 16px' }}>
                    {saving ? 'SAVING...' : 'SAVE KILLS'}
                </button>
            </div>

            <p style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '16px' }}>
                Values set here will completely OVERRIDE the automatically calculated match kills for that player in the Top Killers chart. Leave generic values alone if you want automatic calculations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {participants.map((p, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{p.name}</span>
                            <span style={{ fontSize: '0.6rem', opacity: 0.5, marginLeft: '8px' }}>UID: {p.uid}</span>
                        </div>
                        <input
                            type="number"
                            className="glass-input"
                            placeholder="Auto"
                            style={{ padding: '8px', textAlign: 'right', fontSize: '0.9rem', width: '100px', border: overrideMap[p.uid] !== undefined && overrideMap[p.uid] !== '' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)' }}
                            value={overrideMap[p.uid] === undefined ? '' : overrideMap[p.uid]}
                            onChange={(e) => updateKill(p.uid, e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                        />
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

function SettingsTab({ adminToken, adminSendNotification }) {
    const [settings, setSettings] = useState(null)
    const [saving, setSaving] = useState(false)
    const [notifTitle, setNotifTitle] = useState('')
    const [notifBody, setNotifBody] = useState('')
    const [sending, setSending] = useState(false)
    const [notifMode, setNotifMode] = useState('immediate') // 'immediate' | 'scheduled'
    const [scheduleTime, setScheduleTime] = useState('')
    const [scheduledJobs, setScheduledJobs] = useState([]) // { id, title, body, fireAt, label }

    useEffect(() => {
        getSettings().then(setSettings).catch(() => { })
    }, [])

    async function handleSave() {
        setSaving(true)
        try {
            await adminUpdateSettings(settings, adminToken)
            toast.success('Global settings updated!')
        } catch {
            toast.error('Failed to update settings')
        } finally {
            setSaving(false)
        }
    }

    async function fireNotification(title, body) {
        await adminSendNotification(title, body, adminToken)
        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/logo.png' })
        }
    }

    async function handleSendNotification() {
        if (!notifTitle.trim() || !notifBody.trim()) return toast.error('Fill in both title and message')

        if (notifMode === 'immediate') {
            setSending(true)
            try {
                await fireNotification(notifTitle.trim(), notifBody.trim())
                toast.success('Notification sent to all subscribed users!')
                setNotifTitle('')
                setNotifBody('')
            } catch {
                toast.error('Failed to send notification')
            } finally {
                setSending(false)
            }
        } else {
            // Scheduled mode
            if (!scheduleTime) return toast.error('Select a date & time to schedule')
            const fireAt = new Date(scheduleTime).getTime()
            const now = Date.now()
            if (fireAt <= now) return toast.error('Schedule time must be in the future')

            const delayMs = fireAt - now
            const title = notifTitle.trim()
            const body = notifBody.trim()
            const jobId = Date.now().toString()

            const label = new Date(scheduleTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

            // Set up the timer
            const timerId = setTimeout(async () => {
                try {
                    await fireNotification(title, body)
                    toast.success(`Scheduled alert "${title}" fired!`)
                } catch { }
                setScheduledJobs(prev => prev.filter(j => j.id !== jobId))
            }, delayMs)

            setScheduledJobs(prev => [...prev, { id: jobId, timerId, title, body, fireAt, label }])
            toast.success(`Notification scheduled for ${label}`)
            setNotifTitle('')
            setNotifBody('')
            setScheduleTime('')
        }
    }

    function cancelJob(job) {
        clearTimeout(job.timerId)
        setScheduledJobs(prev => prev.filter(j => j.id !== job.id))
        toast('Scheduled notification cancelled.')
    }

    return (
        <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Notification Sender */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '16px', border: '1px solid rgba(46,204,113,0.2)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '4px', color: '#2ecc71' }}>📢 Push Notification</h3>
                <p style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '20px' }}>Send or schedule an alert to all subscribed guild members.</p>

                {/* Mode Toggle */}
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', marginBottom: '16px' }}>
                    {[['immediate', '⚡ Send Now'], ['scheduled', '🗓 Schedule']].map(([mode, label]) => (
                        <button key={mode} onClick={() => setNotifMode(mode)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', background: notifMode === mode ? 'rgba(46,204,113,0.2)' : 'transparent', color: notifMode === mode ? '#2ecc71' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}>{label}</button>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginBottom: '6px', fontWeight: 700 }}>TITLE</label>
                        <input
                            className="glass-input"
                            placeholder="e.g. TOURNAMENT TONIGHT!"
                            value={notifTitle}
                            onChange={e => setNotifTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginBottom: '6px', fontWeight: 700 }}>MESSAGE</label>
                        <textarea
                            className="glass-input"
                            placeholder="e.g. Join lobby at 9PM sharp. Room ID will be shared in WhatsApp."
                            value={notifBody}
                            onChange={e => setNotifBody(e.target.value)}
                            rows={3}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    {notifMode === 'scheduled' && (
                        <div>
                            <label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginBottom: '6px', fontWeight: 700 }}>SEND AT (DATE & TIME)</label>
                            <input
                                type="datetime-local"
                                className="glass-input"
                                value={scheduleTime}
                                onChange={e => setScheduleTime(e.target.value)}
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                    )}

                    <button
                        className="btn-primary"
                        style={{ background: notifMode === 'immediate' ? 'linear-gradient(135deg,#2ecc71,#27ae60)' : 'linear-gradient(135deg,#3498db,#2980b9)', padding: '14px', fontSize: '0.8rem' }}
                        disabled={sending}
                        onClick={handleSendNotification}
                    >
                        {sending ? 'SENDING...' : notifMode === 'immediate' ? '⚡ SEND NOW TO ALL USERS' : '🗓 SCHEDULE ALERT'}
                    </button>
                </div>

                {/* Scheduled Jobs */}
                {scheduledJobs.length > 0 && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '16px' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.6, marginBottom: '10px' }}>PENDING SCHEDULED ALERTS</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {scheduledJobs.map(job => (
                                <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(52,152,219,0.08)', borderRadius: '10px', border: '1px solid rgba(52,152,219,0.2)' }}>
                                    <div>
                                        <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>{job.title}</p>
                                        <p style={{ fontSize: '0.6rem', opacity: 0.5, marginTop: '2px' }}>🗓 {job.label}</p>
                                    </div>
                                    <button onClick={() => cancelJob(job)} style={{ background: 'rgba(231,76,60,0.15)', border: 'none', color: '#e74c3c', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700 }}>CANCEL</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* AI Home Panel Management */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '16px', border: '1px solid rgba(192,57,43,0.3)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '4px', color: 'var(--accent)' }}>🏠 Home Panel (AI Powered)</h3>
                <p style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '20px' }}>Generate and manage the special announcement on Home Page.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                            <input
                                type="checkbox"
                                checked={settings?.homePageAiPanel?.visible || false}
                                onChange={async (e) => {
                                    const hp = settings?.homePageAiPanel || { visible: false, title: '', content: '' }
                                    const newSettings = { ...settings, homePageAiPanel: { ...hp, visible: e.target.checked } }
                                    setSettings(newSettings)
                                    // Auto-save toggle status
                                    try {
                                        await adminUpdateSettings(newSettings, adminToken)
                                        toast.success(e.target.checked ? 'Panel Enabled!' : 'Panel Disabled')
                                    } catch (err) {
                                        toast.error('Failed to save status')
                                    }
                                }}
                            />
                            SHOW PANEL ON HOME PAGE
                        </label>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginBottom: '6px', fontWeight: 700 }}>AI PROMPT / FEATURE LIST</label>
                        <textarea
                            className="glass-input"
                            placeholder="e.g. Sarkar 3.0 launched with new AI prediction, origin seed page, and better stats."
                            value={settings?.homePageAiPanel?.prompt || ''}
                            onChange={e => {
                                const hp = settings?.homePageAiPanel || { visible: false, title: '', content: '' }
                                setSettings({ ...settings, homePageAiPanel: { ...hp, prompt: e.target.value } })
                            }}
                            rows={3}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <button
                        className="btn-ghost"
                        style={{ border: '1px solid rgba(192,57,43,0.3)', color: 'var(--accent)', padding: '12px' }}
                        disabled={saving || !settings?.homePageAiPanel?.prompt}
                        onClick={async () => {
                            setSaving(true)
                            try {
                                const content = await getAIHomePanelContent(settings.homePageAiPanel.prompt)
                                const hp = settings.homePageAiPanel || {}
                                const newSettings = {
                                    ...settings,
                                    homePageAiPanel: {
                                        ...hp,
                                        content,
                                        visible: true,
                                        title: content.split('\n')[0].replace('TITLE:', '').trim()
                                    }
                                }
                                setSettings(newSettings)
                                // Auto-save generated content
                                await adminUpdateSettings(newSettings, adminToken)
                                toast.success('AI Content Generated & Saved!')
                            } catch (err) {
                                toast.error('AI Generation Failed')
                                console.error(err)
                            } finally {
                                setSaving(false)
                            }
                        }}
                    >
                        {saving ? 'GENERATING...' : '🪄 GENERATE & SAVE WITH AI'}
                    </button>

                    <div style={{ marginTop: '10px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '16px', letterSpacing: '0.05em' }}>📝 EDIT / DRAFT PANEL CONTENT</p>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ fontSize: '0.65rem', opacity: 0.5, display: 'block', marginBottom: '6px' }}>PANEL TITLE</label>
                            <input
                                className="glass-input"
                                value={settings?.homePageAiPanel?.title || ''}
                                onChange={e => {
                                    const hp = settings?.homePageAiPanel || { visible: false, title: '', content: '' }
                                    setSettings({ ...settings, homePageAiPanel: { ...hp, title: e.target.value } })
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '0.65rem', opacity: 0.5, display: 'block', marginBottom: '6px' }}>PANEL CONTENT (Markdown not recommended, use Bullets ➤)</label>
                            <textarea
                                className="glass-input"
                                value={settings?.homePageAiPanel?.content || ''}
                                onChange={e => {
                                    const hp = settings?.homePageAiPanel || { visible: false, title: '', content: '' }
                                    setSettings({ ...settings, homePageAiPanel: { ...hp, content: e.target.value } })
                                }}
                                rows={6}
                                style={{ resize: 'vertical', fontSize: '0.85rem' }}
                            />
                        </div>

                        <button
                            className="btn-primary"
                            style={{ padding: '12px', background: 'linear-gradient(135deg, #c0392b, #e74c3c)', fontSize: '0.75rem' }}
                            disabled={saving}
                            onClick={async () => {
                                setSaving(true)
                                try {
                                    await adminUpdateSettings(settings, adminToken)
                                    toast.success('Home Panel Saved & Updated!')
                                } catch (err) {
                                    toast.error('Failed to save changes')
                                } finally {
                                    setSaving(false)
                                }
                            }}
                        >
                            {saving ? 'SAVING...' : '💾 SAVE & PUBLISH CHANGES'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Global Settings */}

            <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '20px' }}>Global App Settings</h3>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.8, display: 'block', marginBottom: '8px' }}>WELCOME POSTER IMAGE URL</label>
                    <input
                        className="glass-input"
                        placeholder="https://example.com/poster.jpg"
                        value={settings?.posterUrl || ''}
                        onChange={e => setSettings({ ...settings, posterUrl: e.target.value })}
                    />
                    <p style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '8px' }}>Paste an image link. To host images, use services like Imgur.</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                        <input
                            type="checkbox"
                            checked={settings?.posterEnabled || false}
                            onChange={e => setSettings({ ...settings, posterEnabled: e.target.checked })}
                        />
                        ENABLE HOME PAGE POPUP POSTER
                    </label>
                </div>

                {settings?.posterUrl && (
                    <div style={{ marginBottom: '24px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <p style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '8px' }}>Preview (Appears as half-screen fit)</p>
                        <img src={settings.posterUrl} alt="Preview" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', background: '#000' }} />
                    </div>
                )}

                <button className="btn-primary" style={{ padding: '16px' }} onClick={handleSave} disabled={saving}>
                    {saving ? 'SAVING...' : 'SAVE SETTINGS'}
                </button>
            </div>
        </motion.div>
    )
}


