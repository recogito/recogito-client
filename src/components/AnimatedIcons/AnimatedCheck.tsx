// Based on https://codepen.io/wallaceho/pen/vxLbRO
import './AnimatedIcons.css';

interface AnimatedCheckProps {

  size: number;

}

export const AnimatedCheck = (props: AnimatedCheckProps) => {

  const { size } = props;

  return (
  	<div className="animated-icon check">
      <svg viewBox="0 0 154 154" width={`${size}px`} height={`${size}px`} >  
        <g fill="none"> 
          <circle 
            className="outline"
            cx="77" cy="77" r="72" 
            style={{ strokeDasharray: '480px, 480px', strokeDashoffset: '960px' }} />

          <circle 
            className="fill" 
            fill="#22AE73" cx="77" cy="77" r="72" 
            style={{ strokeDasharray: '480px, 480px', strokeDashoffset: '960px'}} />

          <polyline 
            stroke="#fff" stroke-width="10" 
            points="43.5,77.8 63.7,97.9 112.2,49.4 " 
            style={{ strokeDasharray: '100px, 100px', strokeDashoffset: '200px'}} />   
        </g> 
      </svg>
    </div>
)

}

