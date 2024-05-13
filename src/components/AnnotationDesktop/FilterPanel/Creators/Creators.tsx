import { User as UserIcon } from '@phosphor-icons/react';
import * as Toggle from '@radix-ui/react-toggle';
import type { Annotation, PresentUser, User } from '@annotorious/react';
import { getCreator } from '@components/AnnotationDesktop';
import { useCreators } from './useCreators';
import { useFilterSettingsState } from '../FilterState';
import type { Translations } from 'src/Types';

interface CreatorsProps {

  i18n: Translations;

  present: PresentUser[];

}

export const Creators = (props: CreatorsProps) => {

  const creators = useCreators(props.present);

  const { creatorSettings, setCreatorSettings } = useFilterSettingsState();

  const selected = creatorSettings?.state || [];

  const onToggle = (creator: User) => {
    const next = selected.some(u => u.id === creator.id) 
      ? selected.filter(u => u.id !== creator.id) : [...selected, creator];

    if (next.length > 0) {
      const creatorIds = new Set(next.map(u => u.id));

      const filter = (a: Annotation) => { 
        const id = getCreator(a)?.id;
        return id ? creatorIds.has(id) : false;
      }

      setCreatorSettings({ state: next, filter });
    } else {
      setCreatorSettings(undefined);
    }
  }

  return (
    <section className="filter-creators filter-toggle-buttons">
      <h2>
        <UserIcon size={19} /> Creators
      </h2>

      <ul>
        {creators.map(creator => (
          <li key={creator.id}>
            <Toggle.Root 
              className="toggle"
              pressed={selected.some(u => u.id === creator.id)}
              onPressedChange={() => onToggle(creator)}>
              {creator.name || 'Anonymous'}
            </Toggle.Root>
          </li>
        ))}
      </ul>
    </section>
  )

}