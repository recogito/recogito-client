import { Info } from '@phosphor-icons/react';
import * as Popover from '@radix-ui/react-popover';
import { useColorCoding } from './ColorState';
import { useTranslation } from 'react-i18next';

import './ColorLegend.css';

export const ColorLegend = () => {
  const { t } = useTranslation(['a11y', 'annotation-common']);

  const colorCoding = useColorCoding();

  const legend = colorCoding?.legend;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button disabled={!legend} aria-label={t('color legend', { ns: 'a11y' })}>
          <Info size={18} />
        </button>
      </Popover.Trigger>

      <Popover.Content className='popover-content color-legend'>
        <h3>{t('Colors', { ns: 'annotation-common' })}</h3>
        {legend && (
          <ul>
            {legend.map(({ label, color }, index) => (
              <li key={`${label}-${index}`}>
                <span
                  className='legend-color'
                  style={{ backgroundColor: color }}
                />{' '}
                {t(label) || label}
              </li>
            ))}
          </ul>
        )}
      </Popover.Content>
    </Popover.Root>
  );
};
