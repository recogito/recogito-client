import { useEffect, useState } from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import {
  X,
  CheckCircle,
  XCircle,
  WarningCircle,
  Info,
} from '@phosphor-icons/react';
import type { ToastContent } from './ToastContent';

const { Root, Title, Description, Action, Viewport } = RadixToast;

interface ToastProps {
  content?: ToastContent | null;

  closeAltText?: string;

  duration?: number;

  onOpenChange(open: boolean): void;
}

export const Toast = (props: ToastProps) => {
  const icon = props.content?.icon;

  // Note that we need to keep the content on screen,
  // even after the prop has gone null, for the exit anim.
  const [content, setContent] = useState(props.content);
  // hide viewport when no content present
  const [showViewport, setShowViewport] = useState(false);

  useEffect(() => {
    if (props.content) {
      setShowViewport(true);
      setContent(props.content);
    }
  }, [props.content]);

  const onOpenChange = (open: boolean) => {
    props.onOpenChange(open);
    if (!open) {
      // hide viewport after 300ms timeout to allow anim to play
      setTimeout(() => setShowViewport(false), 300);
    }
  };

  return (
    <>
      <Root
        className='toast'
        duration={props.duration || 5000}
        open={Boolean(props.content)}
        onOpenChange={onOpenChange}
      >
        <Title className='toast-title'>
          {icon} {content?.title}
        </Title>

        <Description className='toast-description'>
          {props.content?.type === 'success' ? (
            <CheckCircle color='green' size={24} weight='fill' />
          ) : props.content?.type === 'error' ? (
            <XCircle color='red' size={24} weight='fill' />
          ) : props.content?.type === 'info' ? (
            <Info color='blue' size={24} weight='fill' />
          ) : (
            <WarningCircle color='yellow' size={24} weight='fill' />
          )}
          {content?.description}
        </Description>

        <Action
          className='toast-action'
          asChild
          altText={props.closeAltText || 'Close alert'}
        >
          <button className='unstyled icon-only'>
            <X size={20} weight='light' />
          </button>
        </Action>
      </Root>

      {showViewport && <Viewport className='toast-viewport' />}
    </>
  );
};

export const ToastProvider = RadixToast.Provider;
