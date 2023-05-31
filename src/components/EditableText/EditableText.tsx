import { useEffect, useRef } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';
import ContentEditable from 'react-contenteditable';

interface EditableTextProps {

  focus?: boolean;

  value: string;

  onSubmit(value: string): void;

}

export const EditableText = (props: EditableTextProps) => {

  const el = useRef<HTMLElement>(null);

  useEffect(() => {
    if (props.focus && el.current)
      setTimeout(() => el.current?.focus(), 1);
  }, []);

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

  const onKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();

      const el = evt.target as HTMLElement;
      el.blur();
      
      const value = el.innerHTML.trim();
      props.onSubmit(value);
    }
  }

  return (
    <ContentEditable
      innerRef={el}
      spellCheck={false}
      html={props.value} 
      tagName="span"
      onKeyDown={onKeyDown}
      onChange={() => {}}
      onFocus={onFocus} />
  )

}