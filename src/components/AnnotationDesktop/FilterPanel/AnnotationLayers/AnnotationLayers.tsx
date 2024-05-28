import { Check, Stack, EyeSlash } from '@phosphor-icons/react';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Switch from '@radix-ui/react-switch';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { DocumentLayer, Translations } from 'src/Types';
import { useFilterSettingsState } from '../FilterState';

import './AnnotationLayers.css';

interface AnnotationLayersProps {

  i18n: Translations;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

}

export const AnnotationLayers = (props: AnnotationLayersProps) => {

  const { t } = props.i18n;

  const active = props.layers?.find((l) => l.is_active);

  const readOnly = props.layers?.filter((l) => !l.is_active) || [];

  const { layerSettings, setLayerSettings } = useFilterSettingsState();

  const isChecked = (layerId: string) =>
    layerSettings?.state === undefined || layerSettings.state.includes(layerId);

  const onCheckedChange = (layerId: string, checked: boolean) => {
    if (!active) return;

    let next: Set<string>;

    if (layerSettings?.state) {
      next = new Set(
        checked
          ? [...layerSettings.state, layerId]
          : layerSettings.state.filter((id) => id !== layerId)
      );
    } else {
      // State currently undefined
      next = new Set(
        checked
          ? [layerId]
          : [active.id, ...readOnly.map((l) => l.id)].filter(
              (id) => id !== layerId
            )
      );
    }

    // All selected?
    if (next.size === readOnly.length + 1) {
      setLayerSettings(undefined);
    } else {
      const filter = (a: SupabaseAnnotation) =>
        Boolean(a.layer_id) && next.has(a.layer_id!);
      setLayerSettings({ state: [...next], filter });
    }
  };

  return props.layers?.length === 1 && active ? (
    <section className="filters-annotationlayers single-layer">
      <label htmlFor="hide-annotations">
        <EyeSlash size={18} /> {t['Hide Annotations']}
      </label>

      <Switch.Root 
        className="switch-root" 
        id="hide-annotations"
        checked={!isChecked(active.id)}
        onCheckedChange={checked => 
          onCheckedChange(active.id, !checked)
        }>
        <Switch.Thumb className="switch-thumb" />
      </Switch.Root>
    </section>
  ) : active ? (
    <section className="filters-annotationlayers">
      <h2>
        <Stack size={18} /> {t['Annotation Layers']}
      </h2>

      <section>
        <h3>{t['Active']}</h3>

        <div className="active-layer">
          <Checkbox.Root
            id="active-layer"
            className="checkbox-root"
            checked={isChecked(active.id)}
            onCheckedChange={checked =>
              onCheckedChange(active.id, checked as boolean)
            }>
            <Checkbox.Indicator>
              <Check size={14} weight='bold' />
            </Checkbox.Indicator>
          </Checkbox.Root>

          <label htmlFor="active-layer">
            {props.layerNames.get(active.id) || t['Baselayer']}
          </label>
        </div>
      </section>

      {readOnly.length > 0 && (
        <section>
          <h3>{t['Read-Only']}</h3>

          <ul>
            {readOnly.map((l) => (
              <li key={l.id}>
                <Checkbox.Root
                  id={`layer-${l.id}`}
                  className="checkbox-root"
                  checked={isChecked(l.id)}
                  onCheckedChange={(checked) =>
                    onCheckedChange(l.id, checked as boolean)
                  }>
                  <Checkbox.Indicator>
                    <Check size={14} weight='bold' />
                  </Checkbox.Indicator>
                </Checkbox.Root>

                <label htmlFor={`layer-${l.id}`}>
                  {props.layerNames.get(l.id) || t['Baselayer']}
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  ) : null;

}
