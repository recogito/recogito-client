import { getDownloadURL } from '@backend/storage';
import { supabase } from '@backend/supabaseBrowserClient';
import { ConfirmedAction } from '@components/ConfirmedAction';
import { CloudArrowDownIcon, DotsThreeVerticalIcon, TrashIcon } from '@phosphor-icons/react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useEffect, useState } from 'react';
import type { Job, Translations } from 'src/Types';

interface Props {
  i18n: Translations;
  job: Job;
  onDelete(): void;
}

export const JobActions = (props: Props) => {
  const [confirming, setConfirming] = useState<boolean>(false);
  const [downloadURL, setDownloadURL] = useState<string | undefined>();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const { t } = props.i18n;

  const onSelectOption = (fn?: () => void) => () => {
    fn?.();
    setMenuOpen(false);
  };

  useEffect(() => {
    getDownloadURL(supabase, props.job.id, 'jobs')
      .then(setDownloadURL);
  }, [props.job.id]);

  return (
    <ConfirmedAction.Root open={confirming} onOpenChange={setConfirming}>
      <Dropdown.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dropdown.Trigger asChild>
          <button
            className='unstyled icon-only'
            aria-label={`${t['Menu actions for job:']} ${props.job.name}`}
          >
            <DotsThreeVerticalIcon weight='bold' size={22} />
          </button>
        </Dropdown.Trigger>

        <Dropdown.Portal>
          <Dropdown.Content
            align='end'
            className='dropdown-content no-icons'
            sideOffset={5}
          >
            {downloadURL && (
              <Dropdown.Item
                aria-label={t['Download']}
                className='dropdown-item'
              >
                <a href={downloadURL} target='_blank' aria-label={t['help']} rel='noreferrer'>
                  <CloudArrowDownIcon size={16} />{' '}
                  <span>{t['Download']}</span>
                </a>
              </Dropdown.Item>
            )}
            <ConfirmedAction.Trigger>
              <Dropdown.Item
                aria-label={t['remove this job']}
                className='dropdown-item'
              >
                <TrashIcon size={16} className='destructive' />{' '}
                <span>{t['Delete job']}</span>
              </Dropdown.Item>
            </ConfirmedAction.Trigger>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>

      <ConfirmedAction.Dialog
        i18n={props.i18n}
        title={t['Are you sure?']}
        description={t['Are you sure you want to remove this job?']}
        cancelLabel={t['Cancel']}
        confirmLabel={
          <>
            <TrashIcon size={16} /> <span>{t['Delete job']}</span>
          </>
        }
        onConfirm={onSelectOption(() => props.onDelete())}
      />
    </ConfirmedAction.Root>
  );
};