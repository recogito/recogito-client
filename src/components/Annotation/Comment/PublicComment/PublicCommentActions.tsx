import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThreeVertical, Pencil, Trash } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface PublicCommentActionsProps {

  i18n: Translations;

  isFirst?: boolean;

  onDeleteAnnotation(): void;

  onDeleteComment(): void;

  onEditComment(): void;

}

export const PublicCommentActions = (props: PublicCommentActionsProps) => {

  const { t } = props.i18n;

  return (
    <Root>
      <Trigger asChild>
        <button className="comment-actions unstyled icon-only">
          <DotsThreeVertical size={20} weight="bold" />
        </button>
      </Trigger>

      <Portal>
        <Content asChild sideOffset={5} align="start">
          <div className="dropdown-content no-icons">
            {props.isFirst && (
              <>
                <Item className="dropdown-item" onSelect={props.onDeleteAnnotation}>
                  <Trash size={16} /> <span>{t['Delete annotation']}</span>
                </Item>
              </>
            )}

            <Item className="dropdown-item" onSelect={props.onEditComment}>
              <Pencil size={16} /> <span>{t['Edit comment']}</span>
            </Item>

            <Item className="dropdown-item" onSelect={props.onDeleteComment}>
              <Trash size={16} /> <span>{t['Delete comment']}</span>
            </Item>
          </div>
        </Content>
      </Portal>
    </Root>
  )

}