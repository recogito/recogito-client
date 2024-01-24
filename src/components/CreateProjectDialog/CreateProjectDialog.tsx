import * as Dialog from '@radix-ui/react-dialog';
import type { Translations } from 'src/Types';
import * as Switch from '@radix-ui/react-switch';
import * as Label from '@radix-ui/react-label';
import './CreateProjectDialog.css';
import { Button } from '@components/Button';
import { useState } from 'react';
import { InfoTooltip } from '@components/InfoTooltip';

interface CreateProjectDialogProps {
  open: boolean;

  i18n: Translations;

  onSaveProject(
    name: string,
    description: string,
    isOpenJoin: boolean,
    isOpenEdit: boolean
  ): void;

  onClose(): void;
}

export const CreateProjectDialog = (props: CreateProjectDialogProps) => {
  const { t } = props.i18n;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [openJoin, setOpenJoin] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const handleCreateProject = () => {
    props.onSaveProject(name, description, !!openJoin, !!openEdit);
  };

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <Dialog.Content className='dialog-content'>
          <Dialog.Title className='dialog-title'>
            {t['Create Project']}
          </Dialog.Title>
          <div className='create-project-root'>
            <Label.Root
              className='create-project-label-root'
              htmlFor='firstName'
            >
              {t['Project Name']}
            </Label.Root>
            <input
              className='create-project-input'
              type='text'
              value={name}
              placeholder={t['Name your project']}
              onChange={(evt) => setName(evt.target.value)}
            />
            <Label.Root
              className='create-project-label-root'
              htmlFor='firstName'
            >
              {t['Project Description']}
            </Label.Root>
            <input
              type='text'
              value={description}
              placeholder={t['Describe your project']}
              onChange={(evt) => setDescription(evt.target.value)}
            />
            <div className='create-project-switches'>
              <InfoTooltip content={t['open-join-info']} />
              <label
                className='create-project-switch-label'
                htmlFor='open-join'
                style={{ paddingRight: 15 }}
              >
                {t['Open Join']}
              </label>
              <Switch.Root
                className='create-project-switch-root'
                id='open-join'
                onChange={() => setOpenJoin(!openJoin)}
              >
                <Switch.Thumb className='create-project-switch-thumb' />
              </Switch.Root>
              <div style={{ width: 24 }} />
              <InfoTooltip content={t['open-edit-info']} />
              <label
                className='create-project-switch-label'
                htmlFor='open-edit'
                style={{ paddingRight: 15 }}
              >
                {t['Open Edit']}
              </label>
              <Switch.Root
                className='create-project-switch-root'
                id='open-edit'
                onChange={() => setOpenEdit(!openEdit)}
              >
                <Switch.Thumb className='create-project-switch-thumb' />
              </Switch.Root>
            </div>
            <div className='create-project-buttons'>
              <Button type='button' className='sm' onClick={props.onClose}>
                {t['Cancel']}
              </Button>

              <Button
                disabled={name.length === 0 || description.length === 0}
                className='primary sm'
                onClick={handleCreateProject}
              >
                {t['Create']}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
