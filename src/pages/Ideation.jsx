import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import IdeationPrompts from '../components/IdeationPrompts';
import EditableField from '../components/EditableField';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiLightbulb, FiUsers, FiTarget, FiClock } = FiIcons;

const Ideation = () => {
  const navigate = useNavigate();
  const { createProject, user } = useProject();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectData, setProjectData] = useState({
    title: '',
    type: '',
    target_audience: '',
    duration: '',
    concept: '',
    key_message: '',
    tone: '',
    inspiration: '',
    unique_angle: ''
  });

  const steps = [
    {
      id: 'basics',
      title: 'Project Basics',
      icon: FiTarget,
      description: 'Define your project fundamentals'
    },
    {
      id: 'concept',
      title: 'Concept Development',
      icon: FiLightbulb,
      description: 'Develop your creative concept'
    },
    {
      id: 'audience',
      title: 'Audience & Tone',
      icon: FiUsers,
      description: 'Define your target audience and tone'
    }
  ];

  const handleDataUpdate = (data) => {
    setProjectData(prev => ({ ...prev, ...data }));
    setError(''); // Clear any previous errors
  };

  const handleFieldSave = (field, value) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear any previous errors
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) {
      setError('Please sign in to create a project');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate required fields with specific error messages
      const errors = [];
      
      if (!projectData.title?.trim()) {
        errors.push('Project title');
      }
      if (!projectData.type?.trim()) {
        errors.push('Video type');
      }
      if (!projectData.concept?.trim()) {
        errors.push('Core concept');
      }
      
      if (errors.length > 0) {
        throw new Error(`Please fill in the following required fields: ${errors.join(', ')}`);
      }

      console.log('Creating project with validated data:', projectData);

      const project = await createProject(projectData);
      
      console.log('Project created successfully, navigating to planning...');
      
      // Navigate to planning phase with the new project ID
      navigate(`/planning/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      setError(error.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 0: 
        return projectData.title?.trim() && projectData.type?.trim() && projectData.duration?.trim();
      case 1: 
        return projectData.concept?.trim() && projectData.key_message?.trim();
      case 2: 
        return projectData.target_audience?.trim() && projectData.tone?.trim();
      default: 
        return false;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Please sign in to create a project</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Phase Indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30">
            <SafeIcon icon={FiLightbulb} className="text-blue-400" />
            <span className="text-blue-400 font-medium">Ideation Phase</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-red-400 text-center">{error}</p>
          </motion.div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${
                    index <= currentStep
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setCurrentStep(index)}
                >
                  {index < currentStep ? (
                    <SafeIcon icon={FiTarget} className="text-sm" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </motion.div>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-0.5 ml-2 transition-all ${
                    index < currentStep ? 'bg-blue-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <span className={`font-medium ${
                  index <= currentStep ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
                <span className="text-gray-500 text-xs mt-1">
                  {step.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Summary Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            {/* Current Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-8"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-lg">
                  <SafeIcon icon={steps[currentStep].icon} className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{steps[currentStep].title}</h2>
                  <p className="text-gray-300">{steps[currentStep].description}</p>
                </div>
              </div>

              <IdeationPrompts
                step={currentStep}
                data={projectData}
                onDataUpdate={handleDataUpdate}
              />
            </motion.div>
          </div>

          {/* Live Preview */}
          <div className="space-y-6">
            <motion.div
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 sticky top-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Project Preview</h3>
              <div className="space-y-4">
                <EditableField
                  label="Project Title"
                  value={projectData.title}
                  onSave={(value) => handleFieldSave('title', value)}
                  placeholder="Enter project title..."
                />
                <EditableField
                  label="Video Type"
                  value={projectData.type}
                  onSave={(value) => handleFieldSave('type', value)}
                  type="select"
                  options={['Vlog', 'Tutorial', 'Review', 'Travel', 'Food', 'Lifestyle', 'Business', 'Educational', 'Entertainment', 'Documentary']}
                  placeholder="Select video type..."
                />
                <EditableField
                  label="Duration"
                  value={projectData.duration}
                  onSave={(value) => handleFieldSave('duration', value)}
                  type="select"
                  options={['30 seconds - 1 minute', '1-3 minutes', '3-5 minutes', '5-10 minutes', '10-15 minutes', '15+ minutes']}
                  placeholder="Select duration..."
                />
                <EditableField
                  label="Core Concept"
                  value={projectData.concept}
                  onSave={(value) => handleFieldSave('concept', value)}
                  multiline
                  placeholder="Describe your concept..."
                />
                <EditableField
                  label="Key Message"
                  value={projectData.key_message}
                  onSave={(value) => handleFieldSave('key_message', value)}
                  multiline
                  placeholder="What's your main message..."
                />
                <EditableField
                  label="Target Audience"
                  value={projectData.target_audience}
                  onSave={(value) => handleFieldSave('target_audience', value)}
                  multiline
                  placeholder="Who is your audience..."
                />
                <EditableField
                  label="Tone & Style"
                  value={projectData.tone}
                  onSave={(value) => handleFieldSave('tone', value)}
                  type="select"
                  options={['Casual & Friendly', 'Professional & Informative', 'Energetic & Fun', 'Calm & Relaxing', 'Inspiring & Motivational', 'Humorous & Entertaining', 'Serious & Educational', 'Personal & Intimate']}
                  placeholder="Select tone..."
                />
                <EditableField
                  label="Inspiration"
                  value={projectData.inspiration}
                  onSave={(value) => handleFieldSave('inspiration', value)}
                  multiline
                  placeholder="What inspired this project..."
                />
                <EditableField
                  label="Unique Angle"
                  value={projectData.unique_angle}
                  onSave={(value) => handleFieldSave('unique_angle', value)}
                  multiline
                  placeholder="What makes it unique..."
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <motion.button
            className={`px-6 py-3 rounded-lg transition-all ${
              currentStep === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
            whileTap={currentStep > 0 ? { scale: 0.95 } : {}}
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </motion.button>

          <div className="text-center">
            <span className="text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <motion.button
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
              isStepComplete() && !loading
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={isStepComplete() && !loading ? { scale: 1.05 } : {}}
            whileTap={isStepComplete() && !loading ? { scale: 0.95 } : {}}
            onClick={handleNext}
            disabled={!isStepComplete() || loading}
          >
            <span>
              {loading ? 'Creating...' : currentStep === steps.length - 1 ? 'Start Planning' : 'Next'}
            </span>
            {!loading && <SafeIcon icon={FiArrowRight} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Ideation;