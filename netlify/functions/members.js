const { connectDB } = require('./_utils/db')

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

    const db = await connectDB()
    const members = db.collection('members')

    try {
        if (event.httpMethod === 'GET') {
            const allMembers = await members.find({}, { projection: { uuid: 0 } }).toArray()
            return {
                statusCode: 200,
                headers: CORS,
                body: JSON.stringify(allMembers)
            }
        }

        if (event.httpMethod === 'POST') {
            const data = JSON.parse(event.body)
            const result = await members.insertOne({
                name: data.name,
                uid: data.uid,
                role: 'Recruit',
                stats: {
                    tourney: { kills: 0, matches: 0, ace: 0, wins: 0, runnerUps: 0 },
                    scrim: { kills: 0, matches: 0, ace: 0 }
                },
                createdAt: new Date()
            })

            return {
                statusCode: 201,
                headers: CORS,
                body: JSON.stringify({ ok: true, id: result.insertedId })
            }
        }

        return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' }
    } catch (err) {
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
    }
}
