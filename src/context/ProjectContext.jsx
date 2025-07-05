import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        loadProjects();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProjects();
      } else {
        setProjects([]);
        setCurrentProject(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects_fc2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading projects:', error);
        throw error;
      }
      
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const createProject = async (projectData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('Creating project with user:', user.id);
      console.log('Project data:', projectData);

      // Validate required fields
      if (!projectData.title?.trim()) {
        throw new Error('Project title is required');
      }
      if (!projectData.type?.trim()) {
        throw new Error('Project type is required');
      }
      if (!projectData.concept?.trim()) {
        throw new Error('Project concept is required');
      }

      // Clean and prepare the data with proper defaults
      const cleanProjectData = {
        title: String(projectData.title).trim(),
        concept: String(projectData.concept).trim(),
        type: String(projectData.type).trim(),
        target_audience: String(projectData.target_audience || '').trim(),
        duration: String(projectData.duration || '').trim(),
        key_message: String(projectData.key_message || '').trim(),
        tone: String(projectData.tone || '').trim(),
        inspiration: String(projectData.inspiration || '').trim(),
        unique_angle: String(projectData.unique_angle || '').trim(),
        phase: 'planning',
        story_structure: [],
        locations: [],
        timeline: [],
        resources: {},
        completed_shots: [],
        owner_id: user.id
      };

      console.log('Inserting clean project data:', cleanProjectData);

      // Insert the project
      const { data, error } = await supabase
        .from('projects_fc2024')
        .insert([cleanProjectData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insertion error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from database');
      }

      console.log('Project created successfully:', data);
      
      // Update local state
      setProjects(prev => [data, ...prev]);
      setCurrentProject(data);
      
      return data;
    } catch (error) {
      console.error('Error in createProject:', error);
      throw error;
    }
  };

  const updateProject = async (projectId, updates) => {
    try {
      console.log('Updating project:', projectId, updates);

      const { data, error } = await supabase
        .from('projects_fc2024')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      setProjects(prev =>
        prev.map(project =>
          project.id === projectId ? data : project
        )
      );

      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(data);
      }

      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const { error } = await supabase
        .from('projects_fc2024')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== projectId));
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const getProject = (projectId) => {
    return projects.find(project => project.id === projectId);
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setProjects([]);
        setCurrentProject(null);
      }
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Test database connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('projects_fc2024')
        .select('count(*)')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('Database connection test successful');
      return true;
    } catch (error) {
      console.error('Database connection test error:', error);
      return false;
    }
  };

  // Test connection on load
  useEffect(() => {
    if (user) {
      testConnection();
    }
  }, [user]);

  const value = {
    projects,
    currentProject,
    user,
    loading,
    setCurrentProject,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    signIn,
    signUp,
    signOut,
    loadProjects,
    testConnection
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};