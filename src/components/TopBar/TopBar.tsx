import { AccountActions } from '@components/AccountActions';
import { Notifications } from '@components/Notifications';
import config from 'src/config.json';
import type {
  Invitation,
  Translations,
  ExtendedProjectData,
  MyProfile,
} from 'src/Types';

import './TopBar.css';

interface TopBarProps {
  i18n: Translations;

  invitations: Invitation[];

  me: MyProfile;

  onError(error: string): void;

  showNotifications?: boolean;

  isCreator?: boolean;

  onInvitationAccepted?(
    invitation: Invitation,
    project: ExtendedProjectData
  ): void;

  onInvitationDeclined?(invitation: Invitation): void;
}

export const TopBar = (props: TopBarProps) => {
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
          {props.showNotifications && (
            <Notifications
              i18n={props.i18n}
              invitations={props.invitations}
              onInvitationAccepted={
                props.onInvitationAccepted
                  ? props.onInvitationAccepted
                  : () => {}
              }
              onInvitationDeclined={
                props.onInvitationDeclined
                  ? props.onInvitationDeclined
                  : () => {}
              }
              onError={props.onError}
              isCreator={props.isCreator}
            />
          )}
          <AccountActions i18n={props.i18n} profile={props.me} />
        </div>
      </header>
    </div>
  );
};
