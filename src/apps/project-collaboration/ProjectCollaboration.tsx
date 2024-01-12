import { useState } from 'react';
import { Toast, ToastContent, ToastProvider } from '@components/Toast';
import { InviteUser } from './InviteUser';
import { MembersTable } from './MembersTable';
import type { TeamMember } from './TeamMember';
import type {
  ExtendedProjectData,
  Invitation,
  MyProfile,
  Group,
  Translations,
} from 'src/Types';

import './ProjectCollaboration.css';

interface ProjectCollaborationProps {
  i18n: Translations;

  project: ExtendedProjectData;

  invitations: Invitation[];

  me: MyProfile;
}

export const ProjectCollaboration = (props: ProjectCollaborationProps) => {
  const { t } = props.i18n;

  const [project, setProject] = useState(props.project);

  const [invitations, setInvitations] = useState(props.invitations);

  const [toast, setToast] = useState<ToastContent | null>(null);

  const onChangeGroup = (member: TeamMember, from: Group, to: Group) => {
    // Update member
    const updated = {
      ...member,
      inGroup: to,
    };

    // Update project groups
    setProject((project) => ({
      ...project,
      groups: project.groups.map((group) =>
        group.id === from.id
          ? // Remove user from this group
            {
              ...group,
              members: group.members.filter(
                (m) => m.user.id !== member.user.id
              ),
            }
          : group.id === to.id
          ? // Add user to this group
            { ...group, members: [...group.members, updated] }
          : group
      ),
    }));
  };

  const onDeleteMember = (member: TeamMember) => {
    // Remove user from this project
    setProject((project) => ({
      ...project,
      groups: project.groups.map((group) => ({
        ...group,
        members: group.members.filter(m => m.user.id !== member.user.id)
      }))
    }));
  };

  const onDeleteInvitation = (invitation: Invitation) => {
    setInvitations(invitations.filter((i) => i.email !== invitation.email));
  };

  const onDeleteError = () =>
    setToast({
      title: t['Something went wrong'],
      description: t['Could not delete user.'],
      type: 'error',
    });

  const onDeleteInviteError = () =>
    setToast({
      title: t['Something went wrong'],
      description: t['Could not delete invitation.'],
      type: 'error',
    });

  const onInvitationSent = (invitation: Invitation) => {
    setToast({
      title: t['Invitation Sent'],
      description: t['Invitation was sent to'].replace(
        '${user}',
        invitation.email
      ),
      type: 'success',
    });

    setInvitations((invitations) => [...invitations, invitation]);
  };

  const onInvitationError = () =>
    setToast({
      title: t['Something went wrong'],
      description: t['Could not send invitation.'],
      type: 'error',
    });

  return (
    <div className='project-collaboration'>
      <ToastProvider>
        <h1>{t['Project Team']}</h1>

        <InviteUser
          i18n={props.i18n}
          me={props.me}
          project={project}
          invitations={invitations}
          onInvitiationSent={onInvitationSent}
          onInvitiationError={onInvitationError}
        />

        <MembersTable
          i18n={props.i18n}
          project={project}
          invitations={invitations}
          me={props.me}
          onChangeGroup={onChangeGroup}
          onDeleteMember={onDeleteMember}
          onDeleteMemberError={onDeleteError}
          onDeleteInvite={onDeleteInvitation}
          onDeleteInvitationError={onDeleteInviteError}
        />

        <Toast
          content={toast}
          onOpenChange={(open) => !open && setToast(null)}
        />
      </ToastProvider>
    </div>
  );
};
