import type { Annotation } from '@annotorious/react';
import * as Toggle from '@radix-ui/react-toggle';
import { Tag as TagIcon} from '@phosphor-icons/react';
import { useTags } from './useTags';
import { useFilterSettingsState } from '../FilterState';
import { useTranslation } from 'react-i18next';

export const Tags = () => {
  const { t } = useTranslation(['annotation-common']);

  const tags = useTags();

  const { tagSettings, setTagSettings } = useFilterSettingsState();

  const selected = tagSettings?.state || [];

  const onToggle = (tag: string) => {
    const next = new Set(selected.includes(tag) 
      ? selected.filter(s => s !== tag) : [...selected, tag]);
  
    if (next.size > 0) {
      // For backwards-compatibility: support object and string tags
      const getKey = (value: string) =>value.startsWith('{') ? JSON.parse(value).label : value;
    
      const filter = (a: Annotation) =>
        a.bodies.some(b => b.purpose === 'tagging' && b.value && next.has(getKey(b.value)));

      setTagSettings({ state: [...next], filter });
    } else {
      setTagSettings(undefined);
    }
  }

  return (
    <section className="filter-tags filter-toggle-buttons">
      <h2>
        <TagIcon size={19} /> {t('Tags', { ns: 'annotation-common' })}
      </h2>

      <ul>
        {tags.map((tag, idx) => (
          <li key={`${tag.id || tag.label}-${idx}`}>
            <Toggle.Root 
              className="toggle"
              pressed={selected.includes(tag.label)}
              onPressedChange={() => onToggle(tag.label)}>
              {tag.label}
            </Toggle.Root>
          </li>
        ))}
      </ul>
    </section>
  )

}