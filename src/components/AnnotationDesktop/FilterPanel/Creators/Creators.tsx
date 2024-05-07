import { useState } from 'react';
import { User } from '@phosphor-icons/react';
import './Creators.css';
import { CreatorButton } from './CreatorButton';

const CREATORS = ['Chelsea', 'Jamie', 'Lorin', 'Anindita'];

export const Creators = () => {

  const [checked, setChecked] = useState<string[]>([]);

  const onToggle = (creator: string, checked: boolean) => {
    if (checked)
      setChecked(current => ([...current, creator]))
    else
      setChecked(current => current.filter(c => c !== creator));
  }

  return (
    <section className="filter-creators">
      <h2>
        <User size={19} /> Creators
      </h2>

      <ul>
        {CREATORS.map(creator => (
          <li key={creator}>
            <CreatorButton
              creator={creator}
              checked={checked.includes(creator)}
              onToggle={checked => onToggle(creator, checked)} />
          </li>
        ))}
      </ul>
    </section>
  )

}