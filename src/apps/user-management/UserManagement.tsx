import { useEffect, useState } from 'react';
import { Toast, type ToastContent, ToastProvider } from '@components/Toast';
import { UsersTable } from './UsersTable';
import type {
  MyProfile,
  ExtendedUserProfile,
  Group,
} from 'src/Types';
import { changeOrgGroupMembership, deleteUser } from '@backend/crud/users';
import { supabase } from '@backend/supabaseBrowserClient';
import { CheckFat, WarningDiamond, ArrowLeft } from '@phosphor-icons/react';
import { DeleteWarningMessage } from './DeleteWarningMessage';
import { TopBar } from '@components/TopBar';
import { InviteUserDialog } from './InviteUserDialog';
import { inviteUserToOrg } from '@backend/helpers';
import { getProfilesExtended } from '@backend/helpers/profileHelpers';
import clientI18next from 'src/i18n/client';
import { useTranslation, I18nextProvider } from 'react-i18next';

import './UserManagement.css';

const changeGroupMembership = async (
  user: ExtendedUserProfile,
  newGroupId: string
) => {
  return await changeOrgGroupMembership(supabase, user, newGroupId);
};

interface UserManagementProps {

  profiles: ExtendedUserProfile[];

  groups: Group[];

  canInvite: boolean | undefined;

  me: MyProfile;
}

const UserManagement = (props: UserManagementProps) => {
  const { t, i18n } = useTranslation(['common', 'project-collaboration', 'user-management']);

  const [users, setUsers] = useState(props.profiles);
  const [filteredUsers, setFilteredUsers] = useState(props.profiles);
  const [toast, setToast] = useState<ToastContent | null>(null);
  const [search, setSearch] = useState<string>('');
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<
    ExtendedUserProfile | undefined
  >();

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

  const onDeleteUser = (user: ExtendedUserProfile) => {
    setUserToDelete(user);
    setDeleteWarningOpen(true);
  };

  const onDeleteConfirm = () => {
    setDeleteWarningOpen(false);
    deleteUser(userToDelete as ExtendedUserProfile).then((result) => {
      if (!result) {
        setToast({
          title: t('Something went wrong', { ns: 'common' }),
          description: t('Could not delete user.', { ns: 'project-collaboration' }),
          type: 'error',
          icon: <WarningDiamond color='red' />,
        });
      } else {
        const copy: ExtendedUserProfile[] = [...users];

        const idx = copy.findIndex(
          (c) => c.id === (userToDelete as ExtendedUserProfile).id
        );
        if (idx > -1) {
          copy.splice(idx, 1);
          setUsers(copy);
        }

        setToast({
          title: t('Success', { ns: 'common' }),
          description: t('User successfully deleted.', { ns: 'user-management' }),
          type: 'success',
          icon: <CheckFat color='green' />,
        });
      }
      setUserToDelete(undefined);
    });
  };

  const onCancelDelete = () => {
    setDeleteWarningOpen(false);
    setUserToDelete(undefined);
  };

  const changeGroup = (user: ExtendedUserProfile, newGroupId: string) => {
    changeGroupMembership(user, newGroupId).then((result) => {
      if (!result) {
        setToast({
          title: t('Something went wrong', { ns: 'common' }),
          description: t('Could not change user group.', { ns: 'user-management' }),
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
          title: t('Success', { ns: 'common' }),
          description: t('User Access Level successfully changed.', { ns: 'user-management' }),
          type: 'success',
          icon: <CheckFat color='green' />,
        });
      }
    });
  };

  const handleInviteUser = (email: string) => {
    inviteUserToOrg(supabase, email).then((success) => {
      if (success) {
        // update local user list
        getProfilesExtended(supabase).then(({ error, data }) => {
          if (error) {
            console.log('Error retrieving user list: ', error.message);
            return;
          } else {
            setUsers(data);

            setToast({
              title: t('Success', { ns: 'common' }),
              description: t('User has been invited.', { ns: 'user-management' }),
              type: 'success',
              icon: <CheckFat color='green' />,
            });
          }
        });
      }
    });
  };

  return (
    <div className='user-management'>
      <ToastProvider>
        <TopBar
          onError={(error) => console.log(error)}
          me={props.me}
        />
        <div className='user-management-header'>
          <div>
            <a
              href={`/${i18n.language}/projects`}
              style={{ marginTop: 15, zIndex: 1000 }}
            >
              <ArrowLeft className='text-bottom' size={16} />
              <span>{t('Back to Projects', { ns: 'common' })}</span>
            </a>
            <h1>{t('User Management', { ns: 'user-management' })}</h1>
          </div>
        </div>
        <div className='user-management-content'>
          <div className='user-management-actions'>
            <div>
              <label htmlFor='search'>{t('Search Users', { ns: 'user-management' })}</label>
              <input
                autoFocus
                id='search'
                type='text'
                className='user-management-search'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {props.canInvite && (
              <InviteUserDialog onSave={handleInviteUser} />
            )}
          </div>
          <div className='user-management-table'>
            <UsersTable
              me={props.me}
              users={filteredUsers}
              groups={props.groups}
              onDeleteUser={onDeleteUser}
              onChangeGroup={changeGroup}
            />
          </div>

          <Toast
            content={toast}
            onOpenChange={(open) => !open && setToast(null)}
          />
          <DeleteWarningMessage
            open={deleteWarningOpen}
            onCancel={onCancelDelete}
            onConfirm={onDeleteConfirm}
          />
        </div>
      </ToastProvider>
    </div>
  );
};

export const UserManagementApp = (props: UserManagementProps) => (
  <I18nextProvider i18n={clientI18next}>
    <UserManagement {...props} />
  </I18nextProvider>
);
