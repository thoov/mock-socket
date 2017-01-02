import buble from 'rollup-plugin-buble';

export default {
  entry: 'src/index.js',
  sourceMap: 'inline',
  plugins: [buble()],
  targets: [
    { dest: 'dist/mock-socket.cjs.js', format: 'cjs' },
    { dest: 'dist/mock-socket.js', format: 'umd', moduleName: 'Mock' },
    { dest: 'dist/mock-socket.amd.js', format: 'amd', moduleName: 'Mock' },
    { dest: 'dist/mock-socket.es.js', format: 'es' }
  ]
};
