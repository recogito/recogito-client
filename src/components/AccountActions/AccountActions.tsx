import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Question, SignOut, Sliders } from '@phosphor-icons/react';
import { Avatar } from '@components/Avatar';
import type { MyProfile, Translations } from 'src/Types';

import './AccountActions.css';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface AccountProps {
  
  i18n: Translations;

  profile: MyProfile;

}

export const AccountActions = (props: AccountProps) => {

  const { profile } = props;

  const { lang, t } = props.i18n;

  const realname = [profile.first_name, profile.last_name].filter(str => str).join(' ');

  const goto = (url: string) => () => window.location.href = url;

  return (
    <Root>
      <Trigger asChild>
        <button className="unstyled account-actions-trigger" style={{ border: 'none' }}>
          <Avatar 
            id={profile.id} 
            name={profile.nickname} 
            avatar={profile.avatar_url} />
        </button>
      </Trigger>

      <Portal>
        <Content className="dropdown-content no-icons" alignOffset={-10} sideOffset={8} align="end">
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