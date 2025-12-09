/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Next.js 默认路径
    "./app/**/*.{js,ts,jsx,tsx}", // 如果你使用 app router
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // 其他位置
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
