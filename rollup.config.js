import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'src/index.js',
  sourceMap: 'inline',
  plugins: [buble(), resolve({ jsnext: true, main: true }), commonjs()],
  targets: [
    { dest: 'dist/mock-socket.cjs.js', format: 'cjs' },
    { dest: 'dist/mock-socket.js', format: 'umd', moduleName: 'Mock' },
    { dest: 'dist/mock-socket.amd.js', format: 'amd', moduleName: 'Mock' },
    { dest: 'dist/mock-socket.es.js', format: 'es' },
    { dest: 'dist/mock-socket.es.mjs', format: 'es' }
  ]
};
