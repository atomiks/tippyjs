module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#1F2028',
          800: '#272935',
          700: '#424557',
          600: '#575969',

          100: '#BFC3D9',
          50: '#FFF',
        },
      },
      zIndex: {
        '-1': '-1',
      },
      backgroundImage: {
        'gradient-radial':
          'radial-gradient(circle at 50% 10%, var(--tw-gradient-stops))',
      },
      inset: {
        '-32': '-128px',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
