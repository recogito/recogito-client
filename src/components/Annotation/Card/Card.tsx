import { useAnnotatorUser, type Annotation, type AnnotationBody, type AnnotationTarget, type PresentUser } from '@annotorious/react';
import { Default, NewByMe, NewByOther } from './states';

import './Card.css';

export interface CardProps {

  annotation: Annotation;

  present: PresentUser[];

}

export const Card = (props: CardProps) => {

  const { annotation } = props;

  const me = useAnnotatorUser();

  const getCreator = (body: AnnotationBody | AnnotationTarget) => {
    const present = props.present.find(p => p.id === body.creator?.id);
    return present || body.creator;
  }

  const creator = getCreator(annotation.target);

  return (
    <div className="annotation-card">
      {creator?.id === me.id ? (
        <NewByMe {...props} me={props.present.find(p => p.id === me.id) || me} />
      ) : (
        <NewByOther {...props} />
      )}
    </div>
  )

}