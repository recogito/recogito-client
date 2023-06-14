import { BodyHeader } from '../../BodyHeader';
import type { CardProps } from '../Card';

/**
 * Annotation was just created by another user. We'll
 * show the avatar header, and a 'busy' animation
 * to indicate that the creator is still working on 
 * this annotation.
 */
export const NewByOther = (props: CardProps) => {

  const { creator, created } = props.annotation.target;

  return (
    <div className="annotation-card-header new-by-other">
      <BodyHeader 
        creator={creator} 
        createdAt={created} />

      <div className="other-typing">
        <div className="other-typing-animation" />
      </div>
    </div>
  )

}