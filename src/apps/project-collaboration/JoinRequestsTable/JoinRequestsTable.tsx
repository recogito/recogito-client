import { AnonymousTooltip } from '@components/AnonymousTooltip';
import { formatName } from '@components/Avatar';
import type { ExtendedProjectData, JoinRequest } from 'src/Types';
import { Button } from '@components/Button';
import { useTranslation } from 'react-i18next';

import './JoinRequestsTable.css';

interface JoinRequestsTableProps {

  project: ExtendedProjectData;

  requests: JoinRequest[];

  showIgnored: boolean;

  onAcceptUser(user_id: string): void;

  onIgnoreUser(user_id: string): void;
}

export const JoinRequestsTable = (props: JoinRequestsTableProps) => {
  const { t } = useTranslation(['common', 'project-collaboration']);

  const list = props.showIgnored
    ? props.requests.sort((a, b) => (a.ignored ? 0 : 1 - (b.ignored ? 0 : 1)))
    : props.requests.filter((r) => !r.ignored);

  return (
    <table className='join-requests-table'>
      <thead>
        <tr>
          <th>{t('Name', { ns: 'common' })}</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {list.map((request) => (
          <tr key={request.id}>
            <td>
              {formatName(request.user) || (
                <span className='anonymous-member'>
                  {t('Anonymous team member', { ns: 'common' })}{' '}
                  <AnonymousTooltip />
                </span>
              )}
            </td>
            <td>
              <Button
                className='primary'
                onClick={() => props.onAcceptUser(request.user_id)}
              >
                {t('Accept', { ns: 'common' })}
              </Button>
              {request.ignored ? (
                <Button className='primary' disabled>
                  {t('Ignored', { ns: 'project-collaboration' })}
                </Button>
              ) : (
                <Button
                  className='danger'
                  onClick={() => props.onIgnoreUser(request.user_id)}
                >
                  {t('Ignore', { ns: 'common' })}
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
