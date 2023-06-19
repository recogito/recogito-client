import { BaseCard } from '../BaseCard';
import type { CardProps } from '../CardProps';
import { PublicComment } from '../../Comment/PublicComment';

export const PublicCard = (props: CardProps) => {

  return (
    <div className="annotation-card public">
      <BaseCard 
        {...props} 
        comment={props => (
          <PublicComment {...props} />
        )}/>
    </div>
  )

}