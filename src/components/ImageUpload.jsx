import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { FiUpload, FiImage, FiX, FiCamera } = FiIcons;

const ImageUpload = ({ onImageUploaded, currentImage, shotId }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const uploadImage = async (file) => {
    try {
      setUploading(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file (JPEG, PNG, etc.)');
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${shotId || Date.now()}.${fileExt}`;
      const filePath = `shots/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('shot-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('shot-images')
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      uploadImage(files[0]);
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      uploadImage(files[0]);
    }
  };

  const removeImage = async () => {
    if (currentImage) {
      try {
        // Extract file path from URL
        const urlParts = currentImage.split('/');
        const filePath = urlParts.slice(-2).join('/'); // Get 'shots/filename.ext'
        
        await supabase.storage
          .from('shot-images')
          .remove([filePath]);
      } catch (error) {
        console.error('Error removing image:', error);
      }
    }
    onImageUploaded(null);
  };

  if (currentImage) {
    return (
      <div className="relative group">
        <img
          src={currentImage}
          alt="Shot reference"
          className="w-full h-32 object-cover rounded-lg border border-white/10"
        />
        <motion.button
          className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
          whileHover={{ scale: 1.1 }}
          onClick={removeImage}
        >
          <SafeIcon icon={FiX} className="text-xs" />
        </motion.button>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
        dragActive
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-white/20 hover:border-white/40 hover:bg-white/5'
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {uploading ? (
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="text-sm text-gray-400">Uploading...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <SafeIcon icon={FiCamera} className="text-2xl text-gray-400" />
          <div className="text-sm text-gray-400">
            <span className="text-purple-400 font-medium">Click to upload</span> or drag and drop
          </div>
          <div className="text-xs text-gray-500">
            JPEG, PNG up to 5MB
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;