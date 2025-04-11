import { Info } from '@phosphor-icons/react';
import * as Popover from '@radix-ui/react-popover';
import { useColorCoding } from './ColorState';
import type { Translations } from 'src/Types';

import './ColorLegend.css';

interface ColorLegendProps {
  i18n: Translations;
}

export const ColorLegend = (props: ColorLegendProps) => {
  const { t } = props.i18n;

  const colorCoding = useColorCoding();

  const legend = colorCoding?.legend;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button disabled={!legend} aria-label={t['color legend']}>
          <Info size={18} />
        </button>
      </Popover.Trigger>

      <Popover.Content className='popover-content color-legend'>
        <h3>{t['Colors']}</h3>
        {legend && (
          <ul>
            {legend.map(({ label, color }, index) => (
              <li key={`${label}-${index}`}>
                <span
                  className='legend-color'
                  style={{ backgroundColor: color }}
                />{' '}
                {t[label] || label}
              </li>
            ))}
          </ul>
        )}
      </Popover.Content>
    </Popover.Root>
  );
};
