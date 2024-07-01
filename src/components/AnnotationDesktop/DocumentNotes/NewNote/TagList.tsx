import { X } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';
import { TagEditor } from '@components/Annotation/TagEditor';

interface TagListProps {

  tags: string[];

  i18n: Translations;

  vocabulary?: string[];

  onCreateTag(value: string): void;

  onDeleteTag(value: string): void;

}

export const TagList = (props: TagListProps) => {

  const onCreateTag = (value: string) => {
    // Don't create a tag that already exists
    const existing = props.tags.find(tag => tag === value);
    if (!existing)
      props.onCreateTag(value);
  }

  return (
    <ul className="taglist editable">
      {props.tags.map(tag => (
        <li key={tag}>
          <Tag 
            value={tag} 
            onDelete={() => props.onDeleteTag(tag)} />
        </li>
      ))}

      <TagEditor 
        i18n={props.i18n}
        vocabulary={props.vocabulary}
        onCreateTag={onCreateTag} />
    </ul>
  )

}

interface TagProps {

  value: string;

  onDelete(): void;

}

export const Tag = (props: TagProps) => {

  return (
    <span className="tag editable">
      <span>{props.value}</span>
      
      <button onClick={props.onDelete}>
        <X />
      </button>
    </span>
  )

}