import { BaseCard } from '../BaseCard';
import type { CardProps } from '../CardProps';
import { PublicComment } from '../../Comment/PublicComment';
import { useAnnotationStore } from '@annotorious/react';

export const PublicCard = (props: CardProps) => {

  const store = useAnnotationStore();

  const onDeleteAnnotation = () => 
    store.deleteAnnotation(props.annotation);

  return (
    <div className="annotation-card public">
      <BaseCard 
        {...props} 
        comment={props => (
          <PublicComment 
            {...props} 
            onDeleteAnnotation={onDeleteAnnotation} />
        )}/>
    </div>
  )

}