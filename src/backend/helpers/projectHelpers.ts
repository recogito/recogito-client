import type { SupabaseClient } from '@supabase/supabase-js';
import { createContext, createProject, deleteContext, deleteProject } from '@backend/crud';
import type { Context, Project } from 'src/Types';
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
