import { useState } from 'react';
import { ImageSquare } from '@phosphor-icons/react';
import type { Context, Document, Translations } from 'src/Types';
import { EditableText } from '@components/EditableText';
import { DocumentCardActionsMenu } from './DocumentCardActionsMenu';

import './DocumentCard.css';

interface DocumentCardProps {

  i18n: Translations;

  context: Context;

  document: Document;

  onDelete(): void;

  onRename(name: string): void;

}

export const DocumentCard = (props: DocumentCardProps) => {

  const { context, document } = props;

  const { lang } = props.i18n;

  const [editable, setEditable] = useState(false);

  const onRename = (name: string) => {
    setEditable(false);
    props.onRename(name);
  }

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
            onRename={() => setEditable(true)} />
        </div>
      </div>

      <h1>
        {editable ? (
          <EditableText 
            focus
            value={document.name} 
            onSubmit={onRename} />
        ) : (
          <a target="_blank" href={`/${lang}/annotate/${context.id}/${document.id}`}>{document.name}</a>
        )}
      </h1>
    </article>
  )

}