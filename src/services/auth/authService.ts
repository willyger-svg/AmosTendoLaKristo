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
   * Supports phone-only registration, auto-indexing for quick phone lookup,
   * and automatic elevation for super admin emails.
   */
  async signUp(
    fullName: string,
    email: string,
    password: string,
    phone: string,
    role: UserRole = 'customer',
    extraDetails?: { city?: string; region?: string; address?: string }
  ): Promise<UserProfile> {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const phoneDigits = cleanPhone.replace(/\D/g, '');
    let cleanEmail = email.trim().toLowerCase();

    // If no email provided, create a valid unique identifier based on phone digits
    if (!cleanEmail) {
      cleanEmail = `${phoneDigits || Date.now()}@customer.tkstationery.co.tz`;
    }

    const isSuperAdminEmail = isSuperAdminEmailAddress(cleanEmail);
    const assignedRole: UserRole = isSuperAdminEmail ? 'super_admin' : role;

    let user: FirebaseUser | null = null;
    let userId = '';

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      user = userCredential.user;
      userId = user.uid;
    } catch (authErr: any) {
      if (authErr.code === 'auth/email-already-in-use') {
        // If email exists, attempt sign in in case user already created credentials
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          user = cred.user;
          userId = user.uid;
        } catch {
          throw new Error('Barua pepe au namba hii ya simu tayari imeshasajiliwa. Tafadhali bonyeza "Ingia Kwenye Akaunti" ili uingie.');
        }
      } else if (authErr.code === 'auth/weak-password') {
        throw new Error('Nenosiri ni fupi mno. Tafadhali weka nenosiri lenye tarakimu 6 au zaidi.');
      } else if (authErr.code === 'auth/invalid-email') {
        throw new Error('Muundo wa barua pepe si sahihi. Tafadhali hakiki barua pepe yako.');
      } else {
        console.warn('Firebase Auth create error, using resilient customer fallback:', authErr);
        userId = `cust_${phoneDigits || Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
    }

    const userProfile: UserProfile = {
      id: userId,
      fullName: fullName.trim(),
      email: user?.email || cleanEmail,
      phone: cleanPhone || phone.trim(),
      role: assignedRole,
      city: extraDetails?.city?.trim() || 'Dar es Salaam',
      region: extraDetails?.region?.trim() || 'Dar es Salaam',
      address: extraDetails?.address?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save profile to Firestore users collection
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userProfile,
        createdAtServer: serverTimestamp(),
        updatedAtServer: serverTimestamp()
      }, { merge: true });
    } catch (saveErr) {
      console.warn('Could not save user profile with server timestamps:', saveErr);
      try {
        await setDoc(doc(db, 'users', userId), userProfile, { merge: true });
      } catch (err) {
        console.warn('Firestore setDoc user profile error:', err);
      }
    }

    // Save phone lookup in Firestore phone_index so login by phone works instantly
    if (phoneDigits) {
      const phoneVariations = [phoneDigits];
      if (phoneDigits.startsWith('255')) phoneVariations.push('0' + phoneDigits.slice(3));
      if (phoneDigits.startsWith('0')) phoneVariations.push('255' + phoneDigits.slice(1));

      for (const pVar of phoneVariations) {
        try {
          await setDoc(doc(db, 'phone_index', pVar), {
            email: cleanEmail,
            userId: userId,
            fullName: fullName.trim(),
            phone: cleanPhone,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (pErr) {
          console.warn('Could not index phone in Firestore:', pErr);
        }
      }
    }

    // Cache active session
    try {
      localStorage.setItem('tk_active_customer_session', JSON.stringify(userProfile));
      if (assignedRole === 'super_admin' || assignedRole === 'admin' || assignedRole === 'staff') {
        localStorage.setItem('tk_active_admin_session', JSON.stringify(userProfile));
      }
    } catch {
      // ignore
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

    // If identifier doesn't contain '@', it's a phone number
    if (!cleanIdentifier.includes('@')) {
      const digitsOnly = cleanIdentifier.replace(/\D/g, '');
      const phoneVariations = [digitsOnly];
      if (digitsOnly.startsWith('255')) phoneVariations.push('0' + digitsOnly.slice(3));
      if (digitsOnly.startsWith('0')) phoneVariations.push('255' + digitsOnly.slice(1));

      let resolvedEmail = '';
      for (const pVar of phoneVariations) {
        try {
          const pDoc = await getDoc(doc(db, 'phone_index', pVar));
          if (pDoc.exists() && pDoc.data()?.email) {
            resolvedEmail = pDoc.data().email;
            break;
          }
        } catch {
          // ignore
        }
      }

      if (resolvedEmail) {
        cleanIdentifier = resolvedEmail;
      } else {
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
            cleanIdentifier = `${digitsOnly}@customer.tkstationery.co.tz`;
          }
        } catch {
          cleanIdentifier = `${digitsOnly}@customer.tkstationery.co.tz`;
        }
      }
    }

    let user: FirebaseUser | null = null;
    let fallbackProfile: UserProfile | null = null;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanIdentifier, cleanPass);
      user = userCredential.user;
    } catch (authErr: any) {
      if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/invalid-login-credentials') {
        throw new Error('Taarifa za kuingia si sahihi. Hakiki barua pepe / namba ya simu na nenosiri lako.');
      } else if (authErr.code === 'auth/operation-not-allowed' || authErr.code === 'auth/network-request-failed') {
        console.warn('Firebase Auth sign in issue:', authErr.code);
        const digitsOnly = cleanInput.replace(/\D/g, '');
        if (digitsOnly) {
          try {
            const pDoc = await getDoc(doc(db, 'phone_index', digitsOnly));
            if (pDoc.exists() && pDoc.data()?.userId) {
              const prof = await this.getUserProfile(pDoc.data().userId);
              if (prof) fallbackProfile = prof;
            }
          } catch {}
        }
        if (!fallbackProfile) {
          throw new Error('Hitilafu ya mtandao wakati wa kuingia. Tafadhali jaribu tena baada ya muda mfupi.');
        }
      } else {
        throw authErr;
      }
    }

    let profile: UserProfile | null = fallbackProfile;
    if (user) {
      profile = await this.getUserProfile(user.uid);
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
        try {
          await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
        } catch {}
      }
    }

    if (!profile) {
      throw new Error('Akaunti haikupatikana. Tafadhali jisajili upya.');
    }

    // Guarantee super admin elevation for recognized super admin emails
    if (isSuperAdminEmailAddress(profile.email) || isSuperAdminEmailAddress(cleanIdentifier)) {
      profile.role = 'super_admin';
    }

    // Cache the active session
    try {
      localStorage.setItem('tk_active_customer_session', JSON.stringify(profile));
      if (profile.role === 'super_admin' || profile.role === 'admin' || profile.role === 'staff') {
        localStorage.setItem('tk_active_admin_session', JSON.stringify(profile));
      }
    } catch {
      // ignore
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
      localStorage.removeItem('tk_active_customer_session');
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
          } catch (docErr) {
            console.warn('Could not auto-provision initial user document:', docErr);
          }
        } else if (!profile.avatarUrl && firebaseUser.photoURL) {
          profile.avatarUrl = firebaseUser.photoURL;
        }

        if (firebaseUser.email && isSuperAdminEmailAddress(firebaseUser.email)) {
          profile.role = 'super_admin';
        }

        callback(firebaseUser, profile);
      } else {
        // If Firebase Auth is not actively signed in, check cached sessions
        const cachedAdmin = localStorage.getItem('tk_active_admin_session');
        if (cachedAdmin) {
          try {
            const parsed = JSON.parse(cachedAdmin);
            if (parsed && (parsed.role === 'super_admin' || parsed.role === 'admin' || parsed.role === 'staff')) {
              callback(null, parsed);
              return;
            }
          } catch {}
        }

        const cachedCust = localStorage.getItem('tk_active_customer_session');
        if (cachedCust) {
          try {
            const parsed = JSON.parse(cachedCust);
            if (parsed && parsed.id) {
              callback(null, parsed);
              return;
            }
          } catch {}
        }

        callback(null, null);
      }
    });
  }
};
