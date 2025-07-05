import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import ImageUpload from './ImageUpload';
import { InfoTooltip } from './Tooltip';
import supabase from '../lib/supabase';
import { useProject } from '../context/ProjectContext';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiCamera, FiEdit2, FiCopy, FiEye, FiGrid, FiLayers, FiChevronDown, FiChevronUp, FiTarget, FiMapPin, FiClock, FiFlag, FiSave, FiX, FiCheck, FiRefreshCw, FiMove } = FiIcons;

const EnhancedShotListBuilder = ({ project, onDataUpdate }) => {
  const { user } = useProject();
  const [shots, setShots] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [expandedScenes, setExpandedScenes] = useState(new Set([1])); // Expand first scene by default
  const [loading, setLoading] = useState(false);
  const [editingShot, setEditingShot] = useState(null);
  const [scenesLoading, setScenesLoading] = useState(true);

  const shotTypes = [
    'Wide Shot', 'Medium Shot', 'Close-up', 'Extreme Close-up', 'Over-the-shoulder', 
    'POV Shot', 'Establishing Shot', 'Cutaway', 'B-Roll', 'Talking Head', 'Insert Shot', 'Reaction Shot'
  ];

  const cameraMovements = [
    'Static', 'Pan Left', 'Pan Right', 'Tilt Up', 'Tilt Down', 'Zoom In', 'Zoom Out', 
    'Dolly In', 'Dolly Out', 'Tracking Left', 'Tracking Right', 'Handheld', 'Steadicam', 
    'Crane Up', 'Crane Down', 'Gimbal Movement', 'Slider Left', 'Slider Right'
  ];

  const priorities = ['High', 'Medium', 'Low'];

  useEffect(() => {
    if (project?.id) {
      loadShots();
      loadScenes();
    }
  }, [project?.id]);

  const loadShots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shot_lists_fc2024')
        .select('*')
        .eq('project_id', project.id)
        .order('scene_number', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error loading shots:', error);
        return;
      }

      console.log('Loaded shots:', data);
      setShots(data || []);
    } catch (error) {
      console.error('Error loading shots:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadScenes = async () => {
    try {
      setScenesLoading(true);
      console.log('Loading scenes for project:', project.id);

      // First try to load from scenes table
      const { data: scenesData, error: scenesError } = await supabase
        .from('scenes_fc2024')
        .select('*')
        .eq('project_id', project.id)
        .order('scene_number', { ascending: true });

      if (scenesError) {
        console.error('Error loading scenes:', scenesError);
        // Fall back to story structure
        createScenesFromStoryStructure();
        return;
      }

      console.log('Loaded scenes from database:', scenesData);

      if (scenesData && scenesData.length > 0) {
        setScenes(scenesData);
        // Expand first scene by default
        setExpandedScenes(new Set([scenesData[0].scene_number]));
      } else {
        console.log('No scenes found, creating from story structure...');
        createScenesFromStoryStructure();
      }
    } catch (error) {
      console.error('Error loading scenes:', error);
      createScenesFromStoryStructure();
    } finally {
      setScenesLoading(false);
    }
  };

  const createScenesFromStoryStructure = () => {
    console.log('Creating scenes from story structure:', project.story_structure);
    
    if (project?.story_structure && project.story_structure.length > 0) {
      const scenesFromStory = project.story_structure.map((segment, index) => ({
        id: `temp-${index}`,
        scene_number: index + 1,
        title: segment.title || `Scene ${index + 1}`,
        description: segment.description || '',
        act: segment.act || 'setup', // Keep act in local state for UI purposes
        location: segment.location || '',
        location_type: segment.location_type || 'Indoor',
        resources: project.resources || {}
      }));
      
      console.log('Created scenes from story structure:', scenesFromStory);
      setScenes(scenesFromStory);
      setExpandedScenes(new Set([1]));
    } else {
      // Create a default scene if no story structure exists
      const defaultScene = {
        id: 'temp-default',
        scene_number: 1,
        title: 'Scene 1',
        description: 'Main scene',
        act: 'setup',
        location: '',
        location_type: 'Indoor',
        resources: {}
      };
      
      console.log('Created default scene:', defaultScene);
      setScenes([defaultScene]);
      setExpandedScenes(new Set([1]));
    }
  };

  const handleAddShot = async (sceneNumber) => {
    if (!user) {
      alert('You must be logged in to add shots.');
      return;
    }

    const sceneShots = shots.filter(shot => shot.scene_number === sceneNumber);
    const scene = scenes.find(s => s.scene_number === sceneNumber);
    
    // Include camera_movement in the shot creation
    const newShot = {
      project_id: project.id,
      scene_number: sceneNumber,
      title: `${scene?.title || 'Scene'} - Shot ${sceneShots.length + 1}`,
      shot_type: 'Medium Shot',
      camera_movement: 'Static',
      description: '',
      duration: '30 seconds',
      priority: 'Medium',
      notes: '',
      order_index: sceneShots.length + 1,
      status: 'pending'
    };

    try {
      setLoading(true);
      console.log('Adding shot:', newShot);

      const { data, error } = await supabase
        .from('shot_lists_fc2024')
        .insert([newShot])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding shot:', error);
        alert(`Failed to add shot: ${error.message}`);
        return;
      }

      console.log('Added shot successfully:', data);
      setShots(prev => [...prev, data]);
      
      // Automatically start editing the new shot
      setEditingShot(data.id);
    } catch (error) {
      console.error('Error adding shot:', error);
      alert(`Failed to add shot: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateShot = async (shotId, updates) => {
    try {
      const { data, error } = await supabase
        .from('shot_lists_fc2024')
        .update(updates)
        .eq('id', shotId)
        .select()
        .single();

      if (error) throw error;

      setShots(prev => prev.map(shot => shot.id === shotId ? data : shot));
    } catch (error) {
      console.error('Error updating shot:', error);
    }
  };

  const removeShot = async (shotId) => {
    if (!window.confirm('Are you sure you want to delete this shot?')) return;

    try {
      const { error } = await supabase
        .from('shot_lists_fc2024')
        .delete()
        .eq('id', shotId);

      if (error) throw error;

      setShots(prev => prev.filter(shot => shot.id !== shotId));
      
      // Clear editing state if this shot was being edited
      if (editingShot === shotId) {
        setEditingShot(null);
      }
    } catch (error) {
      console.error('Error removing shot:', error);
    }
  };

  const duplicateShot = async (shotToDuplicate) => {
    try {
      const { data, error } = await supabase
        .from('shot_lists_fc2024')
        .insert([{
          ...shotToDuplicate,
          id: undefined,
          title: `${shotToDuplicate.title} (Copy)`,
          order_index: shotToDuplicate.order_index + 0.5,
          image_url: null,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      setShots(prev => [...prev, data]);
    } catch (error) {
      console.error('Error duplicating shot:', error);
    }
  };

  const toggleSceneExpanded = (sceneNumber) => {
    const newExpanded = new Set(expandedScenes);
    if (newExpanded.has(sceneNumber)) {
      newExpanded.delete(sceneNumber);
    } else {
      newExpanded.add(sceneNumber);
    }
    setExpandedScenes(newExpanded);
  };

  const getShotsByScene = (sceneNumber) => {
    return shots.filter(shot => shot.scene_number === sceneNumber);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getActColor = (act) => {
    switch (act) {
      case 'setup': return 'from-blue-500 to-cyan-500';
      case 'conflict': return 'from-orange-500 to-red-500';
      case 'resolution': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const forceRefreshScenes = async () => {
    setScenesLoading(true);
    setScenes([]);
    await loadScenes();
  };

  if (scenesLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-400 mt-2">Loading scenes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-semibold text-white">Shot List Planning</h4>
          <motion.button
            className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-sm transition-all"
            whileHover={{ scale: 1.05 }}
            onClick={forceRefreshScenes}
          >
            <SafeIcon icon={FiRefreshCw} className="inline mr-1" />
            Refresh Scenes
          </motion.button>
        </div>
        <ul className="text-purple-300 text-sm space-y-1">
          <li>• Organize shots by scenes for better production workflow</li>
          <li>• Click "Edit" on any shot to modify its details</li>
          <li>• Upload reference images to visualize your shots</li>
          <li>• Set priorities to focus on essential shots first</li>
        </ul>
      </div>

      {/* Scenes Status */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-semibold text-white">Scenes Status</h5>
            <p className="text-blue-300 text-sm">
              {scenes.length > 0 ? `${scenes.length} scenes loaded` : 'No scenes available'}
            </p>
          </div>
          {scenes.length === 0 && (
            <div className="text-yellow-400 text-sm">
              ⚠️ Generate scenes from Story Structure first
            </div>
          )}
        </div>
      </div>

      {/* Scene-Based Shot Organization */}
      <div className="space-y-6">
        {scenes.map((scene) => {
          const sceneShots = getShotsByScene(scene.scene_number);
          const isExpanded = expandedScenes.has(scene.scene_number);

          return (
            <motion.div
              key={scene.scene_number}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Scene Header */}
              <div
                className="p-4 cursor-pointer hover:bg-white/5 transition-all"
                onClick={() => toggleSceneExpanded(scene.scene_number)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`bg-gradient-to-r ${getActColor(scene.act)} text-white rounded-lg p-3`}>
                      <SafeIcon icon={isExpanded ? FiChevronDown : FiChevronUp} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{scene.title}</h3>
                      <p className="text-gray-400 text-sm">{scene.description}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className="capitalize">{scene.act}</span>
                        <span>•</span>
                        <span>{sceneShots.length} shots</span>
                        {scene.location && (
                          <>
                            <span>•</span>
                            <span>{scene.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all"
                    whileHover={{ scale: 1.05 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddShot(scene.scene_number);
                    }}
                    disabled={loading}
                  >
                    <SafeIcon icon={FiPlus} className="inline mr-2" />
                    {loading ? 'Adding...' : 'Add Shot'}
                  </motion.button>
                </div>
              </div>

              {/* Scene Shots */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/10"
                  >
                    <div className="p-6 space-y-4">
                      {sceneShots.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <SafeIcon icon={FiCamera} className="text-4xl mx-auto mb-3 opacity-50" />
                          <p className="text-lg">No shots in this scene yet</p>
                          <p className="text-sm">Click "Add Shot" to get started</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {sceneShots.map((shot, index) => (
                            <ShotCard
                              key={shot.id}
                              shot={shot}
                              shotIndex={index + 1}
                              isEditing={editingShot === shot.id}
                              onEdit={() => setEditingShot(shot.id)}
                              onSave={() => setEditingShot(null)}
                              onCancel={() => setEditingShot(null)}
                              onUpdate={updateShot}
                              onRemove={removeShot}
                              onDuplicate={duplicateShot}
                              shotTypes={shotTypes}
                              cameraMovements={cameraMovements}
                              priorities={priorities}
                              getPriorityColor={getPriorityColor}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-3">Shot List Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-400">{shots.length}</div>
            <div className="text-sm text-gray-400">Total Shots</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{scenes.length}</div>
            <div className="text-sm text-gray-400">Scenes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">
              {shots.filter(s => s.priority === 'High').length}
            </div>
            <div className="text-sm text-gray-400">High Priority</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {shots.filter(s => s.image_url).length}
            </div>
            <div className="text-sm text-gray-400">With References</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Shot Card Component
const ShotCard = ({ shot, shotIndex, isEditing, onEdit, onSave, onCancel, onUpdate, onRemove, onDuplicate, shotTypes, cameraMovements, priorities, getPriorityColor }) => {
  const [localShot, setLocalShot] = useState(shot);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalShot(shot);
  }, [shot]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(shot.id, localShot);
      onSave();
    } catch (error) {
      console.error('Error saving shot:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalShot(shot);
    onCancel();
  };

  if (isEditing) {
    return (
      <motion.div
        className="bg-white/10 border-2 border-purple-500/50 rounded-lg p-6"
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Editing Shot {shotIndex}</h4>
          <div className="flex items-center space-x-2">
            <motion.button
              className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
              whileHover={{ scale: 1.02 }}
              onClick={handleSave}
              disabled={saving}
            >
              <SafeIcon icon={FiCheck} className="inline mr-1" />
              {saving ? 'Saving...' : 'Save'}
            </motion.button>
            <motion.button
              className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all"
              whileHover={{ scale: 1.02 }}
              onClick={handleCancel}
              disabled={saving}
            >
              <SafeIcon icon={FiX} className="inline mr-1" />
              Cancel
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reference Image */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Reference Image</label>
            <ImageUpload
              onImageUploaded={(url) => setLocalShot({ ...localShot, image_url: url })}
              currentImage={localShot.image_url}
              shotId={shot.id}
            />
          </div>

          {/* Shot Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Shot Title</label>
                <input
                  type="text"
                  value={localShot.title}
                  onChange={(e) => setLocalShot({ ...localShot, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Shot title..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Shot Type</label>
                <select
                  value={localShot.shot_type}
                  onChange={(e) => setLocalShot({ ...localShot, shot_type: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {shotTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Camera Movement and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  <SafeIcon icon={FiMove} className="inline mr-1" />
                  Camera Movement
                </label>
                <select
                  value={localShot.camera_movement || 'Static'}
                  onChange={(e) => setLocalShot({ ...localShot, camera_movement: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {cameraMovements.map(movement => (
                    <option key={movement} value={movement}>{movement}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Duration</label>
                <select
                  value={localShot.duration}
                  onChange={(e) => setLocalShot({ ...localShot, duration: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="15 seconds">15 seconds</option>
                  <option value="30 seconds">30 seconds</option>
                  <option value="1 minute">1 minute</option>
                  <option value="2 minutes">2 minutes</option>
                  <option value="3 minutes">3 minutes</option>
                </select>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Priority</label>
              <select
                value={localShot.priority}
                onChange={(e) => setLocalShot({ ...localShot, priority: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Description</label>
              <textarea
                value={localShot.description}
                onChange={(e) => setLocalShot({ ...localShot, description: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={2}
                placeholder="Describe the shot, camera angle, action..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Notes</label>
              <textarea
                value={localShot.notes}
                onChange={(e) => setLocalShot({ ...localShot, notes: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={2}
                placeholder="Equipment needed, special instructions..."
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all group"
      layout
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start space-x-4">
        {/* Shot Number */}
        <div className="flex-shrink-0">
          <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
            {shotIndex}
          </div>
        </div>

        {/* Shot Image */}
        <div className="flex-shrink-0">
          {shot.image_url ? (
            <img
              src={shot.image_url}
              alt={shot.title}
              className="w-20 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-20 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiCamera} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Shot Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-white">{shot.title}</h4>
              <p className="text-gray-400 text-sm">{shot.shot_type}</p>
              {shot.camera_movement && (
                <p className="text-blue-400 text-xs flex items-center">
                  <SafeIcon icon={FiMove} className="mr-1" />
                  {shot.camera_movement}
                </p>
              )}
            </div>
            <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(shot.priority)}`}>
              {shot.priority}
            </span>
          </div>

          {shot.description && (
            <p className="text-gray-300 text-sm line-clamp-2">{shot.description}</p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{shot.duration}</span>
              <span>•</span>
              <span>{shot.shot_type}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-sm transition-all"
              whileHover={{ scale: 1.05 }}
              onClick={onEdit}
            >
              <SafeIcon icon={FiEdit2} className="inline mr-1" />
              Edit
            </motion.button>
            <motion.button
              className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-sm transition-all"
              whileHover={{ scale: 1.05 }}
              onClick={() => onDuplicate(shot)}
            >
              <SafeIcon icon={FiCopy} className="inline mr-1" />
              Duplicate
            </motion.button>
            <motion.button
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-all"
              whileHover={{ scale: 1.05 }}
              onClick={() => onRemove(shot.id)}
            >
              <SafeIcon icon={FiTrash2} className="inline mr-1" />
              Delete
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedShotListBuilder;