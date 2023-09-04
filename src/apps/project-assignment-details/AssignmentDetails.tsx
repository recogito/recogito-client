import type { Document, ExtendedAssignmentData, Translations } from 'src/Types';
import { DocumentCard } from '@components/DocumentCard';

import './AssignmentDetails.css';

interface AssignmentDetailsProps {

  i18n: Translations;

  assignment: ExtendedAssignmentData;

}

export const AssignmentDetails = (props: AssignmentDetailsProps) => {

  const { assignment } = props;

  const documents: Document[] = assignment.layers.map(layer => layer.document);

  return (
    <div className="project-assignment-details">
      <h1>Assignment Details</h1>
      <h2>{assignment.name}</h2>

      <div className="project-assignment-document-grid">
        {documents.map(document => (
          <DocumentCard 
            readonly
            i18n={props.i18n}
            key={document.id}
            document={document} 
            context={assignment} />
        ))}
      </div>
    </div>
  )

}