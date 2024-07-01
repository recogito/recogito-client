import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { SquaresFour, ListBullets } from '@phosphor-icons/react';

import './ToggleDisplay.css';

export type ToggleDisplayOptions = 'cards' | 'rows';

interface ToggleDisplayProps {
  display: ToggleDisplayOptions;
  onChangeDisplay(display: ToggleDisplayOptions): void;
}

export const ToggleDisplay = (props: ToggleDisplayProps) => {
  return (
    <ToggleGroup.Root
      className='toggle-display-group'
      type='single'
      aria-label='Text alignment'
      value={props.display}
      onValueChange={(value) =>
        props.onChangeDisplay(value as ToggleDisplayOptions)
      }
    >
      <ToggleGroup.Item className='toggle-display-item' value='cards'>
        <SquaresFour size={16} />
      </ToggleGroup.Item>
      
      <ToggleGroup.Item className='toggle-display-item' value='rows'>
        <ListBullets size={16} />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
};
