export = {
  parserOptions: { sourceType: 'module' },
  plugins: ['@bigtest'],
  rules: {
    '@bigtest/require-default-export': 'error'
  }
}