import { Check, Stack } from '@phosphor-icons/react';
import * as Checkbox from '@radix-ui/react-checkbox';
import type { Annotation } from '@annotorious/react';
import type { DocumentLayer } from 'src/Types';
import { useFilterSettingsState } from '../FilterState';

import './AnnotationLayers.css';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

interface AnnotationLayersProps {

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

}

export const AnnotationLayers = (props: AnnotationLayersProps) => {

  const active = props.layers?.find(l => l.is_active);

  const readOnly = props.layers?.filter(l => !l.is_active) || [];

  const { layerSettings, setLayerSettings } = useFilterSettingsState();

  const isChecked = (layerId: string) =>
    layerSettings?.state === undefined || layerSettings.state.includes(layerId);

  const onCheckedChange = (layerId: string, checked: boolean) => {
    if (!active) return;

    let next: Set<string>;

    if (layerSettings?.state) {
      next = new Set(checked
        ? [...layerSettings.state, layerId ]
        : layerSettings.state.filter(id => id !== layerId));
    } else {
      // State currently undefined
      next = new Set(checked 
        ? [layerId] 
        : [active.id, ...readOnly.map(l => l.id)].filter(id => id !== layerId));
    }

    // All selected?
    if (next.size === readOnly.length + 1) {
      setLayerSettings(undefined);
    } else {
      const filter = (a: SupabaseAnnotation) => Boolean(a.layer_id) && next.has(a.layer_id!);
      setLayerSettings({ state: [...next], filter });
    }
  }

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
            checked={isChecked(active.id)}
            onCheckedChange={checked => onCheckedChange(active.id, checked as boolean)}>

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
                  className="checkbox-root"
                  checked={isChecked(l.id)}
                  onCheckedChange={checked => onCheckedChange(l.id, checked as boolean)}>
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