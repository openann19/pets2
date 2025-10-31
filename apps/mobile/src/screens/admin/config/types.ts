/**
 * Types for Admin Configuration Screen
 */

export interface ServiceConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  isConfigured: boolean;
  isActive: boolean;
  fields: ConfigField[];
  description: string;
}

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'boolean' | 'url';
  value: string | number | boolean;
  placeholder?: string;
  required?: boolean;
  description?: string;
  masked?: boolean;
}

