import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { PresentUser, User } from '@annotorious/react';
import type { DocumentWithContext } from 'src/Types';
import type { PluginInstallationConfig } from '@recogito/studio-sdk';

/**
 * Typings for different kinds of plugins
 */

export interface ExtensionProps {

  plugin: PluginInstallationConfig;

  extensionPoint: string;

}

export interface AdminExtensionProps extends ExtensionProps {

  onChangeUserSettings(settings: any): void;

}

export interface AnnotationEditorExtensionProps extends ExtensionProps {

  annotation: SupabaseAnnotation;

  isEditable?: boolean;

  isSelected?: boolean;

  me: PresentUser | User;

  onUpdateAnnotation(updated: SupabaseAnnotation): void;

}

export interface AnnotationToolbarExtensionProps extends ExtensionProps {

  document: DocumentWithContext;

}
