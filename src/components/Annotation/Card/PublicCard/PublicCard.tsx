import { BaseCard } from '../BaseCard';
import type { CardProps } from '../CardProps';
import { PublicComment } from '../../Comment/PublicComment';

export const PublicCard = (props: CardProps) => {

  const cls = props.className;

  return (
    <div 
      className={cls ? `${cls} annotation-card public` : 'annotation-card public'}>
      <BaseCard 
        {...props} 
        comment={props => (
          <PublicComment 
            {...props} />
        )}/>
    </div>
  )

}