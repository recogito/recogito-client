import { useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { v4 as uuidv4 } from 'uuid';
import type { Delta } from 'quill/core';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import { Visibility, type SupabaseAnnotation, type SupabaseAnnotationBody } from '@recogito/annotorious-supabase';
import { QuillEditor, QuillEditorRoot, QuillEditorToolbar } from '@components/QuillEditor';

import './EmptyAnnotation.css';
import { AuthorAvatar } from './AuthorAvatar';

interface EmptyAnnotationProps {

  annotation: SupabaseAnnotation;

  isNote?: boolean;

  me: PresentUser | User;

  onCreateBody(body: AnnotationBody): void;

}

export const EmptyAnnotation = (props: EmptyAnnotationProps) => {

  const [value, setValue] = useState<Delta | undefined>();

  const onSave = () => {
    if (value) {
      const [format, stringified] = typeof value === 'string'  
        ? ['TextPlain', value as unknown as string]
        : ['Quill', JSON.stringify(value)];

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
        format,
        value: stringified
      };

      setValue(undefined);

      props.onCreateBody && props.onCreateBody(body);
    }
  };

  const isPrivate = props.annotation.visibility === Visibility.PRIVATE;

  const className = [
    'annotation empty',
    props.isNote ? 'note' : undefined,
    isPrivate ? 'private' : undefined
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <QuillEditorRoot>
        <div className="annotation-header">
          <div className="annotation-header-left">
            <AuthorAvatar
              author={props.me}
              isPrivate={isPrivate} />
          </div>

          <div className="annotation-toolbar-wrapper">
            <QuillEditorToolbar />
          </div>
        </div>
        
        <div className="annotation-comment-wrapper">
          <QuillEditor 
            value={value}
            onChange={setValue}
            placeholder="Add a comment" />
        </div>

        <div className="annotation-footer">
          {/* <AddTag 
            onAddTag={() => {}}
            onCancel={() => {}} /> */}

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