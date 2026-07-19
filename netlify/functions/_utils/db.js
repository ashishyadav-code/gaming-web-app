const { MongoClient, ServerApiVersion } = require('mongodb')

let cachedClient = null
let cachedDb = null

async function connectDb() {
    if (cachedDb) return cachedDb

    const client = new MongoClient(process.env.MONGODB_URI, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    })

    await client.connect()
    cachedClient = client
    cachedDb = client.db(process.env.DB_NAME || 'sarkar_guild')
    return cachedDb
}

module.exports = { connectDB: connectDb }
