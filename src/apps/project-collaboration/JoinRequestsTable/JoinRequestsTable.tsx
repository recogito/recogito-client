import { AnonymousTooltip } from '@components/AnonymousTooltip';
import { formatName } from '@components/Avatar';
import type { ExtendedProjectData, JoinRequest, Translations } from 'src/Types';

import './JoinRequestsTable.css';
import { Button } from '@components/Button';

interface JoinRequestsTableProps {
  i18n: Translations;

  project: ExtendedProjectData;

  requests: JoinRequest[];

  showIgnored: boolean;

  onAcceptUser(user_id: string): void;

  onIgnoreUser(user_id: string): void;
}

export const JoinRequestsTable = (props: JoinRequestsTableProps) => {
  const { t } = props.i18n;

  const list = props.showIgnored
    ? props.requests.sort((a, b) => (a.ignored ? 0 : 1 - (b.ignored ? 0 : 1)))
    : props.requests.filter((r) => !r.ignored);

  return (
    <table className='join-requests-table'>
      <thead>
        <tr>
          <th>{t['Name']}</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {list.map((request) => (
          <tr key={request.id}>
            <td>
              {formatName(request.user) || (
                <span className='anonymous-member'>
                  {t['Anonymous team member']}{' '}
                  <AnonymousTooltip i18n={props.i18n} />
                </span>
              )}
            </td>
            <td>
              <Button
                className='primary'
                onClick={() => props.onAcceptUser(request.user_id)}
              >
                {t['Accept']}
              </Button>
              {request.ignored ? (
                <Button className='primary' disabled>
                  {t['Ignored']}
                </Button>
              ) : (
                <Button
                  className='danger'
                  onClick={() => props.onIgnoreUser(request.user_id)}
                >
                  {t['Ignore']}
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
