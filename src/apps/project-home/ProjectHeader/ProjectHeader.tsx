import type { Translations } from "src/Types";
import { Users, Gear } from "@phosphor-icons/react";

import './ProjectHeader.css'

interface ProjectHeaderProps {
  name: string;
  description: string;
  isAdmin: boolean;
  i18n: Translations;

  currentTab?: 'assignments' | 'documents' | undefined;
  onSwitchTab?(tab: 'assignments' | 'documents'): void;
  onGotoUsers?(): void;
  onGotoSettings?(): void;
}

export const ProjectHeader = (props: ProjectHeaderProps) => {

  const { t } = props.i18n;

  return (
    <header className="project-header-root">
      <div className="project-header-name-bar">
        <h1>
          {props.name}
        </h1>
        {props.isAdmin &&
          <div className="project-header-button-bar">
            <button className="project-header-button" onClick={props.onGotoUsers}>
              <Users color="black" size={20} />
              <div className="project-header-button-text">
                {t['Team']}
              </div>
            </button>
            <button className="project-header-button" onClick={props.onGotoSettings}>
              <Gear color="black" size={20} />
              <div className="project-header-button-text">
                {t['Settings']}
              </div>
            </button>
          </div>
        }
      </div>
      <div className="project-header-description-bar">
        {props.description}
      </div>
      <section className='project-header-header-bottom'>
        {props.currentTab && props.onSwitchTab ?
          <ul className='project-header-header-tabs'>
            <li
              className={props.currentTab === 'documents' ? 'active' : undefined}
              onClick={() => {
                props.onSwitchTab && props.onSwitchTab('documents');
              }}
            >
              <button>{t['Documents']}</button>
            </li>
            <li
              className={props.currentTab === 'assignments' ? 'active' : undefined}
              onClick={() => {
                props.onSwitchTab && props.onSwitchTab('assignments');
              }}
            >
              <button>{t['Assignments']}</button>
            </li>
          </ul>
          :
          <div className="project-header-spacer" />
        }
      </section>
    </header>
  );
}