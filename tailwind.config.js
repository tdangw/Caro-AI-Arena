/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    // Quét tất cả các thư mục chứa component/code
    './{components,context,hooks,services}/**/*.{js,ts,jsx,tsx}',
    // Quét các file .tsx/.jsx nằm trực tiếp ở thư mục gốc
    './*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
