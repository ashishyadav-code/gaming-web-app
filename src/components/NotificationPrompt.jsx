import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp } from '../utils/motion'
import { sendBrowserNotification } from '../utils/notifications'
import { useUserAuth } from '../context/UserAuthContext'
import { savePushSubscription } from '../utils/api'
import toast from 'react-hot-toast'

// This public key must match the one in your .env VAPID_PUBLIC_KEY
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export default function NotificationPrompt() {
    const [show, setShow] = useState(false)
    const { user, token, loading: authLoading } = useUserAuth()

    useEffect(() => {
        if (!authLoading && token && 'Notification' in window && Notification.permission === 'default') {
            const timer = setTimeout(() => setShow(true), 2000)
            return () => clearTimeout(timer)
        }
    }, [authLoading, token])

    const handleAction = async (wantEnable) => {
        if (!wantEnable) { setShow(false); return }

        try {
            const permission = await Notification.requestPermission()
            setShow(false)

            if (permission !== 'granted') return

            // Immediately show a local welcome notification
            sendBrowserNotification('SARKAR HQ Alerts', {
                body: 'Push notifications enabled! You will receive tournament updates here.'
            })

            // Register push subscription via Service Worker (for real push when browser is closed)
            if ('serviceWorker' in navigator && VAPID_PUBLIC_KEY && user) {
                try {
                    console.log('Registering push subscription for:', user.uid)
                    const reg = await navigator.serviceWorker.ready
                    const subscription = await reg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                    })

                    if (!token) {
                        console.error('Subscription failed: siteToken is missing from auth context')
                        return
                    }

                    console.log('Saving subscription to DB for UID:', user.uid, 'MemberID:', user._id)
                    // Save subscription to backend so admin can push to this device
                    const res = await savePushSubscription(user.uid, subscription.toJSON(), token, user._id)
                    if (res.ok) {
                        console.log('Push subscription saved successfully to DB.')
                        toast.success('Notifications Synced to SARKAR DB! 🔥')
                    } else {
                        console.error('Failed to save subscription to DB:', res)
                        toast.error('DB Sync Failed: ' + (res.error || 'Unknown error'))
                    }
                } catch (subErr) {
                    console.error('Push subscription failed:', subErr)
                    toast.error('Notification sync failed: ' + subErr.message)
                }
            }
        } catch (err) {
            console.error('Notification setup error:', err)
            setShow(false)
        }
    }

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '24px'
                    }}
                >
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="glass-card"
                        style={{
                            maxWidth: '380px', width: '100%', padding: '32px 24px',
                            textAlign: 'center', position: 'relative', overflow: 'hidden',
                            border: '1px solid rgba(231,76,60,0.5)',
                            background: 'rgba(10,10,10,0.95)'
                        }}
                    >
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(192,57,43,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />

                        <div className="pulse" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(231, 76, 60, 0.1)', border: '2px solid rgba(231, 76, 60, 0.5)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e74c3c' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                        </div>

                        <h3 className="text-display" style={{ fontSize: '1.4rem', marginBottom: '8px', color: '#fff' }}>Enable Alerts</h3>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: '24px' }}>
                            Get instant push notifications straight to your device for upcoming tournaments, scrim matches, and guild updates — even when the app is closed.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button className="btn-primary" onClick={() => handleAction(true)} style={{ padding: '14px', fontSize: '0.8rem', letterSpacing: '0.1em' }}>ENABLE ALERTS</button>
                            <button className="btn-ghost" onClick={() => handleAction(false)} style={{ padding: '14px', fontSize: '0.8rem', opacity: 0.6 }}>LATER</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}


