import { useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { v4 as uuidv4 } from 'uuid';
import type { Delta } from 'quill/core';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import { Visibility, type SupabaseAnnotation, type SupabaseAnnotationBody } from '@recogito/annotorious-supabase';
import { QuillEditor, QuillEditorRoot, QuillEditorToolbar } from '@components/QuillEditor';
import { useExtensions, ExtensionMount } from '@components/Plugins';
import { AuthorAvatar } from './AuthorAvatar';
import { AuthorDetails } from './AuthorDetails';
import { TagList } from './TagList';
import type { Translations, VocabularyTerm } from 'src/Types';

import './EmptyAnnotation.css';

interface EmptyAnnotationProps {

  annotation: SupabaseAnnotation;
  
  autoFocus?: boolean;

  i18n: Translations;

  isNote?: boolean;

  isSelected?: boolean;

  me: PresentUser | User;

  present: PresentUser[];

  tagVocabulary?: VocabularyTerm[];

  onBulkDeleteBodies(bodies: AnnotationBody[]): void;

  onCreateBody(body: AnnotationBody): void;

  onDeleteBody(body: AnnotationBody): void;

  onDeleteAnnotation(): void;

  onMakePublic(): void;

  onSubmit(): void;

  onUpdateAnnotation(updated: SupabaseAnnotation): void;

  onUpdateBody(oldValue: AnnotationBody, newValue: AnnotationBody): void;

}

export const EmptyAnnotation = (props: EmptyAnnotationProps) => {

  const { t } = props.i18n;

  const { target } = props.annotation;

  const extensions = useExtensions('annotation.*.annotation-editor');

  const creator: PresentUser | User | undefined = 
    props.present.find(p => p.id === target?.creator?.id) || target?.creator;

  const isMine = creator?.id === props.me.id;

  const [value, setValue] = useState<Delta | undefined>();

  const tags = props.annotation.bodies.filter(b => b.purpose === 'tagging');

  const onSave = () => {
    if (value) {
      const body: SupabaseAnnotationBody = {
        id: uuidv4(),
        annotation: props.annotation.id,
        creator: {
          id: props.me.id,
          name: props.me.name,
          avatar: props.me.avatar,
        },
        created: new Date(),
        purpose: 'commenting',
        format: 'Quill',
        value: JSON.stringify(value)
      };

      setValue(undefined);

      props.onCreateBody(body);
    }

    props.onSubmit();
  }

  const onCreateTag = (value: VocabularyTerm) => {
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
      value: value.id ? JSON.stringify(value) : value.label
    };

    props.onCreateBody && props.onCreateBody(tag);
  }

  const isPrivate = props.annotation.visibility === Visibility.PRIVATE;

  const className = [
    'annotation empty',
    props.isSelected ? 'selected' : undefined,
    props.isNote ? 'note' : undefined,
    isPrivate ? 'private' : undefined
  ].filter(Boolean).join(' ');

  return isMine ? (
    <div className={className}>
      <QuillEditorRoot>
        <div className="annotation-header">
          <div className="annotation-header-left">
            <AuthorAvatar
              author={props.me}
              isPrivate={isPrivate} />
          </div>

          <div className="annotation-toolbar-wrapper">
            <QuillEditorToolbar
              i18n={props.i18n} />
          </div>
        </div>
        
        <div className="annotation-comment-wrapper">
          <QuillEditor 
            autoFocus={props.autoFocus}
            i18n={props.i18n}
            value={value}
            onChange={setValue}
            placeholder={t['Add a comment']} />
        </div>

        <div className="annotation-footer">
          <div className="annotation-footer-left">
            <TagList 
              isEditable
              i18n={props.i18n}
              tags={tags}
              vocabulary={props.tagVocabulary}
              onCreateTag={onCreateTag}  
              onDeleteTag={props.onDeleteBody} />
          </div>

          <button 
            className="save save-arrow annotation-footer-right"
            onClick={onSave}>
            <ArrowRight size={20} />
          </button>
        </div>
      </QuillEditorRoot>

      {extensions.map(({ extension, config }) => (
        <ExtensionMount
          key={extension.name}
          extension={extension}
          pluginConfig={config}
          me={props.me}
          annotation={props.annotation} 
          onUpdateAnnotation={props.onUpdateAnnotation} />
      ))}
    </div>
  ) : (
    <div className={`${className} typing`}>
      <div className="annotation-header">
        <div className="annotation-header-left">
          <AuthorAvatar 
            author={creator}
            isPrivate={isPrivate} />

          <div>
            <AuthorDetails 
              i18n={props.i18n}
              isPrivate={isPrivate} 
              creator={creator} />

            <div className="typing-animation">
              <div />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}