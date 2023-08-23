import type { Annotation, AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { Translations } from 'src/Types';
import { Creator } from '../../Creator';

import './EmptyCard.css';

export interface EmptyCardProps {

  i18n: Translations;

  annotation: Annotation;

  present: PresentUser[];

  typing?: boolean;

  selected?: boolean;
  
  private?: boolean;

  onReply?(comment: AnnotationBody): void;

}

export const EmptyCard = (props: EmptyCardProps) => {

  const { target } = props.annotation;

  const creator: PresentUser | User | undefined = 
    props.present.find(p => p.id === target.creator?.id) || target.creator;

  const getClass = () => {
    const classes = ['annotation-card', 'empty'];

    if (props.private)
      classes.push('private');

    if (props.selected)
      classes.push('selected')
    
    return classes.join(' ');
  }

  return (
    <div className={getClass()}>
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