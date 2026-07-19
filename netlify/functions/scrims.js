const { connectDB } = require('./_utils/db')
const { verifyAdminToken, extractToken } = require('./_utils/auth')
const { ObjectId } = require('mongodb')

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json'
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS, body: '' }
    }

    try {
        const db = await connectDB()
        const scrims = db.collection('scrims')

        if (event.httpMethod === 'GET') {
            const all = await scrims.find({}).sort({ createdAt: -1 }).toArray()
            return { statusCode: 200, headers: CORS, body: JSON.stringify(all) }
        }

        const token = extractToken(event.headers)
        const admin = verifyAdminToken(token)
        if (!admin) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) }

        const data = JSON.parse(event.body)
        const { action, id, ...payload } = data

        if (action === 'add') {
            const result = await scrims.insertOne({
                ...payload,
                createdAt: new Date()
            })

            // Aggregate and update player stats automatically
            const members = db.collection('members')
            for (const p of payload.players || []) {
                const uidStr = String(p.uid || '').trim()
                if (!uidStr || uidStr.startsWith('CUSTOM_')) continue // Don't update stats for custom players

                const uidNum = Number(uidStr)
                const query = isNaN(uidNum) ? { uid: uidStr } : { $or: [{ uid: uidStr }, { uid: uidNum }] }

                await members.updateOne(
                    query,
                    {
                        $inc: {
                            "stats.scrim.kills": Math.max(0, Number(p.kills) || 0),
                            "stats.scrim.ace": Math.max(0, Number(p.aces) || 0),
                            "stats.scrim.matches": 1
                        }
                    }
                )
            }

            return { statusCode: 201, headers: CORS, body: JSON.stringify({ ok: true, id: result.insertedId }) }
        }

        if (action === 'delete') {
            if (!id) throw new Error('Delete requires an ID')
            const objId = new ObjectId(id)
            const match = await scrims.findOne({ _id: objId })

            if (match) {
                const members = db.collection('members')
                for (const p of match.players || []) {
                    const uidStr = String(p.uid || '').trim()
                    if (!uidStr || uidStr.startsWith('CUSTOM_')) continue

                    const uidNum = Number(uidStr)
                    const query = isNaN(uidNum) ? { uid: uidStr } : { $or: [{ uid: uidStr }, { uid: uidNum }] }

                    await members.updateOne(
                        query,
                        {
                            $inc: {
                                "stats.scrim.kills": -(Number(p.kills) || 0),
                                "stats.scrim.ace": -(Number(p.aces) || 0),
                                "stats.scrim.matches": -1
                            }
                        }
                    )
                }
                await scrims.deleteOne({ _id: objId })
            }
            return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) }
        }

        return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' }
    } catch (err) {
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
    }
}
