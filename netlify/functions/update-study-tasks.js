const { connectDB } = require('./_utils/db')
const { ObjectId } = require('mongodb')

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
        const { id, tasks } = JSON.parse(event.body || '{}')
        if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Member ID required' }) }

        const db = await connectDB()
        const members = db.collection('members')

        let query;
        if (ObjectId.isValid(id)) {
            query = { _id: new ObjectId(id) }
        } else {
            query = { _id: id }
        }

        await members.updateOne(
            query,
            { $set: { studyTasks: tasks } }
        )

        return {
            statusCode: 200,
            headers: CORS,
            body: JSON.stringify({ ok: true })
        }
    } catch (err) {
        console.error('update-study-tasks error:', err)
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
    }
}
