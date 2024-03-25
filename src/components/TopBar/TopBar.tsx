import { Notifications } from '@components/Notifications';
import { Invitation, Translations, ExtendedProjectData, MyProfile } from 'src/Types';
import { useState } from 'react';

import config from 'src/config.json';
import { AccountActions } from '@components/AccountActions';


import './TopBar.css';

interface TopBarProps {
  i18n: Translations;
  invitations: Invitation[];
  me: MyProfile;

  projects: ExtendedProjectData[];

  onError(error: string): void;
}

export const TopBar = (props: TopBarProps) => {

  const [invitations, setInvitations] = useState<Invitation[]>(props.invitations);

  const [projects, setProjects] = useState<ExtendedProjectData[]>(
    props.projects
  );

  const onInvitationAccepted = (
    invitation: Invitation,
    project: ExtendedProjectData
  ) => {
    setInvitations((invitations) =>
      invitations.filter((i) => i.id !== invitation.id)
    );

    // Make sure we're not creating a duplicate in the list by joining a
    // project we're already a member of!
    setProjects([
      ...projects.filter((p) => p.id !== project.id),
      project,
    ]);
  };

  const onInvitationDeclined = (invitation: Invitation) =>
    setInvitations((invitations) =>
      invitations.filter((i) => i.id !== invitation.id)
    );

  return (
    <div className='top-bar-container'>
      <header>
        <div className='top-bar-branding'>
          <div className='top-bar-platform'>
            {config.branding.platform_name}
          </div>
          <div className='top-bar-separator'></div>
          <div className='top-bar-site_name'>{config.branding.site_name}</div>
        </div>
        <div className='top-bar-actions'>
          <Notifications
            i18n={props.i18n}
            invitations={invitations}
            onInvitationAccepted={onInvitationAccepted}
            onInvitationDeclined={onInvitationDeclined}
            onError={props.onError}
          />
          <AccountActions i18n={props.i18n} profile={props.me} />
        </div>
      </header>
    </div>
  )

}