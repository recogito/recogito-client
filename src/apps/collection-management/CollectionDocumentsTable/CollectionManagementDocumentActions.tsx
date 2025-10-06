import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { ConfirmedAction } from '@components/ConfirmedAction';
import type { Document, Translations } from 'src/Types';
import {
  DotsThreeVertical,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react';

const { Content, Item, Portal, Root, Separator, Trigger } = Dropdown;

interface CollectionManagementDocumentActionsProps {
  i18n: Translations;

  document: Document;

  onDelete?(): void;

  onOpenMetadata?(): void;
}

export const CollectionManagementDocumentActions = (props: CollectionManagementDocumentActionsProps) => {

  const { t } = props.i18n;

  const [menuOpen, setMenuOpen] = useState(false);

  const [confirming, setConfirming] = useState(false);

  const onSelectOption = (fn?: () => void) => () => {
    fn?.();
    setMenuOpen(false);
  }

  return (
    <ConfirmedAction.Root open={confirming} onOpenChange={setConfirming}>
      <Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Trigger asChild>
          <button
            className='unstyled icon-only'
            aria-label={`${t['Menu actions for document:']} ${props.document.name}`}
          >
            <DotsThreeVertical weight='bold' size={22} />
          </button>
        </Trigger>

        <Portal>
          <Content
            className='dropdown-content no-icons'
            sideOffset={5}
            align='start'
          >
            {props.onOpenMetadata && (
              <Item
                className='dropdown-item'
                onSelect={onSelectOption(props.onOpenMetadata)}
                aria-label={t["view this document's metadata"]}
              >
                <PencilSimple size={16} />
                <span>
                  {t['Edit document metadata']}
                </span>
              </Item>
            )}
      
            <Separator className="dropdown-separator" />

            <ConfirmedAction.Trigger>
              <Item
                className='dropdown-item'
                aria-label={t['remove this document from the collection']}
              >
                <Trash size={16} className='destructive' />{' '}
                <span>{t['Delete document']}</span>
              </Item>
            </ConfirmedAction.Trigger>
          </Content>
        </Portal>
      </Root>

      <ConfirmedAction.Dialog
        i18n={props.i18n}
        title={t['Are you sure?']}
        description={t['Are you sure you want to delete this document?']}
        cancelLabel={t['Cancel']}
        confirmLabel={
          <>
            <Trash size={16} /> <span>{t['Delete document']}</span>
          </>
        }
        onConfirm={onSelectOption(props.onDelete)}
      />
    </ConfirmedAction.Root>
  );
};
