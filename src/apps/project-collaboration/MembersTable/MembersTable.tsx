import { useState } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import type { PostgrestError } from '@supabase/supabase-js';
import { CheckSquare, Square } from '@phosphor-icons/react';
import { AnonymousTooltip } from '@components/AnonymousTooltip';
import { formatName } from '@components/Avatar';
import { GroupSelector } from '../GroupSelector';
import { DeleteInvite } from '../DeleteInvite';
import { DeleteMember } from '../DeleteMember';
import type {
  ExtendedProjectData,
  Invitation,
  Group,
  Translations,
  UserProfile,
  Member,
} from 'src/Types';

import './MembersTable.css';

interface MembersTableProps {
  i18n: Translations;

  project: ExtendedProjectData;

  invitations: Invitation[];

  me: UserProfile;

  onChangeGroup(member: Member, from: Group, to: Group): void;

  onDeleteMember(member: Member): void;

  onDeleteInvite(invitation: Invitation): void;

  onDeleteMemberError(error: PostgrestError): void;

  onDeleteInvitationError(error: PostgrestError): void;
}

export const MembersTable = (props: MembersTableProps) => {
  const { t } = props.i18n;

  const [selected, setSelected] = useState<string[]>([]);

  const isAllSelected = selected.length === props.project.users.length;

  // Shorthands
  const isMe = (user: UserProfile) => user.id === props.me.id;

  const isOwner = (user: UserProfile) =>
    user.id === props.project.created_by?.id;

  const onSelectRow = (user: UserProfile, checked: Checkbox.CheckedState) => {
    if (checked) setSelected((selected) => [...selected, user.id]);
    else
      setSelected((selected) => selected.filter((id) => id !== user.id));
  };

  const onSelectAll = (checked: Checkbox.CheckedState) => {
    if (checked) setSelected(props.project.users.map((m) => m.user.id));
    else setSelected([]);
  };

  return (
    <table className='project-members-table'>
      <thead>
        <tr>
          <th>
            <Checkbox.Root
              className='checkbox-root'
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
            >
              <Checkbox.Indicator>
                <CheckSquare size={20} weight='fill' />
              </Checkbox.Indicator>

              {!isAllSelected && (
                <span>
                  <Square size={20} />
                </span>
              )}
            </Checkbox.Root>
          </th>

          <th>{t['Name']}</th>
          <th>{t['Access Level']}</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {props.project.users.map((member) => (
          <tr key={member.user.id}>
            <td>
              <Checkbox.Root
                className='checkbox-root'
                checked={selected.includes(member.user.id)}
                onCheckedChange={(checked) => onSelectRow(member.user, checked)}
              >
                <Checkbox.Indicator>
                  <CheckSquare size={20} weight='fill' />
                </Checkbox.Indicator>

                {!selected.includes(member.user.id) && (
                  <span>
                    <Square size={20} />
                  </span>
                )}
              </Checkbox.Root>
            </td>

            <td>
              {formatName(member.user) || (
                <span className='anonymous-member'>
                  {t['Anonymous team member']}{' '}
                  <AnonymousTooltip i18n={props.i18n} />
                </span>
              )}
              {isMe(member.user) && <span className='badge'>{t['You']}</span>}
            </td>

            <td>
              {isOwner(member.user) ? (
                <button disabled className='owner'>
                  {t['Owner']}
                </button>
              ) : (
                <GroupSelector
                  i18n={props.i18n}
                  member={member}
                  availableGroups={props.project.groups}
                  onChangeGroup={(from, to) =>
                    props.onChangeGroup(member, from, to)
                  }
                />
              )}
            </td>

            <td className='actions'>
              {!isOwner(member.user) && (
                <DeleteMember
                  i18n={props.i18n}
                  member={member}
                  me={props.me}
                  onDeleteMember={props.onDeleteMember}
                  onDeleteError={props.onDeleteMemberError}
                />
              )}
            </td>
          </tr>
        ))}

        {props.invitations.map((invitation) => (
          <tr key={invitation.id}>
            <td></td>

            <td>{invitation.email}</td>

            <td>
              <span className='invitation-sent'>Invitation sent</span>
            </td>

            <td className='actions'>
              <DeleteInvite
                i18n={props.i18n}
                invitation={invitation}
                onDeleteInvite={props.onDeleteInvite}
                onDeleteError={props.onDeleteInvitationError}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
