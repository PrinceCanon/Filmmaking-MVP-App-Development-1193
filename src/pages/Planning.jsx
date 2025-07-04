import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import PlanningPrompts from '../components/PlanningPrompts';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiList, FiMapPin, FiClock, FiCamera, FiUsers } = FiIcons;

const Planning = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject, updateProject } = useProject();
  const [project, setProject] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const projectData = getProject(projectId);
    if (projectData) {
      setProject(projectData);
    } else {
      navigate('/');
    }
  }, [projectId, getProject, navigate]);

  const steps = [
    {
      id: 'structure',
      title: 'Story Structure',
      icon: FiList,
      description: 'Break down your story into key segments'
    },
    {
      id: 'locations',
      title: 'Locations & Settings',
      icon: FiMapPin,
      description: 'Plan your shooting locations'
    },
    {
      id: 'timeline',
      title: 'Timeline & Schedule',
      icon: FiClock,
      description: 'Create your production timeline'
    },
    {
      id: 'shots',
      title: 'Shot List',
      icon: FiCamera,
      description: 'Plan your shots and camera angles'
    },
    {
      id: 'resources',
      title: 'Resources & Team',
      icon: FiUsers,
      description: 'Identify needed resources and team members'
    }
  ];

  const handleDataUpdate = (data) => {
    const updatedProject = { ...project, ...data };
    setProject(updatedProject);
    updateProject(projectId, data);
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

  const handleComplete = () => {
    updateProject(projectId, { phase: 'shooting' });
    navigate(`/shooting/${projectId}`);
  };

  const isStepComplete = () => {
    if (!project) return false;
    
    switch (currentStep) {
      case 0:
        return project.story_structure && project.story_structure.length > 0;
      case 1:
        return project.locations && project.locations.length > 0;
      case 2:
        return project.timeline && project.timeline.length > 0;
      case 3:
        return project.shot_list && project.shot_list.length > 0;
      case 4:
        return project.resources && Object.keys(project.resources).length > 0;
      default:
        return false;
    }
  };

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white mt-4">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Project Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
        <p className="text-gray-300">Planning Phase</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div 
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${
                  index <= currentStep 
                    ? 'bg-purple-500 border-purple-500 text-white' 
                    : 'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
                whileHover={{ scale: 1.1 }}
                onClick={() => setCurrentStep(index)}
              >
                <SafeIcon icon={step.icon} className="text-sm" />
              </motion.div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 ml-2 transition-all ${
                  index < currentStep ? 'bg-purple-500' : 'bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <span className={`font-medium ${
                index <= currentStep ? 'text-purple-400' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
            <SafeIcon icon={steps[currentStep].icon} className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{steps[currentStep].title}</h2>
            <p className="text-gray-300">{steps[currentStep].description}</p>
          </div>
        </div>

        <PlanningPrompts
          step={currentStep}
          project={project}
          onDataUpdate={handleDataUpdate}
        />
      </motion.div>

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
            isStepComplete()
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          whileHover={isStepComplete() ? { scale: 1.05 } : {}}
          whileTap={isStepComplete() ? { scale: 0.95 } : {}}
          onClick={handleNext}
          disabled={!isStepComplete()}
        >
          <span>{currentStep === steps.length - 1 ? 'Start Shooting' : 'Next'}</span>
          <SafeIcon icon={FiArrowRight} />
        </motion.button>
      </div>
    </div>
  );
};

export default Planning;