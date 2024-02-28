import { FormEvent, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, WarningOctagon } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import { Spinner } from '@components/Spinner';
import { useIIIFValidation } from './useIIIFValidation';
import type { Protocol, Translations } from 'src/Types';

import './IIIFDialog.css';

export interface IIIFManifest {

  url: string;

  protocol: Protocol;

}

interface IIIFDialogProps {

  i18n: Translations;

  onCancel(): void;

  onSubmit(manifest: IIIFManifest): void;

}

export const IIIFDialog = (props: IIIFDialogProps) => {
  
  const { t } = props.i18n;

  const [value, setValue] = useState('');

  const {    
    isFetching,
    isValid,
    lastError,
    result 
  } = useIIIFValidation(value);

  const onSubmit = (evt: FormEvent) => {
    evt.preventDefault();

    if (value && isValid) {
      const manifest: IIIFManifest = {
        url: value,
        protocol: result?.type === 'image' ? 'IIIF_IMAGE' : 'IIIF_PRESENTATION'
      };

      props.onSubmit(manifest);
    }
  }

  return (
    <Dialog.Root open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content import-iiif-dialog">
          <form onSubmit={onSubmit}>
            <Dialog.Title className="dialog-title">{t['Import IIIF']}</Dialog.Title>
              <input 
                type="text" 
                className={lastError && value ? "invalid" : undefined}
                value={value} 
                placeholder={t['Paste URL to a IIIF image manifest']}
                onChange={evt => setValue(evt.target.value)} /> 

              {isFetching ? (
                <p className="message fetching">
                  <Spinner 
                    className="icon text-bottom" 
                    size={12} /> Validating manifest
                </p>
              ) : lastError && value ? (
                <p className="message invalid">
                  <WarningOctagon 
                    className="icon text-bottom" 
                    size={18} weight="fill" /> {lastError}
                </p>
              ) : value && result && (
                <p className="message valid">
                  <Check 
                    className="icon text-bottom" 
                    size={18} /> 
                    
                  <span>
                    Valid manifest: {result.type === 'image' ? 'IIIF Image API' : 'IIIF Presentation API'} v{result.majorVersion}
                  </span>
                </p>   
              )}

              <div className="buttons">
                <Button 
                  type="button"
                  className="sm"
                  onClick={props.onCancel}>
                  {t['Cancel']}
                </Button>  

                <Button 
                  disabled={!value || !isValid}
                  type="submit" 
                  className="primary sm">
                  {t['Ok']}
                </Button>
              </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

}