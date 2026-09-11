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

const INITIAL_SUPER_ADMIN_EMAIL = 'amosstationery@gmail.com';

export const authService = {
  /**
   * Register a new user with Email and Password (Default: Customer)
   */
  async signUp(
    fullName: string,
    email: string,
    password: string,
    phone: string,
    role: UserRole = 'customer'
  ): Promise<UserProfile> {
    const isSuperAdminEmail = email.trim().toLowerCase() === INITIAL_SUPER_ADMIN_EMAIL.toLowerCase();
    const assignedRole: UserRole = isSuperAdminEmail ? 'super_admin' : role;

    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    const userProfile: UserProfile = {
      id: user.uid,
      fullName: fullName.trim(),
      email: user.email || email.trim(),
      phone: phone.trim() || '',
      role: assignedRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save profile to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      ...userProfile,
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp()
    });

    return userProfile;
  },

  /**
   * Client / Customer Log in with Email and Password
   */
  async login(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim();
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCredential.user;

    // Fetch user profile from Firestore
    let profile = await this.getUserProfile(user.uid);
    if (!profile) {
      const isSuperAdminEmail = cleanEmail.toLowerCase() === INITIAL_SUPER_ADMIN_EMAIL.toLowerCase();
      profile = {
        id: user.uid,
        fullName: user.displayName || cleanEmail.split('@')[0],
        email: user.email || cleanEmail,
        phone: '',
        role: isSuperAdminEmail ? 'super_admin' : 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
    }

    return profile;
  },

  /**
   * Dedicated Admin Portal Authentication
   * Validates both credentials and administrator role
   */
  async adminLogin(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim();
    const isInitialSuperAdmin = cleanEmail.toLowerCase() === INITIAL_SUPER_ADMIN_EMAIL.toLowerCase();

    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    } catch (authErr: any) {
      // If initial super_admin account hasn't been created yet in Firebase Auth, provision it seamlessly with given credentials
      if (
        isInitialSuperAdmin &&
        (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential')
      ) {
        try {
          userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        } catch (createErr) {
          throw authErr;
        }
      } else {
        throw authErr;
      }
    }

    const user = userCredential.user;
    let profile = await this.getUserProfile(user.uid);

    // Bootstrap or verify role for super admin
    if (!profile) {
      profile = {
        id: user.uid,
        fullName: 'TK Super Administrator',
        email: user.email || cleanEmail,
        phone: '+255 754 123 456',
        role: isInitialSuperAdmin ? 'super_admin' : 'staff',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
    } else if (isInitialSuperAdmin && profile.role !== 'super_admin') {
      profile.role = 'super_admin';
      await updateDoc(doc(db, 'users', user.uid), { role: 'super_admin' });
    }

    // Role Enforcement Gate: Must be staff, admin, or super_admin
    const hasAdminAccess = ['super_admin', 'admin', 'staff'].includes(profile.role);
    if (!hasAdminAccess) {
      await signOut(auth);
      throw new Error('Access Denied: This account does not possess administrator or staff privileges. Please use the customer portal.');
    }

    return profile;
  },

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
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
