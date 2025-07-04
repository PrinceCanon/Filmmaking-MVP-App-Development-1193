import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);

  useEffect(() => {
    const savedProjects = localStorage.getItem('filmcraft-projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('filmcraft-projects', JSON.stringify(projects));
  }, [projects]);

  const createProject = (projectData) => {
    const newProject = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phase: 'ideation',
      ...projectData
    };
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
    return newProject;
  };

  const updateProject = (projectId, updates) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === projectId 
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      )
    );
    
    if (currentProject && currentProject.id === projectId) {
      setCurrentProject(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteProject = (projectId) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
    if (currentProject && currentProject.id === projectId) {
      setCurrentProject(null);
    }
  };

  const getProject = (projectId) => {
    return projects.find(project => project.id === projectId);
  };

  const value = {
    projects,
    currentProject,
    setCurrentProject,
    createProject,
    updateProject,
    deleteProject,
    getProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};