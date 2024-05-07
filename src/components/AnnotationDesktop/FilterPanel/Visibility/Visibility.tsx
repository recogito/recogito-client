import { useState } from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { Lock } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

import './Visibility.css';

interface VisibilityProps {

  i18n: Translations;

}

export const Visibility = (props: VisibilityProps) => {

  const [selected, setSelected] = useState('all');

  return (
    <section className="filter-visibility">
      <h2>
        <Lock size={19} /> Visibility
      </h2>

      <RadioGroup.Root 
        className="radio-group-root"
        value={selected}
        onValueChange={setSelected}>
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