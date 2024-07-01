import * as Tooltip from '@radix-ui/react-tooltip';
import { Info } from '@phosphor-icons/react';
import './InfoTooltip.css';

interface InfoTooltipProps {
  content: string;
}
export const InfoTooltip = (props: InfoTooltipProps) => {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Info className='info-tooltip-icon' />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className='tooltip-content' sideOffset={5}>
            {props.content}
            <Tooltip.Arrow className='tooltip-arrow' />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
