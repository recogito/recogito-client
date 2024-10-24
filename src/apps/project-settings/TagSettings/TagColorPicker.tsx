import { useState } from 'react';
import { ArrowClockwise } from '@phosphor-icons/react';
import { getBrightness, getRandomColor } from './colorUtils';

import './TagColorPicker.css';

interface TagColorPickerProps {

}

export const TagColorPicker = (props: TagColorPickerProps) => {

  const [color, setColor] = useState<string>('#ffffff');

  const brightness = getBrightness(color);

  return (
    <div className="tag-color-picker">
      <button
        className="color-preview"
        style={{ 
          backgroundColor: color
        }}
        onClick={() => setColor(e => getRandomColor())}>
        <ArrowClockwise style={{ color: brightness > 0.5 ? '#000' : '#fff' }} />
      </button>

      <input 
        className="color-hex" 
        value={color} 
        onChange={evt => setColor(evt.target.value)} />
    </div>
  )

}