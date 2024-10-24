import { buildURL, getHashParameters, getSearchParameters } from '@util/url';
import { useState } from 'react';
import type { Context, Document, Translations } from 'src/Types';
import { DocumentViewRight } from 'src/Types';

import './DocumentCard.css';
import { DocumentCardActions } from './DocumentCardActions';
import { DocumentCardThumbnail } from './DocumentCardThumbnail';
import { MetadataModal } from './MetadataModal';

interface DocumentCardProps {
  i18n: Translations;

  isAdmin?: boolean;

  context: Context;

  document: Document;

  onDelete?(): void;

  onUpdate?(document: Document): void;

  onError?(error: string): void;

  rtab?: DocumentViewRight;
}

export const DocumentCard = (props: DocumentCardProps) => {
  const { context, document } = props;

  const { lang } = props.i18n;

  const [editable, setEditable] = useState(false);

  const onOpen = (tab: boolean) => {
    const search = getSearchParameters();

    const hash = getHashParameters();
    hash.set('rtab', props.rtab || DocumentViewRight.closed);

    const url = buildURL(`/${lang}/annotate/${context.id}/${document.id}`, search, hash);

    if (tab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  };

  const onClick = (evt: React.MouseEvent) => {
    const isClickOnMenu =
      (evt.target as Element).closest('.dropdown-content') ||
      (evt.target as Element).closest('.dropdown-subcontent');

    if (!isClickOnMenu) onOpen(true);
  };

  const onExportTEI = (includePrivate: boolean) =>
    window.location.href = props.context.is_project_default
      ? `/${lang}/projects/${props.context.project_id}/export/tei?document=${document.id}&private=${includePrivate}`
      : `/${lang}/projects/${props.context.project_id}/export/tei?document=${document.id}&context=${context.id}&private=${includePrivate}`;

  const onExportPDF = (includePrivate: boolean) =>
    window.location.href = props.context.is_project_default
      ? `/${lang}/projects/${props.context.project_id}/export/pdf?document=${document.id}&private=${includePrivate}`
      : `/${lang}/projects/${props.context.project_id}/export/pdf?document=${document.id}&context=${context.id}&private=${includePrivate}`;
    
  const onExportCSV = (includePrivate: boolean) =>
    window.location.href = props.context.is_project_default
      ? `/${lang}/projects/${props.context.project_id}/export/csv?document=${document.id}&private=${includePrivate}`
      : `/${lang}/projects/${props.context.project_id}/export/csv?document=${document.id}&context=${context.id}&private=${includePrivate}`;
  
  return (
    <article className='document-card-container'>
      <div className='document-card' onClick={onClick}>

        <DocumentCardThumbnail document={props.document} />

        <div className='document-card-footer'>
          <div className='document-card-name'>
            {document.name}
          </div>
          <div className='document-card-actions'>
            <DocumentCardActions
              i18n={props.i18n}
              isAdmin={props.isAdmin}
              context={context}
              document={document}
              onOpen={onOpen}
              onDelete={props.onDelete}
              onExportTEI={onExportTEI}
              onExportPDF={onExportPDF}
              onExportCSV={onExportCSV}
              onEditMetadata={() => setEditable(true)}
            />
          </div>
        </div>
      </div>

      <MetadataModal
        open={editable}
        i18n={props.i18n}
        document={document}
        onClose={() => setEditable(false)}
        onUpdated={props.onUpdate!}
        onError={props.onError!}
      />
    </article>
  );
};
