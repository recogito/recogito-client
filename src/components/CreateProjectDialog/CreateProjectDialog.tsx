import * as Dialog from '@radix-ui/react-dialog';
import type { Translations } from 'src/Types';
import * as Label from '@radix-ui/react-label';
import * as RadioGroup from '@radix-ui/react-radio-group';
import './CreateProjectDialog.css';
import { Button } from '@components/Button';
import { useState } from 'react';

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
    props.onSaveProject(name, description, openJoin, openEdit);
  };

  const visibility = openJoin ? 'public' : 'private';
  const type = openEdit ? 'single_team' : 'assignments';

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
              className='create-project-label-detail text-body-large-bold'
              htmlFor='firstName'
            >
              {t['Project Details']}
            </Label.Root>
            <Label.Root className='create-project-label text-body-small-bold'>
              {t['Name']}
            </Label.Root>
            <input
              className='create-project-input'
              type='text'
              value={name}
              placeholder={t['Name your project']}
              onChange={(evt) => setName(evt.target.value)}
            />
            <Label.Root className='create-project-label text-body-small-bold'>
              {t['Description']}
            </Label.Root>
            <input
              type='text'
              value={description}
              placeholder={t['Describe your project']}
              onChange={(evt) => setDescription(evt.target.value)}
            />
            <div className='create-project-visibility'>
              <Label.Root
                className='create-project-label-detail text-body-large-bold'
                htmlFor='firstName'
              >
                {t['Project Visibility']}
              </Label.Root>
              <div className='create-project-switches'>
                <RadioGroup.Root
                  className='create-project-radio-group-root'
                  defaultValue='private'
                  value={visibility}
                  aria-label='View density'
                  onValueChange={(value) =>
                    value === 'public' ? setOpenJoin(true) : setOpenJoin(false)
                  }
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <RadioGroup.Item
                      className='create-project-radio-group-item'
                      value='private'
                      id='r1'
                    >
                      <RadioGroup.Indicator className='create-project-radio-group-indicator' />
                    </RadioGroup.Item>
                    <label
                      className='create-project-radio-group-label text-body-small-bold'
                      htmlFor='r1'
                    >
                      {t['Private']}
                    </label>
                  </div>
                  <div className='create-project-radio-group-helper text-body-small'>
                    {
                      t[
                        'Project admins choose the users that can join this project'
                      ]
                    }
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <RadioGroup.Item
                      className='create-project-radio-group-item'
                      value='public'
                      id='r2'
                    >
                      <RadioGroup.Indicator className='create-project-radio-group-indicator' />
                    </RadioGroup.Item>
                    <label
                      className='create-project-radio-group-label text-body-small-bold'
                      htmlFor='r2'
                    >
                      {t['Public']}
                    </label>
                  </div>
                  <div className='create-project-radio-group-helper text-body-small'>
                    {
                      t[
                        'Any registered user can join this project without an invitation'
                      ]
                    }
                  </div>
                </RadioGroup.Root>
                <div className='create-project-switches'>
                  <Label.Root
                    className='create-project-label-detail text-body-large-bold'
                    htmlFor='firstName'
                  >
                    {t['Project Type']}
                  </Label.Root>
                  <RadioGroup.Root
                    className='create-project-radio-group-root'
                    defaultValue='assignments'
                    value={type}
                    aria-label='View density'
                    onValueChange={(value) =>
                      value === 'assignments'
                        ? setOpenEdit(false)
                        : setOpenEdit(true)
                    }
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <RadioGroup.Item
                        className='create-project-radio-group-item'
                        value='assignments'
                        id='r3'
                      >
                        <RadioGroup.Indicator className='create-project-radio-group-indicator' />
                      </RadioGroup.Item>
                      <label
                        className='create-project-radio-group-label text-body-small-bold'
                        htmlFor='r3'
                      >
                        {t['Assignments']}
                      </label>
                    </div>
                    <div className='create-project-radio-group-helper text-body-small'>
                      {
                        t[
                          'Project admins create assignments with specific documents and team members'
                        ]
                      }
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <RadioGroup.Item
                        className='create-project-radio-group-item'
                        value='single_team'
                        id='r4'
                      >
                        <RadioGroup.Indicator className='create-project-radio-group-indicator' />
                      </RadioGroup.Item>
                      <label
                        className='create-project-radio-group-label text-body-small-bold'
                        htmlFor='r4'
                      >
                        {t['Single Team']}
                      </label>
                    </div>
                    <div className='create-project-radio-group-helper text-body-small'>
                      {t['Project members can annotate any document']}
                    </div>
                  </RadioGroup.Root>
                </div>
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
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
