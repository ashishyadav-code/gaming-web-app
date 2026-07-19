const { connectDB } = require('./_utils/db')
const { signSiteToken } = require('./_utils/auth')

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method Not Allowed' }) }
    }

    try {
        const { uuid } = JSON.parse(event.body || '{}')
        if (!uuid) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'UUID required' }) }

        const db = await connectDB()
        const members = db.collection('members')

        // Find member by secret uuid (case-insensitive)
        const member = await members.findOne({ uuid: { $regex: `^${uuid.trim()}$`, $options: 'i' } })

        if (!member) {
            return {
                statusCode: 401,
                headers: CORS,
                body: JSON.stringify({ error: 'Invalid Secret UUID. Check with your Guild Leader.' })
            }
        }

        // Issue a site-level JWT so the user can access protected routes
        const token = signSiteToken()

        return {
            statusCode: 200,
            headers: CORS,
            body: JSON.stringify({ ok: true, token, member })
        }
    } catch (err) {
        console.error('user-login error:', err)
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
    }
}
