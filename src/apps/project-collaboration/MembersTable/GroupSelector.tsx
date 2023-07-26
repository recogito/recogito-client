import { ReactNode, forwardRef, useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { CaretDown, Check } from '@phosphor-icons/react';
import { updateUserProjectGroup } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { TinySaveIndicator, SaveState } from '@components/TinySaveIndicator';
import type { TeamMember } from '../TeamMember';
import type { ProjectGroup, Translations } from 'src/Types';

interface GroupSelectorProps {

  i18n: Translations;

  member: TeamMember;

  availableGroups: ProjectGroup[];

  onChangeGroup(from: ProjectGroup, to: ProjectGroup): void;

}

interface SelectItemProps {

  children: ReactNode;

  value: string;

  disabled?: boolean;

}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>((props, forwardedRef) => (
  <Select.Item className="select-item" {...props} ref={forwardedRef}>
    <Select.ItemIndicator className="select-item-indicator">
      <Check />
    </Select.ItemIndicator>
    <Select.ItemText>{props.children}</Select.ItemText>
  </Select.Item>
));

export const GroupSelector = (props: GroupSelectorProps) => {

  const { member } = props;

  const [state, setState] = useState<SaveState>('idle');

  const onValueChange = (value: string) => {
    const group = props.availableGroups.find(g => g.id === value);
    if (group) {
      // Optimistic update to upwards component state
      props.onChangeGroup(member.inGroup, group);

      setState('saving');

      updateUserProjectGroup(
        supabase, 
        member.user.id, 
        member.inGroup.id,
        value
      ).then(({ error }) => {
        if (error) {
          console.error(error);

          // Rollback optimistic update
          setState('failed');
          props.onChangeGroup(group, member.inGroup);
        } else {
          setState('success');
        }
      });
    }
  }

  return (
    <Select.Root value={props.member.inGroup.id} onValueChange={onValueChange}>
      <Select.Trigger className="select-trigger" aria-label="User access level">
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
              <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )

}