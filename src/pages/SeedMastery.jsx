import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useUserAuth } from '../context/UserAuthContext'
import { updateStudyTasks } from '../utils/api'
import toast from 'react-hot-toast'
import HomeIcon from '../components/BottomNav' // We won't use bottom nav, just keeping structure self-contained

function TypewriterIntro({ onComplete }) {
    const fullText = "Hi, I am Ashish Yadav, a Machine Learning Engineer and Developer. You all know me as in-game name - Hashirama.\n\nIf you are losing focus and can't manage consistency, then use this Study Mode to track your daily goals and stay on the path."
    const [displayedText, setDisplayedText] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (currentIndex < fullText.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + fullText[currentIndex])
                setCurrentIndex(c => c + 1)
            }, 45) // Typist speed
            return () => clearTimeout(timeout)
        }
    }, [currentIndex, fullText.length, fullText])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                background: '#050505', color: '#10b981',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '30px', fontFamily: 'monospace', overflow: 'hidden'
            }}
        >
            <div style={{ maxWidth: '650px', width: '100%', whiteSpace: 'pre-wrap', fontSize: '1.2rem', lineHeight: 1.8, textShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}>
                {displayedText}
                {currentIndex < fullText.length && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>_</motion.span>}
            </div>
            {currentIndex >= fullText.length && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onComplete}
                    style={{
                        marginTop: '50px', padding: '14px 32px', background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981', border: '1.5px solid #10b981', borderRadius: '12px',
                        cursor: 'pointer', fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 'bold'
                    }}
                >
                    INITIATE STUDY MODE
                </motion.button>
            )}

            {/* Background Matrix-like glow */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.05) 0%, transparent 60%)', pointerEvents: 'none', zIndex: -1 }} />
        </motion.div>
    )
}

