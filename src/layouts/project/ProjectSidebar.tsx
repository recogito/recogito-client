
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
import type { Project } from 'src/Types';

import './ProjectSidebar.css';

export interface ProjectSidebarProps {

  active: string;

  lang: string;

  project?: Project

}

export const ProjectSidebar = (props: ProjectSidebarProps) => {

  const { active } = props;

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
                label="Home"
                link={link()} />
            </ul>

            <ul>
              <NavItem
                active={active === 'collaboration'}
                icon={UsersThree}
                label="Collaboration"
                link={link('collaboration')} />

              <NavItem
                active={active === 'assignments'}
                icon={GraduationCap}
                label="Assignments"
                link={link('assignments')} />

              <NavItem
                active={active === 'addons'}
                icon={PuzzlePiece}
                label="Add Ons"
                link={link('addons')} />

              <NavItem
                active={active === 'settings'}
                icon={Sliders}
                label="Settings"
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