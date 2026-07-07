import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        turmeric: '#D4882A',
        paddy: '#3B6D11',
        cream: '#FDF6EC',
        terracotta: '#993C1D',
        straw: '#E8D5B0',
        soil: '#2C2C2A',
        'paddy-light': '#EAF3DE',
        'turmeric-light': '#FAEEDA',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
