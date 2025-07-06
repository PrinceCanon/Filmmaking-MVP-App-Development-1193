import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import PlanningPrompts from '../components/PlanningPrompts';
import ProjectBreadcrumb from '../components/ProjectBreadcrumb';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiArrowLeft, FiFileText, FiCamera, FiCalendar, FiUsers, FiLayers } = FiIcons;

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
      id: 'story-script',
      title: 'Story & Script',
      icon: FiFileText,
      description: 'Develop your story structure, script, and locations'
    },
    {
      id: 'shots',
      title: 'Shot List',
      icon: FiCamera,
      description: 'Plan your shots and camera angles by scene'
    },
    {
      id: 'schedule',
      title: 'Production Schedule',
      icon: FiCalendar,
      description: 'Create your shooting schedule'
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

  const handleComplete = async () => {
    await updateProject(projectId, { phase: 'shooting' });
    navigate(`/shooting/${projectId}`);
  };

  const isStepComplete = () => {
    if (!project) return false;

    switch (currentStep) {
      case 0:
        return project.story_structure && project.story_structure.length > 0;
      case 1:
        return true; // Shot list is always considered complete (can be empty)
      case 2:
        return true; // Schedule is optional but we allow proceeding
      case 3:
        return project.resources && Object.keys(project.resources).length > 0;
      default:
        return false;
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white mt-4">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <ProjectBreadcrumb 
          project={project} 
          currentPhase="planning"
          className="mb-6"
        />

        {/* Phase Indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30">
            <SafeIcon icon={FiLayers} className="text-purple-400" />
            <span className="text-purple-400 font-medium">Planning Phase</span>
          </div>
        </div>

        {/* Project Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
          <p className="text-gray-300">{project.concept}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all cursor-pointer ${
                    index <= currentStep
                      ? 'bg-purple-500 border-purple-500 text-white'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setCurrentStep(index)}
                >
                  <SafeIcon icon={step.icon} className="text-xl" />
                </motion.div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 ml-2 transition-all ${
                      index < currentStep ? 'bg-purple-500' : 'bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center max-w-24">
                <span
                  className={`font-medium text-center ${
                    index <= currentStep ? 'text-purple-400' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
                <span className="text-gray-500 text-xs mt-1 text-center">
                  {step.description}
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
            className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>{currentStep === 0 ? 'Back to Ideation' : 'Back'}</span>
          </motion.button>

          <div className="text-center">
            <span className="text-gray-400">Step {currentStep + 1} of {steps.length}</span>
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
    </div>
  );
};

export default Planning;