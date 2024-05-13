import { Check, Stack } from '@phosphor-icons/react';
import * as Checkbox from '@radix-ui/react-checkbox';
import type { DocumentLayer } from 'src/Types';
import { useFilterSettingsState } from '../FilterState';

import './AnnotationLayers.css';

interface AnnotationLayersProps {

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

}

export const AnnotationLayers = (props: AnnotationLayersProps) => {

  const active = props.layers?.find(l => l.is_active);

  const readOnly = props.layers?.filter(l => !l.is_active) || [];

  const { layerSettings, setLayerSettings } = useFilterSettingsState();

  return active && (
    <section className="filters-annotationlayers">
      <h2>
        <Stack size={18} /> Annotation Layers
      </h2>

      <section>
        <h3>Active</h3>

        <div className="active-layer">
          <Checkbox.Root
            id="active-layer"
            className="checkbox-root"
            checked={true}>

            <Checkbox.Indicator>
              <Check size={14} weight="bold" />
            </Checkbox.Indicator>
          </Checkbox.Root>

          <label htmlFor="active-layer">
            {props.layerNames.get(active.id)}
          </label>
        </div>
      </section>

      {readOnly.length > 0 && (
        <section>
          <h3>Read-Only</h3>
          <ul>
            {readOnly.map(l => (
              <li key={l.id}>
                <Checkbox.Root
                  id={`layer-${l.id}`}
                  className="checkbox-root">
                  <Checkbox.Indicator>
                    <Check size={14} weight="bold" />
                  </Checkbox.Indicator>
                </Checkbox.Root>

                <label htmlFor={`layer-${l.id}`}>
                  {props.layerNames.get(l.id)}
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  )

}