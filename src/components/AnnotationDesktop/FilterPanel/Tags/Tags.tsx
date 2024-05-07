import * as Toggle from '@radix-ui/react-toggle';
import { Tag as TagIcon} from '@phosphor-icons/react';

const TAGS = ['historical reference', 'meter', 'lorem ipsum', 'dolor sit amet'];

export const Tags = () => {

  return (
    <section className="filter-creators">
      <h2>
        <TagIcon size={19} /> Tags
      </h2>

      <ul>
        {TAGS.map(tag => (
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