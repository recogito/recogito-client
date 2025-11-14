import { DownloadSimple } from '@phosphor-icons/react';
import { Avatar, formatName } from '@components/Avatar';
import { DocumentCard } from '@components/DocumentCard';
import type { Document, ExtendedAssignmentData } from 'src/Types';
import { useTranslation } from 'react-i18next';

import './AssignmentDetails.css';

interface AssignmentDetailsProps {

  assignment: ExtendedAssignmentData;

}

export const AssignmentDetails = (props: AssignmentDetailsProps) => {

  const { t, i18n } = useTranslation(['project-assignments']);

  const { assignment } = props;

  const documents: Document[] = assignment.layers.map(layer => layer.document);

  return (
    <div className="project-assignment-details">
      <h1>Assignment Details</h1>
      <h2>{assignment.name}</h2>

      <p className="project-assignment-description">{assignment.description}</p>

      <div className="project-assignment-team">
        <ul>
          {assignment.team.map(member => (
            <li key={member.user.id} >
              <Avatar
                id={member.user.id}
                name={formatName(member.user)}
                avatar={member.user.avatar_url} />
            </li>
          ))}
        </ul>
      </div>

      <div className="project-assignment-export">
        <a
          href={`/${i18n.language}/projects/${assignment.project_id}/assignments/${assignment.id}/export/csv`}
          className='button'
        >
          <DownloadSimple size={20} />
          <span>{t('Export annotations as CSV', { ns: 'project-assignments' })}</span>
        </a>
      </div>

      <div className="project-assignment-document-grid">
        {documents.map(document => (
          <DocumentCard
            key={document.id}
            document={document}
            context={assignment} />
        ))}
      </div>
    </div>
  )

}