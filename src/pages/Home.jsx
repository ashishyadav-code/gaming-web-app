import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { fadeUp, stagger, springTap } from '../utils/motion'
import { getScrims, getSettings } from '../utils/api'
import { useUserAuth } from '../context/UserAuthContext'
import toast from 'react-hot-toast'
const logo = '/logo.png'

const TrophyIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffeb3b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
)

const ArrowIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
)


export default function Home() {
    const navigate = useNavigate()
    const { user } = useUserAuth()
    const [scrims, setScrims] = useState([])
    const [settings, setSettings] = useState(null)
    const [showPoster, setShowPoster] = useState(true)
    const [panelExpanded, setPanelExpanded] = useState(false)


    useEffect(() => {
        getScrims().then(setScrims).catch(() => { })
        getSettings().then(setSettings).catch(() => { })
    }, [])

    const stats = [
        { label: 'Members', value: '10+' },
        { label: 'Rank', value: '#1' },
        { label: 'Founded by', value: 'ASHISH' }
    ]

    return (
        <div style={{ position: 'relative', minHeight: '100dvh', overflowX: 'hidden' }}>
            {/* Liquid Background Glow - Enhanced for iOS 26 feel */}
            <motion.div
                animate={{
                    x: ['-20%', '30%', '-20%'],
                    y: ['-10%', '10%', '-10%'],
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.3, 1]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'fixed',
                    top: '-10%',
                    left: '20%',
                    width: '700px',
                    height: '700px',
                    background: `radial-gradient(circle, rgba(192, 57, 43, 0.15) 0%, transparent 70%)`,
                    pointerEvents: 'none',
                    zIndex: 0,
                    filter: 'blur(80px)'
                }}
            />

            {/* Top User Profile Shortcut - Liquid Glass Styled */}
            {user && (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.08)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                        position: 'absolute', top: '20px', left: '20px', zIndex: 100, 
                        display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', 
                        background: 'rgba(0,0,0,0.4)', padding: '8px 16px 8px 8px', borderRadius: '30px', 
                        backdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }} 
                    onClick={() => navigate('/profile')}
                >
                    <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        background: 'linear-gradient(135deg, var(--accent) 0%, #9b2335 100%)', 
                        border: '1.5px solid rgba(255,255,255,0.2)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontWeight: 900, color: '#fff', fontSize: '0.9rem',
                        boxShadow: '0 0 10px rgba(192,57,43,0.3)'
                    }}>
                        {user.name.charAt(0)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.6rem', opacity: 0.4, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{user.role}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>{user.name}</span>
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {settings?.posterEnabled && settings?.posterUrl && showPoster && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px) saturate(150%)', padding: '20px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.8, y: 30, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                            style={{ position: 'relative', width: '100%', maxWidth: '480px' }}
                        >
                            <button
                                onClick={() => setShowPoster(false)}
                                style={{
                                    position: 'absolute', top: '12px', right: '12px',
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'rgba(231,76,60,0.9)', color: 'white', border: '1px solid rgba(255,255,255,0.2)',
                                    fontSize: '1rem', fontWeight: 900, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 8px 24px rgba(231,76,60,0.4)', zIndex: 10,
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                ✕
                            </button>
                            <img
                                src={settings.posterUrl}
                                alt="Welcome Poster"
                                style={{
                                    width: '100%', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)',
                                    boxShadow: '0 30px 60px rgba(0,0,0,0.6)', objectFit: 'cover'
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                style={{ padding: '40px 16px 120px', maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 1 }}
            >
                {/* Seed Mastery Shortcut */}
                {user && (
                    <motion.div 
                        variants={fadeUp}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/seed')}
                        className="glass-card glow-breathe"
                        style={{ padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', border: '1.5px solid rgba(52, 152, 219, 0.3)', background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.05) 100%)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ fontSize: '1.5rem' }}>📚</div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', letterSpacing: '0.05em' }}>STUDY MODE</h3>
                                <p style={{ fontSize: '0.65rem', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>Focus on your goals</p>
                            </div>
                        </div>
                        <div style={{ color: '#3498db', fontWeight: 900 }}>ENTER →</div>
                    </motion.div>
                )}

                {/* AI Home Panel - Liquid glass treatment */}
                {settings?.homePageAiPanel?.visible && settings?.homePageAiPanel?.content && (
                    <motion.div
                        variants={fadeUp}
                        className="glass-card"
                        style={{
                            marginBottom: '20px',
                            background: 'linear-gradient(135deg, rgba(192, 57, 43, 0.1) 0%, rgba(192, 57, 43, 0.05) 100%)',
                            border: '1.5px solid rgba(192, 57, 43, 0.3)',
                            boxShadow: '0 12px 40px rgba(192, 57, 43, 0.15)',
                            overflow: 'hidden'
                        }}
                    >
                        <motion.div
                            whileHover={{ background: 'rgba(192, 57, 43, 0.12)' }}
                            style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            onClick={() => setPanelExpanded(!panelExpanded)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div className="pulse" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#e74c3c', boxShadow: '0 0 15px #e74c3c' }} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span className="text-display" style={{ fontSize: '1rem', color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                        {settings.homePageAiPanel.title || "LATEST NEWS"}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 700 }}>PREMIUM UPDATE • TAP TO REVEAL</span>
                                </div>
                            </div>
                            <motion.span
                                animate={{ rotate: panelExpanded ? 180 : 0, scale: panelExpanded ? 1.2 : 1 }}
                                style={{ fontSize: '0.8rem', opacity: 0.4, fontWeight: 900 }}
                            >
                                ↓
                            </motion.span>
                        </motion.div>

                        <AnimatePresence>
                            {panelExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, y: -10 }}
                                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                                    exit={{ height: 0, opacity: 0, y: -10 }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}
                                >
                                    <div style={{ paddingTop: '20px', fontSize: '0.92rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, fontFamily: 'Inter, sans-serif' }}>
                                        {settings.homePageAiPanel.content}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Hero Section - The "WOW" Factor */}
                <motion.div
                    variants={fadeUp}
                    className="glass-card glass-card-heavy"
                    style={{ padding: '48px 28px 40px', marginBottom: '20px', textAlign: 'center', overflow: 'visible' }}
                >
                    {/* Hero Logo with Liquid Glow Core */}
                    <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 32px' }}>
                        <motion.div
                            animate={{
                                scale: [1, 1.15, 1],
                                opacity: [0.4, 0.7, 0.4]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                                position: 'absolute', inset: -15, borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(192,57,43,0.35) 0%, transparent 70%)',
                                filter: 'blur(25px)', zIndex: 0
                            }}
                        />
                        <motion.img
                            src={logo}
                            alt="SARKAR LOGO"
                            initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            whileHover={{ scale: 1.08, rotate: 2 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            style={{
                                width: '100%', height: '100%', borderRadius: '50%',
                                border: '2.5px solid rgba(255,255,255,0.15)',
                                position: 'relative', zIndex: 1,
                                filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.5))',
                                objectFit: 'cover'
                            }}
                        />
                    </div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-display text-accent" 
                        style={{ fontSize: '3.5rem', marginBottom: '4px', textShadow: '0 10px 30px rgba(192,57,43,0.3)' }}
                    >
                        SARKAR
                    </motion.h1>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '32px', fontWeight: 700 }}>777 Guild • International</p>

                    <div style={{ height: '1px', marginBottom: '32px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />

                    {/* Action Grid - High-Physics Spring Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.96 }} className="btn-primary" onClick={() => navigate('/stats')}>Statistics</motion.button>
                        <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.96 }} className="btn-ghost" onClick={() => navigate('/tournaments')}>Tournaments</motion.button>
                        <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.96 }} className="btn-ghost" onClick={() => navigate('/stats?tab=scrim')} style={{ color: '#ffc107', borderColor: 'rgba(255,193,7,0.3)', background: 'rgba(255,193,7,0.03)' }}>INTL CLASH</motion.button>
                        <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.96 }} className="btn-ghost" onClick={() => navigate('/members')} style={{ gap: '10px' }}>Our Roster <ArrowIcon /></motion.button>
                    </div>
                </motion.div>

                {/* International Matches Highlight */}
                {scrims.length > 0 && (
                    <motion.div variants={fadeUp} style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingLeft: '8px' }}>
                            <TrophyIcon />
                            <h3 style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.15em', opacity: 0.4, color: '#ffeb3b', textTransform: 'uppercase' }}>GLOBAL DOMINATION</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {scrims.slice(0, 2).map(s => (
                                <motion.div 
                                    key={s._id} 
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate('/stats?tab=scrim')} 
                                    className="glass-card" 
                                    style={{ padding: '18px 24px', background: 'rgba(255,193,7,0.05)', border: '1px solid rgba(255,193,7,0.2)', cursor: 'pointer', transition: 'box-shadow 0.3s' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>{s.title}</p>
                                            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>vs {s.opponent} • {s.date}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 950, color: '#ffc107', background: 'rgba(255,193,7,0.15)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,193,7,0.3)' }}>VICTORY</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Stats Row - Mini Glass Panels */}
                <motion.div
                    variants={fadeUp}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}
                >
                    {stats.map(({ label, value }) => (
                        <motion.div 
                            key={label}
                            whileHover={{ scale: 1.05, y: -4, background: 'rgba(255,255,255,0.06)' }}
                            className="glass-card" 
                            style={{ padding: '22px 12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900, fontSize: '1.6rem', color: '#e74c3c', marginBottom: '4px', lineHeight: 1, textShadow: '0 4px 10px rgba(192,57,43,0.3)' }}>{value}</p>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Footer Signature - iOS 26 style glass accent */}
                <motion.div variants={fadeUp} style={{ textAlign: 'center', marginTop: '60px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '32px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <motion.span 
                            whileHover={{ scale: 1.1, color: '#fff' }}
                            style={{ 
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)', 
                                padding: '10px 24px', borderRadius: '40px', 
                                border: '1.5px solid rgba(255,255,255,0.1)', 
                                color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', 
                                fontWeight: 800, letterSpacing: '0.1em',
                                backdropFilter: 'blur(10px)',
                                cursor: 'default'
                            }}
                        >
                            CRAFTED BY <span style={{ color: 'var(--accent)' }}>ASHISH</span>
                        </motion.span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1, opacity: 1, color: 'var(--accent)' }}
                        onClick={() => navigate('/admin/login')}
                        style={{
                            background: 'none', border: 'none', color: '#c0392b',
                            fontSize: '0.75rem', cursor: 'pointer', textTransform: 'uppercase',
                            letterSpacing: '0.2em', fontWeight: 950, opacity: 0.5,
                            transition: 'all 0.3s var(--ease-smooth)'
                        }}
                    >
                        Admin Access
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    )
}

