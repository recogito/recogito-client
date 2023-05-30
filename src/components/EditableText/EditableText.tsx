import type { FocusEvent, KeyboardEvent } from 'react';
import ContentEditable from 'react-contenteditable';

interface EditableTextProps {

  value: string;

  onSubmit(value: string): void;

}

export const EditableText = (props: EditableTextProps) => {

  const onFocus = (evt: FocusEvent) => {
    const range = document.createRange();
    range.selectNodeContents(evt.target as Element);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
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
      spellCheck={false}
      html={props.value} 
      tagName="span"
      onKeyDown={onKeyDown}
      onChange={() => {}}
      onFocus={onFocus} />
  )

}