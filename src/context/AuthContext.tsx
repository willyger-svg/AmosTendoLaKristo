import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile, UserRole } from '../types';
import { authService } from '../services/auth/authService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  userRole: UserRole;
  isAdmin: boolean;
  isStaff: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<UserProfile>;
  adminLogin: (identifier: string, password: string) => Promise<UserProfile>;
  signUp: (
    fullName: string,
    email: string,
    password: string,
    phone: string,
    role?: UserRole,
    extraDetails?: { city?: string; region?: string; address?: string }
  ) => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadProfilePhoto: (file: File, onProgress?: (progress: number) => void) => Promise<string>;
  removeProfilePhoto: () => Promise<void>;
  getAllUsers: () => Promise<UserProfile[]>;
  setUserRole: (userId: string, newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if there is an active admin session cached in localStorage
    try {
      const cached = localStorage.getItem('tk_active_admin_session');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.role === 'super_admin' || parsed.role === 'admin')) {
          setUserProfile(parsed);
        }
      }
    } catch {
      // ignore
    }

    const unsubscribe = authService.onAuthState((user, profile) => {
      setCurrentUser(user);
      if (profile) {
        setUserProfile(profile);
      } else {
        const cached = localStorage.getItem('tk_active_admin_session');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && (parsed.role === 'super_admin' || parsed.role === 'admin')) {
              setUserProfile(parsed);
            } else {
              setUserProfile(null);
            }
          } catch {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (emailOrPhone: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await authService.login(emailOrPhone, password);
      setUserProfile(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (identifier: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await authService.adminLogin(identifier, password);
      setUserProfile(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    fullName: string,
    email: string,
    password: string,
    phone: string,
    role: UserRole = 'customer',
    extraDetails?: { city?: string; region?: string; address?: string }
  ): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await authService.signUp(fullName, email, password, phone, role, extraDetails);
      setUserProfile(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      try {
        localStorage.removeItem('tk_active_admin_session');
      } catch {
        // ignore
      }
      await authService.logout();
      setCurrentUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    await authService.resetPassword(email);
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) throw new Error('Not authenticated');
    await authService.updateProfile(currentUser.uid, data);
    setUserProfile(prev => (prev ? { ...prev, ...data } : null));
  };

  const uploadProfilePhoto = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    if (!currentUser) throw new Error('Not authenticated');
    const photoUrl = await authService.uploadProfilePhoto(currentUser.uid, file, onProgress);
    setUserProfile(prev => (prev ? { ...prev, avatarUrl: photoUrl } : null));
    return photoUrl;
  };

  const removeProfilePhoto = async (): Promise<void> => {
    if (!currentUser) throw new Error('Not authenticated');
    await authService.removeProfilePhoto(currentUser.uid, userProfile?.avatarUrl);
    setUserProfile(prev => (prev ? { ...prev, avatarUrl: '' } : null));
  };

  const getAllUsers = async (): Promise<UserProfile[]> => {
    return await authService.getAllUsers();
  };

  const setUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
    await authService.setUserRole(userId, newRole);
    if (userProfile && userProfile.id === userId) {
      setUserProfile({ ...userProfile, role: newRole });
    }
  };

  const userRole: UserRole = userProfile?.role || 'customer';
  const isSuperAdmin = userRole === 'super_admin';
  const isAdmin = userRole === 'admin' || isSuperAdmin;
  const isStaff = userRole === 'staff' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        userRole,
        isAdmin,
        isStaff,
        isSuperAdmin,
        loading,
        login,
        adminLogin,
        signUp,
        logout,
        resetPassword,
        updateProfile,
        uploadProfilePhoto,
        removeProfilePhoto,
        getAllUsers,
        setUserRole
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
