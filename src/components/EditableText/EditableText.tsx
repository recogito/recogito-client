import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import ContentEditable from 'react-contenteditable';

import './EditableText.css';

interface EditableTextProps {

  focus?: boolean;

  maxLength?: number;

  value: string;

  onSubmit(value: string): void;

}

export const EditableText = (props: EditableTextProps) => {

  const maxLength = props.maxLength || 256;

  const el = useRef<HTMLElement>(null);

  const [value, setValue] = useState(props.value);

  useEffect(() => {
    if (props.focus && el.current)
      setTimeout(() => el.current?.focus(), 1);
  }, []);

  // Select all on focus
  const onFocus = () => {
    if (el.current) {
      const range = document.createRange();
      range.selectNodeContents(el.current);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  // Submit change on blur
  const onBlur = () => { 
    const currentValue = el.current?.innerText;
    if (currentValue) {
      props.onSubmit(currentValue);
    } else {
      setValue(() => value);
    }
  }

  // Enter key will blur the element (and submit)
  const onKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      (evt.target as HTMLElement).blur();
    }
  }
  
  // Paste without formatting
  const onPaste = (evt: React.ClipboardEvent) => {
    evt.preventDefault();
    navigator.clipboard.readText().then(text => setValue(text.slice(0, maxLength)));
  }

  return (
    <ContentEditable
      className="editable-text"
      innerRef={el}
      spellCheck={false}
      html={value} 
      tagName="span"
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      onChange={evt => setValue(evt.target.value)}
      onFocus={onFocus} 
      onPaste={onPaste} />
  )

}