const { connectDB } = require('./_utils/db')
const { verifyAdminToken, extractToken } = require('./_utils/auth')
const webPush = require('web-push')

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' }

    try {
        const token = extractToken(event.headers)
        verifyAdminToken(token)

        const { title, body } = JSON.parse(event.body || '{}')
        if (!title || !body) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'title and body required' }) }

        // VAPID setup from env vars
        webPush.setVapidDetails(
            'mailto:' + (process.env.VAPID_MAILTO || 'admin@sarkar.app'),
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        )

        const db = await connectDB()
        const members = db.collection('members')

        // Get members who have at least one subscription in the array
        const subscribers = await members.find({
            pushSubscriptions: { $exists: true, $not: { $size: 0 } }
        }).toArray()

        const payload = JSON.stringify({ title, body })

        let sent = 0
        let failed = 0
        let cleaned = 0

        for (const member of subscribers) {
            const validSubscriptions = []

            for (const sub of member.pushSubscriptions) {
                try {
                    await webPush.sendNotification(sub, payload)
                    sent++
                } catch (err) {
                    console.error(`Push failed for ${member.name} (${sub.endpoint.slice(-10)}):`, err.statusCode)

                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Mark for removal
                        await members.updateOne(
                            { _id: member._id },
                            { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } }
                        )
                        cleaned++
                    }
                    failed++
                }
            }
        }

        return {
            statusCode: 200,
            headers: CORS,
            body: JSON.stringify({ ok: true, sent, failed, cleaned, totalMembers: subscribers.length })
        }
    } catch (err) {
        console.error('send-notification error:', err)
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
    }
}
