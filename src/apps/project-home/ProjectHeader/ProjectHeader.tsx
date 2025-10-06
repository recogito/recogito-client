import type { JoinRequest, Translations } from 'src/Types';
import { Users, Gear, Lock } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

import './ProjectHeader.css';

interface ProjectHeaderProps {
  name: string;
  description: string;
  isAdmin: boolean;
  i18n: Translations;
  showTabs: boolean;
  isOpenJoin: boolean;
  isLocked?: boolean;

  requests: JoinRequest[];

  currentTab?: 'assignments' | 'documents' | undefined;
  onSwitchTab?(tab: 'assignments' | 'documents'): void;
  onGotoUsers?(): void;
  onGotoSettings?(): void;
}

export const ProjectHeader = (props: ProjectHeaderProps) => {
  const { t } = props.i18n;

  const [expanded, setExpanded] = useState(false);
  const [showExpand, setShowExpand] = useState(false);

  useEffect(() => {
    const desc = document.getElementById('project-description');
    const isTextClamped = desc ? desc.scrollHeight > desc.clientHeight : false;

    if (!expanded) {
      if (isTextClamped) {
        setShowExpand(true);
      }
    }
  }, [expanded]);

  const requestCount = props.requests.filter((r) => !r.ignored).length;

  return (
    <header className='project-header-root'>
      <div className='project-header-name-bar'>
        <div className='project-header-title'>
          <h1>{props.name}</h1>
          {props.isLocked && (
            <div className='project-header-locked'>
              <Lock size={16} />
              <div className='text-body-small'>{t['Locked']}</div>
            </div>
          )}
        </div>
        {props.isAdmin && (
          <div className='project-header-button-bar'>
            <button
              className='project-header-button'
              onClick={props.onGotoUsers}
            >
              <Users color='black' size={20} />
              <div className='project-header-button-text'>{t['Users']}</div>
              {Boolean(requestCount > 0) && !props.isOpenJoin && (
                <div className='project-header-pip'>{requestCount}</div>
              )}
            </button>
            <button
              className='project-header-button'
              onClick={props.onGotoSettings}
            >
              <Gear color='black' size={20} />
              <div className='project-header-button-text'>{t['Settings']}</div>
            </button>
          </div>
        )}
      </div>
      <div
        id='project-description'
        className={
          expanded
            ? 'project-header-description-bar expanded'
            : 'project-header-description-bar collapsed'
        }
      >
        {props.description}
        {showExpand &&
          (expanded ? (
            <button
              className='show-button'
              onClick={() => setExpanded(!expanded)}
            >
              {t['Show Less']}
            </button>
          ) : (
            <button
              className='show-button'
              onClick={() => setExpanded(!expanded)}
            >
              {t['Show More']}
            </button>
          ))}
      </div>

      <section className='project-header-header-bottom'>
        {props.showTabs && props.currentTab && props.onSwitchTab ? (
          <ul className='project-header-header-tabs'>
            <li
              className={
                props.currentTab === 'documents' ? 'active' : undefined
              }
              onClick={() => props.onSwitchTab?.('documents')}
            >
              <button aria-label={t['documents view']}>{t['Documents']}</button>
            </li>
            <li
              className={
                props.currentTab === 'assignments' ? 'active' : undefined
              }
              onClick={() => props.onSwitchTab?.('assignments')}
            >
              <button aria-label={t['assignments view']}>
                {t['Assignments']}
              </button>
            </li>
          </ul>
        ) : (
          <div className='project-header-spacer' />
        )}
      </section>
    </header>
  );
};
