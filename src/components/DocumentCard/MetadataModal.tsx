import { X } from '@phosphor-icons/react';
import * as Dialog from '@radix-ui/react-dialog';
import { useFormik } from 'formik';
import { Button } from '@components/Button';
import type { Document, Translations } from 'src/Types';

import './MetadataModal.css';

interface MetadataModalProps {

  i18n: Translations

  document: Document;

  open: boolean;

  onClose(): void;

}

export const MetadataModal = (props: MetadataModalProps) => {

  const { t } = props.i18n;

  const formik = useFormik({
    initialValues: { 
      title: props.document.name,
      author: '',
      publication_date: '',
      license: '',
      version: '',
      copyright: '',
      language: '',
      source: '',
      notes: ''
    },
    onSubmit: values => {

    }
  });

  const input = (label: string, id: keyof typeof formik.values, required?: boolean) => (
    <div className="field">
      <label>{t[label]}</label>
      <input
        id={id}
        name={id}
        onChange={formik.handleChange}
        value={formik.values[id]}
        required={required} />
    </div>
  )

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />

        <Dialog.Content className="dialog-content document-metadata">
          <Dialog.Title className="dialog-title">
            {t['Edit Document Metadata']}
          </Dialog.Title>

          <form onSubmit={formik.handleSubmit}>
            <fieldset>
              {input('Title', 'title', true)}
              {input('Author', 'author')}
              {input('Publication date', 'publication_date')}
              {input('License', 'license')}
              {input('Version', 'version')}
              {input('Copyright', 'copyright')}
              {input('Language', 'language')}
              {input('Source', 'source')}

              <div className="field">
                <label>{t['Notes']}</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={5}
                  onChange={formik.handleChange}
                  value={formik.values.notes} />
              </div>
            </fieldset>

            <div className="actions">
              <Button onClick={props.onClose}>
                {t['Cancel']}
              </Button>

              <Button 
                className="primary" 
                type="submit">
                <span>
                  {t['Save']}
                </span>
              </Button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button className="dialog-close icon-only unstyled" aria-label="Close">
              <X size={16} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

}