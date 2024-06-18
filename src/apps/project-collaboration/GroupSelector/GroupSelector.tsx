import { forwardRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as Select from '@radix-ui/react-select';
import { CaretDown, Check } from '@phosphor-icons/react';
import { updateUserProjectGroup } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { TinySaveIndicator, type SaveState } from '@components/TinySaveIndicator';
import type { Group, Member, Translations } from 'src/Types';

interface GroupSelectorProps {

  i18n: Translations;

  member: Member;

  availableGroups: Group[];

  onChangeGroup(from: Group, to: Group): void;

}

interface SelectItemProps {

  children: ReactNode;

  value: string;

  disabled?: boolean;

}

// eslint-disable-next-line react/display-name
const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>((props, forwardedRef) => (
  <Select.Item className="select-item" {...props} ref={forwardedRef}>
    <Select.ItemIndicator className="select-item-indicator">
      <Check />
    </Select.ItemIndicator>
    <Select.ItemText>{props.children}</Select.ItemText>
  </Select.Item>
));

export const GroupSelector = (props: GroupSelectorProps) => {

  const { t } = props.i18n;

  const { member } = props;

  const [state, setState] = useState<SaveState>('idle');

  const onValueChange = (value: string) => {
    const group = props.availableGroups.find(g => g.id === value);
    if (group) {
      // Optimistic update to upwards component state
      props.onChangeGroup(member.inGroup!, group);

      setState('saving');

      updateUserProjectGroup(
        supabase,
        member.user.id,
        member.inGroup!.id,
        value
      ).then(({ error }) => {
        if (error) {
          // Rollback optimistic update
          setState('failed');
          props.onChangeGroup(group, member.inGroup!);
        } else {
          setState('success');
        }
      });
    }
  }

  return (
    <Select.Root value={props.member.inGroup!.id} onValueChange={onValueChange}>
      <Select.Trigger
        disabled={state === 'saving'}
        className="select-trigger" aria-label={t['Access Level']}>
        <Select.Value />
        <Select.Icon className="select-icon">
          <CaretDown />
        </Select.Icon>
      </Select.Trigger>

      <TinySaveIndicator
        state={state}
        fadeOut={2500} />

      <Select.Portal>
        <Select.Content className="select-content">
          <Select.Viewport className="select-viewport">
            {props.availableGroups.map(group => (
              <SelectItem key={group.id} value={group.id}>{t[group.name]}</SelectItem>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )

}