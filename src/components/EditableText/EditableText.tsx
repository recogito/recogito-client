import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import ContentEditable from 'react-contenteditable';

import './EditableText.css';

interface EditableTextProps {

  focus?: boolean;

  maxLength?: number;

  value: string;

  onChange?(value: string): void;

  onSubmit(value: string): void;

}

const clearSelection = () => {
  if (window.getSelection) {
    if (window.getSelection()?.empty) { 
      window.getSelection()?.empty();
    } else if (window.getSelection()?.removeAllRanges) {  
      window.getSelection()?.removeAllRanges();
    }
  }
}

export const EditableText = (props: EditableTextProps) => {

  const maxLength = props.maxLength || 256;

  const el = useRef<HTMLElement>(null);

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
    clearSelection();
    const currentValue = el.current?.innerText;
    if (currentValue && currentValue !== props.value)
      props.onSubmit(currentValue);
  }

  // Enter key will blur the element (and submit)
  const onKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      (evt.target as HTMLElement).blur();
    }
  }

  const onChange = (value: string) =>
    props.onChange && props.onChange(value);
  
  // Paste without formatting
  const onPaste = (evt: React.ClipboardEvent) => {
    evt.preventDefault();
    navigator.clipboard.readText().then(text => onChange(text.slice(0, maxLength)));
  }

  return (
    <ContentEditable
      className="editable-text"
      innerRef={el}
      spellCheck={false}
      html={props.value} 
      tagName="span"
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      onChange={evt => onChange(evt.target.value)}
      onFocus={onFocus} 
      onPaste={onPaste} />
  )

}