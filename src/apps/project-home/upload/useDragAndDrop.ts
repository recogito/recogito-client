import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export const useDragAndDrop = (onDrop: (arg: File[] | string) => void) => {

  const [isDragActive, setIsDragActive] = useState(false);

  const { 
    getRootProps, 
    getInputProps, 
    open, 
    rootRef 
  } = useDropzone({ onDrop, noClick: true, noKeyboard: true });

  const handleDragOver = (evt: React.DragEvent) => { 
    evt.preventDefault();

    if (!isDragActive)
      setIsDragActive(true);
  }

  const handleDragLeave = (evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();

    if (evt.target == rootRef.current)
      setIsDragActive(false);
  }

  const handleDrop = (evt: React.DragEvent) => {
    evt.preventDefault();

    const url = evt.dataTransfer.getData('URL');
    if (url)
      onDrop(url);

    setIsDragActive(false);
  }

  const _getRootProps = () => ({
    ...getRootProps({
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop 
    })
  });

  return {
    getRootProps: _getRootProps, 
    getInputProps, 
    isDragActive,
    open,
    rootRef
  }

}