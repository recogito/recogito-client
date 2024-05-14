import { KeyboardEvent, useState } from 'react';
import { Check, Tag as TagIcon, X } from '@phosphor-icons/react';
import type { PresentUser, User } from '@annotorious/react';
import type { Translations } from 'src/Types';

import './TagEditor.css';
import { Autosuggest } from '@components/Autosuggest';

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

  const onSubmit = (value: string) => {
    props.onCreateTag(value);
    setValue('');
    setEditing(false);
  }

  const onSave = () => {
    props.onCreateTag(value);

    setValue('');
    setEditing(false);
  }

  const onCancel = () => {
    setValue('');
    setEditing(false);
  }

  return editing ? (
    <div className="tag-editor">
      <Autosuggest
        autoFocus
        autoSize
        value={value}
        onChange={setValue} 
        onSubmit={onSubmit}
        vocabulary={props.vocabulary} />

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