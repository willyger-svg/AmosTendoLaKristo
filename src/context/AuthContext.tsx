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
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const raw =
        localStorage.getItem('tk_active_admin_session') ||
        localStorage.getItem('tk_active_customer_session') ||
        localStorage.getItem('tk_active_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) return parsed;
      }
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthState((user, profile) => {
      setCurrentUser(user);
      if (profile) {
        setUserProfile(profile);
      } else {
        // Double check localStorage before resetting
        try {
          const raw =
            localStorage.getItem('tk_active_admin_session') ||
            localStorage.getItem('tk_active_customer_session') ||
            localStorage.getItem('tk_active_session');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.id) {
              setUserProfile(parsed);
              setLoading(false);
              return;
            }
          }
        } catch {}
        setUserProfile(null);
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
        localStorage.removeItem('tk_active_customer_session');
        localStorage.removeItem('tk_active_session');
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
    const effectiveUserId = currentUser?.uid || userProfile?.id;
    if (!effectiveUserId) throw new Error('Akaunti haijathibitishwa.');
    await authService.updateProfile(effectiveUserId, data);
    setUserProfile(prev => (prev ? { ...prev, ...data } : null));
  };

  const uploadProfilePhoto = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const effectiveUserId = currentUser?.uid || userProfile?.id;
    if (!effectiveUserId) throw new Error('Akaunti haijathibitishwa.');
    const photoUrl = await authService.uploadProfilePhoto(effectiveUserId, file, onProgress);
    setUserProfile(prev => (prev ? { ...prev, avatarUrl: photoUrl } : null));
    return photoUrl;
  };

  const removeProfilePhoto = async (): Promise<void> => {
    const effectiveUserId = currentUser?.uid || userProfile?.id;
    if (!effectiveUserId) throw new Error('Akaunti haijathibitishwa.');
    await authService.removeProfilePhoto(effectiveUserId, userProfile?.avatarUrl);
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

  const refreshUserProfile = async (): Promise<void> => {
    const effectiveUserId = currentUser?.uid || userProfile?.id;
    if (effectiveUserId) {
      const p = await authService.getUserProfile(effectiveUserId);
      if (p) {
        setUserProfile(p);
      }
    }
  };

  const SUPER_ADMIN_EMAILS = ['wshavu@gmail.com', 'amosstationery@gmail.com', 'admin1010@tkstationery.co.tz'];
  const isSuperAdminEmail = (email?: string | null) =>
    Boolean(email && SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === email.trim().toLowerCase()));

  const computedRole: UserRole = (() => {
    if (userProfile?.role === 'super_admin') return 'super_admin';
    if (userProfile?.id === 'admin_1010_master') return 'super_admin';
    if (isSuperAdminEmail(currentUser?.email)) return 'super_admin';
    if (isSuperAdminEmail(userProfile?.email)) return 'super_admin';
    return userProfile?.role || 'customer';
  })();

  const userRole: UserRole = computedRole;
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
        setUserRole,
        refreshUserProfile
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
