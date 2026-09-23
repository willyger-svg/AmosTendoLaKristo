import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storage/storageService';
import {
  Camera,
  UploadCloud,
  Trash2,
  Check,
  Loader2,
  X,
  Sparkles,
  User,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Image as ImageIcon
} from 'lucide-react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preset avatars for instant selection without uploading
const AVATAR_PRESETS = [
  { id: 'av1', label: 'Mteja 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { id: 'av2', label: 'Mteja 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 'av3', label: 'Mteja 3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
  { id: 'av4', label: 'Mteja 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { id: 'av5', label: 'Mteja 5', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
  { id: 'av6', label: 'Mteja 6', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' },
];

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, uploadProfilePhoto, removeProfilePhoto, updateProfile } = useAuth();
  const { showToast } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'presets'>('upload');

  if (!isOpen) return null;

  // Process chosen or captured file
  const handleProcessFile = (file: File) => {
    const validation = storageService.validateFile(file);
    if (!validation.isValid) {
      showToast({
        type: 'error',
        title: 'Picha Haifai',
        message: validation.errorSw || 'Faili halina vigezo vinavyotakiwa.'
      });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setZoom(1);
    setRotation(0);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Rotate preview 90 degrees
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Convert canvas with zoom/rotation to final blob if modified
  const getRenderedFile = async (): Promise<File> => {
    if (!selectedFile || !previewUrl) {
      throw new Error('Hakuna picha iliyochaguliwa.');
    }

    // If no rotation or zoom applied, upload the compressed file directly
    if (rotation === 0 && zoom === 1) {
      return selectedFile;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height, 800);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(selectedFile);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Move to center to apply rotation & zoom
        ctx.translate(size / 2, size / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);

        // Draw image centered and cropped to square
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);

        canvas.toBlob(
          blob => {
            if (!blob) {
              resolve(selectedFile);
              return;
            }
            const processedFile = new File([blob], 'profile.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(processedFile);
          },
          'image/jpeg',
          0.85
        );
      };

      img.onerror = () => reject(new Error('Hitilafu ya kusoma picha.'));
      img.src = previewUrl;
    });
  };

  // Execute upload
  const handleSavePhoto = async () => {
    setIsUploading(true);
    setUploadProgress(15);
    try {
      const fileToUpload = await getRenderedFile();
      await uploadProfilePhoto(fileToUpload, progress => {
        setUploadProgress(Math.max(progress, 20));
      });

      showToast({
        type: 'success',
        title: 'Picha Imewekwa Vizuri!',
        message: 'Picha yako ya wasifu imehifadhiwa na inaonekana sasa.'
      });

      handleClose();
    } catch (err: any) {
      console.warn('Profile photo save error:', err);
      showToast({
        type: 'error',
        title: 'Hitilafu ya Upakiaji',
        message: err.message || 'Haikuweza kuhifadhi picha. Tafadhali jaribu tena.'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Choose preset avatar
  const handleSelectPreset = async (presetUrl: string) => {
    setIsUploading(true);
    try {
      await updateProfile({ avatarUrl: presetUrl });
      showToast({
        type: 'success',
        title: 'Picha ya Wasifu Imesasishwa!',
        message: 'Avatar ya wasifu imewekwa kikamilifu.'
      });
      handleClose();
    } catch (err: any) {
      console.warn('Select preset avatar error:', err);
      showToast({
        type: 'error',
        title: 'Hitilafu',
        message: 'Haikuweza kuweka avatar. Tafadhali jaribu tena.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Remove photo
  const handleRemove = async () => {
    if (!window.confirm('Je, una uhakika unataka kuondoa picha yako ya wasifu?')) {
      return;
    }
    setIsUploading(true);
    try {
      await removeProfilePhoto();
      showToast({
        type: 'info',
        title: 'Picha Imeondolewa',
        message: 'Picha yako ya wasifu imeondolewa kwenye akaunti.'
      });
      handleClose();
    } catch (err: any) {
      console.warn('Remove profile photo error:', err);
      showToast({
        type: 'error',
        title: 'Hitilafu',
        message: 'Haikuweza kuondoa picha.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setZoom(1);
    setRotation(0);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                Picha ya Wasifu (Profile Picture)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Weka au badilisha picha ya akaunti yako ya TK Stationery
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Pakia Picha Yangu</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Chagua Avatar ya Haraka</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileInputChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={onFileInputChange}
            accept="image/*"
            capture="user"
            className="hidden"
          />

          {activeTab === 'upload' ? (
            previewUrl ? (
              /* Image Editor / Preview View */
              <div className="space-y-4">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-3xl overflow-hidden border-4 border-amber-400 shadow-xl bg-slate-950 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      transform: `rotate(${rotation}deg) scale(${zoom})`,
                      transition: 'transform 0.15s ease-out'
                    }}
                    className="w-full h-full object-cover"
                  />
                  {/* Circular Mask Overlay Guide */}
                  <div className="absolute inset-0 rounded-full border-2 border-white/40 pointer-events-none" />
                </div>

                {/* Adjustments: Rotate & Zoom Controls */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-amber-500" />
                      <span>Kuza / Punguza (Zoom): {Math.round(zoom * 100)}%</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleRotate}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all"
                    >
                      <RotateCw className="w-3 h-3 text-amber-500" />
                      <span>Zungusha 90°</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <ZoomOut className="w-4 h-4 text-slate-400" />
                    <input
                      type="range"
                      min="0.8"
                      max="2.5"
                      step="0.05"
                      value={zoom}
                      onChange={e => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <ZoomIn className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline px-3 py-1.5"
                  >
                    Chagua picha nyingine
                  </button>
                </div>
              </div>
            ) : (
              /* Dropzone / Selection View */
              <div className="space-y-4">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-300 dark:border-slate-700 hover:border-amber-400 bg-slate-50/60 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <h4 className="font-black text-sm text-slate-800 dark:text-slate-100">
                    Bofya hapa au kokota picha yako
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Inakubali JPG, PNG, WEBP kutoka kwenye kompyuta au simu yako
                  </p>
                </div>

                {/* Mobile Camera Direct Button */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>Fungua Picha za Simu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-amber-200 dark:border-amber-800/60"
                  >
                    <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Piga Picha Sasa</span>
                  </button>
                </div>

                {/* Current Active Photo */}
                {userProfile?.avatarUrl && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={userProfile.avatarUrl}
                        alt="Current"
                        className="w-10 h-10 rounded-xl object-cover border border-amber-400"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Picha ya Sasa</p>
                        <p className="text-[10px] text-slate-400">Inaonekana kwenye wasifu na maagizo yako</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemove}
                      disabled={isUploading}
                      className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Ondoa</span>
                    </button>
                  </div>
                )}
              </div>
            )
          ) : (
            /* Presets Selection View */
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Huna picha tayari? Chagua avatar mojawapo kati ya hizi kwa kubofya mara moja tu:
              </p>
              <div className="grid grid-cols-3 gap-3">
                {AVATAR_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    disabled={isUploading}
                    className="group relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-amber-500 transition-all aspect-square focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Check className="w-6 h-6 text-amber-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar when saving */}
          {isUploading && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Inaboresha na kuhifadhi picha...</span>
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            {userProfile?.avatarUrl && !previewUrl && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ondoa Picha</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
            >
              Ghairi
            </button>

            {previewUrl && (
              <button
                type="button"
                onClick={handleSavePhoto}
                disabled={isUploading}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Inahifadhi...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Hifadhi Picha Sasa</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
