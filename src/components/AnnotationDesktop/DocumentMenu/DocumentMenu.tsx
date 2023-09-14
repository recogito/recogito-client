import { GraduationCap } from '@phosphor-icons/react';
import type { Context, DocumentInTaggedContext } from 'src/Types';

import './DocumentMenu.css';

interface DocumentMenuProps {

  document: DocumentInTaggedContext;

}

export const DocumentMenu = (props: DocumentMenuProps) => {

  const contextName = props.document.context.name;

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