const { connectDB } = require('./_utils/db')
const { verifyAdminToken, extractToken } = require('./_utils/auth')
const { ObjectId } = require('mongodb')

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

        const { id, uuid } = JSON.parse(event.body || '{}')
        if (!id || !uuid) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'id and uuid required' }) }

        const db = await connectDB()
        const members = db.collection('members')

        await members.updateOne(
            { _id: new ObjectId(id) },
            { $set: { uuid: uuid.trim() } }
        )

        return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) }
    } catch (err) {
        console.error('admin-update-uuid error:', err)
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
    }
}
