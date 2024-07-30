// Based on https://codepen.io/wallaceho/pen/vxLbRO
import './AnimatedIcons.css';

interface AnimatedFailureProps {
  size: number;
}

export const AnimatedFailure = (props: AnimatedFailureProps) => {
  const { size } = props;

  return (
    <div className='animated-icon minus'>
      <svg viewBox='0 0 154 154' width={`${size}px`} height={`${size}px`}>
        <g fill='none'>
          <circle
            className='outline'
            cx='77'
            cy='77'
            r='72'
            style={{
              strokeDasharray: '480px, 480px',
              strokeDashoffset: '960px',
            }}
          />

          <circle
            className='fill'
            fill='#F44812'
            cx='77'
            cy='77'
            r='72'
            style={{
              strokeDasharray: '480px, 480px',
              strokeDashoffset: '960px',
            }}
          />
          <polyline
            stroke='#fff'
            strokeWidth='10'
            points='43.5,77.8  112.2,77.8 '
            style={{
              strokeDasharray: '100px, 100px',
              strokeDashoffset: '200px',
            }}
          />
        </g>
      </svg>
    </div>
  );
};
