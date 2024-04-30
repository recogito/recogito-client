import Quill from 'quill';
import { Delta, type QuillOptions } from 'quill/core';
import { useEffect, useLayoutEffect, useRef } from 'react';
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

  const { quill, setQuill } = useQuillEditor();

  useEffect(() => {
    const options: QuillOptions = {
      placeholder: props.placeholder,
      readOnly: props.readOnly
    };

    const quill = new Quill(el.current!, options);

    // if (props.autoFocus && !props.readOnly)
    //  quill.focus();

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

  useEffect(() => {
    if (!quill) return

    if (props.readOnly) {
      quill.disable();
    } else { 
      quill.enable();
    }
  }, [quill, props.readOnly]);

  useEffect(() => {
    if (!quill) return;

    if (props.autoFocus)
      quill.focus();
  }, [quill, props.autoFocus]);

  useEffect(() => {
    if (!quill) return;

    const current = quill.getContents();
    const next = props.value || new Delta();

    if (JSON.stringify(current) !== JSON.stringify(next))
      quill.setContents(next);
  }, [props.value, quill])

  return (
    <div 
      ref={el}
      className="quill-rte" />
  )

}
