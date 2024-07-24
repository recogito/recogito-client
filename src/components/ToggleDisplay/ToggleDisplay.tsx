import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { SquaresFour, ListBullets } from '@phosphor-icons/react';

import './ToggleDisplay.css';

export type ToggleDisplayValue = 'cards' | 'rows';

interface ToggleDisplayProps {

  display: ToggleDisplayValue;

  onChangeDisplay(display: ToggleDisplayValue): void;

}

export const ToggleDisplay = (props: ToggleDisplayProps) => {

  // Note that the Radix toggle group can have a value of undefined.
  // In our case, we want to emulate radio group behavior!
  const onValueChange = (value?: string) => {
    if (value)
      props.onChangeDisplay(value as ToggleDisplayValue);
  }

  return (
    <ToggleGroup.Root
      className='toggle-display-group'
      type='single'
      aria-label='Text alignment'
      value={props.display}
      onValueChange={onValueChange}>

      <ToggleGroup.Item className='toggle-display-item' value='cards'>
        <SquaresFour size={16} />
      </ToggleGroup.Item>
      
      <ToggleGroup.Item className='toggle-display-item' value='rows'>
        <ListBullets size={16} />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  )

}
