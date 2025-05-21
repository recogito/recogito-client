import { useState } from 'react';
import { Check, Tag as TagIcon, X } from '@phosphor-icons/react';
import { Autosuggest } from '@components/Autosuggest';
import type { Translations, VocabularyTerm } from 'src/Types';

import './TagEditor.css';

interface TagEditorProps {

  i18n: Translations;

  vocabulary?: VocabularyTerm[];

  onCreateTag(tag: VocabularyTerm): void;

}

export const TagEditor = (props: TagEditorProps) => {

  const { t } = props.i18n;

  const [editing, setEditing] = useState(false);

  const [value, setValue] = useState<VocabularyTerm | undefined>();

  const onSubmit = (value: VocabularyTerm) => {
    props.onCreateTag(value);
    setValue(undefined);
    setEditing(false);
  };

  const onSave = () => {
    if (value) props.onCreateTag(value);

    setValue(undefined);
    setEditing(false);
  };

  const onCancel = () => {
    setValue(undefined);
    setEditing(false);
  };

  return editing ? (
    <div className='tag-editor'>
      <Autosuggest
        autoFocus
        autoSize
        openOnFocus
        value={value}
        onChange={setValue}
        onSubmit={onSubmit}
        vocabulary={props.vocabulary}
      />

      <div className='tag-editor-actions'>
        <button className='unstyled' onClick={onCancel}>
          <X size={16} aria-label={t['cancel adding tag']} />
        </button>

        <button
          className='unstyled'
          onClick={onSave}
          aria-label={t['save tag']}
        >
          <Check size={16} />
        </button>
      </div>
    </div>
  ) : (
    <button className='tag-editor-trigger' onClick={() => setEditing(true)}>
      <TagIcon size={12} /> <span>{t['Add a tag']}</span>
    </button>
  );
};
