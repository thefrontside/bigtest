module.exports = {
  corePlugins: {
    preflight: false,
  },
  purge: {
    enabled: true,
    content: ["./src/**/*.ts", "./src/**/*.tsx"],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
