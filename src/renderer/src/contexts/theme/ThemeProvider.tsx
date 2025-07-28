import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { 
  Theme, 
  ThemeMode, 
  ThemePreset, 
  ThemeContext as IThemeContext,
  ThemeContextState,
  ThemeProviderProps 
} from './types';
import { 
  generateCSSVariables, 
  applyCSSVariables, 
  getSystemColorScheme, 
  watchSystemColorScheme,
  storage,
  updateDocumentThemeClass,
  generateThemeId
} from './utils';

// 主题状态管理的Action类型
type ThemeAction = 
  | { type: 'SET_MODE'; payload: ThemeMode }
  | { type: 'SET_PRESET'; payload: ThemePreset }
  | { type: 'SET_CUSTOM_THEME'; payload: Theme }
  | { type: 'SET_SYSTEM_PREFERENCE'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_TO_DEFAULT' };

// 默认主题状态
const defaultThemeState: ThemeContextState = {
  currentTheme: {
    id: 'calm-tech-dark',
    name: 'Calm Tech Dark',
    preset: ThemePreset.CALM_TECH,
    mode: ThemeMode.DARK,
    tokens: {
      colors: {
        background: {
          primary: '#111827',
          secondary: 'rgba(31, 41, 55, 0.5)',
          interactive: 'rgba(55, 65, 81, 0.5)'
        },
        text: {
          primary: '#F3F4F6',
          secondary: '#9CA3AF',
          disabled: '#4B5563'
        },
        accent: {
          primary: '#6366F1',
          primaryText: '#818CF8'
        },
        functional: {
          success: '#4ADE80',
          danger: '#EF4444'
        },
        border: {
          primary: 'rgba(55, 65, 81, 0.5)'
        }
      },
      typography: {
        fontFamily: {
          sans: 'Inter, system-ui, sans-serif'
        },
        fontSize: {
          display: '48px',
          heading2: '30px',
          body: '16px',
          label: '12px'
        },
        fontWeight: {
          regular: '400',
          medium: '500',
          bold: '700'
        },
        lineHeight: {
          tight: '1.2',
          normal: '1.3',
          relaxed: '1.6'
        }
      },
      layout: {
        spacing: {
          base: '4px',
          sm: '8px',
          md: '16px',
          lg: '24px',
          xl: '32px'
        },
        borderRadius: {
          sm: '4px',
          md: '6px',
          lg: '8px',
          xl: '16px'
        },
        borderWidth: {
          sm: '1px',
          md: '2px'
        }
      },
      shadows: {
        card: 'none'
      },
      animation: {
        duration: {
          fast: '200ms',
          normal: '300ms'
        },
        easing: {
          default: 'ease-in-out'
        }
      }
    }
  },
  mode: ThemeMode.DARK,
  preset: ThemePreset.CALM_TECH,
  systemPrefersDark: false,
  isLoading: false
};

// 主题状态reducer
function themeReducer(state: ThemeContextState, action: ThemeAction): ThemeContextState {
  switch (action.type) {
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        currentTheme: {
          ...state.currentTheme,
          mode: action.payload,
          id: generateThemeId(state.preset, action.payload)
        }
      };
      
    case 'SET_PRESET':
      return {
        ...state,
        preset: action.payload,
        currentTheme: {
          ...state.currentTheme,
          preset: action.payload,
          id: generateThemeId(action.payload, state.mode)
        }
      };
      
    case 'SET_CUSTOM_THEME':
      return {
        ...state,
        currentTheme: action.payload,
        mode: action.payload.mode,
        preset: action.payload.preset
      };
      
    case 'SET_SYSTEM_PREFERENCE':
      return {
        ...state,
        systemPrefersDark: action.payload
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
      
    case 'RESET_TO_DEFAULT':
      return defaultThemeState;
      
    default:
      return state;
  }
}

// 创建Context
const ThemeContext = createContext<IThemeContext | undefined>(undefined);

// ThemeProvider组件
export function ThemeProvider({
  children,
  defaultMode = ThemeMode.SYSTEM,
  defaultPreset = ThemePreset.CALM_TECH,
  storageKey = 'holyseat-theme',
  enableSystemDetection = true
}: ThemeProviderProps) {
  const [state, dispatch] = useReducer(themeReducer, {
    ...defaultThemeState,
    mode: defaultMode,
    preset: defaultPreset
  });

  // 从本地存储加载主题配置
  const loadFromStorage = useCallback(() => {
    const savedMode = storage.get(`${storageKey}-mode`) as ThemeMode;
    const savedPreset = storage.get(`${storageKey}-preset`) as ThemePreset;
    
    if (savedMode && Object.values(ThemeMode).includes(savedMode)) {
      dispatch({ type: 'SET_MODE', payload: savedMode });
    }
    
    if (savedPreset && Object.values(ThemePreset).includes(savedPreset)) {
      dispatch({ type: 'SET_PRESET', payload: savedPreset });
    }
  }, [storageKey]);

  // 保存到本地存储
  const saveToStorage = useCallback((mode: ThemeMode, preset: ThemePreset) => {
    storage.set(`${storageKey}-mode`, mode);
    storage.set(`${storageKey}-preset`, preset);
  }, [storageKey]);

  // 应用主题到DOM
  const applyTheme = useCallback((theme: Theme, mode: ThemeMode) => {
    const cssVariables = generateCSSVariables(theme.tokens);
    applyCSSVariables(cssVariables);
    updateDocumentThemeClass(mode === ThemeMode.SYSTEM ? 
      (state.systemPrefersDark ? ThemeMode.DARK : ThemeMode.LIGHT) : mode
    );
  }, [state.systemPrefersDark]);

  // Context Actions
  const setMode = useCallback((mode: ThemeMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
    saveToStorage(mode, state.preset);
  }, [state.preset, saveToStorage]);

  const setPreset = useCallback((preset: ThemePreset) => {
    dispatch({ type: 'SET_PRESET', payload: preset });
    saveToStorage(state.mode, preset);
  }, [state.mode, saveToStorage]);

  const setCustomTheme = useCallback((theme: Theme) => {
    dispatch({ type: 'SET_CUSTOM_THEME', payload: theme });
    saveToStorage(theme.mode, theme.preset);
  }, [saveToStorage]);

  const resetToDefault = useCallback(() => {
    dispatch({ type: 'RESET_TO_DEFAULT' });
    storage.remove(`${storageKey}-mode`);
    storage.remove(`${storageKey}-preset`);
  }, [storageKey]);

  const importThemeFromCSS = useCallback(async (cssContent: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // TODO: 实现CSS解析逻辑
      console.warn('importThemeFromCSS not implemented yet');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const exportThemeToCSS = useCallback((): string => {
    const cssVariables = generateCSSVariables(state.currentTheme.tokens);
    const cssContent = Object.entries(cssVariables)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n');
    
    return `:root {\n${cssContent}\n}`;
  }, [state.currentTheme.tokens]);

  // 初始化：加载保存的主题配置
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // 监听系统颜色方案变化
  useEffect(() => {
    if (!enableSystemDetection) return;

    // 初始检测
    const systemPrefersDark = getSystemColorScheme() === ThemeMode.DARK;
    dispatch({ type: 'SET_SYSTEM_PREFERENCE', payload: systemPrefersDark });

    // 监听变化
    const unwatch = watchSystemColorScheme((isDark) => {
      dispatch({ type: 'SET_SYSTEM_PREFERENCE', payload: isDark });
    });

    return unwatch;
  }, [enableSystemDetection]);

  // 应用主题变化到DOM
  useEffect(() => {
    const effectiveMode = state.mode === ThemeMode.SYSTEM ? 
      (state.systemPrefersDark ? ThemeMode.DARK : ThemeMode.LIGHT) : 
      state.mode;
    
    applyTheme(state.currentTheme, effectiveMode);
  }, [state.currentTheme, state.mode, state.systemPrefersDark, applyTheme]);

  const contextValue: IThemeContext = {
    ...state,
    setMode,
    setPreset,
    setCustomTheme,
    resetToDefault,
    importThemeFromCSS,
    exportThemeToCSS
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// useTheme Hook
export function useTheme(): IThemeContext {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// 便捷Hook：获取当前有效主题模式
export function useEffectiveThemeMode(): ThemeMode {
  const { mode, systemPrefersDark } = useTheme();
  
  if (mode === ThemeMode.SYSTEM) {
    return systemPrefersDark ? ThemeMode.DARK : ThemeMode.LIGHT;
  }
  
  return mode;
}
