import { useState } from 'react';
import { User as UserIcon } from '@phosphor-icons/react';
import * as Toggle from '@radix-ui/react-toggle';
import type { Annotation, Filter, PresentUser, User } from '@annotorious/react';
import { useCreators } from './useCreators';
import type { Translations } from 'src/Types';

import './Creators.css';

interface CreatorsProps {

  i18n: Translations;

  present: PresentUser[];

  onSetFilter(filter?: Filter): void;

}

const getCreator = (annotation: Annotation) =>
  annotation.target?.creator || 
    (annotation.bodies.length > 0 ? annotation.bodies[0].creator : undefined);

export const Creators = (props: CreatorsProps) => {

  const creators = useCreators(props.present);

  const [selected, setSelected] = useState<User[]>([]);

  const onToggle = (creator: User) => {
    const next = selected.some(u => u.id === creator.id) 
      ? selected.filter(u => u.id !== creator.id) : [...selected, creator];

    setSelected(next);     

    if (next.length > 0) {
      const creatorIds = new Set(next.map(u => u.id));

      const filter = (a: Annotation) => { 
        const id = getCreator(a)?.id;
        return id ? creatorIds.has(id) : false;
      }

      props.onSetFilter(filter);
    } else {
      props.onSetFilter(undefined);
    }
  }

  return (
    <section className="filter-creators">
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