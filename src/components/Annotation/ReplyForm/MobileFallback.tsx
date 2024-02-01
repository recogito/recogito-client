import { useState } from 'react';
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

}

export const MobileFallback = (props: MobileFallbackProps) => {

  const { me } = props;

  const [value, setValue] = useState('');

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
    }
  }

  return createPortal(
    <div className="mobile-reply-form not-annotatable">
      <div className="mobile-reply-form-close">
        <button><X /></button>
      </div>

      <textarea
        autoFocus
        value={value}
        onChange={evt => setValue(evt.target.value)} />

      <div className="mobile-reply-form-footer">
        <button onClick={onSave}>Save</button>
        <button>Cancel</button>
      </div>
    </div>,
    
    document.body
  )

}