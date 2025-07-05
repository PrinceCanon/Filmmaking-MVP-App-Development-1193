import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { FiCamera, FiCheck, FiPlay, FiPause, FiRotateCcw, FiEdit2, FiFilter, FiArrowLeft, FiVideo, FiSun, FiMic, FiEye, FiCheckCircle, FiAlertCircle, FiClock, FiMapPin, FiFlag, FiUsers, FiGrid, FiList, FiTarget, FiLayers, FiPackage, FiChevronDown, FiChevronRight, FiBarChart3, FiRefreshCw, FiMove, FiPlus, FiTrash2, FiSave, FiX } = FiIcons;

const Shooting = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject, updateProject } = useProject();
  const [project, setProject] = useState(null);
  const [shots, setShots] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [expandedScenes, setExpandedScenes] = useState(new Set());
  const [sceneChecklists, setSceneChecklists] = useState({});
  const [sceneResources, setSceneResources] = useState({});
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('scenes'); // scenes, all-shots
  const [loading, setLoading] = useState(true);
  const [expandedShotDetails, setExpandedShotDetails] = useState(new Set());

  // Scene-level checklist items
  const sceneChecklistItems = [
    { key: 'lighting_setup', label: 'Lighting setup complete', icon: FiSun },
    { key: 'audio_check', label: 'Audio equipment tested', icon: FiMic },
    { key: 'location_ready', label: 'Location prepared', icon: FiMapPin },
    { key: 'props_ready', label: 'Props and costumes ready', icon: FiPackage },
    { key: 'equipment_check', label: 'All equipment present', icon: FiCamera },
    { key: 'team_ready', label: 'Team briefed and ready', icon: FiUsers }
  ];

  useEffect(() => {
    const projectData = getProject(projectId);
    if (projectData) {
      setProject(projectData);
      loadShots();
      loadScenes();
    } else {
      navigate('/');
    }
  }, [projectId, getProject, navigate]);

  const loadShots = async () => {
    try {
      console.log('Loading shots for project:', projectId);
      const { data, error } = await supabase
        .from('shot_lists_fc2024')
        .select('*')
        .eq('project_id', projectId)
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
    }
  };

  const loadScenes = async () => {
    try {
      console.log('Loading scenes for project:', projectId);
      // First try to load from scenes table
      const { data: scenesData, error: scenesError } = await supabase
        .from('scenes_fc2024')
        .select('*')
        .eq('project_id', projectId)
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
        // Initialize checklists and resources
        const checklists = {};
        const resources = {};
        scenesData.forEach(scene => {
          checklists[scene.scene_number] = scene.checklist || {};
          resources[scene.scene_number] = scene.resources || {};
        });
        setSceneChecklists(checklists);
        setSceneResources(resources);
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
      setLoading(false);
    }
  };

  const createScenesFromStoryStructure = () => {
    console.log('Creating scenes from story structure:', project?.story_structure);
    
    if (project?.story_structure && project.story_structure.length > 0) {
      const scenesFromStory = project.story_structure.map((segment, index) => ({
        id: `temp-${index}`,
        scene_number: index + 1,
        title: segment.title || `Scene ${index + 1}`,
        description: segment.description || '',
        location: segment.location || '',
        location_type: segment.location_type || 'Indoor',
        resources: segment.resources || project.resources || {},
        checklist: {}
      }));
      
      console.log('Created scenes from story structure:', scenesFromStory);
      setScenes(scenesFromStory);
      
      // Initialize checklists and resources
      const checklists = {};
      const resources = {};
      scenesFromStory.forEach(scene => {
        checklists[scene.scene_number] = {};
        resources[scene.scene_number] = scene.resources || {};
      });
      setSceneChecklists(checklists);
      setSceneResources(resources);
      
      // Expand first scene by default
      setExpandedScenes(new Set([1]));
    } else {
      // Create a default scene if no story structure exists
      const defaultScene = {
        id: 'temp-default',
        scene_number: 1,
        title: 'Scene 1',
        description: 'Main scene',
        location: '',
        location_type: 'Indoor',
        resources: {},
        checklist: {}
      };
      
      console.log('Created default scene:', defaultScene);
      setScenes([defaultScene]);
      setSceneChecklists({ 1: {} });
      setSceneResources({ 1: {} });
      setExpandedScenes(new Set([1]));
    }
    setLoading(false);
  };

  const handleSceneChecklistChange = async (sceneNumber, item) => {
    const newChecklists = {
      ...sceneChecklists,
      [sceneNumber]: {
        ...sceneChecklists[sceneNumber],
        [item]: !sceneChecklists[sceneNumber]?.[item]
      }
    };
    setSceneChecklists(newChecklists);

    // Update in database if scene exists
    try {
      const scene = scenes.find(s => s.scene_number === sceneNumber);
      if (scene && !scene.id?.toString().startsWith('temp-')) {
        await supabase
          .from('scenes_fc2024')
          .update({ checklist: newChecklists[sceneNumber] })
          .eq('project_id', projectId)
          .eq('scene_number', sceneNumber);
      }
    } catch (error) {
      console.error('Error updating scene checklist:', error);
    }
  };

  const handleSceneResourceUpdate = async (sceneNumber, category, items) => {
    const newResources = {
      ...sceneResources,
      [sceneNumber]: {
        ...sceneResources[sceneNumber],
        [category]: items
      }
    };
    setSceneResources(newResources);

    // Update in database if scene exists
    try {
      const scene = scenes.find(s => s.scene_number === sceneNumber);
      if (scene && !scene.id?.toString().startsWith('temp-')) {
        await supabase
          .from('scenes_fc2024')
          .update({ resources: newResources[sceneNumber] })
          .eq('project_id', projectId)
          .eq('scene_number', sceneNumber);
      }
    } catch (error) {
      console.error('Error updating scene resources:', error);
    }
  };

  const handleShotComplete = async (shotId) => {
    try {
      const { error } = await supabase
        .from('shot_lists_fc2024')
        .update({ status: 'completed' })
        .eq('id', shotId);

      if (error) throw error;

      setShots(prev => prev.map(shot => 
        shot.id === shotId ? { ...shot, status: 'completed' } : shot
      ));
    } catch (error) {
      console.error('Error completing shot:', error);
    }
  };

  const handleRetakeShot = async (shotId) => {
    try {
      const { error } = await supabase
        .from('shot_lists_fc2024')
        .update({ status: 'pending' })
        .eq('id', shotId);

      if (error) throw error;

      setShots(prev => prev.map(shot => 
        shot.id === shotId ? { ...shot, status: 'pending' } : shot
      ));
    } catch (error) {
      console.error('Error retaking shot:', error);
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

  const toggleShotDetails = (shotId) => {
    const newExpanded = new Set(expandedShotDetails);
    if (newExpanded.has(shotId)) {
      newExpanded.delete(shotId);
    } else {
      newExpanded.add(shotId);
    }
    setExpandedShotDetails(newExpanded);
  };

  const getSceneProgress = (sceneNumber) => {
    const sceneShots = shots.filter(shot => shot.scene_number === sceneNumber);
    const completedShots = sceneShots.filter(shot => shot.status === 'completed');
    return sceneShots.length > 0 ? (completedShots.length / sceneShots.length) * 100 : 0;
  };

  const getOverallProgress = () => {
    const totalShots = shots.length;
    const completedShots = shots.filter(shot => shot.status === 'completed').length;
    return totalShots > 0 ? (completedShots / totalShots) * 100 : 0;
  };

  const getSceneChecklistProgress = (sceneNumber) => {
    const checklist = sceneChecklists[sceneNumber] || {};
    const completed = Object.values(checklist).filter(Boolean).length;
    return sceneChecklistItems.length > 0 ? (completed / sceneChecklistItems.length) * 100 : 0;
  };

  const isSceneChecklistComplete = (sceneNumber) => {
    const checklist = sceneChecklists[sceneNumber] || {};
    return sceneChecklistItems.every(item => checklist[item.key]);
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([loadShots(), loadScenes()]);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-white mt-4">Loading project...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-white mt-4">Loading scenes and shots...</p>
        </div>
      </div>
    );
  }

  const overallProgress = getOverallProgress();
  const completedScenes = scenes.filter(scene => getSceneProgress(scene.scene_number) === 100).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Phase Indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500/20 rounded-full border border-red-500/30">
            <SafeIcon icon={FiVideo} className="text-red-400" />
            <span className="text-red-400 font-medium">Shooting Phase</span>
          </div>
        </div>

        {/* Project Header with Progress */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
          <p className="text-gray-300 mb-6">{project.concept}</p>
          
          {/* Overall Progress */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Project Progress</h3>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiBarChart3} className="text-orange-400" />
                  <motion.button
                    className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-sm transition-all"
                    whileHover={{ scale: 1.05 }}
                    onClick={refreshData}
                  >
                    <SafeIcon icon={FiRefreshCw} className="inline mr-1" />
                    Refresh
                  </motion.button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Overall Shots</span>
                    <span className="text-sm text-orange-400">
                      {shots.filter(s => s.status === 'completed').length}/{shots.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <div className="text-sm text-orange-400 mt-1">
                    {overallProgress.toFixed(1)}% Complete
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Scenes</span>
                    <span className="text-sm text-green-400">{completedScenes}/{scenes.length}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${scenes.length > 0 ? (completedScenes / scenes.length) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="text-sm text-green-400 mt-1">
                    {scenes.length > 0 ? ((completedScenes / scenes.length) * 100).toFixed(1) : 0}% Complete
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
              <motion.button
                className={`px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'scenes' 
                    ? 'bg-red-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                onClick={() => setViewMode('scenes')}
              >
                <SafeIcon icon={FiLayers} className="inline mr-2" />
                By Scenes
              </motion.button>
              <motion.button
                className={`px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'all-shots' 
                    ? 'bg-red-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                onClick={() => setViewMode('all-shots')}
              >
                <SafeIcon icon={FiGrid} className="inline mr-2" />
                All Shots
              </motion.button>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {shots.length} total shots • {scenes.length} scenes
          </div>
        </div>

        {/* No Data State */}
        {scenes.length === 0 && shots.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl">
            <SafeIcon icon={FiCamera} className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No scenes or shots found</h3>
            <p className="text-gray-400 mb-6">Please go back to Planning to create your story structure and shot list</p>
            <motion.button
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(`/planning/${projectId}`)}
            >
              Go to Planning
            </motion.button>
          </div>
        ) : (
          <>
            {/* Scene-Based View */}
            {viewMode === 'scenes' && (
              <div className="space-y-6">
                {scenes.map((scene) => {
                  const sceneShots = shots.filter(shot => shot.scene_number === scene.scene_number);
                  const sceneProgress = getSceneProgress(scene.scene_number);
                  const checklistProgress = getSceneChecklistProgress(scene.scene_number);
                  const isExpanded = expandedScenes.has(scene.scene_number);
                  const resources = sceneResources[scene.scene_number] || {};

                  return (
                    <motion.div
                      key={scene.scene_number}
                      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {/* Scene Header */}
                      <div
                        className="p-6 cursor-pointer hover:bg-white/5 transition-all"
                        onClick={() => toggleSceneExpanded(scene.scene_number)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-3">
                              <SafeIcon icon={isExpanded ? FiChevronDown : FiChevronRight} />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-white">{scene.title}</h3>
                              <p className="text-gray-400">{scene.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
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
                          <div className="text-right space-y-2">
                            {/* Shot Progress */}
                            <div>
                              <div className="text-sm text-gray-400 mb-1">
                                Shots: {sceneShots.filter(s => s.status === 'completed').length}/{sceneShots.length}
                              </div>
                              <div className="w-32 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all" 
                                  style={{ width: `${sceneProgress}%` }}
                                />
                              </div>
                            </div>
                            {/* Checklist Progress */}
                            <div>
                              <div className="text-sm text-gray-400 mb-1">
                                Setup: {Object.values(sceneChecklists[scene.scene_number] || {}).filter(Boolean).length}/{sceneChecklistItems.length}
                              </div>
                              <div className="w-32 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all" 
                                  style={{ width: `${checklistProgress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-white/10"
                          >
                            <div className="p-6 space-y-6">
                              {/* Scene Setup and Resources Grid */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Scene Setup Checklist */}
                                <div>
                                  <h4 className="text-lg font-semibold text-white mb-4">Scene Setup Checklist</h4>
                                  <div className="grid grid-cols-1 gap-2">
                                    {sceneChecklistItems.map((item) => (
                                      <motion.div
                                        key={item.key}
                                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                                          sceneChecklists[scene.scene_number]?.[item.key]
                                            ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                                            : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                                        }`}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => handleSceneChecklistChange(scene.scene_number, item.key)}
                                      >
                                        <SafeIcon icon={sceneChecklists[scene.scene_number]?.[item.key] ? FiCheck : item.icon} />
                                        <span>{item.label}</span>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>

                                {/* Scene Resources */}
                                <SceneResourcesManager 
                                  sceneNumber={scene.scene_number}
                                  resources={resources}
                                  projectResources={project.resources || {}}
                                  onResourceUpdate={handleSceneResourceUpdate}
                                />
                              </div>

                              {/* Scene Shots */}
                              <div>
                                <h4 className="text-lg font-semibold text-white mb-4">Shots in this Scene</h4>
                                {sceneShots.length === 0 ? (
                                  <div className="text-center py-8 text-gray-400">
                                    <SafeIcon icon={FiCamera} className="text-4xl mx-auto mb-3 opacity-50" />
                                    <p className="text-lg">No shots in this scene yet</p>
                                    <p className="text-sm">Go to Planning to add shots to this scene</p>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {sceneShots.map((shot) => (
                                      <DetailedShotCard
                                        key={shot.id}
                                        shot={shot}
                                        isExpanded={expandedShotDetails.has(shot.id)}
                                        onToggleExpanded={() => toggleShotDetails(shot.id)}
                                        onComplete={handleShotComplete}
                                        onRetake={handleRetakeShot}
                                        sceneChecklistComplete={isSceneChecklistComplete(scene.scene_number)}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* All Shots View */}
            {viewMode === 'all-shots' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {shots.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-white/5 rounded-xl">
                    <SafeIcon icon={FiCamera} className="text-6xl text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No shots found</h3>
                    <p className="text-gray-400 mb-6">Please go back to Planning to create your shot list</p>
                    <motion.button
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                      whileHover={{ scale: 1.05 }}
                      onClick={() => navigate(`/planning/${projectId}`)}
                    >
                      Go to Planning
                    </motion.button>
                  </div>
                ) : (
                  shots.map((shot) => (
                    <ShotCard
                      key={shot.id}
                      shot={shot}
                      onComplete={handleShotComplete}
                      onRetake={handleRetakeShot}
                      sceneChecklistComplete={true} // Allow completion in all-shots view
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/10">
          <motion.button
            className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/planning/${projectId}`)}
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>Back to Planning</span>
          </motion.button>

          {overallProgress === 100 && (
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg font-semibold text-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                await updateProject(projectId, {
                  phase: 'completed',
                  completed_at: new Date().toISOString()
                });
                navigate(`/project/${projectId}`);
              }}
            >
              <SafeIcon icon={FiCheck} className="inline mr-2" />
              Complete Project
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

// Scene Resources Manager Component
const SceneResourcesManager = ({ sceneNumber, resources, projectResources, onResourceUpdate }) => {
  const [editingCategory, setEditingCategory] = useState(null);
  const [newItem, setNewItem] = useState('');

  const categories = ['Equipment', 'Props', 'Costumes', 'Team', 'Other'];

  const handleAddItem = (category) => {
    if (!newItem.trim()) return;
    
    const currentItems = resources[category] || [];
    const updatedItems = [...currentItems, newItem.trim()];
    onResourceUpdate(sceneNumber, category, updatedItems);
    setNewItem('');
    setEditingCategory(null);
  };

  const handleRemoveItem = (category, index) => {
    const currentItems = resources[category] || [];
    const updatedItems = currentItems.filter((_, i) => i !== index);
    onResourceUpdate(sceneNumber, category, updatedItems);
  };

  const handleAddFromProject = (category, item) => {
    const currentItems = resources[category] || [];
    if (!currentItems.includes(item)) {
      const updatedItems = [...currentItems, item];
      onResourceUpdate(sceneNumber, category, updatedItems);
    }
  };

  return (
    <div>
      <h4 className="text-lg font-semibold text-white mb-4">Scene Resources</h4>
      <div className="space-y-4">
        {categories.map((category) => {
          const sceneItems = resources[category] || [];
          const projectItems = projectResources[category] || [];
          const availableProjectItems = projectItems.filter(item => !sceneItems.includes(item));

          return (
            <div key={category} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-purple-400 capitalize">{category}</h5>
                <motion.button
                  className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded text-xs transition-all"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setEditingCategory(editingCategory === category ? null : category)}
                >
                  <SafeIcon icon={FiPlus} className="inline mr-1" />
                  Add
                </motion.button>
              </div>

              {/* Scene-specific items */}
              <div className="space-y-2 mb-3">
                {sceneItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 rounded p-2">
                    <span className="text-sm text-gray-300">{item}</span>
                    <motion.button
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleRemoveItem(category, index)}
                    >
                      <SafeIcon icon={FiTrash2} className="text-xs" />
                    </motion.button>
                  </div>
                ))}
              </div>

              {/* Add new item */}
              {editingCategory === category && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddItem(category)}
                      className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder={`Add ${category.toLowerCase()} item...`}
                      autoFocus
                    />
                    <motion.button
                      className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs transition-all"
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleAddItem(category)}
                    >
                      <SafeIcon icon={FiSave} />
                    </motion.button>
                    <motion.button
                      className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs transition-all"
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setEditingCategory(null);
                        setNewItem('');
                      }}
                    >
                      <SafeIcon icon={FiX} />
                    </motion.button>
                  </div>

                  {/* Available project items */}
                  {availableProjectItems.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">From project resources:</p>
                      <div className="flex flex-wrap gap-1">
                        {availableProjectItems.map((item, index) => (
                          <motion.button
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs transition-all"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleAddFromProject(category, item)}
                          >
                            + {item}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {sceneItems.length === 0 && editingCategory !== category && (
                <p className="text-gray-500 text-sm italic">No {category.toLowerCase()} assigned</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Detailed Shot Card Component
const DetailedShotCard = ({ shot, isExpanded, onToggleExpanded, onComplete, onRetake, sceneChecklistComplete }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'border-red-500/50 bg-red-500/10';
      case 'Medium': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'Low': return 'border-green-500/50 bg-green-500/10';
      default: return 'border-gray-500/50 bg-gray-500/10';
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

  return (
    <motion.div
      className={`border-2 rounded-xl overflow-hidden transition-all ${
        shot.status === 'completed' 
          ? 'border-green-500/50 bg-green-500/10' 
          : getPriorityColor(shot.priority)
      }`}
      layout
    >
      {/* Shot Header */}
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-all"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Shot Image */}
            <div className="flex-shrink-0">
              {shot.image_url ? (
                <img
                  src={shot.image_url}
                  alt={shot.title}
                  className="w-16 h-12 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiCamera} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Shot Info */}
            <div>
              <h4 className="font-medium text-white">{shot.title}</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>{shot.shot_type}</span>
                {shot.camera_movement && (
                  <>
                    <span>•</span>
                    <span className="flex items-center">
                      <SafeIcon icon={FiMove} className="mr-1" />
                      {shot.camera_movement}
                    </span>
                  </>
                )}
                <span>•</span>
                <span>{shot.duration}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(shot.status)}`}>
              {shot.status || 'pending'}
            </span>
            <SafeIcon icon={isExpanded ? FiChevronDown : FiChevronRight} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4">
              {/* Shot Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Type:</span>
                  <p className="text-white">{shot.shot_type}</p>
                </div>
                <div>
                  <span className="text-gray-400">Movement:</span>
                  <p className="text-white">{shot.camera_movement || 'Static'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Duration:</span>
                  <p className="text-white">{shot.duration}</p>
                </div>
                <div>
                  <span className="text-gray-400">Priority:</span>
                  <p className="text-white">{shot.priority}</p>
                </div>
              </div>

              {/* Description */}
              {shot.description && (
                <div>
                  <span className="text-gray-400 text-sm">Description:</span>
                  <p className="text-white">{shot.description}</p>
                </div>
              )}

              {/* Notes */}
              {shot.notes && (
                <div>
                  <span className="text-gray-400 text-sm">Notes:</span>
                  <p className="text-white">{shot.notes}</p>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                {shot.status === 'completed' ? (
                  <motion.button
                    className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onRetake(shot.id)}
                  >
                    <SafeIcon icon={FiRotateCcw} className="inline mr-2" />
                    Retake Shot
                  </motion.button>
                ) : (
                  <motion.button
                    className={`w-full px-4 py-2 rounded-lg transition-all ${
                      sceneChecklistComplete
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                    whileHover={{ scale: sceneChecklistComplete ? 1.02 : 1 }}
                    onClick={() => sceneChecklistComplete && onComplete(shot.id)}
                    disabled={!sceneChecklistComplete}
                    title={!sceneChecklistComplete ? 'Complete scene setup checklist first' : ''}
                  >
                    <SafeIcon icon={FiCheck} className="inline mr-2" />
                    {sceneChecklistComplete ? 'Mark Shot Complete' : 'Scene Setup Required'}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Simple Shot Card Component (for all-shots view)
const ShotCard = ({ shot, onComplete, onRetake, sceneChecklistComplete }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'border-red-500/50 bg-red-500/10';
      case 'Medium': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'Low': return 'border-green-500/50 bg-green-500/10';
      default: return 'border-gray-500/50 bg-gray-500/10';
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

  return (
    <motion.div
      className={`border-2 rounded-xl p-4 transition-all ${
        shot.status === 'completed' 
          ? 'border-green-500/50 bg-green-500/10' 
          : getPriorityColor(shot.priority)
      }`}
      whileHover={{ scale: 1.02 }}
      layout
    >
      {/* Shot Image */}
      {shot.image_url && (
        <div className="mb-3">
          <img
            src={shot.image_url}
            alt={shot.title}
            className="w-full h-24 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Shot Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-white">{shot.title}</h4>
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(shot.status)}`}>
            {shot.status || 'pending'}
          </span>
        </div>

        <p className="text-gray-400 text-sm line-clamp-2">{shot.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{shot.shot_type}</span>
          <span>{shot.duration}</span>
        </div>

        {shot.camera_movement && (
          <div className="flex items-center text-blue-400 text-xs">
            <SafeIcon icon={FiMove} className="mr-1" />
            {shot.camera_movement}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {shot.status === 'completed' ? (
            <motion.button
              className="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all text-sm"
              whileHover={{ scale: 1.02 }}
              onClick={() => onRetake(shot.id)}
            >
              <SafeIcon icon={FiRotateCcw} className="inline mr-1" />
              Retake
            </motion.button>
          ) : (
            <motion.button
              className={`w-full px-3 py-2 rounded-lg transition-all text-sm ${
                sceneChecklistComplete
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={{ scale: sceneChecklistComplete ? 1.02 : 1 }}
              onClick={() => sceneChecklistComplete && onComplete(shot.id)}
              disabled={!sceneChecklistComplete}
              title={!sceneChecklistComplete ? 'Complete scene setup checklist first' : ''}
            >
              <SafeIcon icon={FiCheck} className="inline mr-1" />
              {sceneChecklistComplete ? 'Mark Complete' : 'Scene Setup Required'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Shooting;