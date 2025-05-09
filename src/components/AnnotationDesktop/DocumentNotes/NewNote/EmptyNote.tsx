import { useState } from 'react';
import type { Delta } from 'quill/core';
import type { PresentUser, User } from '@annotorious/react';
import { ArrowRight } from '@phosphor-icons/react';
import { QuillEditor, QuillEditorRoot, QuillEditorToolbar } from '@components/QuillEditor';
import type { Translations, VocabularyTerm } from 'src/Types';
import { AuthorAvatar } from '@components/Annotation/AuthorAvatar';
import { TagList } from './TagList';

interface EmptyNoteProps {

  i18n: Translations;

  isPrivate?: boolean;

  me: PresentUser | User;

  present: PresentUser[];

  tagVocabulary?: VocabularyTerm[];

  onCancel(): void;

  onSubmit(content: Delta, tags: VocabularyTerm[], isPrivate?: boolean): void;

}

export const EmptyNote = (props: EmptyNoteProps) => {

  const { t } = props.i18n;

  const [value, setValue] = useState<Delta | undefined>();

  const [tags, setTags] = useState<VocabularyTerm[]>([]);

  const onSave = () => {
    if (value) {
      props.onSubmit(value, tags, props.isPrivate);
    } else {
      props.onCancel();
    }
  }

  const onCreateTag = (tag: VocabularyTerm) => setTags(tags => ([...tags, tag]));

  const onDeleteTag = (tag: VocabularyTerm) => setTags(tags => tags.filter(t => t !== tag));

  const className = [
    'annotation note empty',
    props.isPrivate ? 'private' : undefined
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <QuillEditorRoot>
        <div className="annotation-header">
          <div className="annotation-header-left">
            <AuthorAvatar
              author={props.me}
              isPrivate={props.isPrivate} />
          </div>

          <div className="annotation-toolbar-wrapper">
            <QuillEditorToolbar
              i18n={props.i18n} />
          </div>
        </div>
        
        <div className="annotation-comment-wrapper">
          <QuillEditor 
            autoFocus
            i18n={props.i18n}
            value={value}
            onChange={setValue}
            placeholder={t['Add a comment']} />
        </div>

        <div className="annotation-footer">
          <div className="annotation-footer-left">
            <TagList 
              i18n={props.i18n}
              tags={tags}
              vocabulary={props.tagVocabulary}
              onCreateTag={onCreateTag}  
              onDeleteTag={onDeleteTag} />
          </div>

          <button 
            className="save save-arrow annotation-footer-right"
            onClick={onSave}>
            <ArrowRight size={20} />
          </button>
        </div>
      </QuillEditorRoot>
    </div>
  )

}