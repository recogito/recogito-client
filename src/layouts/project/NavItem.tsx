import type { ReactNode } from 'react';

export interface NavItemProps {

  active?: boolean;

  className?: string;

  icon: ReactNode;

  label: string;

  link?: string;

  tabIndex?: number;

}

export const NavItem = (props: NavItemProps) => {
  const cls = props.active ? 'project-sidebar-row active' : 'project-sidebar-row';

  return (
    <li
      tabIndex={props.tabIndex}
      className={props.className ? `${cls} ${props.className}` : cls}>
      <a href={props.link}>
        <span className="project-sidebar-col fixed">
          {props.icon}
        </span>

        <span className="project-sidebar-col collapsible">
          {props.label}
        </span>
      </a>
    </li>
  )
}
