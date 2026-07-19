import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.25 } }
}

export default function AdminLayout() {
    const location = useLocation()

    return (
        <div style={{ position: 'relative', minHeight: '100dvh' }}>
            <div className="bg-animate" aria-hidden="true" />
            <main style={{ position: 'relative', zIndex: 1, padding: '0' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={pageVariants}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    )
}
