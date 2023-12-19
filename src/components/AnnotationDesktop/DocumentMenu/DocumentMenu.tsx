import { useState } from 'react';
import { useAnnotator } from '@annotorious/react';
import { 
  CaretLeft, 
  GraduationCap,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus 
} from '@phosphor-icons/react';
import type { PDFScale, VanillaPDFAnnotator } from '@recogito/react-pdf-annotator';
import { PDFScaleSelector } from './PDFScaleSelector';
import type { DocumentInTaggedContext, Translations } from 'src/Types';

import './DocumentMenu.css';

interface DocumentMenuProps {

  i18n: Translations;

  document: DocumentInTaggedContext;

}

export const DocumentMenu = (props: DocumentMenuProps) => {

  const { t } = props.i18n;

  const contextName = props.document.context.name;

  const { id, project_id } = props.document.context;

  const anno = useAnnotator<VanillaPDFAnnotator>();

  const [currentScale, setCurrentScale] = useState<number | undefined>();

  const back = contextName ? 
    `/${props.i18n.lang}/projects/${project_id}/assignments/${id}` : 
    `/${props.i18n.lang}/projects/${project_id}`;

  const onSetScale = (scale: PDFScale) => {
    const s = anno.setScale(scale);
    setCurrentScale(undefined);
  }

  const onZoomIn = () => {
    const s = anno.zoomIn();
    setCurrentScale(s);
  }

  const onZoomOut = () => {
    const s = anno.zoomOut();
    setCurrentScale(s);
  }

  return (
    <div className="anno-menubar anno-desktop-overlay document-menu">
      {contextName ? (
        <>
          <a 
            href={back} 
            className="assignment-icon"
            title={t['Back to assignment overview']}>
            <GraduationCap size={20} />
          </a>

          <h1>
            <a href={back}>{contextName}</a> / <span>{props.document.name}</span>
          </h1>
        </>
      ) : (
        <>
          <a 
            href={back} 
            className="back-to-project"
            title={t['Back to project overview']}>
            <CaretLeft size={20} />
          </a>

          <h1>
            <span>{props.document.name}</span>
          </h1>
        </>
      )}

      {props.document.content_type === 'application/pdf' && (
        <div className="pdf-scale-controls">
          <div className="anno-desktop-overlay-divider" />

          <PDFScaleSelector 
            i18n={props.i18n}
            currentScale={currentScale}
            onSetScale={onSetScale}/>

          <button 
            onClick={onZoomIn}
            aria-label={t['Zoom in']}>
            <MagnifyingGlassPlus />
          </button>

          <button
            onClick={onZoomOut}
            aria-label={t['Zoom out']}>
            <MagnifyingGlassMinus />
          </button>
        </div>
      )}
    </div>
  )

}