import { useState } from 'react';
import { CaretDown, Check, MagnifyingGlassMinus, MagnifyingGlassPlus } from '@phosphor-icons/react';
import { useAnnotator } from '@annotorious/react';
import * as Select from '@radix-ui/react-select';
import { useTranslation } from 'react-i18next';
import type { PDFScale, VanillaPDFAnnotator } from '@recogito/react-pdf-annotator';

import './PDFControls.css';

export const PDFControls = () => {

  const { t } = useTranslation(['annotation-common', 'annotation-text'])

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
          aria-label={t('PDF zoom level', { ns: 'annotation-text' })}>
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
                <Select.ItemText>{t('Automatic zoom', { ns: 'annotation-text' })}</Select.ItemText>
              </Select.Item>

              <Select.Item value="page-actual" className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <Check />
                </Select.ItemIndicator>
                <Select.ItemText>{t('Original size', { ns: 'annotation-text' })}</Select.ItemText>
              </Select.Item> 

              <Select.Item value="page-width" className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <Check />
                </Select.ItemIndicator>
                <Select.ItemText>{t('Fit width', { ns: 'annotation-text' })}</Select.ItemText>
              </Select.Item> 
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <button 
        onClick={onZoomIn}
        aria-label={t('Zoom in', { ns: 'annotation-common' })}>
        <MagnifyingGlassPlus size={18} />
      </button>

      <button
        onClick={onZoomOut}
        aria-label={t('Zoom out', { ns: 'annotation-common' })}>
        <MagnifyingGlassMinus size={18} />
      </button>
    </div>
  )

}