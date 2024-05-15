import { ReactNode, createContext, useContext, useState } from 'react';
import type { ColorCoding } from './ColorCoding';

interface ColorStateContextValue {

  colorCoding?: ColorCoding;

  setColorCoding: React.Dispatch<React.SetStateAction<ColorCoding | undefined>>;

}

// @ts-ignore
const ColorStateContext = createContext<ColorStateContextValue>(); 

interface ColorStateProps {

  children: ReactNode;

}

export const ColorState = (props: ColorStateProps) => {

  const [colorCoding, setColorCoding] = useState<ColorCoding | undefined>();

  return (
    <ColorStateContext.Provider value={{ colorCoding, setColorCoding }}>
      {props.children}
    </ColorStateContext.Provider>
  )

}

export const useColorCodingState = () => useContext(ColorStateContext);

export const useColorCoding = () => {
  const { colorCoding } = useContext(ColorStateContext);
  return colorCoding;
}
