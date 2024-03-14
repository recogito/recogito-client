import { useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill, { Range } from 'react-quill';
import type { DeltaStatic } from 'quill';
import { UrlDialog } from './UrlDialog';
import type { Translations } from 'src/Types';
import {
  ArrowCounterClockwise,
  ArrowClockwise,
  Image,
  Link,
  YoutubeLogo,
} from '@phosphor-icons/react';

import './RichTextEditor.css';

export interface RichTextEditorProps {

  editable?: boolean;
  
  i18n: Translations;
  
  placeholder?: string;
  
  value: string | DeltaStatic | undefined;
  
  onBlur?(): void;
  
  onChange(value: DeltaStatic): void;
  
  onFocus?(): void;

}

const CustomToolbar = () => (
  <div id="ql-toolbar" className="ql-toolbar">
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
)

export const RichTextEditor = (props: RichTextEditorProps) => {

  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState('');
  
  const [message, setMessage] = useState('');
  
  const [type, setType] = useState<'image' | 'video' | undefined>();
  
  const [range, setRange] = useState<Range | undefined>();

  const { t } = props.i18n;

  const reactQuillRef = useRef<ReactQuill | null>(null);

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
            container: '#ql-toolbar',
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
    if (reactQuillRef.current) {
      const editor = reactQuillRef.current.editor;
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
    if (!reactQuillRef.current) return;

    const editor = reactQuillRef.current.getEditor();
    // @ts-ignore
    return editor.history.undo();
  }

  function redoHandler() {
    if (!reactQuillRef.current) return;

    const editor = reactQuillRef.current.getEditor();
    // @ts-ignore
    return editor.history.redo();
  }

  function videoHandler() {
    if (reactQuillRef.current) {
      const editor = reactQuillRef.current.editor;
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
    if (reactQuillRef.current) {
      const editor = reactQuillRef.current.editor;
      if (editor) {
        if (type === 'video') {
          if (url) {
            const vetted = getVideoUrl(url);
            if (url != null && range) {
              editor.insertEmbed(range.index, 'video', vetted);
              editor.insertEmbed(range.index + 1, 'block', '<br><p><br></p>');
              editor.setSelection({ index: range.index + 1, length: 0 });
              editor.focus();
              reactQuillRef.current.focus();
            }
          }
        } else {
          if (url && range) {
            editor.insertEmbed(range.index, 'image', url, 'user');
            editor.insertEmbed(range.index + 1, 'block', '<br><p><br></p>');
            editor.setSelection({ index: range.index + 1, length: 0 });
            editor.focus();
            reactQuillRef.current.focus();
          }
        }
      }
    }

    setOpen(false);
  };

  const handleChange = (_value: string) => {
    if (reactQuillRef.current) {
      const editor = reactQuillRef.current.editor;
      if (editor) {
        props.onChange(editor.getContents());
      }
    }
  };

  useEffect(() => {
    // if (props.editable)
    //  reactQuillRef.current?.focus();
  }, []);

  return (
    <>
      <div>
        {props.editable && <CustomToolbar />}
        <div>
          <ReactQuill
            readOnly={!props.editable}
            value={props.value}
            modules={modules}
            formats={formats}
            onChange={handleChange}
            onBlur={props.onBlur}
            onFocus={props.onFocus}
            ref={reactQuillRef}
            placeholder={props.placeholder}
          />
        </div>
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
  )
  
}
