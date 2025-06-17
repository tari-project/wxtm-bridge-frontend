const _THEME_TYPES = ['light', 'dark'] as const
type ThemeTuple = typeof _THEME_TYPES
export type Theme = ThemeTuple[number]

export function parseTheme(value: string): Theme {
  if (_THEME_TYPES.includes(value as Theme)) {
    return value as Theme
  }
  return 'light' //return default light
}
