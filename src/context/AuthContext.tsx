import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { api } from '../api/client';

export interface AuthUser {
  userId: string;
  name: string;
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
  const savedUserId = localStorage.getItem('sarkar_user_id') || 'ASHISH';
  const savedRole = (localStorage.getItem('sarkar_role') as UserRole) || 'IGL';

  const isInitialMaster = savedUserId.toUpperCase() === 'ASHISH' || savedUserId.toUpperCase() === 'ASHISH800';

  const [user, setUser] = useState<AuthUser | null>({
    userId: savedUserId,
    name: isInitialMaster ? 'Ashish' : savedUserId,
    email: `${savedUserId.toLowerCase()}@teamsarkar.com`,
    role: isInitialMaster ? 'IGL' : savedRole,
    isMaster: isInitialMaster,
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [permissionDeniedModalOpen, setPermissionDeniedModalOpen] = useState(false);
  const [deniedActionName, setDeniedActionName] = useState('This action');

  const isMasterUser = Boolean(
    user?.isMaster ||
    user?.userId.toUpperCase() === 'ASHISH' ||
    user?.userId.toUpperCase() === 'ASHISH800' ||
    user?.email?.toLowerCase().includes('ashish')
  );

  const isIGLRole = isMasterUser || user?.role === 'IGL';

  const loginUser = (newUser: AuthUser, token: string) => {
    const isMaster = newUser.userId.toUpperCase() === 'ASHISH' || newUser.userId.toUpperCase() === 'ASHISH800';
    const role: UserRole = isMaster ? 'IGL' : newUser.role || 'PLAYER';
    
    const finalizedUser: AuthUser = {
      ...newUser,
      role,
      isMaster,
    };

    setUser(finalizedUser);
    api.setAuth(token, role, finalizedUser.userId);
  };

  const logoutUser = () => {
    setUser({
      userId: 'GUEST',
      name: 'Player',
      role: 'PLAYER',
      isMaster: false,
    });
    api.setAuth('GUEST', 'PLAYER', 'GUEST');
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
