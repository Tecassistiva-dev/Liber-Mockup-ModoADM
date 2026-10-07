module.exports = {
  // O tema escuro é controlado pelo app (themeMode), não pela preferência do sistema
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      // Escala de texto maior: o app roda em telas pequenas e de baixa resolução
      fontSize: {
        xs: ['0.875rem', { lineHeight: '1.3rem' }],
        sm: ['1rem', { lineHeight: '1.5rem' }],
        base: ['1.0625rem', { lineHeight: '1.6rem' }],
        lg: ['1.1875rem', { lineHeight: '1.75rem' }],
        xl: ['1.3125rem', { lineHeight: '1.85rem' }],
      },
      fontFamily: {
        // Texto corrido usa a fonte padrão do sistema (font-sans do Tailwind); Montserrat só nos títulos
        display: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#002554',
          deep: '#001a3d',
          soft: '#e8eef8',
        },
        accent: '#2dd4bf',
      },
    },
  },
  plugins: [],
}
