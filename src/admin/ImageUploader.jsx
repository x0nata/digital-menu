import { useState, useRef } from 'react';

export default function ImageUploader({ currentImage, onUpload, onRemove }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.local');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Upload failed');
      }

      const data = await res.json();
      setPreview(data.secure_url);
      onUpload(data.secure_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onRemove?.();
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-surface-variant shadow-sm group">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-surface-variant rounded-xl cursor-pointer hover:border-brand-red hover:bg-brand-red/5 transition-all bg-surface-container-low">
          {uploading ? (
            <span className="material-symbols-outlined animate-spin text-brand-red text-3xl">autorenew</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-3xl text-secondary">cloud_upload</span>
              <span className="text-xs text-secondary mt-1 font-label-bold">Upload Image</span>
              <span className="text-[10px] text-secondary mt-0.5">to Cloudinary</span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
      {error && (
        <div className="flex items-center gap-1 text-error text-sm font-label-bold">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </div>
      )}
    </div>
  );
}
