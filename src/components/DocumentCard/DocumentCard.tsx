import type { Context, Document, Translations } from 'src/Types';
import { DocumentCardActionsMenu } from './DocumentCardActionsMenu';

import './DocumentCard.css';

interface DocumentCardProps {

  i18n: Translations;

  context: Context;

  document: Document;

  onDelete(): void;

}

export const DocumentCard = (props: DocumentCardProps) => {

  const { context, document } = props;

  const { lang } = props.i18n;

  return (
    <div className="document-card">
      <h1><a href={`/${lang}/annotate/${context.id}/${document.id}`}>{document.name}</a></h1>

      <DocumentCardActionsMenu 
        i18n={props.i18n} 
        onDelete={props.onDelete} />
    </div>
  )

}