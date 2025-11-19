import { GroupSelector } from '../GroupSelector';
import { Trash } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import type {
  ExtendedUserProfile,
  UserProfile,
  Group,
} from 'src/Types';
import { useTranslation } from 'react-i18next';

import './UsersTable.css';

interface UsersTableProps {

  users: ExtendedUserProfile[];

  me: UserProfile;

  groups: Group[];

  onDeleteUser(user: ExtendedUserProfile): void;

  onChangeGroup(user: ExtendedUserProfile, newGroupId: string): void;
}

// Helper to flatten the list of groups to the list of users

export const UsersTable = (props: UsersTableProps) => {
  const { t } = useTranslation(['common', 'user-management']);

  // Shorthands
  const isMe = (user: UserProfile) => user.id === props.me.id;

  return (
    <table className='users-table'>
      <thead>
        <tr>
          <th>{t('First Name', { ns: 'common' })}</th>
          <th>{t('Last Name', { ns: 'common' })}</th>
          <th>{t('Display Name', { ns: 'user-management' })}</th>
          <th>{t('Email', { ns: 'user-management' })}</th>
          <th>{t('Last Sign In', { ns: 'user-management' })}</th>
          <th>{t('User ID', { ns: 'user-management' })}</th>
          <th>{t('Access Level', { ns: 'common' })}</th>
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
            <td>
              {user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleString()
                : t('Never', { ns: 'user-management' })}
            </td>
            <td>{user.id}</td>

            <td>
              {isMe(user) ? (
                <button disabled className='owner'>
                  {t('You', { ns: 'common' })}
                </button>
              ) : (
                <GroupSelector
                  user={user}
                  availableGroups={props.groups}
                  onChangeGroup={props.onChangeGroup}
                />
              )}
            </td>

            <td className='actions'>
              {!isMe(user) && (
                <Button
                  className='delete-button'
                  onClick={() => props.onDeleteUser(user)}
                >
                  <Trash size={16} />
                  <span>{t('Delete User', { ns: 'user-management' })}</span>
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
