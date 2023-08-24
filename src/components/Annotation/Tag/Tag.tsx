import * as Popover from '@radix-ui/react-popover';
import type { AnnotationBody } from '@annotorious/react';
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
          className="popover-tooltip-content" 
          side="top">
          <button onClick={props.onDelete}>Delete this tag</button>

          <Arrow className="popover-tooltip-arrow" />
        </Content>
      </Portal>
    </Root>
  )

}