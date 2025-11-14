import { useEffect, useState } from 'react';
import {
  CaretDown,
  CaretUp,
  CaretUpDown,
  Check,
  CheckSquare,
  Square,
} from '@phosphor-icons/react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { AnonymousTooltip } from '@components/AnonymousTooltip';
import { formatName } from '@components/Avatar';
import { TimeAgo } from '@components/TimeAgo';
import type {
  ExtendedProjectData,
  Group,
  UserProfile,
} from 'src/Types';
import type { AssignmentSpec } from '../AssignmentSpec';
import { useSelectableRows } from '../useSelectableRows';
import { RadioCards } from '@components/RadioCards';
import { Theme } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import './Team.css';

interface TeamProps {

  me: UserProfile;

  assignment: AssignmentSpec;

  project: ExtendedProjectData;

  onChangeTeamMode(assignAll: boolean): void;

  onCancel(): void;

  onBack(): void;

  onNext(): void;

  onChangeTeam(members: UserProfile[]): void;
}

interface Member {
  id: string;

  name: string;

  user: UserProfile;

  since: string;

  isAdmin: boolean;
}

type Field = 'name' | 'since';

interface Sorting {
  field: Field;

  ascending: boolean;
}

// Flattens list of groups to the list of members, sorted by 'since'
const getMembers = (groups: Group[], sorting?: Sorting): Member[] =>
  groups
    .reduce(
      (members, group) => [
        ...members,
        ...group.members.map(({ user, since }) => ({
          id: user.id,
          name: user.nickname!, // TODO just a hack for now
          user,
          since,
          isAdmin: group.is_admin,
        })),
      ],
      [] as Member[]
    )
    .sort((a, b) => {
      if (sorting) {
        const { field } = sorting;
        const order = sorting.ascending ? -1 : 1;
        return a[field] < b[field] ? -order : a[field] > b[field] ? order : 0;
      } else {
        return 0;
      }
    });

export const Team = (props: TeamProps) => {
  const { t, i18n } = useTranslation(['project-assignments', 'common']);

  const [sorting, setSorting] = useState<Sorting | undefined>({
    field: 'name',
    ascending: false,
  });

  const members = getMembers(props.project.groups, sorting);

  const { selected, toggleSelected, toggleAll, isAllSelected } =
    useSelectableRows(
      members,
      props.assignment.team.map((u) => u.id)
    );

  useEffect(() => {
    const members = props.project.groups.reduce(
      (members, group) => [
        ...members,
        ...group.members
          .map((m) => m.user)
          .filter((u) => selected.includes(u.id)),
      ],
      [] as UserProfile[]
    );

    props.onChangeTeam(members);
  }, [selected, props.project.groups]);

  const onChangeTeamMode = (assignAll: boolean) => {
    props.onChangeTeamMode(assignAll);
  };

  const sortBy = (field: Field) => () =>
    setSorting((sorting) => {
      if (sorting?.field === field) {
        return { field, ascending: !sorting.ascending };
      } else {
        return { field, ascending: true };
      }
    });

  // Returns the proper sort icon for the given field and
  // current sorting
  const sortIcon = (field: string) =>
    sorting?.field === field ? (
      sorting.ascending ? (
        <CaretDown size={12} weight='bold' />
      ) : (
        <CaretUp size={12} weight='bold' />
      )
    ) : (
      <CaretUpDown size={12} />
    );

  const isMe = (member: Member) => member.user.id === props.me.id;

  return (
    <>
      <Theme className='tab-team-theme'>
        <div className='row tab-team'>
          <section className='column'>
            <h1>{t('Step', { ns: 'project-assignments' })} 4</h1>
            <p>{t('Add people to the assignment.', { ns: 'project-assignments' })}</p>
          </section>

          <section className='column'>
            <div className='tab-team-mode'>
              <div className='text-body-bold tab-team-mode-header'>
                {t('Who has access to this assignment?', { ns: 'project-assignments' })}
              </div>
              <RadioCards
                entries={[
                  { id: 'all', label: t('All team members', { ns: 'project-assignments' }) },
                  { id: 'select', label: t('Select team members', { ns: 'project-assignments' }) },
                ]}
                onSelect={(id) => onChangeTeamMode(id === 'all')}
                activeEntry={
                  props.assignment.assign_all_members ? 'all' : 'select'
                }
              />
            </div>
            {!props.assignment.assign_all_members && (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>
                        <Checkbox.Root
                          className='checkbox-root'
                          checked={isAllSelected}
                          onCheckedChange={toggleAll}
                        >
                          <Checkbox.Indicator>
                            <CheckSquare size={20} weight='fill' />
                          </Checkbox.Indicator>

                          {!isAllSelected && (
                            <span>
                              <Square size={20} />
                            </span>
                          )}
                        </Checkbox.Root>
                      </th>

                      <th>
                        <button onClick={sortBy('name')}>
                          {t('Name', { ns: 'common' })} {sortIcon('name')}
                        </button>
                      </th>

                      <th>
                        <button onClick={sortBy('since')}>
                          {t('Member since', { ns: 'project-assignments' })} {sortIcon('since')}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.user.id}>
                        <td>
                          <Checkbox.Root
                            className='checkbox-root'
                            checked={
                              member.isAdmin || selected.includes(member.id)
                            }
                            disabled={member.isAdmin}
                            onCheckedChange={(checked) =>
                              toggleSelected(member, checked)
                            }
                          >
                            <Checkbox.Indicator>
                              <CheckSquare size={20} weight='fill' />
                            </Checkbox.Indicator>

                            {!selected.includes(member.id) &&
                              !member.isAdmin && (
                                <span>
                                  <Square size={20} />
                                </span>
                              )}
                          </Checkbox.Root>
                        </td>

                        <td>
                          {formatName(member.user) || (
                            <span className='anonymous-member'>
                              {t('Anonymous team member', { ns: 'common' })}{' '}
                              <AnonymousTooltip />
                            </span>
                          )}
                          {isMe(member) && (
                            <span className='badge'>{t('You', { ns: 'common' })}</span>
                          )}
                        </td>

                        <td>
                          <TimeAgo
                            datetime={member.since}
                            locale={i18n.language}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {selected.length === 1 ? (
                  <p className='hint ok'>
                    <Check size={16} /> {t('Selected 1 team member', { ns: 'project-assignments' })}
                  </p>
                ) : (
                  <p
                    className={selected.length === 0 ? 'hint check' : 'hint ok'}
                  >
                    <Check size={16} />{' '}
                    {t('Selected ${n} team members', { ns: 'project-assignments' }).replace(
                      '${n}',
                      selected.length.toString()
                    )}
                  </p>
                )}
              </>
            )}
          </section>
        </div>

        <section className='wizard-nav'>
          <button onClick={props.onCancel}>{t('Cancel', { ns: 'common' })}</button>

          <button onClick={props.onBack}>{t('Back', { ns: 'project-assignments' })}</button>

          <button className='primary' onClick={props.onNext}>
            {t('Next', { ns: 'project-assignments' })}
          </button>
        </section>
      </Theme>
    </>
  );
};
