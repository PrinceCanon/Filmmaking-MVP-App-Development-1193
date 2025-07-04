import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit2, FiCheck, FiX } = FiIcons;

const EditableField = ({ 
  value, 
  onSave, 
  type = 'text', 
  placeholder = '', 
  className = '',
  multiline = false,
  options = [],
  label = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && <label className="text-sm text-gray-400">{label}</label>}
        
        <div className="flex items-start space-x-2">
          <div className="flex-1">
            {type === 'select' ? (
              <select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              >
                {options.map(option => (
                  <option key={option} value={option} className="bg-gray-800">
                    {option}
                  </option>
                ))}
              </select>
            ) : multiline ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder={placeholder}
                rows={3}
                autoFocus
              />
            ) : (
              <input
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={placeholder}
                autoFocus
              />
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <motion.button
              className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              onClick={handleSave}
            >
              <SafeIcon icon={FiCheck} className="text-green-400 text-sm" />
            </motion.button>
            
            <motion.button
              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              onClick={handleCancel}
            >
              <SafeIcon icon={FiX} className="text-red-400 text-sm" />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group ${className}`}>
      {label && <label className="text-sm text-gray-400">{label}</label>}
      
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          {value ? (
            <span className="text-white">{value}</span>
          ) : (
            <span className="text-gray-400 italic">{placeholder}</span>
          )}
        </div>
        
        <motion.button
          className="opacity-0 group-hover:opacity-100 p-1 bg-purple-500/20 hover:bg-purple-500/30 rounded transition-all"
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsEditing(true)}
        >
          <SafeIcon icon={FiEdit2} className="text-purple-400 text-sm" />
        </motion.button>
      </div>
    </div>
  );
};

export default EditableField;