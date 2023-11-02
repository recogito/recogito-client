import React, { RefObject, useMemo, useRef, useState } from 'react';
import ReactQuill, { Range } from 'react-quill';
import {
  ArrowCounterClockwise,
  ArrowClockwise,
  Image,
  Link,
  YoutubeLogo,
} from '@phosphor-icons/react';
import './styles.css';
import type { DeltaStatic } from 'quill';
import { UrlDialog } from './UrlDialog';
import type { Translations } from 'src/Types';

export interface RichTextEditorProps {
  initialValue?: string;
  value: string | undefined;
  onChange(value: DeltaStatic): void;
  placeholder?: string;
  editable?: boolean;
  i18n: Translations;
}

const CustomToolbar = () => (
  <div id='toolbar' className='ql-snow ql-toolbar'>
    <button className='ql-undo'>
      <ArrowCounterClockwise />
    </button>
    <button className='ql-redo'>
      <ArrowClockwise />
    </button>
    <button className='ql-link'>
      <Link />
    </button>
    <button className='ql-image'>
      <Image />
    </button>
    <button className='ql-video'>
      <YoutubeLogo />
    </button>
  </div>
);
export const RichTextEditor = (props: RichTextEditorProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'image' | 'video' | undefined>();
  const [range, setRange] = useState<Range | undefined>();

  const { t } = props.i18n;

  const modules = useMemo(
    () => ({
      toolbar: props.editable
        ? {
            size: ['16px', '16px', '16px', '16px', '16px'],
            history: {
              delay: 1000,
              maxStack: 100,
              userOnly: false,
            },
            container: '#toolbar',
            handlers: {
              image: imageHandler,
              undo: undoHandler,
              redo: redoHandler,
              video: videoHandler,
            },
          }
        : false,
    }),
    []
  );

  const quill = useRef<ReactQuill | undefined>();

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
  ];

  function imageHandler() {
    if (quill.current) {
      const editor = quill.current.editor;
      if (editor) {
        setRange(editor.getSelection());
        setTitle(t['Enter Image URL']);
        setMessage(
          t[
            'Enter a publicly available URL to embed the image into your annotation'
          ]
        );
        setType('image');
        setOpen(true);
      }
    }
  }

  function undoHandler() {
    if (!quill.current) return;

    const editor = quill.current.getEditor();
    // @ts-ignore
    return editor.history.undo();
  }

  function redoHandler() {
    if (!quill.current) return;

    const editor = quill.current.getEditor();
    // @ts-ignore
    return editor.history.redo();
  }

  function videoHandler() {
    if (quill.current) {
      const editor = quill.current.editor;
      if (editor) {
        setRange(editor.getSelection());
        setTitle(t['Enter YouTube video URL']);
        setMessage(
          t[
            'Enter a publicly available YouTube URL to embed the video into your annotation'
          ]
        );
        setType('video');
        setOpen(true);
      }
    }
  }

  function getVideoUrl(url: string) {
    const match =
      url.match(
        /^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/
      ) ||
      url.match(
        /^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/
      ) ||
      // eslint-disable-next-line no-useless-escape
      url.match(/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/);
    if (match && match[2].length === 11) {
      return 'https' + '://www.youtube.com/embed/' + match[2] + '?showinfo=0';
    }
    return null;
  }

  const handleSaveURL = (url: string) => {
    if (quill.current) {
      const editor = quill.current.editor;
      if (editor) {
        if (type === 'video') {
          if (url) {
            const vetted = getVideoUrl(url);
            if (url != null && range) {
              editor.insertEmbed(range.index, 'video', vetted);
              editor.insertEmbed(range.index + 1, 'block', '<br><p><br></p>');
              editor.setSelection({ index: range.index + 1, length: 0 });
              editor.focus();
              quill.current.focus();
            }
          }
        } else {
          if (url && range) {
            editor.insertEmbed(range.index, 'image', url, 'user');
            editor.insertEmbed(range.index + 1, 'block', '<br><p><br></p>');
            editor.setSelection({ index: range.index + 1, length: 0 });
            editor.focus();
            quill.current.focus();
          }
        }
      }
    }

    setOpen(false);
  };

  const handleChange = (_value: string) => {
    if (quill.current) {
      const editor = quill.current.editor;
      if (editor) {
        props.onChange(editor.getContents());
      }
    }
  };

  return (
    <>
      <div>
        {props.editable && <CustomToolbar />}
        <ReactQuill
          readOnly={!props.editable}
          value={props.value}
          modules={modules}
          formats={formats}
          onChange={handleChange}
          ref={quill as RefObject<ReactQuill>}
        />
      </div>
      <UrlDialog
        title={title}
        message={message}
        onSave={handleSaveURL}
        onClose={() => setOpen(false)}
        open={open}
        i18n={props.i18n}
      />
    </>
  );
};
