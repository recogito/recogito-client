
import { useState } from 'react'; 
import { 
  GooglePodcastsLogo, 
  GraduationCap, 
  House, 
  PuzzlePiece, 
  Sliders, 
  UserCircle, 
  UsersThree } from '@phosphor-icons/react';
import { NavItem } from './NavItem';
import type { Project, Translations } from 'src/Types';

import './ProjectSidebar.css';

export interface ProjectSidebarProps {

  active: string;

  i18n: Translations;

  lang: string;

  project?: Project

}

export const ProjectSidebar = (props: ProjectSidebarProps) => {

  const { active, i18n } = props;

  const [open, setOpen] = useState(true);

  const link = (segment: string = '') => props.project ? 
    `/${props.lang}/projects/${props.project.id}/${segment}` : undefined;

  return (
    <aside 
      
      className={open ? 'project-sidebar open' : 'project-sidebar collapsed'}>
      <nav className="project-primary-nav">
        <ul>
          <li>
            <ul>
              <NavItem 
                className="no-hover"
                icon={GooglePodcastsLogo}
                label="ViCo"
                link={`/${props.lang}/projects`} />

              <NavItem 
                active={active === 'home'}
                icon={House}
                label={i18n['Home']}
                link={link()} />
            </ul>

            <ul>
              <NavItem
                active={active === 'collaboration'}
                icon={UsersThree}
                label={i18n['Collaboration']}
                link={link('collaboration')} />

              <NavItem
                active={active === 'assignments'}
                icon={GraduationCap}
                label={i18n['Assignments']}
                link={link('assignments')} />

              <NavItem
                active={active === 'addons'}
                icon={PuzzlePiece}
                label={i18n['Add Ons']}
                link={link('addons')} />

              <NavItem
                active={active === 'settings'}
                icon={Sliders}
                label={i18n['Settings']}
                link={link('settings')} />
            </ul>
          </li>
        </ul>
      </nav>
      
      <div className="project-sidebar-spacer" />

      <section className="project-sidebar-actions project-sidebar-row">
        <ul>
          <li className="project-sidebar-row">
            <button>
              <span className="project-sidebar-col fixed">
                <UserCircle size={34} weight="light" />
              </span>

              <span className="project-sidebar-col collapsible">
                Rainer Simon
              </span>
            </button>
          </li>
        </ul>
      </section>
    </aside>
  )

}