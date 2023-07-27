import { useState } from 'react';
import * as InviteDialog from '@radix-ui/react-dialog';
import { UserPlus, X } from '@phosphor-icons/react';
import { Toast, ToastContent, ToastProvider } from '@components/Toast';
import InviteUsersToProject from './InviteUsersToProject';
import { MembersTable } from './MembersTable/MembersTable';
import type { TeamMember } from './TeamMember';
import type { ExtendedProjectData, Invitation, ProjectGroup, Translations, UserProfile } from 'src/Types';

import './ManageUsers.css';

interface ManageUsersProps {

  i18n: Translations;

  project: ExtendedProjectData;

  invitations: Invitation[];

  me: UserProfile;

};

export const ManageUsers = (props: ManageUsersProps) => {

  const { t } = props.i18n;

  const [project, setProject] = useState(props.project);

  const [error, setError] = useState<ToastContent | null>(null);

  const [data, setData] = useState<any[]>();

  const [selected, setSelected] = useState<string[]>([]);

  const handleToggleSelected = (id: string) => {
    if (selected.includes(id)) {
      setSelected((old) => old.filter((i) => i != id));
    }
    else setSelected((old) => [...old, id]);
  };

  const toggleSelectAll = () => {
    if (data && data.length == selected.length) {
      setSelected([]);
    }
    else setSelected(data ? data.map((i) => i.profiles.id) : []);
  };

  const onChangeGroup = (member: TeamMember, from: ProjectGroup, to: ProjectGroup) => {
    // Update the member
    const updated = {
      ...member,
      inGroup: to
    };

    // Update project groups
    setProject(project => ({
      ...project,
      groups: project.groups.map(group => group.id === from.id ? (
        // Remove user from this group
        { ...group, members: group.members.filter(m => m.user.id !== member.user.id) }
      ) : group.id === to.id ? (
        // Add user to this group
        { ...group, members: [...group.members, updated ]}
      ) : group)
    }));
  }

  const onDeleteMember = (member: TeamMember) => {
    // Remove the user from this project
    setProject(project => ({
      ...project,
      groups: project.groups.map(group => ({
        ...group,
        members: group.members.filter(m => m.user.id !== member.user.id)
      }))
    }));
  }

  const onDeleteError = () => 
    setError({ 
      title: t['Something went wrong'], 
      description: t['Could not delete user.'], 
      type: 'error' 
    });

  return (
    <div className="manage-users">
      <ToastProvider>
        <h1>Project Team</h1>

        <InviteDialog.Root>
          <InviteDialog.Trigger asChild>
            <button className="primary invite-user">
              <UserPlus size={20} /> <span>Add a user</span>
            </button>
          </InviteDialog.Trigger>

          <InviteDialog.Portal>
            <InviteDialog.Overlay className="CollabDialogOverlay" />
            <InviteDialog.Content className="CollabDialogContent">
              <InviteDialog.Title>
                Invite User to Project
              </InviteDialog.Title>
              <InviteDialog.Description>
                Enter the email and role below.
              </InviteDialog.Description>

              <InviteUsersToProject
                i18n={props.i18n}
                project={props.project}
                user={props.me}
                onUpdatePending={() => console.log('')}
              />

              <InviteDialog.Close asChild>
                <button className="CollabDialogClose icon-only unstyled" aria-label="Close">
                  <X size={20} />
                </button>
              </InviteDialog.Close>
            </InviteDialog.Content>
          </InviteDialog.Portal>
        </InviteDialog.Root>

        <MembersTable 
          i18n={props.i18n}
          groups={project.groups} 
          invitations={props.invitations}
          onChangeGroup={onChangeGroup} 
          onDeleteMember={onDeleteMember} 
          onDeleteMemberError={onDeleteError} />

        <Toast
          content={error}
          onOpenChange={open => !open && setError(null)} />
      </ToastProvider>
    </div>
  )

}