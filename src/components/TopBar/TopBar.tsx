import { AccountActions } from '@components/AccountActions';
import { Notifications } from '@components/Notifications';
import config from 'src/config.json';
import type {
  Invitation,
  Translations,
  Notification,
  ExtendedProjectData,
  MyProfile,
} from 'src/Types';

import './TopBar.css';
import { useState } from 'react';

interface TopBarProps {
  i18n: Translations;

  me: MyProfile;

  onError(error: string): void;

  isCreator?: boolean;

  onInvitationAccepted?(project: ExtendedProjectData): void;
}

export const TopBar = (props: TopBarProps) => {
  return (
    <div className='top-bar-container'>
      <header>
        <div className='top-bar-branding'>
          <img
            src={
              config.branding.top_logo && config.branding.top_logo !== ''
                ? `/img/${config.branding.top_logo}`
                : '/img/recogito-studio-logo.svg'
            }
            height={40}
            alt='branding logo'
          />
          {/* <div className='top-bar-platform'>
            {config.branding.platform_name}
          </div> */}
          <div className='top-bar-separator'></div>
          <div className='top-bar-site_name'>{config.branding.site_name}</div>
        </div>
        <div className='top-bar-actions'>
          <Notifications
            i18n={props.i18n}
            onInvitationAccepted={
              props.onInvitationAccepted ? props.onInvitationAccepted : () => {}
            }
            onError={props.onError}
            isCreator={props.isCreator}
            me={props.me}
          />
          <AccountActions i18n={props.i18n} profile={props.me} />
        </div>
      </header>
    </div>
  );
};
