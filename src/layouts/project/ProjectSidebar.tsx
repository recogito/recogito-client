
import { useEffect, useState } from 'react'; 
import { 
  ArrowLineLeft,
  Folders,
  GooglePodcastsLogo, 
  GraduationCap, 
  PuzzlePiece, 
  Sliders, 
  UsersThree
} from '@phosphor-icons/react';
import { AccountActions } from '@components/AccountActions';
import { Avatar } from '@components/Avatar';
import { NavItem } from './NavItem';
import type { 
  ExtendedProjectData, 
  MyProfile,
  Translations 
} from 'src/Types';

import './ProjectSidebar.css';

export interface ProjectSidebarProps {

  active: string;

  i18n: Translations;

  collapsed: boolean;

  project: ExtendedProjectData;

  me: MyProfile;

}

const setCookie = () => {
  const maxAge = 100 * 365 * 24 * 60 * 60; // 100 years, never expires
  document.cookie = `x-project-sidebar-collapsed=true; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
}

const clearCookie = () => {
  const expires = new Date(0).toUTCString();
  document.cookie = `x-project-sidebar-collapsed=false; path=/; expires=${expires}; SameSite=Lax; secure`;
}

export const ProjectSidebar = (props: ProjectSidebarProps) => {
  
  const { active, me } = props;

  const { lang, t } = props.i18n;

  // Find the admin group and check if I'm in there
  const isAdmin = props.project.groups.find(g => 
    g.name === 'Project Admins')?.members.some(m => m.user.id === me.id)

  const [open, setOpen] = useState(!props.collapsed);

  useEffect(() => {
    if (open)
      clearCookie();
    else 
      setCookie();
  }, [open]);

  const link = (segment: string = '') => props.project ? 
    `/${lang}/projects/${props.project.id}/${segment}` : undefined;

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
                label="Recogito"
                link={`/${lang}/projects`} />

              <NavItem 
                active={active === 'Documents'}
                icon={Folders}
                label={t['Documents']}
                link={link()} />

              {isAdmin && (
                <NavItem
                  active={active === 'Collaboration'}
                  icon={UsersThree}
                  label={t['Collaboration']}
                  link={link('collaboration')} />
              )}

              <NavItem
                active={active === 'Assignments'}
                icon={GraduationCap}
                label={t['Assignments']}
                link={link('assignments')} />

              <NavItem
                active={active === 'Add Ons'}
                icon={PuzzlePiece}
                label={t['Add Ons']}
                link={link('addons')} />
              
              {isAdmin && (
                <NavItem
                  active={active === 'Settings'}
                  icon={Sliders}
                  label={t['Settings']}
                  link={link('settings')} />
              )}
            </ul>
          </li>
        </ul>
      </nav>
      
      <div className="project-sidebar-spacer" />

      <section className="project-sidebar-actions">
        <ul>
          <li className="project-sidebar-toggle project-sidebar-row">
            <button onClick={() => setOpen(!open)}>
              <span className="project-sidebar-col fixed">
                <ArrowLineLeft size={20} />
              </span>
            </button>
          </li>
          <li className="project-sidebar-row">
            <AccountActions 
              i18n={props.i18n}
              align="start"
              alignOffset={5}
              profile={me}>

              <button>
                <span className="project-sidebar-col fixed">
                  <Avatar 
                    id={me.id} 
                    name={me.nickname} 
                    avatar={me.avatar_url} />
                </span>

                <span className="project-sidebar-col collapsible">
                  {props.me?.nickname || ''}
                </span>
              </button>
            </AccountActions>
          </li>
        </ul>
      </section>
    </aside>
  )

}