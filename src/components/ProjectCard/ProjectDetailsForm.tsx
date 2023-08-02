import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import TextareaAutosize from 'react-textarea-autosize';
import { useFormik } from 'formik';
import { updateProject } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { Button } from '@components/Button';
import type { ExtendedProjectData, Translations } from 'src/Types';

interface ProjectDetailsFormProps {

  i18n: Translations;

  open: boolean;

  project: ExtendedProjectData;

  onSaved(updated: ExtendedProjectData): void;

  onCancel(): void;

  onError(error: string): void;

}

export const ProjectDetailsForm = (props: ProjectDetailsFormProps) => {

  const { t } = props.i18n;

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

        <Dialog.Content className="invite-users dialog-content">
          <Dialog.Title className="dialog-title">
            Project Details
          </Dialog.Title>

          <form onSubmit={formik.handleSubmit}>
            <fieldset>
              <div className="field">
                <label>Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                  placeholder="Project name..." 
                  required />
              </div>

              <div className="field">
                <label>Description</label>

                <TextareaAutosize 
                  id="description"
                  name="description"
                  rows={1} 
                  maxRows={8}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  placeholder="Project description..." />
              </div>
            </fieldset>

            <Button 
              busy={busy}
              className="primary" 
              type="submit">

              <span>
                Ok
              </span>
            </Button>

            <button onClick={props.onCancel}>Cancel</button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

}