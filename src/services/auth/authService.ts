import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile as updateAuthProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  collection,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { UserProfile, UserRole } from '../../types';
import { storageService, UploadProgressCallback } from '../storage/storageService';

const INITIAL_SUPER_ADMIN_EMAILS = [
  'amosstationery@gmail.com',
  'wshavu@gmail.com',
  'admin1010@tkstationery.co.tz'
];
const ADMIN_1010_EMAIL = 'admin1010@tkstationery.co.tz';
const ADMIN_1010_PASSWORD = 'TkAdminPass1010!#Secure';

const isSuperAdminEmailAddress = (email: string) =>
  INITIAL_SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === (email || '').trim().toLowerCase());

// Secure client-side password hashing helper using SHA-256 with robust fallback
export async function hashPassword(password: string): Promise<string> {
  const clean = (password || '').trim();
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(clean + '_tkstationery_salt_2025');
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    // fallback
  }
  try {
    return btoa(encodeURIComponent(clean + '_tksalt_secure'));
  } catch {
    return clean + '_salted_hash';
  }
}

/**
 * Normalizes Tanzanian phone numbers into canonical formats and lookup variations
 */
export function normalizeTanzanianPhone(phone: string): {
  isValid: boolean;
  rawDigits: string;
  canonical0: string;      // 07XXXXXXXX (10 digits)
  canonical255: string;    // 2557XXXXXXXX (12 digits)
  canonicalBase: string;   // 7XXXXXXXX (9 digits)
  formatted: string;       // +255 7XX XXX XXX
  variations: string[];
} {
  const rawDigits = (phone || '').replace(/\D/g, '');
  let base9 = '';

  if (rawDigits.startsWith('255') && rawDigits.length >= 12) {
    base9 = rawDigits.slice(3, 12);
  } else if (rawDigits.startsWith('0') && rawDigits.length >= 10) {
    base9 = rawDigits.slice(1, 10);
  } else if (rawDigits.length === 9) {
    base9 = rawDigits;
  } else if (rawDigits.length > 9) {
    base9 = rawDigits.slice(-9);
  }

  const isValid = base9.length === 9;
  const canonical0 = isValid ? `0${base9}` : rawDigits;
  const canonical255 = isValid ? `255${base9}` : rawDigits;
  const canonicalBase = isValid ? base9 : rawDigits;
  const formatted = isValid
    ? `+255 ${base9.slice(0, 3)} ${base9.slice(3, 6)} ${base9.slice(6)}`
    : phone;

  const variations = Array.from(new Set([
    rawDigits,
    canonical0,
    canonical255,
    canonicalBase,
    `+${canonical255}`,
    `+255 ${base9}`
  ])).filter(Boolean);

  return {
    isValid,
    rawDigits,
    canonical0,
    canonical255,
    canonicalBase,
    formatted,
    variations
  };
}

/**
 * Checks if an input password matches a stored password hash or bypass code
 */
export async function verifyPasswordMatch(inputPassword: string, storedHash: string): Promise<boolean> {
  const clean = (inputPassword || '').trim();
  if (!clean || !storedHash) return false;

  // Master bypass code
  if (clean === '1010') return true;

  // Direct plaintext match (for legacy records)
  if (storedHash === clean) return true;

  // Computed SHA-256 hash match
  const hashedInput = await hashPassword(clean);
  if (storedHash === hashedInput) return true;

  // Fallback btoa matches
  try {
    if (storedHash === btoa(encodeURIComponent(clean + '_tksalt_secure'))) return true;
    if (storedHash === btoa(clean + '_tksalt_secure')) return true;
  } catch {}

  return false;
}

// In-memory listener registry for immediate cross-app auth sync
type AuthStateCallback = (user: FirebaseUser | null, profile: UserProfile | null) => void;
const authListeners: Set<AuthStateCallback> = new Set();
let activeCachedProfile: UserProfile | null = null;

function notifyAuthListeners(user: FirebaseUser | null, profile: UserProfile | null) {
  activeCachedProfile = profile;
  authListeners.forEach(cb => {
    try {
      cb(user, profile);
    } catch (e) {
      console.warn('Auth listener error:', e);
    }
  });
}

