import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DeltaOperation, DeltaStatic } from 'quill';
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

const serializeQuill = (value: DeltaStatic) => {
  let serialized = '';

  value.ops?.forEach((op: DeltaOperation) => {
    if (typeof op.insert === "string") {
      serialized += op.insert;
    } else if ('image' in op.insert) {
      serialized += op.insert.image;
    } else if ('video' in op.insert) {
      serialized += op.insert.video;
    }
  })

  return serialized.trim();
}

export const MobileTextarea = (props: MobileTextareaProps) => {

  const [value, setValue] = useState(props.value && (
    typeof props.value === 'string' ? props.value : serializeQuill(props.value)
  ));

  const [height, setHeight] = useState('100%');

  const onResize = useCallback(() => {
    const h = window.visualViewport?.height;
    if (h)
      setHeight(`${h}px`);
  }, []);

  useEffect(() => {
    document.body.style.touchAction = 'none';

    onResize();
  
    window.visualViewport?.addEventListener('resize', onResize);
  
    return () => {
      window.visualViewport?.removeEventListener('resize', onResize);
      document.body.style.touchAction = 'auto';
    }
  }, []);

  const onBlur = () => {
    window.visualViewport?.removeEventListener('resize', onResize);
    document.body.style.touchAction = 'auto';
  }

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
        value={value || ''}
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