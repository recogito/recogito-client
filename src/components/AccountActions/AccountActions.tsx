import type { ReactNode } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import {
  Folder,
  ListChecks,
  Question,
  SignOut,
  Sliders,
  Users
} from '@phosphor-icons/react';
import { Avatar } from '@components/Avatar';
import type { MyProfile } from 'src/Types';

import './AccountActions.css';
import { useTranslation } from 'react-i18next';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

const helpRedirect = import.meta.env.PUBLIC_HELP_REDIRECT;

interface AccountProps {
  align?: 'center' | 'end' | 'start';

  alignOffset?: number;

  children?: ReactNode;

  profile: MyProfile;

  sideOffset?: number;
}

export const AccountActions = (props: AccountProps) => {
  const { profile } = props;

  const { i18n, t } = useTranslation(['a11y', 'account-menu', 'common']);

  const realname = [profile.first_name, profile.last_name]
    .filter((str) => str)
    .join(' ');

  const goto = (url: string) => () => (window.location.href = url);

  const align = props.align || 'end';

  const alignOffset = props.alignOffset || -10;

  const sideOffset = props.sideOffset || 8;

  return (
    <Root>
      <Trigger asChild>
        {props.children ? (
          props.children
        ) : (
          <button
            className='unstyled account-actions-trigger'
            style={{ border: 'none' }}
            aria-label={t('profile', { ns: 'a11y' })}
          >
            <Avatar
              id={profile.id}
              name={profile.nickname}
              avatar={profile.avatar_url}
            />
          </button>
        )}
      </Trigger>

      <Portal>
        <Content
          className='dropdown-content'
          align={align}
          alignOffset={alignOffset}
          sideOffset={sideOffset}
        >
          {(Boolean(profile.nickname) || Boolean(realname)) && (
            <section className='account-actions-meta'>
              {profile.nickname && realname ? (
                <>
                  <h1>{profile.nickname}</h1>
                  <h2>{realname}</h2>
                </>
              ) : profile.nickname ? (
                <h1>{profile.nickname}</h1>
              ) : (
                <h1>{realname}</h1>
              )}

              {profile.isOrgAdmin && (
                <div className='role-badge'>Organization Admin</div>
              )}
            </section>
          )}

          <section>
            <Item
              className='dropdown-item'
              onSelect={goto(`/${i18n.language}/account/me`)}
            >
              <Sliders size={16} />
              <a href={`/${i18n.language}/account/me`}>{t('Profile Settings', { ns: 'account-menu' })}</a>
            </Item>

            {helpRedirect && (
              <Item className='dropdown-item'>
                <Question size={16} />
                <a href={helpRedirect} target='_blank' aria-label={t('help', { ns: 'a11y' })} rel='noreferrer'>
                  {t('Help', { ns: 'account-menu' })}
                </a>
              </Item>
            )}

            <Item
              className='dropdown-item'
              onSelect={goto(`/${i18n.language}/sign-out`)}
            >
              <SignOut size={16} />
              <a href={`/${i18n.language}/sign-out`} aria-label={t('sign out', { ns: 'a11y' })}>
                {t('Sign out', { ns: 'account-menu' })}
              </a>
            </Item>

            {props.profile.isOrgAdmin && (
              <>
                <div className='dropdown-separator' />

                <div className='dropdown-label'>{t('Site Administration', { ns: 'common' })}</div>

                <Item
                  className='dropdown-item'
                  onSelect={goto(`/${i18n.language}/users`)}
                >
                  <Users size={16} />
                  <a href={`/${i18n.language}/users`} aria-label={t('user management', { ns: 'a11y' })}>
                    {t('Users', { ns: 'common' })}
                  </a>
                </Item>

                <Item
                  className='dropdown-item'
                  onSelect={goto(`/${i18n.language}/collections`)}
                >
                  <Folder size={16} />
                  <a href={`/${i18n.language}/collections`} aria-label={t('collection management', { ns: 'a11y' })}>
                    {t('Collections', { ns: 'common' })}
                  </a>
                </Item>

                <Item
                  className='dropdown-item'
                  onSelect={goto(`/${i18n.language}/jobs`)}
                >
                  <ListChecks size={16} />
                  <a href={`/${i18n.language}/jobs`} aria-label={t('jobs management', { ns: 'jobs-management' })}>
                    {t('Jobs', { ns: 'jobs-management' })}
                  </a>
                </Item>
              </>
            )}
          </section>
        </Content>
      </Portal>
    </Root>
  );
};
