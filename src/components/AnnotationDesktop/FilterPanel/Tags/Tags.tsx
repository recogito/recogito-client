import { useState } from 'react';
import type { Annotation, Filter } from '@annotorious/react';
import * as Toggle from '@radix-ui/react-toggle';
import { Tag as TagIcon} from '@phosphor-icons/react';
import { useTags } from './useTags';

interface TagsProps {

  onSetFilter(filter?: Filter): void;

}

export const Tags = (props: TagsProps) => {

  const tags = useTags();

  const [selected, setSelected] = useState<string[]>([]);

  const onToggle = (tag: string) => {
    const next = new Set(selected.includes(tag) 
      ? selected.filter(s => s !== tag) : [...selected, tag]);

    setSelected([...next]);     

    if (next.size > 0) {
      const filter = (a: Annotation) => 
        a.bodies.some(b => b.purpose === 'tagging' && b.value && next.has(b.value));

      props.onSetFilter(filter);
    } else {
      props.onSetFilter(undefined);
    }
  }

  return (
    <section className="filter-creators">
      <h2>
        <TagIcon size={19} /> Tags
      </h2>

      <ul>
        {tags.map(tag => (
          <li key={tag}>
            <Toggle.Root 
              className="toggle"
              pressed={selected.includes(tag)}
              onPressedChange={() => onToggle(tag)}>
              {tag}
            </Toggle.Root>
          </li>
        ))}
      </ul>
    </section>
  )

}