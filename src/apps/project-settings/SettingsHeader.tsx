import type { Translations } from 'src/Types';

import './SettingsHeader.css';

interface SettingsHeaderProps {
  i18n: Translations;

  currentTab?: 'settings' | 'plugins' | undefined;
  onSwitchTab?(tab: 'settings' | 'plugins'): void;
}

export const SettingsHeader = (props: SettingsHeaderProps) => {
  const { t } = props.i18n;

  return (
    <header className='settings-header-root'>
      <section className='settings-header-header-bottom'>
        {props.currentTab && props.onSwitchTab ? (
          <ul className='settings-header-header-tabs'>
            <li
              className={props.currentTab === 'settings' ? 'active' : undefined}
              onClick={() => {
                props.onSwitchTab && props.onSwitchTab('settings');
              }}
            >
              <button>{t['Project Settings']}</button>
            </li>
            <li
              className={props.currentTab === 'plugins' ? 'active' : undefined}
              onClick={() => {
                props.onSwitchTab && props.onSwitchTab('plugins');
              }}
            >
              <button>{t['Plugins']}</button>
            </li>
          </ul>
        ) : (
          <div className='settings-header-spacer' />
        )}
      </section>
    </header>
  );
};
