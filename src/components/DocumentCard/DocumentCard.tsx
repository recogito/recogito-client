import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DotsSixIcon } from '@phosphor-icons/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import type { LibraryDocument } from '@components/DocumentLibrary';
import { MetadataModal } from '@components/MetadataModal';
import { buildURL, getHashParameters, getSearchParameters } from '@util/url';
import { DocumentCardActions } from './DocumentCardActions';
import { DocumentCardThumbnail } from './DocumentCardThumbnail';
import { DocumentViewRight, type Context, type Document } from 'src/Types';
import { 
  fillTemplateString, 
  matchesContentTypeList, 
  useExtensions, 
  type ProjectDocumentDefaultViewExtension 
} from '@recogito/studio-sdk';

import './DocumentCard.css';

type DocumentCardViewProps =
  | { view: 'project'; context: Context }
  | { view: 'context'; context: Context }
  | { view: 'library'; context?: never };

type DocumentCardProps = DocumentCardViewProps & {
  className?: string;

  isAdmin?: boolean;

  disableDrag?: boolean;

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
      disabled: !props.isAdmin || props.disableDrag,
    }),
    [document, props.isAdmin, props.disableDrag]
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

  const extensions = useExtensions('project:document-default-view');

  const onOpen = useCallback(
    (tab: boolean) => {
      if (view === 'library') return;

      const defaultViewExt = extensions.find(({ config }) => 
        config.settings.provides_default_route)?.extension as ProjectDocumentDefaultViewExtension | undefined;

      const isAllowed = !defaultViewExt?.allowed 
        || matchesContentTypeList(document.content_type, defaultViewExt.allowed!)
      
      const route = defaultViewExt && isAllowed ? 
        fillTemplateString(defaultViewExt.route_template, {
          lang: i18n.language,
          contextId: context.id,
          documentId: document.id
        }) : `/${i18n.language}/annotate/${context.id}/${document.id}`;

      const search = getSearchParameters();

      const hash = getHashParameters();
      hash.set('rtab', props.rtab || DocumentViewRight.closed);

      const url = buildURL(route, search, hash);

      if (tab) {
        window.open(url, '_blank');
      } else {
        window.location.href = url;
      }
    },
    [view, context, document.id, document.content_type, i18n.language, props.rtab, extensions]
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
            className={classNames('document-drag-handle', {
              disabled: props.disableDrag,
            })}
            {...attributes}
            {...listeners}
            // Don't open the document when clicking a disabled handle
            onClick={(evt) => props.disableDrag && evt.stopPropagation()}
            aria-label={t('rearrange this document by dragging', {
              ns: 'a11y',
            })}
            title={
              props.disableDrag
                ? t('Switch to custom order to rearrange documents', {
                    ns: 'project-home',
                  })
                : undefined
            }
          >
            <DotsSixIcon />
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
