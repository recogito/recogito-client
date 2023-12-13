import { ReactNode, forwardRef } from 'react';
import * as Select from '@radix-ui/react-select';
import { CaretDown, Check } from '@phosphor-icons/react';
import type { LoginMethod, Translations } from 'src/Types';
import './LoginMethodSelector.css';
interface LoginMethodSelectorProps {
  i18n: Translations;

  currentMethod: LoginMethod | undefined;

  availableMethods: LoginMethod[];

  onChangeMethod(method: LoginMethod): void;
}

interface SelectItemProps {
  children: ReactNode;

  value: string;

  disabled?: boolean;
}

// eslint-disable-next-line react/display-name
const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  (props, forwardedRef) => (
    <Select.Item className='select-item' {...props} ref={forwardedRef}>
      <Select.ItemIndicator className='select-item-indicator-login-method'>
        <Check />
      </Select.ItemIndicator>
      <Select.ItemText className='select-item-text-login-method'>
        {props.children}
      </Select.ItemText>
    </Select.Item>
  )
);

export const LoginMethodSelector = (props: LoginMethodSelectorProps) => {
  const { t } = props.i18n;

  const onValueChange = (value: string) => {
    const method = props.availableMethods.find((g) => g.name === value);
    if (method) {
      // Optimistic update to upwards component state
      props.onChangeMethod(method);
    }
  };

  return (
    <Select.Root
      value={props.currentMethod?.name}
      onValueChange={onValueChange}
    >
      <Select.Trigger className='select-trigger' aria-label={t['Login method']}>
        <Select.Value placeholder={t['Sign In']} />
        <Select.Icon className='select-icon'>
          <CaretDown />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className='select-content-login-method'>
          <Select.Viewport className='select-viewport'>
            {props.availableMethods.map((method) => (
              <SelectItem key={method.name} value={method.name}>
                {method.name}
              </SelectItem>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
