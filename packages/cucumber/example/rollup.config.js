'use strict';

const cucumber = require('../src/rollup/rollup-bigtest-cucumber-plugin');
const path = require('path');

export default {
  input: './index.js',

  plugins: [cucumber({ cwd: path.join(process.cwd(), 'features') })],
};
