export type Theme = 'system' | 'light' | 'dark';

export const THEMES: Theme[] = ['system', 'light', 'dark'];

export const THEME_LABEL: Record<Theme, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

export const THEME_GLYPH: Record<Theme, string> = {
  system: '⊙',
  light: '☀',
  dark: '☾',
};
