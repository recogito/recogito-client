import { useAuthorColors } from '@components/AnnotationDesktop';
import { BaseCard } from '../BaseCard';
import type { CardProps } from '../CardProps';
import { PublicComment } from '../../Comment/PublicComment';

export const PublicCard = (props: CardProps) => {

  const cls = props.className;

  const authorColors = useAuthorColors();

  const color = authorColors.getColor(props.annotation.target.creator);

  return (
    <div 
      className={cls ? `${cls} annotation-card public` : 'annotation-card public'}
      style={color ? { borderLeftWidth: 3, borderLeftColor: color } : undefined}>
      <BaseCard 
        {...props} 
        comment={props => (
          <PublicComment 
            {...props} />
        )}/>
    </div>
  )

}