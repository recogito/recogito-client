import { useEffect, useState } from 'react';
import { ArrowClockwise } from '@phosphor-icons/react';
import { getBrightness, getRandomColor } from './colorUtils';

import './TagColorPicker.css';

interface TagColorPickerProps {

  color?: string;

  onChange(color?: string): void;

}

const isValidColor = (color: string): boolean => /^#([A-Fa-f0-9]{3}){1,2}$/.test(color);

export const TagColorPicker = (props: TagColorPickerProps) => {

  const { color } = props;

  const [inputValue, setInputValue] = useState(color || '');

  const brightness = color ? getBrightness(color) : 1;

  useEffect(() => setInputValue(color || ''), [color]);

  const onChange = (value: string) => {
    setInputValue(value);

    if (!value) {
      // Empty string clears the color
      props.onChange(undefined);
      return;
    }

    const normalized = value.startsWith('#') ? value : `#${value}`;

    if (isValidColor(normalized))
      props.onChange(normalized);
  };

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
        value={inputValue} 
        onChange={evt => onChange(evt.target.value)} />
    </div>
  )

}