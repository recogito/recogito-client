import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DeltaStatic } from 'quill';
import { X } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

import './MobileTextarea.css';

interface MobileTextareaProps {

  i18n: Translations;

  value: string | DeltaStatic | undefined;

  placeholder?: string;

  onSave(value?: string | DeltaStatic): void;

  onCancel(): void;

}

export const MobileTextarea = (props: MobileTextareaProps) => {

  const [value, setValue] = useState(props.value);

  const [height, setHeight] = useState('100%');

  useEffect(() => {
    document.body.style.touchAction = 'none';

    const onResize = () => {
      const h = window.visualViewport?.height;
      if (h)
        setHeight(`${h}px`);
    }

    onResize();
  
    window.visualViewport?.addEventListener('resize', onResize);
  
    return () => {
      window.visualViewport?.removeEventListener('resize', onResize);
      document.body.style.touchAction = 'auto';
    }
  }, []);

  const onSave = () => {
    props.onSave(value);
    setValue('');
  }

  return createPortal(
    <div className="mobile-textarea not-annotatable" style={{ height }}>
      <div className="mobile-textarea-close">
        <button 
          className="unstyled icon-only"
          onClick={props.onCancel}>
          <X/>
        </button>
      </div>

      <textarea
        autoFocus
        value={value?.toString() || ''}
        onChange={evt => setValue(evt.target.value)} />

      <div className="mobile-textarea-footer">
        <button 
          className="primary"
          onClick={onSave}>Save</button>

        <button 
          onClick={props.onCancel}>Cancel</button>
      </div>
    </div>,
    
    document.body
  )

}