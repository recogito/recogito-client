import { useMemo } from 'react';
import { Stack } from '@phosphor-icons/react';
import * as Tooltip from '@radix-ui/react-tooltip';
import type { Translations } from 'src/Types';

import './LayerIcon.css';

interface LayerIconProps {

  i18n: Translations;

  layerId?: string;

  layerNames: Map<string, string>;

}

export const LayerIcon = (props: LayerIconProps) => {

  const { t } = props.i18n;

  const label = useMemo(() => 
    props.layerId ? props.layerNames.get(props.layerId) || t['Baselayer'] : t['Baselayer'], []);

  return props.layerId && (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={100}>
        <Tooltip.Trigger asChild>
          <div className="unstyled layer-icon" role="img" aria-label={label}>
            <Stack size={16} />
          </div>
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content 
            className="tooltip-content"
            side="top">
            {label}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )

}