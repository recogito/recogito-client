import { useEffect, useState } from 'react';
import { Toast, ToastContent, ToastProvider } from '@components/Toast';
import { UsersTable } from './UsersTable';
import type {
  MyProfile,
  Translations,
  ExtendedUserProfile,
  Group,
} from 'src/Types';
import { changeOrgGroupMembership } from '@backend/crud/users';
import { supabase } from '@backend/supabaseBrowserClient';
import { CheckFat, WarningDiamond } from '@phosphor-icons/react';

import './UserManagement.css';

const changeGroupMembership = async (
  user: ExtendedUserProfile,
  newGroupId: string
) => {
  return await changeOrgGroupMembership(supabase, user, newGroupId);
};

interface UserManagementProps {
  i18n: Translations;

  profiles: ExtendedUserProfile[];

  groups: Group[];

  me: MyProfile;
}

export const UserManagement = (props: UserManagementProps) => {
  const { t } = props.i18n;

  const [users, setUsers] = useState(props.profiles);
  const [filteredUsers, setFilteredUsers] = useState(props.profiles);
  const [toast, setToast] = useState<ToastContent | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    if (props.profiles) {
      setUsers(props.profiles);
      setFilteredUsers(props.profiles);
    }
  }, [props.profiles]);

  useEffect(() => {
    if (!search || search.length === 0) {
      setFilteredUsers(users);
    } else {
      const low = search.toLowerCase();
      setFilteredUsers(
        props.profiles.filter((p) => {
          if (
            p.first_name?.toLowerCase().includes(low) ||
            p.last_name?.toLowerCase().includes(low) ||
            p.email_address?.toLowerCase().includes(low) ||
            p.nickname?.toLowerCase().includes(low)
          ) {
            return true;
          }

          return false;
        })
      );
    }
  }, [search, users]);

  const onDeleteUser = (_user: ExtendedUserProfile) => {};

  const onDeleteError = () =>
    setToast({
      title: t['Something went wrong'],
      description: t['Could not delete user.'],
      type: 'error',
      icon: <WarningDiamond color='red' />,
    });

  const changeGroup = (user: ExtendedUserProfile, newGroupId: string) => {
    changeGroupMembership(user, newGroupId).then((result) => {
      if (!result) {
        setToast({
          title: t['Something went wrong'],
          description: t['Could not change user group.'],
          type: 'error',
          icon: <WarningDiamond color='red' />,
        });
      } else {
        const copy: ExtendedUserProfile[] = [...users];

        const idx = copy.findIndex((c) => c.id === user.id);
        if (idx > -1) {
          copy[idx].org_group_id = newGroupId;
          setUsers(copy);
        }

        setToast({
          title: t['Success'],
          description: t['User Access Level successfully changed.'],
          type: 'success',
          icon: <CheckFat color='green' />,
        });
      }
    });
  };

  return (
    <div className='user-management'>
      <ToastProvider>
        <h1>{t['User Management']}</h1>
        <label htmlFor='search'>{t['Search Users']}</label>
        <input
          autoFocus
          id='search'
          type='text'
          className='user-management-search'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <UsersTable
          i18n={props.i18n}
          me={props.me}
          users={filteredUsers}
          groups={props.groups}
          onDeleteUser={onDeleteUser}
          onDeleteUserError={onDeleteError}
          onChangeGroup={changeGroup}
        />

        <Toast
          content={toast}
          onOpenChange={(open) => !open && setToast(null)}
        />
      </ToastProvider>
    </div>
  );
};
