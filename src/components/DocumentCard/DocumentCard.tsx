import { useState } from 'react';
import type { Context, Document, Translations } from 'src/Types';
import { DocumentCardActions } from './DocumentCardActions';
import { ContentTypeIcon } from './ContentTypeIcon';
import { MetadataModal } from './MetadataModal';

import './DocumentCard.css';

interface DocumentCardProps {

  i18n: Translations;

  isAdmin?: boolean;

  isDefaultContext?: boolean;

  context: Context;

  document: Document;

  onDelete?(): void;

  onUpdate?(document: Document): void;

  onError?(error: string): void;

}

export const DocumentCard = (props: DocumentCardProps) => {

  const { context, document } = props;

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

  const onExportTEI = () =>
    window.location.href =
      props.isDefaultContext ? 
        `/${lang}/projects/${props.context.project_id}/export/tei?document=${document.id}` :
        `/${lang}/projects/${props.context.project_id}/assignments/${context.id}/export/tei?document=${document.id}` 

  const onExportCSV = () =>
    window.location.href = `/${lang}/projects/${props.context.project_id}/export/csv?document=${document.id}`;

  return (
    <article className="document-card-container">
      <div 
        className="document-card" 
        onClick={onClick}>

        <div className="document-card-body">
          <ContentTypeIcon document={document} />
        </div>

        <div className="document-card-footer">
          <DocumentCardActions
            i18n={props.i18n} 
            isAdmin={props.isAdmin}
            context={context}
            document={document}
            onOpen={onOpen}
            onDelete={props.onDelete} 
            onExportTEI={onExportTEI}
            onExportCSV={onExportCSV}
            onEditMetadata={() => setEditable(true)} />
        </div>
      </div>

      <h1>
        <a target="_blank" href={`/${lang}/annotate/${context.id}/${document.id}`}>{document.name}</a>
      </h1>

      <MetadataModal 
        open={editable} 
        i18n={props.i18n} 
        document={document}
        onClose={() => setEditable(false)}
        onUpdated={props.onUpdate!} 
        onError={props.onError!}/>
    </article>
  )

}