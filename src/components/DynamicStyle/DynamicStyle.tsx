import { useEffect } from 'react';

interface DynamicStyleProps {
  style: string | undefined;
}

export const DynamicStyle = (props: DynamicStyleProps) => {
  useEffect(() => {
    if (props.style) {
      const style = document.createElement('style');
      style.innerHTML = props.style;
      document.head.appendChild(style);
    }
  }, [props.style]);

  return <></>;
};
