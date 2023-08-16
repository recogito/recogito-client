import { useState } from 'react';
import type * as Checkbox from '@radix-ui/react-checkbox';

export const useSelectableRows = <T extends { id: string }>(items: T[]) => {

  const [selected, setSelected] = useState<string[]>([]);

  const isAllSelected = selected.length === items.length;

  const toggleSelected = (item: T, checked: Checkbox.CheckedState) => {
    if (checked)
      setSelected(selected => [...selected, item.id])
    else 
      setSelected(selected => selected.filter(id => id !== item.id));
  }

  const toggleAll = (checked: Checkbox.CheckedState) => {
    if (checked)
      setSelected(items.map(p => p.id));
    else
      setSelected([]);    
  }

  return {
    selected, isAllSelected, toggleSelected, toggleAll
  }
}