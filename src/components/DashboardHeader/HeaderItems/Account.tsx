import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Avatar } from '@components/Avatar';
import type { MyProfile, Translations } from 'src/Types';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface AccountProps {
  
  i18n: Translations;

  profile: MyProfile;

}

export const Account = (props: AccountProps) => {

  const { profile } = props;

  const { t } = props.i18n;

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
        <Content className="dropdown-content no-icons" sideOffset={5} align="end">
          <section>
            
          </section>
          
          <Item className="dropdown-item">
            <span>Your Profile</span>
          </Item>

          <Item className="dropdown-item">
            <span>Help</span>
          </Item>

          <Item className="dropdown-item">
            <span>Sign out</span>
          </Item>
        </Content>
      </Portal>
    </Root>
  )

}