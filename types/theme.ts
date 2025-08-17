export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
  input: string
  ring: string
  destructive: string
  destructiveForeground: string
  warning: string
  warningForeground: string
  success: string
  successForeground: string
}

export interface ThemeTypography {
  fontFamily: {
    sans: string[]
    serif: string[]
    mono: string[]
  }
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    "2xl": string
    "3xl": string
    "4xl": string
  }
  fontWeight: {
    normal: number
    medium: number
    semibold: number
    bold: number
  }
  lineHeight: {
    tight: number
    normal: number
    relaxed: number
  }
}

export interface ThemeSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  "2xl": string
  "3xl": string
}

export interface ThemeBorderRadius {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  full: string
}

export interface ThemeShadows {
  sm: string
  md: string
  lg: string
  xl: string
}

export interface StandardThemeConfig {
  name: string
  version: string
  description?: string
  colors: ThemeColors
  typography: ThemeTypography
  spacing: ThemeSpacing
  borderRadius: ThemeBorderRadius
  shadows: ThemeShadows
  customProperties?: Record<string, string>
}

export interface ThemeFile {
  name: string
  content: string
  type: string
  parsedConfig?: StandardThemeConfig
}
