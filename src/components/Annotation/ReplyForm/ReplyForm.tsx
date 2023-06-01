import React, { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAnnotationStore, useAnnotatorUser } from '@annotorious/react';
import type { Annotation, AnnotationBody } from '@annotorious/react';

import './ReplyForm.css';

export interface ReplyFormProps {

  annotation: Annotation;

  beforeSubmit?(body: AnnotationBody): void;

}

export const ReplyForm = (props: ReplyFormProps) => {

  const textarea = useRef<HTMLTextAreaElement>(null);
  
  const user = useAnnotatorUser();

  const store = useAnnotationStore();

  const [showButtons, setShowButtons] = useState(false);

  const [submitDisabled, setSubmitDisabled] = useState(true);

  const onSubmit = (evt?: React.MouseEvent) => {
    evt?.preventDefault();

    if (textarea.current) {      
      const body: AnnotationBody = {
        id: uuidv4(),
        annotation: props.annotation.id,
        creator: { ...user },
        created: new Date(),
        purpose: 'commenting',
        value: textarea.current?.value || ''
      }

      textarea.current.value = '';

      props.beforeSubmit && props.beforeSubmit(body);

      store.addBody(body);
    }

    setShowButtons(false);
    setSubmitDisabled(true);
  }

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setSubmitDisabled(!value);
  }

  const onKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.ctrlKey && evt.key === 'Enter')
      onSubmit();
    else if (evt.key === 'Delete')
      evt.stopPropagation();
  }

  const onFocus = () => setShowButtons(true);

  const onBlur = () => setShowButtons(Boolean(textarea.current?.value));

  const onCancel = (evt: React.MouseEvent) => {
    evt.preventDefault();
  }

  return (
    <form className="reply-form no-drag">
      <textarea 
        ref={textarea}
        rows={1} 
        placeholder="Reply or add others with @" 
        onChange={onChange} 
        onKeyDownCapture={onKeyDown} 
        onFocus={onFocus} 
        onBlur={onBlur} />

      {showButtons && (
        <div className="buttons">
          <button 
            disabled={submitDisabled}
            className="sm primary" 
            onClick={onSubmit}>
              Comment
          </button>

          <button 
            className="sm"
            onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}
    </form>
  )

}