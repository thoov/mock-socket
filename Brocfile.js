const babel = require('broccoli-babel-transpiler');
const babelUMD = require('babel-plugin-transform-es2015-modules-umd');

const transpiledUMDTree = babel('src', {
  plugins: [
    babelUMD
  ]
});

module.exports = transpiledUMDTree;
