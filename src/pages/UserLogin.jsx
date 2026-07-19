import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useUserAuth } from '../context/UserAuthContext'
import toast from 'react-hot-toast'
import LoadingState from '../components/LoadingState'
import { fadeUp, springTap } from '../utils/motion'

export default function UserLogin() {
    const [uuid, setUuid] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const { login, loading } = useUserAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        if (!uuid.trim()) return toast.error('Enter your Secret UUID')

        const res = await login(uuid.trim())
        if (res.success) {
            toast.success('Access Granted')
            navigate('/')
        } else {
            toast.error(res.error || 'Access Denied: Invalid UUID')
        }
    }

    if (loading) return <LoadingState message="Verifying Identity..." />

    return (
        <div style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#0a0a0a', overflow: 'hidden' }}>
            {/* Liquid Background Glow */}
            <motion.div
                animate={{
                    x: ['-10%', '10%', '-10%'],
                    y: ['-5%', '5%', '-5%'],
                    opacity: [0.15, 0.25, 0.15],
                    scale: [1, 1.2, 1]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: 'fixed', top: '-10%', left: '10%', width: '600px', height: '600px',
                    background: `radial-gradient(circle, rgba(192, 57, 43, 0.2) 0%, transparent 70%)`,
                    pointerEvents: 'none', zIndex: 0, filter: 'blur(100px)'
                }}
            />

            <main style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <motion.div 
                    initial="hidden" 
                    animate="visible" 
                    variants={fadeUp} 
                    className="glass-card glass-card-heavy glow-breathe" 
                    style={{ width: '100%', maxWidth: '400px', padding: '50px 32px', textAlign: 'center', border: '1.5px solid rgba(255,255,255,0.1)' }}
                >
                    <div style={{ marginBottom: '40px' }}>
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                            style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto' }}
                        >
                            <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,57,43,0.3) 0%, transparent 70%)', filter: 'blur(15px)', zIndex: 0 }} />
                            <img src="/logo.png" alt="Sarkar" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                        </motion.div>
                        <h1 className="text-display text-accent" style={{ fontSize: '2.5rem', marginTop: '20px', marginBottom: '6px', letterSpacing: '0.05em' }}>SARKAR</h1>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 900 }}>Authorized Access Only</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '10px', display: 'block', letterSpacing: '0.1em', fontWeight: 900, textTransform: 'uppercase', paddingLeft: '4px' }}>SECRET IDENTITY KEY</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="glass-input"
                                    placeholder="•••• •••• ••••"
                                    value={uuid}
                                    onChange={e => setUuid(e.target.value)}
                                    style={{ textAlign: 'center', letterSpacing: '0.15em', fontSize: '1.4rem', padding: '18px', paddingRight: '56px', fontWeight: 900, background: 'rgba(0,0,0,0.3)' }}
                                    autoFocus
                                />
                                <motion.button
                                    type="button"
                                    whileTap={{ scale: 0.8 }}
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        padding: '8px'
                                    }}
                                >
                                    {showPassword ? (
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    ) : (
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                        <motion.button 
                            type="submit" 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="btn-primary" 
                            style={{ padding: '18px', fontSize: '1.1rem', marginTop: '10px', letterSpacing: '0.15em', fontWeight: 1000, boxShadow: '0 10px 30px rgba(192,57,43,0.3)' }} 
                            disabled={loading}
                        >
                            {loading ? 'VERIFYING...' : 'INITIATE LOGIN'}
                        </motion.button>
                    </form>

                    <div style={{ marginTop: '32px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginTop: '24px', fontWeight: 700, letterSpacing: '0.05em' }}>LOGIN SESSION SECURED FOR 7 DAYS</p>
                </motion.div>
            </main>
        </div>
    )
}
