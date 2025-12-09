import { X } from '@phosphor-icons/react';
import type { VocabularyTerm } from 'src/Types';
import { TagEditor } from '@components/Annotation/TagEditor';

interface TagListProps {

  tags: VocabularyTerm[];

  vocabulary?: VocabularyTerm[];

  onCreateTag(value: VocabularyTerm): void;

  onDeleteTag(value: VocabularyTerm): void;

}

export const TagList = (props: TagListProps) => {

  const onCreateTag = (value: VocabularyTerm) => {
    // Don't create a tag that already exists
    const existing = props.tags.find(tag => tag === value);
    if (!existing)
      props.onCreateTag(value);
  }

  return (
    <ul className="taglist editable">
      {props.tags.map(tag => (
        <li key={tag.id || tag.label}>
          <Tag 
            value={tag} 
            onDelete={() => props.onDeleteTag(tag)} />
        </li>
      ))}

      <TagEditor 
        vocabulary={props.vocabulary}
        onCreateTag={onCreateTag} />
    </ul>
  )

}

interface TagProps {

  value: VocabularyTerm;

  onDelete(): void;

}

export const Tag = (props: TagProps) => {

  return (
    <span className="tag editable">
      <span>{props.value.label}</span>
      
      <button onClick={props.onDelete}>
        <X />
      </button>
    </span>
  )

}