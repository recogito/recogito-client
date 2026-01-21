import { MetadataModal } from '@components/MetadataModal';
import { buildURL, getHashParameters, getSearchParameters } from '@util/url';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSix } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import { DocumentCardActions } from './DocumentCardActions';
import { DocumentCardThumbnail } from './DocumentCardThumbnail';
import { DocumentViewRight, type Context, type Document } from 'src/Types';
import './DocumentCard.css';
import { useTranslation } from 'react-i18next';
import type { LibraryDocument } from '@components/DocumentLibrary';

type DocumentCardViewProps =
  | { view: 'project'; context: Context }
  | { view: 'context'; context: Context }
  | { view: 'library'; context?: never };

type DocumentCardProps = DocumentCardViewProps & {
  className?: string;

  isAdmin?: boolean;

  isOwner?: boolean;

  document: Document | LibraryDocument;

  onClick?(): void;

  onDelete?(): void;

  onUpdate?(document: Document): void;

  onError?(error: string): void;

  rtab?: DocumentViewRight;

  readOnly?: boolean;
};

export const DocumentCard = (props: DocumentCardProps) => {
  const { context, document, view } = props;

  const { t, i18n } = useTranslation(['a11y']);

  const [openMetadata, setOpenMetadata] = useState(false);

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

  const onOpen = useCallback(
    (tab: boolean) => {
      if (view === 'library') return;

      const search = getSearchParameters();

      const hash = getHashParameters();
      hash.set('rtab', props.rtab || DocumentViewRight.closed);

      const url = buildURL(
        `/${i18n.language}/annotate/${context.id}/${document.id}`,
        search,
        hash
      );

      if (tab) {
        window.open(url, '_blank');
      } else {
        window.location.href = url;
      }
    },
    [view, context, document.id, i18n.language, props.rtab]
  );

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

  const onExport = useCallback(
    (format: string) => (includePrivate: boolean) => {
      if (view === 'library') return;

      const baseUrl = `/${i18n.language}/projects/${context.project_id}/export/${format}`;
      const params = new URLSearchParams({
        document: document.id,
        private: String(includePrivate),
      });

      if (view === 'context') {
        params.append('context', context.id);
      }

      window.location.href = `${baseUrl}?${params.toString()}`;
    },
    [view, context, document.id, i18n.language]
  );

  return (
    <article
      className={classNames('document-card-container', props.className)}
      ref={setNodeRef}
      style={style}
      tabIndex={0}
      aria-label={
        props.document.name.trim() || t('No title', { ns: 'project-home' })
      }
    >
      <div className='document-card' onClick={onClick}>
        {props.isAdmin && (
          <div
            className='document-drag-handle'
            {...attributes}
            {...listeners}
            aria-label={t('rearrange this document by dragging', {
              ns: 'a11y',
            })}
          >
            <DotsSix />
          </div>
        )}

        <DocumentCardThumbnail document={props.document} />

        <div className='document-card-footer'>
          <div className='document-card-name'>
            {document.name.trim() || t('No title', { ns: 'project-home' })}
          </div>
          {!props.readOnly && (
            <div className='document-card-actions'>
              <DocumentCardActions
                allowDeleteDocument={props.isAdmin}
                allowEditMetadata={props.isOwner}
                context={context}
                document={document}
                onOpen={onOpen}
                onDelete={props.onDelete}
                onOpenMetadata={() => setOpenMetadata(true)}
                {...(view !== 'library'
                  ? {
                      onExportTEI: onExport('tei'),
                      onExportPDF: onExport('pdf'),
                      onExportCSV: onExport('csv'),
                      onExportW3C: onExport('w3c'),
                      onExportManifest: onExport('manifest'),
                    }
                  : {})}
              />
            </div>
          )}
        </div>
      </div>
      <MetadataModal
        open={openMetadata}
        document={document}
        onClose={() => setOpenMetadata(false)}
        onUpdated={props.onUpdate!}
        onError={props.onError!}
        readOnly={!props.isOwner}
      />
    </article>
  );
};
