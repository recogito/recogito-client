import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ArrowRight } from '@phosphor-icons/react';
import { Delta } from 'quill/core';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { SupabaseAnnotation, SupabaseAnnotationBody } from '@recogito/annotorious-supabase';
import { QuillEditor, QuillEditorRoot, QuillEditorToolbar } from '@components/QuillEditor';
import type { Translations } from 'src/Types';

import './ReplyField.css';
import { AuthorAvatar } from './AuthorAvatar';

interface ReplyFieldProps {

  i18n: Translations;

  isPrivate?: boolean;

  annotation: SupabaseAnnotation;

  autofocus?: boolean;

  scrollIntoView?: boolean;

  placeholder: string;

  me: PresentUser | User;

  beforeSubmit?(body: AnnotationBody): void;

  onSubmit(body: AnnotationBody): void;

}

export const ReplyField = (props: ReplyFieldProps) => {

  const [value, setValue] = useState<Delta>(new Delta());

  const onSave = () => {
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

    setValue(new Delta());

    props.beforeSubmit && props.beforeSubmit(body);
    props.onSubmit && props.onSubmit(body);
  }

  return (
    <div className="reply-field">
      <QuillEditorRoot>
        <div className="annotation-header">
          <AuthorAvatar 
            author={props.me}
            isPrivate={props.isPrivate} />

          <div className="annotation-toolbar-wrapper">
            <QuillEditorToolbar />
          </div>
        </div>

        <div className="reply-field-wrapper">
          <QuillEditor 
            placeholder={props.placeholder} 
            value={value} 
            onChange={setValue} />

          <button 
            className="save save-arrow"
            onClick={onSave}>
            <ArrowRight size={20} />
          </button>
        </div>
      </QuillEditorRoot>
    </div>
  )

}