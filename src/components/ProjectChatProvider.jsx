import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FloatingProjectChat from './FloatingProjectChat';

const ProjectChatProvider = () => {
  const location = useLocation();
  
  // Extract project ID from current route
  const getProjectIdFromPath = () => {
    const path = location.pathname;
    const projectRoutes = ['/planning/', '/shooting/', '/project/', '/ideation/'];
    
    for (const route of projectRoutes) {
      if (path.includes(route)) {
        const segments = path.split('/');
        const routeIndex = segments.findIndex(segment => route.includes(`/${segment}/`));
        if (routeIndex >= 0 && segments[routeIndex + 1]) {
          return segments[routeIndex + 1];
        }
      }
    }
    return null;
  };

  const projectId = getProjectIdFromPath();

  // Only render chat if we're on a project page
  if (!projectId) {
    return null;
  }

  return <FloatingProjectChat projectId={projectId} />;
};

export default ProjectChatProvider;