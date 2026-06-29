import { useState } from 'react';
import { CheckIcon, TagIcon, XIcon } from '@phosphor-icons/react';
import { Autosuggest } from '@recogito/studio-sdk/components';
import type { VocabularyTerm } from 'src/Types';
import { useTranslation } from 'react-i18next';

import '@components/Autosuggest/Autosuggest.css';
import './TagEditor.css';

interface TagEditorProps {

  vocabulary?: VocabularyTerm[];

  onCreateTag(tag: VocabularyTerm): void;

}

export const TagEditor = (props: TagEditorProps) => {

  const { t } = useTranslation(['a11y', 'annotation-common']);

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
          <XIcon size={16} aria-label={t('cancel adding tag', { ns: 'a11y' })} />
        </button>

        <button
          className='unstyled'
          onClick={onSave}
          aria-label={t('save tag', { ns: 'a11y' })}
        >
          <CheckIcon size={16} />
        </button>
      </div>
    </div>
  ) : (
    <button className='tag-editor-trigger' onClick={() => setEditing(true)}>
      <TagIcon size={12} /> <span>{t('Add a tag', { ns: 'annotation-common' })}</span>
    </button>
  );
};
