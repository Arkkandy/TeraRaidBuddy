const {merge} = require('webpack-merge');
const common = require('./webpack.config.js')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  /*module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.dev.json', // Specify your dev-specific TS config file
            }
          }
        ],
        exclude: /node_modules/,
      }
    ]
  },*/
});