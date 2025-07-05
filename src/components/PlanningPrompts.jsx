import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import StoryStructureBuilder from './StoryStructureBuilder';
import ScriptManager from './ScriptManager';
import EnhancedShotListBuilder from './EnhancedShotListBuilder';
import ProductionScheduler from './ProductionScheduler';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiEdit3, FiMapPin, FiClock, FiUsers, FiEdit2, FiPackage, FiTag } = FiIcons;

const PlanningPrompts = ({ step, project, onDataUpdate }) => {
  const [newItem, setNewItem] = useState('');

  const handleUpdateResources = async (category, items) => {
    const resources = project.resources || {};
    const updatedResources = { ...resources, [category]: items };
    onDataUpdate({ resources: updatedResources });

    // Also update scene-specific resources
    try {
      // Get all scenes for this project
      const { data: scenes, error } = await supabase
        .from('scenes_fc2024')
        .select('*')
        .eq('project_id', project.id);

      if (!error && scenes) {
        // Update each scene with the new resources
        for (const scene of scenes) {
          const sceneResources = scene.resources || {};
          const updatedSceneResources = { ...sceneResources, [category]: items };
          
          await supabase
            .from('scenes_fc2024')
            .update({ resources: updatedSceneResources })
            .eq('id', scene.id);
        }
      }
    } catch (error) {
      console.error('Error updating scene resources:', error);
    }
  };

  const renderStoryAndScript = () => (
    <div className="space-y-8">
      {/* Script Manager */}
      <ScriptManager 
        project={project} 
        onScriptUpdate={(script) => onDataUpdate({ script })} 
      />
      
      {/* Story Structure Builder */}
      <StoryStructureBuilder 
        project={project} 
        onDataUpdate={onDataUpdate} 
      />
    </div>
  );

  const renderShotList = () => (
    <EnhancedShotListBuilder 
      project={project} 
      onDataUpdate={onDataUpdate} 
    />
  );

  const renderSchedule = () => (
    <ProductionScheduler 
      project={project} 
      onDataUpdate={onDataUpdate} 
    />
  );

  const renderResources = () => {
    const resources = project.resources || {};
    const categories = ['Equipment', 'Props', 'Costumes', 'Team', 'Other'];

    return (
      <div className="space-y-6">
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-2">Resource Planning</h4>
          <ul className="text-purple-300 text-sm space-y-1">
            <li>• List all equipment, props, and team members needed</li>
            <li>• Don't forget basics like batteries, memory cards, and backups</li>
            <li>• Consider transportation and setup requirements</li>
            <li>• Resources will be automatically assigned to scenes</li>
          </ul>
        </div>

        {/* Resource Tagging Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiTag} className="text-blue-400" />
            <h5 className="font-semibold text-white">Scene-Specific Resources</h5>
          </div>
          <p className="text-blue-300 text-sm">
            Resources added here will be available to all scenes by default. 
            You can customize which resources each scene needs during the shooting phase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div key={category} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <SafeIcon icon={FiPackage} className="text-purple-400" />
                <h4 className="text-lg font-semibold text-white">{category}</h4>
              </div>

              <div className="space-y-2">
                {(resources[category] || []).map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newItems = [...(resources[category] || [])];
                        newItems[index] = e.target.value;
                        handleUpdateResources(category, newItems);
                      }}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={`Add ${category.toLowerCase()} item...`}
                    />
                    <motion.button
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        const newItems = (resources[category] || []).filter((_, i) => i !== index);
                        handleUpdateResources(category, newItems);
                      }}
                    >
                      <SafeIcon icon={FiTrash2} className="text-red-400 text-sm" />
                    </motion.button>
                  </div>
                ))}

                <motion.button
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 border-dashed rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    const newItems = [...(resources[category] || []), ''];
                    handleUpdateResources(category, newItems);
                  }}
                >
                  <SafeIcon icon={FiPlus} className="inline mr-2" />
                  Add {category} Item
                </motion.button>
              </div>
            </div>
          ))}
        </div>

        {/* Resource Summary */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">Resource Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {categories.map((category) => (
              <div key={category}>
                <div className="text-2xl font-bold text-purple-400">
                  {(resources[category] || []).filter(item => item.trim()).length}
                </div>
                <div className="text-sm text-gray-400">{category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  switch (step) {
    case 0: return renderStoryAndScript();
    case 1: return renderShotList();
    case 2: return renderSchedule();
    case 3: return renderResources();
    default: return null;
  }
};

export default PlanningPrompts;