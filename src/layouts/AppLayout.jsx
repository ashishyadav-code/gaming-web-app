import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BottomNav from '../components/BottomNav'
import NotificationPrompt from '../components/NotificationPrompt'

const pageVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15, ease: 'easeIn' } }
}

export default function AppLayout() {
    const location = useLocation()

    return (
        <div style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
            {/* Animated gradient background */}
            <div className="bg-animate" aria-hidden="true" />

            {/* Main content area with smooth page transitions */}
            <main style={{
                flex: 1,
                position: 'relative',
                zIndex: 1,
                paddingBottom: '80px',
            }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={pageVariants}
                        style={{ minHeight: '100%' }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            <BottomNav />
            <NotificationPrompt />
        </div>
    )
}
