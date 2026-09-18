import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Camera,
  ExternalLink,
  Plus
} from 'lucide-react';
import { storageService } from '../../services/storage/storageService';

export interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  itemId?: string;
  helpText?: string;
  required?: boolean;
  aspectRatio?: 'square' | 'video' | 'banner';
  className?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label = 'Picha ya Bidhaa',
  value,
  onChange,
  folder = 'products',
  itemId,
  helpText = 'Inasaidia JPG, PNG, WEBP (Upeo wa ukubwa 5MB). Picha inaboreshwa kiotomatiki kwa kasi ya mtandao.',
  required = false,
  aspectRatio = 'square',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square max-w-[200px]'
      : aspectRatio === 'video'
      ? 'aspect-video max-w-[320px]'
      : 'aspect-[3/1] max-w-full';

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);

    // Validate
    const validation = storageService.validateFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.errorSw || 'Faili la picha halikubaliki.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const downloadUrl = await storageService.uploadImage(
        file,
        folder,
        itemId || `item_${Date.now()}`,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      onChange(downloadUrl);
      setUploadProgress(100);
      setPreviewLoaded(true);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setErrorMessage(err.message || 'Kushindwa kupakia picha. Tafadhali jaribu tena.');
    } finally {
      setIsUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveImage = () => {
    onChange('');
    setPreviewLoaded(false);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label & Tabs Header */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Pakia Faili</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'url'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>URL</span>
          </button>
        </div>
      </div>

      {/* Main Upload / URL Container */}
      <div className="bg-slate-50/80 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 space-y-3">
        {activeTab === 'upload' ? (
          <div>
            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={onFileInputChange}
              className="hidden"
            />

            {/* Dropzone & Preview */}
            {value ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Image Preview Box */}
                <div
                  className={`relative ${aspectClass} w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shrink-0 shadow-2xs group`}
                >
                  <img
                    src={value}
                    alt="Preview"
                    onLoad={() => setPreviewLoaded(true)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white text-xs font-bold transition-transform active:scale-95"
                      title="Badilisha Picha"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold transition-transform active:scale-95"
                      title="Futa Picha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Upload Status & Actions */}
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Picha Ipo Tayari Mtandaoni</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 break-all line-clamp-2 font-mono">
                    {value.startsWith('data:') ? 'Data URL (Imehifadhiwa mtandaoni salama)' : value}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pakia Nyingine</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Ondoa</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-300 dark:border-slate-700 hover:border-amber-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                {isUploading ? (
                  <div className="space-y-3 py-2">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Inapakia na kuboresha picha ({uploadProgress}%)...
                      </p>
                      <p className="text-[11px] text-slate-500">Tafadhali subiri kidogo...</p>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full max-w-xs mx-auto bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-2xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Bofya hapa kuchagua picha kutoka kifaa chako
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Au buruta faili la picha na uliachie hapa (Drag & Drop)
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
                      <Camera className="w-3.5 h-3.5 text-amber-500" />
                      <span>Kamera au Faili za Simu / PC</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Direct URL Input Tab */
          <div className="space-y-2">
            <div className="relative">
              <input
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://images.unsplash.com/... au kiungo cha picha"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 shadow-2xs"
              />
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            {value && (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <img
                  src={value}
                  alt="URL Preview"
                  className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-700 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    Picha Kupitia Kiungo
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{value}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Helper Note */}
        {helpText && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
            {helpText}
          </p>
        )}
      </div>
    </div>
  );
};

export interface MultiImageUploadFieldProps {
  label?: string;
  values: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  itemId?: string;
  maxImages?: number;
  helpText?: string;
}

export const MultiImageUploadField: React.FC<MultiImageUploadFieldProps> = ({
  label = 'Picha za Ziada za Kifaa (Gallery)',
  values = [],
  onChange,
  folder = 'products',
  itemId,
  maxImages = 5,
  helpText = 'Ongeza hadi picha 5 za pembe tofauti za bidhaa ili wateja waone muonekano halisi mtandaoni.'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const multiInputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);

    const remainingSlots = maxImages - values.length;
    if (remainingSlots <= 0) {
      setErrorMsg(`Upeo wa picha ni ${maxImages}. Tafadhali ondoa picha moja kabla ya kuongeza nyingine.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);
    setUploadProgress(10);

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const validation = storageService.validateFile(file);
        if (!validation.isValid) {
          continue;
        }

        const url = await storageService.uploadImage(
          file,
          folder,
          `${itemId || 'item'}_gal_${Date.now()}_${i}`,
          (progress) => {
            const overall = Math.round(((i + progress / 100) / filesToUpload.length) * 100);
            setUploadProgress(overall);
          }
        );
        uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
        onChange([...values, ...uploadedUrls]);
      }
    } catch (err: any) {
      console.error('Multi image upload error:', err);
      setErrorMsg(err.message || 'Hitilafu ilitokea wakati wa kupakia baadhi ya picha.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (multiInputRef.current) {
        multiInputRef.current.value = '';
      }
    }
  };

  const handleRemoveOne = (indexToRemove: number) => {
    onChange(values.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
          {label} ({values.length}/{maxImages})
        </label>
        {values.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[11px] text-rose-500 hover:underline font-semibold"
          >
            Futa Zote
          </button>
        )}
      </div>

      <div className="bg-slate-50/80 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 space-y-3">
        {/* Hidden Multi Input */}
        <input
          ref={multiInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={(e) => handleAddFiles(e.target.files)}
          className="hidden"
        />

        {/* Thumbnails Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {values.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 group shadow-2xs"
            >
              <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveOne(idx)}
                className="absolute top-1 right-1 w-6 h-6 rounded-md bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                title="Ondoa picha hii"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white pointer-events-none">
                #{idx + 1}
              </span>
            </div>
          ))}

          {/* Add Image Tile */}
          {values.length < maxImages && (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => multiInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 bg-white dark:bg-slate-800/50 hover:bg-amber-500/5 flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Ongeza</span>
                </>
              )}
            </button>
          )}
        </div>

        {isUploading && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span>Inapakia picha za ziada...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 text-rose-600 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <p className="text-[11px] text-slate-400 dark:text-slate-500">{helpText}</p>
      </div>
    </div>
  );
};
