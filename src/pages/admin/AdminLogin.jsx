import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { fadeUp, springTap } from '../../utils/motion'

const LockIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="3" ry="3" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
)

export default function AdminLogin() {
    const navigate = useNavigate()
    const { loginAdmin, adminAuthenticated } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [shake, setShake] = useState(false)

    useEffect(() => {
        if (adminAuthenticated) {
            navigate('/admin/dashboard', { replace: true })
        }
    }, [adminAuthenticated])

    if (adminAuthenticated) return null

    async function handleSubmit(e) {
        e.preventDefault()
        setError(''); setLoading(true)
        try {
            await loginAdmin(email, password)
            navigate('/admin/dashboard', { replace: true })
        } catch {
            setError('Invalid credentials. Access Denied.')
            setShake(true)
            setTimeout(() => setShake(false), 600)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100dvh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '24px', position: 'relative', overflow: 'hidden'
        }}>
            {/* Liquid Background Glow - Admin Specific (Darker/Saturated Red) */}
            <motion.div
                animate={{
                    x: ['20%', '-20%', '20%'],
                    y: ['10%', '-10%', '10%'],
                    opacity: [0.1, 0.2, 0.1],
                    scale: [1.2, 1, 1.2]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: 'fixed', top: '0', right: '0', width: '800px', height: '800px',
                    background: `radial-gradient(circle, rgba(192, 57, 43, 0.25) 0%, transparent 75%)`,
                    pointerEvents: 'none', zIndex: 0, filter: 'blur(120px)'
                }}
            />

            <motion.div
                className="glass-card glass-card-heavy glow-breathe"
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                style={{
                    width: '100%', maxWidth: '380px',
                    padding: '48px 32px', textAlign: 'center',
                    border: '1.5px solid rgba(192, 57, 43, 0.3)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                    animation: shake ? 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both' : undefined,
                    zIndex: 1
                }}
            >
                {/* Visual Lock Core */}
                <motion.div 
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    style={{
                        width: '72px', height: '72px', borderRadius: '22px',
                        background: 'linear-gradient(135deg, rgba(192,57,43,0.2) 0%, rgba(100,15,15,0.2) 100%)', 
                        border: '2px solid rgba(192,57,43,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 8px 24px rgba(192,57,43,0.25)',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <LockIcon />
                </motion.div>

                <h2 className="text-display" style={{ fontSize: '2rem', marginBottom: '4px', letterSpacing: '0.02em' }}>Admin Core</h2>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginBottom: '32px', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 900 }}>
                    SARKAR Restricted Access
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <input
                            type="email"
                            className="glass-input"
                            placeholder="ADMIN IDENTITY"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 800, padding: '16px', letterSpacing: '0.05em' }}
                        />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <input
                            type="password"
                            className="glass-input"
                            placeholder="ENCRYPTION KEY"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 800, padding: '16px', letterSpacing: '0.05em' }}
                        />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{ color: '#e74c3c', fontSize: '0.85rem', fontWeight: 800, textAlign: 'center', margin: '8px 0' }}
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-danger"
                        disabled={loading || !email || !password}
                        style={{ padding: '16px', fontSize: '1.1rem', fontWeight: 1000, letterSpacing: '0.1em', marginTop: '10px', boxShadow: '0 10px 30px rgba(192,57,43,0.3)' }}
                    >
                        {loading ? 'AUTHORIZING...' : 'BYPASS FIREWALL'}
                    </motion.button>
                </form>
            </motion.div>

            <style>{`
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
            `}</style>
        </div>
    )
}
