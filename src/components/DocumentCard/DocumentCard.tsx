import { ImageSquare } from '@phosphor-icons/react';
import type { Context, Document, Translations } from 'src/Types';
import { DocumentCardActionsMenu } from './DocumentCardActionsMenu';

import './DocumentCard.css';

interface DocumentCardProps {

  i18n: Translations;

  context: Context;

  document: Document;

  onDelete(): void;

  onRename(): void;

}

export const DocumentCard = (props: DocumentCardProps) => {

  const { context, document } = props;

  const { lang } = props.i18n;

  return (
    <article className="document-card-container">
      <div className="document-card">
        <div className="document-card-body">
          <ImageSquare size={60} weight="thin" />
        </div>

        <div className="document-card-footer">
          <DocumentCardActionsMenu 
            i18n={props.i18n} 
            onDelete={props.onDelete} 
            onRename={props.onRename} />
        </div>
      </div>

      <h1>
        <a target="_blank" href={`/${lang}/annotate/${context.id}/${document.id}`}>{document.name}</a>
      </h1>
    </article>
  )

}