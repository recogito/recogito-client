import { User } from '@phosphor-icons/react';
import * as Toggle from '@radix-ui/react-toggle';
import type { PresentUser } from '@annotorious/react';
import { useCreators } from './useCreators';
import type { Translations } from 'src/Types';

import './Creators.css';

interface CreatorsProps {

  i18n: Translations;

  present: PresentUser[];

}

export const Creators = (props: CreatorsProps) => {

  const creators = useCreators(props.present);

  return (
    <section className="filter-creators">
      <h2>
        <User size={19} /> Creators
      </h2>

      <ul>
        {creators.map(creator => (
          <li key={creator.id}>
            <Toggle.Root className="toggle">
              {creator.name || 'Anonymous'}
            </Toggle.Root>
          </li>
        ))}
      </ul>
    </section>
  )

}