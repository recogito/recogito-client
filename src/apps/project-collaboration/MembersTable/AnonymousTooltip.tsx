import { Info } from '@phosphor-icons/react';
import * as Popover from '@radix-ui/react-popover';
import type { Translations } from 'src/Types';

interface AnonymousTooltipProps {

  i18n: Translations;

}

const { Arrow, Content, Portal, Root, Trigger } = Popover;

export const AnonymousTooltip = (props: AnonymousTooltipProps) => {

  return (
    <Root>
      <Trigger asChild >
        <button 
          className="unstyled icon-only"
          disabled={false}>
          <Info size={16} weight="fill" />
        </button>
      </Trigger>

      <Portal>
        <Content 
          className="popover-tooltip-content" 
          side="top">
          {props.i18n.t['This user has not provided a profile name.']}

          <Arrow className="popover-tooltip-arrow" />
        </Content>
      </Portal>
    </Root>
  )

}