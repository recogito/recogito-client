import type { SupabaseClient } from '@supabase/supabase-js';
import { getProjectGroupMembers } from '@backend/crud';
import type { ExtendedProjectData } from 'src/Types';
import type { Response } from '@backend/Types';

export const listMyProjectsExtended = (
  supabase: SupabaseClient
): Response<ExtendedProjectData[]> =>
  supabase
    .from('projects')
    .select(
      `
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
      is_open_join,
      is_open_edit,
      groups:project_groups(
        id,
        name
      ),
      project_documents(
        *,
        document:documents!project_documents_document_id_fkey(
          id,
          name,
          content_type,
          meta_data
        )
      ),
      contexts:contexts!contexts_project_id_fkey(
        id,
        project_id,
        name,
        is_project_default,
        created_at,
        members:context_users(
          role_id,
          user:profiles!context_users_user_id_fkey (
            nickname,
            first_name,
            last_name,
            avatar_url
          )
        )
      )
    `
    )
    .then(({ error, data }) => {
      if (error) {
        return { error, data: [] as ExtendedProjectData[] };
      } else {
        const projects: any = data.map((project) => {
          const documents: Document[] = [];
          project.project_documents.forEach((pd) => {
            if (pd.document) {
              documents.push(pd.document);
            }
          });

          return {
            ...project,
            documents,
          };
        });

        // All group IDs of all projects in `data`
        const groupIds = projects.reduce(
          (ids: any, project: any) => [
            ...ids,
            ...project.groups.map((g: any) => g.id),
          ],
          [] as string[]
        );

        return getProjectGroupMembers(supabase, groupIds).then(
          ({ error, data }) => {
            if (error) {
              return { error, data: [] as ExtendedProjectData[] };
            } else {
              // Re-assign group members to projects
              let users: any[] = [];
              data.forEach(
                (d) =>
                  (users = [
                    ...users,
                    {
                      user: d.user,
                      groupId: d.in_group,
                    },
                  ])
              );

              users = [...new Set(users)];

              const projectsExtended: ExtendedProjectData[] = projects.map(
                (p: any) => {
                  const ids: string[] = p.groups.map((g: any) => g.id);
                  return {
                    ...p,
                    users: users
                      .filter((u) => ids.includes(u.groupId))
                      .map((m) => {
                        return {
                          user: m.user,
                          inGroup: undefined,
                          since: '',
                        };
                      }),
                  } as unknown as ExtendedProjectData;
                }
              );

              return { error, data: projectsExtended };
            }
          }
        );
      }
    });

// TODO redundancy needs cleaning up!
export const getProjectExtended = (
  supabase: SupabaseClient,
  projectId: string
): Response<ExtendedProjectData> =>
  supabase
    .from('projects')
    .select(
      `
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
      is_open_join,
      is_open_edit,
      groups:project_groups(
        id,
        name
      ),
      project_documents(
        *,
        document:documents!project_documents_document_id_fkey(
          id,
          name,
          content_type,
          meta_data
        )
      ),
      contexts:contexts!contexts_project_id_fkey(
        id,
        project_id,
        name,
        is_project_default,
        created_at,
        members:context_users(
          id,
          role_id,
          user:profiles!context_users_user_id_fkey (
            id,
            nickname,
            first_name,
            last_name,
            avatar_url
          )
        ),
        context_documents(
          document:documents(
            id,
            name,
            content_type,
            meta_data
          )
        )
      )
    `
    )
    .eq('id', projectId)
    .single()
    .then(({ error, data }) => {
      if (error) {
        return { error, data: undefined as unknown as ExtendedProjectData };
      } else {
        const project = data;

        const groupIds = project.groups.map((g) => g.id);

        return getProjectGroupMembers(supabase, groupIds).then(
          ({ error, data }) => {
            if (error) {
              return {
                error,
                data: undefined as unknown as ExtendedProjectData,
              };
            } else {
              // Re-assign group members to projects
              let users: any[] = [];
              data.forEach(
                (d) =>
                  (users = [
                    ...users,
                    {
                      user: d.user,
                      groupId: d.in_group,
                    },
                  ])
              );
              users = [...new Set(users)];

              // Re-assign group members to groups
              /*
                                  users: users
                      .filter((u) => ids.includes(u.groupId))
                      .map((m) => {
                        return {
                          user: m.user,
                          inGroup: undefined,
                          since: '',
                        };
              */
              const ids: string[] = project.groups.map((g: any) => g.id);
              const projectExtended = {
                ...project,
                groups: project.groups.map((g) => ({
                  ...g,
                  members: data
                    .filter((m) => m.in_group === g.id)
                    .map(({ user, since }) => ({ user, since })),
                })),
                users: users
                  .filter((u) => ids.includes(u.groupId))
                  .map((m) => {
                    return {
                      user: m.user,
                      inGroup: project.groups.find((g) => g.id === m.groupId),
                      since: '',
                    };
                  }),
                documents: project.project_documents.map((pd) => pd.document),
              } as unknown as ExtendedProjectData;

              return { error, data: projectExtended };
            }
          }
        );
      }
    });

export const joinProject = (supabase: SupabaseClient, projectId: string) =>
  supabase
    .rpc('join_project_rpc', {
      _project_id: projectId,
    })
    .then(({ data, error }) => {
      if (error) {
        console.error('Error joining project', error);
        return false;
      } else {
        return data as unknown as boolean;
      }
    });

export const updateProject = (
  supabase: SupabaseClient,
  id: string,
  name: string,
  description: string,
  is_open_join: boolean,
  is_open_edit: boolean
) =>
  supabase
    .from('projects')
    .update({
      is_open_join: is_open_join,
      is_open_edit: is_open_edit,
      name: name,
      description: description,
    })
    .eq('id', id)
    .then(({ error }) => {
      if (error) return false;
      else return true;
    });
