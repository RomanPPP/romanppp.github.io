const path = require('path');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devServer: {  // configuration for webpack-dev-server
    historyApiFallback: true,
    
    overlay: true,
    port: 8080, // port to run dev-server
    },
    devtool: 'cheap-source-map'
};