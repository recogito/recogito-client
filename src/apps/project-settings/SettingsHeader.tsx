import { useTranslation } from 'react-i18next';

import './SettingsHeader.css';

interface SettingsHeaderProps {

  currentTab?: 'settings' | 'plugins' | 'tagging' | undefined;
  onSwitchTab?(tab: 'settings' | 'plugins' | 'tagging'): void;
}

export const SettingsHeader = (props: SettingsHeaderProps) => {
  const { t } = useTranslation(['project-settings']);

  return (
    <header className='settings-header-root'>
      <section className='settings-header-header-bottom'>
        {props.currentTab && props.onSwitchTab ? (
          <ul className='settings-header-header-tabs'>
            <li
              className={props.currentTab === 'settings' ? 'active' : undefined}
              onClick={() => props.onSwitchTab?.('settings')}
            >
              <button>{t('Project Settings', { ns: 'project-settings' })}</button>
            </li>
            <li
              className={props.currentTab === 'tagging' ? 'active' : undefined}
              onClick={() => props.onSwitchTab?.('tagging')}
            >
              <button>{t('Tagging', { ns: 'project-settings' })}</button>
            </li>
            <li
              className={props.currentTab === 'plugins' ? 'active' : undefined}
              onClick={() => props.onSwitchTab?.('plugins')}
            >
              <button>{t('Plugins', { ns: 'project-settings' })}</button>
            </li>
          </ul>
        ) : (
          <div className='settings-header-spacer' />
        )}
      </section>
    </header>
  );
};
