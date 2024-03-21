import { useAnnotationStore } from '@annotorious/react';
import { BaseCard } from '../BaseCard';
import type { CardProps } from '../CardProps';
import { PrivateComment } from '../../Comment/PrivateComment/PrivateComment';

import './PrivateCard.css';

export const PrivateCard = (props: CardProps) => {

  const cls = props.className;

  const store = useAnnotationStore();

  const onMakePublic = () =>
    store.updateAnnotation({
      ...props.annotation,
      // @ts-ignore
      visibility: undefined
    });

  return (
    <div
      className={cls ? `${cls} annotation-card private` : 'annotation-card private'}> 
      <BaseCard 
        {...props} 
        comment={props => (
          <PrivateComment 
            {...props} 
            onMakePublic={onMakePublic} />
        )}/>
    </div>
  )

}