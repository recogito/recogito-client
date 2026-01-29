import { useState, Fragment, useCallback } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { ConfirmedAction } from '@components/ConfirmedAction';
import {
  DotsThreeVerticalIcon,
  CheckSquareIcon,
  SquareIcon,
  CheckCircleIcon,
  PencilSimpleIcon,
} from '@phosphor-icons/react';
import type { LibraryDocument } from './DocumentLibrary';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useTranslation } from 'react-i18next';
import { supabase } from '@backend/supabaseBrowserClient';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface CollectionDocumentActionsProps {
  disabledIds: string[];
  selectedIds: string[];
  document: LibraryDocument;
  onOpenMetadata(): void;
  onSelectVersion(id: string): void;
}

export const CollectionDocumentActions = (
  props: CollectionDocumentActionsProps
) => {
  const { t } = useTranslation(['project-home']);

  const [confirming, setConfirming] = useState(false);
  const [revisions, setRevisions] = useState<LibraryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const publishedDate = useCallback((revision: LibraryDocument) => {
    return new Date(revision.created_at as string).toLocaleDateString();
  }, []);

  const fetchRevisions = useCallback(
    async (open: boolean) => {
      if (
        !open ||
        revisions.length > 0 ||
        !props.document.collection_document_id
      ) {
        return;
      }

      setIsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select(
          `
          id,
          name,
          collection_document_id,
          collection_metadata,
          content_type,
          created_at,
          is_private,
          revision_number,
          meta_data
          `
        )
        .eq('collection_document_id', props.document.collection_document_id)
        .eq('collection_id', props.document.collection_id)
        .eq('is_archived', false)
        .order('revision_number', { ascending: false });

      if (!error && data) {
        setRevisions(data);
      }
      setIsLoading(false);
    },
    [revisions.length, props.document.collection_document_id]
  );

  return (
    <ConfirmedAction.Root open={confirming} onOpenChange={setConfirming}>
      <Root onOpenChange={fetchRevisions}>
        <Tooltip.Provider>
          <Tooltip.Root>
            <Trigger asChild>
              <Tooltip.Trigger asChild>
                <button className='unstyled icon-only'>
                  <DotsThreeVerticalIcon weight='bold' size={20} />
                </button>
              </Tooltip.Trigger>
            </Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className='tooltip-content' sideOffset={5}>
                {t('Select Revision', { ns: 'project-home' })}
                <Tooltip.Arrow className='tooltip-arrow' />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>

        <Portal>
          <Content
            className='dropdown-content no-icons'
            sideOffset={5}
            align='start'
          >
            {isLoading ? (
              <Item className='dropdown-item' disabled>
                <span>{t('Loading revisions...', { ns: 'project-home' })}</span>
              </Item>
            ) : (
              revisions.map((r: LibraryDocument, idx: number) => (
                <Fragment key={idx}>
                  {props.disabledIds.includes(r.id) && (
                    <Item className='dropdown-item' key={idx}>
                      <CheckCircleIcon size={24} />{' '}
                      <span>{`${t('Revision', { ns: 'project-home' })}: ${r.revision_number || 1}, ${t('Published Date', { ns: 'project-home' })}: ${publishedDate(r)}`}</span>
                    </Item>
                  )}
                  {!props.disabledIds.includes(r.id) && (
                    <Item
                      className='dropdown-item'
                      onSelect={() => props.onSelectVersion(r.id)}
                      key={idx}
                    >
                      {props.selectedIds?.includes(r.id) ? (
                        <CheckSquareIcon color='blue' size={24} weight='fill' />
                      ) : (
                        <SquareIcon size={24} />
                      )}{' '}
                      <span>{`${t('Revision', { ns: 'project-home' })}: ${r.revision_number || 1}, ${t('Published Date', { ns: 'project-home' })}: ${publishedDate(r)}`}</span>
                    </Item>
                  )}
                  <Item
                    className='dropdown-item'
                    onSelect={props.onOpenMetadata}
                  >
                    <PencilSimpleIcon size={16} />{' '}
                    <span>
                      {t('View document metadata', { ns: 'project-home' })}
                    </span>
                  </Item>
                </Fragment>
              ))
            )}
          </Content>
        </Portal>
      </Root>
    </ConfirmedAction.Root>
  );
};
