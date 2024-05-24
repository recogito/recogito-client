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

  return props.layerId && (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={100}>
        <Tooltip.Trigger asChild>
          <button className="unstyled layer-icon">
            <Stack size={16} />
          </button>
        </Tooltip.Trigger>

        <Tooltip.Content 
          className="tooltip-content"
          side="top">
          {props.layerNames.get(props.layerId) || t['Baselayer']}
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  )

}