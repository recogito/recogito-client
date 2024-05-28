import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThree, Pencil, Trash, UsersThree } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

interface PrivateAnnotationActionsProps {

  i18n: Translations;

  isFirst: boolean;

  onDeleteAnnotation(): void;

  onDeleteSection(): void;

  onEditSection(): void;

  onMakePublic(): void;
}

export const PrivateAnnotationActions = (props: PrivateAnnotationActionsProps) => {

  const { t } = props.i18n;

  const onClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
  }

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button className="comment-actions unstyled icon-only">
          <DotsThree size={20} weight="bold" />
        </button>
      </Dropdown.Trigger>

      <Dropdown.Content asChild sideOffset={5} align="start" onClick={onClick}>
        <div className="dropdown-content no-icons">
          <Dropdown.Item
            className='dropdown-item'
            onSelect={props.onEditSection}>
            <Pencil size={16} /> 
            {props.isFirst ? (
              <span>{t['Edit annotation']}</span>
            ) : (
              <span>{t['Edit reply']}</span>
            )}
          </Dropdown.Item>

          {props.isFirst ? (
            <>
              <Dropdown.Item className="dropdown-item" onSelect={props.onMakePublic}>
                <UsersThree size={16} /> <span>{t['Make annotation public']}</span>
              </Dropdown.Item>

              <Dropdown.Item className="dropdown-item" onSelect={props.onDeleteAnnotation}>
                <Trash size={16} /> <span>{t['Delete annotation']}</span>
              </Dropdown.Item>
            </>
          ) : (
            <Dropdown.Item
              className='dropdown-item'
              onSelect={props.onDeleteSection}>
              <Trash size={16} /> <span>{t['Delete reply']}</span>
            </Dropdown.Item>
          )}
        </div>
      </Dropdown.Content>
    </Dropdown.Root>
  )

}