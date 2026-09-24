import React, { useState } from 'react';
import { Camera, Image, Check, Plus, Trash2, Upload, Key } from 'lucide-react';

export default function EvidenceUploader({ onEvidenceSave, existingBefore = [], existingAfter = [], existingNotes = '' }) {
  const [beforePhotos, setBeforePhotos] = useState(existingBefore);
  const [afterPhotos, setAfterPhotos] = useState(existingAfter);
  const [completionNotes, setCompletionNotes] = useState(existingNotes);
  const [inputUrl, setInputUrl] = useState('');
  const [photoType, setPhotoType] = useState('before');

  const samplePhotos = [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500'
  ];

  const handleAddPhoto = (urlToAdd) => {
    const target = urlToAdd || inputUrl;
    if (!target.trim()) return;

    if (photoType === 'before') {
      setBeforePhotos([...beforePhotos, target]);
    } else {
      setAfterPhotos([...afterPhotos, target]);
    }
    setInputUrl('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          if (photoType === 'before') {
            setBeforePhotos(prev => [...prev, reader.result]);
          } else {
            setAfterPhotos(prev => [...prev, reader.result]);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (type, index) => {
    if (type === 'before') {
      setBeforePhotos(beforePhotos.filter((_, i) => i !== index));
    } else {
      setAfterPhotos(afterPhotos.filter((_, i) => i !== index));
    }
  };

  const [verificationCode, setVerificationCode] = useState('');

  const handleSave = () => {
    if (onEvidenceSave) {
      onEvidenceSave({ beforePhotos, afterPhotos, completionNotes, verificationCode });
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
      <div className="flex items-center gap-2">
        <Camera className="w-4 h-4 text-teal-700" />
        <h4 className="font-bold text-slate-900 text-sm">Upload Service Proof of Work Evidence</h4>
      </div>

      {/* Verification Code Input */}
      <div className="p-3.5 bg-teal-950/40 rounded-xl border border-teal-500/40 space-y-2">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-700" />
          <span className="font-bold text-slate-900 text-xs">Customer Service Verification PIN</span>
          <span className="text-[10px] text-amber-700/80 font-medium">(Required to confirm job completion)</span>
        </div>
        <p className="text-[11px] text-slate-600">
          Ask the customer for the 4-digit verification PIN provided on their booking details screen and enter it below:
        </p>
        <input
          type="text"
          maxLength={4}
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
          placeholder="e.g. 4892"
          className="w-full max-w-[200px] bg-white border border-amber-500/50 rounded-xl px-4 py-2 text-center text-lg font-mono font-bold tracking-widest text-amber-700 focus:outline-none focus:border-amber-400 shadow-inner"
        />
      </div>

      {/* Add Photo Input */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={photoType}
            onChange={(e) => setPhotoType(e.target.value)}
            className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none text-xs"
          >
            <option value="before">Before Photo</option>
            <option value="after">After Photo</option>
          </select>

          <label className="px-3 py-1.5 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 text-teal-700 border border-teal-500/40 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5" /> Choose Image File
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          <span className="text-slate-500 text-xs font-medium">or</span>

          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste image URL..."
            className="flex-1 min-w-[180px] bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 placeholder-slate-500 focus:outline-none text-xs"
          />

          <button
            type="button"
            onClick={() => handleAddPhoto()}
            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium flex items-center gap-1 text-xs"
          >
            <Plus className="w-4 h-4" /> Add URL
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
          <span>Quick demo images:</span>
          {samplePhotos.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddPhoto(img)}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-teal-700 border border-slate-200"
            >
              Demo Img #{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Photos Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before Photos */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="font-semibold text-amber-700 block mb-2">Before Photos ({beforePhotos.length})</span>
          {beforePhotos.length === 0 ? (
            <p className="text-slate-500 italic">No before photos added</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {beforePhotos.map((url, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video">
                  <img src={url} alt={`before-${i}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemovePhoto('before', i)}
                    className="absolute top-1 right-1 p-1 bg-rose-600/90 text-slate-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* After Photos */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="font-semibold text-emerald-700 block mb-2">After / Completion Photos ({afterPhotos.length})</span>
          {afterPhotos.length === 0 ? (
            <p className="text-slate-500 italic">No after photos added</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {afterPhotos.map((url, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video">
                  <img src={url} alt={`after-${i}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemovePhoto('after', i)}
                    className="absolute top-1 right-1 p-1 bg-rose-600/90 text-slate-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-slate-600 font-medium mb-1">Technician Completion Notes</label>
        <textarea
          rows={2}
          value={completionNotes}
          onChange={(e) => setCompletionNotes(e.target.value)}
          placeholder="Describe completed repairs, replaced parts, or testing results..."
          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-teal-500"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
      >
        <Check className="w-4 h-4" /> Verify PIN & Submit Work Evidence
      </button>
    </div>
  );
}
