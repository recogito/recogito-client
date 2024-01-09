import { StackSimple } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';
import { useFilterSettings } from '../FilterSettings';

interface LayersPanelMenuIconProps {

  i18n: Translations;

  active?: boolean;

  onSelect(): void;

}

export const LayersPanelMenuIcon = (props: LayersPanelMenuIconProps) => {

  const { t } = props.i18n;

  const { filter } = useFilterSettings();

  return (
    <button
      className={props.active ? 'active' : undefined}
      aria-label={t['Show annotation filter and color configuration']}
      onClick={() => props.onSelect()}>
      <StackSimple />
    </button>
  )

}