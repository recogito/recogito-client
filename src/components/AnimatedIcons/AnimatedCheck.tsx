// https://codepen.io/wallaceho/pen/vxLbRO
import './AnimatedIcons.css';

export const AnimatedCheck = () => {

  return (
  	<div className="animated-icon success">
      <svg xmlns="http://www.w3.org/2000/svg" width="154px" height="154px">  
        <g fill="none" stroke="#22AE73" stroke-width="2"> 
          <circle 
            cx="77" cy="77" r="72" 
            style={{ strokeDasharray: '480px, 480px', strokeDashoffset: '960px' }} />

          <circle 
            id="colored" 
            fill="#22AE73" cx="77" cy="77" r="72" 
            style={{ strokeDasharray: '480px, 480px', strokeDashoffset: '960px'}} />

          <polyline 
            className="st0" stroke="#fff" stroke-width="10" 
            points="43.5,77.8 63.7,97.9 112.2,49.4 " 
            style={{ strokeDasharray: '100px, 100px', strokeDashoffset: '200px'}} />   
        </g> 
      </svg>
    </div>
)

}

