import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        neon: '0 0 45px rgba(56, 189, 248, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
