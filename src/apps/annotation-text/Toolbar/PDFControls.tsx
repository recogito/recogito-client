import { useState } from 'react';
import { CaretDown, Check, MagnifyingGlassMinus, MagnifyingGlassPlus } from '@phosphor-icons/react';
import { useAnnotator } from '@annotorious/react';
import * as Select from '@radix-ui/react-select';
import type { PDFScale, VanillaPDFAnnotator } from '@recogito/react-pdf-annotator';
import type { Translations } from 'src/Types';

import './PDFControls.css';

interface PDFControlsProps {

  i18n: Translations;

}

export const PDFControls = (props: PDFControlsProps) => {

  const { t } = props.i18n;

  const anno = useAnnotator<VanillaPDFAnnotator>();

  const [currentScale, setCurrentScale] = useState<number | undefined>();

  const [preset, setPreset] = useState<PDFScale | undefined>('auto');

  const onSelectPreset = (scale: PDFScale) => {
    anno.setScale(scale);
    setPreset(scale);
    setCurrentScale(undefined);
  }

  const onZoomIn = () => {
    const s = anno.zoomIn();
    setCurrentScale(s);
    setPreset(undefined);
  }

  const onZoomOut = () => {
    const s = anno.zoomOut();
    setCurrentScale(s);
    setPreset(undefined);
  }
  return (
    <div className="pdf-scale-controls">
      <Select.Root value={preset} onValueChange={onSelectPreset}>
        <Select.Trigger 
          className="select-trigger"
          aria-label={t['PDF zoom level']}>
          {currentScale ? (
            <span className="custom-scale" >
              <Select.Value /> 
              <span>{Math.round(100 * currentScale)}%</span>
            </span>
          ) : (
            <Select.Value /> 
          )}
          <CaretDown size={12} />
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className="select-content" position="popper">
            <Select.Viewport className="select-viewport">
              <Select.Item value="auto" className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <Check />
                </Select.ItemIndicator>
                <Select.ItemText>{t['Automatic zoom']}</Select.ItemText>
              </Select.Item>

              <Select.Item value="page-actual" className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <Check />
                </Select.ItemIndicator>
                <Select.ItemText>{t['Original size']}</Select.ItemText>
              </Select.Item> 

              <Select.Item value="page-width" className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <Check />
                </Select.ItemIndicator>
                <Select.ItemText>{t['Fit width']}</Select.ItemText>
              </Select.Item> 
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <button 
        onClick={onZoomIn}
        aria-label={t['Zoom in']}>
        <MagnifyingGlassPlus size={18} />
      </button>

      <button
        onClick={onZoomOut}
        aria-label={t['Zoom out']}>
        <MagnifyingGlassMinus size={18} />
      </button>
    </div>
  )

}