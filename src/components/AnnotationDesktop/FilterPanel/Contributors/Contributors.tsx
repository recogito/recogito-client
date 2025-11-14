import { User as UserIcon } from '@phosphor-icons/react';
import * as Toggle from '@radix-ui/react-toggle';
import type { Annotation, PresentUser, User } from '@annotorious/react';
import { getContributors } from '@components/AnnotationDesktop';
import { useContributors } from './useContributors';
import { useFilterSettingsState } from '../FilterState';
import { useTranslation } from 'react-i18next';

interface ContributorsProps {

  present: PresentUser[];

}

export const Contributors = (props: ContributorsProps) => {

  const { t } = useTranslation(['annotation-common']);

  const contributors = useContributors(props.present);

  const { contributorSettings, setContributorSettings } = useFilterSettingsState();

  const selected = contributorSettings?.state || [];

  const onToggle = (contributor: User) => {
    const next = selected.some(u => u.id === contributor.id) 
      ? selected.filter(u => u.id !== contributor.id) : [...selected, contributor];

    if (next.length > 0) {
      const showContributorIds = new Set(next.map(u => u.id));

      const filter = (a: Annotation) => { 
        const contributorIds = getContributors(a).map(u => u.id);
        return contributorIds.some(id => showContributorIds.has(id));
      }

      setContributorSettings({ state: next, filter });
    } else {
      setContributorSettings(undefined);
    }
  }

  return (
    <section className="filter-creators filter-toggle-buttons">
      <h2>
        <UserIcon size={19} /> {t('Contributors', { ns: 'annotation-common' })}
      </h2>

      <ul>
        {contributors.map(contributor => (
          <li key={contributor.id}>
            <Toggle.Root 
              className="toggle"
              pressed={selected.some(u => u.id === contributor.id)}
              onPressedChange={() => onToggle(contributor)}>
              {contributor.name || t('Anonymous', { ns: 'annotation-common' })}
            </Toggle.Root>
          </li>
        ))}
      </ul>
    </section>
  )

}