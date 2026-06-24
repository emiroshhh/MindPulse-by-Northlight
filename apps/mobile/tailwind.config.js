/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#f7f8f4',
        surface: '#ffffff',
        ink: '#1f2d2a',
        muted: '#66736f',
        sage: '#56776f',
        sageSoft: '#dce9e3',
        mist: '#dce9f2',
        lavender: '#dddaf0',
        warm: '#eaa77e',
        danger: '#a44646',
      },
      borderRadius: { mp: 22 },
    },
  },
  plugins: [],
};
