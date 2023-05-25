import type { Translations } from 'src/Types';

export interface TextAnnotationDesktopProps {

  i18n: Translations;

}

export const TextAnnotationDesktop = (props: TextAnnotationDesktopProps) => {

  return (
    <div className="">Text Annotation!</div>
  )

}