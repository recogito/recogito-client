import { X } from '@phosphor-icons/react';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { useExtensions } from '@recogito/studio-sdk';
import { ExtensionMount } from '@components/Plugins';
import { TagEditor } from './TagEditor';
import type { VocabularyTerm } from 'src/Types';

import './TagList.css';

interface TagListProps {
  annotation: SupabaseAnnotation;

  isEditable?: boolean;

  me: PresentUser | User;
  
  tags: AnnotationBody[];

  vocabulary?: VocabularyTerm[];

  onCreateTag(value: VocabularyTerm): void;

  onDeleteTag(body: AnnotationBody): void;

  onUpdateAnnotation(updated: SupabaseAnnotation): void;
}

export const TagList = (props: TagListProps) => {

  const extensions = useExtensions('annotation:*:taglist');

  const onCreateTag = (value: VocabularyTerm) => {
    // Don't create a tag that already exists
    const existing = props.tags.find(b => b.value === value.label);
    if (!existing) {
      props.onCreateTag(value);
    }
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
        <div className='taglist-editor-wrapper'>
          <TagEditor 
            vocabulary={props.vocabulary}
            onCreateTag={onCreateTag} />

          {extensions.map(({ extension, config }) => (
            <ExtensionMount
              key={extension.name}
              extension={extension}
              pluginConfig={config}
              me={props.me}
              annotation={props.annotation}
              onUpdateAnnotation={props.onUpdateAnnotation}
            />
          ))}
        </div>
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

  // Bit of a hack
  const tag = props.tag.value?.startsWith('{') ? JSON.parse(props.tag.value) : { label: props.tag.value };

  return (
    <span className={props.isEditable ? 'tag editable' : 'tag'}>
      <span>{tag.label}</span>
      
      {props.isEditable && (
        <button onClick={props.onDelete}>
          <X />
        </button>
      )}
    </span>
  )

}