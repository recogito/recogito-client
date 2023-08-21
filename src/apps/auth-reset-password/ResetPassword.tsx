import type { Translations } from 'src/Types';

interface ResetPasswordProps {

  i18n: Translations;

}

export const ResetPassword = (props: ResetPasswordProps) => {

  return (
    <div className="reset-password">
      Reset Password
    </div>
  );

}