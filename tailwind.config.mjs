/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          // Primary brand colors
          'brand-blue': {
            50: '#e6f0ff',
            100: '#cce0ff',
            200: '#99c1ff',
            300: '#66a3ff',
            400: '#3384ff',
            500: '#0066ff', // Primary blue
            600: '#0052cc',
            700: '#003d99',
            800: '#002966',
            900: '#001433',
          },
          // Secondary color for CareGivers
          'brand-green': {
            50: '#e6f7e6',
            100: '#ccefcc',
            200: '#99df99',
            300: '#66cf66',
            400: '#33bf33',
            500: '#00af00', // Primary green
            600: '#008c00',
            700: '#006900',
            800: '#004600',
            900: '#002300',
          },
        },
        fontFamily: {
          sans: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            'Segoe UI',
            'Roboto',
            'Helvetica Neue',
            'Arial',
            'sans-serif',
          ],
        },
        spacing: {
          '112': '28rem',
          '128': '32rem',
        },
        boxShadow: {
          'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        },
        borderRadius: {
          'xl': '1rem',
          '2xl': '1.5rem',
          '3xl': '2rem',
        },
        animation: {
          'bounce-slow': 'bounce 2s infinite',
        },
      },
    },
    plugins: [],
  }