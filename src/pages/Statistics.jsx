import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getMembers, getScrims } from '../utils/api'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import { stagger, fadeUp, springTap } from '../utils/motion'

const BADGES = {
    aura: { name: 'AURA FARMER', color: '#ffeb3b', bg: 'rgba(255, 235, 59, 0.1)' },
    legend: { name: 'LEGEND', color: '#e74c3c', bg: 'rgba(231, 76, 60, 0.1)' },
    pro: { name: 'PRO', color: '#3498db', bg: 'rgba(52, 152, 219, 0.1)' },
    avg: { name: 'AVERAGE', color: '#95a5a6', bg: 'rgba(149, 165, 166, 0.1)' }
}

const getBadge = (rank) => {
    if (rank === 0) return BADGES.aura
    if (rank === 1) return BADGES.legend
    if (rank === 2) return BADGES.pro
    return BADGES.avg
}

export default function Statistics() {
    const navigate = useNavigate()
    const query = new URLSearchParams(window.location.search)
    const initialTab = query.get('tab') === 'scrim' ? 'scrim' : 'tourney'

    const [allMembers, setAllMembers] = useState([])
    const [scrims, setScrims] = useState([])
    const [category, setCategory] = useState(initialTab) // 'tourney' or 'scrim'
    const [status, setStatus] = useState('loading')
    const [activeIndex, setActiveIndex] = useState(0)
    const [selectedPlayer, setSelectedPlayer] = useState(null)
    const [selectedScrim, setSelectedScrim] = useState(null)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const [mems, scrs] = await Promise.all([getMembers(), getScrims()])
            setAllMembers(mems || [])
            setScrims(scrs || [])
            setStatus('success')
        } catch {
            setStatus('error')
        }
    }

    if (status === 'loading') return <LoadingState message="Summoning the legends..." />
    if (status === 'error') return <ErrorState />

    const players = [...allMembers].map(m => ({
        ...m,
        activeStats: m.stats?.[category] || { kills: 0, ace: 0, matches: 0 }
    })).sort((a, b) => (b.activeStats.kills || 0) - (a.activeStats.kills || 0))

    const top3 = players.slice(0, 3)

    return (
        <div style={{ padding: '24px 16px 120px', maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/')} 
                        className="btn-ghost" 
                        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </motion.button>
                    <h2 className="text-display" style={{ fontSize: '1.4rem' }}>Leaderboard</h2>
                </div>

                {/* Category Toggle - Restored to previous look */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {[['tourney', 'GUILD'], ['scrim', 'INTL']].map(([tab, label]) => (
                        <button 
                            key={tab}
                            onClick={() => { setCategory(tab); setActiveIndex(0); }} 
                            style={{ 
                                padding: '8px 16px', borderRadius: '9px', fontSize: '0.65rem', fontWeight: 800, 
                                border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                                background: category === tab ? 'var(--accent)' : 'transparent', 
                                color: category === tab ? 'white' : 'rgba(255,255,255,0.3)',
                                letterSpacing: '0.05em'
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {players.length === 0 ? (
                <div className="glass-card" style={{ padding: '80px 20px', textAlign: 'center', borderStyle: 'dashed' }}>
                    <p style={{ opacity: 0.4, fontSize: '1rem', fontWeight: 700 }}>No battle data found yet.</p>
                </div>
            ) : (
                <>
                    {/* 3D Carousel Box - Animation kept, styles reverted */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ padding: '40px 0', marginBottom: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', touchAction: 'none' }}
                    >
                        <motion.div
                            onWheel={(e) => {
                                const now = Date.now()
                                if (now - (window._lastScroll || 0) < 500) return
                                if (Math.abs(e.deltaX) < 10 && Math.abs(e.deltaY) < 10) return

                                if (e.deltaY > 0 || e.deltaX > 0) {
                                    setActiveIndex((prev) => (prev + 1) % top3.length)
                                } else {
                                    setActiveIndex((prev) => (prev - 1 + top3.length) % top3.length)
                                }
                                window._lastScroll = now
                            }}
                            onPanEnd={(_, info) => {
                                if (info.offset.x < -50) setActiveIndex((prev) => (prev + 1) % top3.length)
                                else if (info.offset.x > 50) setActiveIndex((prev) => (prev - 1 + top3.length) % top3.length)
                            }}
                            style={{ position: 'relative', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <AnimatePresence mode='popLayout'>
                                {top3.map((p, i) => {
                                    const diff = i - activeIndex
                                    const absDiff = Math.abs(diff)
                                    const isCenter = absDiff === 0

                                    if (absDiff > 1 && absDiff < top3.length - 1) return null

                                    let x = diff * 120
                                    if (diff === 2) x = -120
                                    if (diff === -2) x = 120

                                    return (
                                        <motion.div
                                            key={p._id}
                                            initial={{ opacity: 0, scale: 0.5, x: 0 }}
                                            animate={{
                                                opacity: isCenter ? 1 : 0.3,
                                                scale: isCenter ? 1.2 : 0.8,
                                                x: x,
                                                zIndex: isCenter ? 10 : 1,
                                            }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                            style={{ position: 'absolute', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                            onClick={() => isCenter ? setSelectedPlayer({ ...p, rank: i + 1 }) : setActiveIndex(i)}
                                        >
                                            <div style={{
                                                width: '80px', height: '80px', borderRadius: '50%',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: `2px solid ${i === 0 ? '#ffeb3b' : i === 1 ? '#e74c3c' : '#3498db'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '2.2rem', fontWeight: 900, color: i === 0 ? '#ffeb3b' : 'white',
                                                transition: 'all 0.3s'
                                            }}>
                                                {i + 1}
                                            </div>
                                            <motion.div 
                                                animate={{ opacity: isCenter ? 1 : 0, y: isCenter ? 0 : 10 }}
                                                style={{ textAlign: 'center', marginTop: '12px' }}
                                            >
                                                <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'white' }}>{p.name.toUpperCase()}</p>
                                                <p style={{ fontSize: '0.7rem', color: '#ffeb3b', fontWeight: 700 }}>{p.activeStats.kills} KILLS</p>
                                            </motion.div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </motion.div>
                        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.55rem', opacity: 0.2, fontWeight: 800, letterSpacing: '0.1em' }}>SWIPE TO ROTATE</div>
                    </motion.div>

                    {/* Rankings List - Reverted to simpler look */}
                    <div style={{ paddingBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingLeft: '4px' }}>
                            <div style={{ width: '10px', height: '10px', background: 'var(--accent)', transform: 'rotate(45deg)' }} />
                            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)' }}>ALL RANKINGS</h3>
                        </div>
                        
                        <motion.div initial="hidden" animate="visible" variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {players.map((p, i) => {
                                const stats = p.activeStats
                                return (
                                    <motion.div 
                                        key={p._id} 
                                        variants={fadeUp}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedPlayer({ ...p, rank: i + 1 })} 
                                        style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}
                                    >
                                        <span style={{ width: '32px', opacity: 0.2, fontWeight: 900, fontSize: '0.8rem' }}>{String(i + 1).padStart(2, '0')}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{p.name}</p>
                                                {i < 3 && <span style={{ fontSize: '0.7rem' }}>{i === 0 ? '🏆' : i === 1 ? '🥈' : '🥉'}</span>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>MATCHES: {stats.matches}</span>
                                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>ACES: {stats.ace}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: i < 3 ? 'var(--accent)' : 'white' }}>{stats.kills}</p>
                                            <p style={{ fontSize: '0.5rem', opacity: 0.3, fontWeight: 700 }}>KILLS</p>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    </div>
                </>
            )}

            {/* Premium Player Stats Modal */}
            <AnimatePresence>
                {selectedPlayer && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedPlayer(null)}
                        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '360px', padding: '32px 24px', textAlign: 'center', position: 'relative' }}
                        >
                            <button onClick={() => setSelectedPlayer(null)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                            
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(192,57,43,0.1)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', fontWeight: 900, color: selectedPlayer.rank === 1 ? '#ffeb3b' : 'white', margin: '0 auto 16px' }}>
                                {selectedPlayer.rank}
                            </div>
                            
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '4px' }}>{selectedPlayer.name}</h3>
                            <div style={{ marginBottom: '20px' }}>
                                <span style={{ background: getBadge(selectedPlayer.rank - 1).bg, color: getBadge(selectedPlayer.rank - 1).color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800 }}>
                                    {getBadge(selectedPlayer.rank - 1).name}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
                                {[
                                    { label: 'KILLS', val: selectedPlayer.activeStats.kills },
                                    { label: 'ACES', val: selectedPlayer.activeStats.ace },
                                    { label: 'MATCHES', val: selectedPlayer.activeStats.matches }
                                ].map(s => (
                                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>{s.val}</p>
                                        <p style={{ fontSize: '0.5rem', opacity: 0.3, fontWeight: 700, marginTop: '2px' }}>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <button className="btn-primary" style={{ width: '100%', fontWeight: 800 }} onClick={() => setSelectedPlayer(null)}>
                                CLOSE
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
