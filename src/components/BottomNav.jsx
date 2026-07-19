import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

// SVG Icons
function HomeIcon({ active }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}

function MembersIcon({ active }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

function StatsIcon({ active }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    )
}

function TournamentsIcon({ active }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <rect x="6" y="4" width="12" height="10" rx="2" />
        </svg>
    )
}

function JoinIcon({ active }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    )
}

const navItems = [
    { name: 'Home', path: '/', icon: (active) => <HomeIcon active={active} /> },
    { name: 'Members', path: '/members', icon: (active) => <MembersIcon active={active} /> },
    { name: 'Join', path: '/join', icon: (active) => <JoinIcon active={active} />, isAction: true },
    { name: 'Stats', path: '/stats', icon: (active) => <StatsIcon active={active} /> },
    { name: 'Events', path: '/tournaments', icon: (active) => <TournamentsIcon active={active} /> },
]

export default function BottomNav() {
    const location = useLocation()

    if (location.pathname === '/seed') return null;

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            background: 'rgba(5,5,5,0.85)',
            backdropFilter: 'blur(32px) saturate(150%)',
            WebkitBackdropFilter: 'blur(32px) saturate(150%)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '0 8px',
            paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
            {navItems.map(({ path, name, icon, isAction }) => {
                const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

                return (
                    <NavLink
                        key={path}
                        to={path}
                        end={path === '/'}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: isAction ? '0' : '5px',
                            color: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                            textDecoration: 'none',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            flex: 1,
                            position: 'relative',
                            height: '100%',
                            WebkitTapHighlightColor: 'transparent',
                        }}
                    >
                        {isAction ? (
                            <motion.div
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    y: isActive ? -12 : -8,
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '50%',
                                    background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: isActive ? 'white' : 'var(--accent)',
                                    boxShadow: isActive ? '0 8px 24px rgba(192,57,43,0.4)' : 'none',
                                    border: '1px solid rgba(192,57,43,0.2)',
                                }}
                            >
                                {icon(isActive)}
                            </motion.div>
                        ) : (
                            <>
                                <motion.div
                                    animate={{ scale: isActive ? 1.15 : 1 }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                                >
                                    {icon(isActive)}
                                </motion.div>
                                <motion.span
                                    animate={{
                                        opacity: isActive ? 1 : 0.7,
                                        y: isActive ? -1 : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {name}
                                </motion.span>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-glow"
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        style={{
                                            position: 'absolute',
                                            bottom: '8px',
                                            width: '4px',
                                            height: '4px',
                                            borderRadius: '50%',
                                            background: 'var(--accent)',
                                            boxShadow: '0 0 10px var(--accent)',
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                )
            })}
        </nav>
    )
}
