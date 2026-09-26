import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { api } from '../api/client';

export interface AuthUser {
  userId: string;
  name: string;
  ign?: string;
  teamRole?: string;
  email?: string;
  role: UserRole;
  isMaster?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isIGL: boolean;
  isMaster: boolean;
  loginUser: (user: AuthUser, token: string) => void;
  logoutUser: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  openLoginModal: () => void;
  openRegisterModal: () => void;
  permissionDeniedModalOpen: boolean;
  setPermissionDeniedModalOpen: (open: boolean) => void;
  showPermissionDenied: (actionName?: string) => void;
  deniedActionName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const savedUserId = localStorage.getItem('sarkar_user_id');
  const savedRole = (localStorage.getItem('sarkar_role') as UserRole) || 'IGL';

  const isInitialMaster =
    savedUserId &&
    (savedUserId.toUpperCase() === 'ASHISH' || savedUserId.toUpperCase() === 'ASHISH800' || savedUserId.toUpperCase() === 'ASHISH8006');

  const [user, setUser] = useState<AuthUser | null>(
    savedUserId
      ? {
          userId: savedUserId,
          name: isInitialMaster ? 'Ashish' : savedUserId,
          ign: isInitialMaster ? 'HASHIRAMA 777' : savedUserId,
          teamRole: isInitialMaster ? 'Sniper' : 'Rusher',
          email: `${savedUserId.toLowerCase()}@teamsarkar.com`,
          role: isInitialMaster ? 'IGL' : savedRole,
          isMaster: !!isInitialMaster,
        }
      : null
  );

  // Open auth modal on fresh install (no saved user)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(!savedUserId);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [permissionDeniedModalOpen, setPermissionDeniedModalOpen] = useState(false);
  const [deniedActionName, setDeniedActionName] = useState('This action');

  // Hydrate API client credentials on mount
  useEffect(() => {
    const token = localStorage.getItem('sarkar_token');
    if (savedUserId && token) {
      api.setAuth(token, savedRole, savedUserId);
    }
  }, []);

  const isMasterUser = Boolean(
    user?.isMaster ||
    user?.userId.toUpperCase() === 'ASHISH' ||
    user?.userId.toUpperCase() === 'ASHISH800' ||
    user?.email?.toLowerCase().includes('ashish')
  );

  const isIGLRole = isMasterUser || user?.role === 'IGL';

  const loginUser = (newUser: AuthUser, token: string) => {
    const isMaster =
      newUser.userId.toUpperCase() === 'ASHISH' ||
      newUser.userId.toUpperCase() === 'ASHISH800' ||
      newUser.userId.toUpperCase() === 'ASHISH8006';
    const role: UserRole = isMaster ? 'IGL' : newUser.role || 'PLAYER';

    const finalizedUser: AuthUser = {
      ...newUser,
      name: isMaster ? 'Ashish' : (newUser.name || newUser.userId),
      ign: isMaster ? 'HASHIRAMA 777' : (newUser.ign || newUser.userId),
      teamRole: isMaster ? 'Sniper' : (newUser.teamRole || 'Rusher'),
      role,
      isMaster,
    };

    setUser(finalizedUser);
    api.setAuth(token, role, finalizedUser.userId);

    // Persist login permanently
    localStorage.setItem('sarkar_user_id', finalizedUser.userId);
    localStorage.setItem('sarkar_role', role);
    localStorage.setItem('sarkar_token', token);
  };

  const logoutUser = () => {
    // Clear all saved auth data
    localStorage.removeItem('sarkar_user_id');
    localStorage.removeItem('sarkar_role');
    localStorage.removeItem('sarkar_token');
    setUser(null);
    api.setAuth('', 'PLAYER', '');
    setIsAuthModalOpen(true);
  };

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const showPermissionDenied = (actionName: string = 'This action') => {
    setDeniedActionName(actionName);
    setPermissionDeniedModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: isIGLRole ? 'IGL' : 'PLAYER',
        isIGL: isIGLRole,
        isMaster: isMasterUser,
        loginUser,
        logoutUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        openLoginModal,
        openRegisterModal,
        permissionDeniedModalOpen,
        setPermissionDeniedModalOpen,
        showPermissionDenied,
        deniedActionName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
