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
  sessionTimeoutWarning: boolean;
  dismissSessionWarning: () => void;
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

// 15 minutes of inactivity triggers automatic secure logout
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
// Show warning modal 60 seconds before auto-logout
const INACTIVITY_WARNING_MS = 14 * 60 * 1000;
const LAST_ACTIVITY_KEY = 'tk_last_user_activity_timestamp';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const raw =
        localStorage.getItem('tk_active_session') ||
        localStorage.getItem('tk_active_customer_session') ||
        localStorage.getItem('tk_active_admin_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) return parsed;
      }
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState<boolean>(false);

  // Inactivity tracking: updates the last activity timestamp whenever user interacts
  const updateActivityTimestamp = () => {
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    } catch {
      // ignore
    }
  };

  const dismissSessionWarning = () => {
    updateActivityTimestamp();
    setSessionTimeoutWarning(false);
  };

  // Listen to user input events (mousemove, keydown, click, scroll, touchstart)
  useEffect(() => {
    if (!currentUser && !userProfile) return;

    // Initialize activity timestamp upon login
    updateActivityTimestamp();

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    let throttleTimeout: NodeJS.Timeout | null = null;

    const handleUserActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          updateActivityTimestamp();
          throttleTimeout = null;
        }, 3000); // Throttle activity updates to once every 3 seconds
      }
    };

    activityEvents.forEach(evt => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Interval to inspect inactivity every 10 seconds
    const intervalId = setInterval(() => {
      // Check if user is logged in
      const currentSessionActive = Boolean(
        localStorage.getItem('tk_active_session') ||
        localStorage.getItem('tk_active_customer_session') ||
        localStorage.getItem('tk_active_admin_session')
      );

      if (!currentSessionActive) return;

      const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
      const lastActivity = lastActivityStr ? parseInt(lastActivityStr, 10) : Date.now();
      const elapsed = Date.now() - lastActivity;

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        // Automatic secure logout due to inactivity
        console.warn('Session expired due to user inactivity (15 minutes). Logging out for security.');
        setSessionTimeoutWarning(false);
        logout();
      } else if (elapsed >= INACTIVITY_WARNING_MS) {
        setSessionTimeoutWarning(true);
      } else {
        setSessionTimeoutWarning(false);
      }
    }, 10000);

    return () => {
      activityEvents.forEach(evt => {
        window.removeEventListener(evt, handleUserActivity);
      });
      if (throttleTimeout) clearTimeout(throttleTimeout);
      clearInterval(intervalId);
    };
  }, [currentUser, userProfile]);

  useEffect(() => {
    const unsubscribe = authService.onAuthState((user, profile) => {
      setCurrentUser(user);
      if (profile) {
        setUserProfile(profile);
      } else {
        // Double check localStorage before resetting
        try {
          const raw =
            localStorage.getItem('tk_active_session') ||
            localStorage.getItem('tk_active_customer_session') ||
            localStorage.getItem('tk_active_admin_session');
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
    _role: UserRole = 'customer',
    extraDetails?: { city?: string; region?: string; address?: string }
  ): Promise<UserProfile> => {
    setLoading(true);
    try {
      // All new registrations are strictly assigned 'customer' role
      const profile = await authService.signUp(fullName, email, password, phone, 'customer', extraDetails);
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

  const computedRole: UserRole = (() => {
    // 1. Dedicated Master Administrator (1010 account)
    if (userProfile?.id === 'admin_1010_master') return 'super_admin';
    // 2. Explicit roles assigned in database
    if (userProfile?.role === 'super_admin') return 'super_admin';
    if (userProfile?.role === 'admin') return 'admin';
    if (userProfile?.role === 'staff') return 'staff';
    // 3. Default strictly to customer
    return 'customer';
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
        sessionTimeoutWarning,
        dismissSessionWarning,
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
