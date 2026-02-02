import { Badge } from '@radix-ui/themes';
import './MissingBadge.css';

interface MissingBadgeProps {
  text: string;
}

export const MissingBadge = (props: MissingBadgeProps) => {
  return (
    <Badge color='gray' variant='soft'>
      {props.text}
    </Badge>
  );
};
