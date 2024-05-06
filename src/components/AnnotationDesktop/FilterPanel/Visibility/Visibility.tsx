import * as RadioGroup from '@radix-ui/react-radio-group';
import { Lock } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

interface VisibilityProps {

  i18n: Translations;

}

export const Visibility = (props: VisibilityProps) => {

  return (
    <section className="filter-visibility">
      <h1>
        <Lock /> Visbility
      </h1>

      <div>
        <RadioGroup.Root>
          <div>
            <RadioGroup.Item value="all" id="visibility-all">
              <RadioGroup.Indicator />
            </RadioGroup.Item>
            <label htmlFor="visibility-all">
              All annotations
            </label>
          </div>

          <div>
            <RadioGroup.Item value="all" id="visibility-public">
              <RadioGroup.Indicator />
            </RadioGroup.Item>
            <label htmlFor="visibility-public">
              Public annotations only
            </label>
          </div>

          <div>
            <RadioGroup.Item value="all" id="visibility-private">
              <RadioGroup.Indicator />
            </RadioGroup.Item>
            <label htmlFor="visibility-private">
              Private annotations only
            </label>
          </div>

        </RadioGroup.Root>
      </div>
    </section>
  )
  
}