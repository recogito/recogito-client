import type { Document, Translations } from 'src/Types';
import { DocumentCardActionsMenu } from './DocumentCardActionsMenu';

import './DocumentCard.css';

interface DocumentCardProps {

  i18n: Translations;

  document: Document;

  onDelete(): void;

}

export const DocumentCard = (props: DocumentCardProps) => {

  const { document } = props;

  return (
    <div className="document-card">
      <h1>{document.name}</h1>

      <DocumentCardActionsMenu 
        i18n={props.i18n} 
        onDelete={props.onDelete} />
    </div>
  )

}