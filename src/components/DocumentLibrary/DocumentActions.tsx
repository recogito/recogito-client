import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { ConfirmedAction } from '@components/ConfirmedAction';
import type { Translations } from 'src/Types';
import {
  DotsThreeVertical,
  PencilSimple,
  Trash,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface DocumentActionsProps {
  i18n: Translations;

  isAdmin?: boolean;

  showPrivate?: boolean;

  isPrivate?: boolean;

  onDelete?(): void;

  onEditMetadata?(): void;

  onViewMetadata?(): void;

  onTogglePrivate?(): void;
}

export const DocumentActions = (props: DocumentActionsProps) => {
  const { t } = props.i18n;

  const [confirming, setConfirming] = useState(false);

  return (
    <ConfirmedAction.Root open={confirming} onOpenChange={setConfirming}>
      <Root>
        <Trigger asChild>
          <button className='unstyled icon-only'>
            <DotsThreeVertical weight='bold' size={20} />
          </button>
        </Trigger>

        <Portal>
          <Content
            className='dropdown-content no-icons'
            sideOffset={5}
            align='start'
          >
            {props.isAdmin ? (
              <>
                <Item className='dropdown-item' onSelect={props.onEditMetadata}>
                  <PencilSimple size={16} />{' '}
                  <span>{t['Edit document metadata']}</span>
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
                <ConfirmedAction.Trigger>
                  <Item className='dropdown-item'>
                    <Trash size={16} className='destructive' />{' '}
                    <span>{t['Delete document']}</span>
                  </Item>
                </ConfirmedAction.Trigger>
              </>
            ) : (
              <>
                <Item className='dropdown-item' onSelect={props.onViewMetadata}>
                  <PencilSimple size={16} />{' '}
                  <span>{t['View Document Metadata']}</span>
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
        onConfirm={props.onDelete!}
      />
    </ConfirmedAction.Root>
  );
};
