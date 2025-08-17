import type { StandardThemeConfig, ThemeFile } from "@/types/theme"

export class ThemeParser {
  static parseThemeFile(themeFile: ThemeFile): StandardThemeConfig | null {
    try {
      switch (themeFile.type) {
        case ".json":
          return this.parseJsonTheme(themeFile.content)
        case ".css":
          return this.parseCssTheme(themeFile.content)
        case ".js":
        case ".ts":
          return this.parseJsTheme(themeFile.content)
        case ".scss":
        case ".less":
          return this.parseSassTheme(themeFile.content)
        default:
          throw new Error(`Unsupported theme file type: ${themeFile.type}`)
      }
    } catch (error) {
      console.error("Error parsing theme file:", error)
      return null
    }
  }

  private static parseJsonTheme(content: string): StandardThemeConfig {
    const parsed = JSON.parse(content)

    // 验证是否符合标准格式
    if (this.isStandardThemeConfig(parsed)) {
      return parsed
    }

    // 尝试转换常见格式
    return this.convertToStandardFormat(parsed)
  }

  private static parseCssTheme(content: string): StandardThemeConfig {
    const cssVariables = this.extractCssVariables(content)
    return this.convertCssVariablesToTheme(cssVariables)
  }

  private static parseJsTheme(content: string): StandardThemeConfig {
    // 简单的JS主题解析（实际项目中可能需要更复杂的解析）
    const cleanContent = content.replace(/export\s+(default\s+)?/, "").replace(/module\.exports\s*=/, "")
    const parsed = eval(`(${cleanContent})`)
    return this.convertToStandardFormat(parsed)
  }

  private static parseSassTheme(content: string): StandardThemeConfig {
    const variables = this.extractSassVariables(content)
    return this.convertSassVariablesToTheme(variables)
  }

  private static isStandardThemeConfig(obj: any): obj is StandardThemeConfig {
    return (
      obj &&
      typeof obj.name === "string" &&
      typeof obj.version === "string" &&
      obj.colors &&
      obj.typography &&
      obj.spacing &&
      obj.borderRadius &&
      obj.shadows
    )
  }

  private static convertToStandardFormat(obj: any): StandardThemeConfig {
    return {
      name: obj.name || "Custom Theme",
      version: obj.version || "1.0.0",
      description: obj.description,
      colors: this.normalizeColors(obj.colors || obj.palette || {}),
      typography: this.normalizeTypography(obj.typography || obj.fonts || {}),
      spacing: this.normalizeSpacing(obj.spacing || obj.space || {}),
      borderRadius: this.normalizeBorderRadius(obj.borderRadius || obj.radii || {}),
      shadows: this.normalizeShadows(obj.shadows || obj.boxShadow || {}),
      customProperties: obj.customProperties || obj.custom || {},
    }
  }

  private static extractCssVariables(content: string): Record<string, string> {
    const variables: Record<string, string> = {}
    const regex = /--([^:]+):\s*([^;]+);/g
    let match

    while ((match = regex.exec(content)) !== null) {
      variables[match[1].trim()] = match[2].trim()
    }

    return variables
  }

  private static extractSassVariables(content: string): Record<string, string> {
    const variables: Record<string, string> = {}
    const regex = /\$([^:]+):\s*([^;]+);/g
    let match

    while ((match = regex.exec(content)) !== null) {
      variables[match[1].trim()] = match[2].trim()
    }

    return variables
  }

  private static convertCssVariablesToTheme(variables: Record<string, string>): StandardThemeConfig {
    return {
      name: "CSS Theme",
      version: "1.0.0",
      colors: {
        primary: variables["primary"] || "#3b82f6",
        secondary: variables["secondary"] || "#64748b",
        accent: variables["accent"] || "#f59e0b",
        background: variables["background"] || "#ffffff",
        foreground: variables["foreground"] || "#0f172a",
        muted: variables["muted"] || "#f1f5f9",
        mutedForeground: variables["muted-foreground"] || "#64748b",
        border: variables["border"] || "#e2e8f0",
        input: variables["input"] || "#e2e8f0",
        ring: variables["ring"] || "#3b82f6",
        destructive: variables["destructive"] || "#ef4444",
        destructiveForeground: variables["destructive-foreground"] || "#ffffff",
        warning: variables["warning"] || "#f59e0b",
        warningForeground: variables["warning-foreground"] || "#ffffff",
        success: variables["success"] || "#10b981",
        successForeground: variables["success-foreground"] || "#ffffff",
      },
      typography: this.getDefaultTypography(),
      spacing: this.getDefaultSpacing(),
      borderRadius: this.getDefaultBorderRadius(),
      shadows: this.getDefaultShadows(),
      customProperties: variables,
    }
  }

