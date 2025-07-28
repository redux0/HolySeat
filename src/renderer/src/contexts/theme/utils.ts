import { Theme, ThemeTokens, ThemeMode, ThemePreset } from './types';

/**
 * CSS变量工具函数
 * 将主题令牌转换为CSS自定义属性
 */
export function generateCSSVariables(tokens: ThemeTokens): Record<string, string> {
  return {
    // 背景色变量
    '--background-primary': tokens.colors.background.primary,
    '--background-secondary': tokens.colors.background.secondary,
    '--background-interactive': tokens.colors.background.interactive,
    
    // 文本色变量
    '--text-primary': tokens.colors.text.primary,
    '--text-secondary': tokens.colors.text.secondary,
    '--text-disabled': tokens.colors.text.disabled,
    
    // 主色调变量
    '--accent-primary': tokens.colors.accent.primary,
    '--accent-primary-text': tokens.colors.accent.primaryText,
    
    // 功能色变量
    '--color-success': tokens.colors.functional.success,
    '--color-danger': tokens.colors.functional.danger,
    
    // 边框色变量
    '--border-primary': tokens.colors.border.primary,
    
    // 排版变量
    '--font-family-sans': tokens.typography.fontFamily.sans,
    '--font-size-display': tokens.typography.fontSize.display,
    '--font-size-heading2': tokens.typography.fontSize.heading2,
    '--font-size-body': tokens.typography.fontSize.body,
    '--font-size-label': tokens.typography.fontSize.label,
    '--font-weight-regular': tokens.typography.fontWeight.regular,
    '--font-weight-medium': tokens.typography.fontWeight.medium,
    '--font-weight-bold': tokens.typography.fontWeight.bold,
    '--line-height-tight': tokens.typography.lineHeight.tight,
    '--line-height-normal': tokens.typography.lineHeight.normal,
    '--line-height-relaxed': tokens.typography.lineHeight.relaxed,
    
    // 布局变量
    '--spacing-base': tokens.layout.spacing.base,
    '--spacing-sm': tokens.layout.spacing.sm,
    '--spacing-md': tokens.layout.spacing.md,
    '--spacing-lg': tokens.layout.spacing.lg,
    '--spacing-xl': tokens.layout.spacing.xl,
    '--border-radius-sm': tokens.layout.borderRadius.sm,
    '--border-radius-md': tokens.layout.borderRadius.md,
    '--border-radius-lg': tokens.layout.borderRadius.lg,
    '--border-radius-xl': tokens.layout.borderRadius.xl,
    '--border-width-sm': tokens.layout.borderWidth.sm,
    '--border-width-md': tokens.layout.borderWidth.md,
    
    // 阴影变量
    '--shadow-card': tokens.shadows.card,
    ...(tokens.shadows.extruded && { '--shadow-extruded': tokens.shadows.extruded }),
    ...(tokens.shadows.inset && { '--shadow-inset': tokens.shadows.inset }),
    
    // 动效变量
    '--duration-fast': tokens.animation.duration.fast,
    '--duration-normal': tokens.animation.duration.normal,
    '--easing-default': tokens.animation.easing.default,
  };
}

/**
 * 应用CSS变量到文档根元素
 */
export function applyCSSVariables(variables: Record<string, string>): void {
  const root = document.documentElement;
  
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

/**
 * 移除CSS变量
 */
export function removeCSSVariables(variables: Record<string, string>): void {
  const root = document.documentElement;
  
  Object.keys(variables).forEach((property) => {
    root.style.removeProperty(property);
  });
}

/**
 * 检测系统颜色方案偏好
 */
export function getSystemColorScheme(): ThemeMode {
  if (typeof window === 'undefined') return ThemeMode.LIGHT;
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? ThemeMode.DARK 
    : ThemeMode.LIGHT;
}

/**
 * 监听系统颜色方案变化
 */
export function watchSystemColorScheme(callback: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  
  // 现代浏览器
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }
  
  // 旧版浏览器兼容
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}

/**
 * 本地存储工具
 */
export const storage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // 静默失败
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // 静默失败
    }
  }
};

/**
 * 主题数据序列化
 */
export function serializeTheme(theme: Theme): string {
  return JSON.stringify(theme, null, 2);
}

/**
 * 主题数据反序列化
 */
export function deserializeTheme(data: string): Theme | null {
  try {
    const parsed = JSON.parse(data);
    // 简单验证主题结构
    if (parsed.id && parsed.name && parsed.preset && parsed.mode && parsed.tokens) {
      return parsed as Theme;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 生成主题ID
 */
export function generateThemeId(preset: ThemePreset, mode: ThemeMode): string {
  return `${preset}-${mode}`;
}

/**
 * CSS类名管理
 */
export function getThemeClassName(mode: ThemeMode): string {
  switch (mode) {
    case ThemeMode.DARK:
      return 'dark';
    case ThemeMode.LIGHT:
      return 'light';
    case ThemeMode.SYSTEM:
      return getSystemColorScheme() === ThemeMode.DARK ? 'dark' : 'light';
    default:
      return 'light';
  }
}

/**
 * 更新文档根元素的主题类名
 */
export function updateDocumentThemeClass(mode: ThemeMode): void {
  const root = document.documentElement;
  const className = getThemeClassName(mode);
  
  // 移除所有主题类名
  root.classList.remove('light', 'dark');
  
  // 添加新的主题类名
  root.classList.add(className);
}
