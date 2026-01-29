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
import { useTranslation } from 'react-i18next';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface DocumentActionsProps {
  allowEditMetadata?: boolean;

  showPrivate?: boolean;

  isPrivate?: boolean;

  onDelete?(): void;

  onOpenMetadata(): void;

  onTogglePrivate?(): void;
}

export const DocumentActions = (props: DocumentActionsProps) => {
  const { t } = useTranslation(['project-home', 'common']);

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
                  <span>{t('Edit document metadata', { ns: 'project-home' })}</span>
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
                      {props.isPrivate ? t('Make Public', { ns: 'project-home' }) : t('Make Private', { ns: 'project-home' })}
                    </span>
                  </Item>
                )}
                {props.isPrivate && (
                  <Item className='dropdown-item' onSelect={handleDelete}>
                    <Trash size={16} className='destructive' />{' '}
                    <span>{t('Delete document', { ns: 'common' })}</span>
                  </Item>
                )}
              </>
            ) : (
              <>
                <Item className='dropdown-item' onSelect={props.onOpenMetadata}>
                  <PencilSimple size={16} />{' '}
                  <span>{t('View document metadata', { ns: 'project-home' })}</span>
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
                      {props.isPrivate ? t('Make Public', { ns: 'project-home' }) : t('Make Private', { ns: 'project-home' })}
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
        title={t('Are you sure?', { ns: 'common' })}
        description={
          t('Are you sure you want to remove the document from the document library? Only documents that are not used by active projects can be removed.', { ns: 'project-home' })
        }
        cancelLabel={t('Cancel', { ns: 'common' })}
        confirmLabel={
          <>
            <Trash size={16} /> <span>{t('Delete document', { ns: 'common' })}</span>
          </>
        }
        onConfirm={handleDeleteConfirm}
        onClose={() => setConfirming(false)}
      />
    </>
  );
};
