import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import Tooltip from './Tooltip';
import * as FiIcons from 'react-icons/fi';

const { 
  FiGrid, FiList, FiLayers, FiCamera, FiClock, FiMapPin, 
  FiFlag, FiEdit2, FiCheck, FiPlay, FiPause 
} = FiIcons;

const ShotVisualization = ({ shots, onShotUpdate, scenes }) => {
  const [viewMode, setViewMode] = useState('scene-board'); // scene-board, grid, timeline
  const [selectedScene, setSelectedScene] = useState(null);

  const viewModes = [
    { id: 'scene-board', label: 'Scene Board', icon: FiLayers },
    { id: 'grid', label: 'Shot Grid', icon: FiGrid },
    { id: 'timeline', label: 'Timeline', icon: FiClock }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'border-l-red-500 bg-red-500/5';
      case 'Medium': return 'border-l-yellow-500 bg-yellow-500/5';
      case 'Low': return 'border-l-green-500 bg-green-500/5';
      default: return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400';
      case 'pending': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const groupShotsByScene = () => {
    const grouped = {};
    shots.forEach(shot => {
      const sceneKey = shot.scene_number ? `Scene ${shot.scene_number}` : 'Unassigned';
      if (!grouped[sceneKey]) {
        grouped[sceneKey] = [];
      }
      grouped[sceneKey].push(shot);
    });
    return grouped;
  };

  const ShotCard = ({ shot, compact = false }) => (
    <motion.div
      className={`bg-white/10 border border-white/20 rounded-lg p-3 hover:bg-white/15 transition-all cursor-pointer ${
        compact ? 'border-l-4' : ''
      } ${compact ? getPriorityColor(shot.priority) : ''}`}
      whileHover={{ scale: 1.02 }}
      layout
    >
      {/* Shot Image */}
      {shot.image_url && !compact && (
        <div className="mb-3">
          <img 
            src={shot.image_url} 
            alt={shot.title}
            className="w-full h-24 object-cover rounded-lg"
          />
        </div>
      )}

      {shot.image_url && compact && (
        <div className="float-right ml-2 mb-2">
          <img 
            src={shot.image_url} 
            alt={shot.title}
            className="w-12 h-12 object-cover rounded"
          />
        </div>
      )}

      {/* Shot Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-white text-sm truncate">
            {shot.title}
          </h4>
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(shot.status)}`}>
            {shot.status || 'pending'}
          </span>
        </div>

        {!compact && shot.description && (
          <p className="text-gray-400 text-xs line-clamp-2">{shot.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{shot.shot_type}</span>
          <span>{shot.duration}</span>
        </div>

        {!compact && (
          <div className="flex items-center space-x-1">
            <span className={`px-2 py-1 rounded text-xs border ${
              shot.priority === 'High' ? 'border-red-500/50 text-red-400' :
              shot.priority === 'Medium' ? 'border-yellow-500/50 text-yellow-400' :
              'border-green-500/50 text-green-400'
            }`}>
              {shot.priority}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderSceneBoard = () => {
    const groupedShots = groupShotsByScene();
    
    return (
      <div className="space-y-6">
        {Object.entries(groupedShots).map(([sceneName, sceneShots]) => {
          const completedShots = sceneShots.filter(shot => shot.status === 'completed').length;
          const totalShots = sceneShots.length;
          const progress = totalShots > 0 ? (completedShots / totalShots) * 100 : 0;

          return (
            <motion.div
              key={sceneName}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Scene Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500 text-white rounded-lg p-2">
                    <SafeIcon icon={FiCamera} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{sceneName}</h3>
                    <p className="text-sm text-gray-400">{totalShots} shots</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">
                    {completedShots}/{totalShots} completed
                  </div>
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Scene Description */}
              {scenes.find(s => `Scene ${s.scene_number}` === sceneName) && (
                <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-purple-300 text-sm">
                    {scenes.find(s => `Scene ${s.scene_number}` === sceneName)?.description}
                  </p>
                </div>
              )}

              {/* Shots Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sceneShots.map(shot => (
                  <ShotCard key={shot.id} shot={shot} />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {shots.map(shot => (
        <ShotCard key={shot.id} shot={shot} />
      ))}
    </div>
  );

  const renderTimeline = () => {
    const groupedShots = groupShotsByScene();
    
    return (
      <div className="space-y-6">
        {Object.entries(groupedShots).map(([sceneName, sceneShots]) => (
          <div key={sceneName} className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500"></div>
            
            {/* Scene Node */}
            <div className="flex items-start space-x-4">
              <div className="bg-purple-500 text-white rounded-full p-3 z-10 relative">
                <SafeIcon icon={FiPlay} />
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{sceneName}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {sceneShots.map(shot => (
                    <ShotCard key={shot.id} shot={shot} compact />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* View Mode Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
          {viewModes.map(mode => (
            <Tooltip key={mode.id} content={mode.label}>
              <motion.button
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  viewMode === mode.id 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                onClick={() => setViewMode(mode.id)}
              >
                <SafeIcon icon={mode.icon} />
                <span className="text-sm hidden sm:inline">{mode.label}</span>
              </motion.button>
            </Tooltip>
          ))}
        </div>

        <div className="text-sm text-gray-400">
          {shots.length} total shots • {shots.filter(s => s.status === 'completed').length} completed
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {viewMode === 'scene-board' && renderSceneBoard()}
        {viewMode === 'grid' && renderGrid()}
        {viewMode === 'timeline' && renderTimeline()}
      </div>
    </div>
  );
};

export default ShotVisualization;