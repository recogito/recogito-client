import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThreeVertical, Trash } from '@phosphor-icons/react';

const { Content, Item, Root, Trigger } = Dropdown;

interface PublicCommentActionsProps {

  isFirst?: boolean;

  onDeleteAnnotation(): void;

  onDeleteComment(): void;

}

export const PublicCommentActions = (props: PublicCommentActionsProps) => {

  return (
    <Root>
      <Trigger asChild>
        <button className="comment-actions unstyled icon-only">
          <DotsThreeVertical size={20} weight="bold" />
        </button>
      </Trigger>

      <Content asChild sideOffset={5} align="start">
        <div className="dropdown-content no-icons">
          {props.isFirst && (
            <>
              <Item className="dropdown-item" onSelect={props.onDeleteAnnotation}>
                <Trash size={16} /> <span>Delete this annotation</span>
              </Item>
            </>
          )}

          <Item className="dropdown-item" onSelect={props.onDeleteComment}>
            <Trash size={16} /> <span>Delete this comment</span>
          </Item>
        </div>
      </Content>
    </Root>
  )

}