  private static convertSassVariablesToTheme(variables: Record<string, string>): StandardThemeConfig {
    return this.convertCssVariablesToTheme(variables)
  }

  private static normalizeColors(colors: any): any {
    return {
      primary: colors.primary || colors.blue || "#3b82f6",
      secondary: colors.secondary || colors.gray || "#64748b",
      accent: colors.accent || colors.yellow || "#f59e0b",
      background: colors.background || colors.white || "#ffffff",
      foreground: colors.foreground || colors.black || "#0f172a",
      muted: colors.muted || colors.gray100 || "#f1f5f9",
      mutedForeground: colors.mutedForeground || colors.gray500 || "#64748b",
      border: colors.border || colors.gray200 || "#e2e8f0",
      input: colors.input || colors.gray200 || "#e2e8f0",
      ring: colors.ring || colors.blue500 || "#3b82f6",
      destructive: colors.destructive || colors.red || "#ef4444",
      destructiveForeground: colors.destructiveForeground || "#ffffff",
      warning: colors.warning || colors.yellow || "#f59e0b",
      warningForeground: colors.warningForeground || "#ffffff",
      success: colors.success || colors.green || "#10b981",
      successForeground: colors.successForeground || "#ffffff",
    }
  }

  private static normalizeTypography(typography: any): any {
    return {
      fontFamily: {
        sans: typography.fontFamily?.sans || typography.sans || ["Inter", "system-ui", "sans-serif"],
        serif: typography.fontFamily?.serif || typography.serif || ["Georgia", "serif"],
        mono: typography.fontFamily?.mono || typography.mono || ["Monaco", "monospace"],
      },
      fontSize: {
        xs: typography.fontSize?.xs || "0.75rem",
        sm: typography.fontSize?.sm || "0.875rem",
        base: typography.fontSize?.base || "1rem",
        lg: typography.fontSize?.lg || "1.125rem",
        xl: typography.fontSize?.xl || "1.25rem",
        "2xl": typography.fontSize?.["2xl"] || "1.5rem",
        "3xl": typography.fontSize?.["3xl"] || "1.875rem",
        "4xl": typography.fontSize?.["4xl"] || "2.25rem",
      },
      fontWeight: {
        normal: typography.fontWeight?.normal || 400,
        medium: typography.fontWeight?.medium || 500,
        semibold: typography.fontWeight?.semibold || 600,
        bold: typography.fontWeight?.bold || 700,
      },
      lineHeight: {
        tight: typography.lineHeight?.tight || 1.25,
        normal: typography.lineHeight?.normal || 1.5,
        relaxed: typography.lineHeight?.relaxed || 1.75,
      },
    }
  }

  private static normalizeSpacing(spacing: any): any {
    return {
      xs: spacing.xs || "0.5rem",
      sm: spacing.sm || "0.75rem",
      md: spacing.md || "1rem",
      lg: spacing.lg || "1.5rem",
      xl: spacing.xl || "2rem",
      "2xl": spacing["2xl"] || "3rem",
      "3xl": spacing["3xl"] || "4rem",
    }
  }

  private static normalizeBorderRadius(borderRadius: any): any {
    return {
      none: borderRadius.none || "0",
      sm: borderRadius.sm || "0.125rem",
      md: borderRadius.md || "0.375rem",
      lg: borderRadius.lg || "0.5rem",
      xl: borderRadius.xl || "0.75rem",
      full: borderRadius.full || "9999px",
    }
  }

  private static normalizeShadows(shadows: any): any {
    return {
      sm: shadows.sm || "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: shadows.md || "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      lg: shadows.lg || "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      xl: shadows.xl || "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    }
  }

  private static getDefaultTypography(): any {
    return {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
        mono: ["Monaco", "monospace"],
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
    }
  }

  private static getDefaultSpacing(): any {
    return {
      xs: "0.5rem",
      sm: "0.75rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
      "2xl": "3rem",
      "3xl": "4rem",
    }
  }

  private static getDefaultBorderRadius(): any {
    return {
      none: "0",
      sm: "0.125rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      full: "9999px",
    }
  }

  private static getDefaultShadows(): any {
    return {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    }
  }
}
