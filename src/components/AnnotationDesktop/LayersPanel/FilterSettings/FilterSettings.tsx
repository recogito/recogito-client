import type { Annotation } from '@annotorious/react';
import type { Translations } from 'src/Types';

interface FilterSettingsProps {

  i18n: Translations;

  onChangeFilter(filter?: ((a: Annotation) => boolean)): void;
  
}

export const FilterSettings = (props: FilterSettingsProps) => {

  const { t } = props.i18n;

  /*
  const setDummyFilter = () => {
    const dummyFilter = (a: Annotation) =>
      Boolean(a.bodies.find(b => b.purpose === 'tagging' && b.value === 'Foo'));

    props.onChangeFilter(dummyFilter);
  }
  */

  return (
    <div className="layer-configuration-filter-settings">
      <form>
        <label>{t['Filter by']}</label>
      </form>
    </div>
  )

}