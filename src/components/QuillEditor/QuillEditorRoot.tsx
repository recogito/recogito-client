import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type Quill from 'quill';

interface QuillEditorContextValue {

  quill?: Quill;

  setQuill: React.Dispatch<React.SetStateAction<Quill | undefined>>;

}

// @ts-ignore
const QuillEditorContext = createContext<QuillEditorContextValue>(undefined);

export const QuillEditorRoot = ({ children }: { children: ReactNode }) => {

  const [quill, setQuill] = useState<Quill | undefined>(undefined); 

  return (
    <QuillEditorContext.Provider value={{ quill, setQuill }}>
      {children}
    </QuillEditorContext.Provider>
  );
};

export const useQuillEditor = () => useContext(QuillEditorContext);
