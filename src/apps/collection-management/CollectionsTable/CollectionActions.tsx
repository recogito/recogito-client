import { ConfirmedAction } from '@components/ConfirmedAction';
import { DotsThreeVerticalIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import type { Collection, Translations } from 'src/Types';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
const { Content, Item, Portal, Root, Separator, Trigger } = Dropdown;

interface CollectionActionsProps {
  collection: Collection;

  i18n: Translations;

  onDelete(collection?: Collection): void;

  onOpenMetadata(): void;
}

export const CollectionActions = (props: CollectionActionsProps) => {
  const { t } = props.i18n;

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
            aria-label={`${t['Menu actions for collection:']} ${props.collection.name}`}
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
                aria-label={t["edit this collection's name"]}
              >
                <PencilSimpleIcon size={16} />
                <span>{t['Edit collection name']}</span>
              </Item>
            )}

            <Separator className='dropdown-separator' />

            <ConfirmedAction.Trigger>
              <Item
                className='dropdown-item'
                aria-label={t['remove this collection']}
              >
                <TrashIcon size={16} className='destructive' />{' '}
                <span>{t['Delete collection']}</span>
              </Item>
            </ConfirmedAction.Trigger>
          </Content>
        </Portal>
      </Root>

      <ConfirmedAction.Dialog
        i18n={props.i18n}
        title={t['Are you sure?']}
        description={
          t[
            'Are you sure you want to remove the collection? Only collections with documents that are not used by active projects can be removed.'
          ]
        }
        cancelLabel={t['Cancel']}
        confirmLabel={
          <>
            <TrashIcon size={16} /> <span>{t['Delete collection']}</span>
          </>
        }
        onConfirm={onSelectOption(() => props.onDelete(props.collection))}
      />
    </ConfirmedAction.Root>
  );
};
