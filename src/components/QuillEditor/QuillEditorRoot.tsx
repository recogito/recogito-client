import type Quill from 'quill';
import { ReactNode, createContext, useContext, useState } from 'react';

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
