import { KeyboardEvent, useState } from 'react';
import { Check, Tag as TagIcon, X } from '@phosphor-icons/react';
import type { Annotation, AnnotationBody, PresentUser, User } from '@annotorious/react';
import { v4 as uuidv4 } from 'uuid';
import { AutosizeInput } from '../AutosizeInput';
import type { Translations } from 'src/Types';

import './TagEditor.css';

interface TagEditorProps {

  annotation: Annotation;

  i18n: Translations;

  me: PresentUser | User;

  vocabulary?: string[];

  onCreate(tag: AnnotationBody): void;

}

export const TagEditor = (props: TagEditorProps) => {

  const [editing, setEditing] = useState(false);

  const [value, setValue] = useState('');

  const onSave = () => {
    const tag: AnnotationBody = {
      id: uuidv4(),
      annotation: props.annotation.id,
      creator: {  
        id: props.me.id,
        name: props.me.name,
        avatar: props.me.avatar
      },
      created: new Date(),
      purpose: 'tagging',
      value
    };

    props.onCreate(tag);
  }

  const onCancel = () => {
    setValue('');
    setEditing(false);
  }

  const onKeyDown = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter')
      onSave();
  }

  return editing ? (
    <div className="tag-editor">
      <AutosizeInput
        autoFocus
        value={value}
        onChange={evt => setValue(evt.target.value)} 
        onKeyDown={onKeyDown} />

      <div className="tag-editor-actions">
        <button
          className="unstyled"
          onClick={onCancel}>
          <X size={16} />
        </button>

        <button
          className="unstyled"
          onClick={onSave}>
          <Check size={16} />
        </button>
      </div>
    </div>
  ) : (
    <button 
      className="tag-editor-trigger"
      onClick={() => setEditing(true)}>
      <TagIcon size={12} /> <span>Add a Tag</span>
    </button>
  )

}