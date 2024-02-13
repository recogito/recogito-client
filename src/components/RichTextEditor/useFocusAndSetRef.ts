import { useCallback } from 'react';

export const useFocusAndSetRef = (ref: any) => {
  ref = useCallback(
    (node: any) => {
      if (node !== null) {
        ref.current = node; // it is not done on it's own
        const len = node.unprivilegedEditor.getLength();
        const selection = { index: len, length: len };
        node.setEditorSelection(node.editor, selection);
      }
    },
    [ref]
  );
  return ref;
};
