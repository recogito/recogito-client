import './ProgressCircle.css';

interface ProgressCircleProps {

  className?: string;

  progress: number;

  size?: number;

}

/**
 * https://blog.logrocket.com/build-svg-circular-progress-component-react-hooks/
 */
export const ProgressCircle = (props: ProgressCircleProps) => {

  const { className } = props;

  const size = props.size || 22;

  const arcLength = 2 * Math.PI * 40;
  
  const arcOffset = arcLength * ((100 - props.progress) / 100);

  return (
    <svg 
      className={className ? `progress-circle ${className}` : 'progress-circle' } 
      viewBox="0 0 100 100"
      style={{ width: size, height: size }}>

      <circle 
        className="progress-circle-track" 
        r={40}
        cx={50} 
        cy={50} />

      <circle className="progress-circle-indicator" 
        style={{ 
          strokeDasharray: arcLength,
          strokeDashoffset: arcOffset
        }}
        r={40}
        cx={50} 
        cy={50}/>
    </svg>
  )

}