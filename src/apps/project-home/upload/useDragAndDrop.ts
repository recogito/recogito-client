import { useState } from 'react';
import { type FileRejection, useDropzone } from 'react-dropzone';

export const useDragAndDrop = (onDrop: (accepted: File[] | string, rejected: FileRejection[]) => void) => {

  const [isDragActive, setIsDragActive] = useState(false);

  const { 
    getRootProps, 
    getInputProps, 
    open, 
    rootRef 
  } = useDropzone({ 
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/xml': ['.xml'],
      'image/jpg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tif', '.tiff'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/jp2': ['.jp2']
    },
    noClick: true, 
    noKeyboard: true,
    onDrop 
  });

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
      onDrop(url, []);

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