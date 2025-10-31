import { useEffect, useRef } from 'react';
import Quill from 'quill';
import { Delta } from 'quill/core';
import type { Op, QuillOptions } from 'quill/core';
import { useAnnotations } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { useQuillEditor } from './QuillEditorRoot';
import { getAnnotationIdFromLink, getAnnotationShortLink, isAnnotationLink, splitStringBy } from './utils';
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

  onNavigateTo(annotation: SupabaseAnnotation): void;

}

export const QuillEditor = (props: QuillEditorProps) => {

  const el = useRef<HTMLDivElement>(null);

  const { quill, setQuill } = useQuillEditor();

  const annotations = useAnnotations<SupabaseAnnotation>();

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
      const { ops } = quill.getContents();

      const filteredOps = 
        ops.filter(op => !isBase64Image(op) || ((op.insert as any).image as string).length < maxSize);

      if (ops.length !== filteredOps.length)  
        // Note that this will re-trigger onChange
        quill.setContents({ ops: filteredOps } as Delta);

      props.onChange?.(quill.getContents());
    }

    const onPaste = (evt: ClipboardEvent) => {
      const text = evt.clipboardData?.getData('Text');

      if (text && isAnnotationLink(text)) {
        // Yay - we confirmed that an annotation link was pasted!
        // Quill will have inserted the link somewhere at the user cursor
        // position and merged it with the surrounding plaintext.
        const { ops } = quill.getContents();

        // Get current selection, so we can restore cursor position
        const range = quill.getSelection();

        const cursorPos = range?.index;

        const withThisLink = ops.filter(op => 
            typeof op.insert === 'string' 
              && !op.attributes 
              && op.insert.includes(text));

        if (withThisLink.length > 0) {
          // Found un-formatted occurrences of this link!
          const short = getAnnotationShortLink(text);

          const formatLink = (op: Op): Op[] => {
            const { before, after } = splitStringBy((op.insert as string), text)

            return [
              { insert: before },
              { insert: `@${short}`, attributes: { link: text } },
              { insert: after }
            ].filter(op => op.insert); // Remove empty
          }

          const next = ops.reduce<Op[]>((all, op) => 
            withThisLink.includes(op) ? [...all, ...formatLink(op)] : [...all, op], []);

          quill.setContents(next);

          if (cursorPos)
            quill.setSelection({ index: cursorPos, length: 0 });
        }
      }
    }

    quill.on('text-change', onChange);
    quill.root.addEventListener('paste', onPaste);

    setQuill(quill);

    return () => {
      quill.off('text-change', onChange);
      quill.root.removeEventListener('paste', onPaste);
    }
  }, []);

  useEffect(() => {
    if (!el.current) return;

    const onClick = (evt: MouseEvent) => {
      const target = evt.target as HTMLElement;
      const link = target.closest('a');
      if (!link) return; // Not a link

      const annotationId = getAnnotationIdFromLink(link.href);
      if (annotationId) {
        const annotation = annotations.find(a => a.id === annotationId);
        if (annotation) {
          evt.preventDefault();
          evt.stopPropagation();

          props.onNavigateTo(annotation);
        }
      }
    }

    el.current.addEventListener('click', onClick);

    return () => {
      el.current?.removeEventListener('click', onClick);
    }
  }, [quill, annotations])

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
