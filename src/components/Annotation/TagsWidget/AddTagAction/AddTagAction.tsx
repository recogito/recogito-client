import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { PlusCircle } from '@phosphor-icons/react';
import { TagInput, TagInputProps } from '../TagInput';

import './AddTagAction.css';

export const AddTagAction = (props: TagInputProps) => {

  const [open, setOpen] = useState(false);

  return (
    <Popover.Root 
      open={open}
      onOpenChange={setOpen}>

      <Popover.Trigger asChild>
        <div className="add-tag">
          <button className="unstyled icon-only">
            <PlusCircle size={22} />
          </button>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className="add-tag-popover popover-content" align="start" sideOffset={2}>
          <TagInput {...props} />

          <Popover.Arrow 
            className="popover-arrow"
            height={8}
            width={18} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )


}