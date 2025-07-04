import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiCamera, FiEdit2, FiMove, FiCopy } = FiIcons;

const ShotListBuilder = ({ project, onDataUpdate }) => {
  const [newShot, setNewShot] = useState({
    title: '',
    type: 'Wide Shot',
    description: '',
    duration: '30 seconds',
    location: '',
    notes: '',
    priority: 'Medium'
  });

  const shotTypes = [
    'Wide Shot',
    'Medium Shot',
    'Close-up',
    'Extreme Close-up',
    'Over-the-shoulder',
    'POV Shot',
    'Establishing Shot',
    'Cutaway',
    'B-Roll',
    'Talking Head'
  ];

  const priorities = ['High', 'Medium', 'Low'];

  const handleAddShot = () => {
    if (!newShot.title.trim()) return;

    const shotList = project.shot_list || [];
    const shot = {
      id: Date.now(),
      ...newShot,
      order: shotList.length + 1,
      completed: false
    };

    onDataUpdate({ shot_list: [...shotList, shot] });
    setNewShot({
      title: '',
      type: 'Wide Shot',
      description: '',
      duration: '30 seconds',
      location: '',
      notes: '',
      priority: 'Medium'
    });
  };

  const updateShot = (shotId, updates) => {
    const shotList = project.shot_list || [];
    onDataUpdate({
      shot_list: shotList.map(shot =>
        shot.id === shotId ? { ...shot, ...updates } : shot
      )
    });
  };

  const removeShot = (shotId) => {
    const shotList = project.shot_list || [];
    onDataUpdate({
      shot_list: shotList.filter(shot => shot.id !== shotId)
    });
  };

  const duplicateShot = (shotToDuplicate) => {
    const shotList = project.shot_list || [];
    const newShot = {
      ...shotToDuplicate,
      id: Date.now(),
      title: `${shotToDuplicate.title} (Copy)`,
      order: shotList.length + 1,
      completed: false
    };

    onDataUpdate({ shot_list: [...shotList, newShot] });
  };

  const moveShot = (shotId, direction) => {
    const shotList = project.shot_list || [];
    const currentIndex = shotList.findIndex(shot => shot.id === shotId);
    
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === shotList.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newShotList = [...shotList];
    [newShotList[currentIndex], newShotList[newIndex]] = [newShotList[newIndex], newShotList[currentIndex]];

    // Update order numbers
    newShotList.forEach((shot, index) => {
      shot.order = index + 1;
    });

    onDataUpdate({ shot_list: newShotList });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const locations = project.locations || [];

  return (
    <div className="space-y-6">
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-2">Shot List Planning Tips</h4>
        <ul className="text-purple-300 text-sm space-y-1">
          <li>• Plan your shots based on your story structure</li>
          <li>• Include variety: wide shots, medium shots, and close-ups</li>
          <li>• Consider shooting order for efficiency</li>
          <li>• Add buffer shots for coverage and editing flexibility</li>
        </ul>
      </div>

      {/* Add New Shot Form */}
      <motion.div
        className="bg-white/5 border border-white/10 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <SafeIcon icon={FiCamera} className="mr-2" />
          Add New Shot
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={newShot.title}
            onChange={(e) => setNewShot({ ...newShot, title: e.target.value })}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Shot title..."
          />

          <select
            value={newShot.type}
            onChange={(e) => setNewShot({ ...newShot, type: e.target.value })}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {shotTypes.map(type => (
              <option key={type} value={type} className="bg-gray-800">{type}</option>
            ))}
          </select>

          <select
            value={newShot.duration}
            onChange={(e) => setNewShot({ ...newShot, duration: e.target.value })}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="15 seconds">15 seconds</option>
            <option value="30 seconds">30 seconds</option>
            <option value="1 minute">1 minute</option>
            <option value="2 minutes">2 minutes</option>
            <option value="3 minutes">3 minutes</option>
            <option value="5 minutes">5 minutes</option>
          </select>

          <select
            value={newShot.priority}
            onChange={(e) => setNewShot({ ...newShot, priority: e.target.value })}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {priorities.map(priority => (
              <option key={priority} value={priority} className="bg-gray-800">{priority}</option>
            ))}
          </select>

          <select
            value={newShot.location}
            onChange={(e) => setNewShot({ ...newShot, location: e.target.value })}
            className="md:col-span-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select location...</option>
            {locations.map(location => (
              <option key={location.id} value={location.name} className="bg-gray-800">
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={newShot.description}
          onChange={(e) => setNewShot({ ...newShot, description: e.target.value })}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-4"
          rows={3}
          placeholder="Shot description..."
        />

        <textarea
          value={newShot.notes}
          onChange={(e) => setNewShot({ ...newShot, notes: e.target.value })}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-4"
          rows={2}
          placeholder="Additional notes..."
        />

        <motion.button
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddShot}
        >
          <SafeIcon icon={FiPlus} className="inline mr-2" />
          Add Shot
        </motion.button>
      </motion.div>

      {/* Shot List */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Shot List ({(project.shot_list || []).length} shots)</h4>
        
        {(project.shot_list || []).map((shot, index) => (
          <motion.div
            key={shot.id}
            className="bg-white/5 border border-white/10 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {shot.order}
                </div>
                <div>
                  <input
                    type="text"
                    value={shot.title}
                    onChange={(e) => updateShot(shot.id, { title: e.target.value })}
                    className="text-lg font-semibold bg-transparent text-white border-none focus:outline-none focus:ring-0 p-0"
                    placeholder="Shot title..."
                  />
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(shot.priority)}`}>
                      {shot.priority}
                    </span>
                    <span className="text-gray-400 text-sm">{shot.type}</span>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-gray-400 text-sm">{shot.duration}</span>
                    {shot.location && (
                      <>
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-gray-400 text-sm">{shot.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <motion.button
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => moveShot(shot.id, 'up')}
                  disabled={index === 0}
                >
                  <SafeIcon icon={FiMove} className="text-blue-400 rotate-180" />
                </motion.button>
                
                <motion.button
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => moveShot(shot.id, 'down')}
                  disabled={index === (project.shot_list || []).length - 1}
                >
                  <SafeIcon icon={FiMove} className="text-blue-400" />
                </motion.button>

                <motion.button
                  className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => duplicateShot(shot)}
                >
                  <SafeIcon icon={FiCopy} className="text-green-400" />
                </motion.button>

                <motion.button
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => removeShot(shot.id)}
                >
                  <SafeIcon icon={FiTrash2} className="text-red-400" />
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <select
                value={shot.type}
                onChange={(e) => updateShot(shot.id, { type: e.target.value })}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {shotTypes.map(type => (
                  <option key={type} value={type} className="bg-gray-800">{type}</option>
                ))}
              </select>

              <select
                value={shot.duration}
                onChange={(e) => updateShot(shot.id, { duration: e.target.value })}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="15 seconds">15 seconds</option>
                <option value="30 seconds">30 seconds</option>
                <option value="1 minute">1 minute</option>
                <option value="2 minutes">2 minutes</option>
                <option value="3 minutes">3 minutes</option>
                <option value="5 minutes">5 minutes</option>
              </select>

              <select
                value={shot.priority}
                onChange={(e) => updateShot(shot.id, { priority: e.target.value })}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority} className="bg-gray-800">{priority}</option>
                ))}
              </select>

              <select
                value={shot.location}
                onChange={(e) => updateShot(shot.id, { location: e.target.value })}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select location...</option>
                {locations.map(location => (
                  <option key={location.id} value={location.name} className="bg-gray-800">
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              value={shot.description}
              onChange={(e) => updateShot(shot.id, { description: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-3"
              rows={2}
              placeholder="Shot description..."
            />

            <textarea
              value={shot.notes}
              onChange={(e) => updateShot(shot.id, { notes: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
              placeholder="Additional notes..."
            />
          </motion.div>
        ))}

        {(project.shot_list || []).length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <SafeIcon icon={FiCamera} className="text-4xl mx-auto mb-4 opacity-50" />
            <p>No shots added yet. Create your first shot above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShotListBuilder;