import { useState } from 'react';
import type { AnnotationBody } from '@annotorious/react';
import { CaretDown } from '@phosphor-icons/react';
import * as Popover from '@radix-ui/react-popover';
import { Tag } from '../Tag';
import type { Translations } from 'src/Types';

interface MoreTagsActions {

  i18n: Translations;

  displayed: number;

  tags: AnnotationBody[];

  onDelete(tag: AnnotationBody): void;

}

export const MoreTags = (props: MoreTagsActions) => {

  const { displayed, tags } = props;

  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="more-tags-trigger unstyled">
          + {tags.length - displayed} more
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className="popover-content" align="start" sideOffset={10}>
          <ul>
            {tags.map(tag => (
              <li key={tag.id}>
                <Tag 
                  i18n={props.i18n} 
                  tag={tag} 
                  onDelete={() => props.onDelete(tag)} />
              </li>
            ))}
          </ul>

          <Popover.Arrow className="popover-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )

}