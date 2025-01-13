import { useState } from 'react';
import {
  DotsThreeVertical,
  PencilSimple,
  Trash,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import type { Translations } from 'src/Types';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface DocumentActionsProps {
  allowEditMetadata?: boolean;

  i18n: Translations;

  showPrivate?: boolean;

  isPrivate?: boolean;

  onDelete?(): void;

  onOpenMetadata(): void;

  onTogglePrivate?(): void;
}

export const DocumentActions = (props: DocumentActionsProps) => {
  const { t } = props.i18n;

  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    setConfirming(true);
  };

  const handleDeleteConfirm = () => {
    setConfirming(false);
    props.onDelete!();
  };

  return (
    <>
      <Root>
        <Trigger asChild>
          <button className='unstyled icon-only'>
            <DotsThreeVertical weight='bold' size={20} color='black' />
          </button>
        </Trigger>

        <Portal>
          <Content
            className='dropdown-content no-icons doc-lib-dropdown'
            sideOffset={5}
            align='start'
          >
            {props.allowEditMetadata ? (
              <>
                <Item className='dropdown-item' onSelect={props.onOpenMetadata}>
                  <PencilSimple size={16} />{' '}
                  <span>{t['Edit document metadata']}</span>
                </Item>
                {props.showPrivate && (
                  <Item
                    className='dropdown-item'
                    onSelect={
                      props.onTogglePrivate ? props.onTogglePrivate : () => {}
                    }
                  >
                    {props.isPrivate ? (
                      <Eye size={16} />
                    ) : (
                      <EyeSlash size={16} />
                    )}{' '}
                    <span>
                      {props.isPrivate ? t['Make Public'] : t['Make Private']}
                    </span>
                  </Item>
                )}
                {props.isPrivate && (
                  <Item className='dropdown-item' onSelect={handleDelete}>
                    <Trash size={16} className='destructive' />{' '}
                    <span>{t['Delete document']}</span>
                  </Item>
                )}
              </>
            ) : (
              <>
                <Item className='dropdown-item' onSelect={props.onOpenMetadata}>
                  <PencilSimple size={16} />{' '}
                  <span>{t['View document metadata']}</span>
                </Item>
                {props.showPrivate && (
                  <Item
                    className='dropdown-item'
                    onSelect={props.onTogglePrivate}
                  >
                    {props.isPrivate ? (
                      <Eye size={16} />
                    ) : (
                      <EyeSlash size={16} />
                    )}{' '}
                    <span>
                      {props.isPrivate ? t['Make Public'] : t['Make Private']}
                    </span>
                  </Item>
                )}
              </>
            )}
          </Content>
        </Portal>
      </Root>

      <ConfirmDeleteDialog
        open={confirming}
        i18n={props.i18n}
        title={t['Are you sure?']}
        description={
          t[
            'Are you sure you want to remove the document from the document library? Only documents that are not used by active projects can be removed.'
          ]
        }
        cancelLabel={t['Cancel']}
        confirmLabel={
          <>
            <Trash size={16} /> <span>{t['Delete document']}</span>
          </>
        }
        onConfirm={handleDeleteConfirm}
        onClose={() => setConfirming(false)}
      />
    </>
  );
};
