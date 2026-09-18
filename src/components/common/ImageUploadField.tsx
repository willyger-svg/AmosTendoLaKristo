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
  Plus,
  Sparkles,
  Check
} from 'lucide-react';
import { storageService, StationeryPreset } from '../../services/storage/storageService';

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
  helpText = 'Inasaidia JPG, PNG, WEBP au Kamera ya Simu. Picha inaboreshwa kiotomatiki kwa kasi ya mtandao.',
  required = false,
  aspectRatio = 'square',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const presets = storageService.getStationeryPresets();

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square max-w-[180px]'
      : aspectRatio === 'video'
      ? 'aspect-video max-w-[280px]'
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
    setUploadProgress(15);

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
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label & Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
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
            <span>Kifaa / Kamera</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'preset'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Katalogi Tayari</span>
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

      {/* Main Container */}
      <div className="bg-slate-50/90 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 space-y-3">
        {/* Hidden inputs for Files & Camera */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileInputChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileInputChange}
          className="hidden"
        />

        {/* Tab 1: Upload from Device or Camera */}
        {activeTab === 'upload' && (
          <div>
            {value ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Image Preview Box */}
                <div
                  className={`relative ${aspectClass} w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shrink-0 shadow-2xs group`}
                >
                  <img
                    src={value}
                    alt="Preview"
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

                {/* Status and Action Buttons */}
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Picha Ipo Tayari Mtandaoni</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Picha imeboreshwa kwa ubora mzuri na kasi ya mtandao kwa wateja wote.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-500" />
                      <span>Chagua Nyingine</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-500" />
                      <span>Piga Kamera</span>
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
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
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
                    <div className="w-full max-w-xs mx-auto bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-2xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Pakia picha ya bidhaa hapa
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Buruta faili hapa, au tumia vitufe hivi vya haraka:
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Chagua Kutoka Simu/PC</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-500" />
                        <span>Piga Picha (Kamera)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Stationery Presets Gallery */}
        {activeTab === 'preset' && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Bofya picha yoyote ya vifaa vya stationery vilivyopo tayari ili kuiweka moja kwa moja kwenye bidhaa yako:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[260px] overflow-y-auto p-1 scrollbar-thin">
              {presets.map((preset) => {
                const isSelected = value === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onChange(preset.url);
                      setErrorMessage(null);
                    }}
                    className={`relative rounded-xl overflow-hidden border text-left p-1.5 transition-all group ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-400/40 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-amber-400 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 mb-1.5">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {preset.name}
                    </p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{preset.category}</p>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Direct URL */}
        {activeTab === 'url' && (
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
                  <p className="text-[10px] text-slate-400 truncate font-mono">{value}</p>
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
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
    setUploadProgress(15);

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
      if (multiInputRef.current) multiInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
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

      <div className="bg-slate-50/90 dark:bg-slate-855 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 space-y-3">
        {/* Hidden Multi & Camera Inputs */}
        <input
          ref={multiInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleAddFiles(e.target.files)}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
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
                className="absolute top-1 right-1 w-6 h-6 rounded-md bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                title="Ondoa picha hii"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white pointer-events-none">
                #{idx + 1}
              </span>
            </div>
          ))}

          {/* Add Image Buttons */}
          {values.length < maxImages && (
            <div className="aspect-square flex flex-col gap-1.5">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => multiInputRef.current?.click()}
                className="flex-1 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 bg-white dark:bg-slate-800/50 hover:bg-amber-500/5 flex flex-col items-center justify-center gap-0.5 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-all cursor-pointer disabled:opacity-50"
                title="Chagua kutoka kwenye simu au kompyuta"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span className="text-[10px] font-bold">Faili</span>
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => cameraInputRef.current?.click()}
                className="h-7 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center justify-center gap-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 cursor-pointer"
                title="Piga picha na kamera ya simu"
              >
                <Camera className="w-3 h-3 text-blue-500" />
                <span>Kamera</span>
              </button>
            </div>
          )}
        </div>

        {isUploading && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span>Inapakia na kuboresha picha za ziada...</span>
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
