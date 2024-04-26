import { X } from '@phosphor-icons/react';

import './TagList.css';

interface TagListProps {

  isEditable?: boolean;

  tags: string[];

}

export const TagList = (props: TagListProps) => {

  return (
    <ul className={props.isEditable ? 'taglist editable' : 'taglist'}>
      {props.tags.map(t => (
        <li key={t}>
          <Tag value={t} isEditable={props.isEditable} />
        </li>
      ))}
    </ul>
  )

}

interface TagProps {

  isEditable?: boolean;

  value: string;

}

export const Tag = (props: TagProps) => {

  return (
    <span className={props.isEditable ? 'tag editable' : 'tag'}>
      <span>{props.value}</span>
      
      {props.isEditable && (
        <button>
          <X />
        </button>
      )}
    </span>
  )

}