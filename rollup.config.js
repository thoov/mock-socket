import buble from '@rollup/plugin-buble';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  plugins: [buble(), nodeResolve(), commonjs()],
  output: [
    { file: 'dist/mock-socket.cjs.js', format: 'cjs' },
    { file: 'dist/mock-socket.js', format: 'umd', name: 'Mock' },
    { file: 'dist/mock-socket.amd.js', format: 'amd', name: 'Mock' },
    { file: 'dist/mock-socket.es.js', format: 'es' },
    { file: 'dist/mock-socket.es.mjs', format: 'es' }
  ]
};
