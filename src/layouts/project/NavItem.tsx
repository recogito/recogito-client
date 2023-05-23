import React from 'react';
import type { Icon } from "@phosphor-icons/react";

export interface NavItemProps {

  active?: boolean;

  className?: string;

  icon: Icon;

  label: string;

  link?: string;

}

export const NavItem = (props: NavItemProps) => {
  const cls = props.active ? 'project-sidebar-row active' : 'project-sidebar-row';

  return (
    <li className={props.className ? `${cls} ${props.className}` : cls}>
      <a href={props.link}>
        <span className="project-sidebar-col fixed">
          {React.createElement(props.icon, { size: 21 })}
        </span>

        <span className="project-sidebar-col collapsible">
          {props.label}
        </span>
      </a>
    </li>
  )
}
