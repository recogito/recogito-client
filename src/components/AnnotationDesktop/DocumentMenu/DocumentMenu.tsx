import { 
  ArrowsHorizontal,
  CaretLeft, 
  File,
  GraduationCap,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus 
} from '@phosphor-icons/react';
import type { PDFSize } from '@recogito/react-pdf-annotator';
import type { DocumentInTaggedContext, Translations } from 'src/Types';

import './DocumentMenu.css';

interface DocumentMenuProps {

  i18n: Translations;

  document: DocumentInTaggedContext;

  onSetSize?(size: PDFSize): void;

  onZoomIn?(): void;

  onZoomOut?(): void;

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

      {props.document.content_type === 'application/pdf' && (
        <div className="pdf-size-controls">
          <button onClick={() => props.onSetSize!('auto')}>
            Auto
          </button>

          <button onClick={() => props.onSetSize!('page-actual')}>
            1:1
          </button>
 
          <button onClick={() => props.onSetSize!('page-fit')}>
            <File />
          </button>

          <button onClick={() => props.onSetSize!('page-width')}>
            <ArrowsHorizontal />
          </button>

          <button onClick={props.onZoomIn}>
            <MagnifyingGlassPlus />
          </button>

          <button onClick={props.onZoomOut}>
            <MagnifyingGlassMinus />
          </button>
        </div>
      )}
    </div>
  )

}