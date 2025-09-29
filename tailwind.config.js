/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './{components,context,hooks,services}/**/*.{js,ts,jsx,tsx}',
    './*.{js,ts,jsx,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
};
