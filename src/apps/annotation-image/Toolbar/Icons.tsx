import './Icons.css';

export const Polygon = () => {

  return (
    <svg className="ia-tool" viewBox="0 0 70 40">
      <path d='M 5,14 60,5 55,45 18,38 Z' />
    </svg>
  )
}

export const Rectangle = () => {

  return (
    <svg className="ia-tool" viewBox="0 0 70 44">
      <rect x="16" y="8" width="40" height="36" />
    </svg>
  )

}


export const Ellipse = () => {

  return (
    <svg className="ia-tool" viewBox="0 0 70 44">
      <ellipse cx="35" cy="22" rx="27" ry="22" />
    </svg>
  )

}

export const Spline = () => {

  return (
    <svg className="ia-tool" viewBox="0 0 70 44">
      <path d='M 6,34 C 20,4 30,42 35,22 C 40,2 50,40 64,10' fill="none" />
    </svg>
  )

}