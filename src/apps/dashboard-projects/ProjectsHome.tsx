import { useState } from 'react';
import { Hammer } from '@phosphor-icons/react';
import type { Project, Translations } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { createProject, deleteProject } from '@backend/projects';
import { ToastProvider, Toast, ToastContent } from '@components/Toast';
import { ProjectsEmpty } from './Empty';
import { ProjectsGrid } from './Grid';

import './ProjectsHome.css';

export interface ProjectsHomeProps {

  i18n: Translations;

  projects: Project[];

}

export const ProjectsHome = (props: ProjectsHomeProps) => {

  const { t } = props.i18n;

  const [projects, setProjects] = useState<Project[]>(props.projects);

  const [error, setError] = useState<ToastContent | null>(null);

  const onCreateProject = () =>
    createProject(supabase, t['Untitled Project']).then(({ error, data }) => {
      if (error) {
        setError({ 
          title: 'Something went wrong', 
          description: 'Could not create the project.', 
          severity: 'error' 
        });
      } else if (data) {
        setProjects([...projects, data]);
        // window.location.href = `/projects/${data[0].id}`;
      }
    })

  const onRenameProject = (project: Project) => {
    setError({
      icon: <Hammer size={16} className="text-bottom" />,
      title: 'We\'re working on it!',
      description: 'This feature will become available soon.',
      severity: 'info'
    });
  }
    
  const onDeleteProject = (project: Project) =>
    deleteProject(supabase, project.id).then(({ error, data }) => {
      if (error) {
        setError({
          title: 'Something went wrong',
          description: 'Could not delete the project.',
          severity: 'error'
        });
      } else if (data) {
        if (data.length === 1 && data[0].id === project.id) {
          setProjects(projects.filter(p => p.id !== project.id));
        } else {
          setError({
            title: 'Something went wrong',
            description: 'Could not delete the project.',
            severity: 'error'
          });
        }
      }
    });

  return projects.length === 0 ? (
    <ProjectsEmpty 
      i18n={props.i18n} 
      onCreateProject={onCreateProject} />
  ) : (
    <ToastProvider>
      <ProjectsGrid 
        i18n={props.i18n} 
        projects={projects}
        onCreateProject={onCreateProject} 
        onDeleteProject={onDeleteProject} 
        onRenameProject={onRenameProject} />

      <Toast
        content={error}
        onOpenChange={open => !open && setError(null)} />
    </ToastProvider>
  )
  
}