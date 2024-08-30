import { Button } from '@components/Button';
import { CaretRight } from '@phosphor-icons/react';
import * as Accordion from '@radix-ui/react-accordion';
import React, { type ReactNode, useState } from 'react';
import './LoginAccordion.css';

interface Props {
  children: ReactNode,
  label: string
}

export const LoginAccordion = (props: Props) => {
  const [open, setOpen] = useState<string>('');

  return (
    <Accordion.Root
      className='login-accordion accordion-root'
      collapsible
      type='single'
      onValueChange={setOpen}
      value={open}
    >
      <Accordion.Item
        className='accordion-item'
        value='1'
      >
        <Accordion.Trigger
          asChild
        >
          <Button
            className='accordion-trigger-login lg w-full'
          >
            <span>
              { props.label }
            </span>
            <CaretRight
              aria-hidden
              className='accordion-chevron'
              size={15}
            />
          </Button>
        </Accordion.Trigger>
        <Accordion.Content
          className='accordion-content'
        >
          { props.children }
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};
