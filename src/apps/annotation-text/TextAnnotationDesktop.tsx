import { Annotorious } from '@annotorious/react';
import type { Translations } from 'src/Types';

export interface TextAnnotationDesktopProps {

  i18n: Translations;

}

export const TextAnnotationDesktop = (props: TextAnnotationDesktopProps) => {



  return (
    <div className="anno-desktop ta-desktop">
      <Annotorious>
        <div className="anno-desktop-bottom">
          
        </div>
      </Annotorious>
    </div>
  )

}