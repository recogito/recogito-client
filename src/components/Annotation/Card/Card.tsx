import type { Annotation } from '@annotorious/react';
import { Default, NewByMe, NewByOther } from './states';

import './Card.css';

export interface CardProps {

  annotation: Annotation;

}

export const Card = (props: CardProps) => {

  const { annotation } = props;

  return (
    <div className="annotation-card">
      <NewByOther {...props} />
    </div>
  )

}