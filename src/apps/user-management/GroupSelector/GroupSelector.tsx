import { ReactNode, forwardRef, useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { CaretDown, Check } from '@phosphor-icons/react';
import { updateUserProjectGroup } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { TinySaveIndicator, SaveState } from '@components/TinySaveIndicator';
import type { Group, Translations, ExtendedUserProfile } from 'src/Types';

interface GroupSelectorProps {
  i18n: Translations;

  user: ExtendedUserProfile;

  availableGroups: Group[];

  onChangeGroup(user: ExtendedUserProfile, to: string): void;
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
      <Select.ItemIndicator className='select-item-indicator'>
        <Check />
      </Select.ItemIndicator>
      <Select.ItemText>{props.children}</Select.ItemText>
    </Select.Item>
  )
);

export const GroupSelector = (props: GroupSelectorProps) => {
  const { t } = props.i18n;

  const { user } = props;

  const [state, setState] = useState<SaveState>('idle');

  const onValueChange = (value: string) => {
    const group = props.availableGroups.find((g) => g.id === value);
    if (group) {
      // Optimistic update to upwards component state
      props.onChangeGroup(user, group.id);

      setState('saving');

      updateUserProjectGroup(supabase, user.id, user.org_group_id, value).then(
        ({ error }) => {
          if (error) {
            // Rollback optimistic update
            setState('failed');
            props.onChangeGroup(user, user.org_group_id);
          } else {
            setState('success');
          }
        }
      );
    }
  };

  return (
    <Select.Root value={props.user.org_group_id} onValueChange={onValueChange}>
      <Select.Trigger
        disabled={state === 'saving'}
        className='select-trigger'
        aria-label={t['Access Level']}
      >
        <Select.Value />
        <Select.Icon className='select-icon'>
          <CaretDown />
        </Select.Icon>
      </Select.Trigger>

      <TinySaveIndicator state={state} fadeOut={2500} />

      <Select.Portal>
        <Select.Content className='select-content'>
          <Select.Viewport className='select-viewport'>
            {props.availableGroups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
