const { connectDB } = require('./_utils/db')
const { verifyAdminToken, extractToken } = require('./_utils/auth')
const { ObjectId } = require('mongodb')

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS, body: '' }
    }

    try {
        const token = extractToken(event.headers)
        const admin = verifyAdminToken(token)
        if (!admin) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) }

        const db = await connectDB()
        const members = db.collection('members')
        const id = event.queryStringParameters.id

        if (event.httpMethod === 'GET') {
            const allMembers = await members.find({}).toArray()
            return { statusCode: 200, headers: CORS, body: JSON.stringify(allMembers) }
        }

        if (event.httpMethod === 'PUT') {
            const action = event.queryStringParameters.action
            const data = JSON.parse(event.body)

            if (action === 'stats') {
                const category = event.queryStringParameters.category || 'tourney'
                const updatePath = `stats.${category}`
                await members.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { [updatePath]: data } }
                )
                return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) }
            } else {
                await members.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { role: data.role } }
                )
                return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) }
            }
        }

        if (event.httpMethod === 'DELETE') {
            await members.deleteOne({ _id: new ObjectId(id) })
            return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) }
        }

        return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' }
    } catch (err) {
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
    }
}
