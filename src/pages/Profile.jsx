import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useUserAuth } from '../context/UserAuthContext'
import { fadeUp, stagger, springTap } from '../utils/motion'
import { getMembers, getTournaments, savePushSubscription } from '../utils/api'
import { getAIPlayerComparison } from '../utils/aiService'
import toast from 'react-hot-toast'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

// ── Badge system ───────────────────────────────────────────────
function getBadge(kills, wins, aces) {
    if (kills >= 200) return { label: '💀 DEATH MACHINE', color: '#e74c3c' }
    if (kills >= 100) return { label: '🔥 BEAST', color: '#e67e22' }
    if (kills >= 50) return { label: '⚔️ BATTLE HARDENED', color: '#f39c12' }
    if (wins >= 3) return { label: '👑 GUILD LEGEND', color: '#ffeb3b' }
    if (aces >= 2) return { label: '🎯 ACE MACHINE', color: '#9b59b6' }
    if (kills >= 20) return { label: '🎮 RISING STAR', color: '#3498db' }
    return { label: '🐣 RECRUIT', color: 'rgba(255,255,255,0.3)' }
}

// ── Avatar color presets ───────────────────────────────────────
const AVATAR_COLORS = [
    '#c0392b', '#e67e22', '#f39c12', '#27ae60',
    '#2980b9', '#8e44ad', '#16a085', '#d35400'
]

const AVATAR_STORAGE_KEY = 'sarkar_avatar_color'

