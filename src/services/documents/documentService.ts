import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { CustomerDocument } from '../../types';

const ALLOWED_DOC_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'txt', 'csv', 'jpg', 'jpeg', 'png', 'webp'
];

const DANGEROUS_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'sh', 'js', 'mjs', 'jsx', 'ts', 'tsx',
  'html', 'htm', 'xhtml', 'svg', 'php', 'py', 'rb', 'zip', 'tar',
  'gz', '7z', 'rar', 'dll', 'so', 'bin', 'vbs', 'ps1'
];

const MAX_DOC_SIZE_BYTES = 15 * 1024 * 1024; // 15MB limit

export const documentService = {
  /**
   * Validate document file
   */
  validateDocumentFile(file: File): { isValid: boolean; errorSw?: string; errorEn?: string } {
    if (!file) {
      return {
        isValid: false,
        errorSw: 'Hakuna faili lililochaguliwa.',
        errorEn: 'No file selected.'
      };
    }

    if (file.size > MAX_DOC_SIZE_BYTES) {
      return {
        isValid: false,
        errorSw: 'Faili ni kubwa mno. Ukubwa wa faili haupaswi kuzidi 15MB.',
        errorEn: 'File size exceeds 15MB maximum limit. Please choose a smaller file.'
      };
    }

    const fileName = file.name.toLowerCase();
    const parts = fileName.split('.');
    const ext = parts.length > 1 ? parts.pop() || '' : '';

    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        errorSw: `Faili la aina ya .${ext} haliruhusiwi kwa sababu za kiusalama.`,
        errorEn: `Files with extension .${ext} are prohibited for security.`
      };
    }

    if (!ALLOWED_DOC_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        errorSw: 'Aina ya faili haitumiki. Tumia PDF, Word, Excel, au Picha.',
        errorEn: 'Unsupported format. Please use PDF, Word, Excel, or Image files.'
      };
    }

    return { isValid: true };
  },

  /**
   * Listen to real-time customer documents
   */
  listenToCustomerDocuments(
    userId: string,
    callback: (docs: CustomerDocument[]) => void
  ): () => void {
    try {
      const docsRef = collection(db, 'users', userId, 'documents');
      const q = query(docsRef, orderBy('createdAt', 'desc'));

      return onSnapshot(
        q,
        snapshot => {
          const items = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          })) as CustomerDocument[];
          callback(items);
        },
        err => {
          console.warn('Real-time document listener error:', err);
          callback([]);
        }
      );
    } catch (e) {
      console.warn('Could not establish document listener:', e);
      callback([]);
      return () => {};
    }
  },

  /**
   * Fetch customer documents once
   */
  async getCustomerDocuments(userId: string): Promise<CustomerDocument[]> {
    try {
      const docsRef = collection(db, 'users', userId, 'documents');
      const q = query(docsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as CustomerDocument[];
    } catch (e) {
      console.warn('Could not fetch documents:', e);
      return [];
    }
  },

  /**
   * Upload customer document to Firebase Storage & Firestore
   */
  async uploadDocument(
    userId: string,
    file: File,
    meta: {
      relatedType?: 'order' | 'service_request' | 'quote' | 'direct_upload';
      relatedId?: string;
      relatedTitle?: string;
      notes?: string;
    },
    onProgress?: (progress: number) => void
  ): Promise<CustomerDocument> {
    const validation = this.validateDocumentFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errorEn || 'Invalid file');
    }

    const docId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `users/${userId}/documents/${docId}_${cleanFileName}`;
    const fileRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(fileRef, file, {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        userId,
        docId,
        originalName: file.name
      }
    });

    const downloadUrl = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        snapshot => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (onProgress) onProgress(progress);
        },
        error => reject(error),
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (e) {
            reject(e);
          }
        }
      );
    });

    const docData: CustomerDocument = {
      id: docId,
      customerId: userId,
      name: file.name,
      fileUrl: downloadUrl,
      fileType: file.type || file.name.split('.').pop() || 'unknown',
      fileSize: file.size,
      relatedType: meta.relatedType || 'direct_upload',
      relatedId: meta.relatedId || '',
      relatedTitle: meta.relatedTitle || '',
      notes: meta.notes || '',
      createdAt: new Date().toISOString()
    };

    const docRef = doc(db, 'users', userId, 'documents', docId);
    await setDoc(docRef, docData);

    return docData;
  },

  /**
   * Delete customer document
   */
  async deleteDocument(userId: string, docId: string, fileUrl?: string): Promise<void> {
    try {
      if (fileUrl && fileUrl.includes('firebasestorage.googleapis.com')) {
        try {
          const storageRef = ref(storage, fileUrl);
          await deleteObject(storageRef);
        } catch (storageErr) {
          console.warn('Could not delete storage object:', storageErr);
        }
      }

      const docRef = doc(db, 'users', userId, 'documents', docId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Delete document error:', err);
      throw err;
    }
  }
};
