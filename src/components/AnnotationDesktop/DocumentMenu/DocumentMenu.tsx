import { CaretLeft, GraduationCap } from '@phosphor-icons/react';
import type { DocumentInTaggedContext, Translations } from 'src/Types';

import './DocumentMenu.css';

interface DocumentMenuProps {

  i18n: Translations;

  document: DocumentInTaggedContext;

}

export const DocumentMenu = (props: DocumentMenuProps) => {

  const contextName = props.document.context.name;

  const { id, project_id } = props.document.context;

  const back = contextName ? 
    `/${props.i18n.lang}/projects/${project_id}/assignments/${id}` : 
    `/${props.i18n.lang}/projects/${project_id}`;

  return (
    <div className="anno-menubar anno-desktop-overlay document-menu">
      {contextName ? (
        <>
          <a href={back} className="assignment-icon">
            <GraduationCap size={20} />
          </a>

          <h1>
            <a href={back}>{contextName}</a> / <span>{props.document.name}</span>
          </h1>
        </>
      ) : (
        <>
          <a href={back} className="back-to-project">
            <CaretLeft size={20} />
          </a>

          <h1>
            <span>{props.document.name}</span>
          </h1>
        </>
      )}
    </div>
  )

}