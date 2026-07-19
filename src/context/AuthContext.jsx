import { createContext, useContext, useState, useEffect } from 'react'
import {
    getAdminToken, setAdminToken as saveAdminToken, clearAdminToken,
} from '../utils/auth'
import { adminLogin } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [adminAuthenticated, setAdminAuthenticated] = useState(!!getAdminToken())
    const [adminToken, setAdminTokenState] = useState(getAdminToken())
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function loginAdmin(email, password) {
        setLoading(true); setError(null)
        try {
            const { token } = await adminLogin(email, password)
            saveAdminToken(token)
            setAdminTokenState(token)
            setAdminAuthenticated(true)
        } catch {
            setError('Invalid credentials.')
            throw new Error('wrong_credentials')
        } finally {
            setLoading(false)
        }
    }

    function logoutAdmin() {
        clearAdminToken()
        setAdminTokenState(null)
        setAdminAuthenticated(false)
    }

    const value = {
        adminAuthenticated,
        adminToken,
        loading,
        error,
        setError,
        loginAdmin,
        logoutAdmin,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
