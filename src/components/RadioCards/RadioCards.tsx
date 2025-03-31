import { Box, RadioCards as RCards, Flex, Text, Radio } from '@radix-ui/themes';

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
    <Box maxWidth='600px'>
      <RCards.Root
        defaultValue='1'
        columns={{ initial: '8', sm: '2' }}
        value={props.activeEntry}
        onValueChange={props.onSelect}
        className='rcards-root'
      >
        {props.entries.map((e) => (
          <RCards.Item value={e.id} key={e.id}>
            <Flex direction='row' gap='4' width='100%'>
              <Radio
                size='2'
                name='size-2'
                value={e.id}
                checked={props.activeEntry === e.id}
                className='radio-cards-radio'
                aria-label={e.label}
              />
              <Text
                className={
                  props.activeEntry === e.id
                    ? 'radio-cards-text-active'
                    : 'radio-cards-text'
                }
              >
                {e.label}
              </Text>
            </Flex>
          </RCards.Item>
        ))}
      </RCards.Root>
    </Box>
  );
};
