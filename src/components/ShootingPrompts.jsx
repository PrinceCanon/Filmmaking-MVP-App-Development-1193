import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCamera, FiMic, FiSun, FiEye, FiCheckCircle, FiAlertCircle } = FiIcons;

const ShootingPrompts = ({ project, currentShot, isRecording }) => {
  const [checklist, setChecklist] = useState({
    lighting: false,
    audio: false,
    framing: false,
    background: false,
    battery: false,
    storage: false
  });

  const [tips, setTips] = useState([]);

  useEffect(() => {
    // Generate contextual tips based on project type
    const generateTips = () => {
      const baseTips = [
        'Check your lighting - avoid harsh shadows on faces',
        'Test your audio levels before recording',
        'Ensure your camera is stable and level',
        'Check your background for distractions',
        'Have enough battery and storage space',
        'Record a few seconds of room tone for editing'
      ];

      const typeTips = {
        'Vlog': [
          'Maintain eye contact with the camera',
          'Vary your shots - use close-ups and wide shots',
          'Be natural and conversational',
          'Have notes nearby but don\'t read directly'
        ],
        'Tutorial': [
          'Show each step clearly',
          'Use close-up shots for detailed work',
          'Speak slowly and clearly',
          'Repeat important information'
        ],
        'Interview': [
          'Position subjects at comfortable angles',
          'Use multiple camera angles if possible',
          'Leave pauses for natural editing points',
          'Have backup questions ready'
        ]
      };

      const projectTypeTips = typeTips[project.type] || [];
      setTips([...baseTips, ...projectTypeTips]);
    };

    generateTips();
  }, [project.type]);

  const handleChecklistChange = (item) => {
    setChecklist(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const checklistItems = [
    { key: 'lighting', label: 'Lighting is good', icon: FiSun },
    { key: 'audio', label: 'Audio levels tested', icon: FiMic },
    { key: 'framing', label: 'Shot is framed well', icon: FiEye },
    { key: 'background', label: 'Background is clean', icon: FiCamera },
    { key: 'battery', label: 'Battery is charged', icon: FiCheckCircle },
    { key: 'storage', label: 'Enough storage space', icon: FiCheckCircle }
  ];

  const completedItems = Object.values(checklist).filter(Boolean).length;
  const totalItems = Object.keys(checklist).length;
  const isReady = completedItems === totalItems;

  return (
    <div className="space-y-6 mt-8">
      {/* Pre-Recording Checklist */}
      <motion.div 
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4">Pre-Recording Checklist</h3>
        
        <div className="space-y-3 mb-4">
          {checklistItems.map((item) => (
            <motion.div
              key={item.key}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                checklist[item.key] 
                  ? 'bg-green-500/20 border border-green-500/30' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleChecklistChange(item.key)}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                checklist[item.key] ? 'bg-green-500' : 'bg-gray-600'
              }`}>
                <SafeIcon 
                  icon={checklist[item.key] ? FiCheckCircle : item.icon} 
                  className="text-white text-sm" 
                />
              </div>
              <span className={`font-medium ${
                checklist[item.key] ? 'text-green-400' : 'text-gray-300'
              }`}>
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">
            {completedItems}/{totalItems} items completed
          </span>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            isReady ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
          }`}>
            <SafeIcon icon={isReady ? FiCheckCircle : FiAlertCircle} className="text-sm" />
            <span className="text-sm font-medium">
              {isReady ? 'Ready to record!' : 'Check remaining items'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Recording Tips */}
      <motion.div 
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4">Recording Tips</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              className="flex items-start space-x-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="bg-purple-500 p-1 rounded-full mt-1">
                <SafeIcon icon={FiCheckCircle} className="text-white text-xs" />
              </div>
              <span className="text-purple-300 text-sm">{tip}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recording Status */}
      {isRecording && (
        <motion.div 
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <h3 className="text-xl font-semibold text-red-400">Recording in Progress</h3>
          </div>
          
          <div className="space-y-2 text-red-300">
            <p>• Stay focused on your content</p>
            <p>• Speak clearly and at a good pace</p>
            <p>• Don't worry about small mistakes - keep going!</p>
            <p>• Remember your key message and call-to-action</p>
          </div>
        </motion.div>
      )}

      {/* Quick Reference */}
      <motion.div 
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4">Quick Reference</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-purple-400 mb-2">Key Message</h4>
            <p className="text-gray-300 text-sm">{project.key_message}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-purple-400 mb-2">Target Audience</h4>
            <p className="text-gray-300 text-sm">{project.target_audience}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-purple-400 mb-2">Tone</h4>
            <p className="text-gray-300 text-sm">{project.tone}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-purple-400 mb-2">Duration Goal</h4>
            <p className="text-gray-300 text-sm">{project.duration}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ShootingPrompts;