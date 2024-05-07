import { CheckSquare, Stack } from '@phosphor-icons/react';
import * as Checkbox from '@radix-ui/react-checkbox';

export const AnnotationLayers = () => {

  return (
    <section className="filters-annotationlayers">
      <h2>
        <Stack size={18} /> Annotation Layers
      </h2>

      <section>
        <h3>Active</h3>
        <Checkbox.Root
          id="active-layer"
          className="checkbox-root"
          checked={true}>

          <Checkbox.Indicator>
            <CheckSquare size={20} weight="fill" />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <label htmlFor="active-layer">
          Assignment A
        </label>
      </section>

      <section>
        <h3>Read-Only</h3>
      </section>
    </section>
  )

}