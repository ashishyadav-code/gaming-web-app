const { signAdminToken } = require('./_utils/auth')

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: { ...CORS, 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' }, body: '' }
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) }
    }

    try {
        const { email, password } = JSON.parse(event.body || '{}')
        if (!email || !password) {
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Credentials required' }) }
        }

        // Compare against env vars only
        if (
            email !== process.env.ADMIN_EMAIL ||
            password !== process.env.ADMIN_PASSWORD
        ) {
            return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Invalid credentials' }) }
        }

        const token = signAdminToken()
        return { statusCode: 200, headers: CORS, body: JSON.stringify({ token }) }
    } catch {
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server error' }) }
    }
}
