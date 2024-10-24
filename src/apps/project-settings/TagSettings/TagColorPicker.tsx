import { ArrowClockwise } from '@phosphor-icons/react';
import { getBrightness, getRandomColor } from './colorUtils';

import './TagColorPicker.css';

interface TagColorPickerProps {

  color?: string;

  onChange(color?: string): void;

}

export const TagColorPicker = (props: TagColorPickerProps) => {

  const { color } = props;

  const brightness = color ? getBrightness(color) : 1;

  return (
    <div className="tag-color-picker">
      <button
        className="color-preview"
        style={{ 
          backgroundColor: color || '#ffffff',
          borderColor: color || undefined
        }}
        onClick={() => props.onChange(getRandomColor())}>
        <ArrowClockwise style={{ color: brightness > 0.5 ? '#000000' : '#ffffff' }} />
      </button>

      <input 
        className="color-hex" 
        value={color} 
        onChange={evt => props.onChange(evt.target.value)} />
    </div>
  )

}