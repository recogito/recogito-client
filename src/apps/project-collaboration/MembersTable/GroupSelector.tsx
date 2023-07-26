import { ReactNode, forwardRef } from 'react';
import * as Select from '@radix-ui/react-select';
import { CaretDown, Check } from '@phosphor-icons/react';
import type { TeamMember } from '../TeamMember';
import type { ProjectGroup, Translations } from 'src/Types';

interface GroupSelectorProps {

  i18n: Translations;

  member: TeamMember;

  availableGroups: ProjectGroup[];

  onChangeGroup(group: ProjectGroup): void;

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

  const onValueChange = (value: string) => {
    const group = props.availableGroups.find(g => g.id === value);
    if (group)
      props.onChangeGroup(group);
  }

  return (
    <Select.Root value={props.member.inGroup.id} onValueChange={onValueChange}>
      <Select.Trigger className="select-trigger" aria-label="User access level">
        <Select.Value />
        <Select.Icon className="select-icon">
          <CaretDown />
        </Select.Icon>
      </Select.Trigger>
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