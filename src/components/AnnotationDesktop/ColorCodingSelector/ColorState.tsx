import { ReactNode, createContext, useContext, useState } from 'react';
import type { ColorCoding } from './ColorCoding';

interface ColorStateContextValue {

  coding?: ColorCoding;

  setCoding: React.Dispatch<React.SetStateAction<ColorCoding | undefined>>;

}

// @ts-ignore
const ColorStateContext = createContext<ColorStateContextValue>(); 

interface ColorStateProps {

  children: ReactNode;

}

export const ColorState = (props: ColorStateProps) => {

  const [coding, setCoding] = useState<ColorCoding | undefined>();

  return (
    <ColorStateContext.Provider value={{ coding, setCoding }}>
      {props.children}
    </ColorStateContext.Provider>
  )

}

export const useColorCodingState = () => useContext(ColorStateContext);

export const useColorCoding = () => {
  const { coding } = useContext(ColorStateContext);
  return coding
}
