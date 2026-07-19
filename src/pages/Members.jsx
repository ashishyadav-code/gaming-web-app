import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../utils/motion'
import { getMembers } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import MemberCard from '../components/MemberCard'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

export default function Members() {
    const { siteToken } = useAuth()
    const [members, setMembers] = useState([])
    const [status, setStatus] = useState('loading') // loading | success | error

    useEffect(() => {
        let cancelled = false
        setStatus('loading')
        getMembers(siteToken)
            .then(data => { if (!cancelled) { setMembers(data); setStatus('success') } })
            .catch(() => { if (!cancelled) setStatus('error') })
        return () => { cancelled = true }
    }, [siteToken])

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            style={{ padding: '24px 16px 16px', maxWidth: '480px', margin: '0 auto' }}
        >
            {/* Header */}
            <motion.div variants={fadeUp} style={{ marginBottom: '20px' }}>
                <h2 className="text-display" style={{ fontSize: '1.6rem', marginBottom: '4px' }}>
                    Guild Members
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.82rem' }}>
                    {status === 'success' ? `${members.length} member${members.length !== 1 ? 's' : ''} in SARKAR` : 'Loading roster...'}
                </p>
            </motion.div>

            {/* States */}
            {status === 'loading' && <LoadingState message="Loading members..." />}
            {status === 'error' && <ErrorState message="Couldn't load members right now. Please try again later." />}

            {/* Member grid */}
            {status === 'success' && members.length === 0 && (
                <motion.div variants={fadeUp} className="glass-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem' }}>
                        No members yet. Be the first to join!
                    </p>
                </motion.div>
            )}

            {status === 'success' && members.length > 0 && (
                <motion.div
                    variants={stagger}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}
                >
                    {members.map(m => <MemberCard key={m._id} member={m} />)}
                </motion.div>
            )}
        </motion.div>
    )
}
