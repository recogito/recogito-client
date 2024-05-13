import type { Annotation } from '@annotorious/react';
import * as Toggle from '@radix-ui/react-toggle';
import { Tag as TagIcon} from '@phosphor-icons/react';
import { useTags } from './useTags';
import { useFilterSettingsState } from '../FilterState';

export const Tags = () => {

  const tags = useTags();

  const { tagSettings, setTagSettings } = useFilterSettingsState();

  const selected = tagSettings?.state || [];

  const onToggle = (tag: string) => {
    const next = new Set(selected.includes(tag) 
      ? selected.filter(s => s !== tag) : [...selected, tag]);
  
    if (next.size > 0) {
      const filter = (a: Annotation) =>
        a.bodies.some(b => b.purpose === 'tagging' && b.value && next.has(b.value));

      setTagSettings({ state: [...next], filter });
    } else {
      setTagSettings(undefined);
    }
  }

  return (
    <section className="filter-tags filter-toggle-buttons">
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