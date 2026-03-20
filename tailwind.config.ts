import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-red-600',
    'bg-amber-500',
    'bg-green-600',
    'bg-gray-400',
    'text-white',
    'font-bold',
    'font-semibold',
  ],
  theme: {
    extend: {
      colors: {
        p1: '#dc2626',
        p2: '#f59e0b',
        p3: '#10b981',
      },
    },
  },
  plugins: [],
}
export default config
