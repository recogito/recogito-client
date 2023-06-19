import { useAnnotationStore, type Annotation } from '@annotorious/react';
import { BaseCard } from '../BaseCard';
import type { CardProps } from '../CardProps';
import { PrivateComment } from '../../Comment/PrivateComment/PrivateComment';

import './PrivateCard.css';

export const PrivateCard = (props: CardProps) => {

  const store = useAnnotationStore();

  const onMakePublic = () =>
    store.updateAnnotation({
      ...props.annotation,
      visibility: undefined
    });

  const onDeleteAnnotation = () => 
    store.deleteAnnotation(props.annotation);

  return (
    <div className="annotation-card private">
      <BaseCard 
        {...props} 
        comment={props => (
          <PrivateComment 
            {...props} 
            onMakePublic={onMakePublic} 
            onDeleteAnnotation={onDeleteAnnotation}/>
        )}/>
    </div>
  )

}