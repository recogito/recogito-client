import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import TextareaAutosize from 'react-textarea-autosize';
import { useFormik } from 'formik';
import { updateProject } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { Button } from '@components/Button';
import type { ExtendedProjectData } from 'src/Types';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';

interface ProjectDetailsFormProps {

  open: boolean;

  project: ExtendedProjectData;

  onSaved(updated: ExtendedProjectData): void;

  onCancel(): void;

  onError(error: string): void;

}

export const ProjectDetailsForm = (props: ProjectDetailsFormProps) => {

  const { t } = useTranslation(['dashboard-projects', 'common']);

  const { project } = props;

  const [busy, setBusy] = useState(false);

  const onSubmit = (values: { name: string, description?: string }) => {
    const { name, description } = values;

    if (busy)
      return;

    setBusy(true);

    updateProject(supabase, { 
      id: project.id, 
      name, 
      description: description || null 
    }).then(({ error }) => {
      setBusy(false);

      if (error)
        props.onError('Error saving project details');
      else
        props.onSaved({ ...props.project, name, description });
    });
  }

  const formik = useFormik({
    initialValues: { 
      name: project.name,
      description: project.description
    },
    onSubmit
  });

  useEffect(() => {
    formik.setValues({
      name: props.project.name,
      description: props.project.description
    });
  }, [props.open, props.project]);

  return (
    <Dialog.Root 
      open={props.open} 
      onOpenChange={() => !busy && props.onCancel()}>

      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />

        <DialogContent className="invite-users dialog-content">
          <Dialog.Title className="dialog-title">
            {t('Project Details', { ns: 'dashboard-projects' })}
          </Dialog.Title>

          <VisuallyHidden.Root asChild>
            <Dialog.Description>{t('Project Details', { ns: 'dashboard-projects' })}</Dialog.Description>
          </VisuallyHidden.Root>

          <form onSubmit={formik.handleSubmit}>
            <fieldset>
              <div className="field">
                <label>{t('Name', { ns: 'common' })}</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                  placeholder={t('Project name...', { ns: 'dashboard-projects' })}
                  required />
              </div>

              <div className="field">
                <label>{t('Description', { ns: 'dashboard-projects' })}</label>

                <TextareaAutosize 
                  id="description"
                  name="description"
                  rows={1} 
                  maxRows={8}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  placeholder={t('Project description...', { ns: 'dashboard-projects' })}/>
              </div>
            </fieldset>

            <Button 
              busy={busy}
              className="primary" 
              type="submit">

              <span>
                {t('Ok', { ns: 'common' })}
              </span>
            </Button>

            <button onClick={props.onCancel}>
              {t('Cancel', { ns: 'common' })}
            </button>
          </form>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  )

}