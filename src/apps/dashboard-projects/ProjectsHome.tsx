import { useState } from 'react';
import { Hammer } from '@phosphor-icons/react';
import type { Context, Project, Translations } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { createProject, deleteProject } from '@backend/projects';
import { createContext } from '@backend/contexts';
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

  const onCreateProject = () => {
    // First promise: create the project
    const a: Promise<Project> = 
      new Promise((resolve, reject) => 
        createProject(supabase, t['Untitled Project'])
          .then(({ error, data }) => {
            if (error) {
              console.error(error);
              reject(t['Could not create the project.']);
            } else {
              resolve(data);
            }
          }));

    // Follow-on promise: create a new context
    const b: Promise<Context> = a.then(project =>
      new Promise((resolve, reject) => 
        createContext(supabase, project.id)
          .then(({ error, data }) => {
            if (error) {
              console.error(error);
              reject(t['Could not create the project (context failed).']);
            } else {
              resolve(data);
            }
          })));

    // TODO tag the context as default

    Promise.all([a, b])
      .then(([project, context]) => {
        setProjects([...projects, project]);
        // window.location.href = `/projects/${project.id}`;
      })
      .catch(error => {
        setError({ 
          title: t['Something went wrong'], 
          description: t['Could not create the project.'], 
          severity: 'error' 
        });
      });
  }

  const onRenameProject = (project: Project) => {
    setError({
      icon: <Hammer size={16} className="text-bottom" />,
      title: t['We\'re working on it!'],
      description: t['This feature will become available soon.'],
      severity: 'info'
    });
  }
    
  const onDeleteProject = (project: Project) =>
    deleteProject(supabase, project.id).then(({ error, data }) => {
      if (error) {
        console.error(error);
        setError({
          title: t['Something went wrong'],
          description: t['Could not delete the project.'],
          severity: 'error'
        });
      } else if (data) {
        if (data.length === 1 && data[0].id === project.id) {
          setProjects(projects.filter(p => p.id !== project.id));
        } else {
          setError({
            title: t['Something went wrong'],
            description: t['Could not delete the project.'],
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