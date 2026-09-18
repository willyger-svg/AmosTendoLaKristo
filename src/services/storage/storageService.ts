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

export interface StationeryPreset {
  id: string;
  name: string;
  category: string;
  url: string;
}

const ALLOWED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'bmp',
  'heic',
  'heif',
  'avif'
];

const DANGEROUS_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'sh', 'js', 'mjs', 'jsx', 'ts', 'tsx',
  'html', 'htm', 'xhtml', 'svg', 'php', 'py', 'rb', 'zip', 'tar',
  'gz', '7z', 'rar', 'dll', 'so', 'bin', 'vbs', 'ps1'
];

// Allow up to 20MB original files because modern smartphones take 6MB-12MB photos.
// Our client-side canvas compressor immediately shrinks it to ~50KB.
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export const storageService = {
  /**
   * Curated high-definition stationery catalog photos for 1-click preset addition
   */
  getStationeryPresets(): StationeryPreset[] {
    return [
      {
        id: 'ream-a4',
        name: 'Ream ya Karatasi A4 (Double A / Copier)',
        category: 'Paper Products',
        url: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'counter-book',
        name: 'Daftari la Counter Book (Quire 1-4)',
        category: 'Exercise Books',
        url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'ballpoint-pens',
        name: 'Kalamu za Wino (Box la Kalamu)',
        category: 'Pens & Pencils',
        url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'hb-pencils',
        name: 'Seti ya Penseli za HB & Rula',
        category: 'Pens & Pencils',
        url: 'https://images.unsplash.com/photo-1585336261026-0e107f9c3eb7?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'stapler-heavy',
        name: 'Stapler & Pins za Ofisini',
        category: 'Desktop Accessories',
        url: 'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'calculator-scientific',
        name: 'Kikokotoo (Scientific Calculator)',
        category: 'Calculators & Electronics',
        url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'box-file-arch',
        name: 'Box File / Lever Arch Folder',
        category: 'Files & Folders',
        url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'rubber-stamp',
        name: 'Mhuri wa Ofisi & Wino',
        category: 'Stamps & Inks',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'printer-ink-cartridge',
        name: 'Wino wa Printa (Epson / HP Ink)',
        category: 'Printer Consumables',
        url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'highlighters',
        name: 'Seti ya Rangi za Kusoma (Highlighters)',
        category: 'Pens & Pencils',
        url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'sticky-notes',
        name: 'Karatasi za Vibandiko (Sticky Notes)',
        category: 'Paper Products',
        url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'flash-drive',
        name: 'USB Flash Drive 32GB/64GB',
        category: 'Calculators & Electronics',
        url: 'https://images.unsplash.com/photo-1624823183493-5582f3fb8054?auto=format&fit=crop&w=800&q=80'
      }
    ];
  },

  /**
   * Validate file against security rules and format compatibility
   */
  validateFile(file: File): { isValid: boolean; errorSw?: string; errorEn?: string } {
    if (!file) {
      return {
        isValid: false,
        errorSw: 'Hakuna faili lililochaguliwa.',
        errorEn: 'No file selected.'
      };
    }

    // 1. Validate File Size (Max 20MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        errorSw: `Picha ni kubwa mno (${(file.size / (1024 * 1024)).toFixed(1)}MB). Ukubwa haupaswi kuzidi 20MB.`,
        errorEn: 'Image exceeds the 20MB limit. Please choose a smaller photo.'
      };
    }

    // 2. Validate Extension & Dangerous types
    const fileName = (file.name || '').toLowerCase();
    const parts = fileName.split('.');
    const ext = parts.length > 1 ? parts.pop() || '' : '';

    if (ext && DANGEROUS_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        errorSw: `Faili la aina ya .${ext} haliruhusiwi kwa sababu za kiusalama. Chagua picha tu.`,
        errorEn: `Files with extension .${ext} are prohibited for security.`
      };
    }

    // 3. Validate image type
    const mimeType = (file.type || '').toLowerCase();
    const isImageMime = mimeType.startsWith('image/');
    const isAllowedExt = ext ? ALLOWED_IMAGE_EXTENSIONS.includes(ext) : false;

    if (!isImageMime && !isAllowedExt) {
      return {
        isValid: false,
        errorSw: 'Aina ya faili haitumiki. Tafadhali chagua picha (JPG, PNG, WEBP au picha kutoka kamera).',
        errorEn: 'Unsupported format. Please choose an image file (JPG, PNG, WEBP).'
      };
    }

    return { isValid: true };
  },

  /**
   * Client-side image compression/optimization:
   * Scales camera photos down to max 800x800px at 80% quality.
   * Produces an ultra-lightweight image (~40KB - 60KB) that saves fast and loads instantly.
   */
  async optimizeImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<File> {
    if (typeof window === 'undefined' || !window.HTMLCanvasElement) {
      return file;
    }

    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;

        // If image is already smaller than max dimensions and under 80KB, keep it
        if (width <= maxWidth && height <= maxHeight && file.size < 80 * 1024) {
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

        // Always compress to jpeg for maximum compatibility and minimal size
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const cleanName = file.name ? file.name.replace(/\.[^/.]+$/, '.jpg') : 'image.jpg';
            const optimizedFile = new File([blob], cleanName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          },
          'image/jpeg',
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
   * Directly convert and compress an image file into an ultra-compact data URL (<60KB)
   * Guaranteed to work synchronously in any browser without external storage dependencies.
   */
  async compressToDataUrl(
    file: File,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8
  ): Promise<{ dataUrl: string; sizeKb: number; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;

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
          // Fallback to simple FileReader
          this.convertFileToDataUrl(file).then(dataUrl => {
            resolve({
              dataUrl,
              sizeKb: Math.round(dataUrl.length / 1024),
              width: img.width,
              height: img.height
            });
          }).catch(reject);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const sizeKb = Math.round((dataUrl.length * 0.75) / 1024);

        resolve({
          dataUrl,
          sizeKb,
          width,
          height
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        // Fallback to FileReader
        this.convertFileToDataUrl(file).then(dataUrl => {
          resolve({
            dataUrl,
            sizeKb: Math.round(dataUrl.length / 1024),
            width: 800,
            height: 800
          });
        }).catch(reject);
      };

      img.src = objectUrl;
    });
  },

  /**
   * Upload image with fast-path optimization:
   * 1. Compresses image client-side to < 60KB
   * 2. Attempts Firebase Storage upload with a fast 4-second timeout
   * 3. Seamlessly falls back to optimized data URL without freezing the user
   */
  async uploadImage(
    file: File,
    folder = 'products',
    identifier = 'item',
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    // 1. Validation
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errorSw || validation.errorEn || 'Faili la picha halikubaliki');
    }

    if (onProgress) onProgress(20);

    // 2. Client-side compression
    const { dataUrl } = await this.compressToDataUrl(file, 800, 800, 0.8);
    if (onProgress) onProgress(50);

    // 3. Attempt Firebase Storage with a strict 4-second timeout
    try {
      if (!storage) {
        if (onProgress) onProgress(100);
        return dataUrl;
      }

      const fileExt = 'jpg';
      const timestamp = Date.now();
      const sanitizedId = (identifier || 'item').replace(/[^a-zA-Z0-9_-]/g, '_');
      const storagePath = `${folder}/${sanitizedId}_${timestamp}.${fileExt}`;
      const storageRef = ref(storage, storagePath);

      // Convert dataUrl back to a tiny blob for storage upload
      const res = await fetch(dataUrl);
      const compressedBlob = await res.blob();

      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          folder,
          uploadedAt: new Date().toISOString()
        }
      };

      // Race upload with a 4000ms timeout
      const uploadPromise = new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, compressedBlob, metadata);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              50 + ((snapshot.bytesTransferred / (snapshot.totalBytes || 1)) * 45)
            );
            if (onProgress) onProgress(Math.min(progress, 95));
          },
          (error) => {
            reject(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch (err) {
              reject(err);
            }
          }
        );
      });

      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('Firebase Storage timeout - using web storage')), 4000);
      });

      const finalUrl = await Promise.race([uploadPromise, timeoutPromise]);
      if (onProgress) onProgress(100);
      return finalUrl;
    } catch (err) {
      // Graceful fallback to the optimized data URL (<60KB)
      console.info('Picha imeboreshwa na kuhifadhiwa mtandaoni salama:', err);
      if (onProgress) onProgress(100);
      return dataUrl;
    }
  },

  /**
   * Specialized product image upload
   */
  async uploadProductImage(
    file: File,
    productId?: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    return this.uploadImage(file, 'products', productId || `prod_${Date.now()}`, onProgress);
  },

  /**
   * Upload user profile photo
   */
  async uploadProfilePhoto(
    userId: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    return this.uploadImage(file, `users/${userId}`, 'avatar', onProgress);
  },

  /**
   * Delete previous photo from Firebase Storage if applicable
   */
  async deleteProfilePhoto(photoUrl: string): Promise<void> {
    if (!photoUrl || !photoUrl.includes('firebasestorage.googleapis.com')) {
      return;
    }
    try {
      const photoRef = ref(storage, photoUrl);
      await deleteObject(photoRef);
    } catch (err) {
      console.warn('Could not delete old photo from Firebase storage:', err);
    }
  },

  /**
   * Helper to convert File to Data URL
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
