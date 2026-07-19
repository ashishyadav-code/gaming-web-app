const USER_TOKEN_KEY = 'sarkar_user_uid'
const EXPIRY_KEY = 'sarkar_user_expiry'

export function getUserToken() {
    const token = localStorage.getItem(USER_TOKEN_KEY)
    const expiry = localStorage.getItem(EXPIRY_KEY)

    if (!token || !expiry) return null

    if (Date.now() > parseInt(expiry, 10)) {
        clearUserToken()
        return null
    }

    return token
}

export function setUserToken(uid) {
    localStorage.setItem(USER_TOKEN_KEY, uid)
    // 7 days expiry
    localStorage.setItem(EXPIRY_KEY, (Date.now() + 7 * 24 * 60 * 60 * 1000).toString())
}

export function clearUserToken() {
    localStorage.removeItem(USER_TOKEN_KEY)
    localStorage.removeItem(EXPIRY_KEY)
}
