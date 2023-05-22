import { useState } from 'react';
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

  const [projects, setProjects] = useState<Project[]>(props.projects);

  const onCreateProject = () =>
    createProject(supabase, 'Untitled Project').then(({ error, data }) => {
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
    <ProjectsGrid 
      i18n={props.i18n} 
      projects={projects}
      onCreateProject={onCreateProject} 
      onDeleteProject={onDeleteProject} 
      onRenameProject={onRenameProject} />
  )
  
}