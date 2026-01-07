// src/constants/styles.ts

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };
  
  export const TYPOGRAPHY = {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 28,
      xxxl: 32,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  };
  
  export const BORDER_RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    round: 9999,
  };
  
  export const SHADOWS = {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    button: {
      shadowColor: '#5B7C99',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
  };
  
  export const SIZES = {
    // Avatars
    avatarSmall: 40,
    avatarMedium: 80,
    avatarLarge: 120,
    
    // Icons
    iconSmall: 20,
    iconMedium: 24,
    iconLarge: 32,
    iconXLarge: 48,
    
    // Interactive elements
    buttonHeight: 48,
    buttonHeightSmall: 36,
    inputHeight: 52,
    
    // Logo
    logoSmall: 40,
    logoMedium: 60,
    logoLarge: 100,
  };
  
  // Common reusable styles
  export const COMMON_STYLES = {
    // Center content
    centerContent: {
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    
    // Flex row
    row: {
      flexDirection: 'row' as const,
    },
    
    // Flex column
    column: {
      flexDirection: 'column' as const,
    },
    
    // Full flex
    flex1: {
      flex: 1,
    },
    
    // Gradient button style (use with colors from theme)
    gradientButton: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    
    // Input field style (combine with theme colors)
    input: {
      height: SIZES.inputHeight,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      fontSize: TYPOGRAPHY.sizes.md,
      borderWidth: 2,
    },
    
    // Card container
    card: {
      padding: SPACING.lg,
      borderRadius: BORDER_RADIUS.xl,
      ...SHADOWS.card,
    },
  };