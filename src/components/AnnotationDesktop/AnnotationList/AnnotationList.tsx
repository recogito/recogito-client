import { PresentUser, Visibility, useAnnotations } from '@annotorious/react';
import { Annotation } from '@components/Annotation';
import type { Translations } from 'src/Types';

import './AnnotationList.css';

interface AnnotationListProps {

  i18n: Translations;

  present: PresentUser[];

}

export const AnnotationList = (props: AnnotationListProps) => {

  const annotations = useAnnotations();

  return (
    <div className="anno-sidepanel annotation-list">
      {annotations.map(a => a.visibility === Visibility.PRIVATE ? (
        <Annotation.PrivateCard 
          key={a.id}
          i18n={props.i18n}
          annotation={a} 
          present={props.present} />
      ) : (
        <Annotation.PublicCard 
          key={a.id}
          i18n={props.i18n}
          annotation={a} 
          present={props.present} />
      ))}
    </div>
  )

}