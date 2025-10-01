import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { updateMyProfile } from '@backend/crud/profiles';
import { supabase } from '@backend/supabaseBrowserClient';
import { Avatar } from '@components/Avatar';
import { Toast, ToastProvider } from '@components/Toast';
import type { ToastContent } from '@components/Toast';
import { TopBar } from '@components/TopBar';
import type { Translations, MyProfile } from 'src/Types';
import { getGravatar } from './getGravatar';

import './AccountPreferences.css';

interface AccountPreferencesProps {
  i18n: Translations;

  profile: MyProfile;
}

export const AccountPreferences = (props: AccountPreferencesProps) => {
  const { t } = props.i18n;

  const { profile } = props;

  const [error, setError] = useState<ToastContent | null>(null);

  const [gravatar, setGravatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    getGravatar(profile.email).then(setGravatar);
  }, []);

  const onError = (error: string) =>
    setError({
      title: t['Something went wrong'],
      description: t[error] || error,
      type: 'error',
    });

  const formik = useFormik({
    initialValues: {
      nickname: profile.nickname || '',
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      avatar_url: profile.avatar_url || '',
    },

    onSubmit: (values) => {
      updateMyProfile(supabase, values).then(({ error }) => {
        if (error) {
          console.error(error);
          setError({
            title: t['Something went wrong'],
            description: t['Could not update your profile information.'],
            type: 'error',
          });
        } else {
          // Note: unlike window.history.back(), this also reloads the page.
          // If we use .back(), the profile nag dialog would pop up again
          // even if the user has just set a name.
          window.location.href = document.referrer;
        }
      });
    },
  });

  const onCancel = () => (window.location.href = document.referrer);

  return (
    <ToastProvider>
      <div className='dashboard-account-preferences'>
        <TopBar i18n={props.i18n} onError={onError} me={profile} />

        <main>
          <h1>{t['Your User Profile']}</h1>
          <form onSubmit={formik.handleSubmit}>
            <fieldset>
              <div className='field'>
                <label htmlFor='email'>{t['E-Mail']}</label>
                <input
                  readOnly
                  id='email'
                  name='email'
                  type='text'
                  value={profile.email}
                />
              </div>

              {gravatar && !(gravatar === formik.values.avatar_url) && (
                <div className='gravatar-preview'>
                  <Avatar id={gravatar} avatar={gravatar} />
                  <span>{t['We found a Gravatar for your address.']}</span>{' '}
                  <button
                    type='button'
                    className='link'
                    onClick={() => formik.setFieldValue('avatar_url', gravatar)}
                  >
                    {t['Use as my Avatar.']}
                  </button>
                </div>
              )}
            </fieldset>

            <h2>{t['Public Information']}</h2>

            <p className='public-information-hint'>
              {
                t[
                  'Other users can see this information about you. All fields are optional.'
                ]
              }
            </p>

            <fieldset>
              <div className='field'>
                <label htmlFor='nickname'>{t['Nickname']}</label>
                <input
                  id='nickname'
                  name='nickname'
                  type='text'
                  onChange={formik.handleChange}
                  value={formik.values.nickname}
                />
              </div>

              <div className='field'>
                <label htmlFor='first_name'>{t['First Name']}</label>
                <input
                  id='first_name'
                  name='first_name'
                  type='text'
                  onChange={formik.handleChange}
                  value={formik.values.first_name}
                />
              </div>

              <div className='field'>
                <label htmlFor='last_name'>{t['Last Name']}</label>
                <input
                  id='last_name'
                  name='last_name'
                  type='text'
                  onChange={formik.handleChange}
                  value={formik.values.last_name}
                />
              </div>

              <div className='field'>
                <label htmlFor='avatar_url'>{t['Avatar URL']}</label>
                <input
                  id='avatar_url'
                  name='avatar_url'
                  type='text'
                  onChange={formik.handleChange}
                  value={formik.values.avatar_url}
                />
              </div>
            </fieldset>

            <div className='actions'>
              <button className='unstyled' type='button' onClick={onCancel}>
                {t['Cancel']}
              </button>

              <button className='primary' type='submit'>
                {t['Save']}
              </button>
            </div>
          </form>
        </main>
      </div>

      <Toast content={error} onOpenChange={(open) => !open && setError(null)} />
    </ToastProvider>
  );
};
