import { useMemo } from 'react';
import type { PresentUser, User } from '@annotorious/react';
import { Detective } from '@phosphor-icons/react';
import { useAuthorColors } from '@components/AnnotationDesktop';
import { Avatar } from '@components/Avatar';

import './AuthorAvatar.css';

interface AuthorAvatarProps {

  author?: PresentUser | User;

  isPrivate?: boolean;

}

export const AuthorAvatar = (props: AuthorAvatarProps) => {

  const { author, isPrivate } = props;

  const colors = useAuthorColors();

  const color = useMemo(() => colors.getColor(author), [colors, author]);

  return isPrivate ? (
    <div className="avatar private-avatar">
      <div 
        className="avatar-wrapper ring"
        style={color ? { borderColor: color } : undefined}>
        <div className="avatar-fallback">
          <Detective size={17} />
        </div>
      </div>
    </div>
  ) : author && (
    <Avatar
      id={author.id}
      name={(author as PresentUser).appearance?.label || author.name}
      avatar={(author as PresentUser).appearance?.avatar} 
      color={color} />
  )

}