import { useState } from 'react';
import type { Context, Document, Translations } from 'src/Types';
import { DocumentCardActions } from './DocumentCardActions';
import { ContentTypeIcon } from './ContentTypeIcon';
import { MetadataModal } from './MetadataModal';

import './DocumentCard.css';

interface DocumentCardProps {

  i18n: Translations;

  context: Context;

  document: Document;

  readonly?: boolean;

  onDelete?(): void;

  onRename?(name: string): void;

}

export const DocumentCard = (props: DocumentCardProps) => {

  const { context, document, readonly } = props;

  const { lang } = props.i18n;

  const [editable, setEditable] = useState(false);

  const onOpen = (tab: boolean) => {
    if (tab)
      window.open(`/${lang}/annotate/${context.id}/${document.id}`, '_blank');
    else
      window.location.href = `/${lang}/annotate/${context.id}/${document.id}`;
  }
  
  const onClick = (evt: React.MouseEvent) => {
    const isClickOnMenu = (evt.target as Element).closest('.dropdown-content');
    
    if (!isClickOnMenu)
      onOpen(true)
  }

  const onRename = (name: string) => {
    setEditable(false);
    props.onRename!(name);
  }

  return (
    <article className="document-card-container">
      <div 
        className="document-card" 
        onClick={onClick}>

        <div className="document-card-body">
          <ContentTypeIcon document={document} />
        </div>

        <div className="document-card-footer">
          {!readonly && (
            <DocumentCardActions
              i18n={props.i18n} 
              onOpen={onOpen}
              onDelete={props.onDelete} 
              onRename={() => setEditable(true)} />
          )}
        </div>
      </div>

      <h1>
        <a target="_blank" href={`/${lang}/annotate/${context.id}/${document.id}`}>{document.name}</a>
      </h1>

      <MetadataModal 
        open={editable} 
        i18n={props.i18n} 
        document={document}
        onClose={() => setEditable(false)} />
    </article>
  )

}