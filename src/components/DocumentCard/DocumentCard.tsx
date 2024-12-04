import { buildURL, getHashParameters, getSearchParameters } from '@util/url';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSix } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { DocumentCardActions } from './DocumentCardActions';
import { DocumentCardThumbnail } from './DocumentCardThumbnail';
import { MetadataModal } from './MetadataModal';
import {
  DocumentViewRight,
  type Context,
  type Document,
  type Translations
} from 'src/Types';
import './DocumentCard.css';

interface DocumentCardProps {
  className?: string;

  i18n: Translations;

  isAdmin?: boolean;

  context: Context;

  document: Document;

  onClick?(): void;

  onDelete?(): void;

  onUpdate?(document: Document): void;

  onError?(error: string): void;

  rtab?: DocumentViewRight;

  readOnly?: boolean;
}

export const DocumentCard = (props: DocumentCardProps) => {
  const { context, document } = props;

  const { lang } = props.i18n;

  const [editable, setEditable] = useState(false);

  const sortableProps = useMemo(
    () => ({
      id: document.id,
      disabled: !props.isAdmin,
    }),
    [document, props.isAdmin]
  );

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable(sortableProps);

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition]
  );

  const onOpen = (tab: boolean) => {
    const search = getSearchParameters();

    const hash = getHashParameters();
    hash.set('rtab', props.rtab || DocumentViewRight.closed);

    const url = buildURL(
      `/${lang}/annotate/${context.id}/${document.id}`,
      search,
      hash
    );

    if (tab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  };

  const onClick = (evt: React.MouseEvent) => {
    if (props.onClick) {
      return props.onClick();
    }

    if (props.readOnly) {
      return;
    }

    const isClickOnMenu =
      (evt.target as Element).closest('.dropdown-content') ||
      (evt.target as Element).closest('.dropdown-subcontent');

    if (!isClickOnMenu) onOpen(true);
  };

  const onExportTEI = (includePrivate: boolean) =>
    (window.location.href = props.context.is_project_default
      ? `/${lang}/projects/${props.context.project_id}/export/tei?document=${document.id}&private=${includePrivate}`
      : `/${lang}/projects/${props.context.project_id}/export/tei?document=${document.id}&context=${context.id}&private=${includePrivate}`);

  const onExportPDF = (includePrivate: boolean) =>
    (window.location.href = props.context.is_project_default
      ? `/${lang}/projects/${props.context.project_id}/export/pdf?document=${document.id}&private=${includePrivate}`
      : `/${lang}/projects/${props.context.project_id}/export/pdf?document=${document.id}&context=${context.id}&private=${includePrivate}`);

  const onExportCSV = (includePrivate: boolean) =>
    (window.location.href = props.context.is_project_default
      ? `/${lang}/projects/${props.context.project_id}/export/csv?document=${document.id}&private=${includePrivate}`
      : `/${lang}/projects/${props.context.project_id}/export/csv?document=${document.id}&context=${context.id}&private=${includePrivate}`);

  return (
    <article
      className={classNames('document-card-container', props.className)}
      ref={setNodeRef}
      style={style}
    >
      <div className='document-card' onClick={onClick}>
        {props.isAdmin && (
          <div className='document-drag-handle' {...attributes} {...listeners}>
            <DotsSix />
          </div>
        )}

        <DocumentCardThumbnail document={props.document} />

        <div className='document-card-footer'>
          <div className='document-card-name'>{document.name}</div>
          {!props.readOnly && (
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
          )}
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
