module.exports = {
  entry: './src/index.js',
  output: {
    library: 'Mock',
    libraryTarget: 'umd',
    filename: 'dist/mock-socket.js'
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  }
};