export default function SeedMastery() {
    const navigate = useNavigate()
    const { user } = useUserAuth()

    // Core State
    const [showIntro, setShowIntro] = useState(false)
    const [tasks, setTasks] = useState(user?.studyTasks || [])

    // Inputs
    const [subject, setSubject] = useState('')
    const [hours, setHours] = useState('')
    const [minutes, setMinutes] = useState('')
    const [saving, setSaving] = useState(false)

    // Editing State
    const [editingId, setEditingId] = useState(null)
    const [editSubject, setEditSubject] = useState('')
    const [editHours, setEditHours] = useState('')
    const [editMinutes, setEditMinutes] = useState('')

    // Live Timer State
    const [activeTimerId, setActiveTimerId] = useState(null)
    const [timerSeconds, setTimerSeconds] = useState(0)
    const [showAddModal, setShowAddModal] = useState(false)

    // Manual Log State
    const [loggingId, setLoggingId] = useState(null)
    const [logHours, setLogHours] = useState('')
    const [logMinutes, setLogMinutes] = useState('')

    // Streak State (Mocked from user meta or local cache)
    const [streak, setStreak] = useState(user?.studyStreak || 0)

    useEffect(() => {
        if (!user) { navigate('/login'); return; }

        // Simple streak logic placeholder
        const lastStudy = localStorage.getItem('last_study_date')
        const today = new Date().toDateString()
        if (lastStudy !== today) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            if (lastStudy === yesterday.toDateString()) {
                // Streak logic here
            }
        }

        const hasSeenIntro = localStorage.getItem('seed_intro_seen')
        if (!hasSeenIntro) {
            setShowIntro(true)
        }
    }, [user, navigate])

    const handleIntroComplete = () => {
        localStorage.setItem('seed_intro_seen', 'true')
        setShowIntro(false)
    }

    // Timer Logic
    useEffect(() => {
        let interval = null
        if (activeTimerId) {
            interval = setInterval(() => {
                setTimerSeconds(s => s + 1)
            }, 1000)
        } else {
            clearInterval(interval)
        }
        return () => clearInterval(interval)
    }, [activeTimerId])

    const toggleLiveTimer = (e, id) => {
        e.stopPropagation()
        if (activeTimerId === id) {
            setActiveTimerId(null)
        } else {
            setActiveTimerId(id)
            setTimerSeconds(0) // Start fresh focus session
        }
    }

    const formatLiveTimer = (totalSecs) => {
        const h = Math.floor(totalSecs / 3600)
        const m = Math.floor((totalSecs % 3600) / 60)
        const s = totalSecs % 60
        const pad = (num) => num.toString().padStart(2, '0')
        if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
        return `${pad(m)}:${pad(s)}`
    }

    const startManualLog = (e, task) => {
        e.stopPropagation()
        setLoggingId(task.id)
        setLogHours('')
        setLogMinutes('')
    }

    const saveManualLog = async (id) => {
        const task = tasks.find(t => t.id === id)
        if (!task) return

        let addMins = (Number(logHours) || 0) * 60 + (Number(logMinutes) || 0)
        let totalCurrentMins = (task.loggedHours || 0) * 60 + (task.loggedMinutes || 0)
        let newTotalMins = totalCurrentMins + addMins

        let targetMins = task.hours * 60 + task.minutes
        let isCompleted = newTotalMins >= targetMins

        const updated = tasks.map(t =>
            t.id === id
                ? {
                    ...t,
                    loggedHours: Math.floor(newTotalMins / 60),
                    loggedMinutes: newTotalMins % 60,
                    completed: isCompleted
                }
                : t
        )
        setTasks(updated)
        setLoggingId(null)
        await saveTasks(updated)
    }

    const cancelManualLog = () => {
        setLoggingId(null)
    }

    // Calculations
    const totalMinutes = tasks.reduce((acc, t) => acc + ((Number(t.hours) || 0) * 60) + (Number(t.minutes) || 0), 0)
    const completedMinutes = tasks.reduce((acc, t) => {
        if (t.completed) return acc + ((Number(t.hours) || 0) * 60) + (Number(t.minutes) || 0) // Full credit if marked complete
        return acc + ((Number(t.loggedHours) || 0) * 60) + (Number(t.loggedMinutes) || 0)
    }, 0)

    const formatTime = (totalMins) => {
        const h = Math.floor(totalMins / 60)
        const m = totalMins % 60
        if (h > 0 && m > 0) return `${h}h ${m}m`
        if (h > 0) return `${h}h`
        return `${m}m`
    }

    const handleAddTask = async (e) => {
        e.preventDefault()
        if (!subject || (!hours && !minutes)) {
            toast.error("Please provide subject and time.")
            return
        }

        const newTask = {
            id: Date.now(),
            subject,
            hours: Number(hours) || 0,
            minutes: Number(minutes) || 0,
            loggedHours: 0,
            loggedMinutes: 0,
            completed: false
        }
        const updated = [...tasks, newTask]
        setTasks(updated)
        setSubject('')
        setHours('')
        setMinutes('')
        setShowAddModal(false)
        await saveTasks(updated)
    }

    const toggleTask = async (id) => {
        if (editingId) return // Prevent toggling while editing
        const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
        setTasks(updated)
        await saveTasks(updated)
    }

    const deleteTask = async (e, id) => {
        e.stopPropagation()
        const updated = tasks.filter(t => t.id !== id)
        setTasks(updated)
        await saveTasks(updated)
    }

    const startEdit = (e, task) => {
        e.stopPropagation()
        setEditingId(task.id)
        setEditSubject(task.subject)
        setEditHours(task.hours === 0 ? '' : task.hours)
        setEditMinutes(task.minutes === 0 ? '' : task.minutes)
    }

    const saveEdit = async (id) => {
        if (!editSubject || (!editHours && !editMinutes)) {
            toast.error("Please provide subject and time.")
            return
        }
        const updated = tasks.map(t =>
            t.id === id
                ? { ...t, subject: editSubject, hours: Number(editHours) || 0, minutes: Number(editMinutes) || 0 }
                : t
        )
        setTasks(updated)
        setEditingId(null)
        await saveTasks(updated)
    }

    const cancelEdit = () => {
        setEditingId(null)
    }

    const saveTasks = async (updated) => {
        setSaving(true)
        try {
            await updateStudyTasks(user._id, updated)
        } catch {
            toast.error('Failed to sync study data.')
        } finally {
            setSaving(false)
        }
    }

    if (!user) return null

    return (
        <div className="liquid-root">
            <AnimatePresence>
                {showIntro && <TypewriterIntro onComplete={handleIntroComplete} />}
            </AnimatePresence>

            <div className="liquid-container">
                {/* Header Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className="resp-header">
                    <div>
                        <h1 className="resp-title" style={{ fontSize: '2rem', fontWeight: 800, color: 'white', letterSpacing: '0.05em' }}>STUDY MODE</h1>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Stay consistent. Stay focused.</p>
                    </div>
                    <button
                        className="btn-glass resp-nav-btn"
                        onClick={() => navigate('/')}
                        style={{ padding: '10px 16px', fontSize: '0.85rem', fontWeight: 'bold' }}
                    >
                        ← SARKAR
                    </button>
                </div>

                {/* Progress Overview Glass Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="liquid-glass"
                    style={{ marginBottom: '2rem', textAlign: 'center', padding: '2rem', cursor: 'pointer' }}
                >
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Daily Focus Time</p>
                    <div style={{ margin: '1rem 0' }}>
                        <span className="resp-metric" style={{ fontSize: '3.5rem', fontWeight: 900, color: 'white' }}>{formatTime(completedMinutes)}</span>
                        <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}> / {formatTime(totalMinutes)}</span>
                    </div>

                    {/* Streak Info */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '15px', width: 'fit-content', margin: '0 auto 1.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>🔥</span>
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>{streak} DAY STREAK</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${totalMinutes > 0 ? (completedMinutes / totalMinutes) * 100 : 0}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, #4ecdc4, #ff6b6b)', borderRadius: '10px' }}
                        />
                    </div>
                </motion.div>

                {/* Tasks Dashboard Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingLeft: '0.5rem', marginTop: '1rem' }}>
                    <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 600 }}>Tasks Dashboard</h3>
                </div>

                {/* Tasks List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '6rem' }}>
                    <AnimatePresence>
                        {tasks.length === 0 && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem 0' }}>
                                No subjects added yet. Start planning!
                            </motion.p>
                        )}
                        {tasks.map(t => (
                            <motion.div
                                key={t.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: t.completed && editingId !== t.id ? 0.6 : 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                className="liquid-glass"
                                style={{
                                    padding: '1.25rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    border: t.completed ? '1px solid rgba(78, 205, 196, 0.5)' : '1px solid rgba(255, 255, 255, 0.4)',
                                    background: t.completed ? 'rgba(78, 205, 196, 0.1)' : 'rgba(255, 255, 255, 0.03)'
                                }}
                            >
                                {editingId === t.id ? (
                                    // Edit Mode
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        <input className="liquid-input action-input" value={editSubject} onChange={e => setEditSubject(e.target.value)} placeholder="Subject" />
                                        <div style={{ display: 'flex', gap: '0.8rem' }} className="resp-inputs">
                                            <input type="number" className="liquid-input action-input" value={editHours} onChange={e => setEditHours(e.target.value)} placeholder="Hrs" style={{ flex: 1, minWidth: 0 }} />
                                            <input type="number" className="liquid-input action-input" value={editMinutes} onChange={e => setEditMinutes(e.target.value)} placeholder="Mins" style={{ flex: 1, minWidth: 0 }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                            <button onClick={cancelEdit} className="btn-glass" style={{ padding: '6px 14px', fontSize: '0.8rem', margin: 0 }}>Cancel</button>
                                            <button onClick={() => saveEdit(t.id)} className="btn-glass" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'rgba(78, 205, 196, 0.4)', margin: 0 }}>Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="resp-task-row">
                                        <div
                                            style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, cursor: 'pointer' }}
                                            onClick={() => toggleTask(t.id)}
                                        >
                                            <div style={{
                                                width: '28px', height: '28px', borderRadius: '8px',
                                                border: '2px solid rgba(255,255,255,0.6)',
                                                background: t.completed ? '#4ecdc4' : 'rgba(0,0,0,0.2)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.3s', flexShrink: 0
                                            }}>
                                                {t.completed && <span style={{ color: 'white', fontWeight: 'bold' }}>✓</span>}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <h4 style={{ color: 'white', fontSize: '1.15rem', textDecoration: t.completed ? 'line-through' : 'none', wordBreak: 'break-word', marginBottom: '2px' }}>
                                                    {t.subject}
                                                </h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                                        {formatTime((t.loggedHours * 60 || 0) + (t.loggedMinutes || 0))} / {formatTime((t.hours * 60) + t.minutes)} Goal
                                                    </p>
                                                    {activeTimerId === t.id && (
                                                        <motion.span
                                                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                                            style={{
                                                                background: 'linear-gradient(90deg, #ff6b6b, #ee5253)',
                                                                color: 'white',
                                                                padding: '4px 12px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 'bold',
                                                                boxShadow: '0 0 15px rgba(255, 107, 107, 0.4)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}
                                                        >
                                                            <span className="pulse-dot"></span>
                                                            {formatLiveTimer(timerSeconds)}
                                                        </motion.span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="task-action-buttons" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={(e) => startManualLog(e, t)}
                                                className="icon-btn"
                                                title="Log Time"
                                                style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.4)' }}
                                            >
                                                ⏱️
                                            </button>
                                            <button
                                                onClick={(e) => toggleLiveTimer(e, t.id)}
                                                className="icon-btn"
                                                style={{ background: activeTimerId === t.id ? 'rgba(255, 107, 107, 0.05)' : 'rgba(255,255,255,0.1)', borderColor: activeTimerId === t.id ? '#ff6b6b' : 'rgba(255,255,255,0.2)' }}
                                                title={activeTimerId === t.id ? "Stop Timer" : "Start Live Timer"}
                                            >
                                                {activeTimerId === t.id ? '⏹️' : '▶️'}
                                            </button>
                                            <button onClick={(e) => startEdit(e, t)} className="icon-btn" title="Edit">✏️</button>
                                            <button onClick={(e) => deleteTask(e, t.id)} className="icon-btn" title="Delete">🗑️</button>
                                        </div>

                                    </div>
                                )}

                                <AnimatePresence>
                                    {loggingId === t.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{ overflow: 'hidden', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}
                                        >
                                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Log Progress Time:</p>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input type="number" className="liquid-input action-input" value={logHours} onChange={e => setLogHours(e.target.value)} placeholder="0 Hrs" style={{ flex: 1, minWidth: 0 }} />
                                                <input type="number" className="liquid-input action-input" value={logMinutes} onChange={e => setLogMinutes(e.target.value)} placeholder="15 Mins" style={{ flex: 1, minWidth: 0 }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.8rem' }}>
                                                <button onClick={cancelManualLog} className="btn-glass" style={{ padding: '6px 14px', fontSize: '0.8rem', margin: 0 }}>Cancel</button>
                                                <button onClick={() => saveManualLog(t.id)} className="btn-glass" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'rgba(78, 205, 196, 0.4)', margin: 0 }}>Log Time</button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Floating Action Button */}
            <motion.button
                className="fab-btn"
                onClick={() => setShowAddModal(true)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.8, rotate: -45 }}
                transition={{ type: "spring", stiffness: 400, damping: 12 }}
            >
                +
            </motion.button>

            {/* Add Task Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="liquid-glass modal-content"
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ color: 'white', fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>New Goal</h3>
                                <button onClick={() => setShowAddModal(false)} className="icon-btn" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', width: 'auto', height: 'auto', fontSize: '1.5rem', padding: 0 }}>✕</button>
                            </div>
                            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject Name</label>
                                    <input
                                        className="liquid-input action-input"
                                        placeholder="e.g. Advanced JS"
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        style={{ width: '100%', boxSizing: 'border-box' }}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Target</label>
                                    <div style={{ display: 'flex', gap: '1rem' }} className="resp-inputs">
                                        <input
                                            type="number"
                                            min="0" max="23"
                                            className="liquid-input action-input"
                                            placeholder="Hours"
                                            value={hours}
                                            onChange={e => setHours(e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                        <input
                                            type="number"
                                            min="0" max="59"
                                            className="liquid-input action-input"
                                            placeholder="Minutes"
                                            value={minutes}
                                            onChange={e => setMinutes(e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-glass" style={{ width: '100%', marginTop: '1rem', background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.4), rgba(78, 205, 196, 0.1))', border: '1px solid rgba(78, 205, 196, 0.5)', fontSize: '1.1rem', fontWeight: 600, padding: '1rem' }}>
                                    Add to Queue
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scoped CSS based on liquidPrototype.css */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

                .liquid-root {
                    min-height: 100vh;
                    min-height: 100dvh;
                    background: #080808; /* Dark, solid, premium blackish */
                    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
                    position: absolute;
                    inset: 0;
                    overflow-y: auto;
                    overflow-x: hidden;
                    z-index: 9999; /* Covers everything */
                }

                .liquid-container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 2rem 1.25rem;
                    position: relative;
                    z-index: 1;
                }

                .liquid-glass {
                    position: relative;
                    /* 👇 CHANGING THIS '0.08' ADJUSTS TRANSPARENCY (e.g., 0.15 is less transparent, 0.05 is more) */
                    background: rgba(255, 255, 255, 0.03); 
                    /* 👇 CHANGING 'blur(2px)' ADJUSTS THE BLUR AMOUNT (e.g., blur(10px) makes it very blurry) */
                    backdrop-filter: blur(0px) saturate(180%); 
                    -webkit-backdrop-filter: blur(0px) saturate(180%);
                    
                    /* Left/Right asymmetric UI edges */
                    border-top: 2px solid rgba(255, 255, 255, 0.2);
                    border-left: 2px solid rgba(255, 255, 255, 0.2);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                    border-right: 1px solid rgba(255, 255, 255, 0.2);
                    
                    border-radius: 1.5rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 4px 20px rgba(255, 255, 255, 0.05);
                }

                .liquid-input {
                    background: rgba(0, 0, 0, 0.1); /* More transparent */
                    
                    /* Left/Right asymmetric UI edges for inputs */
                    border-top: 2px solid rgba(255, 255, 255, 0.15);
                    border-left: 2px solid rgba(255, 255, 255, 0.15);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
                    border-right: 1px solid rgba(255, 255, 255, 0.15);
                    
                    border-radius: 12px;
                    padding: 14px 16px;
                    color: white;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Bouncy spring transition */
                }

                .liquid-input::placeholder {
                    color: rgba(255,255,255,0.4);
                }

                .liquid-input:focus {
                    background: rgba(0, 0, 0, 0);
                    border-color: rgba(255, 255, 255, 0.5);
                    box-shadow: 0 0 15px rgba(255,255,255,0.1);
                    transform: scale(1.02); /* Pop out effect */
                }

                .liquid-input:active {
                    transform: scale(0.96); /* Squish in effect */
                }

                .btn-glass {
                    position: relative;
                    background: rgba(255, 255, 255, 0.05); /* Higher transparency */
                    
                    /* Asymmetric glassy borders */
                    border-top: 2px solid rgba(255, 255, 255, 0.2);
                    border-left: 2px solid rgba(255, 255, 255, 0.2);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                    border-right: 1px solid rgba(255, 255, 255, 0.2);

                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    backdrop-filter: blur(2px); /* Matched to 2px */
                }

                .btn-glass:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.05);
                    box-shadow: 0 4px 15px rgba(255,255,255,0.2);
                }

                .btn-glass:active {
                    transform: scale(0.98);
                }

                .icon-btn {
                    background: rgba(255,255,255,0.1);
                    /* Asymmetric glassy borders on small buttons too */
                    border-top: 2px solid rgba(255,255,255,0.2);
                    border-left: 2px solid rgba(255,255,255,0.2);
                    border-bottom: 1px solid rgba(255,255,255,0.2);
                    border-right: 1px solid rgba(255,255,255,0.2);
                    border-radius: 8px;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 1.1rem;
                }

                .icon-btn:hover {
                    background: rgba(255,255,255,0.3);
                    transform: scale(1.1);
                }

                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

                .pulse-dot {
                    width: 8px;
                    height: 8px;
                    background: white;
                    border-radius: 50%;
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.5; }
                    100% { transform: scale(0.95); opacity: 1; }
                }

                .fab-btn {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 65px;
                    height: 65px;
                    border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.2);
                    background: black;
                    color: white;
                    font-size: 2.5rem;
                    // border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 8px 30px rgba(241, 241, 241, 0.1);
                    z-index: 1000;
                    font-family: inherit;
                    font-weight: 300;
                    line-height: 1;
                    padding-bottom: 6px;
                }

                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 1.5rem;
                }

                .modal-content {
                    width: 100%;
                    max-width: 440px;
                    padding: 2.5rem 2rem;
                    background: rgba(20, 20, 20, 0.8) !important;
                    box-sizing: border-box;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 4px 20px rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255,255,255,0.15) !important;
                }

                /* CSS Media Queries for Mobile Responsiveness */
                @media (max-width: 600px) {
                    .liquid-container {
                        padding: 1rem;
                        padding-top: 1.5rem;
                    }
                    .resp-header {
                        margin-bottom: 1.5rem !important;
                    }
                    .resp-title {
                        font-size: 1.5rem !important;
                    }
                    .resp-nav-btn {
                        padding: 8px 12px !important;
                        font-size: 0.75rem !important;
                    }
                    .resp-metric {
                        font-size: 2.5rem !important;
                    }
                    .resp-inputs {
                        flex-direction: column;
                        gap: 1rem !important;
                    }
                    .resp-task-row {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 1rem;
                    }
                    .task-action-buttons {
                        align-self: flex-end;
                        width: 100%;
                        justify-content: flex-end;
                        padding-top: 10px;
                        border-top: 1px solid rgba(255,255,255,0.1);
                    }
                    /* Ensure inputs don't zoom on iOS Safari */
                    .action-input {
                        font-size: 16px !important;
                        padding: 12px !important;
                    }
                }
            `}</style>
        </div>
    )
}
