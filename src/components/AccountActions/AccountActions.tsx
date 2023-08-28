import type { ReactNode } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Question, SignOut, Sliders } from '@phosphor-icons/react';
import { Avatar } from '@components/Avatar';
import type { MyProfile, Translations } from 'src/Types';

import './AccountActions.css';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface AccountProps {

  align?: 'center' | 'end' | 'start';

  alignOffset?: number; 

  children?: ReactNode
  
  i18n: Translations;

  profile: MyProfile;

  sideOffset?: number; 

}

export const AccountActions = (props: AccountProps) => {

  const { profile } = props;

  const { lang, t } = props.i18n;

  const realname = [profile.first_name, profile.last_name].filter(str => str).join(' ');

  const goto = (url: string) => () => window.location.href = url;

  const align = props.align || 'end';

  const alignOffset = props.alignOffset || -10;

  const sideOffset = props.sideOffset || 8;

  return (
    <Root>
      <Trigger asChild>
        {props.children ? (
          props.children
        ) : (
          <button className="unstyled account-actions-trigger" style={{ border: 'none' }}>
            <Avatar 
              id={profile.id} 
              name={profile.nickname} 
              avatar={profile.avatar_url} />
          </button>
        )}
      </Trigger>

      <Portal>
        <Content 
          className="dropdown-content" 
          align={align}
          alignOffset={alignOffset} 
          sideOffset={sideOffset}>
          {(Boolean(profile.nickname) || Boolean(realname)) && (
            <section className="account-actions-meta">
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
                <div className="role-badge">Organization Admin</div>
              )}
            </section>
          )}
          
          <section>
            <Item className="dropdown-item" onSelect={goto(`/${lang}/account/me`)}>
              <Sliders size={16} /> 
              <a href={`/${lang}/account/me`}>{t['Profile Settings']}</a>
            </Item>

            <Item className="dropdown-item" onSelect={goto(`/${lang}/help`)}>
              <Question size={16} /> 
              <a href={`/${lang}/help`}>{t['Help']}</a>
            </Item>

            <Item className="dropdown-item" onSelect={goto(`/${lang}/sign-out`)}>
              <SignOut size={16} /> 
              <a href={`/${lang}/sign-out`}>{t['Sign out']}</a>
            </Item>
          </section>
        </Content>
      </Portal>
    </Root>
  )

}