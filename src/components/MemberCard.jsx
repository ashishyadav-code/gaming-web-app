import { motion } from 'framer-motion'
import { cardVariant } from '../utils/motion'

const roleBadgeClass = {
    leader: 'role-leader',
    'co-leader': 'role-co-leader',
    member: 'role-member',
    recruit: 'role-recruit',
}

export default function MemberCard({ member }) {
    const { name, uid, role } = member
    const badgeClass = roleBadgeClass[role?.toLowerCase()] || 'role-member'

    return (
        <motion.div 
            variants={cardVariant} 
            whileHover={{ 
                y: -6, 
                scale: 1.02,
                transition: { type: 'spring', stiffness: 400, damping: 25 }
            }}
            whileTap={{ scale: 0.98 }}
            className="glass-card" 
            style={{ padding: '20px', position: 'relative' }}
        >
            {/* Subtle Liquid Shimmer Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.01) 0%, transparent 100%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                {/* Avatar initial - Premium Liquid Core */}
                <div style={{
                    width: '48px', height: '48px', borderRadius: '15px',
                    background: 'linear-gradient(135deg, rgba(192,57,43,0.3) 0%, rgba(100,15,15,0.4) 100%)',
                    border: '1.5px solid rgba(192,57,43,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: 800, color: '#ff8a80',
                    fontFamily: 'Poppins, sans-serif',
                    flexShrink: 0,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(5px)'
                }}>
                    {name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span className={`role-badge ${badgeClass}`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{role}</span>
            </div>

            {/* Name */}
            <p style={{ 
                fontWeight: 700, 
                fontSize: '1rem', 
                marginBottom: '4px', 
                color: 'rgba(255,255,255,0.95)',
                position: 'relative',
                zIndex: 1
            }}>
                {name}
            </p>

            {/* UID */}
            <p style={{ 
                fontSize: '0.75rem', 
                color: 'rgba(255,255,255,0.3)', 
                fontFamily: 'monospace', 
                letterSpacing: '0.08em',
                position: 'relative',
                zIndex: 1
            }}>
                {uid}
            </p>

            {/* Premium bottom accent */}
            <motion.div 
                initial={{ width: '0%', opacity: 0 }}
                whileInView={{ width: 'calc(100% - 40px)', opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                    position: 'absolute', bottom: 0, left: '20px', height: '1.5px',
                    background: 'linear-gradient(90deg, transparent, rgba(192,57,43,0.4), transparent)',
                }} 
            />
        </motion.div>
    )
}
