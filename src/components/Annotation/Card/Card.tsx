import { useAnnotatorUser } from '@annotorious/react';
import type { Annotation, AnnotationTarget, PresentUser } from '@annotorious/react';
import { Default, NewByMe, NewByOther } from './states';

import './Card.css';

export interface CardProps {

  annotation: Annotation;

  present: PresentUser[];

}

export const Card = (props: CardProps) => {

  const { annotation } = props;

  const me = useAnnotatorUser();

  const getCreator = (target: AnnotationTarget) => {
    const present = props.present.find(p => p.id === target.creator?.id);
    return present || target.creator;
  }

  const creator = getCreator(annotation.target);

  const isMine = creator?.id === me.id;

  const hasBodies = annotation.bodies.length > 0;

  return (
    <div className="annotation-card">
      {hasBodies ? (
        <Default {...props} />
      ) : isMine ? (
        <NewByMe {...props} />
      ) : (
        <NewByOther {...props} />
      )}
    </div>
  )

}