import type { ReactNode } from 'react';

import './Tag.css';

interface TagProps {

  children: ReactNode;

}

export const Tag = (props: TagProps) => {

  return (
    <span className="annotation-tag">
      {props.children}
    </span>
  )

}