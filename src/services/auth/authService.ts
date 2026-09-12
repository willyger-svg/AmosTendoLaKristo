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
  orderBy
} from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { UserProfile, UserRole } from '../../types';
import { storageService, UploadProgressCallback } from '../storage/storageService';

const INITIAL_SUPER_ADMIN_EMAILS = [
  'amosstationery@gmail.com',
  'wshavu@gmail.com'
];
const ADMIN_1010_EMAIL = 'admin1010@tkstationery.co.tz';
const ADMIN_1010_PASSWORD = 'TkAdminPass1010!#Secure';

const isSuperAdminEmailAddress = (email: string) =>
  INITIAL_SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === email.trim().toLowerCase());

export const authService = {
  /**
   * Register a new user with Email and Password (Default: Customer)
   */
  async signUp(
    fullName: string,
    email: string,
    password: string,
    phone: string,
    role: UserRole = 'customer',
    extraDetails?: { city?: string; region?: string; address?: string }
  ): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const isSuperAdminEmail = isSuperAdminEmailAddress(cleanEmail);
    const assignedRole: UserRole = isSuperAdminEmail ? 'super_admin' : role;

    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCredential.user;

    const userProfile: UserProfile = {
      id: user.uid,
      fullName: fullName.trim(),
      email: user.email || cleanEmail,
      phone: phone.trim() || '',
      role: assignedRole,
      city: extraDetails?.city?.trim() || 'Dar es Salaam',
      region: extraDetails?.region?.trim() || 'Dar es Salaam',
      address: extraDetails?.address?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save profile to Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        createdAtServer: serverTimestamp(),
        updatedAtServer: serverTimestamp()
      });
    } catch (saveErr) {
      console.warn('Could not save user profile with server timestamps:', saveErr);
      await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true });
    }

    return userProfile;
  },

  /**
   * Universal Log in with Email or Phone Number and Password
   * Automatically recognizes secret administrator credentials (such as 1010/1010 or admin accounts)
   * while handling standard customer accounts seamlessly.
   */
  async login(emailOrPhone: string, password: string): Promise<UserProfile> {
    const cleanInput = emailOrPhone.trim();
    const cleanPass = password.trim();

    // 1. Secret Master Administrator credentials check
    const isMasterAdmin =
      (cleanInput === '1010' && cleanPass === '1010') ||
      (cleanInput.toLowerCase() === 'admin' && cleanPass === '1010') ||
      (cleanInput.toLowerCase() === 'admin1010' && cleanPass === '1010') ||
      (cleanInput.toLowerCase() === ADMIN_1010_EMAIL.toLowerCase() && (cleanPass === '1010' || cleanPass === ADMIN_1010_PASSWORD));

    if (isMasterAdmin) {
      return this.adminLogin('1010', '1010');
    }

    let cleanIdentifier = cleanInput;

    // If identifier doesn't contain '@', it might be a phone number
    if (!cleanIdentifier.includes('@')) {
      const digitsOnly = cleanIdentifier.replace(/\D/g, '');
      try {
        const usersRef = collection(db, 'users');
        const snap = await getDocs(usersRef);
        const match = snap.docs.find(d => {
          const uPhone = (d.data().phone || '').replace(/\D/g, '');
          return uPhone && (uPhone === digitsOnly || uPhone.endsWith(digitsOnly) || digitsOnly.endsWith(uPhone));
        });
        if (match && match.data().email) {
          cleanIdentifier = match.data().email;
        } else {
          // Fallback synthetic email for phone-registered accounts
          cleanIdentifier = `${digitsOnly}@customer.tkstationery.co.tz`;
        }
      } catch {
        cleanIdentifier = `${digitsOnly}@customer.tkstationery.co.tz`;
      }
    }

    const userCredential = await signInWithEmailAndPassword(auth, cleanIdentifier, cleanPass);
    const user = userCredential.user;

    // Fetch user profile from Firestore
    let profile = await this.getUserProfile(user.uid);
    if (!profile) {
      const isSuperAdminEmail = isSuperAdminEmailAddress(cleanIdentifier);
      profile = {
        id: user.uid,
        fullName: user.displayName || cleanIdentifier.split('@')[0],
        email: user.email || cleanIdentifier,
        phone: '',
        role: isSuperAdminEmail ? 'super_admin' : 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
    }

    // If the account has administrator or staff privileges, cache the session
    if (profile.role === 'super_admin' || profile.role === 'admin' || profile.role === 'staff') {
      try {
        localStorage.setItem('tk_active_admin_session', JSON.stringify(profile));
      } catch {
        // ignore
      }
    }

    return profile;
  },

  /**
   * Dedicated Admin Portal Authentication
   * Validates credentials and administrator role.
   * Supports entering "1010" in username and "1010" in password for instant super admin access!
   */
  async adminLogin(emailOrCode: string, passwordOrCode: string): Promise<UserProfile> {
    const cleanId = emailOrCode.trim();
    const cleanPass = passwordOrCode.trim();

    // Direct numerical master code check (1010 / 1010)
    const isMasterCode1010 = cleanId === '1010' && cleanPass === '1010';

    if (isMasterCode1010) {
      // Provision or sign in to the dedicated 1010 super administrator Firebase account
      let user;
      try {
        const cred = await signInWithEmailAndPassword(auth, ADMIN_1010_EMAIL, ADMIN_1010_PASSWORD);
        user = cred.user;
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            const cred = await createUserWithEmailAndPassword(auth, ADMIN_1010_EMAIL, ADMIN_1010_PASSWORD);
            user = cred.user;
          } catch (createErr) {
            console.warn('Could not auto-create 1010 Firebase Auth user:', createErr);
          }
        }
      }

      const uid = user ? user.uid : 'admin_1010_master';
      const adminProfile: UserProfile = {
        id: uid,
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
        await setDoc(doc(db, 'users', uid), {
          ...adminProfile,
          role: 'super_admin',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (docErr) {
        console.warn('Could not update 1010 admin doc in Firestore:', docErr);
      }

      try {
        localStorage.setItem('tk_active_admin_session', JSON.stringify(adminProfile));
      } catch {
        // ignore
      }

      return adminProfile;
    }

    // Standard administrator email login
    const cleanEmail = cleanId;
    const isInitialSuperAdmin = isSuperAdminEmailAddress(cleanEmail);

    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
    } catch (authErr: any) {
      if (
        isInitialSuperAdmin &&
        (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential')
      ) {
        try {
          userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
        } catch (createErr) {
          throw authErr;
        }
      } else {
        throw authErr;
      }
    }

    const user = userCredential.user;
    let profile = await this.getUserProfile(user.uid);

    if (!profile) {
      profile = {
        id: user.uid,
        fullName: 'TK Super Administrator',
        email: user.email || cleanEmail,
        phone: '+255 787 754 202',
        role: isInitialSuperAdmin ? 'super_admin' : 'staff',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
    } else if (isInitialSuperAdmin && profile.role !== 'super_admin') {
      profile.role = 'super_admin';
      await updateDoc(doc(db, 'users', user.uid), { role: 'super_admin' });
    }

    const hasAdminAccess = ['super_admin', 'admin', 'staff'].includes(profile.role);
    if (!hasAdminAccess) {
      await signOut(auth);
      throw new Error('Access Denied: This account does not possess administrator or staff privileges.');
    }

    try {
      localStorage.setItem('tk_active_admin_session', JSON.stringify(profile));
    } catch {
      // ignore
    }

    return profile;
  },

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    try {
      localStorage.removeItem('tk_active_admin_session');
    } catch {
      // ignore
    }
    await signOut(auth);
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
    try {
      const userDocRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: userId,
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
   * Update User Profile (Customer Self-Service)
   * Sanitizes to strictly prevent privilege escalation
   */
  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const userDocRef = doc(db, 'users', userId);
    const payload: Record<string, any> = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    // Security: Never allow customer self-service to modify role or security fields
    delete payload.id;
    delete payload.role;
    delete payload.permissions;
    delete payload.isAdmin;
    delete payload.isStaff;
    delete payload.isVerified;
    delete payload.createdAt;

    await updateDoc(userDocRef, payload);

    if (auth.currentUser && auth.currentUser.uid === userId && data.fullName) {
      try {
        await updateAuthProfile(auth.currentUser, { displayName: data.fullName });
      } catch (e) {
        console.warn('Could not sync Auth displayName:', e);
      }
    }
  },

  /**
   * Upload and persist User Profile Photo to Firebase Storage & Firestore
   */
  async uploadProfilePhoto(
    userId: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    // 1. Upload to Firebase Storage
    const photoUrl = await storageService.uploadProfilePhoto(userId, file, onProgress);

    // 2. Update Firestore user document with setDoc merge: true for resilience
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      avatarUrl: photoUrl,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // 3. Update Firebase Auth user photoURL
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await updateAuthProfile(auth.currentUser, { photoURL: photoUrl });
      } catch (e) {
        console.warn('Could not sync Auth photoURL:', e);
      }
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
   * Subscribe to auth changes with resilient profile + photoURL synchronization
   */
  onAuthState(callback: (user: FirebaseUser | null, profile: UserProfile | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let profile = await this.getUserProfile(firebaseUser.uid);
        if (!profile) {
          profile = {
            id: firebaseUser.uid,
            fullName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Customer'),
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '',
            role: 'customer',
            avatarUrl: firebaseUser.photoURL || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          try {
            await setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true });
          } catch (docErr) {
            console.warn('Could not auto-provision initial user document:', docErr);
          }
        } else if (!profile.avatarUrl && firebaseUser.photoURL) {
          profile.avatarUrl = firebaseUser.photoURL;
        }
        callback(firebaseUser, profile);
      } else {
        callback(null, null);
      }
    });
  }
};
