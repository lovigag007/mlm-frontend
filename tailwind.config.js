export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { 50:'#f0f4ff', 100:'#e0e9ff', 500:'#6366f1', 600:'#4f46e5', 700:'#4338ca', 900:'#1e1b4b' },
        surface: { DEFAULT:'#ffffff', secondary:'#f8fafc', border:'#e2e8f0' },
      },
    },
  },
  plugins: [],
};
