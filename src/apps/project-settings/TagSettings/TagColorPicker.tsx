import { useState } from 'react';
import { ArrowClockwise } from '@phosphor-icons/react';
import { getBrightness, getRandomColor } from './colorUtils';

import './TagColorPicker.css';

interface TagColorPickerProps {

}

export const TagColorPicker = (props: TagColorPickerProps) => {

  const [color, setColor] = useState<string>('');

  const brightness = color ? getBrightness(color) : 1;

  return (
    <div className="tag-color-picker">
      <button
        className="color-preview"
        style={{ 
          backgroundColor: color || '#ffffff',
          borderColor: color || undefined
        }}
        onClick={() => setColor(() => getRandomColor())}>
        <ArrowClockwise style={{ color: brightness > 0.5 ? '#000000' : '#ffffff' }} />
      </button>

      <input 
        className="color-hex" 
        value={color} 
        onChange={evt => setColor(evt.target.value)} />
    </div>
  )

}