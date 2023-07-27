import { useState } from 'react';
import { Toast, ToastContent, ToastProvider } from '@components/Toast';
import { InviteUser } from './InviteUser';
import { MembersTable } from './MembersTable';
import type { TeamMember } from './TeamMember';
import type { ExtendedProjectData, Invitation, ProjectGroup, Translations, UserProfile } from 'src/Types';

import './ProjectCollaboration.css';

interface ManageUsersProps {

  i18n: Translations;

  project: ExtendedProjectData;

  invitations: Invitation[];

  me: UserProfile;

};

export const ProjectCollaboration = (props: ManageUsersProps) => {

  const { t } = props.i18n;

  const [project, setProject] = useState(props.project);

  const [invitations, setInvitations] = useState(props.invitations);

  const [toast, setToast] = useState<ToastContent | null>(null);

  const onChangeGroup = (member: TeamMember, from: ProjectGroup, to: ProjectGroup) => {
    // Update member
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
    // Remove user from this project
    setProject(project => ({
      ...project,
      groups: project.groups.map(group => ({
        ...group,
        members: group.members.filter(m => m.user.id !== member.user.id)
      }))
    }));
  }

  const onDeleteError = () => 
    setToast({ 
      title: t['Something went wrong'], 
      description: t['Could not delete user.'], 
      type: 'error' 
    });

  const onInvitationSent = (invitation: Invitation) => {
    setToast({ 
      title: 'Invitation Sent', 
      description: `Invitation was sent to ${invitation.email}`, 
      type: 'success'
    });

    setInvitations(invitations => ([...invitations, invitation ]));
  }

  const onInvitationError = () =>
    setToast({ 
      title: t['Something went wrong'], 
      description: t['Could not sent invitation.'], 
      type: 'error' 
    });
    
  return (
    <div className="manage-users">
      <ToastProvider>
        <h1>Project Team</h1>

        <InviteUser 
          i18n={props.i18n} 
          me={props.me}
          project={project} 
          onInvitiationSent={onInvitationSent} 
          onInvitiationError={onInvitationError} />

        <MembersTable 
          i18n={props.i18n}
          groups={project.groups} 
          invitations={invitations}
          onChangeGroup={onChangeGroup} 
          onDeleteMember={onDeleteMember} 
          onDeleteMemberError={onDeleteError} />

        <Toast
          content={toast}
          onOpenChange={open => !open && setToast(null)} />
      </ToastProvider>
    </div>
  )

}