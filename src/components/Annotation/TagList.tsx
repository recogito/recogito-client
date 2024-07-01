import { X } from '@phosphor-icons/react';
import type { AnnotationBody } from '@annotorious/react';
import { TagEditor } from './TagEditor';
import type { Translations } from 'src/Types';

import './TagList.css';

interface TagListProps {

  tags: AnnotationBody[];

  i18n: Translations;

  isEditable?: boolean;

  vocabulary?: string[];

  onCreateTag(value: string): void;

  onDeleteTag(body: AnnotationBody): void;

}

export const TagList = (props: TagListProps) => {

  const onCreateTag = (value: string) => {
    // Don't create a tag that already exists
    const existing = props.tags.find(b => b.value === value);
    if (!existing)
      props.onCreateTag(value);
  }

  return (
    <ul className={props.isEditable ? 'taglist editable' : 'taglist'}>
      {props.tags.map(b => (
        <li key={b.id}>
          <Tag 
            tag={b} 
            isEditable={props.isEditable} 
            onDelete={() => props.onDeleteTag(b)} />
        </li>
      ))}

      {props.isEditable && (
        <TagEditor 
          i18n={props.i18n}
          vocabulary={props.vocabulary}
          onCreateTag={onCreateTag} />
      )}
    </ul>
  )

}

interface TagProps {

  isEditable?: boolean;

  tag: AnnotationBody;

  onDelete(): void;

}

export const Tag = (props: TagProps) => {

  return (
    <span className={props.isEditable ? 'tag editable' : 'tag'}>
      <span>{props.tag.value}</span>
      
      {props.isEditable && (
        <button onClick={props.onDelete}>
          <X />
        </button>
      )}
    </span>
  )

}