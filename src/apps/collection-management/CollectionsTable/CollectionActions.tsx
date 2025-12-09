import { ConfirmedAction } from '@components/ConfirmedAction';
import { DotsThreeVerticalIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import type { Collection } from 'src/Types';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useTranslation } from 'react-i18next';
const { Content, Item, Portal, Root, Separator, Trigger } = Dropdown;

interface CollectionActionsProps {
  collection: Collection;

  onDelete(collection?: Collection): void;

  onOpenMetadata(): void;
}

export const CollectionActions = (props: CollectionActionsProps) => {
  const { t } = useTranslation(['collection-management', 'common']);

  const [menuOpen, setMenuOpen] = useState(false);

  const [confirming, setConfirming] = useState(false);

  const onSelectOption = (fn?: () => void) => () => {
    fn?.();
    setMenuOpen(false);
  };

  return (
    <ConfirmedAction.Root open={confirming} onOpenChange={setConfirming}>
      <Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Trigger asChild>
          <button
            className='unstyled icon-only'
            aria-label={`${t('Menu actions for collection:', { ns: 'collection-management' })} ${props.collection.name}`}
          >
            <DotsThreeVerticalIcon weight='bold' size={22} />
          </button>
        </Trigger>

        <Portal>
          <Content
            className='dropdown-content no-icons'
            sideOffset={5}
            align='end'
          >
            {props.onOpenMetadata && (
              <Item
                className='dropdown-item'
                onSelect={onSelectOption(props.onOpenMetadata)}
                aria-label={t("edit this collection's name", { ns: 'collection-management' })}
              >
                <PencilSimpleIcon size={16} />
                <span>{t('Edit collection name', { ns: 'collection-management' })}</span>
              </Item>
            )}

            <Separator className='dropdown-separator' />

            <ConfirmedAction.Trigger>
              <Item
                className='dropdown-item'
                aria-label={t('remove this collection', { ns: 'collection-management' })}
              >
                <TrashIcon size={16} className='destructive' />{' '}
                <span>{t('Delete collection', { ns: 'collection-management' })}</span>
              </Item>
            </ConfirmedAction.Trigger>
          </Content>
        </Portal>
      </Root>

      <ConfirmedAction.Dialog
        title={t('Are you sure?', { ns: 'common' })}
        description={
          t('Are you sure you want to remove the collection? Only collections with documents that are not used by active projects can be removed.', { ns: 'collection-management' })
        }
        cancelLabel={t('Cancel', { ns: 'common' })}
        confirmLabel={
          <>
            <TrashIcon size={16} /> <span>{t('Delete collection', { ns: 'collection-management' })}</span>
          </>
        }
        onConfirm={onSelectOption(() => props.onDelete(props.collection))}
      />
    </ConfirmedAction.Root>
  );
};
