import { DotsThreeVertical } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';
import { Tag } from '../Tag';

import './TagList.css';
import { TagListActions } from './TagListActions';

interface TagListProps {

  i18n: Translations;

}

export const TagList = (props: TagListProps) => {

  return (
    <div className="annotation-taglist">
      <ul>
        <li>
          <Tag>Person</Tag>
        </li>

        <li>
          <Tag>Important</Tag>
        </li>

        <li>
          <Tag>MyTag</Tag>
        </li>

        <li className="annotation-taglist-more">+3 more</li>
      </ul>

      <div className="annotation-taglist-actions">
        <TagListActions i18n={props.i18n} />
      </div>
    </div>
  )

}