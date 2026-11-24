const color = (token) => `rgb(var(--pt-${token}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          canvas: color('canvas'),
          subtle: color('subtle'),
          surface: color('surface'),
          card: color('card'),
          elevated: color('raised'),
          hover: color('raised'),
          border: color('line'),
          'border-light': color('line-strong'),
        },
        'text-primary': color('text'),
        'text-secondary': color('secondary'),
        'text-muted': color('muted'),
        'cyan-primary': color('accent'),
        'cyan-muted': color('accent-hover'),
        epistemic: {
          verified: color('verified'),
          inference: color('inference'),
          unknown: color('muted'),
          critical: color('critical'),
        },
        'risk-low': color('verified'),
        'risk-medium': color('inference'),
        'risk-high': color('high'),
        'risk-critical': color('critical'),
        slate: {
          50: '#f5f7f4',
          100: color('text'),
          200: '#dce3e1',
          300: '#c6cfce',
          400: color('secondary'),
          500: color('muted'),
          600: '#778487',
          700: color('line-strong'),
          800: color('raised'),
          900: color('surface'),
          950: color('canvas'),
        },
        cyan: {
          200: '#ccefe9',
          300: '#a8e8df',
          400: color('accent'),
          500: '#56b6ac',
          600: '#3d9c94',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        xs: '3px',
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '8px',
        '2xl': '10px',
        '3xl': '12px',
      },
      boxShadow: {
        card: 'none',
        'card-hover': 'none',
      },
      zIndex: { sticky: '100', modal: '400', toast: '500' },
      transitionDuration: { fast: '140ms' },
    },
  },
};
