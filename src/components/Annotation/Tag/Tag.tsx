import * as Popover from '@radix-ui/react-popover';
import type { AnnotationBody } from '@annotorious/react';
import { Trash } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

import './Tag.css';

interface TagProps {

  i18n: Translations;

  tag: AnnotationBody;

  onDelete(): void;

}

const { Arrow, Content, Portal, Root, Trigger } = Popover;

export const Tag = (props: TagProps) => {

  const { value } = props.tag;

  return (
    <Root>
      <Trigger asChild >
        <span className="annotation-tag">
          {value}
        </span>
      </Trigger>

      <Portal>
        <Content 
          className="delete-popover popover-content" 
          side="top"
          align="center" 
          sideOffset={10}>
          <button 
            className="danger sm"
            onClick={props.onDelete}> 
            <Trash size={16} /> <span>Delete</span>
          </button>

          <Arrow className="popover-arrow" />
        </Content>
      </Portal>
    </Root>
  )

}