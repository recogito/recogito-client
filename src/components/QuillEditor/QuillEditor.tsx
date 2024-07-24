import Quill from 'quill';
import { Delta, Op, type QuillOptions } from 'quill/core';
import { useEffect, useRef } from 'react';
import { useQuillEditor } from './QuillEditorRoot';
import type { Translations } from 'src/Types';

import './QuillEditor.css';
import 'quill/dist/quill.core.css';

// Limit default Base64 encoded images to 64k
const DEFAULT_MAX_IMAGE_SIZE = 64 * 1024;

interface QuillEditorProps {

  autoFocus?: boolean;

  i18n: Translations;

  maxImageSize?: number;

  placeholder?: string;

  readOnly?: boolean;

  value?: Delta;

  onChange?(value: Delta): void;

}

export const QuillEditor = (props: QuillEditorProps) => {

  const el = useRef<HTMLDivElement>(null);

  const { quill, setQuill } = useQuillEditor();

  const isBase64Image = (op: Op) => {
    if (typeof op.insert !== 'object') 
      return false;

    return (
      typeof op.insert?.image === 'string' &&
      op.insert.image.startsWith('data:image/')
    );
  }

  useEffect(() => {
    const options: QuillOptions = {
      placeholder: props.placeholder,
      readOnly: props.readOnly
    };

    const quill = new Quill(el.current!, options);

    if (props.value)
      quill.setContents(props.value);

    const maxSize = props.maxImageSize || DEFAULT_MAX_IMAGE_SIZE;

    const onChange = () => {
      const ops = quill.getContents().ops;

      const filteredOps = 
        ops.filter(op => !isBase64Image(op) || ((op.insert as any).image as string).length < maxSize);

      if (ops.length !== filteredOps.length)  
        // Note that this will re-trigger onChange
        quill.setContents({ ops: filteredOps } as Delta);

      props.onChange && props.onChange(quill.getContents());
    }

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
     quill.focus({ preventScroll: true });
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
      className="quill-rte not-annotatable" />
  )

}
