import { GroupSelector } from './GroupSelector';
import type { PostgrestError } from '@supabase/supabase-js';
import type { Invitation, ProjectGroup, Translations } from 'src/Types';
import type { TeamMember } from '../TeamMember';
import { DeleteMember } from './DeleteMember';

import './MembersTable.css';

// Helper to flatten the list of groups to the list of users
// TODO sort by 'member since'
const getMembers = (groups: ProjectGroup[]): TeamMember[] => 
  groups.reduce((members, group) => (
    [
      ...members, 
      ...group.members.map(({ user, since }) => 
        ({ user, inGroup: group, since }))
    ]
  ), [] as TeamMember[]);

interface MembersTableProps {

  i18n: Translations;

  groups: ProjectGroup[];

  invitations: Invitation[];

  onChangeGroup(member: TeamMember, from: ProjectGroup, to: ProjectGroup): void;

  onDeleteMember(member: TeamMember): void;

  onDeleteMemberError(error: PostgrestError): void;

}

export const MembersTable = (props: MembersTableProps) => {

  const members = getMembers(props.groups);

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
                onChangeGroup={(from, to) => props.onChangeGroup(member, from, to)} />
            </td>

            <td className="actions">
              <DeleteMember 
                member={member} 
                onDeleteMember={props.onDeleteMember} 
                onDeleteError={props.onDeleteMemberError}/>
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