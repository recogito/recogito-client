import './MissingBadge.css';

interface MissingBadgeProps {
  text: string;
}

export const MissingBadge = (props: MissingBadgeProps) => {
  return <span className='missing-badge'>{props.text}</span>;
};
