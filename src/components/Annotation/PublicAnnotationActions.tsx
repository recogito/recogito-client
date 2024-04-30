import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThree, Pencil, Trash } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

interface PublicAnnotationActionsProps {

  hasReplies: boolean;

  i18n: Translations;

  isFirst: boolean;

  isMine: boolean;

  onDeleteAnnotation(): void;

  onDeleteSection(): void;

  onEditSection(): void;

}

export const PublicAnnotationActions = (props: PublicAnnotationActionsProps) => {

  const { t } = props.i18n;

  const onClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
  }

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button className='comment-actions unstyled icon-only'>
          <DotsThree size={20} weight='bold' />
        </button>
      </Dropdown.Trigger>

      <Dropdown.Portal>
        <Dropdown.Content asChild sideOffset={5} align="start" onClick={onClick}>
          <div className='dropdown-content no-icons'>
            {props.isFirst && (
              <Dropdown.Item
                className='dropdown-item'
                onSelect={props.onDeleteAnnotation}>
                <Trash size={16} /> <span>{t['Delete annotation']}</span>
              </Dropdown.Item>
            )}

            <Dropdown.Item
              className='dropdown-item'
              onSelect={props.onEditSection}>
              <Pencil size={16} /> <span>{t['Edit comment']}</span>
            </Dropdown.Item>

            {props.hasReplies && (
              <Dropdown.Item
                className='dropdown-item'
                onSelect={props.onDeleteSection}>
                <Trash size={16} /> <span>{t['Delete comment']}</span>
              </Dropdown.Item>
            )}
          </div>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  )

}
