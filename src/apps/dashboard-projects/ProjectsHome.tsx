import { useState } from 'react';
import * as Toast from '@radix-ui/react-toast';
import { Hammer, X } from '@phosphor-icons/react';
import type { Project, Translations } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { createProject, deleteProject } from '@backend/projects';
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

  const [error, setError] = useState<string | null>(null);

  const onCreateProject = () =>
    createProject(supabase, i18n['Untitled Project']).then(({ error, data }) => {
      if (error) {
        // TODO
        console.error('Error creating project', error);
      } else if (data) {
        console.log(data);
        setProjects([...projects, ...data]);
        // window.location.href = `/projects/${data[0].id}`;
      }
    })

  const onRenameProject = (project: Project) => {
    // TODO
    console.log('renaming');
    setError('Not yet implemented');
  }
    
  const onDeleteProject = (project: Project) =>
    deleteProject(supabase, project.id).then(({ error, data }) => {
      if (error) {
        // TODO
        console.error('Error deleting project', error);
      } else if (data) {
        if (data.length === 1 && data[0].id === project.id) {
          setProjects(projects.filter(p => p.id !== project.id));
        } else {
          // TODO
          console.error('Something went wrong when deleting project', project, data);
        }
      }
    });

  return projects.length === 0 ? (
    <ProjectsEmpty 
      i18n={props.i18n} 
      onCreateProject={onCreateProject} />
  ) : (
    <Toast.Provider>
      <ProjectsGrid 
        i18n={props.i18n} 
        projects={projects}
        onCreateProject={onCreateProject} 
        onDeleteProject={onDeleteProject} 
        onRenameProject={onRenameProject} />

        <Toast.Root 
          className="toast" 
          duration={100000}
          open={Boolean(error)}
          onOpenChange={open => !open && setError(null)}>

          <Toast.Title className="toast-title">
            <Hammer size={16} className="text-bottom" /> We're working on it!
          </Toast.Title>

          <Toast.Description className="toast-description">
            This feature will become available soon.
          </Toast.Description>

          <Toast.Action className="toast-action" asChild altText="Close error message">
            <button className="unstyled icon-only">
              <X size={20} />
            </button>
          </Toast.Action>
        </Toast.Root>

        <Toast.Viewport className="toast-viewport" />
    </Toast.Provider>
  )
  
}