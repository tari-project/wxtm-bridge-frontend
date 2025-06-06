// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _THEME_TYPES = ['light', 'dark'] as const
type ThemeTuple = typeof _THEME_TYPES
export type Theme = ThemeTuple[number]
