import Quill from 'quill';
import type { Delta, QuillOptions } from 'quill/core';
import { useLayoutEffect, useRef } from 'react';
import { useQuillEditor } from './QuillEditorRoot';

import './QuillEditor.css';
import 'quill/dist/quill.core.css';

interface QuillEditorProps {

  autoFocus?: boolean;

  placeholder?: string;

  readOnly?: boolean;

  value?: Delta;

  onChange?(value: Delta): void;

}

export const QuillEditor = (props: QuillEditorProps) => {

  const el = useRef<HTMLDivElement>(null);

  const { setQuill } = useQuillEditor();

  useLayoutEffect(() => {
    const options: QuillOptions = {
      placeholder: props.placeholder,
      readOnly: props.readOnly
    };

    const quill = new Quill(el.current!, options);

    if (props.autoFocus && !props.readOnly)
      quill.focus();

    if (props.value)
      quill.setContents(props.value);

    const onChange = () => 
        props.onChange && props.onChange(quill.getContents());

    quill.on('text-change', onChange);

    setQuill(quill);

    return () => {
      quill.off('text-change', onChange);
    }
  }, []);

  return (
    <div 
      ref={el}
      className="quill-rte" />
  )

}
