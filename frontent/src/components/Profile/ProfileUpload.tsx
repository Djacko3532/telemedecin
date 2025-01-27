import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

interface ProfileUploadProps {
  onUpload: (file: File) => void;
  currentPhotoUrl?: string;
}

const ProfileUpload = ({ onUpload, currentPhotoUrl }: ProfileUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Photo de profil
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover mx-auto"
            />
            <button
              onClick={() => {
                setPreview(null);
                onUpload(null as any);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <div className="text-sm text-gray-600">
              <label className="cursor-pointer text-blue-600 hover:text-blue-500">
                Cliquez pour uploader
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(file);
                  }}
                />
              </label>
              {' '}ou glissez-déposez
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG jusqu'à 5MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileUpload;