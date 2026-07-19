const { connectDB } = require('./_utils/db')
const { ObjectId } = require('mongodb')
const { verifySiteToken, extractToken } = require('./_utils/auth')

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
}

/**
 * POST /save-push-subscription
 * Body: { uid, subscription }
 * Saves the browser's push subscription object to the member's DB document.
 * Called from the frontend right after user grants notification permission.
 */
exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' }

    try {
        const token = extractToken(event.headers)
        verifySiteToken(token)

        const { uid, subscription, memberId } = JSON.parse(event.body || '{}')
        if (!uid || !subscription) {
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'uid and subscription required' }) }
        }

        const db = await connectDB()
        const members = db.collection('members')

        // Try to match by _id first if provided (more reliable), then by uid
        const query = memberId ? { _id: new ObjectId(memberId) } : { uid: uid.trim() }

        // Remove any existing entry with the same endpoint for this member
        await members.updateOne(query, {
            $pull: { pushSubscriptions: { endpoint: subscription.endpoint } }
        })

        const finalResult = await members.updateOne(query, {
            $push: { pushSubscriptions: subscription }
        })

        if (finalResult.matchedCount === 0) {
            // Log exactly what we were looking for to help the user debug
            console.warn(`[SavePush] No member found for query:`, query)
            return {
                statusCode: 404,
                headers: CORS,
                body: JSON.stringify({
                    error: `Database me member nahi mila! UID used: ${uid}`,
                    debug: { query, receivedUid: uid }
                })
            }
        }

        console.log(`[SavePush] Successfully saved subscription for member: ${uid}`)
        return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) }
    } catch (err) {
        console.error('save-push-subscription error:', err)
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
    }
}
