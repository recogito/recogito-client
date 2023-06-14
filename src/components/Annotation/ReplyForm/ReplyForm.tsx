import React, { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ArrowRight } from '@phosphor-icons/react';
import TextareaAutosize from 'react-textarea-autosize';
import { useAnnotationStore, useAnnotatorUser } from '@annotorious/react';
import type { Annotation, AnnotationBody, PresentUser, User } from '@annotorious/react';
import { Avatar } from '../../Avatar';

import './ReplyForm.css';

export interface ReplyFormProps {

  annotation: Annotation;

  present: PresentUser[];

  beforeSubmit?(body: AnnotationBody): void;

}

export const ReplyForm = (props: ReplyFormProps) => {

  const user = useAnnotatorUser();

  const me: PresentUser | User = props.present.find(p => p.id === user.id) || user;

  const textarea = useRef<HTMLTextAreaElement>(null);
  
  const store = useAnnotationStore();

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
    }
  }

  const onKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.ctrlKey && evt.key === 'Enter')
      onSubmit();
    else if (evt.key === 'Delete')
      evt.stopPropagation();
  }

  return (
    <form className="annotation-reply-form no-drag">
      <Avatar 
        id={me.id} 
        name={me.name} 
        avatar={me.avatar} />

      <TextareaAutosize 
        ref={textarea}
        rows={1} 
        maxRows={10}
        placeholder="Reply..." 
        onKeyDownCapture={onKeyDown} />

      <button 
        className="send"
        onClick={onSubmit}>
        <ArrowRight size={18} />
      </button>
    </form>
  )

}