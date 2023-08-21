import { GraduationCap } from '@phosphor-icons/react';
import type { Context, DocumentInContext } from 'src/Types';

import './DocumentMenu.css';

interface DocumentMenuProps {

  document: DocumentInContext;

}

export const DocumentMenu = (props: DocumentMenuProps) => {

  const contexts = props.document.layers.reduce((contexts, layer) => (
    [...contexts, ...layer.contexts]
  ), [] as Context[]);

  // For the time being, we can assume that there will always be exactly 
  // one (named or unnamed!) context for a document in the annotation view
  const contextName = contexts.length === 1 ? contexts[0].name : undefined;

  return (
    <div className="anno-menubar anno-desktop-overlay document-menu">
      {contextName ? (
        <>
          <a href="#" className="assignment-icon">
            <GraduationCap size={20} />
          </a>
          <h1>
            <a href="#">{contextName}</a> 
            <span>{props.document.name}</span>
          </h1>
        </>
      ) : (
        <h1>{props.document.name}</h1>
      )}
    </div>
  )

}