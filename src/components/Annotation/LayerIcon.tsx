import { useMemo } from 'react';
import { Stack } from '@phosphor-icons/react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useTranslation } from 'react-i18next';

import './LayerIcon.css';

interface LayerIconProps {

  layerId?: string;

  layerNames: Map<string, string>;

}

export const LayerIcon = (props: LayerIconProps) => {

  const { t } = useTranslation(['annotation-common']);

  const label = useMemo(() => 
    props.layerId ? props.layerNames.get(props.layerId) || t('Baselayer', { ns: 'annotation-common' }) : t('Baselayer', { ns: 'annotation-common' }), []);

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