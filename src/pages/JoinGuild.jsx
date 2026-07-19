import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { fadeUp, stagger } from '../utils/motion'
import { submitMember } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const ROLES = ['Leader', 'Co-Leader', 'Member', 'Recruit']

export default function JoinGuild() {
    const { siteToken } = useAuth()
    const [form, setForm] = useState({ name: '', uid: '', role: 'Member' })
    const [loading, setLoading] = useState(false)

    function handleChange(e) {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.name.trim() || !form.uid.trim()) return
        setLoading(true)
        try {
            await submitMember({
                name: form.name.trim(),
                uid: form.uid.trim(),
                role: form.role,
            }, siteToken)
            toast.success('Request sent! Welcome to SARKAR 🔥')
            setForm({ name: '', uid: '', role: 'Member' })
        } catch {
            toast.error('Could not submit. Please try again.')
        } finally {
            setLoading(false)
        }
    }

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
                    Join SARKAR
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.82rem' }}>
                    Submit your details to request membership
                </p>
            </motion.div>

            {/* Form card */}
            <motion.div variants={fadeUp} className="glass-card" style={{ padding: '28px 24px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Name */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            In-game Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            className="glass-input"
                            placeholder="Your Free Fire name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            maxLength={30}
                            autoComplete="off"
                        />
                    </div>

                    {/* UID */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Player UID
                        </label>
                        <input
                            type="text"
                            name="uid"
                            className="glass-input"
                            placeholder="Your Free Fire UID"
                            value={form.uid}
                            onChange={handleChange}
                            required
                            maxLength={20}
                            autoComplete="off"
                            inputMode="numeric"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Role
                        </label>
                        <select
                            name="role"
                            className="glass-input"
                            value={form.role}
                            onChange={handleChange}
                        >
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading || !form.name.trim() || !form.uid.trim()}
                        style={{ marginTop: '4px', opacity: loading ? 0.65 : 1 }}
                    >
                        {loading ? 'Submitting...' : 'Send Request'}
                    </button>
                </form>
            </motion.div>

            {/* Note */}
            <motion.div variants={fadeUp} className="glass-card" style={{ marginTop: '14px', padding: '14px 18px' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', lineHeight: 1.6 }}>
                    Your request will be reviewed by the guild leader. Make sure your UID is correct.
                </p>
            </motion.div>
        </motion.div>
    )
}
