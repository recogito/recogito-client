import { useState } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import type { PostgrestError } from '@supabase/supabase-js';
import { CheckSquare, Square } from '@phosphor-icons/react';
import { AnonymousTooltip } from '@components/AnonymousTooltip';
import { formatName } from '@components/Avatar';
import { GroupSelector } from '../GroupSelector';
import type { ExtendedProjectData, Invitation, Group, Translations, UserProfile } from 'src/Types';
import type { TeamMember } from '../TeamMember';
import { DeleteMember } from '../DeleteMember';

import './MembersTable.css';

interface MembersTableProps {

  i18n: Translations;

  project: ExtendedProjectData;

  invitations: Invitation[];

  me: UserProfile;

  onChangeGroup(member: TeamMember, from: Group, to: Group): void;

  onDeleteMember(member: TeamMember): void;

  onDeleteMemberError(error: PostgrestError): void;

}

// Helper to flatten the list of groups to the list of users
const getMembers = (groups: Group[]): TeamMember[] => groups
  .reduce((members, group) => (
      [
        ...members, 
        ...group.members.map(({ user, since }) => 
          ({ user, inGroup: group, since }))
      ]
    ), [] as TeamMember[])
  .sort((a, b) => (a.since < b.since) ? -1 : (a.since > b.since) ? 1 : 0);

export const MembersTable = (props: MembersTableProps) => {

  const { t } = props.i18n;

  const [selected, setSelected] = useState<string[]>([]);

  const members = getMembers(props.project.groups);

  const isAllSelected = selected.length === members.length;

  // Shorthands
  const isMe = (member: TeamMember) => 
    member.user.id === props.me.id;

  const isOwner = (member: TeamMember) =>
    member.user.id === props.project.created_by?.id;

  const onSelectRow = (member: TeamMember, checked: Checkbox.CheckedState) => {
    if (checked)
      setSelected(selected => [...selected, member.user.id])
    else 
      setSelected(selected => selected.filter(id => id !== member.user.id));
  }

  const onSelectAll = (checked: Checkbox.CheckedState) => {
    if (checked)
      setSelected(members.map(m => m.user.id));
    else
      setSelected([]);    
  }

  return (
    <table className="project-members-table">
      <thead>
        <tr>
          <th>
            <Checkbox.Root 
              className="checkbox-root"
              checked={isAllSelected}
              onCheckedChange={onSelectAll}>
              
              <Checkbox.Indicator>
                <CheckSquare size={20} weight="fill" /> 
              </Checkbox.Indicator>

              {!isAllSelected && (
                <span><Square size={20} /></span>
              )}
            </Checkbox.Root>
          </th>

          <th>{t['Name']}</th>
          <th>{t['Access Level']}</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {members.map(member => (
          <tr key={member.user.id}>
            <td>
              <Checkbox.Root 
                className="checkbox-root"
                checked={selected.includes(member.user.id)}
                onCheckedChange={checked => onSelectRow(member, checked)}>
                
                <Checkbox.Indicator>
                  <CheckSquare size={20} weight="fill" /> 
                </Checkbox.Indicator>

                {!selected.includes(member.user.id) && (
                  <span><Square size={20} /></span>
                )}
              </Checkbox.Root>
            </td>

            <td>
              {formatName(member.user) || (
                <span className="anonymous-member">
                  {t['Anonymous team member']} <AnonymousTooltip i18n={props.i18n} />
                </span>
              )}
              {isMe(member) && (
                <span className="badge">
                  {t['You']}
                </span>
              )}
            </td>

            <td>{isOwner(member) ? (
              <button 
                disabled
                className="owner">{t['Owner']}</button>
            ) : (
              <GroupSelector 
                i18n={props.i18n}
                member={member} 
                availableGroups={props.project.groups} 
                onChangeGroup={(from, to) => props.onChangeGroup(member, from, to)} />
            )}
            </td>

            <td className="actions">
              {!isOwner(member) && (
                <DeleteMember 
                  i18n={props.i18n}
                  member={member} 
                  me={props.me}
                  onDeleteMember={props.onDeleteMember} 
                  onDeleteError={props.onDeleteMemberError}/>
              )}
            </td>            
          </tr>
        ))}

        {props.invitations.map(invitation => (
          <tr key={invitation.id}>
            <td></td>

            <td>{invitation.email}</td>

            <td>
              <span className="invitation-sent">Invitation sent</span>
            </td>

            <td></td>
          </tr>
        ))}
      </tbody>
    </table>
  )

}