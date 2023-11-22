import React from 'react';
interface propType {
  width?: number;
  height?: number;
  textColor?: string;
  contrastColor?: string;
  href?: string;
}
const Test = (props: propType) => {
  return (
    <div
      style={{
        width: props.width || 40,
        height: props.height || 40,
        cursor: props.href ? 'pointer' : 'inherit',
      }}
    >
      <a href={props.href}>
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
          <g>
            <circle
              cx='50'
              cy='50'
              r='43'
              fill='none'
              strokeWidth='9'
              stroke={props.contrastColor || 'black'}
            />
            <path
              d='M50,42c-6-9-20-9,-25,0c-2,5-2,11,0,16c5,9,19,9,25,0l-6-3c-2,5-9,5-11,0c-1-1-1-9,0-10c2-5,9-4,11,0z'
              stroke={props.contrastColor || 'white'}
              fill={props.contrastColor || 'white'}
            />
            <path
              d='M78,42c-6-9-20-9,-25,0c-2,5-2,11,0,16c5,9,19,9,25,0l-6-3c-2,5-9,5-11,0c-1-1-1-9,0-10c2-5,9-4,11,0z'
              stroke={props.contrastColor || 'white'}
              fill={props.contrastColor || 'white'}
            />
          </g>
        </svg>
      </a>
    </div>
  );
};

export default Test;
