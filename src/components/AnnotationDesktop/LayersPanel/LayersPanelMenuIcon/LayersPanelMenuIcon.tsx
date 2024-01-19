import { StackSimple, X } from '@phosphor-icons/react';
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
    <div 
      className={props.active ? 'with-notification active' : 'with-notification '}>
      <button
        className={props.active ? 'active' : undefined}
        aria-label={t['Show annotation filter and color configuration']}
        onClick={() => props.onSelect()}>
        <StackSimple />
      </button>

      {filter && (
        <span className="notification-bubble">
          <span>1</span>
        </span>
      )}
    </div>
  )

}