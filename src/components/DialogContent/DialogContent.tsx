import React, { useEffect, forwardRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

type RadixContentProps = React.ComponentPropsWithoutRef<typeof Dialog.Content>;

type DialogContentProps = Omit<RadixContentProps, 'onInteractOutside'>;

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  (props, ref) => {
    const { children, ...rest } = props;

    // Allow usersnap focus while inside DocumentLibrary Radix dialog.
    // from https://github.com/radix-ui/primitives/issues/1859#issuecomment-1890182513
    const handleUsersnapFocus = (e: Event) => {
      const usersnapWidget = document.querySelector('us-widget');
      if (usersnapWidget && e.composedPath().includes(usersnapWidget)) {
        e.preventDefault();
      }
    };
    useEffect(() => {
      // Disable Radix ui dialog pointer events lockout
      setTimeout(() => (document.body.style.pointerEvents = ''), 0);
    });

    return (
      <Dialog.Content
        ref={ref}
        onInteractOutside={handleUsersnapFocus}
        {...rest}
      >
        {children}
      </Dialog.Content>
    );
  }
);

DialogContent.displayName = 'DialogContent';