// ── Mini Bar Chart — CSS Only ──────────────────────────────────
function KillsGraph({ data }) {
    if (!data || data.length === 0) return (
        <p style={{ fontSize: '0.7rem', opacity: 0.4, textAlign: 'center', padding: '20px 0' }}>
            No match data yet
        </p>
    )
    const max = Math.max(...data.map(d => d.kills), 1)
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '60px', padding: '0 4px' }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.5rem', opacity: 0.5 }}>{d.kills}</span>
                    <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.kills / max) * 48}px` }}
                        transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                        style={{
                            width: '100%', borderRadius: '6px 6px 0 0',
                            background: 'linear-gradient(0deg, #c0392b, #e74c3c)',
                            minHeight: '4px'
                        }} 
                    />
                    <span style={{ fontSize: '0.45rem', opacity: 0.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', textAlign: 'center' }}>
                        M{i + 1}
                    </span>
                </div>
            ))}
        </div>
    )
}

// ── H2H stat helpers ─────────────────────────────────────────
function getComboStats(member) {
    const t = member?.stats?.tourney || member?.stats || {}
    const s = member?.stats?.scrim || {}
    return {
        kills: (t.kills || 0) + (s.kills || 0),
        aces: (t.ace || 0) + (s.ace || 0),
        matches: (t.matches || 0) + (s.matches || 0),
        wins: (t.wins || 0),
    }
}

function pctDiff(a, b) {
    if (a === 0 && b === 0) return 0
    const base = Math.max(a, b)
    return base === 0 ? 0 : Math.round(((a - b) / base) * 100)
}

export default function Profile() {
    const { user, logout, token } = useUserAuth()
    const navigate = useNavigate()
    const [statsTab, setStatsTab] = useState('tourney') // 'tourney' | 'scrim'
    const [avatarColor, setAvatarColor] = useState(
        () => localStorage.getItem(AVATAR_STORAGE_KEY) || AVATAR_COLORS[0]
    )
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [guildRank, setGuildRank] = useState(null)
    const [appliedTourneys, setAppliedTourneys] = useState([])
    const [allMembers, setAllMembers] = useState([])
    const [uidCopied, setUidCopied] = useState(false)
    const [notifStatus, setNotifStatus] = useState(
        'Notification' in window ? Notification.permission : 'unsupported'
    )
    // H2H state
    const [h2hOpen, setH2hOpen] = useState(false)    // picker open
    const [h2hPlayer, setH2hPlayer] = useState(null)  // selected opponent
    const [aiAnalysis, setAiAnalysis] = useState('')
    const [aiLoading, setAiLoading] = useState(false)

    useEffect(() => {
        if (h2hPlayer && user) {
            setAiLoading(true)
            setAiAnalysis('')
            getAIPlayerComparison(user, h2hPlayer, statsTab)
                .then(res => setAiAnalysis(res))
                .catch(err => {
                    console.error("AI Analysis failed", err)
                    setAiAnalysis("AI Analysis temporarily unavailable. Focus on the raw stats above!")
                })
                .finally(() => setAiLoading(false))
        }
    }, [h2hPlayer, user, statsTab])

    useEffect(() => {
        if (!user) return

        // Fetch all members (for rank + H2H)
        getMembers().then(members => {
            setAllMembers(members)
            const sorted = [...members].sort((a, b) =>
                (b.stats?.tourney?.kills || b.stats?.kills || 0) - (a.stats?.tourney?.kills || a.stats?.kills || 0)
            )
            const idx = sorted.findIndex(m => m.uid === user.uid)
            setGuildRank(idx === -1 ? null : idx + 1)
        }).catch(() => { })

        // Fetch tournament history for this user
        getTournaments().then(t => {
            const all = [...(t.upcoming || []), ...(t.running || []), ...(t.past || [])]
            const mine = all.filter(tourney =>
                tourney.participants?.some(p => p.uid === user.uid)
            ).map(tourney => {
                let status = 'PARTICIPATED'
                const section = t.past?.find(x => x._id === tourney._id) ? 'past' : (t.running?.find(x => x._id === tourney._id) ? 'running' : 'upcoming')
                return { ...tourney, _section: section, _status: status }
            })
            setAppliedTourneys(mine)
        }).catch(() => { })
    }, [user])

    const handleLogout = () => {
        logout()
        toast.success('Logged out')
        navigate('/login')
    }

    const handleCopyUID = () => {
        navigator.clipboard.writeText(user.uid).then(() => {
            setUidCopied(true)
            toast.success('Public UID copied!')
            setTimeout(() => setUidCopied(false), 2000)
        })
    }

    const handleColorSelect = (color) => {
        setAvatarColor(color)
        localStorage.setItem(AVATAR_STORAGE_KEY, color)
        setShowColorPicker(false)
    }

    const handleSyncNotifications = async () => {
        if (!('serviceWorker' in navigator) || !VAPID_PUBLIC_KEY) {
            toast.error('Push notifications not supported on this browser.')
            return
        }

        const loadingToast = toast.loading('Syncing with SARKAR DB...')
        try {
            const permission = await Notification.requestPermission()
            setNotifStatus(permission)

            if (permission !== 'granted') {
                toast.error('Permission denied. Cannot sync.', { id: loadingToast })
                return
            }

            const reg = await navigator.serviceWorker.ready
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            })

            const res = await savePushSubscription(user.uid, subscription.toJSON(), token, user._id)
            if (res.ok) {
                toast.success('All devices synced successfully! 🔥', { id: loadingToast })
            } else {
                toast.error('Sync failed: ' + (res.error || 'Server error'), { id: loadingToast })
            }
        } catch (err) {
            console.error('Sync error:', err)
            toast.error('Sync failed: ' + err.message, { id: loadingToast })
        }
    }





    if (!user) return null

    // Compute stats based on active tab
    const stats = statsTab === 'tourney'
        ? (user.stats?.tourney || user.stats || {})
        : (user.stats?.scrim || {})

    const kills = stats.kills || 0
    const matches = stats.matches || 0
    const wins = stats.wins || 0
    const aces = stats.ace || 0
    const kd = matches > 0 ? (kills / matches).toFixed(2) : '0.00'
    const badge = getBadge(
        (user.stats?.tourney?.kills || user.stats?.kills || 0) + (user.stats?.scrim?.kills || 0),
        user.stats?.tourney?.wins || 0,
        (user.stats?.tourney?.ace || 0) + (user.stats?.scrim?.ace || 0)
    )

    const graphData = appliedTourneys
        .filter(t => t._section === 'past')
        .slice(-5)
        .map(t => {
            const matchKills = t.matches?.reduce((acc, m) => {
                const s = m.stats?.find(s => s.uid === user.uid)
                return acc + (s?.kills || 0)
            }, 0) || 0
            return { kills: matchKills }
        })

    const sectionStatus = {
        'upcoming': { label: 'REGISTERED', color: '#3498db', bg: 'rgba(52,152,219,0.1)' },
        'running': { label: '🔴 LIVE', color: '#e67e22', bg: 'rgba(230,126,34,0.1)' },
        'past': { label: 'PARTICIPATED', color: '#2ecc71', bg: 'rgba(46,204,113,0.1)' },
    }

    return (
        <div style={{ padding: '24px 16px 120px', maxWidth: '480px', margin: '0 auto' }}>
            <motion.div initial="hidden" animate="visible" variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* ── Header ── */}
                <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 className="text-display" style={{ fontSize: '1.6rem', letterSpacing: '0.02em' }}>My Player Profile</h2>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-danger" 
                        onClick={handleLogout} 
                        style={{ padding: '8px 16px', fontSize: '0.65rem', fontWeight: 900 }}
                    >
                        LOGOUT
                    </motion.button>
                </motion.div>

                {/* ── Hero Card - Liquid Glass Styled ── */}
                <motion.div variants={fadeUp} className="glass-card glass-card-heavy glow-breathe" style={{ padding: '40px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', background: `radial-gradient(circle, ${avatarColor}15 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />

                    {/* Avatar with Liquid Float */}
                    <motion.div
                        className="liquid-float"
                        onClick={() => setShowColorPicker(v => !v)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            width: '90px', height: '90px', borderRadius: '50%',
                            background: `linear-gradient(135deg, ${avatarColor}44 0%, ${avatarColor}11 100%)`,
                            border: `3.5px solid ${avatarColor}`,
                            margin: '0 auto 12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.4rem', fontWeight: 950, color: 'white',
                            cursor: 'pointer', position: 'relative',
                            boxShadow: `0 0 30px ${avatarColor}44, inset 0 0 20px rgba(255,255,255,0.1)`,
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                        {user.name.charAt(0)}
                        <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '24px', height: '24px', borderRadius: '50%', background: '#111', border: '1.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', boxShadow: '0 4px 8px rgba(0,0,0,0.4)' }}>🎨</div>
                    </motion.div>

                    {/* Color Picker with Premium AnimatePresence */}
                    <AnimatePresence>
                        {showColorPicker && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: -15, height: 0 }}
                                animate={{ opacity: 1, scale: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, scale: 0.8, y: -15, height: 0 }}
                                style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px', flexWrap: 'wrap', padding: '16px', background: 'rgba(0,0,0,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', overflow: 'hidden' }}
                            >
                                {AVATAR_COLORS.map(color => (
                                    <motion.button 
                                        key={color} 
                                        whileHover={{ scale: 1.25 }}
                                        whileTap={{ scale: 0.85 }}
                                        onClick={() => handleColorSelect(color)} 
                                        style={{
                                            width: '32px', height: '32px', borderRadius: '50%', background: color, 
                                            border: color === avatarColor ? '3px solid white' : '2px solid transparent', 
                                            cursor: 'pointer', boxShadow: color === avatarColor ? `0 0 15px ${color}` : 'none'
                                        }} 
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <h3 style={{ fontSize: '1.8rem', fontWeight: 950, marginBottom: '2px', letterSpacing: '-0.02em', color: 'white' }}>{user.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px', fontWeight: 800 }}>{user.role}</p>

                    {/* Badge */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'inline-block', background: `${badge.color}18`, padding: '6px 18px', borderRadius: '25px', border: `1.5px solid ${badge.color}44`, marginBottom: '20px', backdropFilter: 'blur(10px)', boxShadow: `0 4px 15px ${badge.color}15` }}
                    >
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: badge.color, letterSpacing: '0.05em' }}>{badge.label}</span>
                    </motion.div>

                    {/* Guild Rank Grid */}
                    {guildRank && (
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 850, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>GUILD KILL RANK</span>
                            <motion.div 
                                whileHover={{ scale: 1.1 }}
                                style={{ fontSize: '1.2rem', fontWeight: 1000, color: guildRank === 1 ? '#ffeb3b' : guildRank === 2 ? '#bdc3c7' : guildRank === 3 ? '#ffa726' : 'white', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                {guildRank === 1 ? '🥇' : guildRank === 2 ? '🥈' : guildRank === 3 ? '🥉' : ''} #{guildRank}
                            </motion.div>
                        </div>
                    )}

                    {/* UID + COMPARE row - Spring Animated */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                        <motion.div
                            whileHover={{ scale: 1.03, background: 'rgba(0,0,0,0.5)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleCopyUID}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.4)', padding: '8px 18px', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.3s' }}
                        >
                            <span style={{ fontSize: '0.65rem', opacity: 0.4, fontWeight: 900 }}>UID</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--accent)', fontFamily: 'monospace' }}>{user.uid}</span>
                            <span style={{ fontSize: '0.6rem', fontWeight: 1000, color: uidCopied ? '#2ecc71' : 'rgba(255,255,255,0.3)' }}>
                                {uidCopied ? '✓ READY' : '⎘ SHARE'}
                            </span>
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.03, background: h2hOpen ? 'rgba(52,152,219,0.3)' : 'rgba(0,0,0,0.5)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { setH2hOpen(v => !v); setH2hPlayer(null) }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: h2hOpen ? 'rgba(52,152,219,0.25)' : 'rgba(0,0,0,0.4)', padding: '8px 18px', borderRadius: '12px', border: `1.5px solid ${h2hOpen ? 'rgba(52,152,219,0.5)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 900, color: h2hOpen ? '#3498db' : 'rgba(255,255,255,0.6)', transition: 'all 0.3s' }}
                        >
                            ⚔️ VS MODE
                        </motion.button>
                    </div>

                    {/* H2H Player Picker - Spring Slider */}
                    <AnimatePresence>
                        {h2hOpen && !h2hPlayer && (
                            <motion.div
                                initial={{ opacity: 0, y: 15, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: 15, height: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                style={{ marginTop: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '16px', border: '1.5px solid rgba(52,152,219,0.3)', backdropFilter: 'blur(10px)', overflow: 'hidden' }}
                            >
                                <p style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '12px', fontWeight: 900, letterSpacing: '0.05em' }}>CHALLENGE PLAYER</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                                    {allMembers.filter(m => m.uid !== user.uid).map(m => (
                                        <motion.button 
                                            key={m._id} 
                                            whileHover={{ x: 6, background: 'rgba(255,255,255,0.06)' }}
                                            onClick={() => setH2hPlayer(m)} 
                                            style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                                        >
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(192,57,43,0.3) 0%, rgba(100,15,15,0.3) 100%)', border: '1.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 950, color: 'var(--accent)', flexShrink: 0 }}>{m.name.charAt(0)}</div>
                                            <div>
                                                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>{m.name}</p>
                                                <p style={{ fontSize: '0.6rem', opacity: 0.4, fontWeight: 700 }}>{m.role}</p>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── H2H Comparison Panel - Premium Liquid Animation ── */}
                <AnimatePresence>
                    {h2hOpen && h2hPlayer && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                            className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden', border: '2px solid rgba(52, 152, 219, 0.4)', boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 0 20px rgba(52, 152, 219, 0.15)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 950, color: '#3498db', letterSpacing: '0.1em' }}>⚡ BATTLE ANALYSIS</h4>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.65rem', fontWeight: 900 }} onClick={() => setH2hPlayer(null)}>CHANGE</motion.button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '15px', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
                                <div>
                                    <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 1000, color: 'white', margin: '0 auto 10px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>{user.name.charAt(0)}</div>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 900 }}>YOU</p>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 1000, color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>VS</div>
                                <div>
                                    <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 1000, color: 'white', margin: '0 auto 10px', boxShadow: '0 8px 20px rgba(192,57,43,0.3)' }}>{h2hPlayer.name.charAt(0)}</div>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 900, color: '#e74c3c' }}>{h2hPlayer.name}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {(() => {
                                    const u = getComboStats(user)
                                    const o = getComboStats(h2hPlayer)
                                    const uKd = u.matches > 0 ? (u.kills / u.matches).toFixed(2) : 0
                                    const oKd = o.matches > 0 ? (o.kills / o.matches).toFixed(2) : 0

                                    const statsLists = [
                                        { label: 'DOMINATION KILLS', uVal: u.kills, oVal: o.kills },
                                        { label: 'BATTLE EXPERIENCE', uVal: u.matches, oVal: o.matches },
                                        { label: 'ACES ACHIEVED', uVal: u.aces, oVal: o.aces },
                                        { label: 'CHAMPION WINS', uVal: u.wins, oVal: o.wins },
                                        { label: 'K/D SUPERIORITY', uVal: uKd, oVal: oKd, isFloat: true },
                                    ]

                                    return statsLists.map((stat, i) => {
                                        const diff = Math.round(Number(stat.uVal) - Number(stat.oVal))
                                        const pct = pctDiff(Number(stat.uVal), Number(stat.oVal))
                                        let compareText = ''
                                        let color = 'rgba(255,255,255,0.4)'
                                        if (diff > 0) { compareText = `+${pct}% STRONGER`; color = '#2ecc71' }
                                        else if (diff < 0) { compareText = `${pct}% SLOWER`; color = '#e74c3c' }
                                        else { compareText = 'MATCHED'; color = '#ffeb3b' }

                                        return (
                                            <motion.div 
                                                key={i} 
                                                initial={{ x: -10, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}
                                            >
                                                <div style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 1000, color: diff >= 0 ? '#fff' : 'rgba(255,255,255,0.3)' }}>{stat.uVal}</div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5, letterSpacing: '0.05em', marginBottom: '2px', textTransform: 'uppercase' }}>{stat.label}</p>
                                                    <p style={{ fontSize: '0.6rem', fontWeight: 1000, color, letterSpacing: '0.05em' }}>{compareText}</p>
                                                </div>
                                                <div style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 1000, color: diff <= 0 ? '#e74c3c' : 'rgba(231,76,60,0.3)' }}>{stat.oVal}</div>
                                            </motion.div>
                                        )
                                    })
                                })()}
                            </div>

                            {/* AI Strategic Intel */}
                            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '2.5px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                    <div style={{ padding: '5px 12px', background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.2) 0%, rgba(52, 152, 219, 0.1) 100%)', borderRadius: '8px', fontSize: '0.7rem', color: '#3498db', fontWeight: 950, border: '1.5px solid rgba(52, 152, 219, 0.3)', boxShadow: '0 4px 10px rgba(52,152,219,0.1)' }}>AI INTEL</div>
                                    <h5 style={{ fontSize: '0.75rem', fontWeight: 900, opacity: 0.6, letterSpacing: '0.1em' }}>STRATEGIC VERDICT</h5>
                                </div>

                                {aiLoading ? (
                                    <div style={{ padding: '30px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                        <div className="pulse" style={{ width: '24px', height: '24px', background: '#3498db', borderRadius: '50%', margin: '0 auto 12px' }} />
                                        <p style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 900, letterSpacing: '0.05em' }}>PROCESSING BATTLE DATA...</p>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1.5px solid rgba(255,255,255,0.05)', position: 'relative' }}
                                    >
                                        <div style={{
                                            fontSize: '0.92rem',
                                            lineHeight: '1.8',
                                            color: 'rgba(255,255,255,0.85)',
                                            fontWeight: 500,
                                            whiteSpace: 'pre-wrap',
                                            fontFamily: 'Inter, sans-serif'
                                        }}>
                                            {aiAnalysis}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Stats Dashboard - Premium Glass Grid ── */}
                <motion.div variants={fadeUp} className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 950, color: 'var(--accent)', letterSpacing: '0.12em' }}>⚡ BATTLE STATS</h4>
                        <div style={{ display: 'flex', gap: '5px', background: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '10px' }}>
                            {[['tourney', 'TOURNAMENT'], ['scrim', 'INTL']].map(([tab, label]) => (
                                <motion.button 
                                    key={tab} 
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setStatsTab(tab)} 
                                    style={{
                                        padding: '6px 14px', border: 'none', borderRadius: '8px', fontSize: '0.65rem',
                                        fontWeight: 900, cursor: 'pointer', transition: 'all 0.3s var(--ease-smooth)',
                                        background: statsTab === tab ? 'rgba(192,57,43,0.35)' : 'transparent',
                                        color: statsTab === tab ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
                                        boxShadow: statsTab === tab ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none'
                                    }}
                                >{label}</motion.button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {[
                            { label: 'KILLS', value: kills, color: '#ffeb3b', icon: '💀' },
                            { label: 'MATCHES', value: matches, color: '#3498db', icon: '🎮' },
                            { label: 'WINS', value: wins, color: '#2ecc71', icon: '🏆' },
                            { label: 'ACES', value: aces, color: '#9b59b6', icon: '🎯' },
                        ].map(({ label, value, color, icon }) => (
                            <motion.div 
                                key={label} 
                                whileHover={{ y: -4, background: 'rgba(255,255,255,0.05)' }}
                                style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px 16px', border: '1.5px solid rgba(255,255,255,0.06)', textAlign: 'center', transition: 'all 0.3s' }}
                            >
                                <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '8px' }}>{icon}</span>
                                <p style={{ fontSize: '1.8rem', fontWeight: 1000, color, lineHeight: 1, letterSpacing: '-0.02em', textShadow: `0 8px 20px ${color}22` }}>{value}</p>
                                <p style={{ fontSize: '0.6rem', fontWeight: 850, opacity: 0.4, marginTop: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Highly Visual K/D */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', borderRadius: '14px', padding: '16px 20px', border: '1.5px solid rgba(255,255,255,0.06)' }}
                    >
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, opacity: 0.5, letterSpacing: '0.05em' }}>K/D EFFICIENCY</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(parseFloat(kd) * 20, 100)}%` }}
                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                    style={{ height: '100%', background: parseFloat(kd) >= 3 ? '#e74c3c' : parseFloat(kd) >= 1.5 ? '#f39c12' : '#2ecc71', boxShadow: '0 0 10px rgba(255,255,255,0.2)' }}
                                />
                            </div>
                            <span style={{ fontSize: '1.6rem', fontWeight: 1000, color: 'white', letterSpacing: '-0.03em' }}>{kd}</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ── Performance Graph - Interactive Shimmer ── */}
                <motion.div variants={fadeUp} className="glass-card" style={{ padding: '24px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 950, color: 'var(--accent)', marginBottom: '20px', letterSpacing: '0.12em' }}>📈 RECENT DOMINANCE</h4>
                    <KillsGraph data={graphData} />
                </motion.div>

                {/* ── Tournament History - Premium List ── */}
                <motion.div variants={fadeUp} className="glass-card" style={{ padding: '24px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 950, color: 'var(--accent)', marginBottom: '20px', letterSpacing: '0.12em' }}>🏆 ARENA HISTORY</h4>
                    {appliedTourneys.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', opacity: 0.4, textAlign: 'center', padding: '20px 0', fontWeight: 700 }}>No battles recorded yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {appliedTourneys.map((t, idx) => {
                                const s = sectionStatus[t._section] || sectionStatus['past']
                                return (
                                    <motion.div 
                                        key={t._id} 
                                        initial={{ opacity: 0, x: -15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: `1.5px solid ${s.color}25`, backdropFilter: 'blur(5px)' }}
                                    >
                                        <div>
                                            <p style={{ fontSize: '0.92rem', fontWeight: 900, color: '#fff' }}>{t.title}</p>
                                            <p style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '4px', fontWeight: 700, letterSpacing: '0.02em' }}>{t.date} • {t.type.toUpperCase()}</p>
                                        </div>
                                        <span style={{ fontSize: '0.62rem', fontWeight: 1000, color: s.color, background: `${s.color}15`, padding: '5px 12px', borderRadius: '8px', border: `1px solid ${s.color}25`, letterSpacing: '0.05em' }}>
                                            {s.label}
                                        </span>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </motion.div>
                
                {/* ── Study Mode Access ── */}
                <motion.div variants={fadeUp} className="glass-card glass-card-heavy" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '16px' }}>
                        <div style={{ fontSize: '1.5rem' }}>📚</div>
                        <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: 'white' }}>Study Mastery</h4>
                            <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>Focus on your daily goals and stay consistent.</p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, background: 'linear-gradient(90deg, #c0392b, #e74c3c)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/seed')}
                        style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: 'white', fontSize: '0.8rem', fontWeight: 900, cursor: 'pointer', transition: 'all 0.3s' }}
                    >
                        OPEN STUDY MODE
                    </motion.button>
                </motion.div>

                {/* ── Notification Management ── */}
                <motion.div variants={fadeUp} className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: notifStatus === 'granted' ? '#2ecc71' : '#e74c3c', boxShadow: `0 0 10px ${notifStatus === 'granted' ? '#2ecc71' : '#e74c3c'}` }} />
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 950, color: 'var(--accent)', letterSpacing: '0.12em' }}>GUILD ALERTS</h4>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1.5px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '4px' }}>
                                    {notifStatus === 'granted' ? 'Service Active' : notifStatus === 'denied' ? 'Access Blocked' : 'Setup Required'}
                                </p>
                                <p style={{ fontSize: '0.68rem', opacity: 0.45, fontWeight: 600, lineHeight: 1.4 }}>
                                    {notifStatus === 'granted' ? "Real-time match alerts enabled for this device." : notifStatus === 'denied' ? "Please enable notifications in your browser's site settings." : "Enable push notifications to never miss a tournament call."}
                                </p>
                            </div>
                            {notifStatus !== 'granted' && notifStatus !== 'denied' && (
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-primary" 
                                    style={{ fontSize: '0.7rem', padding: '10px 18px', fontWeight: 900 }} 
                                    onClick={handleSyncNotifications}
                                >
                                    ACTIVATE
                                </motion.button>
                            )}
                        </div>

                        {notifStatus === 'granted' && (
                            <motion.button
                                whileHover={{ scale: 1.02, background: 'rgba(52,152,219,0.2)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSyncNotifications}
                                style={{ width: '100%', padding: '16px', background: 'rgba(52,152,219,0.15)', border: '1.5px solid rgba(52,152,219,0.3)', borderRadius: '16px', color: '#3498db', fontSize: '0.82rem', fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.3s' }}
                            >
                                🔄 RE-SYNC CLOUD IDENTITY
                            </motion.button>
                        )}
                    </div>
                </motion.div>

            </motion.div>
        </div>
    )
}
