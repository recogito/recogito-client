import { GroupSelector } from '../GroupSelector';
import type {
  Translations,
  ExtendedUserProfile,
  UserProfile,
  Group,
} from 'src/Types';
import { DeleteUser } from '../DeleteUser';
import type { PostgrestError } from '@supabase/supabase-js';

import './UsersTable.css';

interface UsersTableProps {
  i18n: Translations;

  users: ExtendedUserProfile[];

  me: UserProfile;

  groups: Group[];

  onDeleteUser(user: ExtendedUserProfile): void;

  onDeleteUserError(error: PostgrestError): void;

  onChangeGroup(user: ExtendedUserProfile, newGroupId: string): void;
}

// Helper to flatten the list of groups to the list of users

export const UsersTable = (props: UsersTableProps) => {
  const { t } = props.i18n;

  // Shorthands
  const isMe = (user: UserProfile) => user.id === props.me.id;

  return (
    <table className='users-table'>
      <thead>
        <tr>
          <th>{t['First Name']}</th>
          <th>{t['Last Name']}</th>
          <th>{t['Nickname']}</th>
          <th>{t['Email']}</th>
          <th>{t['Last Sign In']}</th>
          <th>{t['User ID']}</th>
          <th>{t['Access Level']}</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {props.users.map((user) => (
          <tr key={user.id}>
            <td>{user.first_name}</td>
            <td>{user.last_name}</td>
            <td>{user.nickname}</td>
            <td>{user.email_address}</td>
            <td>{new Date(user.last_sign_in_at).toLocaleString()}</td>
            <td>{user.id}</td>

            <td>
              {isMe(user) ? (
                <button disabled className='owner'>
                  {t['You']}
                </button>
              ) : (
                <GroupSelector
                  i18n={props.i18n}
                  user={user}
                  availableGroups={props.groups}
                  onChangeGroup={props.onChangeGroup}
                />
              )}
            </td>

            <td className='actions'>
              {!isMe(user) && (
                <DeleteUser
                  i18n={props.i18n}
                  user={user}
                  me={props.me}
                  onDeleteUser={props.onDeleteUser}
                  onDeleteError={props.onDeleteUserError}
                />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
