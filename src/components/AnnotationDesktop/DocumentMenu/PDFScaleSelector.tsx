import { useEffect, useState } from 'react';
import type { PDFScale } from '@recogito/react-pdf-annotator';
import { CaretDown, Check } from '@phosphor-icons/react';
import * as Select from '@radix-ui/react-select';

interface PDFScaleSelectorProps {

  currentScale?: number;

  onSetScale(scale: PDFScale): void;

}

export const PDFScaleSelector = (props: PDFScaleSelectorProps) => {

  const [selected, _setSelected] = useState<PDFScale | undefined>('auto');

  const setSelected = (scale: PDFScale) => {
    props.onSetScale(scale);
    _setSelected(scale);
  }

  useEffect(() => {
    if (props.currentScale)
      _setSelected(undefined);
  }, [props.currentScale]);

  return (
    <Select.Root value={selected} onValueChange={setSelected}>
      <Select.Trigger 
        className="select-trigger"
        aria-label="PDF zoom level">
        {props.currentScale ? (
          <span className="custom-scale" >
            <Select.Value /> 
            <span>{Math.round(100 * props.currentScale)}%</span>
          </span>
        ) : (
          <Select.Value /> 
        )}
        <CaretDown size={12} />
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="select-content">
          <Select.Viewport className="select-viewport">
            <Select.Item value="auto" className="select-item">
              <Select.ItemIndicator className="select-item-indicator">
                <Check />
              </Select.ItemIndicator>
              <Select.ItemText>Automatic zoom</Select.ItemText>
            </Select.Item>

            <Select.Item value="page-actual" className="select-item">
              <Select.ItemIndicator className="select-item-indicator">
                <Check />
              </Select.ItemIndicator>
              <Select.ItemText>Original size</Select.ItemText>
            </Select.Item> 

            {/*
            <Select.Item value="page-fit" className="select-item">
              <Select.ItemIndicator className="select-item-indicator">
                <Check />
              </Select.ItemIndicator>
              <Select.ItemText>Fit page</Select.ItemText>
            </Select.Item> 
            */}

            <Select.Item value="page-width" className="select-item">
              <Select.ItemIndicator className="select-item-indicator">
                <Check />
              </Select.ItemIndicator>
              <Select.ItemText>Fit width</Select.ItemText>
            </Select.Item> 
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )

}