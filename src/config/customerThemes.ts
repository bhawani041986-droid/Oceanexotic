export interface CustomerTheme {
  id: string;
  name: string;
  desc: string;
  fontFamily: string;
  colors: {
    primary: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    bg: string;
    bgAlt: string;
    card: string;
    textPrimary: string;
    textSecondary: string;
  };
  visuals: {
    radiusBtn: string;
    radiusCard: string;
    shadowGlow: string;
    gradientHero: string;
    glassOpacity: string;
    glassBlur: string;
  };
}

export const CUSTOMER_THEMES: CustomerTheme[] = [
  {
    id: 'theme-midnight-deep',
    name: 'Midnight Deep',
    desc: 'Futuristic neon oceanic experience',
    fontFamily: 'var(--font-space-grotesk)',
    colors: {
      primary: '#06B6D4',
      primaryLight: '#22D3EE',
      secondary: '#7C3AED',
      accent: '#0891B2',
      bg: '#020617',
      bgAlt: '#0F172A',
      card: '#1E293B',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
    },
    visuals: {
      radiusBtn: '8px',
      radiusCard: '24px',
      shadowGlow: '0 0 20px rgba(6, 182, 212, 0.3)',
      gradientHero: 'radial-gradient(circle at 50% 0%, #0F172A, #020617)',
      glassOpacity: '0.4',
      glassBlur: '32px',
    }
  },
  {
    id: 'theme-sunrise-market',
    name: 'Sunrise Market',
    desc: 'Fresh organic seafood market vibe (Dark Edition)',
    fontFamily: 'var(--font-plus-jakarta)',
    colors: {
      primary: '#F97316',
      primaryLight: '#FB923C',
      secondary: '#22C55E',
      accent: '#EA580C',
      bg: '#0B1120',
      bgAlt: '#111827',
      card: '#172033',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
    },
    visuals: {
      radiusBtn: '9999px',
      radiusCard: '32px',
      shadowGlow: '0 10px 30px rgba(249, 115, 22, 0.15)',
      gradientHero: 'linear-gradient(to bottom, #111827, #0B1120)',
      glassOpacity: '0.8',
      glassBlur: '12px',
    }
  },
  {
    id: 'theme-emerald-coast',
    name: 'Emerald Coast',
    desc: 'Luxury deep jungle marina aesthetic',
    fontFamily: 'var(--font-outfit)',
    colors: {
      primary: '#10B981',
      primaryLight: '#34D399',
      secondary: '#F59E0B',
      accent: '#059669',
      bg: '#051210',
      bgAlt: '#0B1F1C',
      card: '#112B26',
      textPrimary: '#D1FAE5',
      textSecondary: '#6EE7B7',
    },
    visuals: {
      radiusBtn: '16px',
      radiusCard: '40px',
      shadowGlow: '0 0 30px rgba(16, 185, 129, 0.25)',
      gradientHero: 'linear-gradient(to bottom, #0B1F1C, #051210)',
      glassOpacity: '0.35',
      glassBlur: '32px',
    }
  },
  {
    id: 'theme-volcanic-grill',
    name: 'Volcanic Grill',
    desc: 'Bold fire-grilled industrial aesthetic',
    fontFamily: 'var(--font-kanit)',
    colors: {
      primary: '#EF4444',
      primaryLight: '#F87171',
      secondary: '#F59E0B',
      accent: '#991B1B',
      bg: '#18181B',
      bgAlt: '#27272A',
      card: '#3F3F46',
      textPrimary: '#FAFAF9',
      textSecondary: '#A1A1AA',
    },
    visuals: {
      radiusBtn: '4px',
      radiusCard: '12px',
      shadowGlow: '0 10px 30px rgba(239, 68, 68, 0.15)',
      gradientHero: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
      glassOpacity: '0.9',
      glassBlur: '8px',
    }
  },
  {
    id: 'theme-royal-pearl',
    name: 'Royal Pearl',
    desc: 'Elite midnight velvet luxury protocol',
    fontFamily: 'var(--font-cinzel)',
    colors: {
      primary: '#7C3AED',
      primaryLight: '#A78BFA',
      secondary: '#FACC15',
      accent: '#C026D3',
      bg: '#0F071A',
      bgAlt: '#1A0B2E',
      card: '#240E3F',
      textPrimary: '#F3E8FF',
      textSecondary: '#A78BFA',
    },
    visuals: {
      radiusBtn: '0px',
      radiusCard: '0px',
      shadowGlow: '0 0 40px rgba(124, 58, 237, 0.3)',
      gradientHero: 'radial-gradient(circle at 50% 0%, #1A0B2E, #0F071A)',
      glassOpacity: '0.25',
      glassBlur: '40px',
    }
  },
  {
    id: 'theme-arctic-minimal',
    name: 'Arctic Minimal',
    desc: 'Crystalline medical-grade polar night',
    fontFamily: 'var(--font-inter)',
    colors: {
      primary: '#60A5FA',
      primaryLight: '#93C5FD',
      secondary: '#2DD4BF',
      accent: '#38BDF8',
      bg: '#030712',
      bgAlt: '#0F172A',
      card: '#111827',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
    },
    visuals: {
      radiusBtn: '12px',
      radiusCard: '32px',
      shadowGlow: '0 0 30px rgba(96, 165, 250, 0.25)',
      gradientHero: 'linear-gradient(to bottom, #111827, #030712)',
      glassOpacity: '0.3',
      glassBlur: '32px',
    }
  },
  {
    id: 'theme-sunset-energy',
    name: 'Sunset Energy',
    desc: 'Strong vibrant dark solar aesthetic',
    fontFamily: 'var(--font-outfit)',
    colors: {
      primary: '#F43F5E',
      primaryLight: '#FB7185',
      secondary: '#FBBF24',
      accent: '#FB923C',
      bg: '#1A0B0B',
      bgAlt: '#261111',
      card: '#2D1414',
      textPrimary: '#FFF1F2',
      textSecondary: '#FDA4AF',
    },
    visuals: {
      radiusBtn: '24px',
      radiusCard: '48px',
      shadowGlow: '0 0 30px rgba(244, 63, 94, 0.3)',
      gradientHero: 'linear-gradient(to bottom, #261111, #1A0B0B)',
      glassOpacity: '0.5',
      glassBlur: '20px',
    }
  },
  {
    id: 'theme-sovereign-light',
    name: 'System Light',
    desc: 'Elite high-precision light mode protocol',
    fontFamily: 'var(--font-inter)',
    colors: {
      primary: '#7C3AED',
      primaryLight: '#A78BFA',
      secondary: '#2563EB',
      accent: '#6366F1',
      bg: '#FFFFFF',
      bgAlt: '#F8FAFC',
      card: '#FFFFFF',
      textPrimary: '#1C1C1C',
      textSecondary: '#4B5563',
    },
    visuals: {
      radiusBtn: '12px',
      radiusCard: '24px',
      shadowGlow: '0 10px 40px rgba(124, 58, 237, 0.1)',
      gradientHero: 'linear-gradient(to bottom, #F8FAFC, #FFFFFF)',
      glassOpacity: '0.95',
      glassBlur: '12px',
    }
  },
  {
    id: 'theme-alibaba-prime',
    name: 'Alibaba Prime',
    desc: 'High-authority wholesale orange logistics',
    fontFamily: 'var(--font-outfit)',
    colors: {
      primary: '#FF6600',
      primaryLight: '#FF8533',
      secondary: '#064495',
      accent: '#FF6600',
      bg: '#0B1120',
      bgAlt: '#111827',
      card: '#172033',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
    },
    visuals: {
      radiusBtn: '8px',
      radiusCard: '20px',
      shadowGlow: '0 10px 30px rgba(255, 102, 0, 0.2)',
      gradientHero: 'linear-gradient(to bottom, #111827, #0B1120)',
      glassOpacity: '0.7',
      glassBlur: '20px',
    }
  },
  {
    id: 'theme-amazon-dark',
    name: 'Amazon Dark',
    desc: 'Elite global distribution dark mode',
    fontFamily: 'var(--font-plus-jakarta)',
    colors: {
      primary: '#FF9900',
      primaryLight: '#FFB347',
      secondary: '#232F3E',
      accent: '#FF9900',
      bg: '#131921',
      bgAlt: '#232F3E',
      card: '#232F3E',
      textPrimary: '#FFFFFF',
      textSecondary: '#CCCCCC',
    },
    visuals: {
      radiusBtn: '8px',
      radiusCard: '16px',
      shadowGlow: '0 10px 30px rgba(255, 153, 0, 0.15)',
      gradientHero: 'linear-gradient(to bottom, #232F3E, #131921)',
      glassOpacity: '0.8',
      glassBlur: '12px',
    }
  },
  {
    id: 'theme-swiggy-burst',
    name: 'Swiggy Burst',
    desc: 'High-energy commerce orange interface',
    fontFamily: 'var(--font-outfit)',
    colors: {
      primary: '#FC8019',
      primaryLight: '#FD994A',
      secondary: '#282C3F',
      accent: '#FC8019',
      bg: '#FFFFFF',
      bgAlt: '#F8F8F8',
      card: '#FFFFFF',
      textPrimary: '#282C3F',
      textSecondary: '#686B78',
    },
    visuals: {
      radiusBtn: '0px',
      radiusCard: '0px',
      shadowGlow: '0 8px 24px rgba(252, 128, 25, 0.1)',
      gradientHero: 'linear-gradient(to bottom, #F8F8F8, #FFFFFF)',
      glassOpacity: '1',
      glassBlur: '0px',
    }
  },
  {
    id: 'theme-zomato-passion',
    name: 'Zomato Passion',
    desc: 'Premium crimson high-clarity registry',
    fontFamily: 'var(--font-outfit)',
    colors: {
      primary: '#CB202D',
      primaryLight: '#E23744',
      secondary: '#1C1C1C',
      accent: '#CB202D',
      bg: '#FFFFFF',
      bgAlt: '#F8F8F8',
      card: '#FFFFFF',
      textPrimary: '#1C1C1C',
      textSecondary: '#4B5563',
    },
    visuals: {
      radiusBtn: '12px',
      radiusCard: '24px',
      shadowGlow: '0 4px 20px rgba(203, 32, 45, 0.15)',
      gradientHero: 'linear-gradient(to bottom, #F8F8F8, #FFFFFF)',
      glassOpacity: '0.95',
      glassBlur: '12px',
    }
  },
];
