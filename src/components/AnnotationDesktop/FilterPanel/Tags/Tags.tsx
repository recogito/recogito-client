import * as Toggle from '@radix-ui/react-toggle';
import { Tag as TagIcon} from '@phosphor-icons/react';
import { useTags } from './useTags';

export const Tags = () => {

  const tags = useTags();

  return (
    <section className="filter-creators">
      <h2>
        <TagIcon size={19} /> Tags
      </h2>

      <ul>
        {tags.map(tag => (
          <li key={tag}>
            <Toggle.Root className="toggle">
              {tag}
            </Toggle.Root>
          </li>
        ))}
      </ul>
    </section>
  )

}