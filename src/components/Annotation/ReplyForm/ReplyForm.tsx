import React, { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ArrowRight, Detective } from '@phosphor-icons/react';
import TextareaAutosize from 'react-textarea-autosize';
import { Visibility, useAnnotationStore, useAnnotatorUser } from '@annotorious/react';
import type { Annotation, AnnotationBody, PresentUser, User } from '@annotorious/react';
import { Avatar } from '../../Avatar';

import './ReplyForm.css';

export interface ReplyFormProps {

  annotation: Annotation;

  autofocus?: boolean;

  placeholder: string;

  me: PresentUser | User;

  beforeSubmit?(body: AnnotationBody): void;

  onSubmit?(body: AnnotationBody): void;

}

export const ReplyForm = (props: ReplyFormProps) => {

  const { me } = props;

  const textarea = useRef<HTMLTextAreaElement>(null);
  
  const store = useAnnotationStore();

  const isPublic = props.annotation.visibility !== Visibility.PRIVATE;

  useEffect(() => {
    if (textarea.current && props.autofocus) {
      textarea.current.focus({ preventScroll: true });
    }
  }, [props.autofocus]);

  const onSubmit = (evt?: React.MouseEvent) => {
    evt?.preventDefault();

    if (textarea.current?.value) {      
      const body: AnnotationBody = {
        id: uuidv4(),
        annotation: props.annotation.id,
        creator: {  
          id: me.id,
          name: me.name,
          avatar: me.avatar
        },
        created: new Date(),
        purpose: 'commenting',
        value: textarea.current.value
      };

      textarea.current.value = '';

      props.beforeSubmit && props.beforeSubmit(body);

      store.addBody(body);

      props.onSubmit && props.onSubmit(body);
    }
  }

  const onKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.ctrlKey && evt.key === 'Enter')
      onSubmit();
    else if (evt.key === 'Delete')
      evt.stopPropagation();
  }

  return (
    <form 
      className="annotation-reply-form no-drag">
      {isPublic ? (
        <Avatar 
          id={me.id} 
          name={me.name || (me as PresentUser).appearance?.label}
          avatar={me.avatar || (me as PresentUser).appearance?.avatar} />
      ) : (
        <Detective className="anonymous" size={20} weight="light" />  
      )}

      <TextareaAutosize 
        ref={textarea}
        rows={1} 
        maxRows={10}
        placeholder={props.placeholder}
        onKeyDownCapture={onKeyDown} />

      <button 
        className="send icon-only"
        onClick={onSubmit}>
        <ArrowRight size={18} />
      </button>
    </form>
  )

}