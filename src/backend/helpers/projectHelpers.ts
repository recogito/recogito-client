import type { SupabaseClient } from '@supabase/supabase-js';
import { createContext, createProject, deleteContext, deleteProject } from '@backend/crud';
import type { Context, ExtendedProjectData, Project, ProjectMember } from 'src/Types';
import type { Response } from '@backend/Types';
import { createSystemTag } from './tagHelpers';

/**
 * Initializes a new project.
 * 
 * 1. creates the Project record.
 * 2. creates a new Context.
 * 3. TODO: tags the Context as a 'DEFAULT' context.
 */
export const initProject = (
  supabase: SupabaseClient, 
  name: string
): Promise<{ project: Project, defaultContext: Context }> => {
  // First promise: create the project
  const a: Promise<Project> =
    new Promise((resolve, reject) => 
      createProject(supabase, name)
        .then(({ error, data }) => {
          if (error)
            reject(error);
          else
            resolve(data);
        }));

  // Follow-on promise: create a new context
  const b: Promise<Context> = a.then(project =>
    new Promise((resolve, reject) => 
      createContext(supabase, project.id)
        .then(({ error, data }) => {
          if (error) {
            // If context creation failed, roll back the project
            deleteProject(supabase, project.id).then(() => {
              reject(error);
            });
          } else {
            resolve(data);
          }
        })));

  // Wait for both promises to complete, tag the default context,
  // and return project and context objects.
  return Promise.all([a, b]).then(([ project, defaultContext]) => 
    new Promise((resolve, reject) =>
      createSystemTag(supabase, 'DEFAULT_CONTEXT', defaultContext.id)
        .then(() => {
          resolve({ project, defaultContext });
        })
        .catch(error => {
          // Tag creation failed? Roll back context and project
          deleteContext(supabase, defaultContext.id)
            .then(() => deleteProject(supabase, project.id))
            .then(() => reject(error));
        })));
}

export const getProjectWithContexts = (
  supabase: SupabaseClient, 
  projectId: string
): Response<Project & { contexts: Context[] }> => 
  supabase
   .from('projects')
   .select(`
    id,
    created_at,
    updated_at,
    updated_by,
    name,
    description,
    contexts (
      id,
      project_id,
      created_at,  
      created_by,
      updated_at,
      updated_by,  
      name
    )
  `)
  .eq('id', projectId)
  .single()
  .then(({ error, data }) => ({ error, data: data as Project & { contexts: Context[] } }));

export const listMyProjectsExtended = (supabase: SupabaseClient): Response<ExtendedProjectData[]> => 
  supabase
    .from('projects')
    .select(`
      id,
      created_at,
      created_by:profiles!projects_created_by_fkey(
        id,
        nickname,
        first_name,
        last_name,
        avatar_url
      ),
      updated_at,
      updated_by,
      name,
      description,
      contexts (
        id,
        name
      ),
      layers (
        id,
        name,
        description,
        document:documents (
          id,
          name,
          content_type,
          meta_data
        )
      ),
      groups:project_groups (
        id,
        name
      )
    `)
    .then(({ error, data }) => { 
      if (error) {
        return { error, data: [] as ExtendedProjectData[] };
      } else {
        const projects = data;
        // All group IDs of all projects in `data`
        const groupIds = projects.reduce((ids, project) => 
          ([...ids, ...project.groups.map(g => g.id)]), [] as string[]);

        return getGroupMembers(supabase, groupIds)
          .then(({ error, data }) => {
            if (error) {
              return { error, data: [] as ExtendedProjectData[] };
            } else {
              // Re-assign group members to projects
              const projectsExtended = projects.map(p => ({
                ...p,
                groups: p.groups.map(g => ({
                  ...g,
                  members: data
                    .filter(m => m.in_group === g.id)
                    .map(({ user, since }) => ({ user, since }))
                }))
              } as unknown as ExtendedProjectData));

              return { error, data: projectsExtended };
            } 
          });
      }
    });

// TODO redundancy needs cleaning up!
export const getProjectExtended = (supabase: SupabaseClient, projectId: string): Response<ExtendedProjectData> => 
  supabase
    .from('projects')
    .select(`
      id,
      created_at,
      created_by:profiles!projects_created_by_fkey(
        id,
        nickname,
        first_name,
        last_name,
        avatar_url
      ),
      updated_at,
      updated_by,
      name,
      description,
      contexts (
        id,
        name
      ),
      layers (
        id,
        name,
        description,
        document:documents (
          id,
          name,
          content_type,
          meta_data
        )
      ),
      groups:project_groups (
        id,
        name
      )
    `)
    .eq('id', projectId)
    .single()
    .then(({ error, data }) => { 
      if (error) {
        return { error, data: undefined as unknown as ExtendedProjectData };
      } else {
        const project = data;

        const groupIds = project.groups.map(g => g.id);

        return getGroupMembers(supabase, groupIds)
          .then(({ error, data }) => {
            if (error) {
              return { error, data: undefined as unknown as ExtendedProjectData };
            } else {
              // Re-assign group members to groups
              const projectExtended = {
                ...project,
                groups: project.groups.map(g => ({
                  ...g,
                  members: data
                    .filter(m => m.in_group === g.id)
                    .map(({ user, since }) => ({ user, since }))
                }))
              } as unknown as ExtendedProjectData;

              return { error, data: projectExtended };
            } 
          });
      }
    });
  

export const getGroupMembers = (supabase: SupabaseClient, groupIds: string[]): Response<ProjectMember[]> =>
  supabase
    .from('group_users')
    .select(`
      user:profiles!group_users_user_id_fkey (
        id,
        nickname,
        first_name,
        last_name,
        avatar_url
      ),
      in_group:type_id,
      since:created_at
    `)
    .eq('group_type', 'project')
    .in('type_id', groupIds)
    .then(({ error, data }) => ({ error, data: data as unknown as ProjectMember[] }));