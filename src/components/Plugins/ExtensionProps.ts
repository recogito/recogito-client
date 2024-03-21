import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { PresentUser, User } from '@annotorious/react';
import type { PluginInstallationConfig } from './PluginInstallationConfig';
import type { DocumentInTaggedContext } from 'src/Types';

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

  me: PresentUser | User;

  onUpdateAnnotation(updated: SupabaseAnnotation): void;

}

export interface AnnotationToolbarExtensionProps extends ExtensionProps {

  document: DocumentInTaggedContext;

}
