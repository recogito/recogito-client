import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { SquaresFour, ListBullets } from '@phosphor-icons/react';

import './ToggleDisplay.css';
import type { Translations } from 'src/Types';

export type ToggleDisplayValue = 'cards' | 'rows';

interface ToggleDisplayProps {
  display: ToggleDisplayValue;

  i18n: Translations;

  onChangeDisplay(display: ToggleDisplayValue): void;
}

export const ToggleDisplay = (props: ToggleDisplayProps) => {
  // Note that the Radix toggle group can have a value of undefined.
  // In our case, we want to emulate radio group behavior!
  const onValueChange = (value?: string) => {
    if (value) props.onChangeDisplay(value as ToggleDisplayValue);
  };

  const { t } = props.i18n;

  return (
    <ToggleGroup.Root
      className='toggle-display-group'
      type='single'
      aria-label={t['Text alignment']}
      value={props.display}
      onValueChange={onValueChange}
    >
      <ToggleGroup.Item
        className='toggle-display-item'
        value='cards'
        aria-label={t['arrange projects as cards']}
      >
        <SquaresFour size={16} />
      </ToggleGroup.Item>

      <ToggleGroup.Item
        className='toggle-display-item'
        value='rows'
        aria-label={t['arrange-projects as list']}
      >
        <ListBullets size={16} />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
};
