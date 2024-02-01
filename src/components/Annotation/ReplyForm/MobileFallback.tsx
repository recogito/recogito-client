import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Annotation, AnnotationBody, PresentUser, User } from '@annotorious/react';
import { v4 as uuidv4 } from 'uuid';
import { X } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

import './MobileFallback.css';

interface MobileFallbackProps {

  i18n: Translations;

  annotation: Annotation;

  placeholder: string;

  me: PresentUser | User;

  beforeSubmit?(body: AnnotationBody): void;

  onSubmit(body: AnnotationBody): void;

  onClose(): void;

}

export const MobileFallback = (props: MobileFallbackProps) => {

  const { me } = props;

  const [value, setValue] = useState('');

  const [height, setHeight] = useState('100%');

  useEffect(() => {

      // const h = window.visualViewport?.height;
      // if (h) setHeight(`${h}px`);

      
    // window.visualViewport?.addEventListener('resize', onResize);
  
    // return () => {
      // window.visualViewport?.removeEventListener('resize', onResize);
    //}
  }, []);

  const onSave = () => {
    if (value) {
      const body = {
        id: uuidv4(),
        annotation: props.annotation.id,
        creator: {
          id: me.id,
          name: me.name,
          avatar: me.avatar,
        },
        created: new Date(),
        purpose: 'commenting',
        value: JSON.stringify({ ops: [{ insert: value }]}),
        format: 'Quill'
      };

      setValue('');

      props.beforeSubmit && props.beforeSubmit(body);
      props.onSubmit && props.onSubmit(body);

      props.onClose();
    }
  }

  return createPortal(
    <div className="mobile-reply-form not-annotatable" style={{ height }}>
      <div className="mobile-reply-form-close">
        <button 
          className="unstyled icon-only"
          onClick={props.onClose}>
          <X/>
        </button>
      </div>

      <textarea
        autoFocus
        value={value}
        onChange={evt => setValue(evt.target.value)} />

      <div className="mobile-reply-form-footer">
        <button 
          className="primary"
          onClick={onSave}>Save</button>

        <button 
          onClick={props.onClose}>Cancel</button>
      </div>
    </div>,
    
    document.body
  )

}