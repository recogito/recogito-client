import type { ReactNode } from 'react';

export interface ToastContent {

  icon?: ReactNode;

  title: string;

  description?: string;

  type: 'error' | 'info' | 'success' | 'warning';

} 