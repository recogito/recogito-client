import { CheckSquare, Square } from '@phosphor-icons/react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { TimeAgo } from '@components/TimeAgo';
import type { ExtendedProjectData, ProjectGroup, Translations, UserProfile } from 'src/Types';
import { useSelectableRows } from '../useSelectableRows';

interface TeamProps {

  i18n: Translations;

  project: ExtendedProjectData;

  onCancel(): void;

  onBack(): void;

  onNext(): void;

}

interface Member {

  id: string;

  user: UserProfile;

  since: string;

}

// Flattens list of groups to the list of members, sorted by 'since'
const getMembers = (groups: ProjectGroup[]): Member[] => groups
  .reduce((members, group) => ([
    ...members, 
    ...group.members.map(({ user, since }) => ({ id: user.id, user, since }))
  ]), [] as Member[])
  .sort((a, b) => 
    (a.since < b.since) ? -1 : (a.since > b.since) ? 1 : 0);

export const Team = (props: TeamProps) => {

  const members = getMembers(props.project.groups);

  const { 
    selected, 
    toggleSelected, 
    toggleAll, 
    isAllSelected 
  } = useSelectableRows(members);

  return (
    <>
      <div className="row tab-team">
        <section className="column">
          <h1>Step 2</h1>
          <p>
            Add people to the assignment.
          </p>
        </section>

        <section className="column">
          <table>
           <thead>
              <tr>
                <th>
                  <Checkbox.Root 
                    className="checkbox-root"
                    checked={isAllSelected}
                    onCheckedChange={toggleAll}>
                    
                    <Checkbox.Indicator>
                      <CheckSquare size={20} weight="fill" /> 
                    </Checkbox.Indicator>

                    {!isAllSelected && (
                      <span><Square size={20} /></span>
                    )}
                  </Checkbox.Root>
                </th>

                <th>
                  Name
                </th>

                <th>
                  Member since
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.user.id}>
                  <td>
                    <Checkbox.Root 
                      className="checkbox-root"
                      checked={selected.includes(member.id)}
                      onCheckedChange={checked => toggleSelected(member, checked)}>

                      <Checkbox.Indicator>
                        <CheckSquare size={20} weight="fill" />  
                      </Checkbox.Indicator>

                      {!selected.includes(member.id) && (
                        <span><Square size={20} /></span>
                      )}
                    </Checkbox.Root>
                  </td>

                  <td>
                    {member.user.nickname}
                  </td>

                  <td>
                    <TimeAgo datetime={member.since} locale={props.i18n.lang} />
                  </td>
                </tr>                
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="wizard-nav">
        <button
          onClick={props.onCancel}>Cancel</button>

        <button
          onClick={props.onBack}>Back</button>

        <button 
          className="primary"
          onClick={props.onNext}>Next</button>
      </section>
    </>
  )

}