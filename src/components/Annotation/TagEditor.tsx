import { KeyboardEvent, useState } from 'react';
import { Check, Tag as TagIcon, X } from '@phosphor-icons/react';
import type { PresentUser, User } from '@annotorious/react';
import { AutosizeInput } from '../AutosizeInput';
import type { Translations } from 'src/Types';

import './TagEditor.css';

interface TagEditorProps {

  i18n: Translations;

  me: PresentUser | User;

  vocabulary?: string[];

  onCreateTag(tag: string): void;

}

export const TagEditor = (props: TagEditorProps) => {

  const { t } = props.i18n;

  const [editing, setEditing] = useState(false);

  const [value, setValue] = useState('');

  const onSave = () => {
    props.onCreateTag(value);

    setValue('');
    setEditing(false);
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
      <TagIcon size={12} /> <span>{t['Add a tag']}</span>
    </button>
  )

}