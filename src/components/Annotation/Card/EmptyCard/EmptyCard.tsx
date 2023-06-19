import type { Annotation, AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { Translations } from 'src/Types';
import { Creator } from '../../Creator';

import './EmptyCard.css';

export interface EmptyCardProps {

  i18n: Translations;

  annotation: Annotation;

  present: PresentUser[];

  typing?: boolean;

  onReply?(comment: AnnotationBody): void;

}

export const EmptyCard = (props: EmptyCardProps) => {

  const { target } = props.annotation;

  const creator: PresentUser | User | undefined = 
    props.present.find(p => p.id === target.creator?.id) || target.creator;

  return (
    <div className="annotation-card empty">
      <Creator 
        i18n={props.i18n}
        creator={creator} 
        createdAt={target.created} />

      {props.typing && (
        <div className="typing">
          <div className="typing-animation" />
        </div>
      )}
    </div>
  )

}