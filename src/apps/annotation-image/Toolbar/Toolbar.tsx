import { useEffect, useState } from 'react';
import { useAnnotator } from '@annotorious/react';
import { PrivacySelector } from '@components/PrivacySelector';
import { Polygon, Rectangle } from './Icons';
import { Cursor } from '@phosphor-icons/react';

interface ToolbarProps {

  onChangeTool: (tool: string | null) => void;

}

export const Toolbar = (props: ToolbarProps) => {

  const anno = useAnnotator();

  const [tool, setTool] = useState<string>('cursor');

  const onChangeTool = (tool: string) => {
    props.onChangeTool && props.onChangeTool(tool === 'cursor' ? null : tool);
    setTool(tool);
  }

  useEffect(() => {
    if (anno) {
      // Switch back to nav mode after annotation was created
      const onCreate = () => onChangeTool('cursor');

      anno.on('createAnnotation', onCreate);

      return () => {
        anno.off('createAnnotation', onCreate);
      }
    }
  }, [anno]);

  return (
    <div className="anno-desktop-overlay ia-toolbar">
      <section>
        <button 
          className={tool === 'cursor' ? 'active' : undefined}
          onClick={() => onChangeTool('cursor')}>
          <Cursor size={18} />
        </button>

        <button 
          className={tool === 'box' ? 'active' : undefined}
          onClick={() => onChangeTool('box')}>
          <Rectangle />
        </button>

        <button 
          className={tool === 'polygon' ? 'active' : undefined}
          onClick={() => onChangeTool('polygon')}>
          <Polygon />
        </button>
      </section>

      <div className="anno-desktop-overlay-divider anno-desktop-overlay-divider-v" />

      {/*
        <section className="privacy">
          <PrivacySelector />
        </section>
      */}
    </div>
  )

}