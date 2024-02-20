import * as Dialog from '@radix-ui/react-dialog';
import { WarningOctagon } from '@phosphor-icons/react';
import { FormEvent, useState } from 'react';
import { Button } from '@components/Button';
import type { Translations } from 'src/Types';

import './IIIFDialog.css';

interface IIIFDialogProps {

  i18n: Translations;

  onCancel(): void;

  onSubmit(url: string): void;

}

export const IIIFDialog = (props: IIIFDialogProps) => {
  
  const { t } = props.i18n;

  const [value, setValue] = useState('');

  const [invalid, setInvalid] = useState(false);

  const isValid = (url: string) => 
    url && url.startsWith('http') && url.endsWith('.json');

  const onSubmit = (evt: FormEvent) => {
    evt.preventDefault();

    if (isValid(value))
      props.onSubmit(value);
    else
      setInvalid(true);
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
                className={invalid ? "invalid" : undefined}
                value={value} 
                placeholder={t['Paste URL to a IIIF image manifest']}
                onChange={evt => setValue(evt.target.value)} /> 

              {invalid && (
                <p className="invalid-message">
                  <WarningOctagon 
                    className="icon text-bottom" 
                    size={18} weight="fill" /> {t['Please enter a valid IIIF manifest URL']}
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