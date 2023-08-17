import type { DocumentInContext } from 'src/Types';

import './DocumentMenu.css';

interface DocumentMenuProps {

  document: DocumentInContext;

}

export const DocumentMenu = (props: DocumentMenuProps) => {

  return (
    <div className="anno-menubar anno-desktop-overlay document-menu">
      <h1>{props.document.name}</h1>
    </div>
  )

}