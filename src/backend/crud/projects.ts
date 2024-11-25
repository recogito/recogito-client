import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ExtendedProjectData,
  Invitation,
  JoinRequest,
  Project,
} from 'src/Types';
import type { Response } from '@backend/Types';
import { getUser } from '@backend/auth';
import type { ApiPostInviteUserToProject } from 'src/Types';
import type { InviteListEntry } from '@apps/project-collaboration/InviteListOfUsersDialog/InviteListOfUsers';

export const createProject = (
  supabase: SupabaseClient,
  name: string,
  description: string | null = null
): Response<Project> =>
  supabase
    .from('projects')
    .insert({
      name,
      description,
    })
    .select()
    .single()
    .then(({ error, data }) => ({ error, data: data as Project }));

// Note: users cannot normally delete projects, as soon as there are
// other entities linked to them (projet -> context -> document etc.).
// This method is only needed in case of error handling, when creating
// of the default context fails, and the project can *actually* be safely
// deleted from the DB. All other user actions will archive rather than
// delete.
export const deleteProject = (supabase: SupabaseClient, id: string) =>
  supabase.from('projects').delete().match({ id }).select();

export const archiveProject = (
  supabase: SupabaseClient,
  id: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    supabase
      .rpc('archive_record_rpc', {
        _table_name: 'projects',
        _id: id,
      })
      .then(({ error }) => {
        if (error) reject(error);
        else resolve();
      });
  });

export const getProject = (
  supabase: SupabaseClient,
  id: string
): Response<Project> =>
  supabase
    .from('projects')
    .select()
    .eq('id', id)
    .single()
    .then(({ error, data }) => ({ error, data: data as Project }));

