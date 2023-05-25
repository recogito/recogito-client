import type { ReactNode } from 'react';

export interface ToastContent {

  icon?: ReactNode;

  title: string;

  description?: string;

  severity: 'info' | 'warning' | 'error';

} 