import { useState } from 'react';
import { ArrowClockwise } from '@phosphor-icons/react';
import { getBrightness, getRandomColor } from './colorUtils';

interface TagColorPickerProps {

}

export const TagColorPicker = (props: TagColorPickerProps) => {

  const [color, setColor] = useState<string>('#ffffff');

  const brightness = getBrightness(color);

  return (
    <div>
      <button
        style={{ 
          backgroundColor: color
        }}
        onClick={() => setColor(e => getRandomColor())}>
        <ArrowClockwise style={{ color: brightness > 0.5 ? '#000' : '#fff' }} />
      </button>

      <input 
        id="color"
        className="col-span-3 bg-white" 
        value={color} 
        onChange={evt => setColor(evt.target.value)} />
    </div>
  )

}