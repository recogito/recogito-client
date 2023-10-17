import type { PDFScale } from '@recogito/react-pdf-annotator';
import { ArrowsHorizontal, File } from '@phosphor-icons/react';

interface PDFSizeSelectorProps {

  currentScale?: number;

  onSetSize(size: PDFScale): void;

}

export const PDFSizeSelector = (props: PDFSizeSelectorProps) => {

  console.log(props.currentScale);

  return (
    <>
      <button onClick={() => props.onSetSize('auto')}>
        Auto
      </button>

      <button onClick={() => props.onSetSize('page-actual')}>
        1:1
      </button>

      <button onClick={() => props.onSetSize('page-fit')}>
        <File />
      </button>

      <button onClick={() => props.onSetSize('page-width')}>
        <ArrowsHorizontal />
      </button>
    </>
  )

}