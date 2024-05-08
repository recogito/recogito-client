import { useState } from 'react';
import type { Filter } from '@annotorious/react';
import { Visibility as VisibilityMode } from '@recogito/annotorious-supabase';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { Lock } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

import './Visibility.css';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

interface VisibilityProps {

  i18n: Translations;

  onSetFilter(filter?: Filter): void;

}

export const Visibility = (props: VisibilityProps) => {

  const [selected, setSelected] = useState('all');

  const onValueChange = (value: string) => {
    if (value === 'all') {
      props.onSetFilter();
    } else {
      const filter = (a: SupabaseAnnotation) => {
        const isPrivate = a.visibility === VisibilityMode.PRIVATE;
        return value === 'private' ? isPrivate : !isPrivate;
      }

      props.onSetFilter(filter);
    }

    setSelected(value);
  }

  return (
    <section className="filter-visibility">
      <h2>
        <Lock size={19} /> Visibility
      </h2>

      <RadioGroup.Root 
        className="radio-group-root"
        value={selected}
        onValueChange={onValueChange}>
        <div className="radio-group-item-wrapper">
          <RadioGroup.Item 
            className="radio-group-item" 
            value="all" 
            id="visibility-all">

            <RadioGroup.Indicator 
              className="radio-group-indicator" />
          </RadioGroup.Item>

          <label htmlFor="visibility-all">
            All annotations
          </label>
        </div>

        <div className="radio-group-item-wrapper">
          <RadioGroup.Item 
            className="radio-group-item" 
            value="public" 
            id="visibility-public">
            <RadioGroup.Indicator 
              className="radio-group-indicator" />
          </RadioGroup.Item>

          <label htmlFor="visibility-public">
            Public annotations only
          </label>
        </div>

        <div className="radio-group-item-wrapper">
          <RadioGroup.Item 
            className="radio-group-item" 
            value="private" 
            id="visibility-private">
            <RadioGroup.Indicator 
              className="radio-group-indicator" />
          </RadioGroup.Item>

          <label htmlFor="visibility-private">
            Private annotations only
          </label>
        </div>

      </RadioGroup.Root>
    </section>
  )
  
}