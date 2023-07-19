import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Question, SignOut, Sliders } from '@phosphor-icons/react';
import { Avatar } from '@components/Avatar';
import type { MyProfile, Translations } from 'src/Types';

import './Account.css';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface AccountProps {
  
  i18n: Translations;

  profile: MyProfile;

}

export const Account = (props: AccountProps) => {

  const { profile } = props;

  const { t } = props.i18n;

  const realname = [profile.first_name, profile.last_name].filter(str => str).join(' ');

  return (
    <Root>
      <Trigger asChild>
        <button className="unstyled actions-trigger" style={{ border: 'none' }}>
          <Avatar 
            id={profile.id} 
            name={profile.nickname} 
            avatar={profile.avatar_url} />
        </button>
      </Trigger>

      <Portal>
        <Content className="dropdown-content no-icons" alignOffset={-5} sideOffset={5} align="end">
          {(Boolean(profile.nickname) || Boolean(realname)) && (
            <section className="account-info">
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
            <Item className="dropdown-item">
              <Sliders size={16} /> <span>Profile Settings</span>
            </Item>

            <Item className="dropdown-item">
              <Question size={16} /> <span>Help</span>
            </Item>

            <Item className="dropdown-item">
              <SignOut size={16} /> <span>Sign out</span>
            </Item>
          </section>
        </Content>
      </Portal>
    </Root>
  )

}