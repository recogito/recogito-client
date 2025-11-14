import { type FormEvent, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, WarningOctagon } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import { Spinner } from '@components/Spinner';
import { useIIIFValidation } from './useIIIFValidation';
import type { Protocol } from 'src/Types';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';

import './IIIFDialog.css';

export interface IIIFManifest {

  label?: string;

  url: string;

  protocol: Protocol;

}

interface IIIFDialogProps {

  onCancel(): void;

  onSubmit(manifest: IIIFManifest): void;

}

export const IIIFDialog = (props: IIIFDialogProps) => {
  
  const { t, i18n } = useTranslation(['project-home', 'common']);

  const [value, setValue] = useState('');

  const {    
    isFetching,
    isValid,
    lastError,
    result 
  } = useIIIFValidation(value, i18n.language);

  const onSubmit = (evt: FormEvent) => {
    evt.preventDefault();

    if (value && isValid) {
      const manifest: IIIFManifest = {
        label: result?.label,
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
        <DialogContent className="dialog-content import-iiif-dialog">
          <form onSubmit={onSubmit}>
            <Dialog.Title className="dialog-title">{t('Import IIIF', { ns: 'project-home' })}</Dialog.Title>
              <input 
                type="text" 
                className={lastError && value && !isFetching ? "invalid" : undefined}
                value={value} 
                placeholder={t('Paste URL to a IIIF manifest', { ns: 'project-home' })}
                onChange={evt => setValue(evt.target.value)} /> 

              {isFetching ? (
                <p className="message fetching">
                  <Spinner 
                    className="icon text-bottom" 
                    size={12} /> {t('Validating manifest', { ns: 'project-home' })}
                </p>
              ) : lastError && value ? (
                <p className="message invalid">
                  <WarningOctagon 
                    className="icon text-bottom" 
                    size={18} weight="fill" /> {t(lastError)}
                </p>
              ) : value && result && (
                <p className="message valid">
                  <Check 
                    className="icon text-bottom" 
                    size={18} /> 
                    
                  <span>
                    {t('Valid manifest:', { ns: 'project-home' })} {result.type === 'image' ? 'IIIF Image API' : 'IIIF Presentation API'} v{result.majorVersion}
                  </span>
                </p>   
              )}

              <div className="buttons">
                <Button 
                  type="button"
                  className="sm"
                  onClick={props.onCancel}>
                  {t('Cancel', { ns: 'common' })}
                </Button>  

                <Button 
                  disabled={!value || !isValid}
                  type="submit" 
                  className="primary sm">
                  {t('Ok', { ns: 'common' })}
                </Button>
              </div>
          </form>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  )

}