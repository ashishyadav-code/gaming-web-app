const jwt = require('jsonwebtoken')

const SECRET = () => process.env.JWT_SECRET || 'change_me_in_production'

function signSiteToken() {
    return jwt.sign({ role: 'site' }, SECRET(), { expiresIn: '24h' })
}

function signAdminToken() {
    return jwt.sign({ role: 'admin' }, SECRET(), { expiresIn: '4h' })
}

function verifySiteToken(token) {
    const payload = jwt.verify(token, SECRET())
    if (payload.role !== 'site' && payload.role !== 'admin') throw new Error('not_site')
    return payload
}

function verifyAdminToken(token) {
    const payload = jwt.verify(token, SECRET())
    if (payload.role !== 'admin') throw new Error('not_admin')
    return payload
}

// Extract bearer token from Authorization header
function extractToken(headers) {
    const auth = headers.authorization || headers.Authorization || ''
    return auth.replace(/^Bearer\s+/i, '').trim()
}

module.exports = { signSiteToken, signAdminToken, verifySiteToken, verifyAdminToken, extractToken }
