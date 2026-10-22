import * as RadioGroup from '@radix-ui/react-radio-group';

import './RadioCards.css';

type RadioCardEntry = {
  label: string;
  id: string;
};

interface RadioCardsProps {
  entries: RadioCardEntry[];
  activeEntry: string;
  onSelect(id: string): void;
}

export const RadioCards = (props: RadioCardsProps) => {
  return (
    <RadioGroup.Root
      className='radio-cards-root'
      value={props.activeEntry}
      onValueChange={props.onSelect}
    >
      {props.entries.map((e) => (
        <RadioGroup.Item className='radio-cards-item' value={e.id} key={e.id}>
          <span className='radio-group-item radio-cards-radio' aria-hidden>
            {props.activeEntry === e.id && (
              <span className='radio-group-indicator' />
            )}
          </span>
          <span className='radio-cards-text'>{e.label}</span>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
};
