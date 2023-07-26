import { Trash } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import { TinySaveIndicator } from '@components/TinySaveIndicator';
import { GroupSelector } from './GroupSelector';
import type { Invitation, ProjectGroup, Translations } from 'src/Types';
import type { TeamMember } from '../TeamMember';

import './MembersTable.css';

interface MembersTableProps {

  i18n: Translations;

  groups: ProjectGroup[];

  invitations: Invitation[];

  onChangeGroup(member: TeamMember, group: ProjectGroup): void;

  onDeleteMember(member: TeamMember): void;

}

export const MembersTable = (props: MembersTableProps) => {

  // Unfold the groups list to a flat list of users, sorted
  // by their time of becoming a member
  const members = props.groups.reduce((members, group) =>
    ([...members, ...group.members.map(({ user, since }) => ({ user, inGroup: group, since }))])
  , [] as TeamMember[]);

  const formatName = (member: TeamMember) => {
    const { nickname, first_name, last_name } = member.user;
    if (nickname)
      return nickname;
    
    if (first_name || last_name)
      return `${first_name} ${last_name}`.trim();

    return ''; // TODO what to do for fallback?
  }

  return (
    <table className="project-members-table">
      <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Access Level</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {members.map(member => (
          <tr key={member.user.id}>
            <td></td>

            <td>{formatName(member)}</td>

            <td>
              <GroupSelector 
                i18n={props.i18n}
                member={member} 
                availableGroups={props.groups} 
                onChangeGroup={group => props.onChangeGroup(member, group)} />

              <TinySaveIndicator />
            </td>

            <td className="actions">
              <Button
                onClick={() => props.onDeleteMember(member)}
                className="unstyled icon-only">
                <Trash size={16} />
              </Button>
            </td>            
          </tr>
        ))}

        {props.invitations.map(invitation => (
          <tr key={invitation.id}>
            <td></td>

            <td>{invitation.email}</td>

            <td>Invitation sent</td>

            <td></td>
          </tr>
        ))}
      </tbody>

      {/*

      {data?.map((user) => (
        <ProjectUserRow
          key={user.profiles.id}
          i18n={props.i18n}
          user={user}
          typeId={user.type_id}
          onRemoveUser={() => handleOpenRemoveModal(user.profiles.id, (user.profiles.first_name || user.profiles.last_name) ? (user.profiles.first_name ? `${user.profiles.first_name} ` : '') + user.profiles.last_name : user.profiles.nickname, user.type_id)}
          onUpdateUser={(NewTypeId: string) => handleUpdateUser(user.profiles.id, user.type_id, NewTypeId)}
          onSelectRow={() => handleToggleSelected(user.profiles.id)}
          selected={selected.includes(user.profiles.id)}
          roleName={projectGroups.find((i) => i.id == user.type_id).name}
          onOpenEditModal={() => handleOpenEditModal(user.profiles.id, (user.profiles.first_name || user.profiles.last_name) ? (user.profiles.first_name ? `${user.profiles.first_name} ` : '') + user.profiles.last_name : user.profiles.nickname, user.type_id)}
        />
      ))}
      {pendingList?.map((user) => (
        <ProjectUserRow
          key={user.profiles.id}
          i18n={props.i18n}
          user={user}
          typeId={user.type_id}
          roleName={projectGroups.find((i) => i.id == user.type_id).name}
          pending
        />
      ))}
    </div>
      */}
    </table>
  )

}