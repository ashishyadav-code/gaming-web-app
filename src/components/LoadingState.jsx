import { motion } from 'framer-motion'

export default function LoadingState({ message = 'Loading...' }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            gap: '24px',
            position: 'relative'
        }}>
            {/* Liquid Dual Pulse Rings */}
            <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                <motion.div
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.3, 0.7, 0.3],
                        borderRadius: ["40% 60% 60% 40%", "60% 40% 40% 60%", "40% 60% 60% 40%"]
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        border: '2px solid var(--accent)',
                        filter: 'blur(1px)'
                    }}
                />
                <motion.div
                    animate={{
                        scale: [1.2, 0.8, 1.2],
                        opacity: [0.5, 0.2, 0.5],
                        borderRadius: ["60% 40% 40% 60%", "40% 60% 60% 40%", "60% 40% 40% 60%"]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        position: 'absolute',
                        inset: 4,
                        border: '1.5px solid rgba(255,255,255,0.1)',
                        filter: 'blur(0.5px)'
                    }}
                />
                
                {/* Inner Core */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        position: 'absolute',
                        inset: '22px',
                        background: 'var(--accent)',
                        borderRadius: '50%',
                        boxShadow: '0 0 15px var(--accent)'
                    }}
                />
            </div>

            <motion.p 
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ 
                    color: 'rgba(255,255,255,0.5)', 
                    fontSize: '0.82rem', 
                    fontWeight: 700, 
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                }}
            >
                {message}
            </motion.p>
        </div>
    )
}
