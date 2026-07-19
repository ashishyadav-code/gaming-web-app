import { createContext, useContext, useState, useEffect } from 'react'
import { getUserToken, setUserToken as saveUserToken, clearUserToken } from '../utils/userAuth'
import { userLogin } from '../utils/api'

const UserAuthContext = createContext(null)

export function UserAuthProvider({ children }) {
    const [userAuthenticated, setUserAuthenticated] = useState(false)
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkToken()
    }, [])

    async function checkToken() {
        const tokenUuid = getUserToken()
        if (tokenUuid) {
            try {
                // Try logging in with the saved UUID to fetch fresh user data
                const res = await userLogin(tokenUuid)
                if (res.ok) {
                    setUser(res.member)
                    setToken(res.token)
                    setUserAuthenticated(true)
                } else {
                    clearUserToken()
                }
            } catch (err) {
                // If offline or fail, we still have token, maybe let them in if we want true offline
                // But let's require connection to verify or fallback
                if (import.meta.env.DEV) {
                    // For local dev, maybe we allow it
                }
                clearUserToken()
            }
        }
        setLoading(false)
    }

    async function login(uuid) {
        setLoading(true)
        try {
            const res = await userLogin(uuid)
            if (res.ok && res.member) {
                // Save the secret uuid as the token for re-authentication on refresh
                saveUserToken(res.member.uuid)
                setUser(res.member)
                setToken(res.token)
                setUserAuthenticated(true)
                return { success: true }
            }
            return { success: false, error: 'Invalid Secret UUID' }
        } catch (err) {
            return { success: false, error: err.message || 'Login failed' }
        } finally {
            setLoading(false)
        }
    }

    function logout() {
        clearUserToken()
        setUser(null)
        setToken(null)
        setUserAuthenticated(false)
    }

    const value = {
        userAuthenticated,
        user,
        token,
        loading,
        login,
        logout
    }

    return (
        <UserAuthContext.Provider value={value}>
            {children}
        </UserAuthContext.Provider>
    )
}

export const useUserAuth = () => useContext(UserAuthContext)
