import { useState, Fragment } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { ConfirmedAction } from '@components/ConfirmedAction';
import {
  DotsThreeVertical,
  CheckSquare,
  Square,
  CheckCircle,
  PencilSimple,
} from '@phosphor-icons/react';
import type { LibraryDocument } from './DocumentLibrary';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useTranslation } from 'react-i18next';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface CollectionDocumentActionsProps {
  disabledIds: string[];
  selectedIds: string[];
  revisions: LibraryDocument[];
  onOpenMetadata(): void;
  onSelectVersion(id: string): void;
}

export const CollectionDocumentActions = (
  props: CollectionDocumentActionsProps
) => {
  const { t } = useTranslation(['project-home']);

  const [confirming, setConfirming] = useState(false);

  return (
    <ConfirmedAction.Root open={confirming} onOpenChange={setConfirming}>
      <Root>
        <Tooltip.Provider>
          <Tooltip.Root>
            <Trigger asChild>
              <Tooltip.Trigger asChild>
                <button className='unstyled icon-only'>
                  <DotsThreeVertical weight='bold' size={20} />
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
            {props.revisions.map((r: LibraryDocument, idx: number) => (
              <Fragment key={idx}>
                {props.disabledIds.includes(r.id) && (
                  <Item className='dropdown-item' key={idx}>
                    <CheckCircle size={24} />{' '}
                    <span>{`${t('Revision', { ns: 'project-home' })}: ${r.collection_metadata?.revision_number}, ${t('Published Date', { ns: 'project-home' })}: ${r.published_date}`}</span>
                  </Item>
                )}
                {!props.disabledIds.includes(r.id) && (
                  <Item
                    className='dropdown-item'
                    onSelect={() => props.onSelectVersion(r.id)}
                    key={idx}
                  >
                    {props.selectedIds?.includes(r.id) ? (
                      <CheckSquare color='blue' size={24} weight='fill' />
                    ) : (
                      <Square size={24} />
                    )}{' '}
                    <span>{`${t('Revision', { ns: 'project-home' })}: ${r.collection_metadata?.revision_number}, ${t('Published Date', { ns: 'project-home' })}: ${r.published_date}`}</span>
                  </Item>
                )}
                <Item className='dropdown-item' onSelect={props.onOpenMetadata}>
                  <PencilSimple size={16} />{' '}
                  <span>{t('View document metadata', { ns: 'project-home' })}</span>
                </Item>
              </Fragment>
            ))}
          </Content>
        </Portal>
      </Root>
    </ConfirmedAction.Root>
  );
};
