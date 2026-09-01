import { useEffect, useState } from 'react';
import classNames from 'classnames';
import * as Select from '@radix-ui/react-select';
import { 
  CaretDownIcon, 
  CheckIcon, 
  CircleIcon, 
  LineSegmentsIcon, 
  ScissorsIcon, 
  SquareIcon, 
  TriangleIcon 
} from '@phosphor-icons/react';

import './DrawingToolSelector.css';

interface DrawingToolSelectorProps {

  active: boolean;

  tool?: string;

  onChangetool(tool: string): void;

}

const TOOLS = [
  { value: 'rectangle', label: 'Box', icon: SquareIcon },
  { value: 'polygon', label: 'Polygon', icon: TriangleIcon },
  { value: 'ellipse', label: 'Ellipse', icon: CircleIcon },
  { value: 'path', label: 'Path', icon: LineSegmentsIcon },
  { value: 'intelligent-scissors', label: 'Smart scissors', icon: ScissorsIcon },
] as const;

export const DrawingToolSelector = (props: DrawingToolSelectorProps) => {

  const [tool, setTool] = useState<string>(props.tool || 'rectangle');

  const onChange = (value: string) => {
    setTool(value); // Keep local state, even if prop is set to `undefined`
    props.onChangetool(value);
  }

  useEffect(() => {
    if (props.tool) setTool(props.tool);
  }, [props.tool]);

  const onClick = () => {
    if (!props.active)
      props.onChangetool(tool);
  }

  const current = TOOLS.find((t) => t.value === tool) ?? TOOLS[0];

  const CurrentIcon = current.icon;

  return (
    <Select.Root 
      value={tool}
      onValueChange={onChange}>
      <div 
        role="group"
        aria-label="Drawing tool"
        className={classNames('drawing-tool-selector-trigger', props.active && 'active')}>

        <button
          type="button"
          onClick={onClick}>
          <CurrentIcon 
            size={18} 
            style={current.value === 'polygon' ? { transform: 'rotate(15deg)' } : undefined} />
          {current.label}
        </button>

        <Select.Trigger className="drawing-tool-selector-more">
          <CaretDownIcon size={12} />
        </Select.Trigger>
      </div>
      
      <Select.Portal>
        <Select.Content
          position="popper" // Somehow, the split button above irritates Radix - this fixes placement
          align="end" 
          alignOffset={-14}
          className="select-content">
          <Select.Viewport className="select-viewport">
            {TOOLS.map(({ value, label, icon: Icon }) => (
              <Select.Item 
                key={value} 
                value={value}
                className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <CheckIcon />
                </Select.ItemIndicator>

                <Select.ItemText>
                  <Icon size={18} style={value === 'polygon' ? { transform: 'rotate(15deg)' } : undefined} />
                  {label}
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )

}