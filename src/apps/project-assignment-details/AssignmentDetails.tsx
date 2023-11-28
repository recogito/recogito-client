import { useMemo } from 'react';
import { DownloadSimple } from '@phosphor-icons/react';
import { Avatar, formatName } from '@components/Avatar';
import { DocumentCard } from '@components/DocumentCard';
import type { Document, ExtendedAssignmentData, Translations, UserProfile } from 'src/Types';

import './AssignmentDetails.css';

interface AssignmentDetailsProps {

  i18n: Translations;

  assignment: ExtendedAssignmentData;

}

/**
 * According to the backend data model, each document in the assignment
 * has one layer. Each layer has multiple groups (in our current setup: an 
 * Admin and a Student group), and each group multiple members.
 * 
 * In practice, the Assignment wizard will assign the same student team
 * to each document = layer group. This means we the same members in 
 * each Admin/Student group.
 * 
 * The below code aggregates (and de-duplicates the assignment layer group
 * members to a 'team' map 'Group Name' -> users).
 */
const getAssigmentTeam = (assignment: ExtendedAssignmentData) => {
  const team = new Map<string, UserProfile[]>();

  assignment.layers.forEach(layer => {
    layer.groups.forEach(group => {
      const existing = (team.get(group.name) || []);

      const toAdd = group.members.map(m => m.user)
        .filter(u => !existing.find(e => e.id === u.id));

      if (toAdd.length > 0)
        team.set(group.name, [...existing, ...toAdd]);        
    })
  });

  return team;
}

export const AssignmentDetails = (props: AssignmentDetailsProps) => {

  const { assignment } = props;

  const teams = useMemo(() => getAssigmentTeam(assignment), []);

  const members = Array.from(teams.keys()).reduce((members, role) => ([
    ...members,
    ...teams.get(role)!
  ]), [] as UserProfile[]);
  
  const documents: Document[] = assignment.layers.map(layer => layer.document);

  return (
    <div className="project-assignment-details">
      <h1>Assignment Details</h1>
      <h2>{assignment.name}</h2>

      <p className="project-assignment-description">{assignment.description}</p>

      <div className="project-assignment-team">
        <ul>
          {members.map(user => (
            <li key={user.id} >
              <Avatar 
                id={user.id} 
                name={formatName(user)}
                avatar={user.avatar_url} />
            </li>
          ))}
        </ul>
      </div>

      <div className="project-assignment-export">
      <a
        href={`/${props.i18n.lang}/projects/${assignment.project_id}/assignments/${assignment.id}/export/csv`}
        className='button'
      >
        <DownloadSimple size={20} />
        <span>{props.i18n.t['Export annotations as CSV']}</span>
      </a>
      </div>

      <div className="project-assignment-document-grid">
        {documents.map(document => (
          <DocumentCard
            i18n={props.i18n}
            key={document.id}
            document={document} 
            context={assignment} />
        ))}
      </div>
    </div>
  )

}