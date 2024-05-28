import { useState } from 'react';
import type * as Checkbox from '@radix-ui/react-checkbox';

export const useSelectableRows = <T extends { id: string }>(
  items: T[],
  initialSelection?: T[] | string[]
) => {
  const initialIds = initialSelection?.map((x) =>
    typeof x === 'string' ? x : x.id
  );

  const [selected, setSelected] = useState<string[]>(initialIds || []);

  const isAllSelected = !!(items.length && selected.length === items.length);

  const toggleSelected = (item: T, checked: Checkbox.CheckedState) => {
    if (checked) setSelected((selected) => [...selected, item.id]);
    else setSelected((selected) => selected.filter((id) => id !== item.id));
  };

  const toggleAll = (checked: Checkbox.CheckedState) => {
    if (checked) setSelected(items.map((p) => p.id));
    else setSelected([]);
  };

  return {
    selected,
    isAllSelected,
    toggleSelected,
    toggleAll,
  };
};
