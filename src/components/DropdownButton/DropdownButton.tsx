import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CaretDown } from '@phosphor-icons/react';
import './DropdownButton.css';

interface DropdownButtonProps {
  options: { node: any }[];
  icon: any;

  label: string;
}

export const DropdownButton = (props: DropdownButtonProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className='primary dropdown-button-trigger'>
          {props.icon}
          {props.label}
          <CaretDown />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className='dropdown-content' sideOffset={5}>
          {props.options.map((o) => {
            return (
              <DropdownMenu.Item className='.dropdown-item'>
                {o.node}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
