const { connectDB } = require('./_utils/db')
const { verifyAdminToken, extractToken } = require('./_utils/auth')

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS, body: '' }
    }

    try {
        const db = await connectDB()
        const settingsCol = db.collection('settings')

        if (event.httpMethod === 'GET') {
            const settings = await settingsCol.findOne({ _id: 'global' }) || { posterUrl: '', posterEnabled: false, homePageAiPanel: null }
            return {
                statusCode: 200,
                headers: CORS,
                body: JSON.stringify(settings)
            }
        }

        const data = JSON.parse(event.body)
        const token = extractToken(event.headers)
        const admin = verifyAdminToken(token)

        if (!admin) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) }

        if (event.httpMethod === 'POST') {
            const { posterUrl, posterEnabled, homePageAiPanel } = data
            await settingsCol.updateOne(
                { _id: 'global' },
                { $set: { posterUrl, posterEnabled, homePageAiPanel } },
                { upsert: true }
            )
            return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) }
        }

        return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) }
    } catch (err) {
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
    }
}
