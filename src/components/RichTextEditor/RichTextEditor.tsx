import React, { ReactNode, useEffect } from 'react';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import { COMMAND_PRIORITY_EDITOR, SELECTION_CHANGE_COMMAND } from 'lexical';
import { ImageNode } from './nodes/ImageNode';
import ImagePlugin from './plugins/ImagePlugin';
import type { EditorState } from 'lexical';

import './RichTextEditor.css';
import defaultTheme from './themes/defaultTheme';

// When the editor changes, you can get notified via the
// OnChangePlugin!
const OnChangePlugin = (props: {
  onChange(value: EditorState): void;
}): ReactNode => {
  const { onChange } = props;
  // Access the editor through the LexicalComposerContext
  const [editor] = useLexicalComposerContext();
  // Wrap our listener in useEffect to handle the teardown and avoid stale references.
  useEffect(() => {
    // most listeners return a teardown function that can be called to clean them up.
    return editor.registerUpdateListener(({ editorState }) => {
      // call onChange here to pass the latest state up to the parent.
      onChange(editorState);
    });
  }, [editor, onChange]);
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload) => {
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return <></>;
};

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: unknown) {
  console.error(error);
}

export interface RichTextEditorProps {
  initialValue?: string;
  onChange(value: string): void;
  placeholder?: string;
  editable?: boolean;
}

export const RichTextEditor = (props: RichTextEditorProps) => {
  const initialConfig = {
    editorState: props.initialValue || undefined,
    namespace: 'MyEditor',
    theme: defaultTheme,
    onError,
    editable: props.editable || false,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      LinkNode,
      ImageNode,
    ],
  };

  const onChange = (editorState: EditorState) => {
    // Call toJSON on the EditorState object, which produces a serialization safe string
    const editorStateJSON: unknown = editorState.toJSON();
    // However, we still have a JavaScript object, so we need to convert it to an actual string with JSON.stringify
    props.onChange(editorStateJSON as string);

    console.log(editorStateJSON);
  };

  return (
    <div style={{ cursor: 'text', borderWidth: 0 }}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className='editor-container'>
          {props.editable && <ToolbarPlugin />}
          <div className='editor-inner not-annotatable'>
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className={
                    props.editable
                      ? 'editor-input not-annotatable'
                      : 'editor-input-read-only not-annotatable'
                  }
                />
              }
              placeholder={
                <div className='rich-text-placeholder'>{props.placeholder}</div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <ListPlugin />
            <LinkPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <OnChangePlugin onChange={onChange} />
            <ImagePlugin />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
};
