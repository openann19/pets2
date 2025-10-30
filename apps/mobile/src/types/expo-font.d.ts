// Type definitions for expo-font
declare module 'expo-font' {
  export interface FontSource {
    fontFamily: string;
    localUri?: string;
    uri: string;
    display?: string;
    fontDisplay?: string;
    fontStyle?: string;
    fontWeight?: string;
  }

  export interface FontResource extends FontSource {
    [key: string]: unknown;
  }

  export type FontSource = string | FontResource | number;
}
