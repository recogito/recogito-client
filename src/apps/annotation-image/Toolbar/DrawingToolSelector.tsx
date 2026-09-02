import { useEffect, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
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

  onChangeTool(tool: string): void;

}

interface ToolConfig {

  value: string;

  label: string;

  hint: string;

  icon: React.ComponentType<{ size?: number; style?: CSSProperties }>;

  style?: CSSProperties;

}

export const DrawingToolSelector = (props: DrawingToolSelectorProps) => {
  const { t } = useTranslation('annotation-image');

  const TOOLS: ToolConfig[] = [
    { value: 'rectangle', label: t('Box'), hint: t('Create rectangle annotations'), icon: SquareIcon },
    { value: 'polygon', label: t('Polygon'), hint: t('Create polygon annotations'), icon: TriangleIcon, style: { transform: 'rotate(15deg)' }},
    { value: 'ellipse', label: t('Ellipse'), hint: t('Create circle and ellipse annotations'), icon: CircleIcon },
    { value: 'path', label: t('Path'), hint: t('Create polyline path annotations'), icon: LineSegmentsIcon },
    { value: 'intelligent-scissors', label: t('Smart scissors'), hint: t('Trace objects with smart scissors'), icon: ScissorsIcon },
  ];

  const [tool, setTool] = useState<string>(props.tool || 'rectangle');

  const onChange = (value: string) => {
    setTool(value); // Keep local state, even if prop is set to `undefined`
    props.onChangeTool(value);
  }

  useEffect(() => {
    if (props.tool) setTool(props.tool);
  }, [props.tool]);

  const onClick = () => {
    if (!props.active)
      props.onChangeTool(tool);
  }

  const current = TOOLS.find((t) => t.value === tool) ?? TOOLS[0];

  return (
    <Select.Root
      value={tool}
      onValueChange={onChange}>
      <div 
        role="group"
        aria-label={t('Drawing tool')}
        className={classNames('drawing-tool-selector-trigger', props.active && 'active')}>

        <button
          type="button"
          onClick={onClick}
          aria-label={current.hint}>
          <current.icon 
            size={18} 
            style={current.style} />
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
            {TOOLS.map(({ value, label, icon: Icon, style }) => (
              <Select.Item 
                key={value} 
                value={value}
                className="select-item drawing-tool-selector-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <CheckIcon />
                </Select.ItemIndicator>

                <Select.ItemText>
                  <Icon size={18} style={style} />
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