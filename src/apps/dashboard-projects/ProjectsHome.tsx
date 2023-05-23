import { useState } from 'react';
import { Hammer, X } from '@phosphor-icons/react';
import type { Project, Translations, UIAlert } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { createProject, deleteProject } from '@backend/projects';
import { ToastProvider, Toast } from '@components/Toast';
import { ProjectsEmpty } from './Empty';
import { ProjectsGrid } from './Grid';

import './ProjectsHome.css';

export interface ProjectsHomeProps {

  i18n: Translations;

  projects: Project[];

}

export const ProjectsHome = (props: ProjectsHomeProps) => {

  const { i18n } = props;

  const [projects, setProjects] = useState<Project[]>(props.projects);

  const [error, setError] = useState<UIAlert | null>(null);

  const onCreateProject = () =>
    createProject(supabase, i18n['Untitled Project']).then(({ error, data }) => {
      if (error) {
        setError({ 
          title: 'Something went wrong', 
          description: 'Could not create the project.', 
          severity: 'error' 
        });
      } else if (data) {
        setProjects([...projects, ...data]);
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
        alert={error}
        onOpenChange={open => !open && setError(null)} />
    </ToastProvider>
  )
  
}