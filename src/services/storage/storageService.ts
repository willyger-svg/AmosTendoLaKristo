import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from '../../firebase/config';

export interface UploadProgressCallback {
  (progress: number): void;
}

const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const DANGEROUS_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'sh', 'js', 'mjs', 'jsx', 'ts', 'tsx',
  'html', 'htm', 'xhtml', 'svg', 'php', 'py', 'rb', 'zip', 'tar',
  'gz', '7z', 'rar', 'dll', 'so', 'bin', 'vbs', 'ps1'
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const storageService = {
  /**
   * Validate file against strict security rules:
   * - Max 5MB
   * - JPG, PNG, WEBP only
   * - Strict rejection of EXE, JS, HTML, SVG, ZIP, etc.
   */
  validateFile(file: File): { isValid: boolean; errorSw?: string; errorEn?: string } {
    if (!file) {
      return {
        isValid: false,
        errorSw: 'Hakuna faili lililochaguliwa.',
        errorEn: 'No file selected.'
      };
    }

    // 1. Validate File Size (Max 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        errorSw: 'Picha ni kubwa mno. Ukubwa wa picha haupaswi kuzidi 5MB.',
        errorEn: 'Image size exceeds the 5MB maximum limit. Please choose a smaller photo.'
      };
    }

    // 2. Validate Extension
    const fileName = file.name.toLowerCase();
    const parts = fileName.split('.');
    const ext = parts.length > 1 ? parts.pop() || '' : '';

    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        errorSw: `Faili la aina ya .${ext} haliruhusiwi kwa sababu za kiusalama. Chagua JPG, PNG, au WEBP tu.`,
        errorEn: `Files with extension .${ext} are strictly prohibited for security. Please choose JPG, PNG, or WEBP only.`
      };
    }

    if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        errorSw: 'Aina ya faili haitumiki. Tafadhali chagua picha ya JPG, PNG, au WEBP tu.',
        errorEn: 'Unsupported file format. Please upload a JPG, PNG, or WEBP image only.'
      };
    }

    // 3. Validate MIME Type
    const mimeType = (file.type || '').toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return {
        isValid: false,
        errorSw: 'Aina ya picha haikubaliki. Tafadhali weka JPG, PNG, au WEBP tu.',
        errorEn: 'Invalid image format. Please choose a valid JPG, PNG, or WEBP photo.'
      };
    }

    return { isValid: true };
  },

  /**
   * Client-side image compression/optimization:
   * Scales large camera photos down to max 800x800px at 85% quality.
   * Drastically speeds up uploads and ensures crisp avatars without excessive file weights.
   */
  async optimizeImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.85): Promise<File> {
    if (typeof window === 'undefined' || !window.HTMLCanvasElement) {
      return file;
    }

    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;

        // If image is already smaller than max dimensions, check size
        if (width <= maxWidth && height <= maxHeight && file.size < 300 * 1024) {
          resolve(file);
          return;
        }

        // Maintain aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const targetMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file);
              return;
            }
            const optimizedFile = new File([blob], file.name, {
              type: targetMime,
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          },
          targetMime,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  },

  /**
   * Upload user profile photo to Firebase Storage
   * Path: users/{userId}/profile_photos/avatar_{timestamp}.{ext}
   */
  async uploadProfilePhoto(
    userId: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    if (!userId) {
      throw new Error('User ID is required for photo upload');
    }

    // 1. Strict Security & Format Validation
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errorSw || validation.errorEn || 'Invalid file');
    }

    // 2. Client-side Image Optimization
    let fileToUpload = file;
    try {
      fileToUpload = await this.optimizeImage(file);
    } catch (optErr) {
      console.warn('Image optimization skipped:', optErr);
      fileToUpload = file;
    }

    // 3. Upload to Firebase Storage with Fallback Resilience
    try {
      const fileExt = fileToUpload.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const storagePath = `users/${userId}/profile_photos/avatar_${timestamp}.${fileExt}`;
      const storageRef = ref(storage, storagePath);

      const metadata = {
        contentType: fileToUpload.type,
        customMetadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }
      };

      const uploadTask = uploadBytesResumable(storageRef, fileToUpload, metadata);

      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            if (onProgress) {
              onProgress(Math.min(progress, 95));
            }
          },
          (error) => {
            console.warn('Firebase Storage upload warning, using resilient fallback:', error);
            // If Firebase Storage is unavailable or restricted, fallback to optimized data URL
            this.convertFileToDataUrl(fileToUpload)
              .then((dataUrl) => {
                if (onProgress) onProgress(100);
                resolve(dataUrl);
              })
              .catch(() => reject(error));
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              if (onProgress) onProgress(100);
              resolve(downloadUrl);
            } catch (urlErr) {
              console.warn('Failed to retrieve download URL, using data URL fallback:', urlErr);
              const dataUrl = await this.convertFileToDataUrl(fileToUpload);
              if (onProgress) onProgress(100);
              resolve(dataUrl);
            }
          }
        );
      });
    } catch (err) {
      console.warn('Direct upload error, falling back to data URL:', err);
      const dataUrl = await this.convertFileToDataUrl(fileToUpload);
      if (onProgress) onProgress(100);
      return dataUrl;
    }
  },

  /**
   * Upload general image to Firebase Storage with automatic compression and fallback
   * Useful for products, catalog items, advertisements, and banners
   */
  async uploadImage(
    file: File,
    folder = 'products',
    identifier = 'item',
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    // 1. Strict Security & Format Validation
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errorSw || validation.errorEn || 'Faili la picha halikubaliki');
    }

    // 2. Client-side Image Optimization (max 1200x1200px, 85% quality)
    let fileToUpload = file;
    try {
      fileToUpload = await this.optimizeImage(file, 1200, 1200, 0.85);
    } catch (optErr) {
      console.warn('Product image optimization skipped, using original:', optErr);
      fileToUpload = file;
    }

    // 3. Upload to Firebase Storage with Fallback
    try {
      const fileExt = fileToUpload.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const sanitizedId = (identifier || 'item').replace(/[^a-zA-Z0-9_-]/g, '_');
      const storagePath = `${folder}/${sanitizedId}_${timestamp}.${fileExt}`;
      const storageRef = ref(storage, storagePath);

      const metadata = {
        contentType: fileToUpload.type || 'image/jpeg',
        customMetadata: {
          folder,
          uploadedAt: new Date().toISOString()
        }
      };

      const uploadTask = uploadBytesResumable(storageRef, fileToUpload, metadata);

      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            if (onProgress) {
              onProgress(Math.min(progress, 95));
            }
          },
          (error) => {
            console.warn('Firebase Storage upload warning, using resilient fallback:', error);
            this.convertFileToDataUrl(fileToUpload)
              .then((dataUrl) => {
                if (onProgress) onProgress(100);
                resolve(dataUrl);
              })
              .catch(() => reject(error));
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              if (onProgress) onProgress(100);
              resolve(downloadUrl);
            } catch (urlErr) {
              console.warn('Failed to retrieve download URL, using data URL fallback:', urlErr);
              const dataUrl = await this.convertFileToDataUrl(fileToUpload);
              if (onProgress) onProgress(100);
              resolve(dataUrl);
            }
          }
        );
      });
    } catch (err) {
      console.warn('Direct image upload error, falling back to data URL:', err);
      const dataUrl = await this.convertFileToDataUrl(fileToUpload);
      if (onProgress) onProgress(100);
      return dataUrl;
    }
  },

  /**
   * Specialized product image upload for selling online
   */
  async uploadProductImage(
    file: File,
    productId?: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    return this.uploadImage(file, 'products', productId || `prod_${Date.now()}`, onProgress);
  },

  /**
   * Delete previous photo from Firebase Storage if it matches the bucket URL
   */
  async deleteProfilePhoto(photoUrl: string): Promise<void> {
    if (!photoUrl || !photoUrl.includes('firebasestorage.googleapis.com')) {
      return;
    }
    try {
      const photoRef = ref(storage, photoUrl);
      await deleteObject(photoRef);
    } catch (err) {
      // Non-critical, ignore if already deleted or permission restricted
      console.warn('Could not delete old profile photo from Firebase storage:', err);
    }
  },

  /**
   * Helper to convert File to Data URL for instant preview or offline fallback
   */
  convertFileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read image file'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
};