export const listMyProjects = (supabase: SupabaseClient): Response<Project[]> =>
  getUser(supabase).then((_user) =>
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
        description
      `
      )
      .then(({ error, data }) => ({
        error,
        data: data as unknown as Project[],
      }))
  );

export const updateProject = (
  supabase: SupabaseClient,
  partial: { id: string; [key: string]: string | null }
): Response<Project> =>
  supabase
    .from('projects')
    .update({ ...partial })
    .eq('id', partial.id)
    .select()
    .single()
    .then(({ error, data }) => ({ error, data: data as Project }));

// export const inviteUserToProject = (
//   supabase: SupabaseClient,
//   email: string,
//   project: Project | ExtendedProjectData,
//   groupId: string,
//   invitedBy?: string
// ): Response<Invitation> =>
//   supabase
//     .from('invites')
//     .insert({
//       email: email.toLowerCase(),
//       project_id: project.id,
//       project_name: project.name,
//       project_group_id: groupId,
//       invited_by_name: invitedBy,
//     })
//     .select()
//     .single()
//     .then(({ error, data }) => ({ error, data: data as Invitation }));

export const inviteUserToProject = (
  supabase: SupabaseClient,
  email: string,
  project: Project | ExtendedProjectData,
  groupId: string,
  invitedBy?: string
): Promise<Invitation> =>
  new Promise((resolve, reject) => {
    const payload: ApiPostInviteUserToProject = {
      users: [{ email: email, projectGroupId: groupId }],
      projectId: project.id,
      projectName: project.name,
      invitedBy: invitedBy || '',
    };

    return supabase.auth.getSession().then(({ error, data }) => {
      // Get Supabase session token first
      if (error) {
        // Shouldn't really happen at this point
        reject(error);
      } else {
        const token = data.session?.access_token;
        if (!token) {
          // Shouldn't really happen at this point
          reject('Not authorized');
        } else {
          fetch('/api/invite-user-to-project', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          })
            .then((res) => res.json())
            .then(({ data }) => resolve(data[0] as Invitation));
        }
      }
    });
  });

export const inviteUsersToProject = (
  supabase: SupabaseClient,
  users: InviteListEntry[],
  project: Project | ExtendedProjectData,
  groupIds: { [key: string]: string },
  invitedBy?: string
): Response<Invitation[]> => {
  new Promise((resolve, reject) => {
    const payload: ApiPostInviteUserToProject = {
      users: users.map((u) => ({
        email: u.email,
        projectGroupId: groupIds[u.role],
      })),
      projectId: project.id,
      projectName: project.name,
      invitedBy: invitedBy || '',
    };

    return supabase.auth.getSession().then(({ error, data }) => {
      // Get Supabase session token first
      if (error) {
        // Shouldn't really happen at this point
        reject(error);
      } else {
        const token = data.session?.access_token;
        if (!token) {
          // Shouldn't really happen at this point
          reject('Not authorized');
        } else {
          fetch('/api/invite-user-to-project', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          })
            .then((res) => res.json())
            .then(({ data }) => resolve(data as Invitation));
        }
      }
    });
  });
  return supabase
    .from('invites')
    .insert(
      users.map((u) => {
        return {
          email: u.email.toLowerCase(),
          project_id: project.id,
          project_name: project.name,
          project_group_id: groupIds[u.role],
          invited_by_name: invitedBy,
        };
      })
    )
    .select()
    .then(({ error, data }) => ({ error, data: data as Invitation[] }));
};

export const retrievePendingInvites = async (
  supabase: SupabaseClient,
  email: string
) => {
  const { count } = await supabase
    .from('invites')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .is('accepted', false)
    .is('ignored', false);
  return count;
};

export const listPendingInvitations = (
  supabase: SupabaseClient,
  projectId: string
): Response<Invitation[]> =>
  supabase
    .from('invites')
    .select(
      `
      id,
      created_at,
      email,
      invited_by_name,
      project_id,
      project_name,
      project_group_id,
      accepted,
      ignored
    `
    )
    .eq('project_id', projectId)
    .is('accepted', false)
    .is('ignored', false)
    .then(({ error, data }) => ({ error, data: data as Invitation[] }));

export const listPendingRequests = (
  supabase: SupabaseClient,
  projectId: string
): Response<JoinRequest[]> =>
  supabase
    .from('join_requests')
    .select(
      `
      id,
      created_at,
      project_id,
      user_id,
      accepted,
      ignored,
      user: user_id (
        id,
        first_name,
        last_name,
        nickname,
        avatar_url
      )
    `
    )
    .eq('project_id', projectId)
    .is('accepted', false)
    .then(({ error, data }) => ({
      error,
      data: data as unknown as JoinRequest[],
    }));

export const listProjectUsers = async (
  supabase: SupabaseClient,
  typeIds: string[]
) => {
  const { data } = await supabase
    .from('group_users')
    .select(
      `
      type_id,
      profiles!group_users_user_id_fkey (
        id,
        first_name,
        last_name,
        nickname,
        email
      )
    `
    )
    .in('type_id', typeIds);
  return data;
};

export const getProjectGroups = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const { error, data } = await supabase
    .from('project_groups')
    .select(
      `
      id,
      name
      `
    )
    .eq('project_id', projectId);
  return { error, data };
};

export const updateUserProjectGroup = (
  supabase: SupabaseClient,
  userId: string,
  oldTypeId: string,
  newTypeId: string
): Response<boolean> =>
  supabase
    .from('group_users')
    .update({
      type_id: newTypeId,
    })
    .eq('user_id', userId)
    .eq('type_id', oldTypeId)
    .then(({ error }) => ({ error, data: !error }));

export const leaveProject = (
  supabase: SupabaseClient,
  projectId: string
): Response<boolean> =>
  supabase
    .rpc('leave_project_rpc', { _project_id: projectId })
    .then((resp) => resp.data);

export const leaveGroup = (
  supabase: SupabaseClient,
  userId: string,
  groupId: string
): Response<boolean> =>
  supabase
    .from('group_users')
    .delete()
    .match({
      group_type: 'project',
      type_id: groupId,
      user_id: userId,
    })
    .then(({ error }) => ({ error, data: !error }));

export const removeUserFromProject = (
  supabase: SupabaseClient,
  userId: string,
  projectId: string
): Response<boolean> =>
  supabase
    .rpc('remove_user_from_project_rpc', {
      _project_id: projectId,
      _user_id: userId,
    })
    .then(({ data }) => ({ error: null, data: data }));