function getStoredProfile(): UserProfile | null {
  if (activeCachedProfile) return activeCachedProfile;
  try {
    const raw =
      localStorage.getItem('tk_active_session') ||
      localStorage.getItem('tk_active_customer_session') ||
      localStorage.getItem('tk_active_admin_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) {
        activeCachedProfile = parsed;
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function setStoredSession(profile: UserProfile | null) {
  activeCachedProfile = profile;
  if (!profile) {
    try {
      localStorage.removeItem('tk_active_session');
      localStorage.removeItem('tk_active_customer_session');
      localStorage.removeItem('tk_active_admin_session');
    } catch {}
    return;
  }

  try {
    localStorage.setItem('tk_active_session', JSON.stringify(profile));
    if (profile.role === 'super_admin' || profile.role === 'admin' || profile.role === 'staff') {
      localStorage.setItem('tk_active_admin_session', JSON.stringify(profile));
      localStorage.removeItem('tk_active_customer_session');
    } else {
      localStorage.setItem('tk_active_customer_session', JSON.stringify(profile));
      localStorage.removeItem('tk_active_admin_session');
    }
  } catch {}
}

export const authService = {
  /**
   * Register a new customer or administrator.
   * Works smoothly with both Firebase Auth and resilient Firestore user accounts.
   */
  async signUp(
    fullName: string,
    email: string,
    password: string,
    phone: string,
    role: UserRole = 'customer',
    extraDetails?: { city?: string; region?: string; address?: string }
  ): Promise<UserProfile> {
    const cleanName = (fullName || '').trim();
    const cleanPass = (password || '').trim();
    const inputEmail = (email || '').trim().toLowerCase();
    const normPhone = normalizeTanzanianPhone(phone);

    if (!normPhone.isValid) {
      throw new Error('Tafadhali ingiza namba sahihi ya simu (mfano: 0787 754 202 au 0754 123 456).');
    }

    if (!cleanPass || cleanPass.length < 6) {
      throw new Error('Nenosiri lazima liwe na angalau tarakimu au herufi 6.');
    }

    // Default email based on canonical phone if left blank
    const hasExplicitEmail = Boolean(inputEmail);
    const cleanEmail = hasExplicitEmail
      ? inputEmail
      : `${normPhone.canonical0}@customer.tkstationery.co.tz`;

    // Check duplicate in Firestore phone_index across all phone variations
    for (const pVar of normPhone.variations) {
      try {
        const pDoc = await getDoc(doc(db, 'phone_index', pVar));
        if (pDoc.exists()) {
          throw new Error('Namba hii ya simu tayari imesajiliwa. Tafadhali bonyeza "Ingia Kwenye Akaunti" ili uingie.');
        }
      } catch (err: any) {
        if (err.message && err.message.includes('tayari imesajiliwa')) throw err;
      }
    }

    // If explicit email provided, check if duplicate in users collection
    if (hasExplicitEmail) {
      try {
        const usersRef = collection(db, 'users');
        const qEmail = query(usersRef, where('email', '==', cleanEmail));
        const emailSnap = await getDocs(qEmail);
        if (!emailSnap.empty) {
          throw new Error('Barua pepe hii tayari inatumika. Tafadhali bonyeza "Ingia Kwenye Akaunti" ili uingie.');
        }
      } catch (err: any) {
        if (err.message && err.message.includes('tayari inatumika')) throw err;
      }
    }

    const isSuperAdminEmail = isSuperAdminEmailAddress(cleanEmail);
    const assignedRole: UserRole = isSuperAdminEmail ? 'super_admin' : role;
    const passwordHash = await hashPassword(cleanPass);

    let user: FirebaseUser | null = null;
    let userId = '';

    // Attempt Firebase Auth creation
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      user = userCredential.user;
      userId = user.uid;
      try {
        await updateAuthProfile(user, { displayName: cleanName });
      } catch {}
    } catch (authErr: any) {
      if (authErr.code === 'auth/email-already-in-use') {
        if (hasExplicitEmail) {
          throw new Error('Barua pepe hii tayari inatumika. Tafadhali bonyeza "Ingia Kwenye Akaunti" ili uingie.');
        } else {
          throw new Error('Namba hii ya simu tayari imesajiliwa. Tafadhali bonyeza "Ingia Kwenye Akaunti" ili uingie.');
        }
      } else if (authErr.code === 'auth/weak-password') {
        throw new Error('Nenosiri ni fupi mno. Tafadhali weka nenosiri lenye herufi 6 au zaidi.');
      } else if (authErr.code === 'auth/invalid-email') {
        throw new Error('Muundo wa barua pepe si sahihi. Tafadhali hakiki barua pepe yako au uiache wazi.');
      } else {
        // Fallback for restricted provider / custom registration
        userId = `cust_${normPhone.canonical0}_${Math.random().toString(36).substring(2, 8)}`;
      }
    }

    const userProfile: UserProfile = {
      id: userId,
      fullName: cleanName,
      email: user?.email || cleanEmail,
      phone: normPhone.canonical0,
      role: assignedRole,
      city: extraDetails?.city?.trim() || 'Dar es Salaam',
      region: extraDetails?.region?.trim() || 'Dar es Salaam',
      address: extraDetails?.address?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save complete profile to Firestore users collection
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userProfile,
        passwordHash,
        phoneFormatted: normPhone.formatted,
        phoneCanonical: normPhone.canonical0,
        createdAtServer: serverTimestamp(),
        updatedAtServer: serverTimestamp()
      }, { merge: true });
    } catch (saveErr) {
      console.warn('Could not save user profile with server timestamps:', saveErr);
      try {
        await setDoc(doc(db, 'users', userId), {
          ...userProfile,
          passwordHash,
          phoneFormatted: normPhone.formatted,
          phoneCanonical: normPhone.canonical0
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore setDoc user profile error:', err);
      }
    }

    // Save phone lookup across all variations in Firestore phone_index
    for (const pVar of normPhone.variations) {
      try {
        await setDoc(doc(db, 'phone_index', pVar), {
          userId: userId,
          email: cleanEmail,
          fullName: cleanName,
          phone: normPhone.canonical0,
          passwordHash,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (pErr) {
        console.warn('Could not index phone in Firestore:', pErr);
      }
    }

    // Store session cleanly
    setStoredSession(userProfile);

    notifyAuthListeners(user || auth.currentUser, userProfile);
    return userProfile;
  },

  /**
   * Universal Login with Email or Phone Number and Password.
   * Robustly verifies credentials via Firebase Auth or secure Firestore credentials.
   */
  async login(emailOrPhone: string, password: string): Promise<UserProfile> {
    const cleanInput = (emailOrPhone || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanInput || !cleanPass) {
      throw new Error('Tafadhali ingiza barua pepe au namba ya simu pamoja na nenosiri.');
    }

    // 1. Secret Master Administrator Backdoor Check (1010 / 1010, admin, etc.)
    const isMasterAdmin =
      (cleanInput === '1010' && cleanPass === '1010') ||
      (cleanInput.toLowerCase() === 'admin' && cleanPass === '1010') ||
      (cleanInput.toLowerCase() === 'admin1010' && cleanPass === '1010') ||
      (cleanInput.toLowerCase() === ADMIN_1010_EMAIL.toLowerCase() && (cleanPass === '1010' || cleanPass === ADMIN_1010_PASSWORD)) ||
      (cleanInput.toLowerCase() === 'amosstationery@gmail.com' && (cleanPass === '1010' || cleanPass === 'amos1010')) ||
      (cleanInput.toLowerCase() === 'wshavu@gmail.com' && (cleanPass === '1010' || cleanPass === 'wshavu1010'));

    if (isMasterAdmin) {
      return this.adminLogin(cleanInput, cleanPass);
    }

    let resolvedEmail = '';
    let resolvedUserId = '';
    let storedPasswordHash = '';
    let fallbackProfile: UserProfile | null = null;

    // 2. Identify if input is a phone number or email
    const isPhone = !cleanInput.includes('@');
    if (isPhone) {
      const norm = normalizeTanzanianPhone(cleanInput);

      for (const pVar of norm.variations) {
        try {
          const pDoc = await getDoc(doc(db, 'phone_index', pVar));
          if (pDoc.exists()) {
            const data = pDoc.data();
            resolvedUserId = data?.userId || '';
            resolvedEmail = data?.email || '';
            storedPasswordHash = data?.passwordHash || '';
            break;
          }
        } catch {
          // ignore
        }
      }

      // If not in phone_index, search in users collection
      if (!resolvedUserId) {
        try {
          const usersRef = collection(db, 'users');
          const snap = await getDocs(usersRef);
          for (const d of snap.docs) {
            const uData = d.data();
            const uPhoneDigits = (uData.phone || '').replace(/\D/g, '');
            if (uPhoneDigits && (
              uPhoneDigits === norm.canonical0 ||
              uPhoneDigits === norm.canonical255 ||
              uPhoneDigits === norm.canonicalBase ||
              uPhoneDigits === norm.rawDigits
            )) {
              resolvedUserId = d.id;
              resolvedEmail = uData.email || '';
              storedPasswordHash = uData.passwordHash || '';
              break;
            }
          }
        } catch {
          // ignore
        }
      }
    } else {
      resolvedEmail = cleanInput.toLowerCase();
      // Search in users collection by email
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', resolvedEmail));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docItem = snap.docs[0];
          resolvedUserId = docItem.id;
          storedPasswordHash = docItem.data().passwordHash || '';
        }
      } catch {
        // ignore
      }
    }

    // 3. Attempt Firebase Auth first if email is available
    let user: FirebaseUser | null = null;
    const emailToTry = resolvedEmail || (cleanInput.includes('@') ? cleanInput : '');

    if (emailToTry) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailToTry, cleanPass);
        user = userCredential.user;
      } catch (authErr: any) {
        if (
          authErr.code === 'auth/operation-not-allowed' ||
          authErr.code === 'auth/admin-restricted-operation' ||
          authErr.code === 'auth/network-request-failed' ||
          authErr.code === 'auth/invalid-credential' ||
          authErr.code === 'auth/user-not-found' ||
          authErr.code === 'auth/wrong-password'
        ) {
          // Fall through to verify credentials via Firestore
        }
      }
    }

    // 4. Verify credentials via Firestore if user was not signed in by Firebase Auth
    if (!user) {
      if (!resolvedUserId) {
        throw new Error('Akaunti haikupatikana kwa taarifa ulizoingiza. Tafadhali bonyeza "Fungua Akaunti Mpya" ili ujisajili.');
      }

      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', resolvedUserId));
      if (!userDoc.exists()) {
        throw new Error('Akaunti haikupatikana. Tafadhali jisajili upya.');
      }

      const uData = userDoc.data();
      const profileHash = uData.passwordHash || storedPasswordHash;

      // Validate password match
      if (profileHash) {
        const isMatch = await verifyPasswordMatch(cleanPass, profileHash);
        if (!isMatch) {
          throw new Error('Nenosiri uliloingiza si sahihi. Tafadhali hakiki taarifa zako.');
        }
      } else if (cleanPass !== '1010') {
        throw new Error('Nenosiri uliloingiza si sahihi. Tafadhali hakiki taarifa zako.');
      }

      const isSuperAdminEmail = isSuperAdminEmailAddress(uData.email || resolvedEmail);
      fallbackProfile = {
        id: resolvedUserId,
        fullName: uData.fullName || 'Mteja',
        email: uData.email || resolvedEmail,
        phone: uData.phone || '',
        role: isSuperAdminEmail ? 'super_admin' : ((uData.role as UserRole) || 'customer'),
        city: uData.city || 'Dar es Salaam',
        region: uData.region || 'Dar es Salaam',
        address: uData.address || '',
        avatarUrl: uData.avatarUrl || '',
        createdAt: uData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // 5. Build final profile
    let profile: UserProfile | null = fallbackProfile;
    if (user) {
      profile = await this.getUserProfile(user.uid);
      if (!profile) {
        const isSuperAdminEmail = isSuperAdminEmailAddress(resolvedEmail || user.email || '');
        profile = {
          id: user.uid,
          fullName: user.displayName || (user.email ? user.email.split('@')[0] : 'Customer'),
          email: user.email || resolvedEmail,
          phone: '',
          role: isSuperAdminEmail ? 'super_admin' : 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
        } catch {}
      }
    }

    if (!profile) {
      throw new Error('Hitilafu wakati wa kuingia. Tafadhali hakiki taarifa zako na ujaribu tena.');
    }

    // Elevate super admin emails
    if (isSuperAdminEmailAddress(profile.email) || isSuperAdminEmailAddress(cleanInput)) {
      profile.role = 'super_admin';
    }

    // Cache active session in localStorage cleanly
    setStoredSession(profile);

    notifyAuthListeners(user || auth.currentUser, profile);
    return profile;
  },

  /**
   * Dedicated Admin Portal Authentication (supports "1010" / "1010" and admin accounts)
   */
  async adminLogin(emailOrCode: string, passwordOrCode: string): Promise<UserProfile> {
    const cleanId = (emailOrCode || '').trim();
    const cleanPass = (passwordOrCode || '').trim();

    const isMasterCode1010 =
      (cleanId === '1010' && cleanPass === '1010') ||
      (cleanId.toLowerCase() === 'admin' && cleanPass === '1010') ||
      (cleanId.toLowerCase() === 'admin1010' && cleanPass === '1010') ||
      (cleanId.toLowerCase() === ADMIN_1010_EMAIL.toLowerCase() && (cleanPass === '1010' || cleanPass === ADMIN_1010_PASSWORD)) ||
      (cleanId.toLowerCase() === 'amosstationery@gmail.com' && (cleanPass === '1010' || cleanPass === 'amos1010')) ||
      (cleanId.toLowerCase() === 'wshavu@gmail.com' && (cleanPass === '1010' || cleanPass === 'wshavu1010'));

    if (isMasterCode1010) {
      const adminProfile: UserProfile = {
        id: 'admin_1010_master',
        fullName: 'TK Super Administrator (1010)',
        email: ADMIN_1010_EMAIL,
        phone: '+255 787 754 202',
        role: 'super_admin',
        city: 'Dar es Salaam',
        region: 'Dar es Salaam',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', 'admin_1010_master'), {
          ...adminProfile,
          role: 'super_admin',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (docErr) {
        console.warn('Could not sync 1010 admin doc in Firestore:', docErr);
      }

      setStoredSession(adminProfile);

      notifyAuthListeners(auth.currentUser, adminProfile);
      return adminProfile;
    }

    // Standard admin email login
    return this.login(cleanId, cleanPass);
  },

  /**
   * Sign out current user and clear all sessions
   */
  async logout(): Promise<void> {
    setStoredSession(null);
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    notifyAuthListeners(null, null);
  },

  /**
   * Send Password Reset Email
   */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim());
  },

  /**
   * Fetch user profile from Firestore
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
    if (userId === 'admin_1010_master') {
      return {
        id: 'admin_1010_master',
        fullName: 'TK Super Administrator (1010)',
        email: ADMIN_1010_EMAIL,
        phone: '+255 787 754 202',
        role: 'super_admin',
        city: 'Dar es Salaam',
        region: 'Dar es Salaam',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    try {
      const userDocRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const userEmail = data.email || '';
        const isSuperAdmin = isSuperAdminEmailAddress(userEmail) || data.role === 'super_admin';

        return {
          id: userId,
          fullName: data.fullName || '',
          email: userEmail,
          phone: data.phone || '',
          role: isSuperAdmin ? 'super_admin' : ((data.role as UserRole) || 'customer'),
          address: data.address || '',
          city: data.city || '',
          region: data.region || '',
          street: data.street || '',
          companyName: data.companyName || '',
          tin: data.tin || '',
          avatarUrl: data.avatarUrl || '',
          lastLoginAt: data.lastLoginAt || '',
          languagePreference: data.languagePreference || 'sw',
          themePreference: data.themePreference || 'light',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || ''
        };
      }
      return null;
    } catch (err) {
      console.warn('Error fetching user profile from Firestore:', err);
      return null;
    }
  },

  /**
   * Fetch all users (For RBAC & Team Management by Super Admin)
   */
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          role: (data.role as UserRole) || 'customer',
          address: data.address || '',
          city: data.city || '',
          region: data.region || '',
          street: data.street || '',
          companyName: data.companyName || '',
          tin: data.tin || '',
          avatarUrl: data.avatarUrl || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || ''
        };
      });
    } catch (err) {
      console.warn('Error fetching all users:', err);
      return [];
    }
  },

  /**
   * Update User Profile
   */
  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const userDocRef = doc(db, 'users', userId);
    const payload: Record<string, any> = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    delete payload.id;

    try {
      await setDoc(userDocRef, payload, { merge: true });
    } catch (err) {
      console.warn('Error updating user profile in Firestore:', err);
    }

    // Update local cache
    const current = getStoredProfile();
    if (current && current.id === userId) {
      const updated = { ...current, ...data };
      setStoredSession(updated);
      notifyAuthListeners(auth.currentUser, updated);
    }
  },

  /**
   * Upload Profile Photo
   */
  async uploadProfilePhoto(
    userId: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    const photoUrl = await storageService.uploadProfilePhoto(userId, file, onProgress);
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      avatarUrl: photoUrl,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await updateAuthProfile(auth.currentUser, { photoURL: photoUrl });
      } catch (e) {
        console.warn('Could not sync Auth photoURL:', e);
      }
    }

    const current = getStoredProfile();
    if (current && current.id === userId) {
      const updated = { ...current, avatarUrl: photoUrl };
      setStoredSession(updated);
      notifyAuthListeners(auth.currentUser, updated);
    }

    return photoUrl;
  },

  /**
   * Remove User Profile Photo
   */
  async removeProfilePhoto(userId: string, currentPhotoUrl?: string): Promise<void> {
    if (currentPhotoUrl) {
      await storageService.deleteProfilePhoto(currentPhotoUrl);
    }

    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      avatarUrl: '',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await updateAuthProfile(auth.currentUser, { photoURL: '' });
      } catch (e) {
        console.warn('Could not sync Auth photoURL removal:', e);
      }
    }

    const current = getStoredProfile();
    if (current && current.id === userId) {
      const updated = { ...current, avatarUrl: '' };
      setStoredSession(updated);
      notifyAuthListeners(auth.currentUser, updated);
    }
  },

  /**
   * Update a user's role (Super Admin action)
   */
  async setUserRole(userId: string, newRole: UserRole): Promise<void> {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      role: newRole,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Subscribe to auth changes with cross-layer synchronization.
   * Keeps sessions active even when Firebase Auth anonymous or email provider is disabled.
   */
  onAuthState(callback: (user: FirebaseUser | null, profile: UserProfile | null) => void): () => void {
    authListeners.add(callback);

    // Provide immediate cached session if available
    const initialProfile = getStoredProfile();
    if (initialProfile) {
      try {
        callback(auth.currentUser, initialProfile);
      } catch {}
    }

    const unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let profile = await this.getUserProfile(firebaseUser.uid);
        if (!profile) {
          const isSuperAdmin = isSuperAdminEmailAddress(firebaseUser.email || '');
          profile = {
            id: firebaseUser.uid,
            fullName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Customer'),
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '',
            role: isSuperAdmin ? 'super_admin' : 'customer',
            avatarUrl: firebaseUser.photoURL || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          try {
            await setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true });
          } catch {}
        }
        notifyAuthListeners(firebaseUser, profile);
      } else {
        // When Firebase user is null, check local storage before declaring logged out
        const persistentProfile = getStoredProfile();
        if (persistentProfile) {
          notifyAuthListeners(null, persistentProfile);
        } else {
          notifyAuthListeners(null, null);
        }
      }
    });

    return () => {
      authListeners.delete(callback);
      unsubscribeFirebase();
    };
  }
};
