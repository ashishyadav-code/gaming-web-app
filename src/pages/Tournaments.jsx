import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { getTournaments, registerForTournament, getMembers } from '../utils/api'

import { useUserAuth } from '../context/UserAuthContext'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

export default function Tournaments() {
    const { user } = useUserAuth()
    const [sections, setSections] = useState({ upcoming: [], running: [], past: [] })
    const [status, setStatus] = useState('loading')
    const [registeringTourney, setRegisteringTourney] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showAllPast, setShowAllPast] = useState(false)
    const [allMembers, setAllMembers] = useState([])

    // Auto-scroll ref
    const modalRef = useRef(null)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [tours, mems] = await Promise.all([
                getTournaments(),
                getMembers()
            ])
            setSections(tours)
            setAllMembers(mems)
            setStatus('success')
        } catch {
            setStatus('error')
        }
    }

    async function handleRegister(e) {
        e.preventDefault()
        if (!user) return toast.error('You must be logged in')
        setLoading(true)
        try {
            const payload = {
                name: user.name,
                uid: user.uid
            }
            const res = await registerForTournament(registeringTourney._id, payload)

            if (res.isPaid) {
                toast.success('Payment submitted! Awaiting Admin Approval.', { duration: 5000 })
            } else {
                toast.success('Successfully Registered!')
            }

            setRegisteringTourney(null)
            loadData()
        } catch {
            toast.error('Failed to register.')
        } finally {
            setLoading(false)
        }
    }

    const openRegister = (t) => {
        setRegisteringTourney(t)
        setTimeout(() => {
            modalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
    }

    if (status === 'loading') return <LoadingState message="Loading events..." />
    if (status === 'error') return <ErrorState />

    return (
        <div style={{ padding: '24px 16px 120px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="text-display" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Tournaments</h2>
            <p style={{ fontSize: '0.75rem', opacity: 0.35, marginBottom: '32px', letterSpacing: '0.05em' }}>OFFICIAL GUILD EVENTS</p>

            {['running', 'upcoming', 'past'].map(key => (
                <div key={key} style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '0.7rem', opacity: 0.3, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 800 }}>{key} tournaments</h3>
                        {key === 'running' && <div className="pulse" style={{ width: '8px', height: '8px', background: '#c0392b', borderRadius: '50%' }} />}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {sections[key]?.length === 0 ? (
                            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', opacity: 0.5, border: '1px dashed rgba(255,255,255,0.05)' }}>
                                <p style={{ fontSize: '0.8rem' }}>No {key} events scheduled.</p>
                            </div>
                        ) : (
                            <>
                                {(key === 'past' && !showAllPast ? sections[key]?.slice(0, 2) : sections[key])?.map(t => (
                                    <TournamentCard
                                        key={t._id}
                                        tourney={t}
                                        onRegister={() => openRegister(t)}
                                        status={key}
                                        user={user}
                                        allMembers={allMembers}
                                    />
                                ))}
                                {key === 'past' && sections[key]?.length > 2 && (
                                    <button
                                        className="btn-ghost"
                                        style={{ fontSize: '0.75rem', padding: '12px', marginTop: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}
                                        onClick={() => setShowAllPast(!showAllPast)}
                                    >
                                        {showAllPast ? 'SHOW LESS EVENTS' : `SHOW ALL PAST EVENTS (${sections[key]?.length})`}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ))}

            <AnimatePresence>
                {registeringTourney && (
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="glass-card"
                        style={{ width: '100%', padding: '32px', border: '1px solid rgba(192, 57, 43, 0.4)', marginTop: '40px', background: 'rgba(192, 57, 43, 0.05)' }}
                    >
                        {loading && (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div className="pulse" style={{ width: '40px', height: '40px', background: 'var(--accent)', borderRadius: '50%', margin: '0 auto 16px' }} />
                                <p style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--accent)' }}>PROCESSING REGISTRATION...</p>
                                <p style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '8px' }}>Please wait, adding you to the roster.</p>
                            </div>
                        )}

                        {!loading && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px' }}>Apply for Tournament</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>{registeringTourney.title}</p>
                                    </div>
                                    <button className="btn-ghost" style={{ padding: '8px' }} onClick={() => setRegisteringTourney(null)}>✕</button>
                                </div>

                                {registeringTourney.entryFee && registeringTourney.entryFee.toLowerCase() !== 'free' ? (
                                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                        <p style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ffeb3b', marginBottom: '16px', letterSpacing: '0.1em' }}>SCAN & PAY TO REGISTER</p>
                                        <div style={{ background: 'white', padding: '12px', borderRadius: '16px', display: 'inline-block', marginBottom: '16px' }}>
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=8006843108@ybl&pn=SARKAR&am=${registeringTourney.entryFee.replace(/[^0-9.]/g, '')}&tn=${registeringTourney.title}-${user?.name}`)}`}
                                                alt="UPI QR"
                                                style={{ width: '180px', height: '180px', display: 'block' }}
                                            />
                                        </div>
                                        <div style={{ background: 'rgba(255, 235, 59, 0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 235, 59, 0.2)' }}>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 900, color: '#ffeb3b' }}>PAYMENT: {registeringTourney.entryFee}</p>
                                            <p style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: '4px' }}>Scan with GPay, PhonePe or Paytm</p>
                                        </div>
                                    </div>
                                ) : null}

                                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <label style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>APPLYING AS</label>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {user?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{user?.name}</p>
                                                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>UID: {user?.uid}</p>
                                            </div>
                                            <div style={{ marginLeft: 'auto' }}>
                                                <span style={{ fontSize: '0.6rem', background: '#2ecc71', color: 'black', padding: '4px 8px', borderRadius: '12px', fontWeight: 800 }}>VERIFIED</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-primary" style={{ padding: '16px', marginTop: '12px' }} disabled={loading}>
                                        {registeringTourney.entryFee && registeringTourney.entryFee.toLowerCase() !== 'free' ? 'I HAVE PAID - SUBMIT' : 'CONFIRM APPLICATION'}
                                    </button>
                                    <button type="button" className="btn-ghost" onClick={() => setRegisteringTourney(null)}>Cancel</button>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function TournamentCard({ tourney, onRegister, status, user, allMembers }) {
    const [expanded, setExpanded] = useState(false)
    const isPast = status === 'past'
    const isRunning = status === 'running'
    const isUpcoming = status === 'upcoming'
    const [showAllMatches, setShowAllMatches] = useState(false)
    const [activeTab, setActiveTab] = useState('results') // 'results' or 'points'

    // AI Prediction is now database-backed and handled by the Admin refresh trigger.
    const prediction = tourney.prediction;
    const predLoading = false;

    const hasApplied = tourney.participants?.some(p => p.uid === user?.uid)

    // Final Winner Logic
    const calculateWinner = () => {
        if (!tourney.matches || tourney.matches.length === 0) return null
        const wins = {}
        tourney.matches.filter(m => m.isLocked).forEach(m => {
            wins[m.winnerTeamIdx] = (wins[m.winnerTeamIdx] || 0) + 1
        })
        const sorted = Object.entries(wins).sort((a, b) => b[1] - a[1])
        if (sorted.length > 0 && sorted[0][1] >= 1) { // Simple logic: most wins
            return tourney.groups[sorted[0][0]]
        }
        return null
    }

    const winner = calculateWinner()

    const getTopKillers = () => {
        const killMap = {}
        const overrides = tourney.specifictournamentkills || {}

        // Auto kills from stats
        if (tourney.matches && tourney.matches.length > 0) {
            tourney.matches.forEach(m => {
                if (m.stats) {
                    m.stats.forEach(s => {
                        const id = s.uid || s.name
                        if (!killMap[id]) {
                            let pName = s.name || s.uid
                            if (tourney.participants) {
                                const p = tourney.participants.find(pt => pt.uid === s.uid)
                                if (p) pName = p.name
                            }
                            killMap[id] = { id, name: pName, kills: 0 }
                        }
                        killMap[id].kills += (Number(s.kills) || 0)
                    })
                }
            })
        }

        // Apply specific overrides
        for (const [uid, manualKills] of Object.entries(overrides)) {
            if (manualKills !== null && manualKills !== '') {
                // Find name if not already in map
                let pName = uid
                if (tourney.participants) {
                    const p = tourney.participants.find(pt => pt.uid === uid)
                    if (p) pName = p.name
                }
                if (!killMap[uid]) killMap[uid] = { id: uid, name: pName, kills: 0 }
                // OVERRIDE the score if set manually
                killMap[uid].kills = Number(manualKills)
            }
        }

        return Object.values(killMap).sort((a, b) => b.kills - a.kills)
    }
    const topKillers = getTopKillers()

    return (
        <div className="glass-card" style={{ padding: '24px', border: isRunning ? '1px solid rgba(192, 57, 43, 0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.55rem', fontWeight: 800, background: 'rgba(192, 57, 43, 0.2)', color: 'var(--accent)', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>{tourney.type}</span>
                        {isRunning && <span style={{ fontSize: '0.55rem', fontWeight: 800, background: 'rgba(231, 76, 60, 0.1)', color: '#c0392b', padding: '4px 10px', borderRadius: '4px' }}>LIVE NOW</span>}
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{tourney.title}</h4>
                    <p style={{ fontSize: '0.75rem', opacity: 0.4 }}>{tourney.date}</p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffeb3b' }}>{tourney.prize}</p>
                    <p style={{ fontSize: '0.55rem', opacity: 0.3 }}>FEE: {tourney.entryFee || 'FREE'}</p>
                    {/* Registrations count badge */}
                    <div style={{ background: 'rgba(52,152,219,0.1)', border: '1px solid rgba(52,152,219,0.2)', padding: '3px 8px', borderRadius: '6px', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#3498db' }}>👥 {tourney.participants?.length || 0} REGISTERED</span>
                    </div>
                </div>
            </div>

            {/* AI Prediction Section for Upcoming */}
            {isUpcoming && (prediction || predLoading) && (
                <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <div style={{ padding: '3px 8px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '6px', fontSize: '0.55rem', color: '#3498db', fontWeight: 900, border: '1px solid rgba(52, 152, 219, 0.2)' }}>SARKAR AI</div>
                        <h5 style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.4, letterSpacing: '0.05em' }}>WIN PREDICTION</h5>
                    </div>

                    {predLoading ? (
                        <div style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="pulse" style={{ width: '12px', height: '12px', background: '#3498db', borderRadius: '50%' }} />
                            <span style={{ fontSize: '0.65rem', opacity: 0.4, fontWeight: 700 }}>CALCULATING ODDS...</span>
                        </div>
                    ) : prediction ? (
                        <div>
                            {/* Percentage Bars */}
                            {prediction.predictions?.length === 2 ? (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, marginBottom: '6px' }}>
                                        <span>{prediction.predictions[0].name} ({prediction.predictions[0].percentage}%)</span>
                                        <span>{prediction.predictions[1].name} ({prediction.predictions[1].percentage}%)</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                                        <div style={{ width: `${prediction.predictions[0].percentage}%`, background: '#3498db', height: '100%' }} />
                                        <div style={{ width: `${prediction.predictions[1].percentage}%`, background: '#e74c3c', height: '100%' }} />
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                                    {prediction.predictions?.slice(0, 4).map((p, i) => (
                                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', border: p.isTop ? '1px solid rgba(46, 204, 113, 0.3)' : '1px solid transparent' }}>
                                            <p style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '2px' }}>{p.name}</p>
                                            <p style={{ fontSize: '1rem', fontWeight: 900, color: p.isTop ? '#2ecc71' : 'white' }}>{p.percentage}%</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Overview Points */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {prediction.overview?.map((point, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)', marginTop: '6px' }} />
                                        <p style={{ fontSize: '0.7rem', opacity: 0.6, lineHeight: 1.4 }}>{point}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            {winner && (
                <div style={{ background: 'rgba(255, 235, 59, 0.05)', border: '1px solid rgba(255, 235, 59, 0.1)', padding: '12px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.55rem', color: '#ffeb3b', fontWeight: 800, marginBottom: '4px' }}>🏆 TOURNAMENT WINNER 🏆</p>
                    <p style={{ fontSize: '1rem', fontWeight: 900 }}>{winner.name}</p>
                </div>
            )}

            <p style={{ fontSize: '0.8rem', opacity: 0.6, lineHeight: 1.5, marginBottom: '20px' }}>{tourney.description}</p>

            <div style={{ display: 'flex', gap: '8px' }}>
                {status === 'upcoming' && !hasApplied && (
                    <button className="btn-primary" style={{ flex: 2, padding: '12px' }} onClick={onRegister}>APPLY NOW</button>
                )}
                {status === 'upcoming' && hasApplied && (
                    <button className="btn-ghost" style={{ flex: 2, padding: '12px', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', borderColor: 'rgba(46, 204, 113, 0.3)', pointerEvents: 'none' }}>✓ APPLIED</button>
                )}
                <button className="btn-ghost" style={{ flex: 1, padding: '12px' }} onClick={() => setExpanded(!expanded)}>{expanded ? 'HIDE OVERVIEW' : 'RESULTS & TEAMS'}</button>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '20px' }}>

                            {(tourney.groups?.length > 2 || tourney.matches?.length > 0) && (
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', overflowX: 'auto' }}>
                                    <button onClick={() => setActiveTab('results')} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600, background: activeTab === 'results' ? 'rgba(192,57,43,0.2)' : 'transparent', color: activeTab === 'results' ? 'var(--accent)' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>RESULTS</button>
                                    {tourney.groups?.length > 2 && (
                                        <button onClick={() => setActiveTab('points')} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600, background: activeTab === 'points' ? 'rgba(192,57,43,0.2)' : 'transparent', color: activeTab === 'points' ? 'var(--accent)' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>POINTS</button>
                                    )}
                                    {tourney.matches?.length > 0 && (
                                        <button onClick={() => setActiveTab('killers')} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600, background: activeTab === 'killers' ? 'rgba(192,57,43,0.2)' : 'transparent', color: activeTab === 'killers' ? 'var(--accent)' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>TOP KILLERS</button>
                                    )}
                                </div>
                            )}

                            {activeTab === 'points' && tourney.groups?.length > 2 && tourney.pointsTable ? (
                                <div style={{ marginBottom: '32px' }}>
                                    <h5 style={{ fontSize: '0.7rem', fontWeight: 800, marginBottom: '16px', color: '#ffeb3b', letterSpacing: '0.05em' }}>OVERALL STANDINGS</h5>
                                    <div className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                            <thead>
                                                <tr style={{ textAlign: 'left', opacity: 0.5, fontSize: '0.65rem' }}>
                                                    <th style={{ padding: '8px 4px' }}>#</th>
                                                    <th style={{ padding: '8px 4px' }}>TEAM</th>
                                                    <th style={{ textAlign: 'center', padding: '8px 4px' }}>M</th>
                                                    <th style={{ textAlign: 'center', padding: '8px 4px' }}>W</th>
                                                    <th style={{ textAlign: 'right', padding: '8px 4px' }}>NRR</th>
                                                    <th style={{ textAlign: 'right', padding: '8px 4px' }}>PTS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...tourney.pointsTable]
                                                    .sort((a, b) => b.pts - a.pts || b.wins - a.wins || (parseFloat(b.nrr) - parseFloat(a.nrr)) || 0)
                                                    .map((pt, idx) => (
                                                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                            <td style={{ padding: '10px 4px', fontWeight: 800, color: idx < 3 ? '#ffeb3b' : 'inherit' }}>{idx + 1}</td>
                                                            <td style={{ padding: '10px 4px', fontWeight: 700 }}>{pt.teamName}</td>
                                                            <td style={{ textAlign: 'center', padding: '10px 4px', opacity: 0.6 }}>{pt.matches}</td>
                                                            <td style={{ textAlign: 'center', padding: '10px 4px', opacity: 0.6 }}>{pt.wins}</td>
                                                            <td style={{ textAlign: 'right', padding: '10px 4px', opacity: 0.8, color: '#3498db' }}>{pt.nrr || '0.000'}</td>
                                                            <td style={{ textAlign: 'right', padding: '10px 4px', fontWeight: 900, color: 'var(--accent)' }}>{pt.pts}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : null}

                            {activeTab === 'killers' && topKillers.length > 0 ? (
                                <div style={{ marginBottom: '32px' }}>
                                    <h5 style={{ fontSize: '0.7rem', fontWeight: 800, marginBottom: '16px', color: '#e74c3c', letterSpacing: '0.05em' }}>TOURNAMENT TOP FRAGGERS</h5>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {topKillers.map((tk, idx) => (
                                            <div key={tk.id} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '12px 16px',
                                                borderRadius: '12px',
                                                background: idx === 0 ? 'linear-gradient(90deg, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0.05) 100%)' :
                                                    idx === 1 ? 'linear-gradient(90deg, rgba(192,192,192,0.15) 0%, rgba(192,192,192,0.05) 100%)' :
                                                        idx === 2 ? 'linear-gradient(90deg, rgba(205,127,50,0.15) 0%, rgba(205,127,50,0.05) 100%)' :
                                                            'rgba(255,255,255,0.02)',
                                                border: idx === 0 ? '1px solid rgba(255,215,0,0.3)' :
                                                    idx === 1 ? '1px solid rgba(192,192,192,0.3)' :
                                                        idx === 2 ? '1px solid rgba(205,127,50,0.3)' :
                                                            '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{
                                                        fontWeight: 900,
                                                        fontSize: '1rem',
                                                        color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'rgba(255,255,255,0.3)'
                                                    }}>#{idx + 1}</span>
                                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: idx < 3 ? '#fff' : 'rgba(255,255,255,0.7)' }}>{tk.name}</span>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ fontWeight: 900, fontSize: '1.2rem', color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'var(--accent)' }}>{tk.kills}</span>
                                                    <span style={{ fontSize: '0.6rem', opacity: 0.5, marginLeft: '4px' }}>KILLS</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}


                            {activeTab === 'results' && (
                                <>
                                    {/* Advance Details */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <h5 style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent)', marginBottom: '12px', letterSpacing: '0.05em' }}>PRIZE POOL BREAKDOWN</h5>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {tourney.prizes?.winner && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}><span style={{ opacity: 0.5 }}>1st Place</span><span style={{ fontWeight: 800, color: '#ffeb3b' }}>₹{tourney.prizes.winner}</span></div>}
                                                {tourney.prizes?.runner && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}><span style={{ opacity: 0.5 }}>2nd Place</span><span style={{ fontWeight: 700 }}>₹{tourney.prizes.runner}</span></div>}
                                                {tourney.prizes?.third && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}><span style={{ opacity: 0.5 }}>3rd Place</span><span style={{ fontWeight: 700 }}>₹{tourney.prizes.third}</span></div>}
                                                {tourney.prizes?.mvp && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)' }}><span style={{ opacity: 0.5 }}>Top Fragger</span><span style={{ fontWeight: 800, color: 'var(--accent)' }}>₹{tourney.prizes.mvp}</span></div>}
                                            </div>
                                        </div>
                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <h5 style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent)', marginBottom: '12px', letterSpacing: '0.05em' }}>POINTS SYSTEM</h5>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}><span style={{ opacity: 0.5 }}>Per Kill</span><span style={{ fontWeight: 800 }}>{tourney.pointsPerKill || 1} Pts</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}><span style={{ opacity: 0.5 }}>Placement</span><span style={{ fontWeight: 700 }}>As per Rules</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}><span style={{ opacity: 0.5 }}>Max Slots</span><span style={{ fontWeight: 700 }}>{tourney.maxSlots || 24}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                        </div>    {/* Matches Table */}
                        {tourney.matches?.length > 0 && (
                            <div style={{ marginBottom: '32px' }}>
                                <h5 style={{ fontSize: '0.7rem', fontWeight: 800, marginBottom: '16px', color: 'var(--accent)' }}>MATCH HISTORY</h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[...tourney.matches]
                                        .reverse()
                                        .slice(0, showAllMatches ? tourney.matches.length : 2)
                                        .map((m, revIdx) => {
                                            const originalIdx = tourney.matches.length - 1 - revIdx;
                                            return (
                                                <div key={originalIdx} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>Match {originalIdx + 1}</span>
                                                        <span style={{ fontSize: '0.65rem', color: '#ffeb3b' }}>Winner: {tourney.groups[m.winnerTeamIdx]?.name || 'TBD'}</span>
                                                    </div>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                                        <thead>
                                                            <tr style={{ textAlign: 'left', opacity: 0.3, fontSize: '0.6rem' }}>
                                                                <th style={{ padding: '8px 0' }}>PLAYER</th>
                                                                <th style={{ textAlign: 'right' }}>KILLS</th>
                                                                <th style={{ textAlign: 'right' }}>ACE</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {m.stats?.sort((a, b) => b.kills - a.kills).map(s => (
                                                                <tr key={s.uid} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                                    <td style={{ padding: '8px 0', fontWeight: 600 }}>{tourney.participants?.find(p => p.uid === s.uid)?.name || s.name || s.uid}</td>
                                                                    <td style={{ textAlign: 'right', fontWeight: 800 }}>{s.kills}</td>
                                                                    <td style={{ textAlign: 'right' }}>{s.ace ? '🔥' : '-'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            );
                                        })}
                                </div>
                                {tourney.matches.length > 2 && (
                                    <button
                                        className="btn-ghost"
                                        style={{ width: '100%', marginTop: '12px', fontSize: '0.7rem', padding: '10px' }}
                                        onClick={() => setShowAllMatches(!showAllMatches)}
                                    >
                                        {showAllMatches ? 'SHOW LESS' : `SHOW ALL (${tourney.matches.length})`}
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
